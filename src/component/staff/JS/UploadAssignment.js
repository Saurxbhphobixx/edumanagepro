import React, { useState, useEffect } from "react";
import "../CSS/staff_assignment.css";



const UploadAssignment = () => {
  const [staffId, setStaffId] = useState("");
   // To store logged-in staff ID
  const [formData, setFormData] = useState({
    staffId: "",
    classId: "",
    division: "",
    subjectName: "",
    assignDate: "",
    dueDate: "",
    status: "active",
    file: null,
  });
  const [classes] = useState([...Array(10)].map((_, i) => i + 1)); // Classes 1 to 10

  useEffect(() => {
    // Fetch the logged-in staff's profile
    fetch("http://localhost/school/profile.php", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.role === "staff") {
          setStaffId(data.profile.STAFF_ID);
          setFormData((prevData) => ({
            ...prevData,
            staffId: data.profile.STAFF_ID, // Pre-fill staff ID in form
          }));
        }
      })
      .catch(() => {
        console.error("Failed to fetch profile data");
      });
  }, []);

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const uploadAssignment = (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("staffId", formData.staffId);
    formDataToSend.append("classId", formData.classId + formData.division);
    formDataToSend.append("subjectName", formData.subjectName);
    formDataToSend.append("assignDate", formData.assignDate);
    formDataToSend.append("dueDate", formData.dueDate);
    formDataToSend.append("status", formData.status);
    formDataToSend.append("file", formData.file);

    fetch("http://localhost/school/staff_assignment.php", {
      method: "POST",
      body: formDataToSend,
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Assignment uploaded successfully!");
          setFormData({
            staffId: staffId,
            classId: "",
            division: "",
            subjectName: "",
            assignDate: "",
            dueDate: "",
            status: "active",
            file: null,
          });
        } else {
          alert(data.message || "Failed to upload assignment.");
        }
      })
      .catch(() => alert("Error uploading assignment."));
  };

  const handleBack = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div
      className="upload-assignment-container"
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        boxSizing: "border-box",
        backgroundColor: "#f9f9f9",
        border: "2px solid #4b5563",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ color: "black" }}>Upload Assignment</h2>
      <form onSubmit={uploadAssignment}>
        {/* Read-only Staff ID Field */}
        <div className="form-group" style={{ marginBottom: "15px" }}>
          <label>Staff ID:</label>
          <input
            type="text"
            value={formData.staffId}
            readOnly
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div className="form-group" style={{ marginBottom: "15px" }}>
          <label>Class:</label>
          <select
            value={formData.classId}
            onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
            required
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: "15px" }}>
          <label>Division:</label>
          <select
            value={formData.division}
            onChange={(e) => setFormData({ ...formData, division: e.target.value })}
            required
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">Select Division</option>
            <option value="A">A</option>
            <option value="B">B</option>
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: "15px" }}>
          <label>Subject:</label>
          <input
            type="text"
            value={formData.subjectName}
            onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
            required
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div className="form-group" style={{ marginBottom: "15px" }}>
          <label>Assignment Date:</label>
          <input
            type="date"
            value={formData.assignDate}
            onChange={(e) => setFormData({ ...formData, assignDate: e.target.value })}
            required
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div className="form-group" style={{ marginBottom: "15px" }}>
          <label>Due Date:</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>
       
        <div className="form-group" style={{ marginBottom: "15px" }}>
          <label>Upload File:</label>
          <input
            type="file"
            onChange={handleFileChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
  <button
    type="submit"
    style={{
      padding: "10px 20px",
      backgroundColor: "#28a745",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    }}
  >
    Upload
  </button>
  <button
    type="button"
    onClick={handleBack}
    style={{
      padding: "10px 20px",
      backgroundColor: "red",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    }}
  >
    Back
  </button>
</div>

      </form>
    </div>
  );
};

export default UploadAssignment;
