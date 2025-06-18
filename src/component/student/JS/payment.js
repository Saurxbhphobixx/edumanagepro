import React, { useState, useEffect } from "react";
import "../CSS/payment.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const Payment = () => {
  const [feeDetails, setFeeDetails] = useState(null);
  const [profileDetails, setProfileDetails] = useState(null); // New state to hold profile details
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch fee details and profile details when component mounts
  useEffect(() => {
    const fetchFeeDetails = async () => {
      try {
        const response = await fetch("http://localhost/school/payment_api.php", {
          method: "GET",
          credentials: "include",
        });

        const result = await response.json();
        if (result.status === "success") {
          setFeeDetails(result.data);
        } else {
          setError(result.message || "Unknown error");
        }
      } catch (error) {
        setError("Failed to fetch fee details. Please try again later.");
        console.error("Error fetching fee details:", error);
      }
    };

    const fetchProfileDetails = async () => {
      try {
        const response = await fetch("http://localhost/school/profile.php", {
          method: "GET",
          credentials: "include",
        });

        const result = await response.json();
        if (result.success) {
          setProfileDetails(result.profile); // Set profile details
        } else {
          setError(result.message || "Unknown error");
        }
      } catch (error) {
        setError("Failed to fetch profile details. Please try again later.");
        console.error("Error fetching profile details:", error);
      }
    };

    fetchFeeDetails();
    fetchProfileDetails();
  }, []);

  const calculatePaidFees = () => {
    return feeDetails.fees_details.reduce(
      (total, fee) => total + parseFloat(fee.paid_amount),
      0
    );
  };

  const generateReceipt = (fee) => {
    const doc = new jsPDF();

    // Add receipt header
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0); // Set font color to black
    doc.text("Payment Receipt", 105, 20, { align: "center" });

    // Add student information (student name, student ID, class)
    if (profileDetails) {
      doc.setFontSize(12);
      doc.text(`Student Name: ${profileDetails.FIRST_NAME} ${profileDetails.LAST_NAME}`, 20, 30);
      doc.text(`Student ID: ${profileDetails.STUDENT_ID}`, 20, 40);
      doc.text(`Class: ${profileDetails.CLASS_ID}`, 20, 50);
    }

    // Add table with payment details
    autoTable(doc, {
      head: [["Field", "Details"]],
      body: [
        ["Payment ID", fee.payment_id || "N/A"],
        ["Payment Method", fee.payment_method || "N/A"],
        ["Payment Status", fee.status || "Pending"],
        ["Paid Amount", fee.paid_amount !== null && fee.paid_amount !== undefined ? fee.paid_amount.toString() : "N/A"],
        ["Payment Date", new Date(fee.payment_date).toLocaleDateString("en-GB") || "N/A"],
      ],
      startY: 60, // Position where the table starts
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
    doc.save(`Receipt_${fee.payment_id}.pdf`);
  };

  const handlePayment = async () => {
    const pendingFees = feeDetails.total_fees - calculatePaidFees();

    if (pendingFees <= 0) {
      alert("No pending fees to pay.");
      return;
    }

    setLoading(true); // Start loading

    try {
      const response = await fetch("http://localhost/school/payment_api.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: pendingFees * 100 }), // Amount in paise
        credentials: "include",
      });

      const result = await response.json();

      if (result.status === "success") {
        const { order_id, amount } = result.data;

        const options = {
          key: "rzp_test_hKjJdeCwk52Atj", // Use your Razorpay test key
          amount: amount,
          currency: "INR",
          name: "School Payment",
          description: "Payment for school fees",
          image: "https://your-logo-url.com",
          order_id: order_id,
          handler: async (response) => {
            const paymentDetails = {
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              signature: response.razorpay_signature,
            };

            // Send payment details to backend for verification
            const confirmResponse = await fetch("http://localhost/school/payment_api.php", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(paymentDetails),
              credentials: "include",
            });

            const confirmResult = await confirmResponse.json();

            // Handle success or failure based on backend response
            if (confirmResult.status === "success") {
              alert("Payment successful!"); // Display success message

              // Re-fetch fee details after successful payment
              const fetchFeeDetails = async () => {
                try {
                  const response = await fetch("http://localhost/school/payment_api.php", {
                    method: "GET",
                    credentials: "include",
                  });

                  const result = await response.json();
                  if (result.status === "success") {
                    setFeeDetails(result.data); // Update fee details
                  } else {
                    setError(result.message || "Unknown error");
                  }
                } catch (error) {
                  setError("Failed to fetch fee details. Please try again later.");
                  console.error("Error fetching fee details:", error);
                }
              };

              fetchFeeDetails(); // Fetch updated fee details
            } else {
              alert("Payment verification failed. Please try again.");
            }

            setLoading(false); // Stop loading
          },
          prefill: {
            name: feeDetails.student_name || "Student Name",
            email: "student@example.com",
            contact: "1234567890",
          },
          theme: {
            color: "#F37254",
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        alert("Failed to create order. Please try again later.");
        setLoading(false); // Stop loading
      }
    } catch (error) {
      console.error("Error during Razorpay integration:", error);
      alert("Payment failed. Please try again later.");
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="payment-container" style={{ border: "2px solid #4b5563", padding: "10px" }}>
      <h2 style={{ color: "#7c3aed" }}>Payment Summary</h2>

      {feeDetails ? (
        <div className="table-container">
          <h3>{feeDetails.student_name}</h3> {/* Display student name */}
          <table className="payment-summary-table">
            <thead>
              <tr>
                <th>Detail</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Fees</td>
                <td>{feeDetails.total_fees}</td>
              </tr>
              <tr>
                <td>Paid Fees</td>
                <td>{calculatePaidFees()}</td>
              </tr>
              <tr>
                <td>Pending Fees</td>
                <td>{feeDetails.total_fees - calculatePaidFees()}</td>
              </tr>
            </tbody>
          </table>

          <h4 style={{ fontWeight: "bolder" }}>Payment History</h4>
          <table className="payment-history-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Action</th> {/* New column for Generate Receipt */}
              </tr>
            </thead>
            <tbody>
              {feeDetails.fees_details.map((fee, index) => (
                <tr key={index}>
                  <td>{fee.payment_id}</td>
                  <td>{fee.payment_method}</td>
                  <td>{fee.status}</td>
                  <td>{fee.paid_amount}</td>
                  <td>{new Date(fee.payment_date).toLocaleDateString("en-GB")}</td>
                  <td>
                    <button onClick={() => generateReceipt(fee)}>Generate Receipt</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="pay-now-button" onClick={handlePayment} disabled={loading}>
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </div>
      ) : (
        <p>Loading fee details...</p>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Payment;
