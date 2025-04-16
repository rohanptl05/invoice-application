import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { editReceivedAmount, deleteReceivedAmount } from "../api/actions/receivedamountactions";
import { editInvoice } from "../api/actions/invoiceactions";
import Image from "next/image";

const InvoiceDetails = ({ invoice, client, payments }) => {
  const [ispayment, setIspayment] = useState([]);
  const [isinvoice, setIsInvoice] = useState({});
  const [isclient, setIsclient] = useState({});
  const [openModal, SetModal] = useState(false);
  const [editedPayment, setEditedPayment] = useState(null);
  const [totalReceivedAmount, setTotalReceivedAmount] = useState(0);

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

  useEffect(() => {
    if (ispayment.length > 0) {
      const totalReceived = ispayment.reduce((sum, record) => Number(sum) + Number (record.payment_received || 0), 0);
      setTotalReceivedAmount(totalReceived);
      // console.log("Updated Total Received Amount:", totalReceived);
    } else {
      setTotalReceivedAmount(0);
    }
  }, [ispayment]);


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




  // const handleSave = async () => {
  //   if (editedPayment) {
  //     const response = await editReceivedAmount(editedPayment.id, editedPayment);
  //     if (response.success) {
  //       alert("Update successful");
  //       setIspayment((prevPayments) =>
  //         prevPayments.map((payment) =>
  //           payment.id === editedPayment.id ? { ...payment, ...editedPayment } : payment
  //         )
  //       );

  //       // const updatedTotalReceived = ispayment.reduce((sum, record) =>sum + (record.id === editedPayment.id ? Number(editedPayment.payment_received) : Number(record.payment_received) || 0), 0);
  //       const updatedTotalReceived = updatedPayments.reduce(
  //         (sum, record) => sum + Number(record.payment_received ?? 0),
  //         0
  //       );

  //       setTotalReceivedAmount(updatedTotalReceived);


  //       // setTotalReceivedAmount(updatedTotalReceived);
  //       const updatedInvoice = {
  //         ...isinvoice,
  //         balance_due_amount: isinvoice.grandTotal - updatedTotalReceived,
  //         received_amount: updatedTotalReceived,
  //       };

  //       const invoiceResponse = await editInvoice(isinvoice._id, false, updatedInvoice);
  //       if (invoiceResponse.success) {
  //         alert("Invoice updated successfully");
  //         setIsInvoice(updatedInvoice);

  //       } else {
  //         alert("Failed to update invoice");
  //       }

  //       setEditedPayment(null);
  //       SetModal(false);
  //     }
  //   }
  // };
  const handleSave = async () => {
    if (editedPayment) {
      const response = await editReceivedAmount(editedPayment.id, editedPayment);
      if (response.success) {
        alert("Update successful");

        const updatedPayments = ispayment.map((payment) =>
          payment.id === editedPayment.id ? { ...payment, ...editedPayment } : payment
        );

        setIspayment(updatedPayments);

        const updatedTotalReceived = updatedPayments.reduce(
          (sum, record) => Number(sum) + Number(record.payment_received ?? 0),
          0
        );



        // setTotalReceivedAmount(updatedTotalReceived);

        const updatedInvoice = {
          ...isinvoice,
          balance_due_amount: isinvoice.grandTotal - updatedTotalReceived,
          received_amount: updatedTotalReceived,
        };

        const invoiceResponse = await editInvoice(isinvoice._id, false, updatedInvoice);
        if (invoiceResponse.success) {
          alert("Invoice updated successfully");
          setIsInvoice(updatedInvoice);
        } else {
          alert("Failed to update invoice");
        }

        setEditedPayment(null);
        SetModal(false);
      }
    }
  };



  const handleDeletePayment = async (paymentId) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      const response = await deleteReceivedAmount(paymentId);
      if (response.success) {
        alert("Payment deleted successfully");
        setIspayment((prevPayments) => prevPayments.filter((payment) => payment.id !== paymentId));

        const updatedTotalReceived = await ispayment
          .filter((payment) => payment.id !== paymentId)
          .reduce((sum, record) =>Number(sum) + Number (record.payment_received || 0), 0);
        
        setTotalReceivedAmount(updatedTotalReceived);
        const updatedInvoice = {
          ...isinvoice,
          balance_due_amount: isinvoice.grandTotal - updatedTotalReceived,
          received_amount: updatedTotalReceived,
        };

        const invoiceResponse = await editInvoice(isinvoice._id, false, updatedInvoice);
        if (invoiceResponse.success) {
          alert("Invoice updated successfully");

          setIsInvoice(updatedInvoice);
        } else {
          alert("Failed to update invoice");
        }
      } else {
        alert("Failed to delete payment");
      }
    }
  };
  const handleDeleteImage = async () => {
    const publicId = isinvoice.imageURL.split("/").slice(-1)[0].split(".")[0]; // Extract publicId

    console.log("publicId:", publicId);

    // const result = await deleteImageFromCloudinary(publicId);
    // if (result.success) {
    //   alert("Image deleted successfully");
    //   // Optionally, update your invoice in DB to remove imageURL
    // } else {
    //   alert("Failed to delete image");
    // }
  };


  if (!isinvoice) return <p>Loading invoice...</p>;

  return (
    <>
      <div className="container">
        {isinvoice?.items?.length > 0 ? (
          <div className="max-w-4xl mx-auto p-6  shadow shadow-gray-400 rounded-lg">
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
            <table className="w-full border-collapse border ">
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
          <div className="max-w-4xl mx-auto p-6  shadow rounded-lg">
            <h2 className="text-xl font-semibold mt-6 mb-2">Payment History</h2>
            {ispayment.length > 0 ? (
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-200 text-center">
                    <th className="border px-4 py-2">Date</th>
                    <th className="border px-4 py-2">Received Amount (₹)</th>
                    <th className="border px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ispayment.map((payment, index) => (
                    <tr key={index}>
                      <td className="border px-4 py-2 text-center">{new Date(payment.payment_date).toLocaleDateString("en-GB")}</td>
                      <td className="border px-4 py-2 text-center">₹{payment.payment_received}</td>
                      <td className="border px-4 py-2 text-center">
                        <button onClick={() => handleEdit(payment)} className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-2 py-1 me-2">Edit</button>
                        <button onClick={() => handleDeletePayment(payment.id)} className="text-white bg-red-500 hover:bg-red-600 font-medium rounded-lg text-sm px-2 py-1">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="2" className="border px-4 py-2 text-right font-bold">Total Received Amount:</td>
                    <td className="border px-4 py-2 text-center font-bold">₹{totalReceivedAmount}</td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <p className="text-gray-600 text-center mt-4">No payment history available.</p>
            )}
          </div>
        </div>

        {isinvoice?.imageURL && (
          <div className="flex justify-center mt-6">
            <div className="rounded-lg border p-4 shadow-md text-center w-full max-w-3xl">
              <div>
                <h2 className="text-xl font-semibold mb-4">Uploaded Invoice</h2>
                <button
                  onClick={handleDeleteImage}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete Image
                </button>
              </div>
              <div className="relative w-full aspect-[2/3] mx-auto">
                <Image
                  src={isinvoice?.imageURL}
                  alt="Uploaded invoice"
                  width={700}
                  height={1200}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 50vw"
                  className="rounded-md object-contain w-full h-auto"
                />
              </div>
            </div>
          </div>
        )}




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
