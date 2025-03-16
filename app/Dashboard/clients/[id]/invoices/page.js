"use client"; // Required for client-side rendering

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchInvoice } from "@/app/api/actions/invoiceactions";
import Invoiceitem from "@/app/components/Invoiceitem";

const Page = () => {
    const { data: session } = useSession();
    const { id } = useParams();
    const router = useRouter();
    
    const [invoices, setInvoices] = useState([]);

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
            if (clientData && !clientData.error) {
                setInvoices(clientData);
                console.log(clientData)
            } else {
                console.error(clientData.error || "No invoices found");
            }
        } catch (error) {
            console.error("Error fetching invoices:", error);
        }
    };

    return (
        <div>
            {invoices.map((invoice, index) => (
                <Invoiceitem key={invoice._id || index} invoice={invoice} />
            ))}
        </div>
    );
};

export default Page;
