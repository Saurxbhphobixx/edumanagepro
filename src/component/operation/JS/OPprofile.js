import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "../../admin/CSS/ProfileManagement.css";

const ProfileManagement = () => {
  const [entity, setEntity] = useState(null);
  const [action, setAction] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null); // For displaying full details
  const [showModal, setShowModal] = useState(false); // Modal state
  const [formData, setFormData] = useState({}); // Form state for adding records

  // Fetch profiles based on entity and action
  const fetchProfiles = useCallback(async () => {
    if (!entity) {
      console.log("No entity selected");
      return;
    }

    try {
      let endpoint = `http://localhost/school/profile_management.php?entity=${entity}&action=view`;

      // If viewing students, include class and division filters
      if (entity === "TBL_STUDENT" && selectedClass && selectedDivision) {
        const classId = `${selectedClass}${selectedDivision}`; // Combining class and division
        endpoint += `&class_id=${classId}&division=${selectedDivision}`;
      }

      console.log("Fetching from endpoint:", endpoint);

      const response = await axios.get(endpoint);

      console.log("Fetched profiles:", response.data);
      setProfiles(response.data);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      if (error.response) {
        console.error("Response error:", error.response.data);
      }
      console.error("Error message:", error.message);
    }
  }, [entity, selectedClass, selectedDivision]);

  useEffect(() => {
    if (entity) {
      fetchProfiles();
    }
  }, [action, entity, fetchProfiles]);

  useEffect(() => {
    if (action === "add" || action === "update") {
      setFormData({}); // Clear form data when switching actions
      setSelectedProfile(null); // Clear selected profile in case of "update"
    }
  }, [action]);
  useEffect(() => {
    if (action !== "view") {
      setSelectedClass(""); // Reset the class filter
      setSelectedDivision(""); // Reset the division filter
    }
  }, [action]);

  const handleProfileClick = (profile) => {
    setSelectedProfile(profile);
    setShowModal(true); // Show the modal
  };
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };
  const closeModal = () => {
    setShowModal(false); // Hide the modal
  };

  const handleInputChange = async (e) => {
    const { name, value, files } = e.target;

    if (name === "PROFILE_PICTURE" && files && files[0]) {
      try {
        const base64 = await convertFileToBase64(files[0]);
        setFormData((prev) => ({
          ...prev,
          [name]: base64,
        }));
      } catch (error) {
        console.error("Error converting file:", error);
        alert("Failed to process image file");
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  const deleteRecord = async (profileId) => {
    try {
      const response = await axios.delete(
        "http://localhost/school/profile_management.php",
        {
          data: {
            entity: "TBL_STUDENT",
            action: "delete",
            id: profileId,
          },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response.data);
      if (response.data.success) {
        alert("Record deleted successfully!");
        fetchProfiles(); // Refresh the list
      } else {
        alert(`Error: ${response.data.error || "Unknown error occurred"}`);
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };
  const deleteStaffRecord = async (staffId) => {
    try {
      const response = await axios.delete(
        "http://localhost/school/profile_management.php",
        {
          data: {
            entity: "TBL_STAFF", // Use TBL_STAFF as the entity for staff
            action: "delete", // Action to delete
            id: staffId, // Pass the staffId to identify the record
          },
          headers: {
            "Content-Type": "application/json", // Set the content type to JSON
          },
        }
      );

      console.log(response.data);

      // If the deletion was successful
      if (response.data.success) {
        alert("Staff record deleted successfully!");
        fetchProfiles(); // Refresh the list of staff profiles
      } else {
        alert(`Error: ${response.data.error || "Unknown error occurred"}`);
      }
    } catch (error) {
      console.error("Error deleting staff record:", error);
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      // Construct the API URL based on the action
      let apiUrl = `http://localhost/school/profile_management.php?entity=${entity}`;
      apiUrl += action === "update" ? "&action=update" : "&action=add";

      const response = await axios({
        method: action === "update" ? "PUT" : "POST",
        url: apiUrl,
        data: formData,
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Server response:", response.data);

      if (response.data.error) {
        alert(`Error: ${response.data.error}`);
        return;
      }

      alert(
        `${
          action === "update" ? "Record updated" : "Record added"
        } successfully!`
      );
      setFormData({});
      setAction(null);
      setSelectedProfile(null);
    } catch (error) {
      console.error(
        "Error processing request:",
        error.response?.data || error.message
      );
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div className="profile-management-container" style={{ padding: "20px" }}>
      {!entity ? (
        <div className="entity-selection">
          <h2>Select an Entity to Manage</h2>
          <div className="panel-grid">
            <div
              className="panel-btn"
              style={{ border: "2px solid #4b5563", margin: "20px" }}
              onClick={() => setEntity("TBL_STAFF")}
            >
              <div className="panel-btn-icon">👩‍🏫</div>
              <div className="panel-btn-label">Staff</div>
              <div className="panel-btn-description">Manage staff profiles</div>
            </div>
            <div
              className="panel-btn"
              onClick={() => setEntity("TBL_STUDENT")}
              style={{ border: "2px solid #4b5563", margin: "20px" }}
            >
              <div className="panel-btn-icon">🎓</div>
              <div className="panel-btn-label">Students</div>
              <div className="panel-btn-description">
                Manage student profiles
              </div>
            </div>
          </div>
        </div>
      ) : !action ? (
        <div className="action-selection">
          <h2>Manage {entity === "TBL_STAFF" ? "Staff" : "Students"}</h2>
          <div className="panel-grid">
            <div
              className="panel-btn"
              style={{ border: "2px solid #4b5563", padding: " 0px 10px" }}
              onClick={() => setAction("view")}
            >
              <div className="panel-btn-icon">👀</div>
              <div className="panel-btn-label">View Records</div>
              <div className="panel-btn-description">View existing records</div>
            </div>
            <div
              className="panel-btn"
              style={{ border: "2px solid #4b5563", padding: " 0px 10px" }}
              onClick={() => setAction("add")}
            >
              <div className="panel-btn-icon">➕</div>
              <div className="panel-btn-label">Add New Record</div>
              <div className="panel-btn-description">Add a new record</div>
            </div>
            <div
              className="panel-btn"
              style={{
                border: "2px solid #4b5563",
                padding: " 0px 10px",
                marginBottom: "20px",
              }}
              onClick={() => setAction("update")}
            >
              <div className="panel-btn-icon">✏️</div>
              <div className="panel-btn-label">Update Record</div>
              <div className="panel-btn-description">
                Update existing records
              </div>
            </div>
            <div
              className="panel-btn"
              style={{
                border: "2px solid #4b5563",
                padding: " 0px 10px",
                marginBottom: "20px",
              }}
              onClick={() => setAction("delete")}
            >
              <div className="panel-btn-icon">🗑️</div>
              <div className="panel-btn-label">Delete Record</div>
              <div className="panel-btn-description">
                Remove records permanently
              </div>
            </div>
          </div>
          <button
            className="back-btn"
            style={{ marginBottom: "20px" }}
            onClick={() => setEntity(null)}
          >
            Back to Entities
          </button>
        </div>
      ) : (
        <div className="action-content">
          <h2>
            {action.charAt(0).toUpperCase() + action.slice(1)}{" "}
            {entity === "TBL_STAFF" ? "Staff" : "Students"}
          </h2>

          {action === "view" && entity === "TBL_STUDENT" && (
            <div class="c">
              <div className="filter">
                <label htmlFor="class">Class:</label>
                <select
                  id="class"
                  value={selectedClass}
                  style={{ border: "2px solid #4b5563" }}
                  onChange={(e) => setSelectedClass(e.target.value)}
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
                  style={{ border: "2px solid #4b5563" }}
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                >
                  <option value="">Select Division</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                </select>
              </div>
            </div>
          )}

          {action === "view" &&
            entity === "TBL_STUDENT" &&
            Array.isArray(profiles) &&
            profiles.length > 0 && (
              <div
                className="profiles-list"
                style={{
                  border: "2px solid #4b5563",
                  margin: "20px 0px",
                  padding: "20px",
                }}
              >
                <h3>Students List</h3>
                <ul>
                  {profiles.map((profile) => (
                    <li
                      key={profile.STUDENT_ID}
                      onClick={() => handleProfileClick(profile)}
                      style={{ border: "2px solid #4b5563" }}
                    >
                      <strong>Student ID: {profile.STUDENT_ID}</strong>-{" "}
                      {profile.FIRST_NAME} {profile.LAST_NAME} ( Click to View )
                    </li>
                  ))}
                </ul>

                <button
                  className="back-btn"
                  style={{ padding: "3px", width: "200px" }}
                  onClick={() => setAction(null)} // Go back to the action selection
                >
                  Back to Actions
                </button>
              </div>
            )}

          {action === "view" &&
            entity === "TBL_STAFF" &&
            Array.isArray(profiles) &&
            profiles.length > 0 && (
              <div
                className="profiles-list"
                style={{
                  border: "2px solid #4b5563",
                  margin: "20px 0px",
                  padding: "20px",
                }}
              >
                <h3>Staff List</h3>
                <ul>
                  {profiles.map((profile) => (
                    <li
                      key={profile.STAFF_ID}
                      style={{ border: "2px solid #4b5563" }}
                      onClick={() => handleProfileClick(profile)}
                    >
                      <strong>Staff ID: {profile.STAFF_ID}</strong> -{" "}
                      {profile.FIRST_NAME} {profile.LAST_NAME} (Click to View)
                    </li>
                  ))}
                </ul>
                <button
                  className="back-btn"
                  onClick={() => setAction(null)} // Go back to the action selection
                >
                  Back to Actions
                </button>
              </div>
            )}

          {action === "add" &&
            (entity === "TBL_STUDENT" || entity === "TBL_STAFF") && (
              <div
                className="add-record-form"
                style={{
                  border: "2px solid #4b5563",
                  margin: "10px 0px",
                  padding: "20px",
                }}
              >
                <form onSubmit={handleFormSubmit}>
                  {/* Common Fields */}
                  <input
                    type="text"
                    name={entity === "TBL_STUDENT" ? "STUDENT_ID" : "STAFF_ID"}
                    placeholder={
                      entity === "TBL_STUDENT" ? "Student ID" : "Staff ID"
                    }
                    value={
                      formData[
                        entity === "TBL_STUDENT" ? "STUDENT_ID" : "STAFF_ID"
                      ] || ""
                    }
                    onChange={handleInputChange}
                    required
                    autoComplete="off"
                  />
                  <input
                    type="text"
                    name="FIRST_NAME"
                    placeholder="First Name"
                    value={formData.FIRST_NAME || ""}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="text"
                    name="LAST_NAME"
                    placeholder="Last Name"
                    value={formData.LAST_NAME || ""}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="email"
                    name="EMAIL"
                    placeholder="Email"
                    value={formData.EMAIL || ""}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="text"
                    name="PASSWORD"
                    placeholder="Password"
                    value={formData.PASSWORD || ""}
                    onChange={handleInputChange}
                    required
                    autoComplete="new-password"
                  />

                  {/* Conditional Fields for Student and Staff */}
                  {entity === "TBL_STUDENT" ? (
                    <>
                      <input
                        type="text"
                        name="CLASS_ID"
                        placeholder="Class ID"
                        value={formData.CLASS_ID || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        name="SUBJECT"
                        placeholder="Subject"
                        value={formData.SUBJECT || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </>
                  )}

                  <input
                    type="text"
                    name="PHONE_NUMBER"
                    placeholder="Phone Number"
                    value={formData.PHONE_NUMBER || ""}
                    onChange={handleInputChange}
                  />

                  <h4>Address Details</h4>
                  <input
                    type="text"
                    name="ADDRESS_LINE1"
                    placeholder="Address Line 1"
                    value={formData.ADDRESS_LINE1 || ""}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="text"
                    name="ADDRESS_LINE2"
                    placeholder="Address Line 2"
                    value={formData.ADDRESS_LINE2 || ""}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    name="CITY"
                    placeholder="City"
                    value={formData.CITY || ""}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="text"
                    name="STATE"
                    placeholder="State"
                    value={formData.STATE || ""}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="text"
                    name="ZIP_CODE"
                    placeholder="Zip Code"
                    value={formData.ZIP_CODE || ""}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="text"
                    name="COUNTRY"
                    placeholder="Country"
                    value={formData.COUNTRY || ""}
                    onChange={handleInputChange}
                    required
                  />

                  <input
                    type="file"
                    name="PROFILE_PICTURE"
                    accept="image/*"
                    onChange={handleInputChange}
                  />

                  <div className="form-buttons">
                    <button type="submit" className="theme-button">
                      Add Record
                    </button>
                    <button
                      type="button"
                      className="back-btn"
                      onClick={() => setAction(null)}
                    >
                      Back to Actions
                    </button>
                  </div>
                </form>
              </div>
            )}

          {action === "update" && entity === "TBL_STUDENT" && (
            <div className="filter">
              <label htmlFor="class">Class:</label>
              <select
                id="class"
                value={selectedClass}
                style={{ border: "2px solid #4b5563" }}
                onChange={(e) => setSelectedClass(e.target.value)}
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
                style={{ border: "2px solid #4b5563" }}
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
              >
                <option value="">Select Division</option>
                <option value="A">A</option>
                <option value="B">B</option>
              </select>

              {/* Records List */}
              {Array.isArray(profiles) && profiles.length > 0 && (
                <div
                  className="profiles-list"
                  style={{
                    border: "2px solid #4b5563",
                    margin: "20px 0px",
                    padding: "20px",
                  }}
                >
                  <h3>Students List</h3>
                  <ul>
                    {profiles.map((profile) => (
                      <li
                        key={profile.STUDENT_ID}
                        className="profile-item"
                        style={{ border: "2px solid #4b5563", padding: "5px" }}
                      >
                        {/* Display Student ID, Name, Class, and Division */}
                        <strong>Student ID: {profile.STUDENT_ID}</strong>{" "}
                        {profile.FIRST_NAME} {profile.LAST_NAME} (
                        {profile.CLASS_ID} {profile.DIVISION})
                        <button
                          className="edit-btn"
                          style={{ padding: "10px", fontSize: "12px" }}
                          onClick={() => {
                            setFormData(profile); // Populate form data with selected record
                            setSelectedProfile(profile);
                            setAction("update");
                          }}
                        >
                          Edit
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="back-btn"
                    style={{ padding: "2px", width: "200px" }}
                    onClick={() => setAction(null)} // Go back to the action selection
                  >
                    Back to Actions
                  </button>
                </div>
              )}

              {/* Update Form */}
              {selectedProfile && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <div className="form-header">Update Student Record</div>
                    <form onSubmit={handleFormSubmit}>
                      <input
                        type="text"
                        name="STUDENT_ID"
                        placeholder="Student ID (Read-only)"
                        value={formData.STUDENT_ID || ""}
                        onChange={handleInputChange}
                        readOnly
                        required
                      />
                      <input
                        type="text"
                        name="FIRST_NAME"
                        placeholder="First Name"
                        value={formData.FIRST_NAME || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="LAST_NAME"
                        placeholder="Last Name"
                        value={formData.LAST_NAME || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="email"
                        name="EMAIL"
                        placeholder="Email"
                        value={formData.EMAIL || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="PASSWORD"
                        placeholder="Password"
                        value={formData.PASSWORD || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="CLASS_ID"
                        placeholder="Class ID"
                        value={formData.CLASS_ID || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="PHONE_NUMBER"
                        placeholder="Phone Number"
                        value={formData.PHONE_NUMBER || ""}
                        onChange={handleInputChange}
                      />
                      <h4>Address Details</h4>
                      <input
                        type="text"
                        name="ADDRESS_LINE1"
                        placeholder="Address Line 1"
                        value={formData.ADDRESS_LINE1 || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="ADDRESS_LINE2"
                        placeholder="Address Line 2"
                        value={formData.ADDRESS_LINE2 || ""}
                        onChange={handleInputChange}
                      />
                      <input
                        type="text"
                        name="CITY"
                        placeholder="City"
                        value={formData.CITY || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="STATE"
                        placeholder="State"
                        value={formData.STATE || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="ZIP_CODE"
                        placeholder="Zip Code"
                        value={formData.ZIP_CODE || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="COUNTRY"
                        placeholder="Country"
                        value={formData.COUNTRY || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="file"
                        name="PROFILE_PICTURE"
                        accept="image/*"
                        onChange={handleInputChange}
                      />

                      <div className="form-buttons">
                        <button type="submit" className="theme-button">
                          Update Record
                        </button>
                        <button
                          type="button"
                          className="back-btn"
                          onClick={() => setSelectedProfile(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
          {action === "update" && entity === "TBL_STAFF" && (
            <>
              {/* Records List */}
              {Array.isArray(profiles) && profiles.length > 0 && (
                <div
                  className="profiles-list"
                  style={{
                    border: "2px solid #4b5563",
                    margin: "20px 0px",
                    padding: "20px",
                  }}
                >
                  <h3>Staff List</h3>
                  <ul>
                    {profiles.map((profile) => (
                      <li
                        key={profile.STAFF_ID}
                        className="profile-item"
                        style={{ border: "2px solid #4b5563", padding: "5px" }}
                      >
                        {/* Display Staff ID, Name, and Subject */}
                        <strong>Staff ID: {profile.STAFF_ID}</strong>{" "}
                        {profile.FIRST_NAME} {profile.LAST_NAME} (
                        {profile.SUBJECT})
                        <button
                          className="edit-btn"
                          onClick={() => {
                            setFormData(profile); // Populate form data with selected record
                            setSelectedProfile(profile);
                            setAction("update");
                          }}
                        >
                          Edit
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="back-btn"
                    onClick={() => setAction(null)} // Go back to the action selection
                  >
                    Back to Actions
                  </button>
                </div>
              )}

              {/* Update Form */}
              {selectedProfile && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <div className="form-header">Update Staff Record</div>
                    <form onSubmit={handleFormSubmit}>
                      <input
                        type="text"
                        name="STAFF_ID"
                        placeholder="Staff ID (Read-only)"
                        value={formData.STAFF_ID || ""}
                        onChange={handleInputChange}
                        readOnly
                        required
                      />
                      <input
                        type="text"
                        name="FIRST_NAME"
                        placeholder="First Name"
                        value={formData.FIRST_NAME || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="LAST_NAME"
                        placeholder="Last Name"
                        value={formData.LAST_NAME || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="email"
                        name="EMAIL"
                        placeholder="Email"
                        value={formData.EMAIL || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="PASSWORD"
                        placeholder="Password"
                        value={formData.PASSWORD || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="SUBJECT"
                        placeholder="Subject"
                        value={formData.SUBJECT || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="PHONE_NUMBER"
                        placeholder="Phone Number"
                        value={formData.PHONE_NUMBER || ""}
                        onChange={handleInputChange}
                      />
                      <h4>Address Details</h4>
                      <input
                        type="text"
                        name="ADDRESS_LINE1"
                        placeholder="Address Line 1"
                        value={formData.ADDRESS_LINE1 || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="ADDRESS_LINE2"
                        placeholder="Address Line 2"
                        value={formData.ADDRESS_LINE2 || ""}
                        onChange={handleInputChange}
                      />
                      <input
                        type="text"
                        name="CITY"
                        placeholder="City"
                        value={formData.CITY || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="STATE"
                        placeholder="State"
                        value={formData.STATE || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="ZIP_CODE"
                        placeholder="Zip Code"
                        value={formData.ZIP_CODE || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="COUNTRY"
                        placeholder="Country"
                        value={formData.COUNTRY || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="file"
                        name="PROFILE_PICTURE"
                        accept="image/*"
                        onChange={handleInputChange}
                      />

                      <div className="form-buttons">
                        <button type="submit" className="theme-button">
                          Update Record
                        </button>
                        <button
                          type="button"
                          className="back-btn"
                          onClick={() => setSelectedProfile(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}

          {action === "delete" && entity === "TBL_STUDENT" && (
            <div>
              <div className="filter">
                <label htmlFor="class">Class:</label>
                <select
                  id="class"
                  value={selectedClass}
                  style={{ border: "2px solid #4b5563" }}
                  onChange={(e) => setSelectedClass(e.target.value)}
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
                  style={{ border: "2px solid #4b5563" }}
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                >
                  <option value="">Select Division</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                </select>
              </div>

              {Array.isArray(profiles) && profiles.length > 0 && (
                <div
                  className="profiles-list"
                  style={{
                    border: "2px solid #4b5563",
                    margin: "20px 0px",
                    padding: "20px",
                  }}
                >
                  <h3>Students List</h3>
                  <ul>
                    {profiles.map((profile) => (
                      <li
                        key={profile.STUDENT_ID}
                        className="profile-info"
                        style={{ border: "2px solid #4b5563", padding: "5px" }}
                      >
                        {/* Display Student ID, Name, Class, and Division */}
                        <div className="profile-item">
                          <strong>Student ID: {profile.STUDENT_ID}</strong>
                          {profile.FIRST_NAME} {profile.LAST_NAME} ({" "}
                          {profile.CLASS_ID}
                          {profile.DIVISION})
                          {/* Conditionally render buttons based on action */}
                          {action === "update" ? (
                            <button
                              className="edit-btn"
                              onClick={() => {
                                setFormData(profile); // Populate form data with selected record
                                setSelectedProfile(profile);
                                setAction("update");
                              }}
                            >
                              Edit
                            </button>
                          ) : action === "delete" ? (
                            <button
                              className="edit-btn"
                              onClick={() => {
                                const confirmDelete = window.confirm(
                                  "Are you sure you want to delete this record?"
                                );
                                if (confirmDelete) {
                                  deleteRecord(profile.STUDENT_ID); // Call delete logic
                                }
                              }}
                            >
                              Delete
                            </button>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                className="back-btn"
                onClick={() => setAction(null)}
                style={{
                  width: "150px",
                  fontSize: "12px",
                  margin: "7px 0 0 0",
                }}
              >
                Back to Actions
              </button>
            </div>
          )}
          {action === "delete" && entity === "TBL_STAFF" && (
            <div>
              {/* No Filter Section for Staff */}

              {/* Records List */}
              {Array.isArray(profiles) && profiles.length > 0 && (
                <div
                  className="profiles-list"
                  style={{
                    border: "2px solid #4b5563",
                    margin: "20px 0px",
                    padding: "20px",
                  }}
                >
                  <h3>Staff List</h3>
                  <ul>
                    {profiles.map((profile) => (
                      <li
                        key={profile.STAFF_ID}
                        className="profile-info"
                        style={{ border: "2px solid #4b5563", padding: "5px" }}
                      >
                        {/* Display Staff ID, Name, and Subject */}
                        <div className="profile-item">
                          <strong>Staff ID: {profile.STAFF_ID}</strong>
                          {profile.FIRST_NAME} {profile.LAST_NAME} (
                          {profile.SUBJECT}){/* Conditionally render button */}
                          {action === "update" ? (
                            <button
                              className="edit-btn"
                              onClick={() => {
                                setFormData(profile); // Populate form data with selected record
                                setSelectedProfile(profile);
                                setAction("update");
                              }}
                            >
                              Edit
                            </button>
                          ) : action === "delete" ? (
                            <button
                              className="edit-btn"
                              onClick={() => {
                                // Handle delete logic (you can call your delete API here)
                                deleteStaffRecord(profile.STAFF_ID);
                              }}
                            >
                              Delete
                            </button>
                          ) : null}
                        </div>
                      </li>
                    ))}
                    <button
                      className="back-btn"
                      style={{
                        width: "150px",
                        fontSize: "12px",
                        margin: "7px 0 0 0",
                      }}
                      onClick={() => setAction(null)} // Go back to the action selection
                    >
                      Back to Actions
                    </button>
                  </ul>
                </div>
              )}

              {/* Update Form */}
              {selectedProfile && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <div className="form-header">Update Staff Record</div>
                    <form onSubmit={handleFormSubmit}>
                      <input
                        type="text"
                        name="STAFF_ID"
                        placeholder="Staff ID (Read-only)"
                        value={formData.STAFF_ID || ""}
                        onChange={handleInputChange}
                        readOnly
                        required
                      />
                      <input
                        type="text"
                        name="FIRST_NAME"
                        placeholder="First Name"
                        value={formData.FIRST_NAME || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="LAST_NAME"
                        placeholder="Last Name"
                        value={formData.LAST_NAME || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="email"
                        name="EMAIL"
                        placeholder="Email"
                        value={formData.EMAIL || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="PASSWORD"
                        placeholder="Password"
                        value={formData.PASSWORD || ""}
                        onChange={handleInputChange}
                        required
                      />

                      {/* Replace CLASS_ID with SUBJECT for staff */}
                      <input
                        type="text"
                        name="SUBJECT"
                        placeholder="Subject"
                        value={formData.SUBJECT || ""}
                        onChange={handleInputChange}
                        required
                      />

                      <input
                        type="text"
                        name="PHONE_NUMBER"
                        placeholder="Phone Number"
                        value={formData.PHONE_NUMBER || ""}
                        onChange={handleInputChange}
                      />

                      <h4>Address Details</h4>
                      <input
                        type="text"
                        name="ADDRESS_LINE1"
                        placeholder="Address Line 1"
                        value={formData.ADDRESS_LINE1 || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="ADDRESS_LINE2"
                        placeholder="Address Line 2"
                        value={formData.ADDRESS_LINE2 || ""}
                        onChange={handleInputChange}
                      />
                      <input
                        type="text"
                        name="CITY"
                        placeholder="City"
                        value={formData.CITY || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="STATE"
                        placeholder="State"
                        value={formData.STATE || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="ZIP_CODE"
                        placeholder="Zip Code"
                        value={formData.ZIP_CODE || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="COUNTRY"
                        placeholder="Country"
                        value={formData.COUNTRY || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="file"
                        name="PROFILE_PICTURE"
                        accept="image/*"
                        onChange={handleInputChange}
                      />

                      <div className="form-buttons">
                        <button type="submit" className="theme-button">
                          Update Record
                        </button>
                        <button
                          type="button"
                          className="back-btn"
                          onClick={() => setSelectedProfile(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal for showing profile details */}
          {showModal && selectedProfile && (
            <div className="modal">
              <div className="modal-content">
                <span className="close-btn" onClick={closeModal}>
                  &times;
                </span>
                <div className="modal-header">
                  `  {selectedProfile.PROFILE_PICTURE && (
                      <img
                        src={`http://localhost/school/${selectedProfile.PROFILE_PICTURE}`}
                        alt="Profile"
                        className="profile-img"
                      />
                    )}`
                  <h3>
                    {selectedProfile.FIRST_NAME} {selectedProfile.LAST_NAME}
                  </h3>
                </div>
                <div className="modal-body">
                  <div className="info-column">
                    <h4>Profile Details</h4>
                    <div className="info-item">
                      <strong>ID:</strong>{" "}
                      {selectedProfile.STUDENT_ID || selectedProfile.STAFF_ID}
                    </div>
                    <div className="info-item">
                      <strong>Password:</strong>{" "}
                      {selectedProfile.PASSWORD || "N/A"}
                    </div>
                    <div className="info-item">
                      <strong>Email:</strong> {selectedProfile.EMAIL}
                    </div>
                    <div className="info-item">
                      <strong>Phone:</strong>{" "}
                      {selectedProfile.PHONE_NUMBER || "N/A"}
                    </div>

                    {entity === "TBL_STUDENT" ? (
                      <div className="info-item">
                        <strong>Class:</strong>{" "}
                        {selectedProfile.CLASS_ID || "N/A"}{" "}
                        {selectedProfile.DIVISION || ""}
                      </div>
                    ) : (
                      <div className="info-item">
                        <strong>Subject:</strong>{" "}
                        {selectedProfile.SUBJECT || "N/A"}
                      </div>
                    )}
                  </div>
                  <div className="info-column">
                    <h4>Address Details</h4>
                    <div className="info-item">
                      <strong>Address Line 1:</strong>{" "}
                      {selectedProfile.ADDRESS_LINE1 || "N/A"}
                    </div>
                    <div className="info-item">
                      <strong>Address Line 2:</strong>{" "}
                      {selectedProfile.ADDRESS_LINE2 || "N/A"}
                    </div>
                    <div className="info-item">
                      <strong>City:</strong> {selectedProfile.CITY || "N/A"}
                    </div>
                    <div className="info-item">
                      <strong>State:</strong> {selectedProfile.STATE || "N/A"}
                    </div>
                    <div className="info-item">
                      <strong>Zip Code:</strong>{" "}
                      {selectedProfile.ZIP_CODE || "N/A"}
                    </div>
                    <div className="info-item">
                      <strong>Country:</strong>{" "}
                      {selectedProfile.COUNTRY || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileManagement;
