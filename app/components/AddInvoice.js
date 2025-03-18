"use client";
import React, { useState } from "react";
import { ADDinvoice } from "@/app/api/actions/invoiceactions";

const AddInvoice = ({ client, getData,onClose }) => {
    const [formData, setFormData] = useState({
        client: client || "", // Ensure it's properly set
        items: [{ item_name: "", item_price: 0, item_quantity: 1, truck_no: "", item_weight: 0, total: 0 }],
        grandTotal: 0,
    });

    const updateGrandTotal = (items) => {
        return items.reduce((sum, item) => sum + item.total, 0);
    };

    const handleChange = (e, index = null) => {
        const { name, value } = e.target;
        const numericValue = name.includes("price") || name.includes("quantity") || name.includes("weight") ? Number(value) : value;

        if (index !== null) {
            const updatedItems = [...formData.items];
            updatedItems[index] = { 
                ...updatedItems[index], 
                [name]: numericValue 
            };

            // ✅ Ensure `total` is correctly calculated
            updatedItems[index].total = updatedItems[index].item_price * updatedItems[index].item_quantity;

            const newGrandTotal = updateGrandTotal(updatedItems);
            setFormData({ ...formData, items: updatedItems, grandTotal: newGrandTotal });
        } else {
            setFormData({ ...formData, [name]: numericValue });
        }
    };

    const addItem = () => {
        const newItem = { item_name: "", item_price: 0, item_quantity: 1, truck_no: "", item_weight: 0, total: 0 };
        setFormData((prev) => ({
            ...prev,
            items: [...prev.items, newItem],
        }));
    };

    const removeItem = (index) => {
        const updatedItems = formData.items.filter((_, i) => i !== index);
        const newGrandTotal = updateGrandTotal(updatedItems);
        setFormData({ ...formData, items: updatedItems, grandTotal: newGrandTotal });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const invoice = await ADDinvoice(formData);
            if (invoice) {
                alert("Invoice stored successfully!");
                getData();
                onClose();
            } else {
                alert("Failed to store invoice.");
            }
        } catch (error) {
            console.error("Error saving invoice:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 border rounded-lg shadow-lg">
            <div>
                <label className="block text-gray-700">Client ID:</label>
                <input type="text" name="client" value={formData.client} readOnly className="w-full border rounded-lg px-3 py-2 bg-gray-200" />
            </div>

            <h3 className="mt-4 font-bold">Items</h3>
            {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-7 gap-2 items-center border-b pb-2 mb-2">
                    <input type="text" name="item_name" value={item.item_name} onChange={(e) => handleChange(e, index)} placeholder="Item Name" className="border rounded-lg px-2 py-1" required />
                    <input type="number" name="item_price" value={item.item_price} onChange={(e) => handleChange(e, index)} placeholder="Price" className="border rounded-lg px-2 py-1" required />
                    <input type="number" name="item_quantity" value={item.item_quantity} onChange={(e) => handleChange(e, index)} placeholder="Quantity" className="border rounded-lg px-2 py-1" required />
                    <input type="text" name="truck_no" value={item.truck_no} onChange={(e) => handleChange(e, index)} placeholder="Truck No" className="border rounded-lg px-2 py-1" />
                    <input type="number" name="item_weight" value={item.item_weight} onChange={(e) => handleChange(e, index)} placeholder="Weight" className="border rounded-lg px-2 py-1" />
                    <span className="text-green-600 font-bold">₹ {item.total.toFixed(2)}</span>
                    <button type="button" onClick={() => removeItem(index)} className="bg-red-500 text-white px-3 py-1 rounded-lg">Remove</button>
                </div>
            ))}

            <button type="button" onClick={addItem} className="bg-green-500 text-white px-4 py-2 my-2 rounded-lg">Add Another Item</button>
            <div className="mt-4 text-xl font-bold">
                Grand Total: <span className="text-blue-600">₹ {formData.grandTotal.toFixed(2)}</span>
            </div>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 my-2 rounded-lg">Submit Invoice</button>
        </form>
    );
};

export default AddInvoice;
