import React, { useState, useEffect } from "react";

const ViewUploadedAssignments = ({ onBack }) => {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetch("http://localhost/school/get_uploaded_assignment.php", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setAssignments(data.assignments);
        } else {
          alert("Failed to fetch assignments.");
        }
      })
      .catch(() => alert("Error fetching assignments."));
  }, []);

  const deleteAssignment = (assignmentId) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      fetch(`http://localhost/school/delete_assignment.php?id=${assignmentId}`, {
        method: "GET",
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("Assignment deleted successfully!");
            setAssignments(assignments.filter((assignment) => assignment.ASSIGNMENT_ID !== assignmentId));
          } else {
            alert("Failed to delete assignment: " + data.message);
          }
        })
        .catch(() => alert("Error deleting assignment."));
    }
  };

  return (
    <div style={{ padding: "20px", border: "2px solid #4b5563", borderRadius: "8px" }}>
      

      <h2 style={{ color: "black" }}>Uploaded Assignments</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ backgroundColor: "#7c3aed", color: "white", padding: "10px" , height: "35px"}}>
            <th>Class</th>
            <th>Subject</th>
            <th>Assigned Date</th>
            <th>Due Date</th>
            <th>File</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment) => (
            <tr key={assignment.ASSIGNMENT_ID} style={{ textAlign: "center", borderBottom: "1px solid #ddd", height: "50px" }}>
              <td>{assignment.CLASS_ID}</td>
              <td>{assignment.SUBJECT_NAME}</td>
              <td>{assignment.ASSIGN_DATE}</td>
              <td>{assignment.DUE_DATE}</td>
              <td>
                <a
                  href={`http://localhost/school/${assignment.TEACHER_ASSIGNMENT_URL}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: "#7c3aed",
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: "5px",
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  View File
                </a>
              </td>
              <td>
                <button
                  onClick={() => deleteAssignment(assignment.ASSIGNMENT_ID)}
                  style={{
                    backgroundColor: "red",
                    color: "white",
                    padding: "6px 12px",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "5px",
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick="./GiveAssignment"
        style={{
          backgroundColor: "#7c3aed",
          color: "white",
          padding: "8px 16px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          margin: "10px",
        }}
      >
        Back
      </button>
    </div>
  );
};

export default ViewUploadedAssignments;
