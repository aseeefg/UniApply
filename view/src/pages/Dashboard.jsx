import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <header>
        <h1>Welcome, {user?.name}</h1>
        <button onClick={logout}>Log out</button>
      </header>
      <p>Signed in as <strong>{user?.role}</strong></p>

      <div className="dashboard-links">
        {user?.role === "student" && (
          <>
            <Link to="/student/profile">Complete/Edit My Profile</Link>
            <Link to="/circulars">Browse Admission Circulars</Link>
            <Link to="/applications">My Applications</Link>
          </>
        )}

        {user?.role === "university" && (
          <>
            <Link to="/university/profile">My University Profile</Link>
            <Link to="/university/circulars">Manage My Circulars</Link>
          </>
        )}

        {user?.role === "admin" && (
          <>
            <Link to="/admin/verifications">Pending University Verifications</Link>
          </>
        )}
      </div>
    </div>
  );
}
