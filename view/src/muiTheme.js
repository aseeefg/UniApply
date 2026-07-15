import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#8C2F2F", dark: "#6E2523" }, // seal
    secondary: { main: "#A6873D" }, // brass
    success: { main: "#4B6B4F" }, // moss
    background: { default: "#EEF0EA", paper: "#FBFBF7" }, // paper / card
    text: { primary: "#182A22", secondary: "#57636B" }, // ink / slate
    divider: "#D9DACD",
  },
  typography: {
    fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
    h1: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
    h2: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
    h3: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
    h4: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 3 },
});

export default theme;
