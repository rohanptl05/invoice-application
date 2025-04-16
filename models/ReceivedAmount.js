import mongoose from "mongoose";

const { Schema } = mongoose;

// ✅ Define ReceivedAmount Schema with Precision Handling
const ReceivedAmountSchema = new Schema(
    {
        invoice: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Invoice",
            required: true,
            index: true // Indexing for faster lookups
        },
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Client",
            required: true,
            index: true
        },

        payment_received: {
            type: Number,
            required: true,
            min: 0
        },
        payment_date: {
            type: Date,
            default: Date.now
        },
        recordStatus: {
            type: String,
            enum: ["active", "deactivated"],
            default: "active",
        },
        deactivatedAt: { type: Date, default: null },
    },
    {
        timestamps: true,
        toJSON: { getters: true },
        toObject: { getters: true }
    },

);
// ReceivedAmountSchema.index({ deactivatedAt: 1 }, { expireAfterSeconds: 7776000 }); // Auto-delete after 90 days
ReceivedAmountSchema.index({ deactivatedAt: 1 }, { expireAfterSeconds: 7776000 });


const ReceivedAmount = mongoose.models.ReceivedAmount || mongoose.model("ReceivedAmount", ReceivedAmountSchema);

export default ReceivedAmount;
