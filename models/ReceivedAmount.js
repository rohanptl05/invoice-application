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
            required: true
        },
        payment_received: {
            type: mongoose.Schema.Types.Decimal128, // Prevents floating-point precision issues
            required: true,
            min: [0, "Payment received must be a positive number"],
            set: (value) => {
                // ✅ Convert to float with 2 decimal places before saving
                return mongoose.Types.Decimal128.fromString(parseFloat(value).toFixed(2));
            },
            get: (value) => {
                // ✅ Convert back to float for proper JSON output
                return parseFloat(value.toString());
            }
        },
        payment_date: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
        strict: true, // Ensuring only schema-defined fields are stored
        toJSON: { getters: true }, // ✅ Ensure the getter function runs when converting to JSON
        toObject: { getters: true }
    }
);

// ✅ Exporting Model
const ReceivedAmount = mongoose.models.ReceivedAmount || mongoose.model("ReceivedAmount", ReceivedAmountSchema);

export { ReceivedAmount };
