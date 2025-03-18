"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { deleteInvoice } from "../api/actions/invoiceactions";

const Invoiceitem = ({ invoice,updateInvoice }) => {
    const router = useRouter();

    return (
        <div className="border p-4 mb-2 shadow rounded">
            <h3 className="text-lg font-semibold">Invoice #{invoice.invoiceNumber}</h3>
            <p><strong>Status:</strong> {invoice.status}</p>
            <p><strong>Date:</strong> {new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(invoice.date))}</p>
            <p><strong>Grand Total:</strong> ₹ {invoice.grandTotal.toLocaleString()}</p>
            <h4 className="mt-2 font-semibold">Items:</h4>
            <ul className="list-disc ml-5">
                {invoice.items.map((item, index) => (
                    <li key={index}>
                        {item.item_name} - ₹ {item.item_price} x {item.item_quantity}
                    </li>
                ))}
            </ul>

            <button
                onClick={() => window.confirm("Are you sure you want to delete this invoice?") && deleteInvoice(invoice._id)}
                className="bg-red-500 text-white px-4 py-2 rounded m-1"
            >
                Delete
            </button>
          

            <button   onClick={() => updateInvoice(invoice)} 
            className="bg-green-600 text-white px-4 py-2 rounded m-1">
                Edit
            </button>

            <button
                onClick={() => router.push(`/invoicedetails/${invoice._id}`)}
                className="bg-green-600 text-white px-4 py-2 rounded m-1"
            >
                View
            </button>
        </div>
    );
};

export default Invoiceitem;
