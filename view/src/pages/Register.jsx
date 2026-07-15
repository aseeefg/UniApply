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
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Alert from "@mui/material/Alert";
import { useAuth } from "../context/AuthContext";
import AuthContent from "../components/mui/AuthContent";

export default function Register() {
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [universityName, setUniversityName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        role,
        ...(role === "university" && { universityProfile: { universityName } }),
      };
      const data = await register(payload);
      setMessage(data.message);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
            Create your account
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          {message && <Alert severity="success">{message}</Alert>}

          <ToggleButtonGroup
            value={role}
            exclusive
            onChange={(e, val) => val && setRole(val)}
            fullWidth
            color="primary"
          >
            <ToggleButton value="student">Student</ToggleButton>
            <ToggleButton value="university">University</ToggleButton>
          </ToggleButtonGroup>

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl>
              <FormLabel htmlFor="name">Full name</FormLabel>
              <TextField id="name" name="name" value={form.name} onChange={handleChange} required fullWidth />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="reg-email">Email</FormLabel>
              <TextField
                id="reg-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
                fullWidth
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="reg-password">Password</FormLabel>
              <TextField
                id="reg-password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••"
                required
                fullWidth
              />
            </FormControl>

            {role === "university" && (
              <FormControl>
                <FormLabel htmlFor="uni-name">University name</FormLabel>
                <TextField
                  id="uni-name"
                  value={universityName}
                  onChange={(e) => setUniversityName(e.target.value)}
                  required
                  fullWidth
                />
              </FormControl>
            )}

            <Button type="submit" fullWidth variant="contained">
              Register
            </Button>
            <Typography sx={{ textAlign: "center" }}>
              Already have an account?{" "}
              <RouterLink to="/login" style={{ color: "inherit" }}>
                Log in
              </RouterLink>
            </Typography>
          </Box>
        </Card>
      </Stack>
    </Stack>
  );
}
