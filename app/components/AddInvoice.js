"use client";
import React, { useState, useEffect } from "react";
import { ADDinvoice, savePaymentHistory } from "@/app/api/actions/invoiceactions";
import { saveReceivedAmount } from "../api/actions/receivedamount";



const AddInvoice = ({ client, getData, onClose }) => {
    const [formData, setFormData] = useState({
        client: client || "",
        user: typeof window !== "undefined" ? sessionStorage.getItem("id") : "",
        items: [{ item_name: "", item_price: 0, item_quantity: 1, truck_no: "", item_weight: 0, total: 0 }],
        grandTotal: 0,
        received_amount: 0,
        balance_due_amount: 0,
    });

    useEffect(() => {
        // Ensure user ID is set correctly
        if (typeof window !== "undefined") {
            setFormData((prev) => ({ ...prev, user: sessionStorage.getItem("id") || "" }));
        }
    }, []);

    const updateGrandTotal = (items) => {
        return items.reduce((sum, item) => sum + item.total, 0);
    };

    const handleChange = (e, index = null) => {
        const { name, value } = e.target;
        const numericValue = name.includes("price") || name.includes("quantity") || name.includes("weight") || name.includes("received_amount")
            ? Number(value) || 0
            : value;

        if (index !== null) {
            const updatedItems = [...formData.items];
            updatedItems[index] = {
                ...updatedItems[index],
                [name]: numericValue,
            };
            updatedItems[index].total = updatedItems[index].item_price * updatedItems[index].item_quantity;
            const newGrandTotal = updateGrandTotal(updatedItems);
            setFormData((prev) => ({
                ...prev,
                items: updatedItems,
                grandTotal: newGrandTotal,
                balance_due_amount: Math.max(newGrandTotal - prev.received_amount, 0),
            }));
        } else {
            setFormData((prev) => {
                const updatedForm = { ...prev, [name]: numericValue };
                updatedForm.balance_due_amount = Math.max(updatedForm.grandTotal - updatedForm.received_amount, 0);
                return updatedForm;
            });
        }
    };

    const addItem = () => {
        const newItem = { item_name: "", item_price: 0, item_quantity: 1, truck_no: "", item_weight: 0, total: 0 };
        setFormData((prev) => {
            const updatedItems = [...prev.items, newItem];
            return {
                ...prev,
                items: updatedItems,
                grandTotal: updateGrandTotal(updatedItems),
                balance_due_amount: Math.max(updateGrandTotal(updatedItems) - prev.received_amount, 0),
            };
        });
    };

    const removeItem = (index) => {
        setFormData((prev) => {
            const updatedItems = prev.items.filter((_, i) => i !== index);
            return {
                ...prev,
                items: updatedItems,
                grandTotal: updateGrandTotal(updatedItems),
                balance_due_amount: Math.max(updateGrandTotal(updatedItems) - prev.received_amount, 0),
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // ✅ Create Invoice
            const invoice = await ADDinvoice(formData);

            if (invoice && invoice._id) {  // ✅ Ensure invoice is created and has an ID
                alert("Invoice stored successfully!");
                getData(); // Refresh data
                onClose(); // Close the form

                // ✅ Now save received payment against the newly created invoice
                await saveReceivedAmount({
                    invoiceId: invoice._id,  // Use the returned invoice ID
                    client: formData.client,
                    payment_received: formData.received_amount,
                });


                await savePaymentHistory({
                    invoiceId: invoice._id,
                    client: formData.client,
                    grandTotal: formData.grandTotal,
                    previous_due_amount: 0,
                    updated_due_amount: parseFloat(formData.grandTotal - formData.received_amount),
                    payment_received: formData.received_amount,
                });


            } else {
                alert("Failed to store invoice.");
            }
        } catch (error) {
            console.error("Error saving invoice:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 border rounded-lg shadow-lg bg-white max-w-3xl mx-auto">
            <div className="mb-4 hidden">
                <label className="text-sm font-medium text-gray-700">Client ID</label>
                <input type="text" name="client" value={formData.client} readOnly className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-600 shadow-sm" />
            </div>
            {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center border-b pb-3">
                    <input type="text" name="item_name" value={item.item_name} onChange={(e) => handleChange(e, index)} placeholder="Item Name" className="border rounded-lg px-3 py-2 w-full" required />
                    <input type="number" name="item_price" value={item.item_price} onChange={(e) => handleChange(e, index)} placeholder="Price" className="border rounded-lg px-3 py-2 w-full" required />
                    <input type="number" name="item_quantity" value={item.item_quantity} onChange={(e) => handleChange(e, index)} placeholder="Quantity" className="border rounded-lg px-3 py-2 w-full" required />
                    <input type="text" name="truck_no" value={item.truck_no} onChange={(e) => handleChange(e, index)} placeholder="Truck No" className="border rounded-lg px-3 py-2 w-full" />
                    <input type="number" name="item_weight" value={item.item_weight} onChange={(e) => handleChange(e, index)} placeholder="Weight" className="border rounded-lg px-3 py-2 w-full" />
                    <div className="text-center font-bold text-green-600">₹ {item.total.toFixed(2)}</div>
                    <button type="button" onClick={() => removeItem(index)} className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all">Remove</button>
                </div>
            ))}
            <div className="flex justify-center my-4">
                <button type="button" onClick={addItem} className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition-all">+ Add Another Item</button>
            </div>
            <div className="mt-6 text-xl font-bold text-center text-gray-800">Grand Total: ₹ {formData.grandTotal.toFixed(2)}</div>
            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Received Amount</label>
                <input type="number" name="received_amount" value={formData.received_amount} onChange={handleChange} className="border rounded-lg px-3 py-2 w-full" required />
            </div>
            <div className="mt-4 text-xl font-bold text-center text-red-600">Balance Due: ₹ {formData.balance_due_amount.toFixed(2)}</div>
            <div className="flex justify-center mt-6">
                <button type="submit" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all shadow-lg">Submit Invoice</button>
            </div>
        </form>
    );
};

export default AddInvoice;
