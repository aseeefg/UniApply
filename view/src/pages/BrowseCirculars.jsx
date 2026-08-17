import { useEffect, useState, useCallback } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box, Typography, Button, Card, CardContent, CardActions, Chip,
  Grid, TextField, MenuItem, Select, FormControl, InputLabel,
  Collapse, Divider, Alert, CircularProgress, Snackbar, IconButton, Tooltip,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ClearIcon from "@mui/icons-material/Clear";
import api from "../api/axios";

const DEGREE_LEVELS = ["", "Bachelor", "Master", "PhD", "Diploma", "Certificate"];

const daysLeft = (deadline) => {
  const diff = new Date(deadline) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const deadlineChip = (deadline) => {
  const d = daysLeft(deadline);
  if (d <= 0) return <Chip label="Closed" color="default" size="small" />;
  if (d <= 3) return <Chip label={`${d}d left`} color="error" size="small" />;
  if (d <= 7) return <Chip label={`${d}d left`} color="warning" size="small" />;
  return <Chip label={`${d}d left`} color="success" size="small" />;
};

export default function BrowseCirculars() {
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });
  const [saved, setSaved] = useState({}); // circularId → bool
  const [showFilters, setShowFilters] = useState(false);
  const [applying, setApplying] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    degreeLevel: "",
    department: "",
    location: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({});

  const buildQuery = (f) => {
    const params = new URLSearchParams();
    if (f.degreeLevel) params.set("degreeLevel", f.degreeLevel);
    if (f.department) params.set("department", f.department);
    if (f.location) params.set("location", f.location);
    return params.toString();
  };

  const load = useCallback(async (filterObj = {}) => {
    setLoading(true);
    try {
      const qs = buildQuery(filterObj);
      const { data } = await api.get(`/circulars${qs ? "?" + qs : ""}`);
      setCirculars(data);
    } catch (err) {
      showSnack(err.response?.data?.message || "Failed to load circulars", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const showSnack = (msg, severity = "success") =>
    setSnack({ open: true, msg, severity });

  const apply = async (circularId) => {
    setApplying(circularId);
    try {
      await api.post("/applications", { circularId });
      showSnack("Application submitted! ✓");
    } catch (err) {
      showSnack(err.response?.data?.message || "Could not apply", "error");
    } finally {
      setApplying(null);
    }
  };

  const toggleSave = async (circularId) => {
    try {
      await api.post(`/notifications/circulars/${circularId}/save`);
      setSaved((prev) => ({ ...prev, [circularId]: !prev[circularId] }));
      showSnack(saved[circularId] ? "Removed from saved" : "Saved! You'll get a reminder before the deadline.");
    } catch (err) {
      showSnack(err.response?.data?.message || "Could not save", "error");
    }
  };

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
    load(filters);
  };

  const clearFilters = () => {
    const empty = { degreeLevel: "", department: "", location: "" };
    setFilters(empty);
    setAppliedFilters({});
    load(empty);
  };

  const hasActiveFilters =
    appliedFilters.degreeLevel || appliedFilters.department || appliedFilters.location;

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", mt: 4, p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Button
        component={RouterLink}
        to="/dashboard"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2, color: "text.secondary" }}
      >
        Back to dashboard
      </Button>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="overline" color="secondary" display="block" sx={{ letterSpacing: 2 }}>
            Student Portal
          </Typography>
          <Typography variant="h4" component="h1">
            Open Admission Circulars
          </Typography>
          {hasActiveFilters && (
            <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
              {appliedFilters.degreeLevel && (
                <Chip label={`Degree: ${appliedFilters.degreeLevel}`} size="small" color="primary" variant="outlined" />
              )}
              {appliedFilters.department && (
                <Chip label={`Dept: ${appliedFilters.department}`} size="small" color="primary" variant="outlined" />
              )}
              {appliedFilters.location && (
                <Chip label={`Location: ${appliedFilters.location}`} size="small" color="primary" variant="outlined" />
              )}
              <Chip
                label="Clear all"
                size="small"
                icon={<ClearIcon />}
                onClick={clearFilters}
                sx={{ cursor: "pointer" }}
              />
            </Box>
          )}
        </Box>
        <Button
          id="toggle-filters"
          variant={showFilters ? "contained" : "outlined"}
          startIcon={<FilterListIcon />}
          onClick={() => setShowFilters((p) => !p)}
          color="secondary"
        >
          {showFilters ? "Hide Filters" : "Filter"}
        </Button>
      </Box>

      {/* Filter Panel */}
      <Collapse in={showFilters}>
        <Card variant="outlined" sx={{ mb: 3, p: 2, bgcolor: "background.default" }}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Filter Circulars
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
              gap: 2,
              mb: 2,
            }}
          >
            {/* Degree Level */}
            <FormControl size="small" fullWidth>
              <InputLabel id="filter-degree-label">Degree Level</InputLabel>
              <Select
                labelId="filter-degree-label"
                id="filter-degree"
                label="Degree Level"
                value={filters.degreeLevel}
                onChange={(e) => setFilters((p) => ({ ...p, degreeLevel: e.target.value }))}
              >
                {DEGREE_LEVELS.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d || "Any"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Department */}
            <TextField
              id="filter-department"
              label="Department"
              size="small"
              placeholder="e.g. Computer Science"
              value={filters.department}
              onChange={(e) => setFilters((p) => ({ ...p, department: e.target.value }))}
            />

            {/* Location */}
            <TextField
              id="filter-location"
              label="University Location"
              size="small"
              placeholder="e.g. Dhaka"
              value={filters.location}
              onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button id="apply-filters" variant="contained" size="small" onClick={applyFilters}>
              Apply Filters
            </Button>
            <Button variant="text" size="small" onClick={clearFilters} color="secondary">
              Clear
            </Button>
          </Box>
        </Card>
      </Collapse>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && circulars.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No circulars match your filters. Try adjusting or clearing them.
        </Alert>
      )}

      {/* Circular Cards */}
      <Grid container spacing={2}>
        {circulars.map((c) => (
          <Grid item xs={12} sm={6} md={4} key={c._id}>
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "box-shadow 0.2s",
                "&:hover": { boxShadow: 4 },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ lineHeight: 1.3 }}>
                    {c.programName}
                  </Typography>
                  {deadlineChip(c.deadline)}
                </Box>

                <Typography variant="body2" color="secondary" fontWeight={600} gutterBottom>
                  {c.university?.universityProfile?.universityName || c.university?.name}
                </Typography>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
                  {c.degreeLevel && (
                    <Chip label={c.degreeLevel} size="small" variant="outlined" color="primary" />
                  )}
                  <Chip label={c.department} size="small" variant="outlined" />
                </Box>

                <Typography variant="body2" color="text.secondary">
                  📍 {c.university?.universityProfile?.location || "—"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  🪑 {c.seatsAvailable} seats &nbsp;|&nbsp; 💵 ৳{c.applicationFee}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Deadline: {new Date(c.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </Typography>
              </CardContent>

              <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
                <Button
                  id={`apply-${c._id}`}
                  variant="contained"
                  size="small"
                  onClick={() => apply(c._id)}
                  disabled={applying === c._id}
                  sx={{ flexGrow: 1 }}
                >
                  {applying === c._id ? "Applying…" : "Apply Now"}
                </Button>
                <Tooltip title={saved[c._id] ? "Unsave circular" : "Save for deadline reminder"}>
                  <IconButton
                    id={`save-${c._id}`}
                    size="small"
                    onClick={() => toggleSave(c._id)}
                    color={saved[c._id] ? "secondary" : "default"}
                  >
                    {saved[c._id] ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((p) => ({ ...p, open: false }))}
          variant="filled"
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
