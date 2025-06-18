import React, { useState, useEffect, useCallback } from "react";
import "../CSS/curriculum.css";

const Curriculum = () => {
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
      const classDivision = `${selectedClass}${selectedDivision}`; // Combine class and division, e.g. "1A"

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

  const handleFileInputChange = (event) => {
    const pdfFile = event.target.files[0];
    if (!pdfFile) {
      alert("Please select a valid PDF file to upload.");
      return;
    }

    const formData = new FormData();
    const classDivision = `${selectedClass}${selectedDivision}`; // Combine class and division, e.g. "1A"

    formData.append("classId", classDivision); // Send combined class and division
    formData.append("pdfFile", pdfFile);

    fetch("http://localhost/school/upload_curriculum.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Upload response from backend:", data); // Debugging backend response
        if (data.success) {
          alert("PDF uploaded successfully!");

          // Trigger re-fetch after upload
          fetchPdfData(); // Re-fetch to get the newly uploaded PDF data
        } else {
          alert(data.message || "Failed to upload PDF.");
        }
      })
      .catch((error) => console.error("Error uploading PDF:", error));
  };

  const handleViewPdf = () => {
    if (pdfExists) {
      window.open(pdfUrl, "_blank"); // Open the PDF in a new tab
    } else {
      alert("No PDF available to view.");
    }
  };

  const handleRemovePdf = () => {
    const classDivision = `${selectedClass}${selectedDivision}`; // Combine class and division, e.g. "1A"

    fetch("http://localhost/school/delete_curriculum.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId: classDivision }), // Send combined class and division
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Delete response from backend:", data); // Debugging backend response
        if (data.success) {
          alert("PDF removed successfully!");
          setPdfExists(false); // Reset PDF state
          setPdfUrl(""); // Clear PDF URL
        } else {
          alert(data.message || "Failed to remove PDF.");
        }
      })
      .catch((error) => console.error("Error removing PDF:", error));
  };

  return (
    <div className="curriculum-container">
      {!selectedClass || !selectedDivision ? (
        <>
          <h2>Select Class and Division To Manage</h2>
          <div className="select-class-container" style={{border: "2px solid #4b5563"}}>
            <div className="filter">
              <label htmlFor="class">Class:</label>
              <select
                id="class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>

              <label htmlFor="division">Division:</label>
              <select
                id="division"
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
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
        <div className="subject-curriculum">
          <h2>
            Class {selectedClass} {selectedDivision} Curriculum 📖
          </h2>

          {pdfExists ? (
            <div className="pdf-actions">
              <button className="view-btn" onClick={handleViewPdf}>
                View PDF
              </button>
              <button className="remove-btn" onClick={handleRemovePdf}>
                Remove PDF
              </button>
            </div>
          ) : (
            <div className="pdf-actions">
              <input
                id="pdfFileInput"
                type="file"
                accept=".pdf"
                onChange={handleFileInputChange}
                hidden
              />
              <button
                className="add-btn"
                onClick={() => document.getElementById("pdfFileInput").click()}
              >
                Upload PDF
              </button>
            </div>
          )}
          <button
            className="back-btn"
            onClick={handleBackClick}
            style={{
              padding: "6px 14px", // Slightly smaller padding
              fontSize: "12px", // Slightly smaller font size
              backgroundColor: "#7c3aed",
              color: "white",
              border: "none",
              width:"100px",
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

export default Curriculum;
