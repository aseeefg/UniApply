import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useProfileSummary } from "../../hooks/useProfileSummary";
import NotificationBell from "../NotificationBell";
import { pageTitles } from "../../config/navigation";
import { MenuIcon, ChevronDownIcon } from "../icons";

const roleLabels = { student: "Student", university: "University", admin: "Admin" };
const profilePaths = { student: "/student/profile", university: "/university/profile" };

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const profile = useProfileSummary(user?.role);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const profilePath = profilePaths[user?.role];
  const title = pageTitles[location.pathname] || "Dashboard";

  return (
    <header className="sticky top-0 z-30 bg-paper/95 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between px-5 md:px-8 py-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="lg:hidden text-ink"
            onClick={onMenuClick}
            aria-label="Open menu"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <MenuIcon width={26} height={26} />
          </button>
          <h2 className="text-lg font-semibold text-ink m-0">{title}</h2>
        </div>

        <div className="flex items-center gap-4" ref={wrapRef}>
          {(user?.role === "student" || user?.role === "university") && <NotificationBell />}

          <div style={{ position: "relative" }}>
            <button
              type="button"
              className="flex items-center gap-2"
              style={{ background: "none", border: "none", cursor: "pointer" }}
              onClick={() => setOpen((prev) => !prev)}
              aria-label="Account menu"
            >
              <div className="avatar avatar-md">
                {profile?.image ? <img src={profile.image} alt="" /> : user?.name?.[0]?.toUpperCase()}
              </div>
              <ChevronDownIcon width={18} height={18} className="text-ink-soft hidden md:block" />
            </button>

            {open && (
              <div
                className="bg-card border border-border rounded-lg"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 0.5rem)",
                  minWidth: 220,
                  padding: "0.5rem",
                  boxShadow: "0 4px 16px rgba(24,42,34,0.12)",
                }}
              >
                <p className="text-base font-semibold text-ink m-0 px-2 py-1">{user?.name}</p>
                <p className="text-sm text-slate m-0 px-2 pb-2">{roleLabels[user?.role]}</p>
                <hr className="divider" style={{ margin: "0.25rem 0" }} />
                {profilePath && (
                  <Link
                    to={profilePath}
                    onClick={() => setOpen(false)}
                    className="block px-2 py-2 rounded text-base text-ink-soft hover:bg-paper hover:text-ink no-underline"
                  >
                    {profile?.complete ? "Edit my profile" : "Complete my profile"}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full text-left px-2 py-2 rounded text-base text-ink-soft hover:bg-paper hover:text-ink"
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
