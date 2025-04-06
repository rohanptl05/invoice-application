import React from 'react'

const ReportinvoiceItems = ({invoices }) => {
    console.log("itempage",invoices)
  return (
 

<tr className=" hover:bg-gray-50 transition duration-300 border-b">
        {/* Invoice Number */}
        <td className="px-6 py-4 font-medium text-gray-900">
        {invoices.invoiceNumber}
        </td>
        <td className="px-6 py-4 font-medium text-gray-900">
        {invoices.client.name}
        </td>
        <td className="px-6 py-4 font-medium text-gray-900">
        {new Date(invoices.date).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })}
        </td>
        <td className="px-6 py-4 font-medium text-gray-900">
        {/* {invoices.status} */}

        <span className={`px-3 py-1 text-xs font-semibold rounded-md 
                ${invoices.status === "PAID" ? "bg-green-100 text-green-700" :
                  invoices.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"}`}>
                {invoices.status}
            </span>
        </td>
        <td className="px-6 py-4 font-medium text-gray-900">
        {invoices.grandTotal}
        </td>
        <td className="px-6 py-4 font-medium text-gray-900">
        {invoices.balance_due_amount}
        </td>
     </tr>
   
  )
}

export default ReportinvoiceItems
