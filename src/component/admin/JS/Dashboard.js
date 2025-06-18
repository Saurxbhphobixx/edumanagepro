import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileManagement from "../JS/ProfileManagement";
import Leave from "../JS/leave";
import Curriculum from "../JS/curriculum";
import "../CSS/Dashboard.css";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const [leaveType, setLeaveType] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (activeMenu === "Dashboard") {
      fetch("http://localhost/school/dashboardad.php")
        .then((response) => response.json())
        .then((data) => {
          setDashboardData(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching dashboard data:", error);
          setLoading(false);
        });
    }
  }, [activeMenu]);

  const handleMenuClick = (menuName) => {
    setActiveMenu(menuName);
    setLeaveType(null);
  };

  const handleLeaveTypeClick = (type) => {
    setLeaveType(type);
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userID");
    sessionStorage.clear();
    navigate("/login");
  };

  const handleHomeClick = () => {
    setActiveMenu("Dashboard");
    navigate("/dashboard");
  };

  const handleProfileClick = async () => {
    const userID = localStorage.getItem("userID");
    if (!userID) {
      alert("User ID not found. Please log in again.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost/school/profile.php?user=${userID}`,
        {
          method: "GET",
          credentials: "include", // Ensure credentials are included in the request
        }
      );

      const data = await response.json();
      if (data.success) {
        setSelectedProfile(data.profile);
        setShowModal(true);
      } else {
        alert(data.message || "Failed to fetch profile details.");
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      alert("An error occurred while fetching profile details.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProfile(null);
  };

  return (
    <div className="dashboard-container">
      {/* Conditionally render the sidebar */}
      {activeMenu !== "Dashboard" && (
        <aside className="sidebar">
          <div className="logo">EduManagePro</div>
          <ul className="menu">
            {[
              "Dashboard",
              "Manage Profile",
              "Manage Leave",
              "Manage Curriculum",
            ].map((menu) => (
              <li
                key={menu}
                className={`menu-item ${activeMenu === menu ? "active" : ""}`}
                onClick={() => handleMenuClick(menu)}
              >
                {menu}
              </li>
            ))}
          </ul>
        </aside>
      )}

      <div
        className={`main-content ${
          activeMenu === "Dashboard" ? "full-width" : ""
        }`}
      >
        <header className="header">
          <div
            className="active-menu-container"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <h1
              className="active-menu-title"
              style={{
                margin: 0,
                transform: "translateX(110px)", // Adjust the value as needed
              }}
            >
              {activeMenu === "Dashboard" ? "Admin " : ""}
              {activeMenu}
            </h1>
          </div>
          <nav>
            <ul>
              <li className="home" onClick={handleHomeClick}>
                Home
              </li>
              <li className="profile" onClick={handleProfileClick}>
                Profile
              </li>
              <li className="logout" onClick={handleLogout}>
                Logout
              </li>
            </ul>
          </nav>
        </header>

        {loading && activeMenu === "Dashboard" ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {activeMenu === "Dashboard" && (
              <>
                <section
                  className="quick-links"
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "20px", // Equal spacing between the cards
                  }}
                >
                  {["Manage Profile", "Manage Leave", "Manage Curriculum"].map(
                    (link) => (
                      <div
                        className="card"
                        key={link}
                        style={{
                          width: "200px", // Fixed width for equal sizing
                          padding: "20px",
                          textAlign: "center",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Adds subtle shadow
                          borderRadius: "8px", // Rounded corners
                        }}
                        onClick={() => handleMenuClick(link)}
                      >
                        <h3 style={{ margin: "10px 0", fontSize: "22px" }}>
                          {link}
                        </h3>
                        <button
                          style={{
                            padding: "8px 16px",
                            fontSize: "14px",
                          }}
                        >
                          View
                        </button>
                      </div>
                    )
                  )}
                </section>

                <section className="notifications">
                  <h2>Notifications</h2>
                  <h3
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {dashboardData.notifications || "No new notifications."}
                  </h3>
                </section>

                <section
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "20px",
                    margin: "10 auto",
                    padding: "20px 0",
                  }}
                >
                  <div
                    className="summary-card total-students"
                    style={{ border: "2px solid #4b5563" }}
                  >
                    <h3>Total Students</h3>
                    <p>{dashboardData.totalStudents || 0}</p>
                  </div>
                  <div
                    className="summary-card total-staff"
                    style={{ border: "2px solid #4b5563" }}
                  >
                    <h3>Total Staff</h3>
                    <p>{dashboardData.totalStaff || 0}</p>
                  </div>
                </section>
              </>
            )}

            {activeMenu === "Manage Leave" && !leaveType && (
              <div
                className="leave-management-container"
                style={{ border: "2px solid #4b5563", margin: "20px" }}
              >
                <h2>Select an Entity to Manage</h2>
                <div className="panel-grid">
                  <div
                    className="panel-btn"
                    style={{ border: "2px solid #4b5563", margin: "20px" }}
                    onClick={() => handleLeaveTypeClick("Staff")}
                  >
                    <div className="panel-btn-icon">🧑‍🏫</div>
                    <div className="panel-btn-label">Staff</div>
                    <div className="panel-btn-description">
                      Manage staff leave requests
                    </div>
                  </div>
                  <div
                    className="panel-btn"
                    style={{ border: "2px solid #4b5563", margin: "20px" }}
                    onClick={() => handleLeaveTypeClick("Students")}
                  >
                    <div className="panel-btn-icon">🎓</div>
                    <div className="panel-btn-label">Students</div>
                    <div className="panel-btn-description">
                      Manage student leave requests
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === "Manage Leave" && leaveType && (
              <Leave type={leaveType} setEntity={setLeaveType} />
            )}

            {activeMenu === "Manage Profile" && <ProfileManagement />}
            {activeMenu === "Manage Curriculum" && <Curriculum />}
          </>
        )}

        {showModal && selectedProfile && (
          <div className="modal">
            <div className="modal-content">
              <span className="close-btn" onClick={closeModal}>
                &times;
              </span>
              <div className="modal-header">
                <img
                  src="/images/profile.jpg"
                  alt="Profile"
                  className="profile-img"
                />

                <h3>
                  {selectedProfile.FIRST_NAME} {selectedProfile.LAST_NAME}
                </h3>
              </div>
              <div className="modal-body">
                <div className="info-column">
                  <div className="info-item">
                    <strong>ID:</strong> {selectedProfile.STAFF_ID}
                  </div>
                  <div className="info-item">
                    <strong>Email:</strong> {selectedProfile.EMAIL}
                  </div>
                  <div className="info-item">
                    <strong>Phone:</strong> {9451245445}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
