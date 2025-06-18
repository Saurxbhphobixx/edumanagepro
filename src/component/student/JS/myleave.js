import React, { useEffect, useState, useCallback } from "react";
import "../CSS/myleave.css";

const MyLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState(null);
  const [studentId, setStudentId] = useState("");
  const [formData, setFormData] = useState({
    student_id: "",
    leaveType: "",
    startDate: "",
    endDate: "",
    leaveReason: "",
    appliedDate: new Date().toISOString().split("T")[0],
  });

  const fetchProfile = useCallback(() => {
    fetch("http://localhost/school/profile.php", {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success && data.role === "student") {
          setStudentId(data.profile.STUDENT_ID);
          setFormData((prevData) => ({ ...prevData, student_id: data.profile.STUDENT_ID }));
        } else {
          throw new Error("Failed to fetch profile data");
        }
      })
      .catch((error) => {
        setError(error.message);
      });
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const fetchPendingLeaves = useCallback(() => {
    setLoading(true);
    fetch("http://localhost/school/student_leave.php", {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setLeaves(data.leaves);
        } else {
          throw new Error(data.message);
        }
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (viewMode === "view") {
      fetchPendingLeaves();
    }
  }, [viewMode, fetchPendingLeaves]);

  const validateFormData = () => {
    const { leaveType, startDate, endDate, leaveReason } = formData;
    if (!leaveType || !startDate || !endDate || !leaveReason.trim()) {
      throw new Error("Please fill in all fields");
    }
    if (new Date(startDate) > new Date(endDate)) {
      throw new Error("End date must be after start date");
    }
    if (new Date(startDate) < new Date()) {
      throw new Error("Start date cannot be in the past");
    }
  };

  const applyLeave = () => {
    try {
      validateFormData();
      fetch("http://localhost/school/student_leave.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          if (data.success) {
            alert("Leave applied successfully");
            setFormData({
              student_id: studentId,
              leaveType: "",
              startDate: "",
              endDate: "",
              leaveReason: "",
              appliedDate: new Date().toISOString().split("T")[0],
            });
            setViewMode(null);
          } else {
            throw new Error(data.message);
          }
        })
        .catch((error) => {
          alert(error.message);
        });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  if (viewMode === "apply") {
    return (
      <div className="apply-leave-form-container" style={{ padding: "10px", alignContent: "center" }}>
        <h2>Apply Leave</h2>
        <form onSubmit={(e) => { e.preventDefault(); applyLeave(); }}>
          <div className="form-group">
            <label htmlFor="student_id">Student ID:</label>
            <input type="text" id="student_id" name="student_id" value={formData.student_id} readOnly />
          </div>
          <div className="form-group">
            <label htmlFor="leaveType">Leave Type:</label>
            <select
              id="leaveType"
              name="leaveType"
              value={formData.leaveType}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>Select Leave Type</option>
              <option value="Personal">Personal</option>
              <option value="Medical">Medical</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="startDate">Start Date:</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="endDate">End Date:</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="leaveReason">Reason:</label>
            <textarea
              id="leaveReason"
              name="leaveReason"
              value={formData.leaveReason}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="appliedDate">Applied Date:</label>
            <input type="date" id="appliedDate" name="appliedDate" value={formData.appliedDate} readOnly />
          </div>
          <div className="button-container">
            <button type="submit" className="apply-button" style={{ padding: "8px", margin: "10px" }}>
              Apply Leave
            </button>
            <button
              type="button"
              className="back-button"
              style={{ padding: "8px", width: "100px", margin: "10px" }}
              onClick={() => setViewMode(null)}
            >
              Back
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (viewMode === "view") {
    if (loading) {
      return <div>Loading...</div>;
    }
    if (error) {
      return <div className="error">{error}</div>;
    }
    return (
      <div className="leave-container" style={{ padding: "30px" }}>
        <h2 style={{ color: "black" }}>Leave Status</h2>
        <table className="leave-table" style={{ margin: "10px" }}>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Applied Date</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <tr key={leave.LEAVE_ID}>
                <td>{leave.STUDENT_ID}</td>
                <td>{leave.LEAVE_TYPE}</td>
                <td>{leave.START_DATE}</td>
                <td>{leave.END_DATE}</td>
                <td>{leave.LEAVE_REASON}</td>
                <td>{leave.LEAVE_STATUS}</td>
                <td>{leave.APPLIED_DATE}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          className="back-button"
          style={{ padding: "8px", width: "90px", margin: "20px" }}
          onClick={() => setViewMode(null)}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="card-container" style={{ border: "2px solid #4b5563", backgroundColor: "#f4f4f4" }}>
      <div className="card" onClick={() => setViewMode("apply")} style={{ margin: "30px" }}>
        <h2 style={{ color: "black" }}>Apply Leave</h2>
      </div>
      <div className="card" onClick={() => setViewMode("view")} style={{ margin: "30px" }}>
        <h2 style={{ color: "black" }}>Leave Status</h2>
      </div>
    </div>
  );
};

export default MyLeave;
