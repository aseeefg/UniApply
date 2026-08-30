import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { BuildingIcon } from "../components/icons";
import UniversityLink from "../components/UniversityLink";

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
      <p className="eyebrow">Student Records</p>
      <h1>Recommended For You</h1>
      <p style={{ color: "var(--slate)", marginBottom: "1rem" }}>
        Your top 5 matches, ranked by program fit first and location second.
        Also see <Link to="/universities">recommended universities</Link>, or{" "}
        <Link to="/quiz">take the program quiz</Link> if you're not sure what to study yet.
      </p>
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
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
              <div className="avatar avatar-md">
                {c.university?.universityProfile?.logo ? (
                  <img src={c.university.universityProfile.logo} alt="" />
                ) : (
                  <BuildingIcon width={18} height={18} />
                )}
              </div>
              <h3 style={{ margin: 0 }}>{c.programName}</h3>
            </div>
            <p>
              <UniversityLink university={c.university}>
                {c.university?.universityProfile?.universityName || c.university?.name}
              </UniversityLink>
            </p>
            <p>{c.department} - {c.seatsAvailable} seats</p>
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
