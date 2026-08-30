import { useEffect, useState } from "react";
import api from "../api/axios";
import { ChevronUpIcon, ChevronDownIcon } from "../components/icons";

function TrendBadge({ current, previous }) {
  if (previous === 0 && current === 0) return null;
  const pct = previous === 0 ? 100 : Math.round(((current - previous) / previous) * 100);
  const isUp = pct >= 0;
  return (
    <span className={`tag ${isUp ? "tag-success" : "tag-error"}`} title={`vs previous 7 days (${previous})`}>
      {isUp ? <ChevronUpIcon width={11} height={11} /> : <ChevronDownIcon width={11} height={11} />}
      {Math.abs(pct)}%
    </span>
  );
}

function StatCard({ label, value, color, trend }) {
  return (
    <div className="stat-card">
      <p className="stat-value" style={{ color: color || "var(--seal)" }}>{value}</p>
      <p className="stat-label">{label}</p>
      {trend && (
        <div style={{ marginTop: "0.5rem", display: "flex", justifyContent: "center" }}>
          <TrendBadge {...trend} />
        </div>
      )}
    </div>
  );
}

// Small self-contained SVG bar chart - no charting library needed for a single page.
function BarChart({ data, height = 180, barColor = "var(--seal)", showLabels = true }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 100 / data.length;

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{ width: "100%", height }}>
        {data.map((d, i) => {
          const barHeight = (d.value / max) * (height - 26);
          return (
            <g key={i}>
              <rect
                x={i * barWidth + barWidth * 0.15}
                y={height - barHeight - 20}
                width={barWidth * 0.7}
                height={barHeight}
                fill={d.color || barColor}
                rx={0.6}
              >
                <title>{`${d.label}: ${d.value}`}</title>
              </rect>
              {showLabels && (
                <text
                  x={i * barWidth + barWidth / 2}
                  y={height - 6}
                  fontSize="3.2"
                  textAnchor="middle"
                  fill="currentColor"
                  opacity={0.7}
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Matches the .status-badge color language used elsewhere (MyApplications, ApplicantManagement)
const statusColors = {
  Submitted: "var(--slate)",
  "Under Review": "var(--brass)",
  Shortlisted: "var(--ink)",
  Accepted: "var(--moss)",
  Rejected: "var(--seal)",
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/admin/analytics");
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const sum = (days) => days.reduce((total, d) => total + d.count, 0);
  const last7Days = data ? sum(data.signupsLast30Days.slice(-7)) : 0;
  const prev7Days = data ? sum(data.signupsLast30Days.slice(-14, -7)) : 0;

  return (
    <div className="page" style={{ maxWidth: 1300 }}>
      <p className="eyebrow">Admin Desk</p>
      <h1>Platform Analytics</h1>

      {error && <p className="error" style={{ margin: "1rem 0" }}>{error}</p>}

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem 0" }}>
          <span className="spinner" />
        </div>
      )}

      {data && !loading && (
        <>
          <div className="stat-grid">
            <StatCard label="Pending universities" value={data.verificationBreakdown.pending} color="var(--brass)" />
            <StatCard label="Approved universities" value={data.verificationBreakdown.approved} color="var(--moss)" />
            <StatCard label="Rejected universities" value={data.verificationBreakdown.rejected} color="var(--seal)" />
            <StatCard label="Total circulars" value={data.circularCounts.total} />
            <StatCard label="Active circulars" value={data.circularCounts.active} color="var(--moss)" />
            <StatCard
              label="New signups (7d)"
              value={last7Days}
              color="var(--brass)"
              trend={{ current: last7Days, previous: prev7Days }}
            />
          </div>

          <div className="card" style={{ marginTop: "1.5rem" }}>
            <h3>Applications by Status</h3>
            <BarChart
              data={data.applicationStatusBreakdown.map((s) => ({
                label: s.status,
                value: s.count,
                color: statusColors[s.status],
              }))}
            />
          </div>

          <div className="card" style={{ marginTop: "1.5rem" }}>
            <h3>Signups - Last 30 Days</h3>
            <BarChart
              data={data.signupsLast30Days.map((d) => ({
                label: new Date(d.date).getDate().toString(),
                value: d.count,
              }))}
              barColor="var(--brass)"
              showLabels={false}
            />
            <p style={{ fontSize: "0.75rem", color: "var(--slate)", marginTop: "0.5rem" }}>
              Hover a bar for the exact date and count.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
