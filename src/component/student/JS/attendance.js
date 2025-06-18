import React, { useState, useEffect, useCallback } from "react";
import { Doughnut } from "react-chartjs-2"; // Import Doughnut chart
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"; // Import Chart.js components
import "../CSS/attendance.css";

// Register the chart components
ChartJS.register(ArcElement, Tooltip, Legend);

const Attendance = () => {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [attendanceData, setAttendanceData] = useState({
    presentDates: [],
    absentDates: [],
  });
  const [error, setError] = useState(""); // Initialize error state

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const fetchAttendance = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost/school/attendance_api.php?year=${year}&month=${month}`,
        {
          credentials: "include", // Ensures session data is included
        }
      );
      const data = await response.json();
      if (data.error) {
        setError(data.error); // Set error if any occurs
      } else {
        setAttendanceData(data);
        setError(""); // Reset error if no error occurs
      }
    } catch (err) {
      setError("Failed to fetch attendance data."); // Handle fetch failure
    }
  }, [year, month]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(year, month);
  
    const dates = Array.from({ length: daysInMonth }, (_, i) => {
      // Construct the date in YYYY-MM-DD format without timezone shifts
      const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
      const dateObj = new Date(year, month, i + 1); // Create a date object for the current date
      const dayOfWeek = dateObj.toLocaleString("en-US", { weekday: "short" }); // Get the day of the week (e.g., Mon, Tue, etc.)
  
      const isPresent = attendanceData.presentDates.includes(formattedDate);
      const isAbsent = attendanceData.absentDates.includes(formattedDate);
  
      return (
        <div
          key={formattedDate}
          className={`calendar-day ${
            isPresent ? "present" : isAbsent ? "absent" : ""
          }`}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span className="day-name" style={{ fontSize: "12px", color: "#666" }}>
            {dayOfWeek} {/* Day of the week */}
          </span>
          <span className="date-number" style={{ fontSize: "16px", fontWeight: "bold" }}>
            {i + 1} {/* Date number */}
          </span>
          {isPresent && <span className="status-icon">✔</span>}
          {isAbsent && <span className="status-icon">✘</span>}
        </div>
      );
    });
  
    return dates;
  };
  

  const handlePreviousMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const calculateAttendance = () => {
    const totalLectures =
      attendanceData.presentDates.length + attendanceData.absentDates.length;
    const attendedLectures = attendanceData.presentDates.length;
    const attendancePercentage =
      totalLectures > 0
        ? ((attendedLectures / totalLectures) * 100).toFixed(2)
        : "0.00";

    return { attendedLectures, totalLectures, attendancePercentage };
  };

  const { attendedLectures, totalLectures, attendancePercentage } =
    calculateAttendance();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Define chart data
  const chartData = {
    labels: ["Attended", "Missed"],
    datasets: [
      {
        data: [attendancePercentage, 100 - attendancePercentage],
        backgroundColor: ["#4CAF50", "#FF6384"], // Green for Attended, Red for Missed
        hoverBackgroundColor: ["#4CAF50", "#FF6384"], // Green for Attended, Red for Missed
      },
    ],
  };
  

  return (
   <div
  className="attendance-container"
  style={{
    display: "flex",
    flexDirection: "column", // Stack header, calendar, and summary vertically
    alignItems: "center", // Align items in the center horizontally
    padding: "20px",
  }}
>
  {/* Attendance Header at the top */}
  <header
    className="attendance-header"
    style={{
      textAlign: "center",
      marginBottom: "20px", // Add space between the header and the content below
    }}
  >
    <button onClick={handlePreviousMonth} className="nav-button">
      ◀
    </button>
    <h2 style={{ display: "inline", margin: "0 10px" }}>
      {monthNames[month]} {year}
    </h2>
    <button onClick={handleNextMonth} className="nav-button">
      ▶
    </button>
  </header>

  {/* Calendar and Attendance Summary */}
  <div
    className="content-container"
    style={{
      display: "flex",
      justifyContent: "space-between",
      width: "100%", // Ensure it spans the full width of the container
      maxWidth: "900px", // Optional: Limit the maximum width for better layout
    }}
  >
    {/* Calendar Section */}
    <div
      className="calendar"
      style={{
        flex: 1,
        marginRight: "20px",
      }}
    >
      {renderCalendar()}
    </div>

    {/* Attendance Summary Section */}
    <div
      className="attendance-summary-container"
      style={{
        width: "240px",
        flexShrink: 0,
      }}
    >
      <div
        className="card attendance-summary"
        style={{ padding: "6px", margin: "4px", fontSize: "10px" }}
      >
        <h3 style={{ fontSize: "12px", marginBottom: "6px" }}>
          Attendance Summary
        </h3>
        <Doughnut
          data={chartData}
          width={80}
          height={80}
          options={{
            cutout: "75%", // Make the donut even thinner
            responsive: true,
            maintainAspectRatio: true,
          }}
        />
        <p style={{ color: "#333", marginTop: "6px", fontSize: "14px" }}>
          Overall Attendance: <strong>{attendancePercentage}%</strong>
        </p>
        <p style={{ color: "#333", fontSize: "14px" }}>
          Lectures Attended:<strong> {attendedLectures} / {totalLectures}</strong>
        </p>

        {/* Legend */}
        <footer className="attendance-footer" style={{ marginTop: "10px" }}>
          <div className="legend">
            <div className="legend-item present">
              <span className="status-icon" style={{ fontSize: "15px" }}>
                ✔Present
              </span>
            </div>
            <div className="legend-item absent">
              <span className="status-icon" style={{ fontSize: "15px" }}>
                ✘Absent
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  </div>

  {/* Error Message */}
  {error && (
    <div className="error-message" style={{ color: "red", marginTop: "10px" }}>
      {error}
    </div>
  )}
</div>


  );
};

export default Attendance;
