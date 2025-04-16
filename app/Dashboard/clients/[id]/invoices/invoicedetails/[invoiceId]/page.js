"use client";

import { useParams, useRouter } from "next/navigation";
import { fetchInvoiceDetails } from "@/app/api/actions/invoiceactions";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import InvoiceDetailspage from "@/app/components/InvoiceDetails";
import { fetchSingleclient } from "@/app/api/actions/clientactions";
import { fetchReceivedAmount } from "@/app/api/actions/receivedamountactions";

const InvoiceDetails = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const { id, invoiceId } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [client, setClient] = useState(null);
    const [payments,setPayment] = useState(null);

    useEffect(() => {
        if (!session) {
            router.push("/");
        } else {
            getData();
        }
    }, [session, invoiceId]); // Added session dependency

    const getData = async () => {
        if (!invoiceId) return;

        try {
            const invoiceData = await fetchInvoiceDetails(invoiceId);
            const clientData = await fetchSingleclient(id);
            const paymentData = await fetchReceivedAmount(invoiceId,"active");
           

            setClient(clientData?.clients[0] || null); // Ensure `clientData.client` exists
            setInvoice(invoiceData?.invoice || null); 
            setPayment(paymentData || null)

        } catch (error) {
            console.error("Error fetching invoice or client details:", error);
        }
    };

// if(payments){
//   console.log('pppp',payments)
// }

    if (!invoice || !client) return <p>Loading...</p>; // Prevents passing null props

    return (
        <div className="container h-screen">
            <InvoiceDetailspage invoice={invoice} client={client} payments={payments} />
        </div>
    );
};

export default InvoiceDetails;
