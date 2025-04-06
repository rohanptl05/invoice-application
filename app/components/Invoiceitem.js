"use client";

import React, { useEffect } from "react";
import { useRouter,useParams } from "next/navigation";
import { deleteInvoice } from "../api/actions/invoiceactions";

const Invoiceitem = ({ invoice, updateInvoice ,getData}) => {
    const router = useRouter();
    
    const { id } = useParams();
    

   
    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this invoice?")) {
            const response = await deleteInvoice(invoice._id);
            if (response.success) {
                alert("Invoice deleted successfully!");
                getData();
            } else {
                alert("Failed to delete invoice.");
            }
        }
    };

    const handleView = () => {
        router.push(`/dashboard/clients/${id}/invoices/invoicedetails/${invoice._id}`);
    };

    return (
        <tr className=" hover:bg-gray-50 transition duration-300 border-b">
        {/* Invoice Number */}
        <td className="px-6 py-4 font-medium text-gray-900">
            {invoice.invoiceNumber}
        </td>
        <td className="px-6 py-4 font-bold text-gray-800">
    {invoice.date
        ? new Date(invoice.date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          })
        : "N/A"}
</td>
        {/* Status */}
        <td className="px-6 py-4 text-gray-600">
            <span className={`px-3 py-1 text-xs font-semibold rounded-md 
                ${invoice.status === "PAID" ? "bg-green-100 text-green-700" :
                  invoice.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"}`}>
                {invoice.status}
            </span>
        </td>
       
        {/* Grand Total */}
        <td className="px-6 py-4 font-bold text-gray-800">₹ {invoice.grandTotal.toLocaleString()}</td>
        {/* Balance Due */}
        <td className="px-6 py-4 font-bold text-gray-800">₹ {invoice.balance_due_amount.toLocaleString()}</td>
        {/* Action Buttons */}
        <td className="px-6 py-4 flex justify-center space-x-2">
            <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs md:text-sm md:px-4 hover:bg-red-600 transition duration-300 shadow-md"
            >
                Delete
            </button>
            <button
                onClick={() => updateInvoice(invoice)}
                className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs md:text-sm md:px-4 hover:bg-green-700 transition duration-300 shadow-md"
            >
                Edit
            </button>
            <button
                onClick={handleView}
                className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs md:text-sm md:px-4 hover:bg-blue-700 transition duration-300 shadow-md"
            >
                View
            </button>
        </td>
    </tr>
    
    );
};

export default Invoiceitem;
