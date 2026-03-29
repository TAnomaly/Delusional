/**
 * Login / Register - serene, centered, Japanese minimalist.
 */
import { useState } from "react";
import { auth } from "../utils/api.js";
import { useAuth } from "../hooks/useAuth.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isRegister) {
      const res = await auth.register(form);
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      const loginRes = await auth.login({ username: form.username, password: form.password });
      if (loginRes.error) {
        setError(loginRes.error);
        setLoading(false);
        return;
      }
      login(loginRes.data.access_token);
    } else {
      const res = await auth.login({ username: form.username, password: form.password });
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      login(res.data.access_token);
    }
    setLoading(false);
  };

  return (
    <div
      className="app"
      style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div style={{ width: "100%", maxWidth: "380px" }} className="fade-in">
        {/* Decorative element */}
        <div className="text-center mb-md">
          <div
            style={{
              fontSize: "3rem",
              fontFamily: "var(--font-serif)",
              color: "var(--text-tertiary)",
              opacity: 0.3,
              marginBottom: "1rem",
            }}
          >
            禅
          </div>
          <h1 style={{ fontWeight: 200, fontSize: "1.5rem", letterSpacing: "0.1em" }}>
            Digital Minimalism
          </h1>
          <p className="text-sm font-light" style={{ marginTop: "0.25rem" }}>
            Clarity through intention
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card"
          style={{ border: "none", boxShadow: "var(--shadow-md)" }}
        >
          <h2>{isRegister ? "Create Account" : "Welcome Back"}</h2>

          {error && <div className="usage-warning mt-sm">{error}</div>}

          <div className="form-group" style={{ marginTop: "1rem" }}>
            <label>Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Choose a name"
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••"
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? "..." : isRegister ? "Begin" : "Enter"}
          </button>

          <p className="text-sm text-center mt-md">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsRegister(!isRegister);
                setError("");
              }}
            >
              {isRegister ? "Already here? Sign in" : "New? Create account"}
            </a>
          </p>
        </form>

        <p
          className="text-xs text-muted text-center mt-md font-light"
          style={{ letterSpacing: "0.1em" }}
        >
          Less noise. More signal.
        </p>
      </div>
    </div>
  );
}
