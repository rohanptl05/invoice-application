import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
    default: "N/A",
  },
  address: {
    type: String,
    default: "N/A",
  },
  phone: {
    type: String,
    default: "N/A",
  },
  company: {
    type: String,
    default: "N/A",
  },
  companyaddress: {
    type: String,
    default: "N/A",
  },
  companyphone: {
    type: String,
    default: "N/A",
  },
  companylogo: {
    type: String,
    default: "N/A",
  },
  password: {
    type: String,
    default: "N/A",
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  accountStatus: {
    type: String,
    enum: ["active", "deactivated"],
    default: "active",
  },
  deactivatedAt:
  {
    type: Date, default: null
  }

}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});


UserSchema.index({ deactivatedAt: 1 }, { expireAfterSeconds: 7776000 });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
