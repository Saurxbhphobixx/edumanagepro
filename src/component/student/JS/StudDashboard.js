import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TimeTable from "../JS/timetable";
import Attendance from "../JS/attendance";
import Assignment from "../JS/assignment";
import Marks from "../JS/marks";
import Payment from "../JS/payment";
import MyCurriculum from "../JS/mycurriculum";
import Leave from "../JS/myleave";
import "../CSS/StudDashboard.css";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (activeMenu === "Dashboard") {
      setLoading(true);
      fetch("http://localhost/school/dashboard.php")
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
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userID");
    sessionStorage.clear();
    navigate("/login");
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
          credentials: "include",
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

  const renderContent = () => {
    if (loading) return <div className="loading">Loading...</div>;
  
    switch (activeMenu) {
      case "Dashboard":
        return (
          <>
            <section
              className="quick-links"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              {[
                "Time Table",
                "Attendance",
                "Assignment",
                "Marks",
                "Payment",
                "My Curriculum",
                "Leave",
              ].map((link, index) => (
                <div
                  className="card"
                  key={link}
                  style={{
                    gridColumn: index === 6 ? "2 / 3" : "auto", // Center the last container
                    textAlign: "center",
                    padding: "10px",
                    border: "2px solid #4b5563",
                    borderRadius: "5px",
                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                    cursor: "pointer",
                    marginLeft:"80px"
                  }}
                  onClick={() => handleMenuClick(link)}
                >
                  <h3>{link}</h3>
                  <button style={{ marginTop: "10px" }}>View</button>
                </div>
              ))}
            </section>
            <section
              className="notifications"
              style={{
                marginTop: "30px",
                padding: "20px",
                border: "2px solid #4b5563",
                borderRadius: "5px",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                
              }}
            >
              <h2 style={{ marginBottom: "15px" }}>Notifications</h2>
              <center>
                <h3>
                  {dashboardData.notifications ||
                    "Welcome to the School Management Dashboard!"}
                </h3>
              </center>
            </section>
          </>
        );
      case "Time Table":
        return <TimeTable />;
      case "Attendance":
        return <Attendance />;
      case "Assignment":
        return <Assignment />;
      case "Marks":
        return <Marks />;
      case "Payment":
        return <Payment />;
      case "My Curriculum":
        return <MyCurriculum />;
      case "Leave":
        return <Leave />;
      default:
        return <div>Content for {activeMenu} is under construction.</div>;
    }
  };
  

  return (
    <div className="dashboard-containerr">
      {activeMenu !== "Dashboard" && (
        <aside className="sidebar">
          <div className="logo">EduManagePro</div>
          <ul className="menu">
            {[
              "Dashboard",
              "Time Table",
              "Attendance",
              "Assignment",
              "Marks",
              "Payment",
              "My Curriculum",
              "Leave",
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
    {/* Centered title */}
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
      {activeMenu === "Dashboard" ? "Student Dashboard" : activeMenu}
    </h1>
    </div>
    {/* Navigation items aligned to the right */}
    <nav>
      <ul style={{ display: "flex", listStyle: "none", margin: 0 }}>
        <li className="home" onClick={() => setActiveMenu("Dashboard")}>
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
  {renderContent()}
</div>

      {showModal && selectedProfile && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-btn" onClick={closeModal}>
              &times;
            </span>
            <div className="modal-header">
              {selectedProfile.PROFILE_PICTURE && (
                <img
                  src={`http://localhost/school/${selectedProfile.PROFILE_PICTURE}`}
                  alt="Profile"
                  className="profile-img"
                />
              )}
              <h3>
                {selectedProfile.FIRST_NAME} {selectedProfile.LAST_NAME}
              </h3>
            </div>
            <div className="modal-body">
              <div className="info-column">
                <div className="info-item">
                  <strong>ID:</strong> {selectedProfile.STUDENT_ID || "N/A"}
                </div>
                <div className="info-item">
                  <strong>Email:</strong> {selectedProfile.EMAIL}
                </div>
                <div className="info-item">
                  <strong>Phone:</strong> {selectedProfile.PHONE_NUMBER || "N/A"}
                </div>
                <div className="info-item">
                  <strong>Class:</strong> {selectedProfile.CLASS_ID || "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;