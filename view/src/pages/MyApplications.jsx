import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box, Typography, Button, Card, CardContent, Chip, Divider,
  Collapse, IconButton, CircularProgress, Alert,
  Stepper, Step, StepLabel, StepContent,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import api from "../api/axios";

const statusColor = {
  Submitted: "default",
  "Under Review": "info",
  Shortlisted: "secondary",
  Accepted: "success",
  Rejected: "error",
};

const statusIcon = {
  Submitted: "📋",
  "Under Review": "🔍",
  Shortlisted: "⭐",
  Accepted: "✅",
  Rejected: "❌",
};

const daysAgo = (date) => {
  const diff = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${diff} days ago`;
};

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null); // appId with timeline open

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/applications/mine");
        setApplications(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleTimeline = (appId) =>
    setExpanded((prev) => (prev === appId ? null : appId));

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4, p: { xs: 2, md: 3 } }}>
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
        Student Records
      </Typography>
      <Typography variant="h4" component="h1" gutterBottom>
        My Applications
      </Typography>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && applications.length === 0 && (
        <Alert severity="info">
          You haven't applied to any circulars yet.{" "}
          <RouterLink to="/circulars" style={{ color: "inherit", fontWeight: 600 }}>
            Browse open circulars →
          </RouterLink>
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {applications.map((app) => {
          const isOpen = expanded === app._id;
          const history = app.statusHistory || [];
          // Active step = last in history
          const activeStep = history.length - 1;

          return (
            <Card
              key={app._id}
              variant="outlined"
              sx={{
                borderColor: isOpen ? "primary.main" : "divider",
                transition: "border-color 0.2s",
              }}
            >
              {/* Application summary row */}
              <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="h6" fontWeight={700} noWrap>
                      {app.circular?.programName}
                    </Typography>
                    <Typography variant="body2" color="secondary" fontWeight={600}>
                      {app.circular?.university?.universityProfile?.universityName ||
                        app.circular?.university?.name}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                      {app.circular?.degreeLevel && (
                        <Chip
                          label={app.circular.degreeLevel}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      )}
                      <Chip label={app.circular?.department} size="small" variant="outlined" />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                      Applied {daysAgo(app.createdAt)} ·{" "}
                      Deadline:{" "}
                      {app.circular?.deadline
                        ? new Date(app.circular.deadline).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </Typography>
                  </Box>

                  {/* Status + expand toggle */}
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1, ml: 2 }}>
                    <Chip
                      label={`${statusIcon[app.status] || ""} ${app.status}`}
                      color={statusColor[app.status] || "default"}
                      size="small"
                    />
                    <Button
                      id={`timeline-toggle-${app._id}`}
                      size="small"
                      variant="text"
                      color="secondary"
                      onClick={() => toggleTimeline(app._id)}
                      endIcon={isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      sx={{ textTransform: "none", fontSize: 12 }}
                    >
                      {isOpen ? "Hide timeline" : "View timeline"}
                    </Button>
                  </Box>
                </Box>
              </CardContent>

              {/* Status Timeline */}
              <Collapse in={isOpen}>
                <Divider />
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    Application Timeline
                  </Typography>

                  {history.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No status history available.
                    </Typography>
                  ) : (
                    <Stepper activeStep={activeStep} orientation="vertical" nonLinear>
                      {history.map((entry, i) => (
                        <Step key={i} completed={i < activeStep} active={i === activeStep}>
                          <StepLabel
                            StepIconProps={{
                              sx: {
                                color:
                                  i === activeStep
                                    ? entry.status === "Accepted"
                                      ? "success.main"
                                      : entry.status === "Rejected"
                                      ? "error.main"
                                      : entry.status === "Shortlisted"
                                      ? "secondary.main"
                                      : "primary.main"
                                    : "text.disabled",
                              },
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Chip
                                label={`${statusIcon[entry.status] || ""} ${entry.status}`}
                                size="small"
                                color={
                                  i === activeStep
                                    ? statusColor[entry.status] || "default"
                                    : "default"
                                }
                                variant={i === activeStep ? "filled" : "outlined"}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {new Date(entry.timestamp).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </Typography>
                            </Box>
                          </StepLabel>
                          <StepContent>
                            <Typography variant="caption" color="text.secondary">
                              {i === 0
                                ? "Your application was successfully submitted."
                                : i === activeStep
                                ? "This is the current status of your application."
                                : "Status at this stage."}
                            </Typography>
                          </StepContent>
                        </Step>
                      ))}
                    </Stepper>
                  )}
                </CardContent>
              </Collapse>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
