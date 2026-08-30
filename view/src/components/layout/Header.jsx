import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Letterhead from "../Letterhead";
import { MenuIcon, XIcon } from "../icons";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <header
      className={`sticky top-0 z-40 bg-paper border-b border-border transition-shadow duration-300 ${
        scrolled ? "shadow-[0_2px_10px_rgba(24,42,34,0.08)]" : ""
      }`}
    >
      <div className="max-w-[1100px] mx-auto px-4 md:px-6 flex items-center justify-between py-3" ref={panelRef}>
        <Link to={user ? "/dashboard" : "/"} className="no-underline">
          <Letterhead as="span" compact />
        </Link>

        <nav className="hidden md:flex items-center gap-3">
          {user ? (
            <button type="button" className="btn-outline" onClick={handleLogout}>
              Log out
            </button>
          ) : (
            <>
              <Link to="/login" className="btn-outline">Log in</Link>
              <Link to="/register" className="btn-solid">Register</Link>
            </>
          )}
        </nav>

        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center p-2 text-ink"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <XIcon width={22} height={22} /> : <MenuIcon width={22} height={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-paper px-4 py-3 flex flex-col gap-2">
          {user ? (
            <button type="button" className="btn-outline" onClick={handleLogout}>
              Log out
            </button>
          ) : (
            <>
              <Link to="/login" className="btn-outline" onClick={() => setOpen(false)}>Log in</Link>
              <Link to="/register" className="btn-solid" onClick={() => setOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
