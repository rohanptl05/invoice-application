"use client"; // Required for client-side rendering

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchInvoice, editInvoice } from "@/app/api/actions/invoiceactions";
import Invoiceitem from "@/app/components/Invoiceitem";
import Modal from "@/app/components/Modal";
import AddInvoice from "@/app/components/AddInvoice";

const Page = () => {
    const { data: session } = useSession();
    const { id } = useParams(); // Client ID
    const router = useRouter();

    const [invoices, setInvoices] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isAddClientOpen, setIsAddClientOpen] = useState(false);
    const [modalType, setModalType] = useState("");
    const [total_due_amout, setTotalDueAmount] = useState(0);
    // const [selectedInvoice, setSelectedInvoice] = useState({ client: {}, items: [], grandTotal: 0 });
    const [selectedInvoice, setSelectedInvoice] = useState({ client: {}, items: [], grandTotal: 0, received_amount: 0, balance_due_amount: 0 });


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




    const getData = async () => {
        if (!id) {
            console.error("Client ID not found");
            return;
        }
        try {
            const clientData = await fetchInvoice(id);
            if (clientData) {
                setInvoices(clientData);
                if (invoices) {
                    await console.log(invoices)
                }

            } else {
                console.error(clientData.error || "No invoices found");
            }
        } catch (error) {
            console.error("Error fetching invoices:", error);
        }
    };

    // const openModal = (type, invoice = null) => {
    //     setModalType(type);
    //     setSelectedInvoice(invoice || { client: {}, items: [], grandTotal: 0 });
    //     setModalOpen(true);
    // };
    const openModal = (type, invoice = null) => {
        setModalType(type);
        setSelectedInvoice(invoice || { client: {}, items: [], grandTotal: 0, received_amount: 0, balance_due_amount: 0 });
        setModalOpen(true);
    };

    const handleUpdateInvoice = async (e) => {
        e.preventDefault();
        try {
            await editInvoice(selectedInvoice._id, selectedInvoice);
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
            total: item.item_price * item.item_quantity
        }));
        const grandTotal = updatedItemsWithTotal.reduce((sum, item) => sum + item.total, 0);
        const balance_due_amount = grandTotal - selectedInvoice.received_amount;
        setSelectedInvoice((prev) => ({ ...prev, items: updatedItemsWithTotal, grandTotal, balance_due_amount }));
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
        const newItem = { item_name: "", item_price: 0, item_quantity: 1, truck_no: "", received_amount: 0, item_weight: 0, total: 0 };
        updateTotalAndGrandTotal([...selectedInvoice.items, newItem]);
    };
    const handleAmountChange = (e) => {
        const received_amount = parseFloat(e.target.value) || 0;
        const balance_due_amount = selectedInvoice.grandTotal - received_amount;
        setSelectedInvoice((prev) => ({ ...prev, received_amount, balance_due_amount }));
    };

    return (
        <>
            {/* Client Info Section */}
            <div className="container">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 justify-between">

                    <div className="flex">
                        <p className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-lg my-2 text-lg font-bold shadow-md text-center sm:text-left">
                            Client Name : {invoices.length > 0 ? invoices[0].client.name : "Client Name"}
                        </p>
                    </div>

                    {/* Add Invoice Button */}
                    <div className="flex  sm:justify-start">
                        <button
                            type="button"
                            onClick={() => setIsAddClientOpen(true)}
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:bg-indigo-600 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 text-white font-semibold rounded-lg text-sm px-6 py-3 shadow-lg transition-all"
                        >
                            + Add Invoice
                        </button>
                    </div>
                </div>

                {/* Add Invoice Modal */}
                {isAddClientOpen && (
                    <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 z-50">
                        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Client</h3>
                            <AddInvoice onClose={() => setIsAddClientOpen(false)} client={id} getData={getData} />
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => setIsAddClientOpen(false)}
                                    className="bg-gray-300 text-gray-900 px-5 py-2.5 rounded-lg hover:bg-gray-400"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Invoice List */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                    <h2 className="text-xl font-bold text-gray-800 border-b-2 pb-2 mb-4">Invoice List</h2>
                    {invoices.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {invoices.map((invoice) => (
                                <Invoiceitem key={invoice._id} invoice={invoice} updateInvoice={() => openModal("edit", invoice)} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center">No invoices available</p>
                    )}
                </div>



                {/* // button of credit and debit */}
                {invoices.length > 0 && (
                <div className="flex justify-center bg-amber-300 m-auto p-4 rounded-lg">
                    <button className="text-white bg-gradient-to-r from-red-400 to-red-600 font-medium rounded-lg text-sm px-5 py-2.5 mr-4">
                        Due Balance Amount: ₹ {total_due_amout.toFixed(2)}
                    </button>
                    <button className="text-white bg-gradient-to-r from-teal-400 to-teal-600 font-medium rounded-lg text-sm px-5 py-2.5">
                        Received Amount
                    </button>
                </div>
            )}


            </div>

            {/* Edit Invoice Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Edit Invoice">
                <div className="overflow-y-auto p-4">
                    <form onSubmit={handleUpdateInvoice} className="space-y-4">
                        {selectedInvoice.items?.map((item, index) => (
                            <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                                <input type="text" name="item_name" value={item.item_name} onChange={(e) => handleItemChange(index, e)} className="border rounded-lg px-3 py-2 w-full focus:ring focus:ring-blue-300" placeholder="Item Name" />
                                <input type="number" name="item_price" value={item.item_price} onChange={(e) => handleItemChange(index, e)} className="border rounded-lg px-3 py-2 w-full focus:ring focus:ring-blue-300" placeholder="Price" />
                                <input type="number" name="item_quantity" value={item.item_quantity} onChange={(e) => handleItemChange(index, e)} className="border rounded-lg px-3 py-2 w-full focus:ring focus:ring-blue-300" placeholder="Quantity" />
                                <input type="text" name="truck_no" value={item.truck_no} onChange={(e) => handleItemChange(index, e)} className="border rounded-lg px-3 py-2 w-full focus:ring focus:ring-blue-300" placeholder="Truck No" />
                                <input type="number" name="item_weight" value={item.item_weight} onChange={(e) => handleItemChange(index, e)} className="border rounded-lg px-3 py-2 w-full focus:ring focus:ring-blue-300" placeholder="Weight" />
                                <input type="text" value={`₹ ${(item.total || 0).toFixed(2)}`} readOnly className="border bg-gray-100 rounded-lg px-3 py-2 w-full text-gray-600" />
                                <button type="button" onClick={() => removeItem(index)} className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 w-full transition">
                                    Remove
                                </button>

                            </div>
                        ))}
                        <div className="text-lg font-bold text-gray-800">Grand Total: ₹ {selectedInvoice.grandTotal.toFixed(2)}</div>
                        <input type="number" name="received_amount" value={selectedInvoice.received_amount} onChange={handleAmountChange} className="border rounded-lg px-3 py-2 w-full" placeholder="Received Amount" />
                        <div className="text-lg font-bold text-gray-800">Balance Due: ₹ {selectedInvoice.balance_due_amount.toFixed(2)}</div>

                        <div className="flex justify-between mt-4">
                            <button type="button" onClick={addNewItem} className="bg-green-500 text-white px-4 py-2 m-1 rounded-lg hover:bg-green-600 transition">Add Item</button>
                            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg m-1 hover:bg-blue-600 transition">Update Invoice</button>
                        </div>
                    </form>
                </div>
            </Modal>

        </>

    );
};

export default Page;
