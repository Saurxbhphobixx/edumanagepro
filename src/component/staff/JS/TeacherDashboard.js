import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TeacherTimetable from "../JS/TeacherTimetable";
import TeachAttendance from "../JS/TeachAttendance";
import ViewProfile from "../JS/ViewProfile";
import GAssign from "../JS/gassign";
import ClassCir from "../JS/classcir";
import TeachLeave from "../JS/teachLeave";
import "../CSS/TeacherDashboard.css";

const TeacherDashboard = () => {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [showModal, setShowModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeMenu === "Dashboard") {
      fetch("http://localhost/school/teacherdashboarddata.php") // Replace with actual API
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
          credentials: "include", // Include cookies with the request
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
    switch (activeMenu) {
      case "Dashboard":
        return (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                // minHeight: "100vh", // Ensures full viewport height
              }}
            >
              <section
                className="quick-links"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gridTemplateRows: "repeat(2, auto)",
                  gap: "80px",
                  padding: "20px",
                }}
              >
                {[
                  "View Timetable",
                  "Mark Attendance",
                  "View Student Profile",
                  "Give Assignment",
                  "View Class Curriculum",
                  "Request for Leave",
                ].map((link) => (
                  <div
                    className="card"
                    key={link}
                    onClick={() => handleMenuClick(link)}
                  >
                    <h3>{link}</h3>
                    <button>View</button>
                  </div>
                ))}
              </section>
            </div>
            <section className="notifications">
              <h2>Notifications</h2>
              <h3
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {dashboardData.notifications ||
                  "Welcome to the School Management Dashboard!"}
              </h3>
            </section>
          </>
        );
      case "View Timetable":
        return <TeacherTimetable />;
      case "Mark Attendance":
        return <TeachAttendance />;
      case "View Student Profile":
        return <ViewProfile />;
      case "Give Assignment":
        return <GAssign />;
      case "View Class Curriculum":
        return <ClassCir />;
      case "Request for Leave":
        return <TeachLeave />;
      default:
        return <div>Content for {activeMenu} is under construction.</div>;
    }
  };
  
  return (
    <div className="dashboard-container">
      {activeMenu !== "Dashboard" && (
        <aside className="sidebar">
          <div className="logo">EduManagePro</div>
          <ul className="menu">
            {[
              "Dashboard",
              "View Timetable",
              "Mark Attendance",
              "View Student Profile",
              "Give Assignment",
              "View Class Curriculum",
              "Request for Leave",
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
              {activeMenu === "Dashboard" ? "Staff " : ""} {activeMenu}
            </h1>
          </div>
          <nav>
            <ul>
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

        {loading && activeMenu === "Dashboard" ? (
          <div className="loading">Loading...</div>
        ) : (
          renderContent()
        )}
      </div>

      {showModal && selectedProfile && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-content">
              <span className="close-btn" onClick={closeModal}>
                &times;
              </span>
              <div className="modal-header">
              <img
                  src={`http://localhost/school/${selectedProfile.PROFILE_PICTURE}`}
                  alt="Profile"
                  className="profile-img"
                />
              <h3>
                {selectedProfile.FIRST_NAME} {selectedProfile.LAST_NAME}
              </h3>
              </div>
              <div>
                <strong>ID: </strong>
                {selectedProfile.STAFF_ID}
              </div>
              <div>
                <strong>Email: </strong>
                {selectedProfile.EMAIL}
              </div>
              <div>
                <strong>Phone: </strong>
                {selectedProfile.PHONE_NUMBER || "N/A"}
              </div>
              <div>
                <strong>Subject: </strong>
                {selectedProfile.SUBJECT || "N/A"}
              </div>

              {/* {selectedProfile.PROFILE_PICTURE && (
                <div>
                  <strong>Profile Picture: </strong>
                  <img
                    src={`http://localhost/school/${selectedProfile.PROFILE_PICTURE}`}
                    alt="Profile"
                    className="profile-img"
                  />
                </div>
              )} */}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
