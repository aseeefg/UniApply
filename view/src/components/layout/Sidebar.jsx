import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Letterhead from "../Letterhead";
import { dashboardNavItem, navByRole } from "../../config/navigation";
import { XIcon } from "../icons";

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const items = [dashboardNavItem, ...(navByRole[user?.role] || [])];

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-ink/40 z-40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-80 bg-card border-r border-border z-50 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6 border-b border-border">
          <Link to="/dashboard" onClick={onClose} className="no-underline">
            <Letterhead as="span" compact />
          </Link>
          <button
            type="button"
            className="lg:hidden text-ink-soft"
            onClick={onClose}
            aria-label="Close menu"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <XIcon width={22} height={22} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-1.5">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-md text-base font-medium no-underline transition-colors ${
                  isActive ? "bg-seal text-white" : "text-ink-soft hover:bg-paper hover:text-ink"
                }`
              }
            >
              <Icon width={20} height={20} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
