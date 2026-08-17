import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import GitHubIcon from "@mui/icons-material/GitHub";
import { Link as RouterLink } from "react-router-dom";

function Copyright() {
  return (
    <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
      {"Copyright © "}
      UniApply {new Date().getFullYear()}
    </Typography>
  );
}

export default function Footer() {
  return (
    <Box sx={{ pt: { xs: 6, sm: 8 } }}>
      <Container
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          gap: 4,
          pb: { xs: 5, sm: 6 },
          textAlign: { sm: "center", md: "left" },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: { xs: "100%", sm: "50%" } }}>
          <Typography variant="h6" sx={{ fontFamily: '"Fraunces", serif' }}>
            UniApply
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 320 }}>
            Every university application, one portal, no paperwork.
          </Typography>
        </Box>

        <Box sx={{ display: { xs: "none", sm: "flex" }, flexDirection: "column", gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: "medium" }}>
            Account
          </Typography>
          <Link component={RouterLink} to="/login" variant="body2" sx={{ color: "text.secondary" }}>
            Log in
          </Link>
          <Link component={RouterLink} to="/register" variant="body2" sx={{ color: "text.secondary" }}>
            Register
          </Link>
        </Box>

        <Box sx={{ display: { xs: "none", sm: "flex" }, flexDirection: "column", gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: "medium" }}>
            Sections
          </Typography>
          <Link href="#hero" variant="body2" sx={{ color: "text.secondary" }}>
            Overview
          </Link>
          <Link href="#highlights" variant="body2" sx={{ color: "text.secondary" }}>
            Highlights
          </Link>
        </Box>
      </Container>

      {/* Full-bleed divider so the line spans the whole screen, not just the content column */}
      <Box sx={{ borderTop: "1px solid", borderColor: "divider" }}>
        <Container
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: { xs: 3, sm: 4 },
          }}
        >
          <Copyright />
          <Stack direction="row" spacing={1} useFlexGap sx={{ color: "text.secondary" }}>
            <IconButton
              color="inherit"
              size="small"
              href="https://github.com/aseeefg/UniApply"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub repository"
            >
              <GitHubIcon />
            </IconButton>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
