import { useEffect, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { ArrowLeftIcon, BuildingIcon } from "../components/icons";
import UniversityLink from "../components/UniversityLink";

const ROWS = [
  { key: "location", label: "Location" },
  { key: "website", label: "Website" },
  { key: "description", label: "Description" },
  { key: "researchAreas", label: "Research areas" },
  { key: "contactInfo", label: "Contact" },
];

const labelStyle = { fontWeight: 700, color: "var(--ink)", fontSize: "0.92rem" };
const nameHeaderStyle = {
  fontSize: "1rem",
  fontWeight: 700,
  color: "var(--ink)",
  textTransform: "none",
  letterSpacing: "normal",
  fontFamily: "var(--font-display)",
};

export default function CompareUniversities() {
  const [searchParams] = useSearchParams();
  const ids = (searchParams.get("ids") || "").split(",").filter(Boolean);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (ids.length === 0) return;
      setLoading(true);
      setError("");
      try {
        const results = await Promise.all(ids.map((id) => api.get(`/universities/${id}`)));
        setUniversities(results.map((r) => r.data));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load one or more universities");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("ids")]);

  return (
    <div className="page" style={{ maxWidth: 1300 }}>
      <RouterLink to="/universities" className="back-link">
        <ArrowLeftIcon /> Back to browse universities
      </RouterLink>

      <p className="eyebrow">Student Portal</p>
      <h1>Compare Universities</h1>

      {ids.length === 0 && (
        <p className="alert-info">No universities selected. Go back and pick up to 3 to compare.</p>
      )}

      {error && <p className="error" style={{ marginBottom: "1rem" }}>{error}</p>}

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem 0" }}>
          <span className="spinner" />
        </div>
      )}

      {!loading && universities.length > 0 && (
        <div className="table-wrap" style={{ marginTop: "1rem" }}>
          <table className="table">
            <tbody>
              <tr>
                <th style={{ ...nameHeaderStyle, width: 160 }}>University</th>
                {universities.map((u) => (
                  <th key={u._id} style={nameHeaderStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div className="avatar avatar-md">
                        {u.universityProfile?.logo ? (
                          <img src={u.universityProfile.logo} alt="" />
                        ) : (
                          <BuildingIcon width={16} height={16} />
                        )}
                      </div>
                      <UniversityLink university={u}>
                        {u.universityProfile?.universityName || u.name}
                      </UniversityLink>
                    </div>
                  </th>
                ))}
              </tr>

              {ROWS.map((row) => (
                <tr key={row.key}>
                  <td style={labelStyle}>{row.label}</td>
                  {universities.map((u) => (
                    <td key={u._id} style={{ whiteSpace: "normal" }}>{u.universityProfile?.[row.key] || "-"}</td>
                  ))}
                </tr>
              ))}

              <tr>
                <td style={labelStyle}>Active circulars</td>
                {universities.map((u) => (
                  <td key={u._id} style={{ whiteSpace: "normal" }}>
                    {u.activeCirculars.length === 0 ? (
                      "-"
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        {u.activeCirculars.map((c) => (
                          <div key={c._id}>
                            <p style={{ fontWeight: 600, margin: 0 }}>{c.programName}</p>
                            {c.degreeLevel && (
                              <span className="tag tag-default" style={{ marginTop: "0.2rem" }}>{c.degreeLevel}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
