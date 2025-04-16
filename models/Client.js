import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 32,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      maxLength: 10,
    },
    address: {
      type: String,
      required: true,
    },
    clientStatus: {
      type: String,
      enum: ["active", "deactivated"],
      default: "active",
    },
    deactivatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);


ClientSchema.index({ deactivatedAt: 1 }, { expireAfterSeconds: 7776000 });

const Client = mongoose.models.Client || mongoose.model("Client", ClientSchema);

export default Client;
