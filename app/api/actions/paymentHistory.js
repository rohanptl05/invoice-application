
import connectDB from "@/db/connectDb";
import {  Invoice,PaymentHistory } from "@/models/Invoice";  // Import Invoice model to get invoice details

export const fetchPaymentHistory = async (id,data) => {
    await connectDB();

    try {
        // Fetch invoice details to get the previous due amount and grand total
        const invoiceHistory = await PaymentHistory.findById(data.invoiceId).lean();
        if (!invoiceHistory) {
            return { error: "Invoice payment data not found" };
        }
  
        return { success: "Payment history saved successfully" ,invoiceHistory};
    } catch (error) {
        console.error("Error saving payment history:", error);
        return { error: "Failed to save payment history" };
    }
};
