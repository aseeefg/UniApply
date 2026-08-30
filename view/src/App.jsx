import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import Layout from "./components/layout/Layout";
import Landing from "./pages/Landing";
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
import ProgramQuiz from "./pages/ProgramQuiz";
import BrowseUniversities from "./pages/BrowseUniversities";
import CompareUniversities from "./pages/CompareUniversities";
import Analytics from "./pages/Analytics";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
        <Routes>
            <Route path="/" element={<GuestRoute><Landing /></GuestRoute>} />
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

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
            {/* Feature 4 - Applicant Management */}
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
            {/* Feature 5 - Application Status Tracking */}
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
            <Route
              path="/quiz"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <ProgramQuiz />
                </ProtectedRoute>
              }
            />
            {/* Saved Universities + Comparison Tool */}
            <Route
              path="/universities"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <BrowseUniversities />
                </ProtectedRoute>
              }
            />
            <Route
              path="/universities/compare"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <CompareUniversities />
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
            {/* Feature 1 - Manage Users */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
            {/* Feature 4 - Analytics Dashboard */}
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Analytics />
                </ProtectedRoute>
              }
            />
        </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
