import React, { useState, useEffect } from "react";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import "../CSS/OPtimetable.css";

const OPtimetable = () => {
   const [selectedClass, setSelectedClass] = useState("");
   const [selectedDivision, setSelectedDivision] = useState("");
   const [file, setFile] = useState(null);
   const [message, setMessage] = useState("");
   const [staffList, setStaffList] = useState([]);
   const [selectedStaff, setSelectedStaff] = useState("");
   const [selectedStaffName, setSelectedStaffName] = useState("");

   useEffect(() => {
      fetchStaffList();
   }, []);

   const fetchStaffList = async () => {
      try {
         const response = await fetch("http://localhost/school/OPtimetable.php?action=getStaffList");
         const data = await response.json();
         if (data.success) {
            setStaffList(data.staffList);
         }
      } catch (error) {
         setMessage("Failed to fetch staff list");
      }
   };

   const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
         if (!selectedFile.type.includes('pdf')) {
            setMessage("Please select a PDF file");
            e.target.value = '';
            return;
         }
         setFile(selectedFile);
         setMessage("");
      }
   };

   const handleStaffChange = (e) => {
      const staffId = e.target.value;
      setSelectedStaff(staffId);
      const staff = staffList.find(s => s.STAFF_ID === staffId);
      setSelectedStaffName(staff ? staff.FIRST_NAME : "");
   };

   const handleStaffUpload = async () => {
      if (!selectedStaff || !file) {
         setMessage("Please select staff and file");
         return;
      }

      const formData = new FormData();
      formData.append("action", "uploadStaffTimetable");
      formData.append("staffId", selectedStaff);
      formData.append("file", file);

      try {
         const response = await fetch("http://localhost/school/OPtimetable.php", { method: "POST", body: formData });
         const data = await response.json();
         setMessage(data.message);
         if (data.success) {
            setFile(null);
            document.getElementById('fileInput').value = '';
         }
      } catch (error) {
         setMessage("Upload failed");
      }
   };

   const handleClassUpload = async () => {
      if (!selectedClass || !selectedDivision || !file) {
         setMessage("Please select class, division and file");
         return;
      }

      const formData = new FormData();
      formData.append("action", "uploadClassTimetable");
      formData.append("classId", `${selectedClass}${selectedDivision}`);
      formData.append("file", file);

      try {
         const response = await fetch("http://localhost/school/OPtimetable.php", { method: "POST", body: formData });
         const data = await response.json();
         setMessage(data.message);
         if (data.success) {
            setFile(null);
            document.getElementById('fileInput').value = '';
         }
      } catch (error) {
         setMessage("Upload failed");
      }
   };

   const handleView = async (type) => {
      if (type === 'staff') {
         if (!selectedStaff) {
            setMessage("Please select staff");
            return;
         }
         window.open(`http://localhost/school/OPtimetable.php?action=viewStaffTimetable&staffId=${selectedStaff}`, '_blank');
      } else {
         if (!selectedClass || !selectedDivision) {
            setMessage("Please select class and division");
            return;
         }
         window.open(`http://localhost/school/OPtimetable.php?action=viewClassTimetable&classId=${selectedClass}${selectedDivision}`, '_blank');
      }
   };

   return (
      <div className="timetable-container-opt">
         <h2>Manage Timetable</h2>
         <Tabs>
            <TabList className="opt-tabs__tab-list">
               <Tab className="opt-tabs__tab">Teacher</Tab>
               <Tab className="opt-tabs__tab">Student</Tab>
            </TabList>

            <TabPanel>
               <div className="opt-form-section">
                  <div className="opt-form-group">
                     <label>Select Staff:</label>
                     <select value={selectedStaff} onChange={handleStaffChange}>
                        <option value="">Select Staff</option>
                        {staffList.map(staff => (
                           <option key={staff.STAFF_ID} value={staff.STAFF_ID}>
                              {staff.STAFF_ID} - {staff.FIRST_NAME}
                           </option>
                        ))}
                     </select>
                  </div>

                  {selectedStaffName && (
                     <div className="opt-form-group">
                        <label>Staff Name:</label>
                        <input type="text" value={selectedStaffName} readOnly />
                     </div>
                  )}

                  <div className="opt-form-group">
                     <label>Upload Timetable (PDF only):</label>
                     <input id="fileInput" type="file" accept=".pdf" onChange={handleFileChange} />
                  </div>

                  <div className="opt-button-group">
                     <button onClick={handleStaffUpload} className="btn-upload-opt">Upload Timetable</button>
                     <button onClick={() => handleView('staff')} className="btn-view-opt">View Timetable</button>
                  </div>
               </div>
            </TabPanel>

            <TabPanel>
               <div className="opt-form-section">
                  <div className="opt-form-group">
                     <label>Select Class:</label>
                     <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                        <option value="">Select Class</option>
                        {[...Array(10)].map((_, i) => (
                           <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                     </select>
                  </div>

                  <div className="opt-form-group">
                     <label>Select Division:</label>
                     <select value={selectedDivision} onChange={(e) => setSelectedDivision(e.target.value)}>
                        <option value="">Select Division</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                     </select>
                  </div>

                  <div className="opt-form-group">
                     <label>Upload Timetable (PDF only):</label>
                     <input id="fileInput" type="file" accept=".pdf" onChange={handleFileChange} />
                  </div>

                  <div className="opt-button-group">
                     <button onClick={handleClassUpload} className="btn-upload-opt">Upload Timetable</button>
                     <button onClick={() => handleView('class')} className="btn-view-opt">View Timetable</button>
                  </div>
               </div>
            </TabPanel>
         </Tabs>

         {message && (
            <div className={`opt-message ${message.includes("success") ? "success" : "error"}`}>
               {message}
            </div>
         )}
      </div>
   );
};

export default OPtimetable;
