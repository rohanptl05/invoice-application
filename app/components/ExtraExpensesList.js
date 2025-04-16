"use client"
import React from 'react'
import { DeleteExinvoices } from '../api/actions/extraexpenseactions'

const ExtraExpensesList = ( { exinvoice, index ,updateExInvoice,getData}) => {



   const handleDelete = async () => {
          if (window.confirm("Are you sure you want to delete this invoice?")) {
              const response = await DeleteExinvoices(exinvoice._id);
              if (response.success) {
                  alert("Invoice deleted successfully!");
                  getData();
                  // getData();
              } else {
                  alert("Failed to delete invoice.");
              }
          }
      };
  return (
    <>
      <tr className=" hover:bg-gray-50 transition duration-300 border-b">
        {/* Invoice Number */}
        <td className="px-6 py-4 font-medium text-gray-900">
        {index  +1}
        </td>
        <td className="px-6 py-4 font-medium text-gray-900">
        {exinvoice.date
          ? new Date(exinvoice.date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            })
          : "N/A"}
        </td>
        <td className="px-6 py-4 font-medium text-gray-900">
          {exinvoice.expensetype}
        </td>
        <td className="px-6 py-4 font-medium text-gray-900">
          {exinvoice.description}
        </td>
        <td className="px-6 py-4 font-medium text-gray-900">
          ₹ {exinvoice.amount}
        </td>
        <td className="px-6 py-4 font-medium  text-gray-900">
        <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-3 py-1 mx-1 rounded-lg text-xs md:text-sm md:px-4 hover:bg-red-600 transition duration-300 shadow-md"
            >
                Delete
            </button>
            <button
                onClick={() => updateExInvoice(exinvoice)}
                className="bg-green-600 text-white px-3 py-1 mx-1 rounded-lg text-xs md:text-sm md:px-4 hover:bg-green-700 transition duration-300 shadow-md"
            >
                Edit
            </button>
        </td>
        
        </tr>
    
    
    
    </>
  )
}

export default ExtraExpensesList
