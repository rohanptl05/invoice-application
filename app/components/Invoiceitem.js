"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { deleteInvoice } from "../api/actions/invoiceactions";

const Invoiceitem = ({ invoice,updateInvoice }) => {
    const router = useRouter();

    return (
        <div className="border p-3 mb-2 shadow rounded bg-white flex items-center justify-between min-h-[80px]">
        <div className="flex items-center gap-4">
            {/* <span className="font-semibold text-gray-600">#{index + 1}</span> */}
            <div>
                <h3 className="text-md font-semibold">Invoice #{invoice.invoiceNumber}</h3>
                <p className="text-sm text-gray-600">Status: <strong>{invoice.status}</strong></p>
                <p className="text-sm text-gray-600">Total: <strong>₹ {invoice.grandTotal.toLocaleString()}</strong></p>
            </div>
        </div>

        <div className="flex gap-2">
            <button
                onClick={() => window.confirm("Are you sure you want to delete this invoice?") && deleteInvoice(invoice._id)}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm"
            >
                Delete
            </button>

            <button onClick={() => updateInvoice(invoice)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                Edit
            </button>

            <button
                onClick={() => router.push(`/invoices/invoicedetails/${invoice._id}`)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
                View
            </button>
        </div>
    </div>
    );
};

export default Invoiceitem;
