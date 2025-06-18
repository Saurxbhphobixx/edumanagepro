import React, { useEffect, useState } from "react";
import "../CSS/leave.css";

const Leave = ({ type, setEntity }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await fetch(
          `http://localhost/school/fetch_leaves.php?type=${type.toLowerCase()}`
        );
        const data = await response.json();

        if (data.success) {
          setLeaveRequests(data.data);
          if (data.data.length > 0) {
            const allColumns = Object.keys(data.data[0]);
            const filteredColumns =
              type === "Students"
                ? allColumns.filter((col) => col !== "STAFF_ID")
                : allColumns.filter((col) => col !== "STUDENT_ID");
            setColumns(filteredColumns);
          }
        } else {
          setError("No pending leave requests found.");
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch leave requests.");
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, [type]);

  const handleAction = async (action, leaveId) => {
    try {
      const response = await fetch(
        `http://localhost/school/update_leave_status.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, leave_id: leaveId }),
        }
      );
      const data = await response.json();

      if (data.success) {
        setLeaveRequests(leaveRequests.filter((leave) => leave.LEAVE_ID !== leaveId));
      } else {
        setError(data.error || "Failed to update leave request.");
      }
    } catch (err) {
      setError("An error occurred while processing the request.");
    }
  };

  return (
    <div className="leave-dashboard">
      <button className="back-btn" onClick={() => setEntity(null)}>
        Back to Entities
      </button>
      <h2 className="leave-dashboard-title">{type} Leave Requests</h2>
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : leaveRequests.length > 0 ? (
        <table className="leave-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column.replace("_", " ")}</th>
              ))}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map((leave) => (
              <tr key={leave.LEAVE_ID}>
                {columns.map((column) => (
                  <td key={`${leave.LEAVE_ID}-${column}`}>{leave[column]}</td>
                ))}
                <td>
                  <button
                    className="btn-approve"
                    onClick={() => handleAction("approve", leave.LEAVE_ID)}
                  >
                    Approve
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleAction("reject", leave.LEAVE_ID)}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No pending leave requests found.</p>
      )}
    </div>
  );
};

export default Leave;
