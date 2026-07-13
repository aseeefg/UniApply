import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Letterhead from "../components/Letterhead";

const roleLabels = {
  student: "Student",
  university: "University",
  admin: "Admin",
};

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <Letterhead subtitle="Admissions Portal" />
      <header>
        <h2>Welcome, {user?.name}</h2>
        <button onClick={logout}>Log out</button>
      </header>
      <p>Signed in as {roleLabels[user?.role] || user?.role}</p>

      <div className="dashboard-links">
        {user?.role === "student" && (
          <>
            <Link to="/student/profile">Complete / edit my profile</Link>
            <Link to="/circulars">Browse admission circulars</Link>
            <Link to="/applications">My applications</Link>
          </>
        )}

        {user?.role === "university" && (
          <>
            <Link to="/university/profile">My university profile</Link>
            <Link to="/university/circulars">Manage my circulars</Link>
          </>
        )}

        {user?.role === "admin" && (
          <Link to="/admin/verifications">Pending university verifications</Link>
        )}
      </div>
    </div>
  );
}
