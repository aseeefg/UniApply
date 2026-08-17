import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { styled } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";

const StyledBox = styled("div")(({ theme }) => ({
  alignSelf: "center",
  width: "100%",
  marginTop: theme.spacing(6),
  borderRadius: theme.shape.borderRadius,
  border: "1px solid",
  borderColor: theme.palette.divider,
  background:
    "linear-gradient(135deg, rgba(140,47,47,0.06), rgba(166,135,61,0.08))",
  padding: theme.spacing(4),
  [theme.breakpoints.up("sm")]: {
    marginTop: theme.spacing(8),
    padding: theme.spacing(6),
  },
}));

const previewStats = [
  { value: "1,248", label: "Applications submitted" },
  { value: "812", label: "Students matched to eligible programs" },
  { value: "94%", label: "Profile-to-requirement match accuracy" },
];

function StatTile({ value, label }) {
  return (
    <Box sx={{ textAlign: "center", px: 2 }}>
      <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: { xs: "1.7rem", sm: "2.1rem" }, color: "text.primary" }}>
        {value}
      </Typography>
      <Typography
        sx={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "text.secondary",
          mt: 0.5,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export default function Hero() {
  return (
    <Box
      id="hero"
      sx={{
        width: "100%",
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(15, 45%, 88%), transparent)",
      }}
    >
      <Container sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: { xs: 12, sm: 16 }, pb: { xs: 8, sm: 10 } }}>
        <Stack spacing={2} useFlexGap sx={{ alignItems: "center", width: { xs: "100%", sm: "80%" } }}>
          <Typography
            variant="h1"
            sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: "center", fontSize: "clamp(2.4rem, 8vw, 3.4rem)", textAlign: "center" }}
          >
            One&nbsp;portal&nbsp;for&nbsp;every&nbsp;
            <Typography component="span" variant="h1" sx={{ fontSize: "inherit", color: "primary.main" }}>
              application
            </Typography>
          </Typography>
          <Typography sx={{ textAlign: "center", color: "text.secondary", width: { sm: "100%", md: "80%" } }}>
            Students search, compare, and apply to admission circulars from
            multiple universities in one place. Universities post circulars,
            review applicants, and manage decisions without the paperwork.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} useFlexGap sx={{ pt: 2 }}>
            <Button component={RouterLink} to="/register" variant="contained" color="primary" size="large">
              Get started
            </Button>
            <Button component={RouterLink} to="/login" variant="outlined" size="large" sx={{ borderColor: "divider", color: "text.primary" }}>
              I already have an account
            </Button>
          </Stack>
        </Stack>
        <StyledBox id="image">
          <Grid container spacing={2}>
            {previewStats.map((s) => (
              <Grid key={s.label} size={{ xs: 12, sm: 4 }}>
                <StatTile value={s.value} label={s.label} />
              </Grid>
            ))}
          </Grid>
          <Typography
            sx={{
              textAlign: "center",
              mt: 3,
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: "0.65rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "text.secondary",
              opacity: 0.7,
            }}
          >
            Sample data — illustrative preview
          </Typography>
        </StyledBox>
      </Container>
    </Box>
  );
}
