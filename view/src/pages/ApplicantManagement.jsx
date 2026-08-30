import { useEffect, useState } from "react";
import api from "../api/axios";
import { useToast } from "../hooks/useToast";
import Toast from "../components/Toast";
import Pagination from "../components/Pagination";
import { ChevronDownIcon, ChevronUpIcon } from "../components/icons";

const STATUS_OPTIONS = ["Under Review", "Shortlisted", "Accepted", "Rejected"];
const PAGE_SIZE = 10;

export default function ApplicantManagement() {
  const { toast, showToast } = useToast();
  const [circulars, setCirculars] = useState([]);
  const [loadingCirculars, setLoadingCirculars] = useState(false);
  const [expanded, setExpanded] = useState(null); // circularId
  const [applicants, setApplicants] = useState({}); // circularId → []
  const [loadingApplicants, setLoadingApplicants] = useState(null);
  const [updating, setUpdating] = useState(null); // appId
  const [applicantPages, setApplicantPages] = useState({}); // circularId -> page

  // Load university's own circulars
  useEffect(() => {
    const load = async () => {
      setLoadingCirculars(true);
      try {
        const { data } = await api.get("/circulars/mine");
        setCirculars(data);
      } catch (err) {
        showToast(err.response?.data?.message || "Failed to load circulars", "error");
      } finally {
        setLoadingCirculars(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleExpand = async (circularId) => {
    if (expanded === circularId) {
      setExpanded(null);
      return;
    }
    setExpanded(circularId);
    if (applicants[circularId]) return; // already loaded

    setLoadingApplicants(circularId);
    try {
      const { data } = await api.get(`/applications/circular/${circularId}`);
      setApplicants((prev) => ({ ...prev, [circularId]: data }));
    } catch (err) {
      showToast(err.response?.data?.message || "Could not load applicants", "error");
    } finally {
      setLoadingApplicants(null);
    }
  };

  const updateStatus = async (appId, circularId, newStatus) => {
    if (!newStatus) return;
    setUpdating(appId);
    try {
      await api.patch(`/applications/${appId}/status`, { status: newStatus });
      setApplicants((prev) => ({
        ...prev,
        [circularId]: prev[circularId].map((a) =>
          a._id === appId ? { ...a, status: newStatus } : a
        ),
      }));
      showToast(`Status updated to "${newStatus}" ✓`);
    } catch (err) {
      showToast(err.response?.data?.message || "Update failed", "error");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 1300 }}>
      <p className="eyebrow">University - Applicant Management</p>
      <h1>Manage Applicants</h1>
      <p style={{ color: "var(--slate)", marginBottom: "1.5rem" }}>
        Select a circular to view and manage its applicants.
      </p>

      {loadingCirculars && (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem 0" }}>
          <span className="spinner" />
        </div>
      )}

      {!loadingCirculars && circulars.length === 0 && (
        <p className="alert-info">
          You haven't posted any circulars yet. Post one from your dashboard to manage applicants.
        </p>
      )}

      {/* Circular accordion list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {circulars.map((c) => {
          const isOpen = expanded === c._id;
          const apps = applicants[c._id] || [];
          const applicantPage = applicantPages[c._id] || 1;
          const applicantTotalPages = Math.ceil(apps.length / PAGE_SIZE) || 1;
          const paginatedApps = apps.slice((applicantPage - 1) * PAGE_SIZE, applicantPage * PAGE_SIZE);
          const setApplicantPage = (p) => setApplicantPages((prev) => ({ ...prev, [c._id]: p }));

          return (
            <div
              key={c._id}
              className="card"
              style={{ borderLeftColor: isOpen ? "var(--seal)" : "var(--brass)", padding: 0 }}
            >
              {/* Circular header row */}
              <div
                id={`circular-accordion-${c._id}`}
                onClick={() => toggleExpand(c._id)}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  cursor: "pointer", padding: "1.1rem 1.3rem",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                    <h3 style={{ margin: 0 }}>{c.programName}</h3>
                    {c.degreeLevel && <span className="tag tag-primary">{c.degreeLevel}</span>}
                    <span className={`tag ${c.isActive ? "tag-success" : "tag-default"}`}>
                      {c.isActive ? "Active" : "Closed"}
                    </span>
                  </div>
                  <p style={{ margin: 0 }}>
                    {c.department} &nbsp;·&nbsp; Deadline:{" "}
                    {new Date(c.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ color: "var(--brass)", fontWeight: 600, fontSize: "0.9rem" }}>
                    {isOpen && apps.length > 0 ? apps.length : "-"}
                  </span>
                  {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </div>
              </div>

              {/* Applicant table */}
              {isOpen && (
                <>
                  <hr className="divider" style={{ margin: 0 }} />
                  {loadingApplicants === c._id ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "1.5rem" }}>
                      <span className="spinner spinner-sm" />
                    </div>
                  ) : apps.length === 0 ? (
                    <p style={{ textAlign: "center", color: "var(--slate)", padding: "1.25rem" }}>
                      No applications yet for this circular.
                    </p>
                  ) : (
                    <div className="table-wrap" style={{ border: "none", borderRadius: 0 }}>
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Applicant</th>
                            <th>Email</th>
                            <th>Submitted</th>
                            <th>Current Status</th>
                            <th>Update Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedApps.map((app) => (
                            <tr key={app._id}>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  <div className="avatar">{app.student?.name?.[0]?.toUpperCase()}</div>
                                  <span style={{ fontWeight: 600 }}>{app.student?.name}</span>
                                </div>
                              </td>
                              <td style={{ color: "var(--ink-soft)" }}>{app.student?.email}</td>
                              <td style={{ color: "var(--ink-soft)" }}>
                                {new Date(app.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                              </td>
                              <td>
                                <span className={`status-badge status-${app.status.replace(/\s+/g, "")}`}>
                                  {app.status}
                                </span>
                              </td>
                              <td>
                                <select
                                  id={`status-select-${app._id}`}
                                  aria-label="Change application status"
                                  className="select"
                                  value=""
                                  disabled={updating === app._id}
                                  onChange={(e) => updateStatus(app._id, c._id, e.target.value)}
                                >
                                  <option value="">Change to…</option>
                                  {STATUS_OPTIONS.filter((s) => s !== app.status).map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div style={{ padding: "0 1.3rem 1rem" }}>
                        <Pagination page={applicantPage} totalPages={applicantTotalPages} onChange={setApplicantPage} />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      <Toast toast={toast} />
    </div>
  );
}
