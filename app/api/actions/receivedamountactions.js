"use server";

import mongoose from "mongoose";
import connectDB from "@/db/connectDb";
import { ReceivedAmount } from "@/models/ReceivedAmount";
import { Invoice } from "@/models/Invoice";

export const saveReceivedAmount = async (action,data) => {
    await connectDB();

    try {
        // ✅ Check if invoice exists
        const invoice = await Invoice.findById(data.invoiceId).lean();
        if (!invoice) {
            return { error: "Invoice not found" };
        }
        if(action === "update"){

            const invoice = await ReceivedAmount.findById(data.invoiceId).lean();
            if(invoice){
            await ReceivedAmount.findOneAndUpdate(
                { _id: data.invoiceId },
                { $set: data },
                { new: true, runValidators: true }
            );
        }
        }else{

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
    


export const fetchReceivedAmount = async (id) => {
    try {
        await connectDB(); 
 
        const amounts = await ReceivedAmount.find({ invoice: id });
        if (!amounts || amounts.length === 0) {
            return { error: "No Received Amount found" }; // ✅ Proper error response
        }

        return amounts.map(amount => amount.toObject({ flattenObjectIds: true })); // ✅ Correct variable usage
    } catch (error) {
        console.error("Error fetching received amounts:", error);
        return { error: "Failed to fetch received amounts" }; // ✅ Catch unexpected errors
    }
};

export const editReceivedAmount = async (id, data) => {
    try {
      // Check if the amount record exists
      const amountExists = await ReceivedAmount.findById(id);
  
      if (!amountExists) {
        return { error: "Amount data does not exist" };
      }
  
      // Update the record and return the new data
      const updatedAmount = await ReceivedAmount.findByIdAndUpdate(
        id,
        { $set: { 
            payment_received: data.payment_received,
            payment_date: data.payment_date
        } },
        
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