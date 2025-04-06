"use client";
import { React, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { fetchClientsWithInvoices } from '@/app/api/actions/invoiceactions';
import ReportinvoiceItems from '@/app/components/ReportinvoiceItems';

const ReportPage = () => {
  const { data: session } = useSession();

  const id = sessionStorage.getItem("id");
  // console.log(id)
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [originalInvoices, setOriginalInvoices] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [totalAmountSort, setTotalAmountSort] = useState("");
  const [dueAmountSort, setDueAmountSort] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleFilterChange = (e, type) => {
    const value = e.target.value;

    if (type === "status") setSelectedStatus(value);
    if (type === "totalAmount") setTotalAmountSort(value);
    if (type === "dueAmount") setDueAmountSort(value);
    if (type === "from") setFromDate(value);
    if (type === "to") setToDate(value);
  };
  useEffect(() => {
    if (!session) {
      router.push("/");
    } else {
      getData();
    }
  }, [id, session, router]);
  const getData = async () => {
    try {
      if (!id) {
        console.error("Client ID not found");
        return;
      }
      const clientData = await fetchClientsWithInvoices(id);
      if (clientData.success) {
        setOriginalInvoices(clientData.invoices);
        setInvoices(clientData.invoices);
        // console.log("fetch",clientData.invoices)
        if (invoices.length > 0) {
          // console.log(" invoices found for this user.", invoices);
        }
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
  }, [selectedStatus, totalAmountSort, dueAmountSort, fromDate, toDate]);



  const itemsPerPage = 7; // Set the number of items per page
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
      <div className="container w-[99%] ">

        <div className="flex justify-between items-center mt-1 text-center bg-amber-100 p-4 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold w-full">Report</h1>
          <button type="button" className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">PDF</button>
        </div>

        {/* filters */}
        <div className="flex justify-between items-center mt-4  text-center bg-amber-100 p-4 rounded-lg shadow-lg">
        
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


        {invoices && invoices.length > 0 ? (
          <div className="w-full overflow-x-auto mt-2 h-[67vh] shadow-md rounded-lg">
            <table className="w-full border-collapse min-w-[600px] text-center">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 uppercase text-sm tracking-wider">
                <tr>
                  <th className="px-6 py-3 border-b">Invoice No. #</th>
                  <th className="px-6 py-3 border-b">Client Name</th>
                  <th className="px-6 py-3 border-b">Date</th>
                  <th className="px-6 py-3 border-b">Status</th>
                  <th className="px-6 py-3 border-b">Total Amout</th>
                  <th className="px-6 py-3 border-b">Due Amount</th>
                </tr>
              </thead>
              <tbody>



                {paginatedInvoices.map((Reportinvoice, index) => (
                  <ReportinvoiceItems key={Reportinvoice._id} invoices={Reportinvoice} />
                ))}


              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500">No invoices available</p>
        )}


        {/* button paginations */}
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

      </div>
    </>
  );
};

export default ReportPage;
