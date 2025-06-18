import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "../../admin/CSS/ProfileManagement.css";

const ViewStudentProfile = ({ onBack }) => {
  const [profiles, setProfiles] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchProfiles = useCallback(async () => {
    try {
      let endpoint =
        "http://localhost/school/profile_management.php?entity=TBL_STUDENT&action=view";

      if (selectedClass && selectedDivision) {
        const classId = `${selectedClass}${selectedDivision}`;
        endpoint += `&class_id=${classId}&division=${selectedDivision}`;
      }

      const response = await axios.get(endpoint);
      setProfiles(response.data);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  }, [selectedClass, selectedDivision]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleProfileClick = (profile) => {
    setSelectedProfile(profile);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProfile(null);
  };

  return (
    <div className="view-student-profile">
      <h2>View Student Profiles</h2>

      <div className="filter">
        <label htmlFor="class">Class:</label>
        <select
          id="class"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          style={{border: "2px solid #4b5563"}}
        >
          <option value="">Select Class</option>
          {[...Array(10)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>

        <label htmlFor="division">Division:</label>
        <select
          id="division"
          value={selectedDivision}
          onChange={(e) => setSelectedDivision(e.target.value)}
          style={{border: "2px solid #4b5563"}}
        >
          <option value="">Select Division</option>
          <option value="A">A</option>
          <option value="B">B</option>
        </select>
      </div>

      <div className="profiles-list" style={{margin:"10px 0",padding:"2px 5px",border: "2px solid #4b5563"}}>
        {profiles.length > 0 ? (
          <ul >
            {profiles.map((profile) => (
              <li
                key={profile.STUDENT_ID}
                onClick={() => handleProfileClick(profile)}
                style={{margin:"20px 5px",border: "2px solid #4b5563"}}
              >
                <strong>
                Student ID: {profile.STUDENT_ID}-
                </strong>{" "}
                {profile.FIRST_NAME} {profile.LAST_NAME}
                (Click to View)
              </li>
            ))}
          </ul>
        ) : (
          <p>No profiles found. Please adjust filters or try again later.</p>
        )}
      </div>

      <button onClick={onBack}>Back to Actions</button>

      {showModal && selectedProfile && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-btn" onClick={closeModal}>
              &times;
            </span>
            {selectedProfile.PROFILE_PICTURE && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "120px", // Adjust this as needed
                }}
              >
                <img
                  src={`http://localhost/school/${selectedProfile.PROFILE_PICTURE}`}
                  alt="Profile"
                  className="profile-img"
                  style={{
                    display: "block",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    borderRadius: "50%", // Optional: Makes the image circular
                    objectFit: "cover", // Ensures the image maintains its aspect ratio
                  }}
                />
              </div>
            )}

            <h2>Profile Details</h2>
            <h3>
              {selectedProfile.FIRST_NAME} {selectedProfile.LAST_NAME}
            </h3>
            <p>
              <strong>ID:</strong> {selectedProfile.STUDENT_ID}
            </p>
            <p>
              <strong>Email:</strong> {selectedProfile.EMAIL}
            </p>
            <p>
              <strong>Class:</strong> {selectedProfile.CLASS_ID}
            </p>
            <p><strong>Phone:</strong>{" "}
            {selectedProfile.PHONE_NUMBER || "N/A"}</p>
            <div className="info-column">

  <p>
    <strong>Address:</strong>{" "}
    {[
      selectedProfile.ADDRESS_LINE1,
      selectedProfile.ADDRESS_LINE2,
      selectedProfile.CITY,
      selectedProfile.STATE,
      selectedProfile.ZIP_CODE,
      selectedProfile.COUNTRY,
    ]
      .filter((item) => item) // Remove any empty or undefined fields
      .join(", ") || "N/A"}
      </p>
</div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ViewStudentProfile;
