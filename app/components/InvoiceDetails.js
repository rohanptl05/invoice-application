import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { editReceivedAmount, deleteReceivedAmount } from "../api/actions/receivedamountactions";
import { editInvoice } from "../api/actions/invoiceactions";
import Image from "next/image";
import { DeleteImageURL } from "../api/actions/invoiceactions";


const InvoiceDetails = ({ invoice, client, payments, reportRef, getData }) => {

  const [ispayment, setIspayment] = useState([]);
  const [isinvoice, setIsInvoice] = useState({});
  const [isclient, setIsclient] = useState({});
  const [openModal, SetModal] = useState(false);
  const [editedPayment, setEditedPayment] = useState(null);
  const [totalReceivedAmount, setTotalReceivedAmount] = useState(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
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
      const totalReceived = ispayment.reduce((sum, record) => Number(sum) + Number(record.payment_received || 0), 0);
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
          .reduce((sum, record) => Number(sum) + Number(record.payment_received || 0), 0);

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
    const res = await DeleteImageURL(isinvoice._id)
    if (res.success) {
      alert("Image is deleted successefully ")
    }
    getData();

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
          // <div ref={reportRef} className="max-w-4xl mx-auto shadow shadow-gray-400 rounded-lg bg-white text-black">
          <div ref={reportRef} className="bg-white p-8 text-black mx-auto w-[90%] rounded shadow-lg"
          // style={{
          //   width: '794px', // A4 width at 96 DPI
          //   padding: '40px',
          //   boxSizing: 'border-box',
          //   backgroundColor: 'white',
          // }}
          >

            <div className="  rounded-t-lg px-6 py-4">
              <h1 className="text-2xl font-bold text-center uppercase bg-black py-2 text-white tracking-wider mb-4">INVOICE</h1>
              <div className="flex justify-between items-start gap-4">

                {/* Logo */}
                <div className="max-w-[100px]">
                  <img
                    src={client.user.companylogo}
                    alt="Company Logo"
                    className="w-full h-auto object-contain rounded"
                  />
                </div>


                {/* Invoice Info */}
                <div className="flex flex-col items-end float-right space-y-2">
                  {/* Invoice Info Table */}
                  <table className="text-sm bg-white text-black rounded shadow rounded-tl">
                    <tbody className="gap-1.5">
                      <tr className="rounded-tl">
                        <th className="w-full  bg-gray-200 text-left p-2 rounded-tl">Invoice #</th>
                        <td className="p-2 border text-right rounded-tl">{isinvoice?.invoiceNumber}</td>
                      </tr>
                      <tr>
                        <th className="w-full bg-gray-200 text-left p-2 rounded-tl">Issue Date</th>
                        <td className="p-2 border text-right">
                          {isinvoice?.date
                            ? new Date(isinvoice.date).toLocaleDateString("en-GB")
                            : "N/A"}
                        </td>
                      </tr>

                    </tbody>
                  </table>

                  <address className="text-xs leading-4 not-italic  space-y-1 mt-2">
                    <p className="font-semibold text-sm text-right">{client.user.company}</p>
                   
                      {client.user.companyaddress
                      .split(',')
                      .map((line, index) => (
                        <p key={index} className="text-xs text-gray-700 text-right">
                          {line.trim()}
                        </p>
                          
                      ))}
                    <p className="text-xs text-gray-700 text-right">
                      <span className="font-medium">Phone:</span> {client.user.companyphone}
                    </p>
                  </address>


                </div>

              </div>
            </div>

            {/* Client Info */}
            <div className="px-4 py-3 w-[95%] mx-auto border bg-blue-100 text-blue-900 text-xs leading-5 font-medium space-y-1 rounded">
              <p className="font-semibold text-sm">Bill To:</p>
              <p className="not-italic ">{isclient?.name}</p>
              <div className="space-y-0.5">
                {isclient?.address.split(',').map((line, index) => (
                  <p key={index} className="text-xs">{line.trim()}</p>
                ))}
              </div>
            </div>


            {/* Items Table */}
            <div className="px-6 py-4 overflow-x-auto">
              <table className="w-full text-sm border border-collapse">
                <thead className="bg-gray-200">
                  <tr className="text-center">

                    <th className="p-2 ">No.</th>
                    <th className="p-2 ">Item</th>

                    <th className="p-2 ">Rate</th>
                    <th className="p-2 ">Quantity</th>
                    <th className="p-2 ">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {isinvoice.items.map((item, index) => (
                    <tr key={index} className="text-center">

                      <td className="p-2 ">{index + 1}</td>
                      <td className="p-2 ">{item.item_name}</td>

                      <td className="p-2 ">₹{item.item_price}</td>
                      <td className="p-2 ">{item.item_quantity}</td>
                      <td className="p-2 ">₹{(item.item_quantity * item.item_price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="px-6 pb-6 flex justify-end">
              <table className="text-sm w-[300px]">
                <tbody className="m-2.5">
                  <tr className="">
                    <th className="w-1/2 bg-gray-200 p-2 rounded-tl">Total</th>
                    <td className="p-2 border text-right">₹{isinvoice?.grandTotal}</td>
                  </tr>
                  <tr className="m-2.5">
                    <th className="bg-gray-200 p-2">Amount Paid</th>
                    <td className="p-2 border text-right">₹{totalReceivedAmount}</td>
                  </tr>
                  <tr className="m-2.5">
                    <th className="bg-gray-200 p-2 rounded-bl">Balance Due</th>
                    <td className="p-2 border  text-right">₹{isinvoice?.balance_due_amount}</td>
                  </tr>
                </tbody>
              </table>

            </div>


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
              <div className="relative w-full aspect-[2/3] mx-auto my-2">
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
