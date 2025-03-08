import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
import Client from "@/models/Client";

const { Schema } = mongoose;
const AutoIncrement = AutoIncrementFactory(mongoose);

// ✅ Define ItemSchema correctly
const ItemSchema = new Schema({
    item_name: { type: String, required: true },
    item_price: { type: Number, required: true },
    item_quantity: { type: Number, required: true },
    truck_no: { type: String, default: "N/A" },
    item_weight: { type: Number, default: 0 }, // Changed "N/A" to 0 (since it's a Number)
    total: { type: Number, required: true }
}); // ✅ Prevents MongoDB from auto-generating _id for items

const invoiceSchema = new Schema({
    invoiceNumber: { type: Number, unique: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    status: { type: String, default: "PENDING" },
    createdAt: { type: Date, default: Date.now },
    items: { type: [ItemSchema], required: true }, // ✅ Ensure items is an ARRAY
    grandTotal: { type: Number, required: true },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

invoiceSchema.plugin(AutoIncrement, { inc_field: "invoiceNumber" });

const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
export default Invoice;
