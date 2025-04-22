import mongoose from "mongoose";

const connectionStr = process.env.DB_URI;

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log("✅ MongoDB already connected.");
      return;
    }

   const connection = mongoose.connect(connectionStr);

    console.log("🚀 MongoDB Connected Successfully");
    return connection;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    throw new Error("Database connection failed");
  }
};

export default connectDB;
