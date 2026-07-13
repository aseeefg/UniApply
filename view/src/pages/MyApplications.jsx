import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get("/applications/mine");
      setApplications(data);
    };
    load();
  }, []);

  return (
    <div className="page">
      <Link to="/dashboard" className="back-link">← Back to dashboard</Link>
      <p className="eyebrow">Student Records</p>
      <h1>My Applications</h1>

      {applications.length === 0 && <p>No applications submitted yet.</p>}

      <div className="card-list">
        {applications.map((app) => (
          <div key={app._id} className="card">
            <h3>{app.circular?.programName}</h3>
            <p>
              {app.circular?.university?.universityProfile?.universityName ||
                app.circular?.university?.name}
            </p>
            <p>Submitted: {new Date(app.createdAt).toLocaleDateString()}</p>
            <p className={`status-badge status-${app.status.replace(" ", "")}`}>{app.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
