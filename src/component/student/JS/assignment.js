import React, { useState, useEffect } from "react";
import "../CSS/assignment.css";

const Assignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [viewMode, setViewMode] = useState("list"); // list, view, submit
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch assignments from the server
  const fetchAssignments = () => {
    fetch("http://localhost/school/assignment.php", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setAssignments(data.assignments);
        } else {
          console.error(data.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching assignments:", error);
      });
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleViewAssignment = (assignment) => {
    setCurrentAssignment(assignment);
    setViewMode("view");
  };

  const handleSubmitAssignment = (assignment) => {
    setCurrentAssignment(assignment);
    setViewMode("submit");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") {
      setErrorMessage("Please upload a valid PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("assignmentFile", file);
    formData.append("assignmentId", currentAssignment.ASSIGNMENT_ID);

    fetch("http://localhost/school/assignment.php", {
      method: "POST",
      credentials: "include",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Assignment submitted successfully!");
          setViewMode("list");
          setErrorMessage("");
          fetchAssignments(); // Reload assignments
        } else {
          setErrorMessage(data.message || "Error submitting the assignment");
        }
      })
      .catch((error) => {
        console.error("Error uploading file:", error);
        setErrorMessage("An error occurred while uploading the file.");
      });
  };

  const renderAssignmentList = () => (
    <div className="assignment-grid">
      {assignments.map((assignment) => (
        <div className="assignment-card" key={assignment.ASSIGNMENT_ID}   style = {{border:"2px solid #4b5563", padding : "15px"}}>
          <h3>{assignment.SUBJECT_NAME}</h3>
          <p>Due Date: {assignment.DUE_DATE}</p>
          <div className="assignment-actions">
            <button onClick={() => handleViewAssignment(assignment)}>View</button>
            <button onClick={() => handleSubmitAssignment(assignment)}>Submit</button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderViewAssignment = () => (
    <div className="assignment-view">
      <h2>{currentAssignment.SUBJECT_NAME}</h2>
      <div className="pdf-placeholder">
        <button
          className="view-assignment-button"
          onClick={() =>
            window.open(
              `http://localhost/school/${currentAssignment.TEACHER_ASSIGNMENT_URL}`,
              "_blank",
              "noopener noreferrer"
            )
          }
          style={{
            padding: "10px 20px",
            backgroundColor: "#7c3aed", // Purple background
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          View Assignment
        </button>
      </div>
      <button
        className="back-button"
        onClick={() => setViewMode("list")}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#dc3545", // Gray background for the back button
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Back to List
      </button>
    </div>
  );
  

  const renderSubmitAssignment = () => (
    <div className="assignment-submit">
      <h2>Submit {currentAssignment.SUBJECT_NAME}</h2>
      <form>
        <label>
          Upload File:
          <input type="file" onChange={handleFileUpload} />
        </label>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="form-actions">
          <button type="button" onClick={() => setViewMode("list")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="assignment-container" style = {{border:"2px solid #4b5563", padding: "20px"}}>
      <h1>Assignments</h1>
      {viewMode === "list" && renderAssignmentList()}
      {viewMode === "view" && renderViewAssignment()}
      {viewMode === "submit" && renderSubmitAssignment()}
    </div>
  );
};

export default Assignment;
