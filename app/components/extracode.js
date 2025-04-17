
  // const generatePDF = async () => {
  //   setIsGeneratingPDF(true);
  //   const input = pdfRef.current;
  
  //   if (!input) return;
  
  //   const canvas = await html2canvas(input, {
  //     scale: 2,
  //     useCORS: true,
  //     backgroundColor: "#fff",
  //   });
  
  //   const imgData = canvas.toDataURL("image/png");
  //   const pdf = new jsPDF("p", "mm", "a4");
  
  //   const pdfWidth = pdf.internal.pageSize.getWidth();
  //   const pageHeight = pdf.internal.pageSize.getHeight();
  //   const imgHeight = (canvas.height * pdfWidth) / canvas.width;
  
  //   // 🔹 Optional: Add logo (top-left)
  //   const logoUrl = "/invoice.jpg"; // Update with your logo path (in public folder)
  //   const logoImg = new Image();
  //   logoImg.src = logoUrl;
  
  //   // Wait for logo to load
  //   logoImg.onload = () => {
  //     pdf.addImage(logoImg, "PNG", 10, 10, 30, 30);
  
  //     // 🔹 Report Title (centered)
  //     pdf.setFontSize(18);
  //     pdf.setFont("helvetica", "bold");
  //     pdf.text("Invoice Report", pdfWidth / 2, 20, { align: "center" });
  
  //     // 🔹 Timestamp (top-right)
  //     const timestamp = new Date().toLocaleString();
  //     const pageHeight = pdf.internal.pageSize.height;
  //     const marginRight = 10;
      
  //     pdf.setFontSize(10);
  //     pdf.setFont("helvetica", "normal");
      
  //     // Align right at bottom of page
  //     pdf.text(`Generated on: ${timestamp}`, pdf.internal.pageSize.width - marginRight, pageHeight - 10, {
  //       align: "right",
  //     });
      
  
  //     // 🔹 Add the captured image (justified content from your div)
  //     const topOffset = 40;
  //     pdf.addImage(imgData, "PNG", 10, topOffset, pdfWidth - 20, imgHeight);
  
  //     // 🔹 Auto paginate if content exceeds one page
  //     if (imgHeight + topOffset > pageHeight) {
  //       let remainingHeight = imgHeight + topOffset - pageHeight;
  //       let position = pageHeight;
  
  //       while (remainingHeight > 0) {
  //         pdf.addPage();
  //         const nextImgY = imgHeight - remainingHeight;
  //         pdf.addImage(imgData, "PNG", 10, 0, pdfWidth - 20, imgHeight, undefined, "FAST", 0, -nextImgY);
  //         remainingHeight -= pageHeight;
  //         position = 0;
  //       }
  //     }
  
  //     // 🔹 Open in new tab
  //     const blob = pdf.output("blob");
  //     const blobUrl = URL.createObjectURL(blob);
  //     window.open(blobUrl, "_blank");
  //   };
  // };
  