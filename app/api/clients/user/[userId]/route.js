import { NextResponse } from "next/server";
import connectDB from "@/db/connectDb";
import Client from "@/models/Client";
import mongoose from "mongoose";
import User from "@/models/User";

// Get Clients by User ID (GET) - /api/clients/user/:userId
export async function GET(req, context) {
    const { params } = context;
    try {
        await connectDB(); // Ensure DB connection
        const { userId } = await params;
        console.log(userId)

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
        }

        const clients = await Client.find({ user: userId });

        if (clients.length === 0) {
            return NextResponse.json({ message: "No clients found for this user" }, { status: 404 });
        }

        return NextResponse.json({ clients }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error fetching clients", error: error.message }, { status: 500 });
    }
}
