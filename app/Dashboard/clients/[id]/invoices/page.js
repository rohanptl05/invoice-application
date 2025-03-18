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
    const [selectedInvoice, setSelectedInvoice] = useState({ client: {}, items: [], grandTotal: 0 });

    useEffect(() => {
        if (!session) {
            router.push("/");
        } else {
            getData();
        }
    }, [id, session, router]);

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

    const openModal = (type, invoice = null) => {
        setModalType(type);
        setSelectedInvoice(invoice || { client: {}, items: [], grandTotal: 0 });
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
        setSelectedInvoice((prev) => ({ ...prev, items: updatedItemsWithTotal, grandTotal }));
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
        const newItem = { item_name: "", item_price: 0, item_quantity: 1, truck_no: "", item_weight: 0, total: 0 };
        updateTotalAndGrandTotal([...selectedInvoice.items, newItem]);
    };

    return (
        <>
            <div>
                <button className="bg-amber-500 p-2 text-white rounded" onClick={() => setIsAddClientOpen(true)}>+ Add Invoice</button>
            </div>

            {isAddClientOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
                        <h3 className="text-xl font-semibold text-gray-900">Add New Client</h3>
                        <AddInvoice onClose={() => setIsAddClientOpen(false)} client={id} getData={getData} />
                        <button onClick={() => setIsAddClientOpen(false)} className="mt-4 bg-gray-200 text-gray-900 px-5 py-2.5 rounded-lg hover:bg-gray-300">Close</button>
                    </div>
                </div>
            )}

            <div>
                <h2>Invoice List</h2>
                {invoices.length > 0 ? (
                    invoices.map((invoice) => (
                        <Invoiceitem key={invoice._id} invoice={invoice} updateInvoice={() => openModal("edit", invoice)} />
                    ))
                ) : (
                    <p>No invoices available</p>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Edit Invoice">
    <div className=" overflow-y-auto p-4">
        <form onSubmit={handleUpdateInvoice} className="space-y-4">
            {selectedInvoice.items?.map((item, index) => (
                <div key={index} className="grid grid-cols-1  gap-4 items-end">
                    <input type="text" name="item_name" value={item.item_name} onChange={(e) => handleItemChange(index, e)} className="border rounded-lg px-3 py-2 w-full" placeholder="Item Name" />
                    <input type="number" name="item_price" value={item.item_price} onChange={(e) => handleItemChange(index, e)} className="border rounded-lg px-3 py-2 w-full" placeholder="Price" />
                    <input type="number" name="item_quantity" value={item.item_quantity} onChange={(e) => handleItemChange(index, e)} className="border rounded-lg px-3 py-2 w-full" placeholder="Quantity" />
                    <input type="text" name="truck_no" value={item.truck_no} onChange={(e) => handleItemChange(index, e)} className="border rounded-lg px-3 py-2 w-full" placeholder="Truck No" />
                    <input type="number" name="item_weight" value={item.item_weight} onChange={(e) => handleItemChange(index, e)} className="border rounded-lg px-3 py-2 w-full" placeholder="Weight" />
                    <input type="text" value={`₹ ${(item.total || 0).toFixed(2)}`} readOnly className="border bg-gray-100 rounded-lg px-3 py-2 w-full" />
                    <button type="button" onClick={() => removeItem(index)} className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 w-full">Remove</button>
                </div>
            ))}
            <div className="text-lg font-bold">Grand Total: ₹ {selectedInvoice.grandTotal.toFixed(2)}</div>
            <div className="flex justify-between">
                <button type="button" onClick={addNewItem} className="bg-green-500 text-white px-4 py-2 m-1 rounded-lg">Add Item</button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg m-1">Update Invoice</button>
            </div>
        </form>
    </div>
</Modal>

        </>
    );
};

export default Page;
