import React, { useState, useEffect } from "react";
import axios from "axios";
import "../CSS/OPMarksEdit.css";

const OPMarksEdit = () => {
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [marksData, setMarksData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await axios.get("http://localhost/school/OPMarksEdit.php", {
        params: { action: "getGrades" }
      });
      if (Array.isArray(response.data)) {
        setGrades(response.data);
      }
    } catch (error) {
      setError("Failed to fetch grades");
    }
  };

  const handleGradeChange = async (e) => {
    const gradeId = e.target.value;
    setSelectedGrade(gradeId);
    setSelectedStudent("");
    setMarksData([]);
    if (gradeId) {
      try {
        const response = await axios.get("http://localhost/school/OPMarksEdit.php", {
          params: { action: "getStudents", classId: gradeId }
        });
        setStudents(response.data);
      } catch (error) {
        setError("Failed to fetch students");
      }
    }
  };

  const handleStudentChange = async (e) => {
    const studentId = e.target.value;
    setSelectedStudent(studentId);
    if (studentId) {
      try {
        const response = await axios.get("http://localhost/school/OPMarksEdit.php", {
          params: {
            action: "getStudentMarks",
            studentId,
            classId: selectedGrade
          }
        });
        if (response.data.marks) {
          setMarksData(response.data.marks);
        }
      } catch (error) {
        setError("Failed to fetch marks");
      }
    }
  };

  const handleMarksChange = (index, field, value) => {
    const newMarks = [...marksData];
    newMarks[index][field] = parseFloat(value) || 0;
    newMarks[index].SUBJECT_TOTAL = 
      parseFloat(newMarks[index].INTERNAL_MARKS || 0) + 
      parseFloat(newMarks[index].EXTERNAL_MARKS || 0);
    setMarksData(newMarks);
  };

  const handleSaveChanges = async () => {
    try {
      const formData = {
        action: "updateMarks",
        studentId: selectedStudent,
        classId: selectedGrade,
        marks: marksData.map(mark => ({
          SUBJECT_NAME: mark.SUBJECT_NAME,
          INTERNAL_MARKS: parseFloat(mark.INTERNAL_MARKS) || 0,
          EXTERNAL_MARKS: parseFloat(mark.EXTERNAL_MARKS) || 0,
          SUBJECT_TOTAL: parseFloat(mark.SUBJECT_TOTAL) || 0
        }))
      };

      const response = await axios.post(
        "http://localhost/school/OPMarksEdit.php",
        formData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        alert("Marks updated successfully!");
        // Refresh marks data
        handleStudentChange({ target: { value: selectedStudent }});
      } else {
        throw new Error(response.data.error || 'Failed to update marks');
      }
    } catch (error) {
      setError(error.message);
      alert("Error updating marks: " + error.message);
    }
  };

  return (
    <div className="marks-edit-container">
      <h2>Edit Marks</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>Select Grade:</label>
        <select value={selectedGrade} onChange={handleGradeChange}>
          <option value="">Select Grade</option>
          {grades.map((grade, index) => (
            <option key={index} value={grade}>{grade}</option>
          ))}
        </select>
      </div>

      {selectedGrade && (
        <div className="form-group">
          <label>Select Student:</label>
          <select value={selectedStudent} onChange={handleStudentChange}>
            <option value="">Select Student</option>
            {students.map((student, index) => (
              <option key={index} value={student.STUDENT_ID}>
                {student.STUDENT_ID}
              </option>
            ))}
          </select>
        </div>
      )}

      {marksData.length > 0 && (
        <div className="marks-table">
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Internal Marks</th>
                <th>External Marks</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {marksData.map((mark, index) => (
                <tr key={index}>
                  <td>{mark.SUBJECT_NAME}</td>
                  <td>
                    <input
                      type="number"
                      value={mark.INTERNAL_MARKS}
                      onChange={(e) => handleMarksChange(index, "INTERNAL_MARKS", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={mark.EXTERNAL_MARKS}
                      onChange={(e) => handleMarksChange(index, "EXTERNAL_MARKS", e.target.value)}
                    />
                  </td>
                  <td>{mark.SUBJECT_TOTAL}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleSaveChanges} className="save-button">
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default OPMarksEdit;
