import React, { useEffect, useState } from "react";
import "../CSS/teachLeave.css";

const TeachLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState(null); // "apply" or "view"
  const [staffId, setStaffId] = useState("");
  const [formData, setFormData] = useState({
    staff_id: "", // Pre-filled with logged-in staff's ID
    leaveType: "",
    startDate: "",
    endDate: "",
    leaveReason: "",
    appliedDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetch("http://localhost/school/profile.php", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.role === "staff") {
          setStaffId(data.profile.STAFF_ID);
          setFormData((prevData) => ({
            ...prevData,
            staff_id: data.profile.STAFF_ID,
          }));
        } else {
          setError("Failed to fetch profile data");
        }
      })
      .catch(() => {
        setError("Failed to fetch profile data");
      });
  }, []);

  useEffect(() => {
    if (viewMode === "view") {
      fetchPendingLeaves();
    }
  }, [viewMode]);

  const fetchPendingLeaves = () => {
    setLoading(true);
    fetch("http://localhost/school/staff_leave.php", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setLeaves(data.leaves || []);
        } else {
          setError(data.message || "Failed to fetch leave data");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch leave data");
        setLoading(false);
      });
  };

  const applyLeave = () => {
    fetch("http://localhost/school/staff_leave.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Leave applied successfully");
          setFormData({
            staff_id: staffId,
            leaveType: "",
            startDate: "",
            endDate: "",
            leaveReason: "",
            appliedDate: new Date().toISOString().split("T")[0],
          });
          setViewMode(null);
        } else {
          alert(data.message || "Failed to apply leave");
        }
      })
      .catch(() => {
        alert("Failed to apply leave");
      });
  };

  if (viewMode === "apply") {
    return (
      <div className="apply-leave-form-container" style = {{padding:"10px", alignContent : "center"}}>
        <h2>Apply Leave</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            applyLeave();
          }}
        >
          <div className="form-group">
            <label>Staff ID:</label>
            <input type="text" value={formData.staff_id} readOnly />
          </div>
          <div className="form-group">
            <label>Leave Type:</label>
            <select
              value={formData.leaveType}
              onChange={(e) =>
                setFormData({ ...formData, leaveType: e.target.value })
              }
              required
            >
              <option value="" disabled>
                Select Leave Type
              </option>
              <option value="Personal">Personal</option>
              <option value="Medical">Medical</option>
            </select>
          </div>
          <div className="form-group">
            <label>Start Date:</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>End Date:</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Reason:</label>
            <textarea
              value={formData.leaveReason}
              onChange={(e) =>
                setFormData({ ...formData, leaveReason: e.target.value })
              }
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label>Applied Date:</label>
            <input type="date" value={formData.appliedDate} readOnly />
          </div>
          <div className="button-container">
            <button type="submit" className="apply-button" style = {{padding:"8px", margin : "20px"}}>
              Apply Leave
            </button>
            <button
              type="button"
              className="back-button" style = {{padding:"8px", width: "100px" ,margin : "20px"}}
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
      <div className="leave-container" style={{padding : "30px"}}>
        <h2 style={{color : "black"}}>Leave Status</h2>
        <table className="leave-table">
          <thead>
            <tr>
              <th>Staff ID</th>
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
                <td>{leave.STAFF_ID}</td>
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
          className="back-button" style = {{padding:"8px", width:"90px", margin : "20px"}}
          onClick={() => setViewMode(null)}
        >
          Back
        </button>
      </div>
    );
  }
  return (


      <div className="card-container"  style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px",
          border: "2px solid #4b5563",
          padding:"20px",
          
        }}>

        <div className="card" onClick={() => setViewMode("apply")} style={{
              backgroundColor: "white",
              color: "black",
              padding: "30px",
              textAlign: "center",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              width: "68%",
              transition: "transform 0.3s ease, box-shadow 0.2s ease",
              border: "2px solid #4b5563",
              marginLeft:"100px"
            }}

            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}>
          <h2 style={{ color: "black", margin: 0 }}>Apply Leave</h2>
        </div>

        <div className="card" onClick={() => setViewMode("view")}  style={{
              backgroundColor: "white",
              color: "black",
              padding: "30px",
              textAlign: "center",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              width: "68%",
              transition: "transform 0.3s ease, box-shadow 0.2s ease",
              border: "2px solid #4b5563",
              marginRight:"100px"
            }}

            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}>
          <h2 style={{ color: "black", margin: 0 }}>Leave Status</h2>
        </div>

      </div>

  );
};
export default TeachLeave;
