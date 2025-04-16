"use server"

import connectDB from "@/db/connectDb"
import  {ExtraExpense}  from "@/models/Extraexpenses";
import mongoose from "mongoose";
import { NextResponse } from "next/server";


export const ADDExpense = async (data) => {
    try {
      await connectDB();
    //   console.log("Payload received:", data);
  
      if (!data.user || !mongoose.Types.ObjectId.isValid(data.user)) {
        console.error("Invalid user ID");
        return null;
      }
      const isValidDate = (d) => !isNaN(new Date(d).getTime());
      const newExpense = new ExtraExpense({
        user: data.user,
        amount: data.amount,
        expensetype: data.type,
        description: data.description || "",
        date: isValidDate(data.date) ? new Date(data.date) : new Date(),
      });
  
      await newExpense.save();
  
      return { success: "Payment history saved successfully" };
    } catch (error) {
      console.error("Error adding expense:", error);
      return null;
    }
  };

  export const GETExpense = async (userId,status) => {
    try {
      await connectDB();
      // console.log("Fetching expenses for user:", userId);
      const expenses = await ExtraExpense.find({ user: userId,recordStatus:status }).sort({ date: -1 });
      
      return expenses.map(expenses => expenses.toObject({ flattenObjectIds: true }));
    } catch (error) {
      console.error("Error fetching expenses:", error);
      return null;
    }
  }
  


  export const DeleteExinvoices = async (id) => {
      try {
        await connectDB(); // ✅ Ensure DB connection before proceeding
    
        // ✅ Find and delete invoice
        const Exinvoice = await ExtraExpense.findById(id);
        if (!Exinvoice) {
          return { error: "ExInvoice not found" };
        }
        try {
          await ExtraExpense.findOneAndUpdate(
            { _id: id },  // Find by the correct ID
            { $set: {
                recordStatus: "deactivated" ,// Update the fields
                deactivatedAt: new Date() // Set the deactivated date to now
    
            } }, // Update the fields
            { new: true }  // Return the updated document
        );
          
        } catch (error) {
          console.error("Error deleting invoice:", error);
          return { error: "Failed to delete invoice" };
          
        }
   
    
        return { success: true, message: "ExInvoice deleted successfully" };
      } catch (error) {
        console.error("Error deleting invoice:", error);
        return { error: "Failed to delete invoice" };
      }
    };







    export const EditExpense = async (id ,data) => {
        await connectDB();
      
        let invoiceExists = await ExtraExpense.findOne({ _id: id });
    
        if (!invoiceExists) {
            return { error: "Invoice does not exist" };
        }
    
        try {
            // ✅ Ensure status is updated correctly
    
            await ExtraExpense.findOneAndUpdate(
                { _id: id },
                { $set: data },
                { new: true, runValidators: true }
            );
    
            // ✅ Delete old payment history if grandTotal changes
          
    
            return { success: true, message: "ExInvoice updated successfully" };
        } catch (error) {
            console.error("Error updating invoice:", error);
            return { error: "Failed to update invoice" };
        }
    };
    
    