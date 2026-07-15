import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Letterhead from "../components/Letterhead";
import api from "../api/axios";

const roleLabels = { student: "Student", university: "University", admin: "Admin" };

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <p className="stat-value">{value}</p>
      <p className="stat-label">{label}</p>
    </div>
  );
}

function useStats(role) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (role === "student") {
          const { data } = await api.get("/applications/mine");
          setStats({
            total: data.length,
            underReview: data.filter((a) => a.status === "Under Review").length,
            accepted: data.filter((a) => a.status === "Accepted").length,
          });
        } else if (role === "university") {
          const { data } = await api.get("/circulars/mine");
          setStats({
            total: data.length,
            active: data.filter((c) => c.isActive).length,
          });
        } else if (role === "admin") {
          const { data } = await api.get("/admin/universities/pending");
          setStats({ pending: data.length });
        }
      } catch {
        setStats(null);
      }
    };
    load();
  }, [role]);

  return stats;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const stats = useStats(user?.role);

  return (
    <div className="dashboard">
      <Letterhead subtitle="Admissions Portal" />
      <header>
        <h2>Welcome, {user?.name}</h2>
        <button onClick={logout}>Log out</button>
      </header>
      <p>Signed in as {roleLabels[user?.role] || user?.role}</p>

      {stats && (
        <div className="stat-grid">
          {user?.role === "student" && (
            <>
              <StatCard label="Applications submitted" value={stats.total} />
              <StatCard label="Under review" value={stats.underReview} />
              <StatCard label="Accepted" value={stats.accepted} />
            </>
          )}
          {user?.role === "university" && (
            <>
              <StatCard label="Total circulars" value={stats.total} />
              <StatCard label="Active circulars" value={stats.active} />
            </>
          )}
          {user?.role === "admin" && (
            <StatCard label="Universities awaiting approval" value={stats.pending} />
          )}
        </div>
      )}

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
