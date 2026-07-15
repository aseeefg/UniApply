import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Link as RouterLink } from "react-router-dom";

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexShrink: 0,
  borderRadius: 16,
  backdropFilter: "blur(24px)",
  backgroundColor: alpha(theme.palette.background.default, 0.75),
  boxShadow: "0 4px 20px rgba(24, 42, 34, 0.08)",
  padding: "14px 20px",
  minHeight: 72,
}));

const navItems = [
  { label: "Overview", href: "#hero" },
  { label: "Highlights", href: "#highlights" },
];

function Sitemark() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mr: 3 }}>
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          border: "2px solid",
          borderColor: "text.primary",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '"Fraunces", serif',
          fontWeight: 700,
          fontSize: "1rem",
        }}
      >
        UA
      </Box>
      <Typography variant="h5" sx={{ fontFamily: '"Fraunces", serif', color: "text.primary" }}>
        UniApply
      </Typography>
    </Box>
  );
}

export default function AppAppBar() {
  const [open, setOpen] = React.useState(false);
  const toggleDrawer = (newOpen) => () => setOpen(newOpen);

  return (
    <AppBar
      position="sticky"
      color="transparent"
      sx={{ boxShadow: 0, backgroundImage: "none", pt: 2 }}
    >
      <Container maxWidth="lg">
        <StyledToolbar variant="dense" disableGutters>
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", px: 0 }}>
            <Sitemark />
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  href={item.href}
                  variant="text"
                  size="medium"
                  sx={{ color: "text.primary", fontSize: "0.95rem", px: 1.5 }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          </Box>

          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1.25, alignItems: "center" }}>
            <Button component={RouterLink} to="/login" variant="text" size="medium" sx={{ color: "text.primary", fontSize: "0.95rem" }}>
              Log in
            </Button>
            <Button component={RouterLink} to="/register" variant="contained" color="primary" size="medium" sx={{ fontSize: "0.95rem" }}>
              Register
            </Button>
          </Box>

          <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1 }}>
            <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer anchor="top" open={open} onClose={toggleDrawer(false)}>
              <Box sx={{ p: 2, backgroundColor: "background.default" }}>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <IconButton onClick={toggleDrawer(false)}>
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>
                {navItems.map((item) => (
                  <MenuItem key={item.label} href={item.href} component="a">
                    {item.label}
                  </MenuItem>
                ))}
                <Divider sx={{ my: 3 }} />
                <MenuItem>
                  <Button component={RouterLink} to="/register" color="primary" variant="contained" fullWidth>
                    Register
                  </Button>
                </MenuItem>
                <MenuItem>
                  <Button component={RouterLink} to="/login" color="primary" variant="outlined" fullWidth>
                    Log in
                  </Button>
                </MenuItem>
              </Box>
            </Drawer>
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  );
}
