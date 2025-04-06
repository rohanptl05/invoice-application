import mongoose from "mongoose";

const { Schema } = mongoose;

const ExtraExpenseSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: [0, "Payment received must be a positive number"],
      set: (value) => {
        return mongoose.Types.Decimal128.fromString(parseFloat(value).toFixed(2));
      },
      get: (value) => {
        return parseFloat(value.toString());
      }
    },
    date: {
      type: Date,
      default: Date.now
    },
    expensetype: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ""
    }
  },  
  
  {
    timestamps: true,
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true }
  }
 
);

// ✅ Exporting Model
const ExtraExpense = mongoose.models.ExtraExpense || mongoose.model("ExtraExpense", ExtraExpenseSchema);
export default ExtraExpense;
