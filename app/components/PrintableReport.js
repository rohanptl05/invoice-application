"use client";
import React, { forwardRef } from "react";

const PrintableReport = forwardRef(function PrintableReport({ invoices = [] }, ref) {
  return (
    <div ref={ref} className="p-4 bg-white">
      <h1 className="text-2xl font-bold mb-4">Invoice Report</h1>
      <p className="mb-2">Date: {new Date().toLocaleDateString()}</p>

      <table className="w-full border-collapse border text-center text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Invoice No.</th>
            <th className="border p-2">Client</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Total Amount</th>
            <th className="border p-2">Due Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length > 0 ? (
            invoices.map((invoice) => (
              <tr key={invoice._id}>
                <td className="border p-2">{invoice.invoiceNumber}</td>
                <td className="border p-2">{invoice.client?.name}</td>
                <td className="border p-2">{new Date(invoice.date).toLocaleDateString()}</td>
                <td className="border p-2">{invoice.status}</td>
                <td className="border p-2">{invoice.grandTotal}</td>
                <td className="border p-2">{invoice.balance_due_amount}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="border p-4 text-gray-500">
                No invoices to display.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});

export default PrintableReport;
