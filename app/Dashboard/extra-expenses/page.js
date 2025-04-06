"use client"
import React, { useState, useEffect } from 'react'
import Modal from '@/app/components/Modal'
import { ADDExpense, GETExpense, EditExpense } from '@/app/api/actions/extraexpenseactions'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import ExtraExpensesList from '@/app/components/ExtraExpensesList'
const page = () => {
  const userId = sessionStorage.getItem("id");
  const [formData, setFormData] = useState({
    amount: "",
    date: "",
    type: "",
    description: "",
  });

  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const [Exinvoices, setExInvoices] = useState([]);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectExinvoice, setSelectExinvoice] = useState(null);
  const [editModalOpen, seteditModalOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [monthlyTotalAmount, setMonthlyTotalAmount] = useState(0);


  const getData = async () => {
    const userId = sessionStorage.getItem("id");
    if (userId) {
      setUser(userId);
      const response = await GETExpense(userId);
      if (response) {
        setExInvoices(response);


        const total = response.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
        setTotalAmount(total);

        // 📅 Filter & calculate current month amount
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const currentMonthTotal = response
          .filter((item) => {
            const itemDate = new Date(item.date);
            return (
              itemDate.getMonth() === currentMonth &&
              itemDate.getFullYear() === currentYear
            );
          })
          .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

        setMonthlyTotalAmount(currentMonthTotal);
      } else {
        alert("Failed to fetch user data.");
      }
    } else {
      alert("User ID not found.");
    }
  };

  useEffect(() => {
    getData();
  }, [session]);




  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      formData.user = userId;
      if (formData.user) {



        const response = await ADDExpense(formData);
        if (!response) {
          alert("Failed to add expense.");
          return;
        }
        if (response.success) {
          alert("Expense added successfully.");
          getData();
        }

        setFormData({ amount: "", date: "", type: "", description: "" });
        setModalOpen(false);
      } else {
        alert("User ID not found.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleeditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await EditExpense(selectExinvoice._id, selectExinvoice);
      if (!response) {
        alert("Failed to edit expense.");
        return;
      }
      if (response.success) {
        alert("Expense edited successfully.");
        getData();
      }
      // setSelectExinvoice({ amount: "", date: "", type: "", description: "" });
      seteditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };


  const editopenModal = (exinvoice) => {
    setSelectExinvoice(exinvoice ? { ...exinvoice } : null);
    seteditModalOpen(true);

  }


  const itemsPerPage = 7;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const paginatedInvoices = (Array.isArray(Exinvoices) ? Exinvoices : []).slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil((Array.isArray(Exinvoices) ? Exinvoices.length : 0) / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <>
      <div className='container  '>
        <div className='flex justify-between items-center mt-1  bg-amber-100 p-2 rounded-lg shadow-lg'>

          <div className='flex justify-between items-center m-1'>
            <h1 className='text-2xl font-bold'>Extra Expenses</h1>

          </div>
          <div className='flex justify-between items-center m-1'>
            {/* <h1 className='text-xl font-bold'>Total Amount: ₹0</h1> */}

            <button type="button" onClick={() => { setModalOpen(true) }} className="text-gray-900 m-1 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">+ ADD EXPENECES</button>
          </div>
        </div>



        {Exinvoices && Exinvoices.length > 0 ? (
          <div className="w-full overflow-x-auto mt-2 h-[67vh] shadow-md rounded-lg">
            <table className="w-full border-collapse min-w-[600px] text-center">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 uppercase text-sm tracking-wider">
                <tr>
                  <th className="px-6 py-3 border-b">Invoice #</th>
                  <th className="px-6 py-3 border-b">Date</th>
                  <th className="px-6 py-3 border-b">Type</th>
                  <th className="px-6 py-3 border-b">description</th>
                  <th className="px-6 py-3 border-b">Amount</th>
                  <th className="px-6 py-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>

                {paginatedInvoices.map((exinvoice, index) => (
                  <ExtraExpensesList
                    key={exinvoice._id}
                    exinvoice={exinvoice}

                    index={(Exinvoices.length) - ((currentPage - 1) * itemsPerPage + index) - 1}

                    updateExInvoice={editopenModal}
                    getData={getData}
                  />
                ))}

              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500">No invoices available</p>
        )




        }

        <div className="flex justify-center items-center  mt-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 mx-1 rounded ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
          >
            Previous
          </button>
          <span className="mx-4 text-lg font-semibold">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 mx-1 rounded ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
          >
            Next
          </button>
        </div>
        <div className='flex justify-between items-center mt-2 bg-blue-400 p-2 rounded-lg shadow-lg'>
          <div>Total Amount: ₹{totalAmount.toLocaleString()}</div>
          <div>This Month: ₹{monthlyTotalAmount.toLocaleString()}</div>
        </div>

      </div>




      {selectExinvoice && selectExinvoice._id && (
        <Modal isOpen={editModalOpen} onClose={() => seteditModalOpen(false)} title="Edit Expense">
          <div className="max-w-lg mx-auto m-2 p-1 rounded-lg shadow-lg">
            <form onSubmit={handleeditSubmit} className="space-y-4">
              <div>
                <label htmlFor="amount">Amount</label>
                <input type="number" placeholder='Edit Amount' value={selectExinvoice.amount}
                  onChange={(e) => {
                    setSelectExinvoice((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }));
                  }}
                />
              </div>
              <div>
                <label htmlFor="date">Date</label>
                <input type="date" value={selectExinvoice?.date ? new Date(selectExinvoice.date).toISOString().split("T")[0] : ""} onChange={(e) => {
                  setSelectExinvoice((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }));
                }} />


              </div>
              <div>
                <label htmlFor="type">Expense Type</label>
                <input type="text" placeholder='Edit Type' value={selectExinvoice.expensetype} onChange={(e) => {
                  setSelectExinvoice((prev) => ({
                    ...prev,
                    expensetype: e.target.value,
                  }));
                }} />
              </div>
              <div>
                <label htmlFor="description">Description</label>
                <textarea placeholder='Edit Description' value={selectExinvoice.description}
                  onChange={(e) => {
                    setSelectExinvoice((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }));
                  }}
                  rows="3"></textarea>
              </div>
              <div className="flex justify-between">
                <button type="reset" className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition">Reset</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">Update Expense</button>
              </div>

            </form>
          </div>
        </Modal>

      )}






      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Add Extra Expense">

        <div className="max-w-lg mx-auto m-2 p-1 rounded-lg shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount Input */}
            <div>
              <label className="block text-gray-700">Amount (₹)</label>
              <input
                type="number"
                // value={amount}
                name='amount'
                onChange={handleChange}
                required
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="Enter amount"
              />
            </div>

            <div>

              <label className="block text-gray-700">Date</label>
              <input
                type="date"
                value={formData.date || new Date().toISOString().split("T")[0]}
                onChange={handleChange}
                name='date'
                required
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="Enter amount"
              />


            </div>

            {/* Suggestions Dropdown */}
            <div>
              <label className="block text-gray-700">Expense Type</label>
              <input
                type="text"
                // value={type}
                name='type'
                onChange={handleChange}
                required
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder='Expense Type'
              />

            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700">Description</label>
              <textarea
                // value={description}
                onChange={handleChange}
                name='description'
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="Enter details (optional)"
                rows="3"
              ></textarea>
            </div>

            {/* Buttons */}
            <div className="flex justify-between">
              <button
                type="reset"
                // onClick={() => { setAmount(""); setDescription(""); setSuggestion(""); }}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition"
              >
                Reset
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                Add Expense
              </button>
            </div>
          </form>

        </div>



      </Modal>

    </>
  )
}

export default page
