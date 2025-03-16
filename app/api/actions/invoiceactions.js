"use server"

import connectDb from "@/db/connectDb"
import Client from "@/models/Client";
import Invoice from "@/models/Invoice";

export const fetchInvoice = async (id) => {
    await connectDb();

    let invoices = await Invoice.find({ client: id });

    if (!invoices || invoices.length === 0) {
        return { error: "No invoices found" };
    }

    return invoices.map(invoice => invoice.toObject({ flattenObjectIds: true }));
};
