import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import theme from "./muiTheme";
import Landing from "./pages/LandingMUI";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UniversityProfile from "./pages/UniversityProfile";
import StudentProfile from "./pages/StudentProfile";
import AdminDashboard from "./pages/AdminDashboard";
import ManageUsers from "./pages/ManageUsers";
import ManageCirculars from "./pages/ManageCirculars";
import BrowseCirculars from "./pages/BrowseCirculars";
import MyApplications from "./pages/MyApplications";
import ApplicantManagement from "./pages/ApplicantManagement";
import Recommendations from "./pages/Recommendations";
import "./App.css";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* University routes */}
            <Route
              path="/university/profile"
              element={
                <ProtectedRoute allowedRoles={["university"]}>
                  <UniversityProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/university/circulars"
              element={
                <ProtectedRoute allowedRoles={["university"]}>
                  <ManageCirculars />
                </ProtectedRoute>
              }
            />
            {/* Feature 4 — Applicant Management */}
            <Route
              path="/university/applicants"
              element={
                <ProtectedRoute allowedRoles={["university"]}>
                  <ApplicantManagement />
                </ProtectedRoute>
              }
            />

            {/* Student routes */}
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/circulars"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <BrowseCirculars />
                </ProtectedRoute>
              }
            />
            {/* Feature 5 — Application Status Tracking */}
            <Route
              path="/applications"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <MyApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recommendations"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <Recommendations />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin/verifications"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            {/* Feature 1 — Manage Users */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
