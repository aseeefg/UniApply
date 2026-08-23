import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box, Typography, Button, Chip, Tab, Tabs, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Avatar,
  CircularProgress, Alert, TextField, InputAdornment, Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from "../api/axios";

const roleColor = { student: "info", university: "secondary" };

const statusChip = (isActive) =>
  isActive ? (
    <Chip label="Active" color="success" size="small" />
  ) : (
    <Chip label="Deactivated" color="error" size="small" />
  );

export default function ManageUsers() {
  const [tab, setTab] = useState(0); // 0 = students, 1 = universities
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState(null); // id being toggled

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

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", mt: 4, p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Button
        component={RouterLink}
        to="/dashboard"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2, color: "text.secondary" }}
      >
        Back to dashboard
      </Button>

      <Typography variant="overline" color="secondary" display="block" sx={{ mb: 0.5, letterSpacing: 2 }}>
        Admin — User Management
      </Typography>
      <Typography variant="h4" component="h1" gutterBottom>
        Manage Users
      </Typography>

      {/* Role Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => { setTab(v); setSearch(""); }}
        sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
      >
        <Tab label="Students" id="tab-students" />
        <Tab label="Universities" id="tab-universities" />
      </Tabs>

      {/* Search */}
      <TextField
        id="user-search"
        placeholder={`Search ${roleParam}s by name or email…`}
        size="small"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "background.default" }}>
                <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                {tab === 1 && <TableCell sx={{ fontWeight: 700 }}>Institution</TableCell>}
                {tab === 1 && <TableCell sx={{ fontWeight: 700 }}>Verification</TableCell>}
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    No {roleParam}s found.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((u) => (
                <TableRow
                  key={u._id}
                  hover
                  sx={{ opacity: u.isActive ? 1 : 0.55 }}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: 14 }}
                        src={u.studentProfile?.profileImage}
                      >
                        {u.name?.[0]?.toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>
                        {u.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {u.email}
                    </Typography>
                  </TableCell>
                  {tab === 1 && (
                    <TableCell>
                      <Typography variant="body2">
                        {u.universityProfile?.universityName || "—"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {u.universityProfile?.location}
                      </Typography>
                    </TableCell>
                  )}
                  {tab === 1 && (
                    <TableCell>
                      <Chip
                        label={u.verificationStatus || "—"}
                        size="small"
                        color={
                          u.verificationStatus === "approved"
                            ? "success"
                            : u.verificationStatus === "rejected"
                            ? "error"
                            : "warning"
                        }
                      />
                    </TableCell>
                  )}
                  <TableCell>{statusChip(u.isActive)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title={u.isActive ? "Deactivate account" : "Reactivate account"}>
                      <span>
                        <Button
                          id={`toggle-${u._id}`}
                          size="small"
                          variant="outlined"
                          color={u.isActive ? "error" : "success"}
                          onClick={() => handleToggle(u._id)}
                          disabled={toggling === u._id}
                          startIcon={
                            u.isActive ? (
                              <PersonOffIcon fontSize="small" />
                            ) : (
                              <CheckCircleOutlinedIcon fontSize="small" />
                            )
                          }
                          sx={{ whiteSpace: "nowrap" }}
                        >
                          {toggling === u._id
                            ? "…"
                            : u.isActive
                            ? "Deactivate"
                            : "Reactivate"}
                        </Button>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
        {filtered.length} {roleParam}(s) shown
      </Typography>
    </Box>
  );
}
