import { useState } from "react";
import { api } from "../api.js";

export default function LoginScreen({ onLogin, onNavigate }) {
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      setError("");
      const data = await api.login({ email: fd.get("email"), password: fd.get("password") });
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="view auth-view">
      <div className="auth-card">
        <h2>Welcome back</h2>
        <p className="auth-subtitle">Sign in to your InnerCircle account</p>
        <form className="form" onSubmit={handleSubmit}>
          <label>Email<input type="email" name="email" required autoComplete="email" /></label>
          <label>Password<input type="password" name="password" required autoComplete="current-password" /></label>
          {error && <p className="form-message error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-full">Log in</button>
        </form>
        <p className="auth-footer">
          New here? <button type="button" className="link-btn" onClick={() => onNavigate("signup")}>Create an account</button>
        </p>
        <button type="button" className="link-btn back-link" onClick={() => onNavigate("landing")}>Back</button>
      </div>
    </section>
  );
}
