import { useState, useEffect, useRef } from "react";
import {
  Badge, IconButton, Popover, Box, Typography, List, ListItem,
  ListItemText, Divider, Button, CircularProgress, Chip,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
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
  const [anchor, setAnchor] = useState(null);
  const intervalRef = useRef(null);

  const unread = notifications.filter((n) => !n.read).length;

  const load = async () => {
    try {
      const { data } = await api.get("/notifications/mine");
      setNotifications(data);
    } catch {
      // silently fail — bell should never crash the page
    }
  };

  useEffect(() => {
    load();
    // Poll every 60 seconds to pick up new notifications without a WebSocket
    intervalRef.current = setInterval(load, 60000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const openPopover = (e) => {
    setAnchor(e.currentTarget);
    if (!loading) {
      setLoading(true);
      load().finally(() => setLoading(false));
    }
  };
  const closePopover = () => setAnchor(null);

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

  const open = Boolean(anchor);

  return (
    <>
      <IconButton
        id="notification-bell"
        onClick={openPopover}
        color="inherit"
        aria-label={`${unread} unread notifications`}
      >
        <Badge badgeContent={unread} color="error" max={9}>
          {unread > 0 ? <NotificationsIcon /> : <NotificationsNoneIcon />}
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchor}
        onClose={closePopover}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            display: "flex",
            flexDirection: "column",
            borderRadius: 2,
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "background.default",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Notifications
            </Typography>
            {unread > 0 && (
              <Chip label={`${unread} new`} size="small" color="error" />
            )}
          </Box>
          {unread > 0 && (
            <Button size="small" onClick={markAllRead} sx={{ textTransform: "none" }}>
              Mark all read
            </Button>
          )}
        </Box>

        {/* Notification List */}
        <Box sx={{ overflowY: "auto", flexGrow: 1 }}>
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          )}
          {!loading && notifications.length === 0 && (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography color="text.secondary" variant="body2">
                No notifications yet.
              </Typography>
            </Box>
          )}
          <List disablePadding>
            {notifications.map((n, i) => (
              <Box key={n._id}>
                <ListItem
                  alignItems="flex-start"
                  onClick={() => !n.read && markOneRead(n._id)}
                  sx={{
                    cursor: n.read ? "default" : "pointer",
                    bgcolor: n.read ? "transparent" : "action.hover",
                    transition: "background 0.2s",
                    "&:hover": { bgcolor: "action.selected" },
                    px: 2,
                    py: 1.5,
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        fontWeight={n.read ? 400 : 700}
                        sx={{ lineHeight: 1.5 }}
                      >
                        {n.message}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(n.createdAt)}
                      </Typography>
                    }
                  />
                  {!n.read && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "error.main",
                        mt: 1,
                        ml: 1,
                        flexShrink: 0,
                      }}
                    />
                  )}
                </ListItem>
                {i < notifications.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </Box>
      </Popover>
    </>
  );
}
