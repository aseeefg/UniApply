import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import Toast from "../components/Toast";
import Alert from "../components/Alert";
import ConfirmDialog from "../components/ConfirmDialog";
import MultiSelectDropdown from "../components/MultiSelectDropdown";
import { useModal } from "../hooks/useModal";
import { BookmarkIcon, XIcon, FactCheckIcon, BuildingIcon } from "../components/icons";
import UniversityLink from "../components/UniversityLink";

const FACETS = [
  { key: "degreeLevel", label: "Degree Level" },
  { key: "department", label: "Department" },
  { key: "location", label: "Location" },
];

const daysLeft = (deadline) => {
  const diff = new Date(deadline) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const DeadlineTag = ({ deadline }) => {
  const d = daysLeft(deadline);
  if (d <= 0) return <span className="tag tag-default">Closed</span>;
  if (d <= 3) return <span className="tag tag-error">{d}d left</span>;
  if (d <= 7) return <span className="tag tag-secondary">{d}d left</span>;
  return <span className="tag tag-success">{d}d left</span>;
};

export default function BrowseCirculars() {
  const { user } = useAuth();
  const { toast, showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState({}); // circularId → bool
  const [applying, setApplying] = useState(null);
  const [eligibility, setEligibility] = useState({}); // circularId → { loading, eligible, message }
  const [pendingApplyId, setPendingApplyId] = useState(null);
  const lowEligibilityModal = useModal();

  // Filter facet options (real values currently in use, fetched once)
  const [filterOptions, setFilterOptions] = useState({ degreeLevels: [], departments: [], locations: [] });
  // Selected filters - arrays of exact values, OR within a facet, AND across facets
  const [selectedFilters, setSelectedFilters] = useState({ degreeLevel: [], department: [], location: [] });
  // Freeform search from the Program Quiz's suggested category (?q=), matched
  // word-by-word server-side against programName/department - not an exact
  // dropdown value, so it's kept separate from selectedFilters.
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  const buildQuery = (f, q) => {
    const params = new URLSearchParams();
    if (f.degreeLevel.length) params.set("degreeLevel", f.degreeLevel.join(","));
    if (f.department.length) params.set("department", f.department.join(","));
    if (f.location.length) params.set("location", f.location.join(","));
    if (q) params.set("q", q);
    return params.toString();
  };

  const load = useCallback(async (filterObj, q) => {
    setLoading(true);
    try {
      const qs = buildQuery(filterObj, q);
      const { data } = await api.get(`/circulars${qs ? "?" + qs : ""}`);
      setCirculars(data);
      setSaved(
        Object.fromEntries(
          data.map((c) => [c._id, (c.savedBy || []).some((id) => String(id) === String(user?.id))])
        )
      );
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load circulars", "error");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    api.get("/circulars/filter-options").then(({ data }) => setFilterOptions(data)).catch(() => {});
  }, []);

  useEffect(() => {
    load(selectedFilters, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, selectedFilters, searchQuery]);

  const handleFilterChange = (facetKey, value) => {
    setSelectedFilters((prev) => ({ ...prev, [facetKey]: value }));
  };

  const clearFilters = () => setSelectedFilters({ degreeLevel: [], department: [], location: [] });
  const clearSearch = () => setSearchQuery("");

  const hasActiveFilters =
    selectedFilters.degreeLevel.length || selectedFilters.department.length || selectedFilters.location.length;

  const apply = async (circularId) => {
    setApplying(circularId);
    try {
      await api.post("/applications", { circularId });
      showToast("Application submitted! ✓");
    } catch (err) {
      showToast(err.response?.data?.message || "Could not apply", "error");
    } finally {
      setApplying(null);
    }
  };

  const handleApplyClick = (circularId) => {
    if (eligibility[circularId]?.eligible === false) {
      setPendingApplyId(circularId);
      lowEligibilityModal.openModal();
    } else {
      apply(circularId);
    }
  };

  const confirmLowEligibilityApply = () => {
    lowEligibilityModal.closeModal();
    if (pendingApplyId) apply(pendingApplyId);
    setPendingApplyId(null);
  };

  const toggleSave = async (circularId) => {
    try {
      await api.post(`/notifications/circulars/${circularId}/save`);
      setSaved((prev) => ({ ...prev, [circularId]: !prev[circularId] }));
      showToast(saved[circularId] ? "Removed from saved" : "Saved! You'll get a reminder before the deadline.");
    } catch (err) {
      showToast(err.response?.data?.message || "Could not save", "error");
    }
  };

  const checkEligibility = async (circularId) => {
    setEligibility((prev) => ({ ...prev, [circularId]: { loading: true } }));
    try {
      const { data } = await api.get(`/student/eligibility/${circularId}`);
      setEligibility((prev) => ({ ...prev, [circularId]: { loading: false, ...data } }));
    } catch (err) {
      setEligibility((prev) => ({
        ...prev,
        [circularId]: {
          loading: false,
          eligible: null,
          message: err.response?.data?.message || "Could not check eligibility",
        },
      }));
    }
  };

  const facetOptions = {
    degreeLevel: filterOptions.degreeLevels,
    department: filterOptions.departments,
    location: filterOptions.locations,
  };

  return (
    <div style={{ width: "100%", marginTop: "1.5rem", padding: "1rem 2rem" }}>
      <p className="eyebrow">Student Portal</p>
      <h1>Open Admission Circulars</h1>

      {/* Filter dropdowns - pick from a list, no typing, applies immediately */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", margin: "1.25rem 0" }}>
        {FACETS.map((facet) => {
          const options = facetOptions[facet.key];
          if (!options || options.length === 0) return null;
          return (
            <MultiSelectDropdown
              key={facet.key}
              label={facet.label}
              options={options}
              selected={selectedFilters[facet.key]}
              onChange={(value) => handleFilterChange(facet.key, value)}
            />
          );
        })}
        {Boolean(hasActiveFilters) && (
          <span className="tag tag-clickable" onClick={clearFilters}>
            <XIcon width={12} height={12} /> Clear all
          </span>
        )}
      </div>

      {searchQuery && (
        <div style={{ marginBottom: "1.25rem" }}>
          <Alert variant="info">
            Showing circulars related to "{searchQuery}" from your quiz results.{" "}
            <button
              type="button"
              onClick={clearSearch}
              style={{
                background: "none", border: "none", padding: 0, margin: 0,
                color: "var(--seal)", textDecoration: "underline", cursor: "pointer",
                font: "inherit",
              }}
            >
              Clear and browse all circulars
            </button>
          </Alert>
        </div>
      )}

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem 0" }}>
          <span className="spinner" />
        </div>
      )}

      {!loading && circulars.length === 0 && (
        <p className="alert-info" style={{ marginTop: "1rem" }}>
          {searchQuery
            ? `No open circulars match "${searchQuery}" right now. Try clearing the search to browse everything.`
            : "No circulars match your filters. Try adjusting or clearing them."}
        </p>
      )}

      {/* Circular Cards - auto-fill grid so columns keep adding as width allows */}
      <div className="grid-cards">
        {circulars.map((c) => (
          <div className="grid-card" key={c._id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div className="avatar avatar-md">
                  {c.university?.universityProfile?.logo ? (
                    <img src={c.university.universityProfile.logo} alt="" />
                  ) : (
                    <BuildingIcon width={18} height={18} />
                  )}
                </div>
                <h3 style={{ fontSize: "1.05rem", lineHeight: 1.3 }}>{c.programName}</h3>
              </div>
              <DeadlineTag deadline={c.deadline} />
            </div>

            <p style={{ color: "var(--brass)", fontWeight: 600, margin: "0.25rem 0 0.6rem" }}>
              <UniversityLink university={c.university}>
                {c.university?.universityProfile?.universityName || c.university?.name}
              </UniversityLink>
            </p>

            <hr className="divider" style={{ margin: "0.6rem 0" }} />

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.6rem" }}>
              {c.degreeLevel && <span className="tag tag-primary">{c.degreeLevel}</span>}
              <span className="tag tag-default">{c.department}</span>
              {c.minGPA != null && <span className="tag tag-secondary">Min GPA {c.minGPA}</span>}
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", margin: "0.2rem 0" }}>
              📍 {c.university?.universityProfile?.location || "-"}
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", margin: "0.2rem 0" }}>
              🪑 {c.seatsAvailable} seats &nbsp;|&nbsp; 💵 ৳{c.applicationFee}
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", margin: "0.2rem 0" }}>
              Deadline: {new Date(c.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </p>

            {c.minGPA != null && (
              <div style={{ marginTop: "0.5rem" }}>
                {!eligibility[c._id] && (
                  <button
                    id={`eligibility-${c._id}`}
                    onClick={() => checkEligibility(c._id)}
                    style={{
                      background: "none", border: "none", padding: 0, cursor: "pointer",
                      color: "var(--seal)", fontSize: "0.78rem", display: "inline-flex",
                      alignItems: "center", gap: "0.3rem",
                    }}
                  >
                    <FactCheckIcon width={14} height={14} /> Check eligibility
                  </button>
                )}
                {eligibility[c._id]?.loading && <span className="tag">Checking…</span>}
                {eligibility[c._id] && !eligibility[c._id].loading && (
                  <span
                    className={`tag ${
                      eligibility[c._id].eligible === true
                        ? "tag-success"
                        : eligibility[c._id].eligible === false
                        ? "tag-error"
                        : "tag-default"
                    }`}
                    title={eligibility[c._id].message || ""}
                  >
                    {eligibility[c._id].eligible === true
                      ? "Eligible ✓"
                      : eligibility[c._id].eligible === false
                      ? "Below minimum"
                      : "Unknown"}
                  </span>
                )}
                {eligibility[c._id] && !eligibility[c._id].loading && eligibility[c._id].eligible !== true && eligibility[c._id].message && (
                  <div style={{ marginTop: "0.4rem" }}>
                    <Alert variant={eligibility[c._id].eligible === false ? "error" : "info"}>
                      {eligibility[c._id].message}
                    </Alert>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto", paddingTop: "1rem" }}>
              <button
                id={`apply-${c._id}`}
                className="btn-solid"
                onClick={() => handleApplyClick(c._id)}
                disabled={applying === c._id}
                style={{ flexGrow: 1, border: "none" }}
              >
                {applying === c._id ? "Applying…" : "Apply Now"}
              </button>
              <button
                id={`save-${c._id}`}
                onClick={() => toggleSave(c._id)}
                title={saved[c._id] ? "Unsave circular" : "Save for deadline reminder"}
                style={{
                  background: "none", border: "1px solid var(--border)", borderRadius: 3,
                  width: 40, cursor: "pointer",
                  color: saved[c._id] ? "var(--brass)" : "var(--ink-soft)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <BookmarkIcon filled={saved[c._id]} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Toast toast={toast} />

      <ConfirmDialog
        isOpen={lowEligibilityModal.isOpen}
        onClose={() => { lowEligibilityModal.closeModal(); setPendingApplyId(null); }}
        onConfirm={confirmLowEligibilityApply}
        title="Apply anyway?"
        message="Your GPA is below this program's minimum requirement, so your chances of being selected are low. Do you still want to apply?"
        confirmLabel="Apply anyway"
        danger
        isSubmitting={applying === pendingApplyId}
      />
    </div>
  );
}
