import mongoose from "mongoose";

const { Schema } = mongoose;


const ItemSchema = new Schema({
    item_name: { type: String, required: true },
    item_price: { type: Number, required: true, min: 0 },
    item_quantity: { type: Number, required: true, min: 1 },
    truck_no: { type: String, default: "N/A" },
    item_weight: { type: Number, default: 0 },
    total: { type: Number, required: true },
}, { _id: false });



const invoiceSchema = new Schema({
    invoiceNumber: { type: Number, unique: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    status: {
        type: String,
        default: "PENDING",
        enum: ["PENDING", "PAID", "CANCELLED"],
    },
    items: [ItemSchema],
    grandTotal: { type: Number, required: true, min: 0 },
    received_amount: { type: Number, required: true, min: 0 },
    balance_due_amount: { type: Number, required: true, min: 0, default: 0 },
    imageURL: { type: String, default: "" },
    date: { type: Date, default: Date.now },

   
    recordStatus: {
        type: String,
        enum: ["active", "deactivated"],
        default: "active",
    },
    deactivatedAt: { type: Date, default: null },
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});


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

        this.invoiceStatus = (this.grandTotal - this.received_amount) === 0 ? "PAID" : "PENDING";

        next();
    } catch (error) {
        console.error("Error in invoice pre-save middleware:", error);
        return next(error);
    }
});



invoiceSchema.index({ deactivatedAt: 1 }, { expireAfterSeconds: 7776000 });



const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);

export default Invoice;