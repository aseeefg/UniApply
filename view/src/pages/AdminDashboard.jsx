import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function AdminDashboard() {
  const [pending, setPending] = useState([]);
  const [reasonDrafts, setReasonDrafts] = useState({});

  const load = async () => {
    const { data } = await api.get("/admin/universities/pending");
    setPending(data);
  };

  useEffect(() => {
    load();
  }, []);

  const decide = async (id, decision) => {
    await api.patch(`/admin/universities/${id}/verify`, {
      decision,
      reason: reasonDrafts[id] || "",
    });
    load();
  };

  return (
    <div className="page">
      <Link to="/dashboard">&larr; Back to dashboard</Link>
      <h1>Pending University Verifications</h1>

      {pending.length === 0 && <p>No universities awaiting approval.</p>}

      <div className="card-list">
        {pending.map((u) => (
          <div key={u._id} className="card">
            <h3>{u.universityProfile?.universityName || u.name}</h3>
            <p>{u.email}</p>
            <p>{u.universityProfile?.location}</p>

            <input
              placeholder="Reason if rejecting (optional)"
              value={reasonDrafts[u._id] || ""}
              onChange={(e) => setReasonDrafts({ ...reasonDrafts, [u._id]: e.target.value })}
            />
            <div className="card-actions">
              <button onClick={() => decide(u._id, "approved")}>Approve</button>
              <button className="btn-danger" onClick={() => decide(u._id, "rejected")}>
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
