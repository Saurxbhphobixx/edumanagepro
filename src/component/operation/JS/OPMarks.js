import React, { useState, useCallback } from "react";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import "../CSS/OPMarks.css";

const OPMarks = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [message, setMessage] = useState("");
  const [showMarksCard, setShowMarksCard] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [subjects, setSubjects] = useState([{
    SUBJECT_NAME: "",
    INTERNAL_MARKS: "",
    EXTERNAL_MARKS: "",
    SUBJECT_TOTAL: 0,
    TERM_YEAR: "2024-2025"
  }]);

  const fetchStudents = useCallback(async () => {
    if (!selectedClass || !selectedDivision) return;
    try {
      const classId = `${selectedClass}${selectedDivision}`;
      const response = await fetch(`http://localhost/school/OPMarks.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getStudents',
          classId: classId
        })
      });

      const data = await response.json();
      if (Array.isArray(data)) {
        setStudents(data);
        setMessage("");
      } else {
        throw new Error(data.error || "Failed to fetch students");
      }
    } catch (error) {
      setMessage("Failed to fetch students");
      setStudents([]);
    }
  }, [selectedClass, selectedDivision]);

  React.useEffect(() => {
    if (selectedClass && selectedDivision) {
      fetchStudents();
    }
  }, [selectedClass, selectedDivision, fetchStudents]);

  const handleStudentSelect = async (studentId) => {
    setSelectedStudent(studentId);
    if (!studentId) {
      setShowMarksCard(false);
      return;
    }

    if (activeTab === 0) {
      setSubjects([{
        SUBJECT_NAME: "",
        INTERNAL_MARKS: "",
        EXTERNAL_MARKS: "",
        SUBJECT_TOTAL: 0,
        TERM_YEAR: "2024-2025"
      }]);
      setShowMarksCard(true);
      return;
    }

    try {
      const classId = `${selectedClass}${selectedDivision}`;
      const response = await fetch(`http://localhost/school/OPMarks.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getStudentMarks',
          studentId: studentId,
          classId: classId
        })
      });

      const data = await response.json();
      if (data.marks && data.marks.length > 0) {
        setSubjects(data.marks);
      } else {
        setSubjects([{
          SUBJECT_NAME: "",
          INTERNAL_MARKS: "",
          EXTERNAL_MARKS: "",
          SUBJECT_TOTAL: 0,
          TERM_YEAR: "2024-2025"
        }]);
      }
      setShowMarksCard(true);
    } catch (error) {
      setMessage("Failed to fetch marks");
      setShowMarksCard(false);
    }
  };

  const handleMarksChange = (index, field, value) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index][field] = value;
    if (field === 'INTERNAL_MARKS' || field === 'EXTERNAL_MARKS') {
      const internal = parseFloat(updatedSubjects[index].INTERNAL_MARKS) || 0;
      const external = parseFloat(updatedSubjects[index].EXTERNAL_MARKS) || 0;
      updatedSubjects[index].SUBJECT_TOTAL = internal + external;
    }
    setSubjects(updatedSubjects);
  };

  const handleAddSubject = () => {
    setSubjects([...subjects, {
      SUBJECT_NAME: "",
      INTERNAL_MARKS: "",
      EXTERNAL_MARKS: "",
      SUBJECT_TOTAL: 0,
      TERM_YEAR: "2024-2025"
    }]);
  };

  const handleSaveMarks = async () => {
    if (!selectedStudent || !selectedClass || !selectedDivision) {
      setMessage("Please select all required fields");
      return;
    }

    try {
      const response = await fetch("http://localhost/school/OPMarks.php", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "updateMarks",
          studentId: selectedStudent,
          classId: `${selectedClass}${selectedDivision}`,
          marks: subjects
        })
      });
      const data = await response.json();
      if (data.success) {
        setMessage("Marks updated successfully");
      } else {
        setMessage(data.error || "Failed to save marks");
      }
    } catch (error) {
      setMessage("Failed to save marks");
    }
  };

  const handleRemoveSubject = async (index, subjectName) => {
    if (!selectedStudent || !selectedClass || !selectedDivision || !subjectName) {
      setMessage("Please select all required fields");
      return;
    }

    try {
      const response = await fetch("http://localhost/school/OPMarks.php", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "removeSubject",
          studentId: selectedStudent,
          classId: `${selectedClass}${selectedDivision}`,
          subjectName: subjectName
        })
      });
      
      const data = await response.json();
      if (data.success) {
        const updatedSubjects = subjects.filter((_, i) => i !== index);
        setSubjects(updatedSubjects.length > 0 ? updatedSubjects : [{
          SUBJECT_NAME: "",
          INTERNAL_MARKS: "",
          EXTERNAL_MARKS: "",
          SUBJECT_TOTAL: 0,
          TERM_YEAR: "2024-2025"
        }]);
        setMessage("Subject removed successfully");
      } else {
        setMessage(data.error || "Failed to remove subject");
      }
    } catch (error) {
      setMessage("Failed to remove subject");
    }
  };

  return (
    <div className="marks-container">
      <Tabs selectedIndex={activeTab} onSelect={index => {
        setActiveTab(index);
        setSelectedStudent("");
        setShowMarksCard(false);
      }}>
        <TabList>
          <Tab>Upload Marks</Tab>
          <Tab>Edit Marks</Tab>
        </TabList>

        <TabPanel>
          <div className="selection-form">
            <div className="form-group">
              <label>Select Class:</label>
              <select 
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedStudent("");
                  setShowMarksCard(false);
                }}
              >
                <option value="">Select Class</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Select Division:</label>
              <select
                value={selectedDivision}
                onChange={(e) => {
                  setSelectedDivision(e.target.value);
                  setSelectedStudent("");
                  setShowMarksCard(false);
                }}
              >
                <option value="">Select Division</option>
                <option value="A">A</option>
                <option value="B">B</option>
              </select>
            </div>

            {selectedClass && selectedDivision && (
              <div className="form-group">
                <label>Select Student:</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.STUDENT_ID} value={student.STUDENT_ID}>
                      {student.STUDENT_ID}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {showMarksCard && (
            <div className="marks-card">
              <table>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Internal Marks</th>
                    <th>External Marks</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          value={subject.SUBJECT_NAME}
                          onChange={(e) => handleMarksChange(index, "SUBJECT_NAME", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={subject.INTERNAL_MARKS}
                          onChange={(e) => handleMarksChange(index, "INTERNAL_MARKS", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={subject.EXTERNAL_MARKS}
                          onChange={(e) => handleMarksChange(index, "EXTERNAL_MARKS", e.target.value)}
                        />
                      </td>
                      <td>{subject.SUBJECT_TOTAL}</td>
                      <td>
                        <button onClick={() => handleRemoveSubject(index, subject.SUBJECT_NAME)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="button-group">
                <button onClick={handleAddSubject}>Add Subject</button>
                <button onClick={handleSaveMarks}>Save Changes</button>
              </div>
            </div>
          )}
        </TabPanel>

        <TabPanel>
          <div className="selection-form">
            <div className="form-group">
              <label>Select Class:</label>
              <select 
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedStudent("");
                  setShowMarksCard(false);
                }}
              >
                <option value="">Select Class</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Select Division:</label>
              <select
                value={selectedDivision}
                onChange={(e) => {
                  setSelectedDivision(e.target.value);
                  setSelectedStudent("");
                  setShowMarksCard(false);
                }}
              >
                <option value="">Select Division</option>
                <option value="A">A</option>
                <option value="B">B</option>
              </select>
            </div>

            {selectedClass && selectedDivision && (
              <div className="form-group">
                <label>Select Student:</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.STUDENT_ID} value={student.STUDENT_ID}>
                      {student.STUDENT_ID}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {showMarksCard && (
            <div className="marks-card">
              <table>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Internal Marks</th>
                    <th>External Marks</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          value={subject.SUBJECT_NAME}
                          onChange={(e) => handleMarksChange(index, "SUBJECT_NAME", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={subject.INTERNAL_MARKS}
                          onChange={(e) => handleMarksChange(index, "INTERNAL_MARKS", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={subject.EXTERNAL_MARKS}
                          onChange={(e) => handleMarksChange(index, "EXTERNAL_MARKS", e.target.value)}
                        />
                      </td>
                      <td>{subject.SUBJECT_TOTAL}</td>
                      <td>
  <button 
    onClick={() => handleRemoveSubject(index, subject.SUBJECT_NAME)}
    style={{
      backgroundColor: '#7c3aed',
      color: '#ffffff',
      padding: '8px 16px',
      borderRadius: '8px',
      border: '2px solid #000000',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    }}
  >
    Remove
  </button>
</td>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="button-group">
  <button 
    onClick={handleAddSubject}
    style={{
      backgroundColor: '#7c3aed',
      color: '#ffffff',
      padding: '10px 20px',
      borderRadius: '8px',
      border: '2px solid #000000',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.3s ease'
    }}
  >
    Add Subject
  </button>
  <button 
    onClick={handleSaveMarks}
    style={{
      backgroundColor: '#7c3aed',
      color: '#ffffff',
      padding: '10px 20px',
      borderRadius: '8px',
      border: '2px solid #000000',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.3s ease'
    }}
  >
    Save Changes
  </button>
</div>
            </div>
          )}
        </TabPanel>
      </Tabs>

      {message && (
        <div className={`message ${message.includes("success") ? "success" : "error"}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default OPMarks;
