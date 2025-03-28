import React from 'react'

const Invoicepayments = () => {
  return (
    <>
       <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Payment History</h2>
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2 text-left">Date</th>
              <th className="border px-4 py-2 text-left">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {/* {payments?.length > 0 ? (
              payments.map((payment, index) => ( */}
                <tr 
                // key={index}
                >
                  <td className="border px-4 py-2">
                    {/* {new Date(payment.payment_date).toLocaleDateString("en-GB")} */}
                  </td>
                  <td className="border px-4 py-2">
                    {/* ₹{payment.payment_received} */}

                  </td>
                </tr>
          {/* )} */}
        </tbody>
        </table>
      </div>
    </>
  )
}

export default Invoicepayments
