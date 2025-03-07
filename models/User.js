import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Email should be unique
  },
  image: {
    type: String,
    default: "N/A", // Provide a default value
  },
  address: {
    type: String,
    default: "N/A", // Provide a default value
  },
  phone: {
    type: String,
    default: "N/A",
  },
  company: {
    type: String,
    default: "N/A",
  },
  password: {
    type: String,
    default: "N/A", // GitHub auth doesn't provide passwords
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date,
  },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
