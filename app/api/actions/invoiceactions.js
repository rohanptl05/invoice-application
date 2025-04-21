"use server"

import connectDB from "@/db/connectDb"
import Client from "@/models/Client";
import Invoice from "@/models/Invoice";
import mongoose from "mongoose";
import ReceivedAmount from "@/models/ReceivedAmount";

export const fetchInvoice = async (id, status) => {
    await connectDB();


    // let invoices = await Invoice.find({ client: id , recordStatus : status}).populate('client').sort({ date: -1 })
    const invoices = await Invoice.find({ client: id, recordStatus: status }).populate('client').sort({ date: -1 })
    if (!invoices || invoices.length === 0) {
        return { error: "No invoices found" };
    }

    return invoices.map(invoice => invoice.toObject({ flattenObjectIds: true }));
};



export const deleteInvoice = async (id) => {
    try {
        await connectDB(); // ✅ Ensure DB connection before proceeding

        // ✅ Find and delete invoice
        const invoice = await Invoice.findById(id);
        if (!invoice) {
            return { error: "Invoice not found" };
        }
        try {
            await Invoice.findOneAndUpdate(
                { _id: id },  // Find by the correct ID
                {
                    $set: {
                        recordStatus: "deactivated",
                        deactivatedAt: new Date()

                    }
                },
                { new: true }
            );
            await ReceivedAmount.updateMany(
                { invoice: id },
                {
                    $set: {
                        recordStatus: "deactivated",
                        deactivatedAt: new Date()
                    }
                },

            );


        } catch (error) {
            console.error("Error deleting invoice:", error);
            return { error: "Failed to delete invoice" };

        }






        return { success: true, message: "Invoice deleted successfully" };
    } catch (error) {
        console.error("Error deleting invoice:", error);
        return { error: "Failed to delete invoice" };
    }
};


//edit invoice


export const editInvoice = async (id, trigger, data) => {
    await connectDB();

    let invoiceExists = await Invoice.findOne({ _id: id });

    if (!invoiceExists) {
        return { error: "Invoice does not exist" };
    }

    try {

        data.status = data.balance_due_amount === 0 ? "PAID" : "PENDING";

        await Invoice.findOneAndUpdate(
            { _id: id },
            { $set: data },
            { new: true, runValidators: true }
        );



        return { success: true, message: "Invoice updated successfully" };
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
            user: new mongoose.Types.ObjectId(data.user),
            items: data.items,
            grandTotal: data.grandTotal,
            received_amount: receivedAmount,
            balance_due_amount: Math.max(balanceDue, 0),
            imageURL: data.imageURL, // Prevent negative balance
        });

        // ✅ Convert the Mongoose document to a plain JSON object
        return JSON.parse(JSON.stringify(newInvoice));
    } catch (error) {
        console.error("Error adding invoice:", error);
        return null;
    }
};


// invoicesDetalis find by invoiceId
export const fetchInvoiceDetails = async (id) => {
    await connectDB(); // ✅ Ensure DB is connected only once

    try {
        const invoice = await Invoice.findById(id).lean();

        if (!invoice) {
            return { error: "Invoice not found" };
        }


        return {
            success: true,
            invoice: JSON.parse(JSON.stringify(invoice)),

        };
    } catch (error) {
        console.error("Error fetching invoice:", error);
        return { error: "Failed to retrieve invoice details" };
    }
};




export const fetchClientsWithInvoices = async (userId, status) => {
    await connectDB();

    try {
        // Step 1: Find all clients for the given user
        const clients = await Client.find({ user: userId, clientStatus: status }).lean();

        if (!clients || clients.length === 0) {
            return { error: "No clients found for this user." };
        }

        const clientIds = clients.map((client) => client._id);

        // Step 2: Find invoices belonging to these clients, populate client data
        const invoices = await Invoice.find({ client: { $in: clientIds }, recordStatus: status })
            .populate("client")
            .sort({ date: -1 })
            .lean();

        if (!invoices || invoices.length === 0) {
            return { error: "No invoices found for any client." };
        }

        return {
            success: true,
            invoices: JSON.parse(JSON.stringify(invoices)),
        };
    } catch (error) {
        console.error("Error fetching invoices with populated clients:", error);
        return { error: "Failed to fetch data." };
    }
};


// Function to restore an invoice
export const fetchDeactivetedInvoiceAndRecivedAmount = async (id, status) => {
    await connectDB();

    try {
        const clients = await Client.find({ user: id }).lean();

        if (!clients || clients.length === 0) {
            return { error: "No clients found for this user." };
        }

        const clientIds = clients.map((client) => client._id);

        // Step 2: Find invoices belonging to these clients, populate client data
        const invoices = await Invoice.find({ client: { $in: clientIds }, recordStatus: status })
            .populate("client")
            .sort({ deactivatedAt: -1 })
            .lean();

        // const invoiceId = invoices.map((invoice) => invoice._id);

        const Receivedamount = await ReceivedAmount.find({ client: { $in: clientIds }, recordStatus: status }).populate("client").populate("invoice")
            .sort({ deactivatedAt: -1 })
            .lean();


        return {
            success: true,
            invoices: JSON.parse(JSON.stringify(invoices)),
            Receivedamount: JSON.parse(JSON.stringify(Receivedamount)),
        };





    } catch (error) {

    }
}


export const RestoreInvoice = async (id) => {
    await connectDB()

    console.log('restore id invoice ', id)


    try {
        const invoice = await Invoice.findById(id);
        if (invoice && (invoice.recordStatus !== "active" || invoice.deactivatedAt !== null)) {
            await Invoice.findByIdAndUpdate(id, {
                $set: {
                    recordStatus: "active",
                    deactivatedAt: null
                }
            });
        }

        const clientId = invoice.client
        // console.log("client:",clientId)

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

        const receivedAmounts = await ReceivedAmount.find({
            invoice: id,
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

            await Invoice.findByIdAndUpdate(id, {
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

}

export const DeleteImageURL = async (id) => {
    connectDB()
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return { error: "Invalid invoice ID" };
        }
        const invoice = await Invoice.findById(id);

        if (!invoice) {
            return { error: "Invoice does not exist" };
        }

        invoice.imageURL = "";
        await invoice.save();

        return { success: true, message: "Invoice image URL deleted successfully" };
    } catch (error) {
        console.error("Error deleting invoice image URL:", error);
        return { error: "Failed to delete image URL from invoice" };
    }
};
