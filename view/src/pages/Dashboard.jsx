import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProfileSummary } from "../hooks/useProfileSummary";
import DashboardCard from "../components/DashboardCard";
import api from "../api/axios";
import {
  DocumentIcon,
  ActivityIcon,
  ClockIcon,
  SparkleIcon,
  ClipboardIcon,
  UsersIcon,
  ShieldIcon,
  ChartIcon,
} from "../components/icons";

const roleLabels = { student: "Student", university: "University", admin: "Admin" };

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-2xl font-semibold text-ink m-0">{value}</p>
      <p className="text-xs text-slate m-0">{label}</p>
    </div>
  );
}

function Empty({ text }) {
  return <p className="text-sm text-slate m-0">{text}</p>;
}

function CardsSkeleton() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "3rem 0" }}>
      <span className="spinner" />
    </div>
  );
}

function StudentCards() {
  const [applications, setApplications] = useState(null);
  const [circulars, setCirculars] = useState(null);

  useEffect(() => {
    api.get("/applications/mine").then(({ data }) => setApplications(data)).catch(() => setApplications([]));
    api.get("/circulars").then(({ data }) => setCirculars(data)).catch(() => setCirculars([]));
  }, []);

  if (!applications || !circulars) return <CardsSkeleton />;

  const underReview = applications.filter((a) => a.status === "Under Review").length;
  const accepted = applications.filter((a) => a.status === "Accepted").length;

  const recentActivity = applications
    .flatMap((a) => (a.statusHistory || []).map((h) => ({ ...h, program: a.circular?.programName })))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 4);

  const appliedIds = new Set(applications.map((a) => a.circular?._id));
  const deadlinesToWatch = [...circulars]
    .filter((c) => !appliedIds.has(c._id))
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <DashboardCard title="Applications overview" icon={DocumentIcon}>
        <div className="flex gap-6">
          <Stat label="Total" value={applications.length} />
          <Stat label="Under review" value={underReview} />
          <Stat label="Accepted" value={accepted} />
        </div>
        <RouterLink to="/applications" className="btn-outline" style={{ alignSelf: "flex-start" }}>
          View all applications
        </RouterLink>
      </DashboardCard>

      <DashboardCard title="Recent activity" icon={ActivityIcon}>
        {recentActivity.length === 0 ? (
          <Empty text="No activity yet - apply to a circular to get started." />
        ) : (
          <ul className="flex flex-col gap-2 m-0 p-0 list-none">
            {recentActivity.map((h, i) => (
              <li key={i} className="flex justify-between gap-3 text-sm">
                <span className="text-ink-soft">
                  {h.program} - <strong className="text-ink">{h.status}</strong>
                </span>
                <span className="text-slate text-xs whitespace-nowrap">
                  {new Date(h.timestamp).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>

      <DashboardCard title="Deadlines to watch" icon={ClockIcon}>
        {deadlinesToWatch.length === 0 ? (
          <Empty text="No open circulars right now." />
        ) : (
          <ul className="flex flex-col gap-2 m-0 p-0 list-none">
            {deadlinesToWatch.map((c) => (
              <li key={c._id} className="flex justify-between gap-3 text-sm">
                <RouterLink to="/circulars" className="text-ink-soft">
                  {c.programName}
                </RouterLink>
                <span className="text-brass text-xs font-medium whitespace-nowrap">
                  {new Date(c.deadline).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>

      <DashboardCard title="Discover" icon={SparkleIcon}>
        <div className="flex flex-col gap-2">
          <RouterLink to="/recommendations" className="text-ink-soft text-sm">
            Recommended for you
          </RouterLink>
          <RouterLink to="/quiz" className="text-ink-soft text-sm">
            Not sure what to study? Take the quiz
          </RouterLink>
          <RouterLink to="/universities/compare" className="text-ink-soft text-sm">
            Compare universities
          </RouterLink>
        </div>
      </DashboardCard>
    </div>
  );
}

function UniversityCards() {
  const [data, setData] = useState(null);
  const profile = useProfileSummary("university");

  useEffect(() => {
    api
      .get("/university/dashboard")
      .then(({ data }) => setData(data))
      .catch(() => setData({ totalCirculars: 0, activeCirculars: 0, circulars: [] }));
  }, []);

  if (!data) return <CardsSkeleton />;

  const totalApplicants = data.circulars.reduce((sum, c) => sum + c.applicantCount, 0);
  const closingSoon = [...data.circulars]
    .filter((c) => c.isActive)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <DashboardCard title="Circulars overview" icon={ClipboardIcon}>
        <div className="flex gap-6">
          <Stat label="Total" value={data.totalCirculars} />
          <Stat label="Active" value={data.activeCirculars} />
        </div>
        <RouterLink to="/university/circulars" className="btn-outline" style={{ alignSelf: "flex-start" }}>
          Manage circulars
        </RouterLink>
      </DashboardCard>

      <DashboardCard title="Applicants overview" icon={UsersIcon}>
        <Stat label="Total applicants" value={totalApplicants} />
        <RouterLink to="/university/applicants" className="btn-outline" style={{ alignSelf: "flex-start" }}>
          Manage applicants
        </RouterLink>
      </DashboardCard>

      <DashboardCard title="Deadlines closing soon" icon={ClockIcon}>
        {closingSoon.length === 0 ? (
          <Empty text="No active circulars right now." />
        ) : (
          <ul className="flex flex-col gap-2 m-0 p-0 list-none">
            {closingSoon.map((c) => (
              <li key={c._id} className="flex justify-between gap-3 text-sm">
                <span className="text-ink-soft">{c.programName}</span>
                <span className="text-brass text-xs font-medium whitespace-nowrap">
                  {new Date(c.deadline).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>

      <DashboardCard title="Verification status" icon={ShieldIcon}>
        <span
          className={`status-badge status-${profile?.verificationStatus || "pending"}`}
          style={{ alignSelf: "flex-start" }}
        >
          {profile?.verificationStatus || "-"}
        </span>
        {profile?.verificationStatus === "pending" && (
          <p className="text-slate text-sm m-0">Your account is awaiting admin approval.</p>
        )}
        {profile?.verificationStatus === "rejected" && (
          <p className="text-slate text-sm m-0">Your verification was rejected. Contact support for details.</p>
        )}
      </DashboardCard>
    </div>
  );
}

function AdminCards() {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState(null);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then(({ data }) => setStats(data))
      .catch(() => setStats({ totalStudents: 0, totalUniversities: 0, pendingVerifications: 0 }));
    api.get("/admin/universities/pending").then(({ data }) => setPending(data)).catch(() => setPending([]));
  }, []);

  if (!stats || !pending) return <CardsSkeleton />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <DashboardCard title="Platform totals" icon={UsersIcon}>
        <div className="flex gap-6">
          <Stat label="Students" value={stats.totalStudents} />
          <Stat label="Universities" value={stats.totalUniversities} />
        </div>
      </DashboardCard>

      <DashboardCard
        title="Pending verifications"
        icon={ShieldIcon}
        action={
          <RouterLink to="/admin/verifications" className="text-sm text-seal">
            View all →
          </RouterLink>
        }
      >
        {pending.length === 0 ? (
          <Empty text="Nothing awaiting approval." />
        ) : (
          <ul className="flex flex-col gap-2 m-0 p-0 list-none">
            {pending.slice(0, 3).map((u) => (
              <li key={u._id} className="text-sm text-ink-soft">
                {u.universityProfile?.universityName || u.name}
                <span className="text-slate text-xs block">{u.universityProfile?.location}</span>
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>

      <DashboardCard title="Manage" icon={ChartIcon}>
        <div className="flex flex-col gap-2">
          <RouterLink to="/admin/users" className="text-ink-soft text-sm">
            Manage users
          </RouterLink>
          <RouterLink to="/admin/analytics" className="text-ink-soft text-sm">
            Platform analytics
          </RouterLink>
        </div>
      </DashboardCard>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <p className="eyebrow">Admissions Portal</p>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>Welcome back, {user?.name}</h1>
      <span className="tag tag-primary" style={{ marginBottom: "1.5rem", display: "inline-block" }}>
        {roleLabels[user?.role] || user?.role}
      </span>

      {user?.role === "student" && <StudentCards />}
      {user?.role === "university" && <UniversityCards />}
      {user?.role === "admin" && <AdminCards />}
    </div>
  );
}
