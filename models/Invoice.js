import mongoose from "mongoose";

const { Schema } = mongoose;

// ✅ Define Item Schema
const ItemSchema = new Schema({
    item_name: { type: String, required: true },
    item_price: { type: Number, required: true, min: 0 },
    item_quantity: { type: Number, required: true, min: 1 },
    truck_no: { type: String, default: "N/A" },
    item_weight: { type: Number, default: 0 },
    total: { type: Number, required: true },
}, { _id: false });

// ✅ Define Payment History Schema
const PaymentHistorySchema = new Schema({
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    grandTotal:{type: Number, required: true},
    previous_due_amount: { type: Number, required: true },
    payment_received: { type: Number, required: true, min: 0 },
    updated_due_amount: { type: Number, required: true },
    payment_date: { type: Date, default: Date.now },



}, { timestamps: true });

// ✅ Define Invoice Schema
const invoiceSchema = new Schema({
    invoiceNumber: { type: Number, unique: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    status: { type: String, default: "PENDING", enum: ["PENDING", "PAID", "CANCELLED"] },
    items: [ItemSchema],
    grandTotal: { type: Number, required: true, min: 0 },
    received_amount: { type: Number, required: true, min: 0 }, // ✅ Stored as Float
    balance_due_amount: { type: Number, required: true, min: 0, default: 0 }, // ✅ Stored as Float
    date: { type: Date, default: Date.now },
}, { timestamps: true });

// ✅ Pre-save Middleware for Invoice Creation
invoiceSchema.pre("save", async function (next) {
    try {
        if (!this.invoiceNumber) {
            const lastInvoice = await this.constructor.findOne().sort({ invoiceNumber: -1 }).lean();
            this.invoiceNumber = lastInvoice && lastInvoice.invoiceNumber
                ? lastInvoice.invoiceNumber + 1
                : 1;
        }

        // Calculate grand total from items
        const computedTotal = this.items.reduce((sum, item) => sum + item.total, 0);
        if (this.grandTotal !== computedTotal) {
            return next(new Error("Grand total does not match sum of item totals."));
        }

        // this.grandTotal = parseFloat(this.grandTotal.toFixed(2));

        // // Capture previous received amount and balance
        // const existingInvoice = await this.constructor.findById(this._id);
        // const previous_received_amount = existingInvoice ? existingInvoice.received_amount : 0;
        // const previous_due_amount = existingInvoice ? existingInvoice.balance_due_amount : this.grandTotal;

        // // Ensure received_amount is a valid float
        // this.received_amount = parseFloat(this.received_amount.toFixed(2));
        // this.status = this.balance_due_amount === 0 ? "PAID" : "PENDING";

        // // Calculate new balance due
        // this.balance_due_amount = parseFloat((this.grandTotal - this.received_amount).toFixed(2));
        // this.balance_due_amount = Math.max(this.balance_due_amount, 0);

        // next(); // ✅ Proceed to save the invoice first

        // // Log PaymentHistory **after** invoice is successfully saved
        // if (this.isModified("received_amount") || this.isNew) {
        //     const payment_received = this.received_amount - previous_received_amount;

        //     if (payment_received > 0 || this.received_amount || this.grandTotal) {
        //         await PaymentHistory.create({
        //             invoice: this._id,
        //             client: this.client,
        //             grandTotal: this.grandTotal,
        //             previous_due_amount,
        //             updated_due_amount: this.balance_due_amount,
        //             payment_received,
        //         }).catch(err => console.error("PaymentHistory save error:", err));
        //     }
        // }

    } catch (error) {
        console.error("Error in invoice pre-save middleware:", error);
        return next(error);
    }
});


invoiceSchema.pre("findOneAndUpdate", async function (next) {
    try {
        const update = this.getUpdate();
        if (!update.received_amount) return next(); // ✅ Skip if `received_amount` is not updated

        // Get the existing invoice data
        const invoice = await this.model.findOne(this.getQuery()); 
        if (!invoice) return next(new Error("Invoice not found."));

        const previous_received_amount = invoice.received_amount;
        const previous_due_amount = invoice.balance_due_amount;
        const new_received_amount = parseFloat(update.received_amount.toFixed(2));

        // Calculate new balance due
        const new_balance_due = parseFloat((invoice.grandTotal - new_received_amount).toFixed(2));
        update.balance_due_amount = Math.max(new_balance_due, 0);
       
        update.status = update.balance_due_amount === 0 ? "PAID" : "PENDING";

        // Only create or update PaymentHistory entry if payment is updated
        const payment_received = new_received_amount - previous_received_amount;
        if (payment_received > 0 || new_received_amount || invoice.grandTotal) {
            await PaymentHistory.findOneAndUpdate(
                { invoice: invoice._id }, // Find the existing payment history for this invoice
                {
                    $set: {
                        grandTotal: invoice.grandTotal,
                        previous_due_amount,
                        updated_due_amount: update.balance_due_amount,
                    },
                    $inc: { payment_received }, // Increment received amount
                },
                { upsert: true, new: true } // Create new entry if not exists
            ).catch(err => console.error("PaymentHistory update error:", err));
        }

        next();
    } catch (error) {
        console.error("Error in invoice update middleware:", error);
        return next(error);
    }
});





// ✅ Create Models
const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
const PaymentHistory = mongoose.models.PaymentHistory || mongoose.model("PaymentHistory", PaymentHistorySchema);

export { Invoice, PaymentHistory };