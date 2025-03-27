"use server"

import connectDB from "@/db/connectDb"
import Client from "@/models/Client";
import {Invoice,PaymentHistory} from "@/models/Invoice";
import mongoose from "mongoose";
import { ReceivedAmount } from "@/models/ReceivedAmount";

export const fetchInvoice = async (id) => {
    await connectDB();

   
    let invoices = await Invoice.find({ client: id }).populate("client");

    if (!invoices || invoices.length === 0) {
        return { error: "No invoices found" };
    }

    return invoices.map(invoice => invoice.toObject({ flattenObjectIds: true }));
};
      
//delete invoice

// export const deleteInvoice = async (id) =>{

// await connectDB();
// try{
// let invoice =await Invoice.findByIdAndDelete(id);
  
// if (!invoice) {
//   return { error: "invoice not found" };
// }
// if(invoice){
//    const payment = await PaymentHistory.deleteMany({invoice:id})
//    const received = await ReceivedAmount.deleteMany({invoice:id})
// }

// return { success: true, message: "invoice deleted successfully" }
// } catch (error) {
// console.error("Error deleting invoice:", error);
// return { error: "Failed to delete invoice" };
// }

// }

export const deleteInvoice = async (id) => {
    try {
      await connectDB(); // ✅ Ensure DB connection before proceeding
  
      // ✅ Find and delete invoice
      const invoice = await Invoice.findByIdAndDelete(id);
      if (!invoice) {
        return { error: "Invoice not found" };
      }
  
      // ✅ Delete associated payment history & received amounts
      const [paymentResult, receivedResult] = await Promise.all([
        PaymentHistory.deleteMany({ invoice: id }),
        ReceivedAmount.deleteMany({ invoice: id })
      ]);
  
      console.log(`Deleted ${paymentResult.deletedCount} payment records`);
      console.log(`Deleted ${receivedResult.deletedCount} received amount records`);
  
      return { success: true, message: "Invoice deleted successfully" };
    } catch (error) {
      console.error("Error deleting invoice:", error);
      return { error: "Failed to delete invoice" };
    }
  };


//edit invoice


export const editInvoice = async (id,trigger ,data) => {
    await connectDB();
    // console.log("Updating Invoice with Data:", data);

    // Check if the invoice exists
    let invoiceExists = await Invoice.findOne({ _id: id });

    if (!invoiceExists) {
        return { error: "Invoice does not exist" };
    }

    try {
        // ✅ Ensure status is updated correctly
        data.status = data.balance_due_amount === 0 ? "PAID" : "PENDING";

        await Invoice.findOneAndUpdate(
            { _id: id },
            { $set: data },
            { new: true, runValidators: true }
        );

        // ✅ Delete old payment history if grandTotal changes
        if (trigger === false) {
            try {
                let payments = await PaymentHistory.deleteMany({ invoice: id });

                if (payments.deletedCount === 0) {
                    console.log("No payment history found to delete.");
                } else {
                    console.log(`Deleted ${payments.deletedCount} payment records.`);
                }
            } catch (error) {
                console.error("Error deleting payment history:", error);
                return { error: "Failed to delete payment history" };
            }
        }

        return { success: true, message: "Invoice updated successfully" };
    } catch (error) {
        console.error("Error updating invoice:", error);
        return { error: "Failed to update invoice" };
    }
};




export const savePaymentHistory = async (data) => {
    await connectDB();
    // console.log("ttttt:",data)

    try {
        // Fetch invoice details to get previous due amount and grand total
        const invoice = await Invoice.findById(data.invoiceId).lean();
        if (!invoice) {
            return { error: "Invoice not found" };
        }

        const newPayment = new PaymentHistory({
            invoice: new mongoose.Types.ObjectId(data.invoiceId),
            client: new mongoose.Types.ObjectId(data.client),  // Ensure client ID is used
            grandTotal: data.grandTotal,
            previous_due_amount: data.previous_due_amount,
            payment_received: data.payment_received,
            updated_due_amount: data.updated_due_amount,
            payment_date: new Date(), // Store the current date
        });

        await newPayment.save();
        return { success: "Payment history saved successfully" };
    } catch (error) {
        console.error("Error saving payment history:", error);
        return { error: "Failed to save payment history" };
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

// pymenyts api
export const fetchPaymentHistory = async (invoiceId) => {
    await connectDB();

    try {
        // Fetch all payment history entries related to this invoice
        const invoiceHistory = await PaymentHistory.find({ invoice: invoiceId }).lean();

        if (!invoiceHistory || invoiceHistory.length === 0) {
            return { error: "No payment history found for this invoice" };
        }

        return { 
            success: "Payment history retrieved successfully", 
            invoiceHistory: JSON.parse(JSON.stringify(invoiceHistory)) 
        };
    } catch (error) {
        console.error("Error fetching payment history:", error);
        return { error: "Failed to fetch payment history" };
    }
};



// export const editInvoice = async (id, data) => {
//     await connectDB();

//     console.log("Updating Invoice with Data:", data);

//     // Check if the invoice exists and fetch the old data
//     const invoiceExists = await Invoice.findById(id);
//     if (!invoiceExists) {
//         return { error: "Invoice does not exist" };
//     }

//     try {
//         // ✅ Update invoice status based on balance due, if available
//         if (typeof data.balance_due_amount !== "undefined") {
//             data.status = data.balance_due_amount === 0 ? "PAID" : "PENDING";
//         }

//         // ✅ Reset payment history only if grandTotal has significantly changed
//         if (Math.abs(invoiceExists.grandTotal - data.grandTotal) > 0.01) {
//             await PaymentHistory.deleteMany({ invoice: id });
//         }

//         // ✅ Update invoice with new values
//         const updatedInvoice = await Invoice.findByIdAndUpdate(
//             id,
//             { $set: data },
//             { new: true, runValidators: true }
//         );

//         return {
//             success: "Invoice updated successfully",
//             invoice: updatedInvoice,
//         };
//     } catch (error) {
//         console.error("Error updating invoice:", error);
//         return { error: "Failed to update invoice" };
//     }
// };

// export const savePaymentHistory = async (data) => {
//     await connectDB();

//     try {
//         // ✅ Check if the invoice exists
//         const invoiceExists = await Invoice.exists({ _id: data.invoiceId });
//         if (!invoiceExists) {
//             return { error: "Invoice not found" };
//         }

//         // ✅ Ensure payment_received is a valid number
//         const paymentReceived = data.payment_received ?? 0;

//         const newPayment = new PaymentHistory({
//             invoice: new mongoose.Types.ObjectId(data.invoiceId),
//             client: new mongoose.Types.ObjectId(data.client),
//             grandTotal: data.grandTotal,
//             previous_due_amount: data.previous_due_amount,
//             payment_received: paymentReceived,
//             updated_due_amount: data.updated_due_amount,
//             payment_date: new Date(),
//         });

//         await newPayment.save();

//         return { success: "Payment history saved successfully" };
//     } catch (error) {
//         console.error("Error saving payment history:", error);
//         return { error: "Failed to save payment history" };
//     }
// };
