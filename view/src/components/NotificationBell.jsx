import { useState, useEffect, useRef } from "react";
import { BellIcon } from "./icons";
import api from "../api/axios";

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const intervalRef = useRef(null);
  const wrapRef = useRef(null);

  const unread = notifications.filter((n) => !n.read).length;

  const load = async () => {
    try {
      const { data } = await api.get("/notifications/mine");
      setNotifications(data);
    } catch {
      // silently fail - bell should never crash the page
    }
  };

  useEffect(() => {
    load();
    // Poll every 60 seconds to pick up new notifications without a WebSocket
    intervalRef.current = setInterval(load, 60000);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const togglePanel = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next && !loading) {
        setLoading(true);
        load().finally(() => setLoading(false));
      }
      return next;
    });
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silently fail
    }
  };

  const markOneRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch {
      // silently fail
    }
  };

  return (
    <div style={{ position: "relative" }} ref={wrapRef}>
      <button
        id="notification-bell"
        type="button"
        className="notif-bell"
        onClick={togglePanel}
        aria-label={`${unread} unread notifications`}
      >
        <BellIcon width={22} height={22} />
        {unread > 0 && <span className="notif-badge">{unread > 9 ? "9+" : unread}</span>}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <h4>Notifications{unread > 0 ? ` (${unread} new)` : ""}</h4>
            {unread > 0 && <button onClick={markAllRead}>Mark all read</button>}
          </div>

          <div className="notif-list">
            {loading && (
              <div style={{ display: "flex", justifyContent: "center", padding: "1.5rem" }}>
                <span className="spinner spinner-sm" />
              </div>
            )}
            {!loading && notifications.length === 0 && (
              <p className="notif-empty">No notifications yet.</p>
            )}
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`notif-item${n.read ? "" : " unread"}`}
                onClick={() => !n.read && markOneRead(n._id)}
              >
                <div style={{ flex: 1 }}>
                  <p>{n.message}</p>
                  <time>{formatDate(n.createdAt)}</time>
                </div>
                {!n.read && <span className="notif-dot" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
