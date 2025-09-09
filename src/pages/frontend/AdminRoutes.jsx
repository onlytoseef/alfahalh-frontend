import React from "react";
import { Route, Routes } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import Home from "./Home";
import Staff from "./Staff";
import Students from "./Students";
import Classes from "./Classess";
import ProtectedRoute from "../../utils/ProtectedRoute";
import Users from "./Users";
import StaffDetails from "./StaffDetails";
import AttendancePage from "./AttendancePage";
import AttendanceRecord from "./AttendanceRecord";
import Profile from "./Profile";
import StudentListPage from "./StudentListPage";
import StudentFeePage from "./StudentFeePage";
import ClassFeeSummaryPage from "./ClassFeeSummaryPage";
import AlfalahAI from "./AlfalahAI";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/staff/:id" element={<StaffDetails />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:id" element={<StudentFeePage />} />
          <Route path="/student-list" element={<StudentListPage />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/users" element={<Users />} />
          <Route path="/student-attendance" element={<AttendancePage />} />
          <Route path="/attendance-record" element={<AttendanceRecord />} />
          <Route path="/class-fee-summary" element={<ClassFeeSummaryPage />} />
          <Route path="/chatbot" element={<AlfalahAI />} />
        </Route>
      </Route>
    </Routes>
  );
}
