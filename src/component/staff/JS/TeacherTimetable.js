import React, { useState } from "react";

const Timetable = () => {
  const [error, setError] = useState("");

  const handleViewTimetable = async () => {
    try {
      setError(""); // Reset error before fetching
      const response = await fetch(
        "http://localhost/school/staff_timetable.php?action=fetchTimetable",
        {
          method: "GET",
          credentials: "include", // Include cookies
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const text = await response.text(); // Get raw response text
      console.log("Raw Response:", text); // Debug log for raw response

      // Check if the response is valid JSON
      try {
        const data = JSON.parse(text);
        console.log("API Response:", data); // Debug log for API response

        if (data.success) {
          if (data.timetable) {
            const pdfUrl = `http://localhost/school/${data.timetable}`;
            window.open(pdfUrl, "_blank");
          } else {
            setError("No timetable available for your class.");
          }
        } else {
          setError(data.message || "Failed to fetch timetable.");
        }
      } catch (err) {
        console.error("Invalid JSON response:", err); // Log JSON parse errors
        setError("Received invalid response from the server.");
      }
    } catch (err) {
      console.error("Error fetching timetable:", err); // Debug log for errors
      setError("Failed to load the timetable. Please try again later.");
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "150px",
        left: "58%",
        transform: "translateX(-50%)",
        width: "90%",
        maxWidth: "500px",
        backgroundColor: "#f9f9f9",
        padding: "20px",
        border: "2px solid #4b5563",
        borderRadius: "8px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>Timetable</h1>
        {error && (
          <div
            style={{
              color: "red",
              fontSize: "14px",
              marginBottom: "15px",
            }}
          >
            {error}
          </div>
        )}
        <button
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#7c3aed",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={handleViewTimetable}
        >
          View Timetable
        </button>
      </div>
    </div>
  );
};

export default Timetable;
