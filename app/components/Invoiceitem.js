"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { deleteInvoice } from "../api/actions/invoiceactions";
import Link from "next/link";

const Invoiceitem = ({ invoice, updateInvoice, getData }) => {
    const router = useRouter();
     const { id } = useParams();
    

    useEffect(() => {
        getData()
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this invoice?")) {
            const response = await deleteInvoice(id);
            if (response.success) {
                alert("Invoice deleted successfully!");
                getData(); // ✅ Refresh invoice list after successful deletion
            } else {
                alert("Failed to delete invoice.");
            }
        }
    };
    const handleView = () => {
        router.push(`/dashboard/clients/${id}/invoices/invoicedetails/${invoice._id}`);
    };

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
                    onClick={() => handleDelete(invoice._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                >
                    Delete
                </button>

                <button onClick={() => updateInvoice(invoice)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                    Edit
                </button>
               
            <button
            onClick={handleView}
                // onClick={() => router.push(`/dashboard/clients/[id]/invoices/invoicedetails/invoice:${invoice._id}`)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
                View
            </button> 

                {/* <Link
                    href={`/dashboard/clients/[id]/invoices/invoicedetails/${invoice._id}`}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                    View
                </Link> */}
            </div>
        </div>
    );
};

export default Invoiceitem;
