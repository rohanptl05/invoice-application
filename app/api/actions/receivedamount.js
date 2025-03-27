"use server";

import mongoose from "mongoose";
import connectDB from "@/db/connectDb";
import { ReceivedAmount } from "@/models/ReceivedAmount";
import { Invoice } from "@/models/Invoice";

export const saveReceivedAmount = async (data) => {
    await connectDB();

    try {
        // ✅ Check if invoice exists
        const invoice = await Invoice.findById(data.invoiceId).lean();
        if (!invoice) {
            return { error: "Invoice not found" };
        }

        // ✅ Create and save the received amount entry
        const newReceivedAmount = new ReceivedAmount({
            invoice: new mongoose.Types.ObjectId(data.invoiceId),
            client: new mongoose.Types.ObjectId(data.client), // Ensure client ID is used
            payment_received: mongoose.Types.Decimal128.fromString(data.payment_received.toString()), // Convert to Decimal128
            payment_date: new Date() // Store the current date
        });

        await newReceivedAmount.save(); // ✅ Corrected variable name
        return { success: "Payment history saved successfully" };

    } catch (error) {
        console.error("Error saving payment history:", error);
        return { error: "Failed to save payment history" };
    }
};
