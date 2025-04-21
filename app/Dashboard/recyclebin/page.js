"use client"
import React from 'react'
import { fetchDeactivetedInvoiceAndRecivedAmount } from '@/app/api/actions/invoiceactions'
import { useSession } from 'next-auth/react'
import DeActiveinvoices from '@/app/components/DeActiveinvoices'
import DeActiveReceivedAmount from '@/app/components/DeActiveReceivedAmount'

const ITEMS_PER_PAGE = 6

const RecycleBinPage = () => {
    const [invoices, setInvoices] = React.useState([])
    const [receivedAmount, setReceivedAmount] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState(null)
    const { data: session } = useSession()

    // Pagination state
    const [invoicePage, setInvoicePage] = React.useState(1)
    const [amountPage, setAmountPage] = React.useState(1)

    const fetchInvoices = async () => {
        setLoading(true)
        try {
            const userId = sessionStorage.getItem("id")
            const response = await fetchDeactivetedInvoiceAndRecivedAmount(userId, "deactivated")
            if (response.error) {
                setError(response.error)
            } else {
                

                    setInvoices(response.invoices)
                    setReceivedAmount(response.Receivedamount)
                
            }
        } catch (error) {
            setError("Failed to fetch invoices")
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        if (session && sessionStorage.getItem("id")) {
            fetchInvoices()
        }
    }, [session])

    // Pagination logic
    const paginate = (data, page) => {
        const start = (page - 1) * ITEMS_PER_PAGE
        return data.slice(start, start + ITEMS_PER_PAGE)
    }

    const totalInvoicePages = Math.ceil(invoices.length / ITEMS_PER_PAGE)
    const totalAmountPages = Math.ceil(receivedAmount.length / ITEMS_PER_PAGE)

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-center bg-emerald-500 text-white py-3 rounded-md shadow mb-6">
                Recycle Bin
            </h1>




            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 -mdrounded-lg ">
                {/* Invoices Table */}
                <div className=" shadow-lg rounded-lg overflow-hidden  ">
                    <div className="bg-blue-900 text-white px-4 py-3 ">
                        <h2 className="text-lg font-semibold">Invoices</h2>
                    </div>
                    <div className="overflow-x-auto h-[62vh]">
                        <table className="w-full text-sm text-center text-gray-200">
                            <thead className="bg-blue-800 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3">Invoice No.#</th>
                                    <th className="px-4 py-3">Client Name</th>
                                    <th className="px-4 py-3">Total</th>
                                    <th className="px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className=" text-black  ">
                                {paginate(invoices, invoicePage).map((invoice, index) => (
                                    <DeActiveinvoices key={invoice._id || index} invoice={invoice} fetchData={fetchInvoices} />
                                ))}
                                {invoices.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="py-4 text-center">No invoices found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Controls */}
                    <div className="flex justify-center items-center p-4 gap-2">
                        <button
                            onClick={() => setInvoicePage(p => Math.max(p - 1, 1))}
                            disabled={invoicePage === 1 || invoices.length === 0}
                            className="px-3 py-1 bg-blue-700 text-white rounded disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span className="text-white">{invoicePage} / {totalInvoicePages || 1}</span>
                        <button
                            onClick={() => setInvoicePage(p => Math.min(p + 1, totalInvoicePages))}
                            disabled={invoicePage === totalInvoicePages || invoices.length === 0}
                            className="px-3 py-1 bg-blue-700 text-white rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>

                </div>

                {/* Received Amount Table */}
                <div className="  overflow-hidden shadow-md rounded-lg">
                    <div className="bg-yellow-500 text-white px-4 py-3">
                        <h2 className="text-lg font-semibold">Received Amount</h2>
                    </div>
                    <div className="overflow-x-auto h-[62vh]">
                        <table className="w-full text-sm text-center text-gray-800">
                            <thead className="bg-yellow-300 text-xs uppercase text-gray-900">
                                <tr>
                                    <th className="px-4 py-3">Invoice No.#</th>
                                    <th className="px-4 py-3">Client Name</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-yellow-200">
                                {paginate(receivedAmount, amountPage).map((received, index) => (
                                    <DeActiveReceivedAmount key={received._id || index} received={received} fetchData={fetchInvoices} />
                                ))}
                                {receivedAmount.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="py-4 text-center text-gray-700">
                                            No received amount found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Controls */}
                    <div className="flex justify-center items-center p-4 gap-2">
                        <button
                            onClick={() => setAmountPage(p => Math.max(p - 1, 1))}
                            disabled={amountPage === 1 || receivedAmount.length === 0}
                            className="px-3 py-1 bg-yellow-500 text-white rounded disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span className="text-gray-900">{amountPage} / {totalAmountPages || 1}</span>
                        <button
                            onClick={() => setAmountPage(p => Math.min(p + 1, totalAmountPages))}
                            disabled={amountPage === totalAmountPages || receivedAmount.length === 0}
                            className="px-3 py-1 bg-yellow-500 text-white rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default RecycleBinPage
