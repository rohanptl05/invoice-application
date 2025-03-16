import { NextResponse } from "next/server";
import connectDB from "@/db/connectDb";
import Invoice from "@/models/Invoice";


// single invoice api
export async function GET(req) {
    await connectDB();
  
    const url = new URL(req.url);
    const clientId = url.searchParams.get("clientId");
  
    if (!clientId) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }
  
    try {
      const invoices = await Invoice.find({ client: clientId });
      return NextResponse.json({ invoices }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
    }
  }