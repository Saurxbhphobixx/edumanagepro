import React, { useState, useEffect } from "react";
import "../CSS/marks.css";

const Marks = () => {
  const [marksData, setMarksData] = useState([]);
  const [totalMarks, setTotalMarks] = useState(0);
  const [percentage, setPercentage] = useState("0%");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Fetch marks data for the logged-in student
    fetch("http://localhost/school/marks.php", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setMarksData(data.marks);


          // Calculate total marks and percentage based on the first row (assumes uniform data)
          if (data.marks.length > 0) {
            setTotalMarks(data.marks[0].TOTAL_MARKS);
            setPercentage(data.marks[0].PERCENTAGE);
          }
        } else {
          setErrorMessage(data.message || "Failed to fetch marks data.");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching marks:", error);
        setErrorMessage("An error occurred while fetching marks.");
        setLoading(false);
      });
  }, []);

  const renderTable = () => (
    <div className="marks-table" style = {{border: "2px solid #4b5563", padding : "20px", margin:"20px", marginLeft:"120px"}}>
      <h2>Marks Details</h2>
      <table border="2px solid #4b5563">
        <thead>
          <tr >
            <th>Subject</th>
            <th>Internal Marks</th>
            <th>External Marks</th>
            <th>Subject Total</th>
          </tr>
        </thead>
        <tbody>
          {marksData.map((entry, index) => (
            <tr key={index}>
              <td>{entry.SUBJECT_NAME}</td>
              <td>{entry.INTERNAL_MARKS}/30</td>
              <td>{entry.EXTERNAL_MARKS}/70</td>
              <td>{entry.SUBJECT_TOTAL}/100</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderSummary = () => (
    <div className="marks-summary">
      <div className="summary-card"  style = {{border: "2px solid #4b5563", width:"250px", margin:"10px"}}>
        <h3>Total Marks</h3>
        <p>{totalMarks}/400</p>
      </div>
      <div className="summary-card"  style = {{border: "2px solid #4b5563" , width:"250px" , margin:"10px"}}>
        <h3>Percentage</h3>
        <p>{percentage}%</p>
      </div>
    </div>
  );

  return (
    <div className="marks-containerr">
      {loading ? (
        <p>Loading...</p>
      ) : errorMessage ? (
        <p className="error-message">{errorMessage}</p>
      ) : (
        <>
          {renderTable()}
          {renderSummary()}
        </>
      )}
    </div>
  );
};

export default Marks;
