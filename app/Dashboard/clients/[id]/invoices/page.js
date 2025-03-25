"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchInvoice, editInvoice } from "@/app/api/actions/invoiceactions";
import Invoiceitem from "@/app/components/Invoiceitem";
import Modal from "@/app/components/Modal";
import AddInvoice from "@/app/components/AddInvoice";

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
            for (const invoice of isPaymentInvoice) {
                await editInvoice(invoice.id, {
                    received_amount: invoice.received_amount,
                    balance_due_amount: invoice.balance_due_amount
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
        setModalType("payment");
        const updatedInvoices = invoices.map(invoice => ({
            id: invoice._id,
            client: invoice.client.name,
            grandTotal: invoice.grandTotal,
            received_amount: invoice.received_amount || 0,
            balance_due_amount: invoice.balance_due_amount || 0
        }));
        setPaymentInvoice(updatedInvoices);
        setPaymentModal(true);
    };

    const handlePaymentChange = (index, e) => {
        const { value } = e.target;
        const received_amount = parseFloat(value) || 0;
    
        setPaymentInvoice(prevInvoices => prevInvoices.map((invoice, i) =>
            i === index ? { ...invoice } : invoice
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

    const openModal = (invoice) => {
        setSelectedInvoice(invoice ? { ...invoice } : null);
        setOriginalInvoice(invoice ? { ...invoice } : null);
        setModalOpen(true);
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

        if (Object.keys(updatedFields).length === 0) {
            alert("No changes detected!");
            return;
        }

        try {
            await editInvoice(selectedInvoice._id, updatedFields);
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
            balance_due_amount: prev.grandTotal - received_amount
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
                            <Invoiceitem key={invoice._id} invoice={invoice} updateInvoice={() => openModal(invoice)} />
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
                        <input type="number" name="received_amount" value={selectedInvoice?.received_amount} onChange={handleAmountChange} className="border rounded-lg px-3 py-2 w-full" />
                        <div className="text-lg font-bold">Balance Due: ₹ {selectedInvoice?.balance_due_amount.toFixed(2)}</div>
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full">Update Invoice</button>
                    </form>
                </div>
            </Modal>



            //payment modal

            <Modal isOpen={isPaymentModal} onClose={() => setModalOpen(false)} title="Edit Invoice">
                <div className="overflow-y-auto p-4 max-h-[70vh]">
                    <form onSubmit={handlePaymentUpdate} className="space-y-4">
                        {isPaymentInvoice.length > 0 ? (
                            isPaymentInvoice.map((invoice, index) => (
                                <div key={invoice.id} className="border-b pb-4 mb-4">
                                    <h3 className="text-lg font-bold text-gray-800">Client: {invoice.client}</h3>
                                    <p className="text-gray-700">Grand Total: ₹ {invoice.grandTotal.toFixed(2)}</p>

                                    <input
                                        type="number"
                                        name="received_amount"
                                        value={invoice.received_amount}
                                        onChange={(e) => handlePaymentChange(index, e)}
                                        className="border rounded-lg px-3 py-2 w-full mt-2"
                                        placeholder="Received Amount"
                                    />

                                    <p className="text-gray-700 mt-2">Balance Due: ₹ {invoice.balance_due_amount.toFixed(2)}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center">No invoices found</p>
                        )}

                        <div className="flex justify-end mt-4">
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
                                Update Payments
                            </button>
                            <button
                                onClick={() => { setPaymentModal(false); }}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
                                close
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
};

export default Page;
