import React, { useState, useEffect, useCallback } from "react";
import "../CSS/classcir.css";

const ClassCir = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [pdfExists, setPdfExists] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  // Classes and divisions
  const classes = [...Array(10)].map((_, i) => i + 1); // Class 1 to 10
  const divisions = ["A", "B"];

  // Memoize the fetchPdfData function to prevent unnecessary re-creation
  const fetchPdfData = useCallback(() => {
    if (selectedClass && selectedDivision) {
      const classDivision = `${selectedClass}${selectedDivision}`; // Combine class and division, e.g., "1A"

      fetch(
        `http://localhost/school/get_curriculum.php?classId=${classDivision}`
      )
        .then((response) => response.json())
        .then((data) => {
          console.log("Response from backend:", data); // Debugging backend response
          setPdfExists(data.pdfExists);
          setPdfUrl(data.filePath || ""); // Use filePath as the backend response key
        })
        .catch((error) => console.error("Error fetching PDF status:", error));
    }
  }, [selectedClass, selectedDivision]); // Dependencies: selectedClass and selectedDivision

  // Effect to fetch PDF data when class/division changes
  useEffect(() => {
    fetchPdfData(); // Fetch PDF data when class or division is selected
  }, [fetchPdfData]); // Add fetchPdfData to the dependency array

  const handleBackClick = () => {
    setSelectedClass("");
    setSelectedDivision("");
    setPdfExists(false);
    setPdfUrl("");
  };

  const handleViewPdf = () => {
    if (pdfExists) {
      window.open(pdfUrl, "_blank"); // Open the PDF in a new tab
    } else {
      alert("No PDF available to view.");
    }
  };

  return (
    <div className="classcir-container">
      {!selectedClass || !selectedDivision ? (
        <>
          <h2>Select Class and Division to View Curriculum</h2>
          <div
  className="select-class-container"
  style={{
    border: "2px solid #4b5563",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto",
    padding: "15px",
    width: "350px",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    textAlign: "center", // Centering text content
  }}
>
  <div
    className="filter"
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "15px",
      width: "100%",
      alignItems: "center", // Centering dropdowns horizontally
    }}
  >
    <label
      htmlFor="class"
      style={{ fontSize: "16px", fontWeight: "bold" }} // Bold label for Class
    >
      Class:
    </label>
    <select
      id="class"
      value={selectedClass}
      onChange={(e) => setSelectedClass(e.target.value)}
      style={{
        padding: "8px",
        fontSize: "14px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        width: "80%", // Adjust width for better centering
      }}
    >
      <option value="">Select Class</option>
      {classes.map((cls) => (
        <option key={cls} value={cls}>
          {cls}
        </option>
      ))}
    </select>

    <label
      htmlFor="division"
      style={{ fontSize: "16px", fontWeight: "bold" }} // Bold label for Division
    >
      Division:
    </label>
    <select
      id="division"
      value={selectedDivision}
      onChange={(e) => setSelectedDivision(e.target.value)}
      style={{
        padding: "8px",
        fontSize: "14px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        width: "80%", // Adjust width for better centering
      }}
    >
      <option value="">Select Division</option>
      {divisions.map((division) => (
        <option key={division} value={division}>
          {division}
        </option>
      ))}
    </select>
  </div>
</div>
        </>
      ) : (
        <div className="curriculum-view">
          <h2>
            Class {selectedClass} {selectedDivision} Curriculum 📖
          </h2>

          {pdfExists ? (
            <div className="pdf-actions">
              <button className="view-btn" onClick={handleViewPdf}>
                View PDF
              </button>
            </div>
          ) : (
            <p>No curriculum available for this class and division.</p>
          )}
          <button
            className="back-btn"
            onClick={handleBackClick}
            style={{
              padding: "6px 14px",
              fontSize: "12px",
              backgroundColor: "#7c3aed",
              color: "white",
              border: "none",
              width: "100px",
              marginBottom: "6px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            ⬅ Back
          </button>
        </div>
      )}
    </div>
  );
};

export default ClassCir;
