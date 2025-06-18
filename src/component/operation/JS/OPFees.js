import React, { useState } from "react";
import "../CSS/OPFees.css"; // Import the CSS file
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // Import autoTable plugin

const PaymentDetails = () => {
  const [classId, setClassId] = useState("");
  const [divClass, setDivClass] = useState("");
  const [paymentRecords, setPaymentRecords] = useState([]);

  const handleClassChange = (e) => {
    setClassId(e.target.value);
  };

  const handleDivClassChange = (e) => {
    setDivClass(e.target.value);
  };

  const handleFetchRecords = async () => {
    let finalClassId = classId;
    if (divClass !== "combine") {
      finalClassId += divClass;
    }

    try {
      const response = await fetch("http://localhost/school/OPFees.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classId: finalClassId,
          divClass: divClass,
        }),
      });

      const data = await response.json();
      setPaymentRecords(data);
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  };

  const handlePayByCash = async (studentId) => {
    const isConfirmed = window.confirm("Are you sure you want to pay by cash?");
    if (!isConfirmed) {
      return; // If the user clicks "No", do nothing
    }

    try {
      const response = await fetch(
        "http://localhost/school/updatePaymentStatus.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId: studentId,
            paymentMethod: "cash",
          }),
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        // Refresh payment records after successful update
        handleFetchRecords();
      } else {
        alert("Failed to update payment status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  const generateReceipt = (record) => {
    const doc = new jsPDF();
  
    // Add receipt header
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0); // Set font color to black
    doc.text("Payment Receipt", 105, 20, { align: "center" });
  
    // Add table with student details
    autoTable(doc, {
      head: [["Field", "Details"]],
      body: [
        ["Student ID", record.STUDENT_ID || "N/A"],
        ["Name", `${record.FIRST_NAME || "N/A"} ${record.LAST_NAME || "N/A"}`],
        ["Email", record.EMAIL || "N/A"],
        ["Paid Amount", record.paid_amount !== null && record.paid_amount !== undefined ? record.paid_amount.toString() : "N/A"],
        ["Payment Date", record.payment_date || "N/A"],
        ["Payment Status", record.status || "Pending"],
      ],
      startY: 30, // Position where the table starts
      styles: {
        halign: "center", // Horizontal alignment
        valign: "middle", // Vertical alignment
        cellPadding: 3, // Padding inside cells
        lineWidth: 0.2, // Border thickness
        lineColor: [0, 0, 0], // Black border color
        textColor: [0, 0, 0], // Black text color
      },
      headStyles: {
        fillColor: [41, 128, 185], // Blue header background
        textColor: [255, 255, 255], // White header text
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240], // Light gray alternate row background
      },
    });
  
    // Save the PDF
    doc.save(`Receipt_${record.STUDENT_ID}.pdf`);
  };
  

  

  const generateClassReport = () => {
    if (paymentRecords.length === 0) {
      alert("No records available to generate a report.");
      return;
    }
  
    const doc = new jsPDF();
  
    // Add report header
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0); // Set font color to black
    doc.text("Class Payment Report", 105, 20, { align: "center" });
  
    // Add class and division details
    doc.setFont("helvetica", "normal");
    doc.text(`Class: ${classId}`, 20, 30);
    doc.text(`Division: ${divClass || "All"}`, 20, 40);
  
    // Define table data
    const tableData = paymentRecords.map((record) => [
      record.STUDENT_ID || "N/A",
      `${record.FIRST_NAME || "N/A"} ${record.LAST_NAME || "N/A"}`,
      record.EMAIL || "N/A",
      record.paid_amount !== null && record.paid_amount !== undefined
        ? record.paid_amount.toString()
        : "N/A",
      record.payment_date || "N/A",
      record.status || "Pending",
    ]);
  
    // Add table with autoTable
    autoTable(doc, {
      head: [["Student ID", "Name", "Email", "Paid Amount", "Payment Date", "Status"]],
      body: tableData,
      startY: 50, // Position where the table starts
      styles: {
        halign: "center", // Horizontal alignment
        valign: "middle", // Vertical alignment
        cellPadding: 3, // Padding inside cells
        lineWidth: 0.2, // Border thickness
        lineColor: [0, 0, 0], // Black border color
        textColor: [0, 0, 0], // Black text color
      },
      headStyles: {
        fillColor: [41, 128, 185], // Blue header background
        textColor: [255, 255, 255], // White header text
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240], // Light gray alternate row background
      },
    });
  
    // Save the PDF
    doc.save(`Class_Report_${classId}_${divClass || "All"}.pdf`);
  };
  

  return (
    <div className="payment-details-container" style={{padding:"20px;"}}>
      <h2>Payment Details</h2>
      <div className="filters">
        <div className="filter-group">
          <label>Class:</label>
          <select value={classId} onChange={handleClassChange}>
            <option value="">Select Class</option>
            {[...Array(10).keys()].map((i) => (
              <option key={i} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Division:</label>
          <select value={divClass} onChange={handleDivClassChange}>
            <option value="">Select Division</option>
            <option value="a">A</option>
            <option value="b">B</option>
            <option value="combine">Combine</option>
          </select>
        </div>
        <button onClick={handleFetchRecords} className="fetch-btn">
          Fetch Records
        </button>
        <button
          onClick={generateClassReport}
          className="fetch-btn"
          style={{backgroundColor:"#4CAF50"}}
        >
          Generate Report
        </button>
      </div>

      <table className="payment-table">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Paid Amount</th>
            <th>Payment Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {paymentRecords.length > 0 ? (
            paymentRecords.map((record) => (
              <tr key={record.STUDENT_ID}>
                <td>{record.STUDENT_ID}</td>
                <td>{record.FIRST_NAME}</td>
                <td>{record.LAST_NAME}</td>
                <td>{record.EMAIL}</td>
                <td>{record.paid_amount}</td>
                <td>{record.payment_date}</td>
                <td>{record.status || "Pending"}</td>
                <td>
                  {record.status !== "success" && (
                    <button
                      onClick={() => handlePayByCash(record.STUDENT_ID)}
                      style={{
                        marginRight: "9px",
                        backgroundColor: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        padding: "3x 3px",
                        cursor: "pointer",
                        width:"110px"
                      }}
                    >
                      Pay by Cash
                    </button>
                  )}
                  {record.status === "success" && (
                    <button
                      onClick={() => generateReceipt(record)}
                      style={{
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        padding: "0px",
                        cursor: "pointer",
                        width:"110px"
                      }}
                    >
                      Generate Receipt
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">No records found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentDetails;
