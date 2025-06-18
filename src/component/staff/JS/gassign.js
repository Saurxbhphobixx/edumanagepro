import React, { useState } from "react";
import UploadAssignment from "./UploadAssignment";
import FetchAssignment from "./fetch_assignment";
import ViewUploadedAssignments from "./ViewUploadedAssignments"; // New component

const GiveAssignment = () => {
  const [viewMode, setViewMode] = useState(null);

  return (
    <div>
      {viewMode === null && (
        <div
          className="card-container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
            border: "2px solid #4b5563",
            padding: "20px",
          }}
        >
          {/* Upload Assignment Card */}
          <div
            onClick={() => setViewMode("upload")}
            style={{
              backgroundColor: "white",
              color: "black",
              padding: "30px",
              textAlign: "center",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              width: "30%",
              transition: "transform 0.3s ease",
              border: "2px solid #4b5563",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            <h2 style={{ color: "black", margin: 0 }}>Upload Assignment</h2>
          </div>

          {/* View Student Assignments Card */}
          <div
            onClick={() => setViewMode("view")}
            style={{
              backgroundColor: "white",
              color: "black",
              padding: "30px",
              textAlign: "center",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              width: "30%",
              transition: "transform 0.3s ease",
              border: "2px solid #4b5563",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            <h2 style={{ color: "black", margin: 0 }}>View Student Assignments</h2>
          </div>

          {/* View Uploaded Assignments Card */}
          <div
            onClick={() => setViewMode("uploaded")}
            style={{
              backgroundColor: "white",
              color: "black",
              padding: "30px",
              textAlign: "center",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              width: "30%",
              transition: "transform 0.3s ease",
              border: "2px solid #4b5563",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            <h2 style={{ color: "black", margin: 0 }}>View Uploaded Assignments</h2>
          </div>
        </div>
      )}

      {/* Conditional rendering based on viewMode */}
      {viewMode === "upload" && <UploadAssignment />}
      {viewMode === "view" && <FetchAssignment />}
      {viewMode === "uploaded" && <ViewUploadedAssignments />}
    </div>
  );
};

export default GiveAssignment;
