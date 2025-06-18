import React, { useState, useEffect } from "react";
import "../CSS/staff_assignment.css";

const FetchAssignment = () => {
  const [classes] = useState([...Array(10)].map((_, i) => i + 1));
  const [divisions] = useState(["A", "B"]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);

  // Fetch subjects when class and division are selected
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedClass || !selectedDivision) {
        setSubjects([]);
        setSelectedSubject('');
        return;
      }

      try {
        const response = await fetch("http://localhost/school/fetch_subjects.php", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            class: selectedClass,
            division: selectedDivision,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setSubjects(data.subjects);
          setSelectedSubject('');
        } else {
          setError(data.message || "Failed to fetch subjects");
        }
      } catch (err) {
        console.error("Fetch Subjects Error:", err);
        setError("Error fetching subjects: " + err.message);
      }
    };

    fetchSubjects();
  }, [selectedClass, selectedDivision]);

  const fetchAssignments = async () => {
    if (!selectedClass || !selectedDivision || !selectedSubject) {
      setError("Please select class, division, and subject");
      return;
    }

    setLoading(true);
    setError(null);
    setAssignments([]);
    setShowTable(false);
  
    try {
      const response = await fetch("http://localhost/school/fetch_assignment.php", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          class: selectedClass,
          division: selectedDivision,
          subject: selectedSubject
        }),
      });
  
      const responseText = await response.text();
      console.log("Raw response:", responseText);
  
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        setError("Invalid server response");
        setLoading(false);
        return;
      }
  
      if (data.success && data.assignments.length > 0) {
        setAssignments(data.assignments);
        setShowTable(true);
      } else if (data.success && data.assignments.length === 0) {
        setError("No assignments found for the selected class, division, and subject.");
      } else {
        setError(data.message || "Failed to fetch assignments");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Error fetching assignments: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const openAssignment = (url) => {
    window.open(url, '_blank');
  };

  if (showTable) {
    return (
      <div 
        style={{
          padding: "30px",
          fontFamily: 'Arial, sans-serif',
          maxWidth: '1200px',
          margin: '0 auto',
          border: "2px solid #4b5563"
        }}
      >
        <h2 style={{ color: "black", marginBottom: "20px" }}>
          Assignments for Class {selectedClass} Division {selectedDivision} - {selectedSubject}
        </h2>
        
        {loading && <p>Loading assignments...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {assignments.length > 0 && (
          <table 
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              backgroundColor: '#fff'
            }}
          >
            <thead 
              style={{
                backgroundColor: ' #7c3aed',
                color: 'white'
              }}
            >
              <tr>
                <th style={tableHeaderStyle}>Student ID</th>
                <th style={tableHeaderStyle}>Name</th>
                <th style={tableHeaderStyle}>Submission Date</th>
                <th style={tableHeaderStyle}>Status</th>
                <th style={tableHeaderStyle}>Assignment</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr 
                  key={assignment.ASSIGNMENT_ID}
                  style={{
                    borderBottom: '1px solid #ddd',
                    ':hover': { backgroundColor: '#f5f5f5' }
                  }}
                >
                  <td style={tableCellStyle}>{assignment.STUDENT_ID}</td>
                  <td style={tableCellStyle}>
                    {assignment.FIRST_NAME} {assignment.LAST_NAME}
                  </td>
                  <td style={tableCellStyle}>{assignment.SUBMISSION_DATE}</td>
                  <td style={tableCellStyle}>{assignment.SUBMISSION_STATUS}</td>
                  <td style={tableCellStyle}>
                    <button 
                      onClick={() => openAssignment(assignment.STUDENT_ASSIGNMENT_URL)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: ' #7c3aed',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      disabled={!assignment.STUDENT_ASSIGNMENT_URL}
                    >
                      View Assignment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button 
          onClick={() => setShowTable(false)}
          style={{
            marginTop: '20px',
            padding: '8px 16px',
            backgroundColor: ' #7c3aed',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Back to Selection
        </button>
      </div>
    );
  }

  return (
    <div className="classcir-container">
      <h2 style={{ color: "black" }}>Select Class, Division, and Subject to View Assignments</h2>
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
          textAlign: "center",
        }}
      >
        <div
          className="filter"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            width: "100%",
            alignItems: "center",
          }}
        >
          <label
            htmlFor="class"
            style={{ fontSize: "16px", fontWeight: "bold" }}
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
              width: "80%",
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
            style={{ fontSize: "16px", fontWeight: "bold" }}
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
              width: "80%",
            }}
          >
            <option value="">Select Division</option>
            {divisions.map((division) => (
              <option key={division} value={division}>
                {division}
              </option>
            ))}
          </select>
          <label
            htmlFor="subject"
            style={{ fontSize: "16px", fontWeight: "bold" }}
          >
            Subject:
          </label>
          <select
            id="subject"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={!selectedClass || !selectedDivision}
            style={{
              padding: "8px",
              fontSize: "14px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              width: "80%",
              backgroundColor: !selectedClass || !selectedDivision ? '#f0f0f0' : 'white'
            }}
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>

          <button 
            onClick={fetchAssignments}
            disabled={!selectedClass || !selectedDivision || !selectedSubject}
            style={{
              padding: "8px 16px",
              backgroundColor: "#7c3aed",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginTop: "15px"
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

// Inline styles for table
const tableHeaderStyle = {
  padding: '12px',
  textAlign: 'left',
  borderBottom: '1px solid #ddd'
};

const tableCellStyle = {
  padding: '12px',
  textAlign: 'left'
};

export default FetchAssignment;