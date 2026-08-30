import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[400px] bg-card border border-border border-l-4 border-l-seal rounded-lg shadow-[0_1px_3px_rgba(24,42,34,0.06)] px-7 py-9">
        <form className="flex flex-col gap-3" onSubmit={handleSubmit} noValidate>
          <h2 className="text-xl mb-1">Log in</h2>
          {error && <p className="error">{error}</p>}

          <label htmlFor="email" className="font-mono text-xs uppercase tracking-wide text-slate">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="px-3 py-2.5 border border-border rounded-md text-[0.95rem] bg-paper text-ink focus:outline-none focus:border-seal transition-colors duration-300"
          />

          <label htmlFor="password" className="font-mono text-xs uppercase tracking-wide text-slate">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            required
            className="px-3 py-2.5 border border-border rounded-md text-[0.95rem] bg-paper text-ink focus:outline-none focus:border-seal transition-colors duration-300"
          />

          <button type="submit" className="btn-solid mt-2 w-full text-center">Log in</button>
          <p className="text-center text-sm text-ink-soft mt-1">
            No account? <RouterLink to="/register" className="text-seal">Register</RouterLink>
          </p>
        </form>
      </div>
    </div>
  );
}
