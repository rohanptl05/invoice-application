import { NextResponse } from "next/server";
import connectDB from "@/db/connectDb";
import Invoice from "@/models/Invoice";


// single invoice api
export async function GET(req, { params }) {
    try {
        await connectDB();
        const invoice = await Invoice.findById(params.id).populate("client");
        if (!invoice) return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
        return NextResponse.json(invoice, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}



export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const invoice = await Invoice.findByIdAndDelete(params.id);
        if (!invoice) return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
        return NextResponse.json({ message: "Invoice deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}



export async function PUT(req, { params }) {
    try {
        await connectDB();

        const { id } = params;
        if (!id) {
            return NextResponse.json({ message: "Invoice ID is required" }, { status: 400 });
        }

        let body = await req.json();
        
        // ✅ Ensure 'items' is an array before updating
        if (body.items !== undefined && !Array.isArray(body.items)) {
            return NextResponse.json({ message: "'items' must be an array" }, { status: 400 });
        }

        console.log("Received Body:", body);
        console.log("Updating Invoice ID:", id);

        const updatedInvoice = await Invoice.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!updatedInvoice) {
            return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
        }

        return NextResponse.json(updatedInvoice, { status: 200 });

    } catch (error) {
        console.error("Update Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
