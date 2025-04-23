"use client";
import { React, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { fetchClientsWithInvoices } from '@/app/api/actions/invoiceactions';
import ReportinvoiceItems from '@/app/components/ReportinvoiceItems';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";



const ReportPage = () => {
  const { data: session } = useSession();
  const reportRef = useRef(null);

  const id = sessionStorage.getItem("id");

  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [originalInvoices, setOriginalInvoices] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dueAmountSort, setDueAmountSort] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAmountSort, setTotalAmountSort] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleFilterChange = (e, type) => {
    const value = e.target.value;

    if (type === "status") setSelectedStatus(value);
    if (type === "totalAmount") setTotalAmountSort(value);
    if (type === "dueAmount") setDueAmountSort(value);
    if (type === "from") setFromDate(value);
    if (type === "to") setToDate(value);
    if (type === "search") setSearchTerm(value);
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
      const clientData = await fetchClientsWithInvoices(id, "active");
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

    // 🔍 Search Filter
    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      filteredInvoices = filteredInvoices.filter(invoice =>
        invoice.invoiceNumber?.toString().toLowerCase().includes(lowerSearch) ||
        invoice.client?.name?.toLowerCase().includes(lowerSearch) ||
        invoice.status?.toLowerCase().includes(lowerSearch)
      );
    }

    setInvoices(filteredInvoices);
  }, [selectedStatus, totalAmountSort, dueAmountSort, fromDate, toDate, searchTerm]);



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



  const generatePDF = async () => {
    if (!reportRef.current) return;
  
    setIsGeneratingPDF(true);
    const input = reportRef.current;
  
    try {
      // Make visible and reset position
      input.style.display = 'block';
      input.style.position = 'static';
      await new Promise((resolve) => setTimeout(resolve, 100));
  
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: -window.scrollY
      });
  
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
  
      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
  
      const imgProps = {
        width: canvas.width,
        height: canvas.height
      };
  
      const pxToMm = (px) => px * 0.264583;
      const imgWidthMm = pxToMm(imgProps.width);
      const imgHeightMm = pxToMm(imgProps.height);
  
      const scaleFactor = pdfWidth / imgWidthMm;
      const finalWidth = imgWidthMm * scaleFactor;
      const finalHeight = imgHeightMm * scaleFactor;
  
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, finalHeight);
  
      // ➕ Add timestamp in bottom-right corner
      const timestamp = new Date().toLocaleString();
      pdf.setFontSize(8); // small font
      const margin = 10;
      const textWidth = pdf.getTextWidth(timestamp);
      pdf.text(timestamp, pdfWidth - textWidth - margin, pdfHeight - margin);
  
      pdf.save('invoice-report.pdf');
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      input.style.display = 'none';
      input.style.position = 'absolute';
      setIsGeneratingPDF(false);
    }
  };
  



  return (
    <>
      <div className="container w-[99%] ">


        <div className="flex justify-between items-center mt-1 text-center bg-amber-100 p-4 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold w-full">Report</h1>
          <button type="button"
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">{isGeneratingPDF ? "Generating..." : "PDF"}</button>
        </div>
        <div >

          {/* filters */}
          <div className="mt-4 bg-amber-100 p-3 rounded-md shadow flex flex-wrap justify-between items-center gap-3 text-xs">

            {/* Search */}
            <div className="flex items-center gap-1">
              <label htmlFor="search" className="text-gray-700 whitespace-nowrap">Search:</label>
              <input
                type="text"
                id="search"
                onChange={(e) => handleFilterChange(e, "search")}
                placeholder="Search"
                className="border rounded px-2 py-1 h-7 w-[120px]"
              />
            </div>

            {/* Status */}
            <div className="flex items-center gap-1">
              <label htmlFor="status" className="text-gray-700 whitespace-nowrap">Status:</label>
              <select
                id="status"
                className="border rounded px-2 py-1 h-7 w-[100px]"
                onChange={(e) => handleFilterChange(e, "status")}
              >
                <option value="all">All</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>



            {/* Total Amount */}
            <div className="flex items-center gap-1">
              <label htmlFor="amount" className="text-gray-700 whitespace-nowrap">Total:</label>
              <select
                id="amount"
                className="border rounded px-2 py-1 h-7 w-[110px]"
                onChange={(e) => handleFilterChange(e, "totalAmount")}
              >
                <option value="">None</option>
                <option value="Low">Low</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Due Amount */}
            <div className="flex items-center gap-1">
              <label htmlFor="dueamount" className="text-gray-700 whitespace-nowrap">Due:</label>
              <select
                id="dueamount"
                className="border rounded px-2 py-1 h-7 w-[110px]"
                onChange={(e) => handleFilterChange(e, "dueAmount")}
              >
                <option value="">None</option>
                <option value="Low">Low</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* From Date */}
            <div className="flex items-center gap-1">
              <label htmlFor="from" className="text-gray-700 whitespace-nowrap">From:</label>
              <input
                type="date"
                id="from"
                className="border rounded px-2 py-1 h-7 w-[130px]"
                onChange={(e) => handleFilterChange(e, "from")}
              />
            </div>

            {/* To Date */}
            <div className="flex items-center gap-1">
              <label htmlFor="to" className="text-gray-700 whitespace-nowrap">To:</label>
              <input
                type="date"
                id="to"
                disabled={!fromDate}
                className="border rounded px-2 py-1 h-7 w-[130px]"
                onChange={(e) => handleFilterChange(e, "to")}
              />
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
                    <th className="px-6 py-3 border-b">Due Amout</th>
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
        </div>

        {/* button paginations */}
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



        {/* pdf contains */}
        <div ref={reportRef} className="bg-white w-full mx-auto p-6 text-center hidden">
          <div className="bg-white w-[95%] mx-auto text-center rounded-2xl border border-gray-300 overflow-hidden shadow">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Invoice Report</h2>

         
            {/* Filter display in one row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 bg-green-100 p-4 justify-between rounded-md mb-4 text-sm text-gray-800">
              <div className="flex items-center space-x-1">
                <span className="font-medium text-gray-700">Search:</span>
                <span className="text-gray-900">{searchTerm || "—"}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-medium text-gray-700">Status:</span>
                <span className="text-gray-900">{selectedStatus || "—"}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-medium text-gray-700">Total:</span>
                <span className="text-gray-900">{totalAmountSort || "—"}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-medium text-gray-700">Due Amount:</span>
                <span className="text-gray-900">{dueAmountSort || "—"}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-medium text-gray-700">Date From:</span>
                <span className="text-gray-900">{fromDate || "—"}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-medium text-gray-700">To:</span>
                <span className="text-gray-900">{toDate || "—"}</span>
              </div>
            </div>



            {invoices && invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-center text-sm table-auto border-collapse">
                  <thead className="bg-gray-200 text-gray-700 uppercase tracking-wide">
                    <tr>
                      <th className="px-2 py-2 whitespace-nowrap">Invoice No. #</th>
                      <th className="px-2 py-2 whitespace-nowrap">Client Name</th>
                      <th className="px-2 py-2 whitespace-nowrap">Date</th>
                      <th className="px-2 py-2 whitespace-nowrap">Status</th>
                      <th className="px-2 py-2 whitespace-nowrap">Total Amount</th>
                      <th className="px-2 py-2 whitespace-nowrap">Due Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((Reportinvoice, index) => (
                      <tr
                        key={Reportinvoice._id}
                        className={`bg-white border-t text-xs even:bg-gray-50 ${index === invoices.length - 1 ? "last:rounded-b-2xl" : ""
                          }`}
                      >
                        <td className="px-2 py-2 text-center whitespace-nowrap">
                          {Reportinvoice.invoiceNumber}
                        </td>
                        <td className="px-2 py-2 text-center whitespace-nowrap">
                          {Reportinvoice.client.name}
                        </td>
                        <td className="px-2 py-2 text-center whitespace-nowrap">
                          {new Date(Reportinvoice.date).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </td>
                        <td className="px-2 py-2 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-md inline-block
                      ${Reportinvoice.status === "PAID"
                                ? "bg-green-100 text-green-700"
                                : Reportinvoice.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                          >
                            {Reportinvoice.status}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center whitespace-nowrap">
                          {Reportinvoice.grandTotal}
                        </td>
                        <td className="px-2 py-2 text-center whitespace-nowrap">
                          {Reportinvoice.balance_due_amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 mt-4">No invoices available</p>
            )}
          </div>
        </div>


      </div>
    </>
  );
};

export default ReportPage;
