import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../hooks/useToast";
import Toast from "../components/Toast";
import { ChevronDownIcon, ChevronUpIcon, UploadIcon, BuildingIcon } from "../components/icons";
import UniversityLink from "../components/UniversityLink";

const statusIcon = {
  Submitted: "📋",
  "Under Review": "🔍",
  Shortlisted: "⭐",
  Accepted: "✅",
  Rejected: "❌",
};

const DOCUMENT_TYPES = [
  { value: "transcript", label: "Transcript" },
  { value: "certificate", label: "Certificate" },
  { value: "nationalId", label: "National ID" },
  { value: "photo", label: "Photo" },
];

const daysAgo = (date) => {
  const diff = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${diff} days ago`;
};

export default function MyApplications() {
  const { toast, showToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null); // appId with timeline open
  const [docsOpen, setDocsOpen] = useState(null); // appId with documents panel open
  const [docType, setDocType] = useState("transcript");
  const [uploading, setUploading] = useState(null); // appId currently uploading

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/applications/mine");
        setApplications(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleTimeline = (appId) =>
    setExpanded((prev) => (prev === appId ? null : appId));

  const toggleDocs = (appId) =>
    setDocsOpen((prev) => (prev === appId ? null : appId));

  const uploadFiles = async (appId, files) => {
    if (!files || files.length === 0) return;
    setUploading(appId);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("documents", file);
        formData.append("types", docType);
      });
      // No explicit Content-Type - the browser sets multipart/form-data with
      // the correct boundary itself; overriding it here would drop the
      // boundary and break multer's parsing.
      const { data } = await api.post(`/applications/${appId}/documents`, formData);
      setApplications((prev) => prev.map((a) => (a._id === appId ? { ...a, documents: data.documents } : a)));
      showToast("Document(s) uploaded ✓");
    } catch (err) {
      showToast(err.response?.data?.message || "Could not upload document(s)", "error");
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <p className="eyebrow">Student Records</p>
      <h1>My Applications</h1>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem 0" }}>
          <span className="spinner" />
        </div>
      )}

      {!loading && applications.length === 0 && (
        <p className="alert-info">
          You haven't applied to any circulars yet.{" "}
          <RouterLink to="/circulars" style={{ fontWeight: 600 }}>Browse open circulars →</RouterLink>
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {applications.map((app) => {
          const isOpen = expanded === app._id;
          const isDocsOpen = docsOpen === app._id;
          const history = app.statusHistory || [];
          const activeStep = history.length - 1;
          const documents = app.documents || [];

          return (
            <div
              key={app._id}
              className="card"
              style={{ borderLeftColor: isOpen ? "var(--seal)" : "var(--brass)" }}
            >
              {/* Application summary row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                <div className="avatar avatar-md" style={{ flexShrink: 0 }}>
                  {app.circular?.university?.universityProfile?.logo ? (
                    <img src={app.circular.university.universityProfile.logo} alt="" />
                  ) : (
                    <BuildingIcon width={18} height={18} />
                  )}
                </div>
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <h3 style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {app.circular?.programName}
                  </h3>
                  <p style={{ color: "var(--brass)", fontWeight: 600, margin: "0.2rem 0" }}>
                    <UniversityLink university={app.circular?.university}>
                      {app.circular?.university?.universityProfile?.universityName || app.circular?.university?.name}
                    </UniversityLink>
                  </p>
                  <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.4rem", flexWrap: "wrap" }}>
                    {app.circular?.degreeLevel && <span className="tag tag-primary">{app.circular.degreeLevel}</span>}
                    <span className="tag tag-default">{app.circular?.department}</span>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "var(--slate)", marginTop: "0.4rem" }}>
                    Applied {daysAgo(app.createdAt)} · Deadline:{" "}
                    {app.circular?.deadline
                      ? new Date(app.circular.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                      : "-"}
                  </p>
                </div>

                {/* Status + expand toggle */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                  <span className={`status-badge status-${app.status.replace(/\s+/g, "")}`}>
                    {statusIcon[app.status] || ""} {app.status}
                  </span>
                  <button
                    id={`timeline-toggle-${app._id}`}
                    onClick={() => toggleTimeline(app._id)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--brass)", fontSize: "0.78rem",
                      display: "inline-flex", alignItems: "center", gap: "0.25rem",
                    }}
                  >
                    {isOpen ? "Hide timeline" : "View timeline"}
                    {isOpen ? <ChevronUpIcon width={14} height={14} /> : <ChevronDownIcon width={14} height={14} />}
                  </button>
                  <button
                    id={`docs-toggle-${app._id}`}
                    onClick={() => toggleDocs(app._id)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--brass)", fontSize: "0.78rem",
                      display: "inline-flex", alignItems: "center", gap: "0.25rem",
                    }}
                  >
                    <UploadIcon width={14} height={14} />
                    Documents{documents.length > 0 ? ` (${documents.length})` : ""}
                  </button>
                </div>
              </div>

              {/* Status Timeline */}
              {isOpen && (
                <>
                  <hr className="divider" />
                  <p style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Application Timeline</p>

                  {history.length === 0 ? (
                    <p style={{ color: "var(--slate)", fontSize: "0.85rem" }}>No status history available.</p>
                  ) : (
                    <div className="timeline">
                      {history.map((entry, i) => (
                        <div key={i} className={`timeline-item${i === activeStep ? " active" : ""}`}>
                          <span className="timeline-dot" />
                          <div className="timeline-content">
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <span
                                className={`tag ${i === activeStep ? "tag-primary tag-filled" : "tag-default"}`}
                              >
                                {statusIcon[entry.status] || ""} {entry.status}
                              </span>
                              <span style={{ fontSize: "0.72rem", color: "var(--slate)" }}>
                                {new Date(entry.timestamp).toLocaleDateString("en-GB", {
                                  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p style={{ fontSize: "0.75rem", color: "var(--slate)", margin: "0.3rem 0 0" }}>
                              {i === 0
                                ? "Your application was successfully submitted."
                                : i === activeStep
                                ? "This is the current status of your application."
                                : "Status at this stage."}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Documents */}
              {isDocsOpen && (
                <>
                  <hr className="divider" />
                  <p style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Documents</p>

                  {documents.length === 0 ? (
                    <p style={{ color: "var(--slate)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                      No documents uploaded yet.
                    </p>
                  ) : (
                    <ul style={{ margin: "0 0 0.75rem", paddingLeft: "1.1rem" }}>
                      {documents.map((doc, i) => (
                        <li key={i} style={{ fontSize: "0.85rem", marginBottom: "0.2rem" }}>
                          {doc.name} <span className="tag tag-default" style={{ marginLeft: "0.3rem" }}>{doc.type}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <select
                      className="select"
                      aria-label="Document type"
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      disabled={uploading === app._id}
                    >
                      {DOCUMENT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <label className="btn-outline" style={{ cursor: "pointer", margin: 0 }}>
                      {uploading === app._id ? "Uploading…" : "Choose files"}
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        disabled={uploading === app._id}
                        onChange={(e) => {
                          uploadFiles(app._id, e.target.files);
                          e.target.value = "";
                        }}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                  <p className="field-hint" style={{ marginTop: "0.4rem" }}>
                    PDF, JPG, or PNG - up to 5MB each. Pick a document type, then choose one or more files of that type.
                  </p>
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
