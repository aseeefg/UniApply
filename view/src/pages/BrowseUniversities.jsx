import { useEffect, useState, useCallback } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../hooks/useToast";
import Toast from "../components/Toast";
import { BookmarkIcon, BuildingIcon } from "../components/icons";
import UniversityLink from "../components/UniversityLink";

const MAX_COMPARE = 3;

function UniversityCard({ u, selected, saved, toggleSelect, toggleSave, matchedOn }) {
  return (
    <div
      className="grid-card"
      style={{ border: selected.includes(u._id) ? "2px solid var(--seal)" : "2px solid transparent" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <div className="avatar avatar-md">
          {u.universityProfile?.logo ? (
            <img src={u.universityProfile.logo} alt="" />
          ) : (
            <BuildingIcon width={18} height={18} />
          )}
        </div>
        <h3 style={{ fontSize: "1.05rem", lineHeight: 1.3 }}>
          <UniversityLink university={u}>
            {u.universityProfile?.universityName || u.name}
          </UniversityLink>
        </h3>
      </div>

      <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", margin: "0.4rem 0" }}>
        📍 {u.universityProfile?.location || "-"}
      </p>

      {u.universityProfile?.description && (
        <p
          style={{
            fontSize: "0.85rem", color: "var(--ink-soft)", margin: "0.4rem 0",
            display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}
        >
          {u.universityProfile.description}
        </p>
      )}

      <hr className="divider" style={{ margin: "0.6rem 0" }} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
        <span className="tag tag-primary">
          {u.activeCircularCount} active circular{u.activeCircularCount === 1 ? "" : "s"}
        </span>
        {matchedOn?.map((reason) => (
          <span key={reason} className="tag tag-secondary">{reason}</span>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "1rem" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", color: "var(--ink-soft)", cursor: "pointer" }} title="Select to compare">
          <input
            id={`compare-${u._id}`}
            type="checkbox"
            checked={selected.includes(u._id)}
            onChange={() => toggleSelect(u._id)}
          />
          Compare
        </label>
        <button
          id={`save-university-${u._id}`}
          onClick={() => toggleSave(u._id)}
          title={saved[u._id] ? "Unsave university" : "Save university"}
          style={{
            background: "none", border: "1px solid var(--border)", borderRadius: 3,
            width: 36, height: 32, cursor: "pointer",
            color: saved[u._id] ? "var(--brass)" : "var(--ink-soft)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <BookmarkIcon filled={saved[u._id]} />
        </button>
      </div>
    </div>
  );
}

export default function BrowseUniversities() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const [universities, setUniversities] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [saved, setSaved] = useState({}); // universityId → bool
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [selected, setSelected] = useState([]); // universityIds picked for comparison
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [allRes, savedRes, recommendedRes] = await Promise.all([
        api.get("/universities"),
        api.get("/universities/saved/mine"),
        api.get("/student/recommendations/universities"),
      ]);
      setUniversities(allRes.data);
      setSaved(Object.fromEntries(savedRes.data.map((u) => [u._id, true])));
      setRecommended(recommendedRes.data.universities || []);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load universities", "error");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleSave = async (universityId) => {
    try {
      await api.post(`/universities/${universityId}/save`);
      setSaved((prev) => ({ ...prev, [universityId]: !prev[universityId] }));
      showToast(saved[universityId] ? "Removed from saved" : "Saved to your list");
    } catch (err) {
      showToast(err.response?.data?.message || "Could not save", "error");
    }
  };

  const toggleSelect = (universityId) => {
    setSelected((prev) => {
      if (prev.includes(universityId)) return prev.filter((id) => id !== universityId);
      if (prev.length >= MAX_COMPARE) {
        showToast(`You can compare up to ${MAX_COMPARE} universities at a time`, "error");
        return prev;
      }
      return [...prev, universityId];
    });
  };

  const goToCompare = () => {
    navigate(`/universities/compare?ids=${selected.join(",")}`);
  };

  const visible = showSavedOnly ? universities.filter((u) => saved[u._id]) : universities;

  return (
    <div style={{ width: "100%", marginTop: "1.5rem", padding: "1rem 2rem", paddingBottom: selected.length > 0 ? "6rem" : "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", margin: "1rem 0 1.5rem" }}>
        <div>
          <p className="eyebrow">Student Portal</p>
          <h1>Browse Universities</h1>
        </div>
        <span
          id="toggle-saved-only"
          className={`tag tag-clickable ${showSavedOnly ? "tag-secondary tag-filled" : "tag-default"}`}
          onClick={() => setShowSavedOnly((p) => !p)}
        >
          <BookmarkIcon filled={showSavedOnly} width={13} height={13} />
          {showSavedOnly ? "Showing saved only" : "Show saved only"}
        </span>
      </div>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem 0" }}>
          <span className="spinner" />
        </div>
      )}

      {!loading && recommended.length > 0 && !showSavedOnly && (
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.15rem", marginBottom: "0.25rem" }}>Recommended for you</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--slate)", marginBottom: "0.75rem" }}>
            Ranked by program fit first, then location - based on your{" "}
            <RouterLink to="/student/profile">profile preferences</RouterLink>.
          </p>
          <div className="grid-cards">
            {recommended.map((u) => (
              <UniversityCard
                key={u._id}
                u={u}
                selected={selected}
                saved={saved}
                toggleSelect={toggleSelect}
                toggleSave={toggleSave}
                matchedOn={u.matchedOn}
              />
            ))}
          </div>
          <hr className="divider" style={{ marginTop: "2rem" }} />
        </div>
      )}

      {!loading && visible.length === 0 && (
        <p className="alert-info">
          {showSavedOnly ? "You haven't saved any universities yet." : "No approved universities to show yet."}
        </p>
      )}

      {!loading && visible.length > 0 && (
        <>
          {recommended.length > 0 && !showSavedOnly && (
            <h2 style={{ fontSize: "1.15rem", marginBottom: "0.75rem" }}>All universities</h2>
          )}
          <div className="grid-cards">
            {visible.map((u) => (
              <UniversityCard
                key={u._id}
                u={u}
                selected={selected}
                saved={saved}
                toggleSelect={toggleSelect}
                toggleSave={toggleSave}
              />
            ))}
          </div>
        </>
      )}

      {selected.length > 0 && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
          <button
            id="compare-button"
            className="btn-solid btn-lg"
            onClick={goToCompare}
            style={{ borderRadius: 24, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", border: "none" }}
          >
            Compare ({selected.length})
          </button>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
}
