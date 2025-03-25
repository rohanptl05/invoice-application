import mongoose from "mongoose";

const { Schema } = mongoose;

// ✅ Define Item Schema
const ItemSchema = new Schema(
    {
        item_name: { type: String, required: true },
        item_price: { type: Number, required: true, min: 0 },
        item_quantity: { type: Number, required: true, min: 1 },
        truck_no: { type: String, default: "N/A" },
        item_weight: { type: Number, default: 0 },
        total: { type: Number, required: true }, // ✅ Ensure this is item_price * item_quantity
    },
    { _id: false }
);

// ✅ Define Payment History Schema
const PaymentHistorySchema = new Schema(
    {
        invoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", required: true },
        client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
        previous_due_amount: { type: Number, required: true },
        updated_due_amount: { type: Number, required: true },
        previous_grandTotal:{type:Number},
        updated_grandTotal:{type:Number},
        payment_received: { type: Number, required: true, min: 0 },
        payment_date: { type: Date, default: Date.now },

    },
    { timestamps: true }
);

// ✅ Define Invoice Schema
const invoiceSchema = new Schema(
    {
        invoiceNumber: { type: Number, unique: true },
        client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        status: { type: String, default: "PENDING" },
        items: [ItemSchema],
        grandTotal: { type: Number, required: true, min: 0 },
        received_amount: { type: Number, required: true, min: 0 }, // ✅ Stored as Float
        balance_due_amount: { type: Number, required: true, min: 0, default: 0 }, // ✅ Stored as Float
        date: { type: Date, default: Date.now },
    },
    { timestamps: true }
);




invoiceSchema.pre("save", async function (next) {
    try {
        if (!this.invoiceNumber) {
            const lastInvoice = await this.constructor.findOne().sort({ invoiceNumber: -1 }).lean();
            this.invoiceNumber = lastInvoice?.invoiceNumber ? lastInvoice.invoiceNumber + 1 : 1;
        }

        const computedTotal = this.items.reduce((sum, item) => sum + item.total, 0);
        if (this.grandTotal !== computedTotal) {
            return next(new Error("Grand total does not match sum of item totals."));
        }

        this.grandTotal = parseFloat(this.grandTotal.toFixed(2));
        this.received_amount = parseFloat(this.received_amount.toFixed(2));

        let previousInvoice = null;
        let previous_due_amount = 0;
        let previous_received_amount = 0;
        let previous_grandTotal = 0;

        if (!this.isNew) {
            previousInvoice = await this.constructor.findById(this._id).lean();
            if (previousInvoice) {
                previous_due_amount = previousInvoice.balance_due_amount;
                previous_received_amount = previousInvoice.received_amount;
                previous_grandTotal = previousInvoice.grandTotal;
            }
        }

        // ✅ Update balance due
        this.balance_due_amount = parseFloat((this.grandTotal - this.received_amount).toFixed(2));
        this.balance_due_amount = Math.max(this.balance_due_amount, 0);

        // ✅ Set status dynamically
        this.status = this.balance_due_amount === 0 ? "PAID" : "PENDING";

        // ✅ Log payment history when invoice is edited
        if (!this.isNew && (this.received_amount !== previous_received_amount || this.grandTotal !== previous_grandTotal)) {
            const new_payment = this.received_amount - previous_received_amount;

            await PaymentHistory.create({
                invoice: this._id,
                client: this.client,
                previous_due_amount,
                updated_due_amount: this.balance_due_amount,
                previous_grandTotal,
                updated_grandTotal: this.grandTotal,
                payment_received: new_payment > 0 ? new_payment : 0, // ✅ Only store positive payments
                payment_date: new Date(),
            });
        }

        next();
    } catch (error) {
        console.error("Error in invoice pre-save middleware:", error);
        return next(error);
    }
});




// ✅ Create Models
const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
const PaymentHistory = mongoose.models.PaymentHistory || mongoose.model("PaymentHistory", PaymentHistorySchema);

export { Invoice, PaymentHistory };
