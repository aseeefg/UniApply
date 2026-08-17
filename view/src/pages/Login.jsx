import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import { useAuth } from "../context/AuthContext";
import AuthContent from "../components/mui/AuthContent";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <Stack
      direction="column"
      component="main"
      sx={{
        minHeight: "100vh",
        justifyContent: "center",
        backgroundImage: "radial-gradient(ellipse at 50% 30%, hsl(15, 45%, 92%), transparent)",
      }}
    >
      <Stack
        direction={{ xs: "column-reverse", md: "row" }}
        sx={{ justifyContent: "center", gap: { xs: 6, sm: 10 }, p: { xs: 2, sm: 4 }, m: "auto" }}
      >
        <AuthContent />
        <Card
          elevation={0}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignSelf: "center",
            width: "100%",
            maxWidth: 420,
            p: 4,
            gap: 2,
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(24, 42, 34, 0.1)",
          }}
        >
          <Typography component="h1" variant="h4" sx={{ fontSize: "clamp(1.8rem, 6vw, 2.1rem)" }}>
            Log in
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                fullWidth
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                required
                fullWidth
              />
            </FormControl>
            <Button type="submit" fullWidth variant="contained">
              Log in
            </Button>
            <Typography sx={{ textAlign: "center" }}>
              No account?{" "}
              <RouterLink to="/register" style={{ color: "inherit" }}>
                Register
              </RouterLink>
            </Typography>
          </Box>
        </Card>
      </Stack>
    </Stack>
  );
}
