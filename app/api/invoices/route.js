import { NextResponse } from "next/server";
import connectDB from "@/db/connectDb";
import Invoice from "@/models/Invoice";

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const invoice = new Invoice(body);
        await invoice.save();
        return NextResponse.json(invoice, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        await connectDB();
        
        const { searchParams } = new URL(req.url);
        const clientId = searchParams.get("client");

        let query = {};
        if (clientId) {
            query.client = clientId;
        }

        const invoices = await Invoice.find(query).populate("client");
        return NextResponse.json(invoices, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}