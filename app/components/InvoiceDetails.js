import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { editReceivedAmount } from "../api/actions/receivedamountactions";

const InvoiceDetails = ({ invoice, client, payments, onSavePayment }) => {
  const [ispayment, setIspayment] = useState([]);
  const [isinvoice, setIsInvoice] = useState({});
  const [isclient, setIsclient] = useState({});
  const [openModal, SetModal] = useState(false);
  const [editedPayment, setEditedPayment] = useState(null);

  useEffect(() => {
    if (invoice) {
      setIsInvoice(invoice);
      if (client) {
        setIsclient(client);
      }
      if (payments) {
        setIspayment(payments);
      }
    }
  }, [invoice, client, payments]);

  const handleEdit = (payment) => {
    setEditedPayment({ ...payment });
    SetModal(true);
  };

  const handleChange = (e) => {
    setEditedPayment({
      ...editedPayment,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (editedPayment) {
      // onSavePayment(editedPayment); // Ensure `onSavePayment` is passed as a prop
      // console.log(editedPayment)
      const response = await editReceivedAmount(editedPayment.id, editedPayment)
      if (response.success) {
        alert("Update successful");
        setIspayment((prevPayments) =>
          prevPayments.map((payment) =>
            payment.id === editedPayment.id ? editedPayment : payment
          )
        );
      }
      SetModal(false);
    }
  };

  if (!isinvoice) return <p>Loading invoice...</p>;

  return (
    <>
      <div className="container">
        {isinvoice?.items?.length > 0 ? (
          <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Invoice Details</h1>
            <div className="border p-4 rounded-md shadow-sm">
              <p className="text-lg">
                <strong>Invoice Number:</strong> {isinvoice?.invoiceNumber}
              </p>
              <p className="text-lg">
                <strong>Status:</strong> {isinvoice?.status}
              </p>
              <p className="text-lg">
                <strong>Client Name:</strong> {isclient?.name}
              </p>
              <p className="text-lg">
                <strong>Date Issued:</strong>{" "}
                {isinvoice?.date
                  ? new Date(isinvoice.date).toLocaleDateString("en-GB")
                  : "N/A"}
              </p>
              <p className="text-lg">
                <strong>Due Amount:</strong> ₹{isinvoice?.balance_due_amount}
              </p>
            </div>

            <h2 className="text-xl font-semibold mt-6 mb-2">Items</h2>
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-4 py-2">Item</th>
                  <th className="border px-4 py-2">Quantity</th>
                  <th className="border px-4 py-2">Price</th>
                  <th className="border px-4 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {isinvoice.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border text-center px-4 py-2">
                      {item.item_name}
                    </td>
                    <td className="border text-center px-4 py-2">
                      {item.item_quantity}
                    </td>
                    <td className="border text-center px-4 py-2">
                      ₹{item.item_price}
                    </td>
                    <td className="border text-center px-4 py-2">
                      ₹{(item.item_quantity * item.item_price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan="3"
                    className="border px-4 py-2 text-right font-bold"
                  >
                    Total Amount:
                  </td>
                  <td className="border px-4 py-2 text-center font-bold">
                    ₹{isinvoice?.grandTotal}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p>Invoice not found</p>
        )}

        {/* Payment History Section */}
        <div className="container mt-7">
          <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
            <h2 className="text-xl font-semibold mt-6 mb-2">Payment History</h2>

            {ispayment.length > 0 ? (
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-200 text-center">
                    <th className="border px-4 py-2 text-left">Date</th>
                    <th className="border px-4 py-2 text-left">
                      Received Amount (₹)
                    </th>
                    <th className="border px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ispayment.map((payment, index) => (
                    <tr key={index}>
                      <td className="border px-4 py-2">
                        {new Date(payment.payment_date).toLocaleDateString(
                          "en-GB"
                        )}
                      </td>
                      <td className="border px-4 py-2">
                        ₹{payment.payment_received}
                      </td>
                      <td className="border px-4 py-2 items-center">
                        <button
                          onClick={() => handleEdit(payment)}
                          type="button"
                          className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-2 py-1 me-2 mb-1"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-white bg-red-500 hover:bg-red-600 font-medium rounded-lg text-sm px-2 py-1 me-2 mb-1"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-600 text-center mt-4">
                No payment history available.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Payment Modal */}
      {openModal && (
        <Modal isOpen={openModal} onClose={() => SetModal(false)} title="Edit Payment">
          <div className="bg-white p-6 rounded-lg shadow-md w-96 shadow-orange-800">
            {/* <h2 className="text-xl font-semibold mb-4">Edit Payment</h2> */}

            <label className="block mb-2">
              <span className="text-gray-700">Payment Date</span>
              <input
                type="date"
                name="payment_date"
                value={
                  editedPayment?.payment_date
                    ? new Date(editedPayment.payment_date).toISOString().split("T")[0] // ✅ Correct format
                    : ""
                }
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </label>

            <label className="block mb-2">
              <span className="text-gray-700">Amount (₹)</span>
              <input
                type="number"
                name="payment_received"
                value={
                  editedPayment?.payment_received
                }
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </label>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => SetModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default InvoiceDetails;
