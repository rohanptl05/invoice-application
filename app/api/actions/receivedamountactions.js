"use server";

import mongoose from "mongoose";
import connectDB from "@/db/connectDb";
import {ReceivedAmount} from "@/models/ReceivedAmount"
import {Invoice} from "@/models/Invoice";
import {Client} from "@/models/Client";
import { NextResponse } from "next/server";

export const saveReceivedAmount = async (action, data) => {
    await connectDB();

    try {

        const invoice = await Invoice.findById(data.invoiceId).lean();
        if (!invoice) {
            return { error: "Invoice not found" };
        }
        if (action === "update") {
            const receivedRecord = await ReceivedAmount.findOne({ invoice: data.invoiceId }).lean();
            if (invoice) {
                await ReceivedAmount.findOneAndUpdate(
                    { _id: data.invoiceId },
                    { $set: data },
                    { new: true, runValidators: true }
                );
            }
        } else {

            // ✅ Create and save the received amount entry
            const newReceivedAmount = new ReceivedAmount({
                invoice: new mongoose.Types.ObjectId(data.invoiceId),
                client: new mongoose.Types.ObjectId(data.client), // Ensure client ID is used
                payment_received: mongoose.Types.Decimal128.fromString(data.payment_received.toString()), // Convert to Decimal128
                payment_date: new Date() // Store the current date
            });


            await newReceivedAmount.save(); // ✅ Corrected variable name
            return { success: "Payment history saved successfully" };
        }
    } catch (error) {
        console.error("Error saving payment history:", error);
        return { error: "Failed to save payment history" };
    }
};




export const fetchReceivedAmount = async (id, status) => {
    try {
        await connectDB();
        const amounts = await ReceivedAmount.find({ invoice: id, recordStatus: status })
        if (!amounts || amounts.length === 0) {
            return [];
        }
        return amounts.map(amount => amount.toObject({ flattenObjectIds: true })); // ✅ Correct variable usage
    } catch (error) {
        console.error("Error fetching received amounts:", error);
        return { error: "Failed to fetch received amounts" };
    }
};

export const editReceivedAmount = async (id, data) => {
    try {

        const amountExists = await ReceivedAmount.findById(id);

        if (!amountExists) {
            return { error: "Amount data does not exist" };
        }

        const updatedAmount = await ReceivedAmount.findByIdAndUpdate(
            id,
            {
                $set: {
                    payment_received: data.payment_received,
                    payment_date: data.payment_date
                }
            },

            { new: true, runValidators: true }
        );

        return {
            success: true,
            message: "Amount updated successfully",

        };
    } catch (error) {
        console.error("Error editing received amount:", error);
        return { error: "Failed to edit received amount" }; // ✅ Catch unexpected errors
    }
};



export const deleteReceivedAmount = async (id) => {
    try {
        await connectDB(); // ✅ Ensure DB connection before proceeding

        // ✅ Find and delete invoice
        const amount = await ReceivedAmount.findById(id);
        if (!amount) {
            return { error: "Received Amount not found" };
        }


        try {
            await ReceivedAmount.findByIdAndUpdate(
                { _id: id },
                {
                    $set: {
                        recordStatus: "deactivated",
                        deactivatedAt: new Date()
                    }
                },
            )

        } catch (error) {
            console.error("Error Deleting amount:", error);
            return { error: "Failed to Deleting amount" }; // 
        }


        return { success: true, message: "Received Amount deleted successfully" };
    } catch (error) {
        console.error("Error deleting received amount:", error);
        return { error: "Failed to delete received amount" };
    }
}


export const RestoreReceivedAmount = async (id) => {
    try {
        // console.log('Restoring ID:', id);

        const amount = await ReceivedAmount.findById(id);
        if (!amount) {
            return { success: false, error: "Amount not found" };
        }

        const plainAmount = amount.toObject();
        const invoiceId = plainAmount.invoice.toString();
        const clientId = plainAmount.client.toString();

        // Step 1: Restore ReceivedAmount
        await ReceivedAmount.findByIdAndUpdate(id, {
            $set: {
                recordStatus: "active",
                deactivatedAt: null
            }
        });

        // Step 2: Restore Invoice only if inactive
        const invoice = await Invoice.findById(invoiceId);
        if (invoice && (invoice.recordStatus !== "active" || invoice.deactivatedAt !== null)) {
            await Invoice.findByIdAndUpdate(invoiceId, {
                $set: {
                    recordStatus: "active",
                    deactivatedAt: null
                }
            });
        }

        // Step 3: Restore Client only if inactive
        const client = await Client.findById(clientId);
        if (client && (client.clientStatus !== "active" || client.deactivatedAt !== null)) {
            await Client.findByIdAndUpdate(clientId, {
                $set: {
                    clientStatus: "active",
                    deactivatedAt: null
                }
            });
        }

        // Step 4: Calculate total received for this invoice
        const receivedAmounts = await ReceivedAmount.find({
            invoice: invoiceId,
            recordStatus: "active"
        });

        const totalReceived = receivedAmounts.reduce((sum, rcv) => {
            const amount = parseFloat(rcv.payment_received);
            return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

        // Step 5: Update invoice with remaining amount
        if (invoice) {
            const grandTotal = parseFloat(invoice.grandTotal);
            const remainingAmount = grandTotal - totalReceived;

            await Invoice.findByIdAndUpdate(invoiceId, {
                $set: {
                    received_amount: totalReceived.toFixed(2),
                    balance_due_amount: remainingAmount.toFixed(2)
                }
            });
        }

        return { success: true, message: "Restoration and invoice update completed successfully" };

    } catch (error) {
        console.error("Restore Error:", error);
        return { success: false, error: "Something went wrong while restoring" };
    }
};


