import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

const items = [
  { num: "01", title: "One login, every university", desc: "Students stop juggling separate accounts and portals for each university they apply to." },
  { num: "02", title: "Verified institutions only", desc: "Every university account is manually approved by an admin before it can post a circular." },
  { num: "03", title: "Real-time status tracking", desc: "Every application carries a full timestamped history — Submitted through Accepted or Rejected." },
  { num: "04", title: "Deadline-aware", desc: "Circulars close automatically once the deadline passes — no more applying to expired postings." },
  { num: "05", title: "Role-based access", desc: "Students, universities, and admins each see exactly the tools relevant to them, nothing else." },
  { num: "06", title: "Built for one admissions cycle", desc: "Designed around a single semester's admissions workflow, from posting to final decision." },
];

export default function Highlights() {
  return (
    <Box id="highlights" sx={{ bgcolor: "background.default", py: { xs: 6, sm: 9 } }}>
      <Container sx={{ textAlign: "center" }}>
        <Typography variant="caption" sx={{ color: "text.secondary", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: '"IBM Plex Mono", monospace' }}>
          Why UniApply
        </Typography>
        <Typography variant="h4" sx={{ color: "text.primary", mt: 1, mb: 4 }}>
          One system, every stage of admissions
        </Typography>
        <Grid container spacing={2.5} sx={{ textAlign: "left" }}>
          {items.map((item) => (
            <Grid key={item.num} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  bgcolor: "background.paper",
                  borderRadius: "12px",
                  boxShadow: "0 2px 16px rgba(24, 42, 34, 0.08)",
                }}
              >
                <CardContent>
                  <Typography sx={{ color: "secondary.main", fontFamily: '"IBM Plex Mono", monospace', fontSize: "0.85rem" }}>
                    {item.num}
                  </Typography>
                  <Typography variant="h6" sx={{ color: "text.primary", mt: 0.5, mb: 0.75 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {item.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
