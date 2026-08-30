import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
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
      const payload =
        role === "university"
          ? { email: form.email, password: form.password, role, universityProfile: { universityName } }
          : { ...form, role };
      const data = await register(payload);
      setMessage(data.message);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  const inputClass =
    "px-3 py-2.5 border border-border rounded-md text-[0.95rem] bg-paper text-ink focus:outline-none focus:border-seal transition-colors duration-300";
  const labelClass = "font-mono text-xs uppercase tracking-wide text-slate";

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[400px] bg-card border border-border border-l-4 border-l-seal rounded-lg shadow-[0_1px_3px_rgba(24,42,34,0.06)] px-7 py-9">
        <form className="flex flex-col gap-3" onSubmit={handleSubmit} noValidate>
          <h2 className="text-xl mb-1">Create your account</h2>
          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}

          <div className="role-toggle">
            <button
              type="button"
              className={role === "student" ? "active" : ""}
              onClick={() => setRole("student")}
            >
              Student
            </button>
            <button
              type="button"
              className={role === "university" ? "active" : ""}
              onClick={() => setRole("university")}
            >
              University
            </button>
          </div>

          {role === "student" ? (
            <>
              <label htmlFor="name" className={labelClass}>Full name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} required className={inputClass} />
            </>
          ) : (
            <>
              <label htmlFor="uni-name" className={labelClass}>University name</label>
              <input
                id="uni-name"
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                required
                className={inputClass}
              />
            </>
          )}

          <label htmlFor="reg-email" className={labelClass}>Email</label>
          <input
            id="reg-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="your@email.com"
            required
            className={inputClass}
          />

          <label htmlFor="reg-password" className={labelClass}>Password</label>
          <input
            id="reg-password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••"
            required
            className={inputClass}
          />

          <button type="submit" className="btn-solid mt-2 w-full text-center">Register</button>
          <p className="text-center text-sm text-ink-soft mt-1">
            Already have an account? <RouterLink to="/login" className="text-seal">Log in</RouterLink>
          </p>
        </form>
      </div>
    </div>
  );
}
