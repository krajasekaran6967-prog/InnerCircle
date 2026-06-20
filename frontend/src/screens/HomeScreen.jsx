export default function HomeScreen({ currentUser, onNavigate }) {
  return (
    <section className="app-panel">
      <h2>Hello, {currentUser.name}</h2>
      <p className="muted welcome-line">{currentUser.department}</p>
      <div className="card-grid">
        <article className="card card-action">
          <h3>Member directory</h3>
          <p className="muted">Find colleagues across departments.</p>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => onNavigate("directory")}>
            Browse directory
          </button>
        </article>
        <article className="card card-action">
          <h3>Your profile</h3>
          <p className="muted">Update your photo, bio, and details.</p>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => onNavigate("profile")}>
            Edit profile
          </button>
        </article>
        <article className="card card-action">
          <h3>Messages</h3>
          <p className="muted">Use public chat or direct messages with colleagues.</p>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => onNavigate("messages")}>
            Open messages
          </button>
        </article>
      </div>
    </section>
  );
}
