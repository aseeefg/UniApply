import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import AppAppBar from "../components/mui/AppAppBar";
import Hero from "../components/mui/Hero";
import Highlights from "../components/mui/Highlights";
import Footer from "../components/mui/Footer";

function Tracks() {
  const tracks = [
    {
      label: "For Students",
      title: "Apply without the chaos",
      steps: [
        "Build your academic profile once",
        "Search and filter open circulars by program, deadline, or location",
        "Apply directly and track every application's status in one dashboard",
      ],
    },
    {
      label: "For Universities",
      title: "Manage admissions, not spreadsheets",
      steps: [
        "Get verified and set up your institutional profile",
        "Post, edit, and close admission circulars in minutes",
        "Review applicants and update decisions from one place",
      ],
    },
  ];

  return (
    <Container sx={{ py: { xs: 5, sm: 7 } }}>
      <Grid container spacing={3}>
        {tracks.map((track) => (
          <Grid key={track.label} size={{ xs: 12, sm: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: "100%",
                borderRadius: "12px",
                borderLeft: "4px solid",
                borderLeftColor: "secondary.main",
                boxShadow: "0 2px 16px rgba(24, 42, 34, 0.08)",
              }}
            >
              <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {track.label}
              </Typography>
              <Typography variant="h5" sx={{ mt: 0.5, mb: 1.5 }}>
                {track.title}
              </Typography>
              <Box component="ol" sx={{ pl: 2.5, m: 0, color: "text.secondary", lineHeight: 2 }}>
                {track.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default function LandingMUI() {
  return (
    <>
      <AppAppBar />
      <Hero />
      <Tracks />
      <Highlights />
      <Footer />
    </>
  );
}
