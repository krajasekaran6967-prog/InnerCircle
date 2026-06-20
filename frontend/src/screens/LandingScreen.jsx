export default function LandingScreen({ onNavigate }) {
  return (
    <section className="view hero">
      <div className="hero-content">
        <div className="logo-mark" aria-hidden="true">IC</div>
        <h1>InnerCircle</h1>
        <p className="tagline">Connect with colleagues, build community, and collaborate across teams.</p>
        <div className="hero-actions">
          <button type="button" className="btn btn-primary" onClick={() => onNavigate("login")}>Log in</button>
          <button type="button" className="btn btn-secondary" onClick={() => onNavigate("signup")}>Create account</button>
        </div>
      </div>
    </section>
  );
}
