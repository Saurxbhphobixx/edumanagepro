import React, { useState } from "react";
import "../CSS/TeachAttendance.css";
import EditAttendance from "./EditAttendance"; // Import the new component

const TeachAttendance = () => {
  const [classSelection, setClassSelection] = useState("");
  const [divSelection, setDivSelection] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewOption, setViewOption] = useState(""); // Track which card is clicked
  const [fetchRecords, setFetchRecords] = useState(false); // Track if records need to be fetched

  // Fetch students when class or division changes (for Take Attendance)
  const fetchStudents = async (classId, div) => {
    if (!classId || !div) return;
    setLoading(true);

    try {
      let endpoint = "http://localhost/school/attendance.php";
      let classIdWithDiv = "";

      if (div === "COMBINE") {
        classIdWithDiv = classId;
        endpoint += `?classId=${classIdWithDiv}`;
      } else {
        classIdWithDiv = `${classId}${div}`;
        endpoint += `?classId=${classIdWithDiv}`;
      }

      const response = await fetch(endpoint, {
        method: "GET",
        credentials: "include", // Include credentials to send cookies/session data
      });
      const result = await response.json();

      if (result.status === "success") {
        setStudents(
          result.students.map((student) => ({
            name: `${student.FIRST_NAME} ${student.LAST_NAME}`,
            rollNo: student.STUDENT_ID,
            div: student.CLASS_ID.slice(-1),
            present: null, // Default to null for attendance
            isEditable: false, // Default to non-editable
          }))
        );
      } else {
        alert(result.message);
        setStudents([]); // Clear students on error
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      alert("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  // Handle class filter change
  const handleClassChange = async (e) => {
    const classId = e.target.value;
    setClassSelection(classId);
  };

  // Handle division filter change
  const handleDivChange = async (e) => {
    const div = e.target.value;
    setDivSelection(div);
  };

  // Update attendance status (for Take Attendance)
  const handleAttendanceChange = (rollNo, isPresent) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.rollNo === rollNo ? { ...student, present: isPresent } : student
      )
    );
  };

  // Submit attendance to the backend (for Take Attendance)
  const submitChanges = async () => {
    const attendanceData = students.map((student) => ({
      rollNo: student.rollNo,
      status: student.present === true ? "Present" : "Absent",
    }));

    // Check if any attendance has been edited
    const isChanged = students.some((student, index) => {
      return (
        student.present !== null &&
        student.present !== attendanceData[index].status
      );
    });

    if (!isChanged) {
      alert("No changes in attendance to submit.");
      return; // Exit the function if no changes
    }

    let classIdWithDiv = "";
    if (divSelection === "COMBINE") {
      classIdWithDiv = classSelection;
    } else {
      classIdWithDiv = `${classSelection}${divSelection}`;
    }

    const data = {
      classId: classIdWithDiv,
      attendance: attendanceData,
    };

    try {
      const response = await fetch("http://localhost/school/attendance.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const result = await response.json();
      if (result.status === "success") {
        alert(result.message);
      } else {
        alert(result.message || "Error marking attendance");
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);
      alert("There was an error processing the request");
    }
  };

  return (
    <div
      className="attendance-container "
      style={{ backgroundColor: "#f4f4f4", padding: "20px",border: "2px solid #4b5563", margin: "20px" }}
      
    >
      {/* Back Button */}
      {viewOption && (
        <button
  onClick={() => {
    setViewOption(""); // Reset the view to the main screen
    setClassSelection(""); // Reset class selection
    setDivSelection(""); // Reset division selection
    setFetchRecords(false); // Reset the flag for fetching records
    setStudents([]); // Clear the student list
  }}
  style={{
    position: "relative",
    top: "20px",
    left: "982px",
    padding: "6px 16px",
    backgroundColor: "#7c3aed",
    color: "white",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  }}
>
  Back
</button>

      )}

      {!viewOption ? (
        <div
          className="card-container "
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
            
          }}
        >
          <div
            className="attendance-card"
            onClick={() => setViewOption("take")}
            style={{
              backgroundColor: "white",
              color: "black",
              padding: "30px",
              textAlign: "center",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              width: "48%",
              transition: "transform 0.3s ease, box-shadow 0.2s ease",
              border: "2px solid #4b5563"
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            <h2 style={{ color: "black" }}>Take Attendance 📋</h2>
          </div>
          <div
            className="attendance-card"
            onClick={() => setViewOption("edit")}
            style={{
              backgroundColor: "white",
              color: "black",
              padding: "30px",
              textAlign: "center",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              width: "48%",
              transition: "transform 0.3s ease, box-shadow 0.2s ease",
              border: "2px solid #4b5563"
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            <h2 style={{ color: "black" }}>Edit Attendance ✏️</h2>
          </div>
        </div>
      ) : viewOption === "take" ? (
        <div className="attendance-form">
          <h2>Mark Attendance</h2>
          <div>
            <label>Class:</label>
            <select value={classSelection} onChange={handleClassChange}
            style={{border: "2px solid #4b5563"}}>
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
            <select value={divSelection} onChange={handleDivChange} style={{border: "2px solid #4b5563"}}>
              <option value="">Select Div</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="COMBINE">COMBINE</option>
            </select>
          </div>

          {/* Fetch Record Button */}
          <button
            onClick={() => {
              setFetchRecords(true); // Set the flag to show records
              fetchStudents(classSelection, divSelection); // Fetch the students
            }}
            style={{
              backgroundColor: "#45a049",
              color: "white",
              padding: "10px 20px",
              borderRadius: "5px",
              marginTop: "20px",
            }}
          >
            Fetch Records
          </button>

          {loading ? (
            <p>Loading students...</p>
          ) : (
            classSelection &&
            divSelection &&
            fetchRecords && ( // Only display records if fetchRecords is true
              <div className="student-list" style={{ marginTop: "30px", width: "100%" }}>
                <h3 style={{ fontSize: "22px", color: "#333", marginBottom: "20px" }}>
                  Student List for Class {classSelection}{" "}
                  {divSelection === "COMBINE" ? "Combined" : divSelection}
                </h3>
                {students.length > 0 ? (
                  students.map((student) => (
                    <div
                      key={student.rollNo}
                      style={{
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
                      }}
                    >
                      <span style={{ fontSize: "16px", color: "#333" }}>
                        <strong>(ID: {student.rollNo})</strong> {student.name}
                      </span>
                      <label style={{ display: "flex", alignItems: "center" }}>
                        Present
                        <input
                          type="checkbox"
                          checked={student.present === true}
                          onChange={(e) =>
                            handleAttendanceChange(student.rollNo, e.target.checked)
                          }
                          style={{
                            marginLeft: "10px",
                            transform: "scale(1.2)",
                          }}
                        />
                      </label>
                    </div>
                  ))
                ) : (
                  <p>No students found for the selected filters</p>
                )}
              </div>
            )
          )}

          {/* Submit Attendance Button (Only visible after Fetch Record) */}
          {fetchRecords && (
            <div style={{ textAlign: "right", marginTop: "20px" }}>
              <button
                onClick={submitChanges}
                disabled={students.length === 0}
                style={{
                  backgroundColor: "#7c3aed",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  marginTop: "20px",
                }}
              >
                Submit Attendance
              </button>
            </div>
          )}
        </div>
      ) : (
        <EditAttendance onBack={() => setViewOption("")} />
      )}
    </div>
  );
};

export default TeachAttendance;
