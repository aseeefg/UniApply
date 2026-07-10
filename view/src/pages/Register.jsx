import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-form">
        <h1>Create your account</h1>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <div className="role-toggle">
          <button type="button" className={role === "student" ? "active" : ""} onClick={() => setRole("student")}>
            Student
          </button>
          <button type="button" className={role === "university" ? "active" : ""} onClick={() => setRole("university")}>
            University
          </button>
        </div>

        <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        {role === "university" && (
          <input
            placeholder="University name"
            value={universityName}
            onChange={(e) => setUniversityName(e.target.value)}
            required
          />
        )}

        <button type="submit">Register</button>
        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
