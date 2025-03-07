import { NextResponse } from "next/server";
import connectDB from "@/db/connectDb";
import User from "@/models/User";
import mongoose from "mongoose";

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = params; // Extract user ID from URL params
    const { name, image, address, phone, company, password } = await req.json();

    // Validate _id format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name,
        image,
        address,
        phone,
        company,
        password, // Consider hashing before saving
        updatedAt: new Date(),
      },
      { new: true } // Return updated user
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User updated successfully", user: updatedUser }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "Error updating user", error: error.message }, { status: 500 });
  }
}
