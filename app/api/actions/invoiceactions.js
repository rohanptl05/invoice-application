"use server"

import connectDB from "@/db/connectDb"
import Client from "@/models/Client";
import {Invoice} from "@/models/Invoice";
import mongoose from "mongoose";

export const fetchInvoice = async (id) => {
    await connectDB();

   
    let invoices = await Invoice.find({ client: id }).populate("client");

    if (!invoices || invoices.length === 0) {
        return { error: "No invoices found" };
    }

    return invoices.map(invoice => invoice.toObject({ flattenObjectIds: true }));
};
      
//delete invoice

export const deleteInvoice = async (id) =>{

await connectDB();
try{
let invoice =await Invoice.findByIdAndDelete(id);
  
if (!invoice) {
  return { error: "invoice not found" };
}

return { success: true, message: "invoice deleted successfully" }
} catch (error) {
console.error("Error deleting invoice:", error);
return { error: "Failed to delete invoice" };
}

}


//edit invoice

// updateInvoice

// export const editInvoice = async (id,data) => {
//     await connectDB();

//     // Ensure the client exists before updating
//     let invoiceExists = await Invoice.findOne({ _id: id });

//     if (!invoiceExists) {
//         return { error: "Invoice  does not exist" };
//     }

//     try {
//         await Invoice.findOneAndUpdate(
//             { _id: id },  // Find by the correct ID
//             { $set: data }, // Update the fields
//             { new: true }  // Return the updated document
//         );

//         return { success: "Invoice updated successfully" };
//     } catch (error) {
//         console.error("Error updating invoice:", error);
//         return { error: "Failed to update invoice" };
//     }
// };

export const editInvoice = async (id, data) => {
    await connectDB();

    // Check if invoice exists
    let invoiceExists = await Invoice.findOne({ _id: id });

    if (!invoiceExists) {
        return { error: "Invoice does not exist" };
    }

    try {
        await Invoice.findOneAndUpdate(
            { _id: id },
            { $set: data },
            { new: true, runValidators: true }  // ✅ Added runValidators
        );

        return { success: "Invoice updated successfully" };
    } catch (error) {
        console.error("Error updating invoice:", error);
        return { error: "Failed to update invoice" };
    }
};





// API Function
export const ADDinvoice = async (data) => {
    try {
        await connectDB();

        if (!data.client || !mongoose.Types.ObjectId.isValid(data.client)) {
            return null;
        }
        if (!data.items.length || data.grandTotal <= 0) {
            return null;
        }

        // Ensure received_amount is a valid number
        const receivedAmount = parseFloat(data.received_amount) || 0;
        const balanceDue = parseFloat((data.grandTotal - receivedAmount).toFixed(2));

        const newInvoice = await Invoice.create({
            client: new mongoose.Types.ObjectId(data.client),
            user : new mongoose.Types.ObjectId(data.user),
            items: data.items,
            grandTotal: data.grandTotal,
            received_amount: receivedAmount,
            balance_due_amount: Math.max(balanceDue, 0), // Prevent negative balance
        });

        // ✅ Convert the Mongoose document to a plain JSON object
        return JSON.parse(JSON.stringify(newInvoice));
    } catch (error) {
        console.error("Error adding invoice:", error);
        return null;
    }
};
