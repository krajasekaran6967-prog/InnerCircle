import { useState } from "react";
import { api } from "../api.js";

export default function SignupScreen({ onLogin, onNavigate }) {
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      setError("");
      const data = await api.signup({
        name: fd.get("name"),
        email: fd.get("email"),
        department: fd.get("department"),
        password: fd.get("password"),
      });
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="view auth-view">
      <div className="auth-card">
        <h2>Join InnerCircle</h2>
        <p className="auth-subtitle">Register with your work details</p>
        <form className="form" onSubmit={handleSubmit}>
          <label>Full name<input type="text" name="name" required autoComplete="name" /></label>
          <label>Email<input type="email" name="email" required autoComplete="email" /></label>
          <label>Department<input type="text" name="department" required placeholder="e.g. Engineering" /></label>
          <label>Password<input type="password" name="password" required minLength={8} autoComplete="new-password" /></label>
          {error && <p className="form-message error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-full">Create account</button>
        </form>
        <p className="auth-footer">
          Already have an account? <button type="button" className="link-btn" onClick={() => onNavigate("login")}>Log in</button>
        </p>
        <button type="button" className="link-btn back-link" onClick={() => onNavigate("landing")}>Back</button>
      </div>
    </section>
  );
}
