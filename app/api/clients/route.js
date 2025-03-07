import { NextResponse } from "next/server";
import connectDB from "@/db/connectDb";
import Client from "@/models/Client";
import mongoose from "mongoose";

// Create a New Client (POST) - /api/clients
export async function POST(req) {
    try {
        await connectDB();
        const { user, name, email, phone, address } = await req.json();

        // Validate required fields
        if (!user || !name || !email || !phone || !address) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        // Check if email already exists
        const existingClient = await Client.findOne({ email });
        if (existingClient) {
            return NextResponse.json({ message: "Client with this email already exists" }, { status: 409 });
        }

        // Create a new client
        const newClient = new Client({
            user:new mongoose.Types.ObjectId(user),
            name,
            email,
            phone,
            address
        });

        await newClient.save();

        return NextResponse.json({ message: "Client created successfully", client: newClient }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Error creating client", error: error.message }, { status: 500 });
    }
}
