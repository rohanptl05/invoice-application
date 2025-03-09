import { NextResponse } from "next/server";
import connectDB from "@/db/connectDb";
import Client from "@/models/Client";
import mongoose from "mongoose";

//  Get a Single Client (GET) - /api/clients/:id
export async function GET(req, context) {
    try {
        await connectDB(); // Ensure DB connection
        const { id } = await context.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: "Invalid client ID" }, { status: 400 });
        }

        const client = await Client.findById(id).populate("user", "name email");

        if (!client) {
            return NextResponse.json({ message: "Client not found" }, { status: 404 });
        }

        return NextResponse.json({ client }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error fetching client", error: error.message }, { status: 500 });
    }
}

//  Update a Client (PUT) - /api/clients/:id
export async function PUT(req, context) {
    try {
        await connectDB();
        const { id } = await context.params;
        const { name, phone, address } = await req.json();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: "Invalid client ID" }, { status: 400 });
        }

        const updatedClient = await Client.findByIdAndUpdate(
            id,
            { name, phone, address, updatedAt: new Date() },
            { new: true }
        );

        if (!updatedClient) {
            return NextResponse.json({ message: "Client not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Client updated successfully", client: updatedClient }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error updating client", error: error.message }, { status: 500 });
    }
}

//  Delete a Client (DELETE) - /api/clients/:id
export async function DELETE(req, context) {
    try {
        await connectDB();
        const { id } =await context.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: "Invalid client ID" }, { status: 400 });
        }

        const deletedClient = await Client.findByIdAndDelete(id);

        if (!deletedClient) {
            return NextResponse.json({ message: "Client not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Client deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error deleting client", error: error.message }, { status: 500 });
    }
}
