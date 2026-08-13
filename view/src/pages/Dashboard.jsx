import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Typography, Button, Card, CardContent, CircularProgress, Alert, Stack } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import Letterhead from "../components/Letterhead";
import api from "../api/axios";

const roleLabels = { student: "Student", university: "University", admin: "Admin" };

function StatCard({ label, value }) {
  return (
    <Card sx={{ minWidth: 200, textAlign: 'center', p: 2 }}>
      <CardContent>
        <Typography variant="h3" component="div" color="primary" gutterBottom>
          {value}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

function useStats(role) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!role) return;
      setIsLoading(true);
      setError(null);
      try {
        let data;
        if (role === "student") {
          const res = await api.get("/applications/mine");
          data = res.data;
          if (isMounted) {
            setStats({
              total: data.length,
              underReview: data.filter((a) => a.status === "Under Review").length,
              accepted: data.filter((a) => a.status === "Accepted").length,
            });
          }
        } else if (role === "university") {
          const res = await api.get("/circulars/mine");
          data = res.data;
          if (isMounted) {
            setStats({
              total: data.length,
              active: data.filter((c) => c.isActive).length,
            });
          }
        } else if (role === "admin") {
          const res = await api.get("/admin/universities/pending");
          data = res.data;
          if (isMounted) {
            setStats({ pending: data.length });
          }
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load statistics.");
          setStats(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    load();
    return () => { isMounted = false; };
  }, [role]);

  return { stats, isLoading, error };
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { stats, isLoading, error } = useStats(user?.role);

  return (
    <Box className="dashboard" sx={{ maxWidth: 800, mx: "auto", mt: 4, p: 2 }}>
      <Letterhead subtitle="Admissions Portal" />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h2">
          Welcome, {user?.name}
        </Typography>
        <Button variant="outlined" color="secondary" onClick={logout}>
          Log out
        </Button>
      </Box>

      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Signed in as {roleLabels[user?.role] || user?.role}
      </Typography>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      {stats && !isLoading && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, my: 4, justifyContent: 'center' }}>
          {user?.role === "student" && (
            <>
              <StatCard label="Applications submitted" value={stats.total} />
              <StatCard label="Under review" value={stats.underReview} />
              <StatCard label="Accepted" value={stats.accepted} />
            </>
          )}
          {user?.role === "university" && (
            <>
              <StatCard label="Total circulars" value={stats.total} />
              <StatCard label="Active circulars" value={stats.active} />
            </>
          )}
          {user?.role === "admin" && (
            <StatCard label="Universities awaiting approval" value={stats.pending} />
          )}
        </Box>
      )}

      <Stack spacing={2} sx={{ mt: 4 }}>
        {user?.role === "student" && (
          <>
            <Button component={RouterLink} to="/student/profile" variant="contained">Complete / edit my profile</Button>
            <Button component={RouterLink} to="/circulars" variant="contained">Browse admission circulars</Button>
            <Button component={RouterLink} to="/recommendations" variant="contained">Recommended for you</Button>
            <Button component={RouterLink} to="/applications" variant="contained">My applications</Button>
          </>
        )}

        {user?.role === "university" && (
          <>
            <Button component={RouterLink} to="/university/profile" variant="contained">My university profile</Button>
            <Button component={RouterLink} to="/university/circulars" variant="contained">Manage my circulars</Button>
          </>
        )}

        {user?.role === "admin" && (
          <Button component={RouterLink} to="/admin/verifications" variant="contained">Pending university verifications</Button>
        )}
      </Stack>
    </Box>
  );
}
