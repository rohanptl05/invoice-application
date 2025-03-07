import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const { Schema } = mongoose;

// Initialize Auto-Increment Plugin
const AutoIncrement = AutoIncrementFactory(mongoose);

const ProductSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    total: { type: Number, required: true },
});

const invoiceSchema = new Schema({
    invoiceNumber: {
        type: Number, // Auto-incremented
        unique: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        required: true
    },
    status: {
        type: String,
        default: "PENDING"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    products: [ProductSchema],
    grandTotal: { type: Number, required: true },
    date: { type: Date, default: Date.now },
}, { timestamps: true });

// Apply Auto-Increment Plugin
invoiceSchema.plugin(AutoIncrement, { inc_field: "invoiceNumber" });

const Invoice= mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);

export default Invoice;