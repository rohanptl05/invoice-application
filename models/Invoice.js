import mongoose from "mongoose";

const { Schema } = mongoose;

// ✅ Define ItemSchema properly
const ItemSchema = new Schema({
    item_name: { type: String, required: true },
    item_price: { type: Number, required: true },
    item_quantity: { type: Number, required: true },
    truck_no: { type: String, default: "N/A" },
    item_weight: { type: Number, default: 0 }, // Default value should be 0, not "N/A"
    total: { type: Number, required: true },
}, { _id: false }); // ✅ Prevents MongoDB from auto-generating _id for each item

const invoiceSchema = new Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    status: { type: String, default: "PENDING" },
    items: [ItemSchema], // ✅ Ensure items is an array
    grandTotal: { type: Number, required: true },
    date: { type: Date, default: Date.now },
}, { timestamps: true });

const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
export default Invoice;
