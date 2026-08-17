import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box, Typography, Button, Card, CardContent, Chip, Divider,
  Select, MenuItem, FormControl, InputLabel, Avatar, Alert,
  CircularProgress, Collapse, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Snackbar, IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import api from "../api/axios";

const STATUS_OPTIONS = ["Under Review", "Shortlisted", "Accepted", "Rejected"];

const statusColor = {
  Submitted: "default",
  "Under Review": "info",
  Shortlisted: "secondary",
  Accepted: "success",
  Rejected: "error",
};

export default function ApplicantManagement() {
  const [circulars, setCirculars] = useState([]);
  const [loadingCirculars, setLoadingCirculars] = useState(false);
  const [expanded, setExpanded] = useState(null); // circularId
  const [applicants, setApplicants] = useState({}); // circularId → []
  const [loadingApplicants, setLoadingApplicants] = useState(null);
  const [updating, setUpdating] = useState(null); // appId
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  const showSnack = (msg, severity = "success") => setSnack({ open: true, msg, severity });

  // Load university's own circulars
  useEffect(() => {
    const load = async () => {
      setLoadingCirculars(true);
      try {
        const { data } = await api.get("/circulars/mine");
        setCirculars(data);
      } catch (err) {
        showSnack(err.response?.data?.message || "Failed to load circulars", "error");
      } finally {
        setLoadingCirculars(false);
      }
    };
    load();
  }, []);

  const toggleExpand = async (circularId) => {
    if (expanded === circularId) {
      setExpanded(null);
      return;
    }
    setExpanded(circularId);
    if (applicants[circularId]) return; // already loaded

    setLoadingApplicants(circularId);
    try {
      const { data } = await api.get(`/applications/circular/${circularId}`);
      setApplicants((prev) => ({ ...prev, [circularId]: data }));
    } catch (err) {
      showSnack(err.response?.data?.message || "Could not load applicants", "error");
    } finally {
      setLoadingApplicants(null);
    }
  };

  const updateStatus = async (appId, circularId, newStatus) => {
    setUpdating(appId);
    try {
      await api.patch(`/applications/${appId}/status`, { status: newStatus });
      setApplicants((prev) => ({
        ...prev,
        [circularId]: prev[circularId].map((a) =>
          a._id === appId ? { ...a, status: newStatus } : a
        ),
      }));
      showSnack(`Status updated to "${newStatus}" ✓`);
    } catch (err) {
      showSnack(err.response?.data?.message || "Update failed", "error");
    } finally {
      setUpdating(null);
    }
  };

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

      <Typography variant="overline" color="secondary" display="block" sx={{ letterSpacing: 2, mb: 0.5 }}>
        University — Applicant Management
      </Typography>
      <Typography variant="h4" component="h1" gutterBottom>
        Manage Applicants
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select a circular to view and manage its applicants.
      </Typography>

      {loadingCirculars && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loadingCirculars && circulars.length === 0 && (
        <Alert severity="info">
          You haven't posted any circulars yet. Post one from your dashboard to manage applicants.
        </Alert>
      )}

      {/* Circular accordion list */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {circulars.map((c) => {
          const isOpen = expanded === c._id;
          const apps = applicants[c._id] || [];

          return (
            <Card
              key={c._id}
              variant="outlined"
              sx={{
                borderColor: isOpen ? "primary.main" : "divider",
                transition: "border-color 0.2s",
              }}
            >
              {/* Circular header row */}
              <CardContent
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  "&:last-child": { pb: 2 },
                }}
                onClick={() => toggleExpand(c._id)}
                id={`circular-accordion-${c._id}`}
              >
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Typography variant="h6" fontWeight={700}>
                      {c.programName}
                    </Typography>
                    {c.degreeLevel && (
                      <Chip label={c.degreeLevel} size="small" color="primary" variant="outlined" />
                    )}
                    <Chip
                      label={c.isActive ? "Active" : "Closed"}
                      size="small"
                      color={c.isActive ? "success" : "default"}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {c.department} &nbsp;·&nbsp; Deadline:{" "}
                    {new Date(c.deadline).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <PeopleAltIcon fontSize="small" color="secondary" />
                    <Typography variant="body2" fontWeight={600} color="secondary">
                      {isOpen && apps.length > 0 ? apps.length : "—"}
                    </Typography>
                  </Box>
                  <IconButton size="small">
                    {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
              </CardContent>

              {/* Applicant table */}
              <Collapse in={isOpen}>
                <Divider />
                {loadingApplicants === c._id ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : apps.length === 0 ? (
                  <Box sx={{ py: 3, textAlign: "center" }}>
                    <Typography color="text.secondary" variant="body2">
                      No applications yet for this circular.
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: "background.default" }}>
                          <TableCell sx={{ fontWeight: 700 }}>Applicant</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Submitted</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Current Status</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Update Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {apps.map((app) => (
                          <TableRow key={app._id} hover>
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Avatar
                                  sx={{ width: 28, height: 28, bgcolor: "primary.main", fontSize: 13 }}
                                >
                                  {app.student?.name?.[0]?.toUpperCase()}
                                </Avatar>
                                <Typography variant="body2" fontWeight={600}>
                                  {app.student?.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {app.student?.email}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(app.createdAt).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={app.status}
                                size="small"
                                color={statusColor[app.status] || "default"}
                              />
                            </TableCell>
                            <TableCell>
                              <FormControl size="small" sx={{ minWidth: 140 }}>
                                <InputLabel id={`status-label-${app._id}`}>Change to…</InputLabel>
                                <Select
                                  labelId={`status-label-${app._id}`}
                                  id={`status-select-${app._id}`}
                                  label="Change to…"
                                  value=""
                                  disabled={updating === app._id}
                                  onChange={(e) =>
                                    updateStatus(app._id, c._id, e.target.value)
                                  }
                                >
                                  {STATUS_OPTIONS.filter((s) => s !== app.status).map((s) => (
                                    <MenuItem key={s} value={s}>
                                      {s}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Collapse>
            </Card>
          );
        })}
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((p) => ({ ...p, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
