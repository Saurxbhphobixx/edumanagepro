import React, { useState } from "react";
import "../CSS/TeachAttendance.css";

const EditAttendance = ({ onBack }) => {
  const [classSelection, setClassSelection] = useState("");
  const [divSelection, setDivSelection] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch attendance data based on class, div, and date
  const fetchAttendance = async () => {
    if (!classSelection || !divSelection || !selectedDate) {
      alert("Please select class, division, and date.");
      return;
    }

    setLoading(true);
    try {
      let classIdWithDiv = "";
      
      // Handle "COMBINE" division logic
      if (divSelection === "COMBINE") {
        classIdWithDiv = classSelection; // Only class is used when COMBINE
      } else {
        classIdWithDiv = `${classSelection}${divSelection}`; // Combine class and division for other divisions
      }

      const endpoint = `http://localhost/school/editAttendance.php?classId=${classIdWithDiv}&date=${selectedDate}`;
      const response = await fetch(endpoint, {
        method: "GET",
        credentials: "include",
      });

      const result = await response.json();

      if (result.status === "success") {
        setStudents(
          result.students.map((student) => ({
            attendanceId: student.attendanceId, // Ensure attendanceId is included
            name: student.name, // Corrected to match response
            rollNo: student.studentId, // Corrected to match response
            div: student.classId.slice(-1), // Corrected to match response
            present: student.status === true, // True for present
          }))
        );
      } else {
        alert(result.message || "No students found.");
        setStudents([]);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      alert("Failed to fetch attendance records.");
    } finally {
      setLoading(false);
    }
  };

  // Submit the changes to the backend
  const submitChanges = async () => {
    const attendanceData = students.map((student) => ({
      attendanceId: student.attendanceId,  // Ensure attendanceId is included
      status: student.present ? "Present" : "Absent",
    }));
  
    const data = {
      classId: `${classSelection}${divSelection}`,
      date: selectedDate,
      attendance: attendanceData,
    };
  
    try {
      const response = await fetch("http://localhost/school/editAttendance.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
  
      const result = await response.json();
      if (result.status === "success") {
        alert(result.message);
      } else {
        alert(result.message || "Error submitting attendance changes.");
      }
    } catch (error) {
      console.error("Error submitting attendance changes:", error);
      alert("There was an error processing the request.");
    }
  };

  const handleAttendanceChange = (rollNo, isPresent) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.rollNo === rollNo ? { ...student, present: isPresent } : student
      )
    );
  };

  return (
    <div>
    
      <h2>Edit Attendance</h2>
      <div className="attendance-form">
        <div>
          <label>Class:</label>
          <select
            value={classSelection}
            onChange={(e) => setClassSelection(e.target.value)}
            style={{ border: "2px solid #4b5563"}}
          >
            <option value="">Select Class</option>
            {Array.from({ length: 10 }, (_, index) => (
              <option key={index} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </select>
        </div>
  
        <div>
          <label>Div:</label>
          <select
            value={divSelection}
            onChange={(e) => setDivSelection(e.target.value)}
            style={{ border: "2px solid #4b5563"}}
          >
            <option value="">Select Div</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="COMBINE">COMBINE</option>
          </select>
        </div>
  
        <div>
          <label>Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ border: "2px solid #4b5563"}}
          />
        </div>
  
        <button onClick={fetchAttendance} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Attendance'}
        </button>
      </div>
  
      {students.length > 0 && (
        <div className="student-list" style={{ marginTop: "30px", width: "100%" }}>
          <h3 style={{ fontSize: "22px", color: "#333", marginBottom: "20px" }}>Attendance Records</h3>
          {students.map((student) => (
            <div key={student.rollNo} style={{
                    backgroundColor: "#fff", // White background for each student item
                    padding: "15px",
                    marginBottom: "15px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    border: "2px solid #4b5563"
                  }} className="student-item">
              <span style={{ fontSize: "16px", color: "#333" }}>{student.name} (ID: {student.rollNo})</span>
              <label style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={student.present}
                  style={{
                            marginLeft: "10px",
                            transform: "scale(1.2)",
                          }}
                  onChange={(e) => handleAttendanceChange(student.rollNo, e.target.checked)}
                />
              </label>
            </div>
          ))}
        </div>
      )}
  
      {students.length > 0 && (
        <div className="attendance-summary">
          <button onClick={submitChanges} style={{
              backgroundColor: "#7c3aed",
              color: "white",
              padding: "10px 20px",
              borderRadius: "5px",
              marginTop: "20px",
            }}>Submit Changes</button>
        </div>
      )}
  

    </div>
  );
};

export default EditAttendance;
