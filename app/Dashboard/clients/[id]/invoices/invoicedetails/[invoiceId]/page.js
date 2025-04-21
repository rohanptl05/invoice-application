"use client";

import { useParams, useRouter } from "next/navigation";
import { fetchInvoiceDetails } from "@/app/api/actions/invoiceactions";
import { useState, useEffect,useRef } from "react";
import { useSession } from "next-auth/react";
import InvoiceDetailspage from "@/app/components/InvoiceDetails";
import { fetchSingleclient } from "@/app/api/actions/clientactions";
import { fetchReceivedAmount } from "@/app/api/actions/receivedamountactions";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Page = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const { id, invoiceId } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [client, setClient] = useState(null);
    const [payments,setPayment] = useState(null);
     const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const reportRef = useRef(null);


    const generatePDF = async () => {
        if (!reportRef.current) return;
      
        setIsGeneratingPDF(true);
        const input = reportRef.current;
      
        try {
          input.style.display = 'block';
          input.style.position = 'static';
      
          // Give layout time to settle
          await new Promise((resolve) => setTimeout(resolve, 100));
      
          const canvas = await html2canvas(input, {
            scale: 2, // Better quality
            useCORS: true,
            backgroundColor: '#ffffff',
            scrollX: 0,
            scrollY: -window.scrollY,
          });
      
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
      
          const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
          const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
      
          // Convert canvas size to mm
          const pxToMm = (px) => px * 0.264583;
          const imgWidthMm = pxToMm(canvas.width);
          const imgHeightMm = pxToMm(canvas.height);
      
          // Scale image to fit page width
          const scaleFactor = pdfWidth / imgWidthMm;
          const finalHeight = imgHeightMm * scaleFactor;
      
          // ⚠️ If content is taller than one page, split it
          if (finalHeight > pdfHeight) {
            let position = 0;
            const pageHeight = pdfHeight;
      
            while (position < finalHeight) {
              pdf.addImage(
                imgData,
                'PNG',
                0,
                -position,
                pdfWidth,
                finalHeight
              );
              position += pageHeight;
              if (position < finalHeight) pdf.addPage();
            }
          } else {
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, finalHeight);
          }
      
          // ➕ Add timestamp on last page
          const timestamp = new Date().toLocaleString();
          pdf.setFontSize(8);
          const textWidth = pdf.getTextWidth(timestamp);
          pdf.text(timestamp, pdfWidth - textWidth - 10, pdfHeight - 10);
      
          pdf.save('invoice-report.pdf');
        } catch (error) {
          console.error("PDF generation error:", error);
        } finally {
          setIsGeneratingPDF(false);
        }
      };
      
    

    useEffect(() => {
        if (!session) {
            router.push("/");
        } else {
            getData();
        }
    }, [session, invoiceId,router]); // Added session dependency

    const getData = async () => {
        if (!invoiceId) return;

        try {
            const invoiceData = await fetchInvoiceDetails(invoiceId);
            const clientData = await fetchSingleclient(id);
            const paymentData = await fetchReceivedAmount(invoiceId,"active");
           

            setClient(clientData?.clients[0] || null); // Ensure `clientData.client` exists
            setInvoice(invoiceData?.invoice || null); 
            // console.log("dfdfdfdfdf",clientData)
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
        <div className="container mx-auto px-4 mb-4">
            <div className="flex justify-end">
              <button type="button"
          onClick={generatePDF}
          disabled={isGeneratingPDF}
          className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">{isGeneratingPDF ? "Generating..." : "PDF"}</button>
          </div>

            <InvoiceDetailspage invoice={invoice} client={client} payments={payments} reportRef={reportRef} getData={getData}/>
        </div>
    );
};

export default Page;
