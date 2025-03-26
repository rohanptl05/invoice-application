"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchInvoice, editInvoice } from "@/app/api/actions/invoiceactions";
import Invoiceitem from "@/app/components/Invoiceitem";
import Modal from "@/app/components/Modal";
import AddInvoice from "@/app/components/AddInvoice";
import {savePaymentHistory} from "@/app/api/actions/paymentHistory";

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
    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        try {
            for (const invoice of isPaymentInvoice) {
                await editInvoice(invoice.id, {
                    received_amount: Number(invoice.received_amount) || 0,
                    balance_due_amount: Number(invoice.balance_due_amount) || 0
                });
    
                // await savePaymentHistory({  // ✅ Ensure function exists
                //     invoiceId: invoice.id,
                //     client: invoice.client.name, // ✅ Access client name properly
                //     received_amount: Number(invoice.received_amount) || 0,
                //     balance_due_amount: Number(invoice.balance_due_amount) || 0,
                //     date: new Date().toISOString()
                // });
            }
            alert("Payments updated successfully!");
            await getData();
            setPaymentModal(false);
        } catch (error) {
            console.error("Error updating payments:", error);
            alert("Failed to update payments.");
        }
    };

    // const paymentopenModal = () => {
    //     setModalType("payment");
    //     const updatedInvoices = invoices.map(invoice => ({
    //         id: invoice._id,
    //         client: invoice.client.name,
    //         grandTotal: invoice.grandTotal,
    //         received_amount: invoice.received_amount || 0,
    //         balance_due_amount: invoice.balance_due_amount || 0
    //     }));
    //     setPaymentInvoice(updatedInvoices);
    //     setPaymentModal(true);
    // };

    const handleReceiveAmount = (index, e) => {
        const { value } = e.target;
        const received_amount = parseFloat(value) || 0;

        setPaymentInvoice(prevInvoices => prevInvoices.map((invoice, i) =>
            i === index ? {
                ...invoice,
                received_amount,
                balance_due_amount: invoice.grandTotal - received_amount
            } : invoice
        ));
    };
    const openPaymentModal = () => {
        const filteredInvoices = invoices
            .filter(invoice => invoice.balance_due_amount > 0)  // Only include invoices with due amount
            .map(invoice => ({
                id: invoice._id,
                client: invoice.client.name,
                grandTotal: invoice.grandTotal,
                received_amount: invoice.received_amount || 0,
                balance_due_amount: invoice.balance_due_amount || 0
            }));

        if (filteredInvoices.length === 0) {
            alert("No invoices with outstanding balance.");
            return;
        }

        setPaymentInvoice(filteredInvoices);
        setPaymentModal(true);
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

                            <button onClick={() => {
                                const hasDueAmount = invoices.some(invoice => invoice.balance_due_amount > 0);
                                if (hasDueAmount) {
                                    setPaymentInvoice(invoices.filter(invoice => invoice.balance_due_amount > 0)); // Filter invoices
                                    setPaymentModal(true);
                                } else {
                                    alert("No due amounts found.");
                                }
                            }}
                                className="text-white w-50 bg-gradient-to-r from-teal-400 to-teal-600 font-medium rounded-lg text-sm px-5 py-2.5">
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

            {/* {isPaymentModal && (
                <Modal isOpen={isPaymentModal} onClose={() => setPaymentModal(false)} title="Receive Payment">
                    <form onSubmit={handlePaymentSubmit}>
                        {isPaymentInvoice.map((invoice, index) => (
                            <div key={invoice.id} className="border-b pb-4 mb-4">
                                <h3>Client: {invoice.client}</h3>
                                <p>Grand Total: ₹ {invoice.grandTotal.toFixed(2)}</p>
                                <input type="number" value={invoice.received_amount} onChange={(e) => handleReceiveAmount(index, e)}
                                    className="border px-3 py-2 w-full" placeholder="Received Amount" />
                                <p>Balance Due: ₹ {invoice.balance_due_amount.toFixed(2)}</p>
                            </div>
                        ))}
                        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg w-full">
                            Update Payments
                        </button>
                    </form>
                </Modal>
            )} */}


{isPaymentModal && (
    <Modal isOpen={isPaymentModal} onClose={() => setPaymentModal(false)} title="Receive Payment">
        <form onSubmit={handlePaymentSubmit}>
            {isPaymentInvoice.map((invoice, index) => (
                <div key={invoice._id || invoice.id || `invoice-${index}`} className="border-b pb-4 mb-4">
                    <h3>Client: {invoice.invoiceNumber}</h3>
                    <p>Grand Total: ₹ {invoice.grandTotal.toFixed(2)}</p>

                    <input 
                        type="number" 
                        value={invoice.received_amount} 
                        onChange={(e) => handleReceiveAmount(index, e)}
                        className="border px-3 py-2 w-full" 
                        placeholder="Received Amount" 
                    />

                    <p>Balance Due: ₹ {invoice.balance_due_amount.toFixed(2)}</p>
                </div>
            ))}
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg w-full">
                Update Payments
            </button>
        </form>
    </Modal>
)}

        </>
    );
};

export default Page;




///tdfsdafsdfsdf

import mongoose from "mongoose";

const { Schema } = mongoose;

// ✅ Define Item Schema
const ItemSchema = new Schema(
    {
        item_name: { type: String, required: true },
        item_price: { type: Number, required: true, min: 0 },
        item_quantity: { type: Number, required: true, min: 1 },
        truck_no: { type: String, default: "N/A" },
        item_weight: { type: Number, default: 0 },
        total: { type: Number, required: true }, // ✅ Ensure this is item_price * item_quantity
    },
    { _id: false }
);

// ✅ Define Payment History Schema
const PaymentHistorySchema = new Schema(
    {
        invoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", required: true },
        client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
        previous_due_amount: { type: Number, required: true },
        updated_due_amount: { type: Number, required: true },
        previous_grandTotal:{type:Number},
        updated_grandTotal:{type:Number},
        payment_received: { type: Number, required: true, min: 0 },
        payment_date: { type: Date, default: Date.now },

    },
    { timestamps: true }
);

// ✅ Define Invoice Schema
const invoiceSchema = new Schema(
    {
        invoiceNumber: { type: Number, unique: true },
        client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        status: { type: String, default: "PENDING" },
        items: [ItemSchema],
        grandTotal: { type: Number, required: true, min: 0 },
        received_amount: { type: Number, required: true, min: 0 }, // ✅ Stored as Float
        balance_due_amount: { type: Number, required: true, min: 0, default: 0 }, // ✅ Stored as Float
        date: { type: Date, default: Date.now },
    },
    { timestamps: true }
);




invoiceSchema.pre("save", async function (next) {
    try {
        if (!this.invoiceNumber) {
            const lastInvoice = await this.constructor.findOne().sort({ invoiceNumber: -1 }).lean();
            this.invoiceNumber = lastInvoice?.invoiceNumber ? lastInvoice.invoiceNumber + 1 : 1;
        }

        const computedTotal = this.items.reduce((sum, item) => sum + item.total, 0);
        if (this.grandTotal !== computedTotal) {
            return next(new Error("Grand total does not match sum of item totals."));
        }

        this.grandTotal = parseFloat(this.grandTotal.toFixed(2));
        this.received_amount = parseFloat(this.received_amount.toFixed(2));

        let previousInvoice = null;
        let previous_due_amount = 0;
        let previous_received_amount = 0;
        let previous_grandTotal = 0;

        if (!this.isNew) {
            previousInvoice = await this.constructor.findById(this._id).lean();
            if (previousInvoice) {
                previous_due_amount = previousInvoice.balance_due_amount;
                previous_received_amount = previousInvoice.received_amount;
                previous_grandTotal = previousInvoice.grandTotal;
            }
        }

        // ✅ Update balance due
        this.balance_due_amount = parseFloat((this.grandTotal - this.received_amount).toFixed(2));
        this.balance_due_amount = Math.max(this.balance_due_amount, 0);

        // ✅ Set status dynamically
        this.status = this.balance_due_amount === 0 ? "PAID" : "PENDING";

        // ✅ Log Payment History when ANY amount-related field is updated
        if (
            this.isModified("grandTotal") ||
            this.isModified("received_amount") ||
            this.isModified("balance_due_amount")
        ) {
            await PaymentHistory.create({
                invoice: this._id,
                client: this.client,
                previous_due_amount,
                updated_due_amount: this.balance_due_amount,
                previous_grandTotal,
                updated_grandTotal: this.grandTotal,
                payment_received: this.received_amount - previous_received_amount,
                payment_date: new Date(),
            });
        }

        next();
    } catch (error) {
        console.error("Error in invoice pre-save middleware:", error);
        return next(error);
    }
});



// ✅ Create Models
const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
// const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
const PaymentHistory = mongoose.models.PaymentHistory || mongoose.model("PaymentHistory", PaymentHistorySchema);

export { Invoice, PaymentHistory };
