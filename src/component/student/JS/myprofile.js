import React, { useState } from "react";
import "../CSS/myprofile.css";

const MyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "123-456-7890",
    address: "123 Main St, Springfield",
    dob: "1990-01-01",
    gender: "Male",
    course: "Computer Science",
    enrollmentNumber: "CS20230001",
  });

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSave = () => {
    setIsEditing(false);
    console.log("Profile saved:", profile);
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected file:", file);
    }
  };

  return (
    <div className="profile-container">
      <h1>My Profile</h1>
      <div className="profile-card">
        <div className="profile-image">
          <img
            src="https://via.placeholder.com/150"
            alt="Profile"
            className="profile-avatar"
          />
          {isEditing && (
            <>
              <input
                type="file"
                id="profile-picture-input"
                onChange={handleProfilePictureChange}
                style={{ display: "none" }}
              />
              <label htmlFor="profile-picture-input" className="upload-button">
                Change Photo
              </label>
            </>
          )}
        </div>
        <div className="profile-details">
          {Object.keys(profile).map((key) => (
            <div key={key} className="profile-field">
              <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
              {isEditing ? (
                <input
                  type="text"
                  name={key}
                  value={profile[key]}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{profile[key]}</p>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="profile-actions">
        {isEditing ? (
          <button className="save-button" onClick={handleSave}>
            Save Changes
          </button>
        ) : (
          <button className="edit-button" onClick={handleEditToggle}>
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
