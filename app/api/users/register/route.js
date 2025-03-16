import { NextResponse } from "next/server";
import connectDB from "@/db/connectDb";
import User from "@/models/User";
import { useSession, signIn, signOut } from "next-auth/react"

export async function POST(req) {
   const { data: session } = useSession();
  try {
    await connectDB();

    const { name, email, image, address, phone, company, password } = await req.json();

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      image: image || "",
      address: address || "N/A",
      phone: phone || "N/A",
      company: company || "N/A",
      password, // In a real app, hash this password before saving
    });

    await newUser.save();

    return NextResponse.json({ message: "User created successfully", user: newUser }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ message: "Error creating user", error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const email =  await session.user.email
    await connectDB();
    const users = await User.findOne({email});
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching users", error: error.message }, { status: 500 });
  }
}
