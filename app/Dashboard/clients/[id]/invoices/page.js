"use client";

// import "@/app/globals.css";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchInvoice, editInvoice, savePaymentHistory } from "@/app/api/actions/invoiceactions";
import Invoiceitem from "@/app/components/Invoiceitem";
import Modal from "@/app/components/Modal";
import AddInvoice from "@/app/components/AddInvoice";
import { saveReceivedAmount,fetchReceivedAmount } from "@/app/api/actions/receivedamountactions";



const Page = () => {
    const { data: session } = useSession();
    const { id } = useParams();
    const router = useRouter();

    const [invoices, setInvoices] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isAddClientOpen, setIsAddClientOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [originalInvoice, setOriginalInvoice] = useState(null);
    const [total_due_amount, setTotalDueAmount] = useState(0);
    const [modalType, setModalType] = useState("");
    const [isPaymentModal, setPaymentModal] = useState(false);
    const [isPaymentInvoice, setPaymentInvoice] = useState([]);
    const [totalReceivedAmount, setTotalReceivedAmount] = useState(0);
    const [isAmountModal, setIsAmountModal] = useState(false);

    useEffect(() => {
        if (!session) {
            router.push("/");
        } else {
            getData();
        }
    }, [id, session, router]);
    useEffect(() => {
        if (invoices.length > 0) {
            const totalDue = invoices.reduce((sum, invoice) => sum + (invoice.balance_due_amount || 0), 0);
            setTotalDueAmount(totalDue);

        } else {
            setTotalDueAmount(0);
        }
    }, [invoices]);

    //payments
    const handlePaymentUpdate = async (e) => {
        e.preventDefault();

        try {
            const filteredInvoices = isPaymentInvoice.filter(invoice => invoice.received_amount > 0);

            if (filteredInvoices.length === 0) {
                alert("No payments to process.");
                return;
            }

            for (const invoice of filteredInvoices) {
                const originalInvoice = invoices.find(inv => inv._id === invoice.id);
                if (!originalInvoice) continue;

                const previous_due_amount = parseFloat(originalInvoice.balance_due_amount);
                const received_amount = parseFloat(invoice.received_amount) || 0;
                const updated_due_amount = previous_due_amount - received_amount;
                const status = updated_due_amount <= 0 ? "PAID" : "PENDING";

                await editInvoice(invoice.id, true, {
                    received_amount,
                    balance_due_amount: updated_due_amount,
                    status,
                });

                await saveReceivedAmount("payment", {
                    invoiceId: invoice.id,
                    client: id,
                    payment_received: received_amount,
                });

                await savePaymentHistory({
                    invoiceId: invoice.id,
                    client: id,
                    grandTotal: invoice.grandTotal,
                    previous_due_amount,
                    updated_due_amount,
                    payment_received: received_amount,
                });
            }
            alert("Payments updated successfully!");
            await getData();
            setPaymentModal(false);
        } catch (error) {
            console.error("Error updating payments:", error);
            alert("Failed to update payments.");
        }
    };




    const paymentopenModal = () => {
        const updatedInvoices = invoices
            .filter(invoice => invoice.status === "PENDING")
            .map(invoice => ({
                id: invoice._id,
                client: invoice.client.name,
                grandTotal: invoice.grandTotal,
                received_amount: 0,
                balance_due_amount: invoice.balance_due_amount || 0,
                invoiceNumber: invoice.invoiceNumber || 0,
            }));

        setPaymentInvoice(updatedInvoices);
        if (updatedInvoices.length > 0) {
            setPaymentModal(true);
        } else {
            alert("No pending invoices available for payment.");
        }
    };

    const handlePaymentChange = (index, e) => {
        const { value } = e.target;
        const received_amount = parseFloat(value) || 0;

        setPaymentInvoice(prevInvoices => prevInvoices.map((invoice, i) =>
            i === index ? {
                ...invoice,
                received_amount,
                new_balance_due_amount: invoice.balance_due_amount - received_amount
            } : invoice
        ));
    };



    const getData = async () => {
        if (!id) {
            console.error("Client ID not found");
            return;
        }
        try {
            const clientData = await fetchInvoice(id);
            if (clientData) {
                setInvoices(clientData);
            } else {
                console.error(clientData.error || "No invoices found");
            }
        } catch (error) {
            console.error("Error fetching invoices:", error);
        }
    };

    const openModal = async (invoice) => {
        setSelectedInvoice(invoice ? { ...invoice } : null);
        setOriginalInvoice(invoice ? { ...invoice } : null);
        setModalOpen(true);

        if (invoice) {
            try {
                const paymentData = await fetchReceivedAmount(invoice._id);
                // console.log("rrr",paymentData)
                if (!paymentData ) {
                    setTotalReceivedAmount(0);
                } else {
                    const totalReceived = paymentData.reduce((sum, record) => sum + (record.payment_received || 0), 0);
                    setTotalReceivedAmount(totalReceived);
                }
            } catch (error) {
                console.error("Error fetching payment history:", error);
                setTotalReceivedAmount(0);
            }
        }
    };

    const handleUpdateInvoice = async (e) => {
        e.preventDefault();
        if (!selectedInvoice || !originalInvoice) return;

        const updatedFields = {};
        Object.keys(selectedInvoice).forEach((key) => {
            if (JSON.stringify(selectedInvoice[key]) !== JSON.stringify(originalInvoice[key])) {
                updatedFields[key] = selectedInvoice[key];
            }
        });

        // If no changes are detected, prevent unnecessary updates
        if (Object.keys(updatedFields).length === 0) {
            alert("No changes detected!");
            return;
        }

        try {
            const trigger = false
             const action = "update"
            // ✅ Ensure grandTotal changes are handled correctly
            if (selectedInvoice.grandTotal !== originalInvoice.grandTotal) {
                updatedFields.balance_due_amount = (selectedInvoice.grandTotal - totalReceivedAmount) || 0;
                updatedFields.grandTotal = selectedInvoice.grandTotal;
            }

            await editInvoice(selectedInvoice._id, trigger, updatedFields);
            // console.log("update :", updatedFields)



            await savePaymentHistory({
                invoiceId: selectedInvoice._id,
                client: id,
                grandTotal: selectedInvoice.grandTotal,
                previous_due_amount: selectedInvoice.grandTotal,
                updated_due_amount: (selectedInvoice.grandTotal - totalReceivedAmount),
                payment_received: (selectedInvoice.received_amount + totalReceivedAmount),
            });

            // await saveReceivedAmount(action,{
            //     invoiceId: selectedInvoice._id,
            //     client: id,
            //     payment_received: selectedInvoice.received_amount,
            // })


            alert("Invoice updated successfully!");
            await getData();
            setModalOpen(false);
        } catch (error) {
            console.error("Error updating invoice:", error);
            alert("Failed to update invoice.");
        }
    };


    const updateTotalAndGrandTotal = (updatedItems) => {
        const updatedItemsWithTotal = updatedItems.map(item => ({
            ...item,
            total: (parseFloat(item.item_price) || 0) * (parseFloat(item.item_quantity) || 0)
        }));
        const grandTotal = updatedItemsWithTotal.reduce((sum, item) => sum + item.total, 0);

        setSelectedInvoice((prev) => ({
            ...prev,
            items: updatedItemsWithTotal,
            grandTotal,
            balance_due_amount: grandTotal - (prev.received_amount || 0)
        }));
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const updatedItems = [...selectedInvoice.items];
        updatedItems[index] = { ...updatedItems[index], [name]: value };
        updateTotalAndGrandTotal(updatedItems);
    };

    const removeItem = (index) => {
        const updatedItems = selectedInvoice.items.filter((_, i) => i !== index);
        updateTotalAndGrandTotal(updatedItems);
    };

    const addNewItem = () => {
        const newItem = {
            item_name: "",
            item_price: 0,
            item_quantity: 1,
            truck_no: "",
            item_weight: 0,
            total: 0
        };
        updateTotalAndGrandTotal([...selectedInvoice.items, newItem]);
    };

    const handleAmountChange = (e) => {
        const received_amount = parseFloat(e.target.value) || 0;
        setSelectedInvoice((prev) => ({
            ...prev,
            received_amount,
            balance_due_amount: (prev.grandTotal - totalReceivedAmount) - received_amount
        }));
    };

    return (
        <>
            <div className="container">


                <div className="container fill-emerald-50 flex flex-col sm:flex-row px-4 sm:px-6 lg:px-8 justify-between items-center gap-4">
                    {invoices.length > 0 ? <div className="w-full sm:w-auto text-center sm:text-left">
                        <p className="bg-gradient-to-r from-pink-500 to-red-500 hover:bg-pink-700 text-white p-4 rounded-lg text-lg font-bold shadow-md">
                            Client Name: {invoices.length > 0 ? invoices[0].client.name : "Client Name"}
                        </p>
                    </div> : ""

                    }

                    <div>
                        <button
                            type="button"
                            onClick={() => setIsAddClientOpen(true)}
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:bg-indigo-600 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 text-white font-semibold rounded-lg text-sm px-6 py-3 shadow-lg transition-all w-full sm:w-auto"
                        >
                            + Add Invoice
                        </button>
                    </div>
                </div>

                {isAddClientOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
                        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
                            <h3 className="text-xl font-semibold text-gray-900">Add New Client</h3>
                            <AddInvoice onClose={() => setIsAddClientOpen(false)} client={id} getData={getData} />
                            <button onClick={() => setIsAddClientOpen(false)} className="mt-4 bg-gray-200 text-gray-900 px-5 py-2.5 rounded-lg hover:bg-gray-300">
                                Close
                            </button>
                        </div>
                    </div>
                )}

                <div className="h-[75vh]">
                    <h2>Invoice List</h2>
                    {invoices.length > 0 ? (
                        invoices.map((invoice) => (
                            <Invoiceitem key={invoice._id} invoice={invoice} getData={getData} updateInvoice={() => openModal(invoice)} />
                        ))
                    ) : (
                        <p>No invoices available</p>
                    )}
                </div>


                {invoices.length > 0 && (
                    <div className="flex  justify-center  sticky p-4 rounded-lg ">
                        <div className="flex">
                            <button className="text-white w-50 bg-gradient-to-r from-red-400 to-red-600 font-medium rounded-lg text-sm px-5 py-2.5 mr-4">
                                Due Balance Amount: ₹ {total_due_amount.toFixed(2)}


                            </button>
                        </div>
                        <div className="flex">

                            <button onClick={() => paymentopenModal()} className="text-white w-50 bg-gradient-to-r from-teal-400 to-teal-600 font-medium rounded-lg text-sm px-5 py-2.5">
                                Received Amount
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* edit modal */}
            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Edit Invoice">
                <div className="overflow-y-auto p-4">
                    <form onSubmit={handleUpdateInvoice} className="space-y-4">
                        {selectedInvoice?.items?.map((item, index) => (
                            <div key={index} className="grid grid-cols-1 gap-4 items-end">
                                <input type="text" name="item_name" value={item.item_name} onChange={(e) => handleItemChange(index, e)} className="border rounded-lg px-3 py-2 w-full" placeholder="Item Name" />
                                <input type="number" name="item_price" value={item.item_price} onChange={(e) => handleItemChange(index, e)} className="border rounded-lg px-3 py-2 w-full" placeholder="Price" />
                                <input type="number" name="item_quantity" value={item.item_quantity} onChange={(e) => handleItemChange(index, e)} className="border rounded-lg px-3 py-2 w-full" placeholder="Quantity" />
                                <input type="text" name="truck_no" value={item.truck_no} onChange={(e) => handleItemChange(index, e)} className="border rounded-lg px-3 py-2 w-full" placeholder="Truck No" />
                                <input type="text" value={`₹ ${(item.total || 0).toFixed(2)}`} readOnly className="border bg-gray-100 rounded-lg px-3 py-2 w-full" />
                                <button type="button" onClick={() => removeItem(index)} className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 w-full">Remove</button>
                            </div>
                        ))}
                        <button type="button" onClick={addNewItem} className="bg-green-500 text-white px-4 py-2 rounded-lg w-full">
                            + Add Item
                        </button>
                       
                         <div className="text-lg font-bold">Grand Total: ₹ {selectedInvoice?.grandTotal.toFixed(2)}</div>
                        <div className="text-lg font-bold text-green-600">Total Received: ₹ {totalReceivedAmount.toFixed(2)}</div>
                        <div className="text-lg font-bold">Balance Due: ₹ {(selectedInvoice?.grandTotal - totalReceivedAmount).toFixed(2)}</div>
                        <button type="submit" onClick={(e) => {
                            e.preventDefault();
                            if (window.confirm("If you update this invoice, your previous payment data will be erased and new data with the total received amount will be stored. Do you want to continue?")) {
                                handleUpdateInvoice(e); // Call the submit function if confirmed
                            }
                        }} className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full">Update Invoice</button>
                        {/* <p className="text-red-500">(Note: If you update this invoice, your previous payment data will be erased and new data with the total received amount will be stored)</p> */}
                    </form>
                </div>
            </Modal>

        {/* enter Amount modal */}
        <Modal isOpen={isAmountModal} onClose={() => setIsAmountModal(false)} title="Enter Amount">

            <div className="overflow-y-auto p-4">
               < input type="number" name="enteramout"   className="border rounded-lg px-3 py-2 w-full" placeholder="Enter Amount" />
                </div>
                <button onClick={() => setIsAmountModal(false)}>close</button>


        </Modal>





            {/* //payment modal */}

            <Modal isOpen={isPaymentModal} onClose={() => setPaymentModal(false)} title="payment Invoice">
                <div className="p-4 max-h-[70vh] overflow-y-auto">
                    <form onSubmit={handlePaymentUpdate} className="space-y-4">
                        {isPaymentInvoice.map((invoice, index) => (
                            <div key={invoice.id} className="border-b pb-4 mb-4">
                                <h3 className="text-lg font-bold">#{invoice.invoiceNumber}</h3>
                                <p>Grand Total: ₹ {invoice.grandTotal.toFixed(2)}</p>
                                <p>Balance Due: ₹ {invoice.balance_due_amount.toFixed(2)}</p>

                                <input
                                    type="number"
                                    name="received_amount"
                                    value={invoice.received_amount}
                                    onChange={(e) => handlePaymentChange(index, e)}
                                    className="border px-3 py-2 w-full mt-2"
                                    placeholder="Received Amount"
                                />
                                <p>New Balance Due: ₹ {invoice.new_balance_due_amount}</p>
                            </div>
                        ))}
                        <div className="flex justify-end mt-4">
                            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">Update Payments</button>
                            <button onClick={() => setPaymentModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded-lg ml-2">Close</button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
};

export default Page;
