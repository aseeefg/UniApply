import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function Recommendations() {
  const [circulars, setCirculars] = useState([]);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [explanations, setExplanations] = useState({});
  const [explaining, setExplaining] = useState({});

  const load = async () => {
    setLoading(true);
    const { data } = await api.get("/student/recommendations");
    setCirculars(data.circulars);
    setNeedsProfile(data.needsProfile);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const apply = async (circularId) => {
    try {
      await api.post("/applications", { circularId });
      setMessage("Application submitted!");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not apply");
    }
  };

  const explain = async (circularId) => {
    setExplaining({ ...explaining, [circularId]: true });
    try {
      const { data } = await api.get(`/student/recommendations/${circularId}/explain`);
      setExplanations({ ...explanations, [circularId]: data.explanation });
    } catch (err) {
      setExplanations({
        ...explanations,
        [circularId]: err.response?.data?.message || "Couldn't generate an explanation right now.",
      });
    } finally {
      setExplaining({ ...explaining, [circularId]: false });
    }
  };

  return (
    <div className="page">
      <Link to="/dashboard" className="back-link">← Back to dashboard</Link>
      <p className="eyebrow">Student Records</p>
      <h1>Recommended For You</h1>
      {message && <p className="success">{message}</p>}

      {loading && <p>Loading recommendations...</p>}

      {!loading && needsProfile && (
        <p>
          Add your degree level, subject interests, and preferred location on your{" "}
          <Link to="/student/profile">profile</Link> to get personalized recommendations.
        </p>
      )}

      {!loading && !needsProfile && circulars.length === 0 && (
        <p>No open circulars match your preferences right now.</p>
      )}

      <div className="card-list">
        {circulars.map((c) => (
          <div key={c._id} className="card">
            <h3>{c.programName}</h3>
            <p>
              {c.university?.universityProfile?.universityName || c.university?.name}
            </p>
            <p>{c.department} — {c.seatsAvailable} seats</p>
            <p>Deadline: {new Date(c.deadline).toLocaleDateString()}</p>

            <div className="match-tags">
              {c.matchedOn.map((reason) => (
                <span key={reason} className="match-tag">{reason}</span>
              ))}
            </div>

            <div className="card-actions">
              <button onClick={() => apply(c._id)}>Apply</button>
              <button onClick={() => explain(c._id)} disabled={explaining[c._id]}>
                {explaining[c._id] ? "Thinking..." : "Why this fits you"}
              </button>
            </div>

            {explanations[c._id] && (
              <div className="ai-explanation">
                {explanations[c._id]}
                <span className="ai-disclaimer">
                  AI-generated suggestion, not a guarantee of admission.
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
