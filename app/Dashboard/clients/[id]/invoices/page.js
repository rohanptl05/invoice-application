"use client";


import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchInvoice, editInvoice } from "@/app/api/actions/invoiceactions";
import Invoiceitem from "@/app/components/Invoiceitem";
import Modal from "@/app/components/Modal";
import AddInvoice from "@/app/components/AddInvoice";
import { saveReceivedAmount, fetchReceivedAmount } from "@/app/api/actions/receivedamountactions";
import { CldImage, CldUploadWidget } from "next-cloudinary";




const Page = () => {
    const { data: session } = useSession();
    const { id } = useParams();
    const router = useRouter();

    const [invoices, setInvoices] = useState([]);
    const [originalInvoices, setOriginalInvoices] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isAddClientOpen, setIsAddClientOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [originalInvoice, setOriginalInvoice] = useState(null);
    const [total_due_amount, setTotalDueAmount] = useState(0);
    const [isPaymentModal, setPaymentModal] = useState(false);
    const [isPaymentInvoice, setPaymentInvoice] = useState([]);
    const [totalReceivedAmount, setTotalReceivedAmount] = useState(0);
    const [isAmountModal, setIsAmountModal] = useState(false);
    const [remainingAmount, setRemainingAmount] = useState(0);
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [totalAmountSort, setTotalAmountSort] = useState("");
    const [dueAmountSort, setDueAmountSort] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
      const [publicId, setPublicId] = useState("");
        const [imageUrl, setImageUrl] = useState("");


    useEffect(() => {
        if (!session) {
            router.push("/");
        } else {
            getData();
        }
    }, [id, session, router]);




    // amout model

    const openAmountModal = () => {
        setTotalReceivedAmount(0);
        setRemainingAmount(0);
        setIsAmountModal(true);
    };

    const handleTotalAmountChange = (e) => {
        const enteredAmount = parseFloat(e.target.value) || 0;
        if (enteredAmount <= 0) {
            alert("Please enter a valid amount greater than zero.");
            return;
        }
        setTotalReceivedAmount(enteredAmount);
        setRemainingAmount(enteredAmount);
    };




    //payments
    const handlePaymentUpdate = async (e) => {
        e.preventDefault();

        if (remainingAmount > 0) {
            alert("Please allocate the full received amount before updating payments!");
            return;
        }
        if (remainingAmount < 0) {
            alert("remainingAmount amount cannot be negative!");
            return;
        }
        try {
            for (const invoice of isPaymentInvoice) {
                if (invoice.received_amount > 0) {
                    const updated_due_amount = invoice.balance_due_amount - invoice.received_amount;
                    const status = updated_due_amount <= 0 ? "PAID" : "PENDING";

                    await editInvoice(invoice.id, true, {
                        received_amount: invoice.received_amount,
                        balance_due_amount: updated_due_amount,
                        status,
                    });

                    await saveReceivedAmount("payment", {
                        invoiceId: invoice.id,
                        client: id,
                        payment_received: invoice.received_amount,
                    });


                }
                alert("Payments updated successfully!");
                await getData();
                setPaymentModal(false);
            }
        } catch (error) {
            console.error("Error updating payments:", error);
            alert("Failed to update payments.");
        }
    };




    const paymentopenModal = () => {
        if (totalReceivedAmount <= 0) {
            alert("Please enter a valid amount before proceeding.");
            return;
        }

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

        if (updatedInvoices.length === 0) {
            alert("No pending invoices available for payment.");
            return;
        }

        setPaymentInvoice(updatedInvoices);
        setIsAmountModal(false); // Close amount modal
        setPaymentModal(true); // Open payment modal
    };


    const handlePaymentChange = (index, e) => {
        let receivedAmount = parseFloat(e.target.value) || 0;

        if (receivedAmount > isPaymentInvoice[index].balance_due_amount) {
            alert("Received amount cannot exceed invoice due amount!");
            return;
        }

        if (receivedAmount < 0) {
            alert("Received amount cannot be negative!");
            return;
        }


        let newInvoices = [...isPaymentInvoice];
        newInvoices[index] = {
            ...newInvoices[index],
            received_amount: receivedAmount
        };

        setPaymentInvoice(newInvoices);

        const totalAllocated = newInvoices.reduce((sum, inv) => sum + inv.received_amount, 0);
        if ((totalReceivedAmount - totalAllocated) < 0) {
            alert("Total allocated amount exceeds received amount!");
            return;
        }
        setRemainingAmount(totalReceivedAmount - totalAllocated);
    };




    const getData = async () => {
        try {
            if (!id) {
                console.error("Client ID not found");
                return;
            }
            const clientData = await fetchInvoice(id, "active");
            if (Array.isArray(clientData)) {
                setOriginalInvoices(clientData);
                setInvoices(clientData);
                // console.log('rerr',clientData)
                const totalDue = clientData.reduce((sum, invoice) => sum + (invoice.balance_due_amount || 0), 0);
                setTotalDueAmount(totalDue);
            } else {
                setOriginalInvoices([]);
                setInvoices([]);
            }
        } catch (error) {
            console.error("Error fetching invoices:", error);
            setOriginalInvoices([]);
            setInvoices([]);
        }
    };

    const openModal = async (invoice) => {
        setSelectedInvoice(invoice ? { ...invoice } : null);
        setOriginalInvoice(invoice ? { ...invoice } : null);
        setModalOpen(true);

        if (invoice) {
            try {
                const paymentData = await fetchReceivedAmount(invoice._id, "active");
                // console.log("rrr",paymentData)
                if (!paymentData) {
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
            if (selectedInvoice.grandTotal === originalInvoice.grandTotal) {
                updatedFields.received_amount = totalReceivedAmount || 0;
                updatedFields.balance_due_amount = (selectedInvoice.grandTotal - totalReceivedAmount) || 0;
                // updatedFields.grandTotal = selectedInvoice.grandTotal;
            }
            if (selectedInvoice.grandTotal !== originalInvoice.grandTotal) {
                updatedFields.received_amount = totalReceivedAmount || 0;
                updatedFields.balance_due_amount = selectedInvoice.grandTotal - totalReceivedAmount || 0;
                updatedFields.grandTotal = selectedInvoice.grandTotal;
            }

            await editInvoice(selectedInvoice._id, trigger, updatedFields);


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

    const handleFilterChange = (e, type) => {
        const value = e.target.value;

        if (type === "status") setSelectedStatus(value);
        if (type === "totalAmount") setTotalAmountSort(value);
        if (type === "dueAmount") setDueAmountSort(value);
        if (type === "from") setFromDate(value);
        if (type === "to") setToDate(value);
    };

    useEffect(() => {
        if (!originalInvoices) return;

        let filteredInvoices = [...originalInvoices];

        // Status Filter
        if (selectedStatus !== "all") {
            filteredInvoices = filteredInvoices.filter(invoice => invoice.status === selectedStatus);
        }


        // Date Filter — only if both are set
        if (fromDate && toDate) {
            const from = new Date(`${fromDate}T00:00:00`);
            const to = new Date(`${toDate}T23:59:59`);

            filteredInvoices = filteredInvoices.filter(invoice => {
                const invoiceDate = new Date(invoice.date);
                return invoiceDate >= from && invoiceDate <= to;
            });
        }


        // Sorting by Total Amount
        if (totalAmountSort === "Low") {
            filteredInvoices.sort((a, b) => a.grandTotal - b.grandTotal);
        } else if (totalAmountSort === "High") {
            filteredInvoices.sort((a, b) => b.grandTotal - a.grandTotal);
        }

        // Sorting by Due Amount
        if (dueAmountSort === "Low") {
            filteredInvoices.sort((a, b) => a.balance_due_amount - b.balance_due_amount);
        } else if (dueAmountSort === "High") {
            filteredInvoices.sort((a, b) => b.balance_due_amount - a.balance_due_amount);
        }

        setInvoices(filteredInvoices);
    }, [selectedStatus, totalAmountSort, dueAmountSort, originalInvoices, fromDate, toDate]);



    const itemsPerPage = 6; // Set the number of items per page
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const paginatedInvoices = (Array.isArray(invoices) ? invoices : []).slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil((Array.isArray(invoices) ? invoices.length : 0) / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return (
        <>
            <div className="container h-screen ">


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

                <div className="min-h-[70vh] overflow-x-auto p-4 shadow-md rounded-lg mt-4">
                    <h2 className="m-1 text-2xl">Invoice List</h2>
                    <div className="container mb-4">
                        {/* //filtters */}
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <label htmlFor="status" className="text-sm font-medium text-gray-700">Filter by Status:</label>
                                <select id="status" className="border rounded-lg px-3 py-2" onChange={(e) => handleFilterChange(e, "status")}>
                                    <option value="all">All</option>
                                    <option value="PAID">Paid</option>
                                    <option value="PENDING">Pending</option>
                                </select>
                            </div>


                            {/* to between date filter */}
                            <div>
                                <label htmlFor="from" className="text-sm font-medium text-gray-700">From:</label>
                                <input type="date" id="from" className="border rounded-lg px-3 py-2" onChange={(e) => handleFilterChange(e, "from")} />
                                <label htmlFor="to" className="text-sm font-medium text-gray-700"> to:</label>
                                <input type="date" id="to" className="border rounded-lg px-3 py-2" disabled={!fromDate} onChange={(e) => handleFilterChange(e, "to")} />
                            </div>

                            {/* Total Amount Sort */}
                            <div className="flex items-center gap-2">
                                <label htmlFor="amount" className="text-sm font-medium text-gray-700">Total Amount</label>
                                <select id="amount" className="border rounded-lg px-3 py-2" onChange={(e) => handleFilterChange(e, "totalAmount")}>
                                    <option value="">None</option>
                                    <option value="Low">Low to High</option>
                                    <option value="High">High to Low</option>
                                </select>
                            </div>

                            {/* Due Amount Sort */}
                            <div className="flex items-center gap-2">
                                <label htmlFor="dueamount" className="text-sm font-medium text-gray-700">Due Amount</label>
                                <select id="dueamount" className="border rounded-lg px-3 py-2" onChange={(e) => handleFilterChange(e, "dueAmount")}>
                                    <option value="">None</option>
                                    <option value="Low">Low to High</option>
                                    <option value="High">High to Low</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <hr className="m-1" />

                    {invoices && invoices.length > 0 ? (
                        <div className="w-full overflow-x-auto  shadow-md rounded-lg">
                            <table className="w-full border-collapse min-w-[600px] text-center">
                                <thead className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 uppercase text-sm tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3 border-b">Invoice #</th>
                                        <th className="px-6 py-3 border-b">Date</th>
                                        <th className="px-6 py-3 border-b">Status</th>
                                        <th className="px-6 py-3 border-b">Total</th>
                                        <th className="px-6 py-3 border-b">Due Amount</th>
                                        <th className="px-6 py-3 border-b">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedInvoices.map((invoice) => (
                                        <Invoiceitem key={invoice._id} invoice={invoice} getData={getData} updateInvoice={openModal} />
                                        // <Invoiceitem key={invoice._id} invoice={invoice}  updateInvoice={openModal} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">No invoices available</p>
                    )
                    }
                </div>


                {/* paginations button */}
                <div className="flex justify-center items-center gap-2 mt-4">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                        Prev
                    </button>

                    {[...Array(totalPages)].map((_, pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum + 1)}
                            className={`px-3 py-1 rounded ${currentPage === pageNum + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                            {pageNum + 1}
                        </button>
                    ))}

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>



                {invoices.length > 0 && (
                    <div className="flex  justify-center  sticky p-4 rounded-lg ">
                        <div className="flex">
                            <button className="text-white w-50 bg-gradient-to-r from-red-400 to-red-600 font-medium rounded-lg text-sm px-5 py-2.5 mr-4">
                                Due Balance Amount: ₹ {total_due_amount.toFixed(2)}


                            </button>
                        </div>
                        <div className="flex">

                            {/* <button onClick={() => paymentopenModal()} className="text-white w-50 bg-gradient-to-r from-teal-400 to-teal-600 font-medium rounded-lg text-sm px-5 py-2.5"> */}
                            <button onClick={openAmountModal} className="text-white w-50 bg-gradient-to-r from-teal-400 to-teal-600 font-medium rounded-lg text-sm px-5 py-2.5">
                                Received Amount
                            </button>

                        </div>
                    </div>
                )}
            </div>

            {/* edit modal */}
            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Edit Invoice">
                <div className="overflow-y-auto p-4">
                    <form onSubmit={handleUpdateInvoice} className="space-y-6">

                        {/* Invoice Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                            <div>
                                <label className="block mb-2">
                                    <span className="text-gray-700"> Date</span>
                                    <input
                                        type="date"
                                        name="payment_date"
                                        value={
                                            selectedInvoice?.date
                                                ? new Date(selectedInvoice.date).toISOString().split("T")[0] // ✅ Correct format
                                                : ""
                                        }
                                        onChange={(e) => {
                                            setSelectedInvoice((prev) => ({
                                                ...prev,
                                                date: e.target.value,
                                            }));


                                        }}
                                        className="w-full p-2 border rounded"
                                    />
                                </label>
                            </div>
                        </div>

                        <hr className="border-gray-300" />

                        {/* Invoice Items */}
                        <div className="space-y-6">
                            {selectedInvoice?.items?.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end border-b pb-4">

                                    <div>
                                        <label className="block text-gray-700 font-semibold">Item Name</label>
                                        <input
                                            type="text"
                                            name="item_name"
                                            value={item.item_name}
                                            onChange={(e) => handleItemChange(index, e)}
                                            className="border rounded-lg px-3 py-2 w-full"
                                            placeholder="Item Name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold">Price</label>
                                        <input
                                            type="number"
                                            name="item_price"
                                            value={item.item_price}
                                            onChange={(e) => handleItemChange(index, e)}
                                            className="border rounded-lg px-3 py-2 w-full"
                                            placeholder="Price"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold">Quantity</label>
                                        <input
                                            type="number"
                                            name="item_quantity"
                                            value={item.item_quantity}
                                            onChange={(e) => handleItemChange(index, e)}
                                            className="border rounded-lg px-3 py-2 w-full"
                                            placeholder="Quantity"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold">Truck No</label>
                                        <input
                                            type="text"
                                            name="truck_no"
                                            value={item.truck_no}
                                            onChange={(e) => handleItemChange(index, e)}
                                            className="border rounded-lg px-3 py-2 w-full"
                                            placeholder="Truck No"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold">Total</label>
                                        <input
                                            type="text"
                                            value={`₹ ${(item.total || 0).toFixed(2)}`}
                                            readOnly
                                            className="border bg-gray-100 rounded-lg px-3 py-2 w-full"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 w-full"
                                    >
                                        Remove
                                    </button>

                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addNewItem}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg w-full"
                        >
                            + Add Item
                        </button>

                        <hr className="border-gray-300" />

                        {/* Summary */}
                        <div className="space-y-2 text-lg font-bold">
                            <div className="flex justify-between">
                                <span>Grand Total:</span>
                                <span>₹ {selectedInvoice?.grandTotal.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between text-green-600">
                                <span>Total Received:</span>
                                <span>₹ {totalReceivedAmount.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between">
                                <span>Balance Due:</span>
                                <span>₹ {(selectedInvoice?.grandTotal - totalReceivedAmount).toFixed(2)}</span>
                            </div>
                        </div>

                          <div className="mt-4 text-center">
                                            {/* <label className="block text-sm font-medium text-gray-700 mb-2">Upload Invoice Image</label> */}
                        
                                            <CldUploadWidget
                                                uploadPreset="invoices"
                                                options={{
                                                    upload_preset: "invoices",
                                                    folder: "invoices",
                                                    tags: ["invoice"],
                                                }}
                                                onSuccess={({ event, info }) => {
                                                    if (event === "success") {
                                                        const imageUrl = info?.secure_url || info?.url;
                                                        setPublicId(info?.public_id);
                                                        // console.log("imageUrl:", info);
                        
                                                        setImageUrl(imageUrl);
                                                        setSelectedInvoice((prev) => ({ ...prev, imageURL: imageUrl }));
                                                    }
                                                }}>
                                                {({ open }) => (
                                                    <button
                                                        type="button"
                                                        onClick={() => open()}
                                                        className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-all"
                                                    >
                                                        Upload an Image
                                                    </button>
                                                )}
                                            </CldUploadWidget>
                        
                        
                        
                        
                                            {publicId && (
                                                <div className="mt-4 max-h-60 overflow-auto rounded-lg border p-2 shadow-inner bg-gray-50">
                                                    <CldImage
                                                        src={publicId}
                                                        alt="Uploaded image"
                                                        width="700"
                                                        height="1200"
                                                        className="rounded-md object-cover"
                                                    />
                                                </div>
                                            )}
                                        </div>

                        <button
                            type="submit"
                            onClick={(e) => {
                                e.preventDefault();
                                if (window.confirm("If you update this invoice, your previous payment data will be erased and new data with the total received amount will be stored. Do you want to continue?")) {
                                    handleUpdateInvoice(e);
                                }
                            }}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full"
                        >
                            Update Invoice
                        </button>

                    </form>
                </div>

            </Modal>

            {/* enter Amount modal */}
            <Modal isOpen={isAmountModal} onClose={() => setIsAmountModal(false)} title="Enter Amount">
                <div>
                    <div className="overflow-y-auto p-4">
                        < input type="number" name="enteramout" value={totalReceivedAmount} onChange={handleTotalAmountChange} className="border rounded-lg px-3 py-2 w-full" placeholder="Enter Amount" />
                    </div>
                    <div className="flex justify-between">
                        <button onClick={() => setIsAmountModal(false)} className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Cancel</button>
                        <button type="button" onClick={() => paymentopenModal()} className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Proceed</button>
                    </div>
                </div>

            </Modal>





            {/* //payment modal */}

            <Modal isOpen={isPaymentModal} onClose={() => setPaymentModal(false)} title="payment Invoice">
                <div className="p-4 max-h-[70vh] overflow-y-auto">
                    <p>Remaining Amount: ₹ {remainingAmount.toFixed(2)}</p>
                    <form onSubmit={handlePaymentUpdate} className="space-y-4 border-2 border-gray-300 p-4 rounded-lg">
                        {isPaymentInvoice.map((invoice, index) => (
                            <div key={invoice.id} className="border-1 p-2 rounded-2xl pb-4 mb-4 bg-gray-100">
                                <h3 className="text-lg font-bold">#{invoice.invoiceNumber}</h3>
                                <p>Grand Total: ₹ {invoice.grandTotal.toFixed(2)}</p>
                                <p>Balance Due: ₹ {invoice.balance_due_amount.toFixed(2)}</p>

                                <input
                                    type="number"
                                    name="received_amount"
                                    value={invoice.received_amount}
                                    onChange={(e) => handlePaymentChange(index, e)}
                                    className="border px-3 py-2 w-full mt-2 rounded-2xl"
                                    placeholder="Received Amount"
                                />
                                <p>New Balance Due: ₹ {invoice.balance_due_amount - invoice.received_amount}</p>
                            </div>
                        ))}
                        <div className="flex justify-end mt-4">
                            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">Update Payments</button>

                        </div>
                    </form>
                    <button onClick={() => { setPaymentModal(false) }} className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 mr-1">Close</button>
                </div>
            </Modal>
        </>
    );
};

export default Page;
