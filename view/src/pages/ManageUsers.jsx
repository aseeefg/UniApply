import { useEffect, useState } from "react";
import api from "../api/axios";
import { SearchIcon, PersonOffIcon, CheckCircleIcon } from "../components/icons";
import ConfirmDialog from "../components/ConfirmDialog";
import Pagination from "../components/Pagination";
import { useModal } from "../hooks/useModal";

const PAGE_SIZE = 10;

const statusTag = (isActive) =>
  isActive ? (
    <span className="tag tag-success tag-filled">Active</span>
  ) : (
    <span className="tag tag-error">Deactivated</span>
  );

const verificationTag = (status) => {
  const color = status === "approved" ? "tag-success" : status === "rejected" ? "tag-error" : "tag-secondary";
  return <span className={`tag ${color}`}>{status || "-"}</span>;
};

export default function ManageUsers() {
  const [tab, setTab] = useState(0); // 0 = students, 1 = universities
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState(null); // id being toggled
  const [page, setPage] = useState(1);
  const [pendingDeactivate, setPendingDeactivate] = useState(null); // { id, name }
  const deactivateModal = useModal();

  const roleParam = tab === 0 ? "student" : "university";

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/admin/users?role=${roleParam}`);
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    setPage(1);
  }, [tab, search]);

  const handleToggle = async (userId) => {
    setToggling(userId);
    try {
      await api.patch(`/admin/users/${userId}/toggle-active`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: !u.isActive } : u))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Action failed");
    } finally {
      setToggling(null);
    }
  };

  const requestToggle = (u) => {
    if (u.isActive) {
      setPendingDeactivate({ id: u._id, name: u.name });
      deactivateModal.openModal();
    } else {
      handleToggle(u._id);
    }
  };

  const confirmDeactivate = async () => {
    if (!pendingDeactivate) return;
    await handleToggle(pendingDeactivate.id);
    deactivateModal.closeModal();
    setPendingDeactivate(null);
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="page" style={{ maxWidth: 1400 }}>
      <p className="eyebrow">Admin - User Management</p>
      <h1>Manage Users</h1>

      {/* Role Tabs */}
      <div className="tab-toggle">
        <button
          id="tab-students"
          className={tab === 0 ? "active" : ""}
          onClick={() => { setTab(0); setSearch(""); }}
        >
          Students
        </button>
        <button
          id="tab-universities"
          className={tab === 1 ? "active" : ""}
          onClick={() => { setTab(1); setSearch(""); }}
        >
          Universities
        </button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "1.25rem" }}>
        <SearchIcon
          width={16}
          height={16}
          style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--slate)" }}
        />
        <input
          id="user-search"
          aria-label={`Search ${roleParam}s by name or email`}
          placeholder={`Search ${roleParam}s by name or email…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="select"
          style={{ width: "100%", paddingLeft: "2.1rem" }}
        />
      </div>

      {error && <p className="error" style={{ marginBottom: "1rem" }}>{error}</p>}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem 0" }}>
          <span className="spinner" />
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                {tab === 1 && <th>Institution</th>}
                {tab === 1 && <th>Verification</th>}
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--slate)" }}>
                    No {roleParam}s found.
                  </td>
                </tr>
              )}
              {paginated.map((u) => (
                <tr key={u._id} style={{ opacity: u.isActive ? 1 : 0.55 }}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <div className="avatar">
                        {u.studentProfile?.profileImage ? (
                          <img src={u.studentProfile.profileImage} alt="" />
                        ) : (
                          u.name?.[0]?.toUpperCase()
                        )}
                      </div>
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--ink-soft)" }}>{u.email}</td>
                  {tab === 1 && (
                    <td>
                      <div>{u.universityProfile?.universityName || "-"}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--slate)" }}>
                        {u.universityProfile?.location}
                      </div>
                    </td>
                  )}
                  {tab === 1 && <td>{verificationTag(u.verificationStatus)}</td>}
                  <td>{statusTag(u.isActive)}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      id={`toggle-${u._id}`}
                      onClick={() => requestToggle(u)}
                      disabled={toggling === u._id}
                      title={u.isActive ? "Deactivate account" : "Reactivate account"}
                      className={u.isActive ? "btn-danger" : ""}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "0.35rem",
                        whiteSpace: "nowrap",
                        background: "none",
                        border: `1px solid ${u.isActive ? "var(--seal)" : "var(--moss)"}`,
                        color: u.isActive ? "var(--seal)" : "var(--moss)",
                        borderRadius: 3, padding: "0.35rem 0.7rem", cursor: "pointer", fontSize: "0.82rem",
                      }}
                    >
                      {u.isActive ? <PersonOffIcon width={14} height={14} /> : <CheckCircleIcon width={14} height={14} />}
                      {toggling === u._id ? "…" : u.isActive ? "Deactivate" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <p style={{ marginTop: "0.75rem", fontSize: "0.78rem", color: "var(--slate)" }}>
          {filtered.length} {roleParam}(s) total
        </p>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <ConfirmDialog
        isOpen={deactivateModal.isOpen}
        onClose={() => { deactivateModal.closeModal(); setPendingDeactivate(null); }}
        onConfirm={confirmDeactivate}
        title="Deactivate account?"
        message={`"${pendingDeactivate?.name}" will lose access to the platform until reactivated. This does not delete their data.`}
        confirmLabel="Deactivate"
        danger
        isSubmitting={toggling === pendingDeactivate?.id}
      />
    </div>
  );
}
