import { useState, useEffect, useRef } from "react";
import { api } from "../api.js";
import Avatar from "../components/Avatar.jsx";

export default function DirectoryScreen({ onViewMember }) {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null);

  // Load on mount and on search change (debounced)
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.getUsers(search);
        setMembers(data.users || []);
      } catch {
        setMembers([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [search]);

  return (
    <section className="app-panel">
      <h2>Member directory</h2>
      <p className="muted panel-intro">Search and connect with colleagues.</p>
      <label className="search-label">
        Search
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name, department, or email"
          autoComplete="off"
        />
      </label>
      {loading ? (
        <p className="muted loading-text">Loading members…</p>
      ) : members.length === 0 ? (
        <p className="muted empty-state">No members match your search.</p>
      ) : (
        <div className="member-list">
          {members.map((member) => (
            <article key={member.id} className="member-card">
              <Avatar user={member} size="lg" />
              <div className="member-card-body">
                <h3>{member.name}</h3>
                <p className="muted">{member.department}</p>
                <p className="member-email">{member.email}</p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onViewMember(member.id)}
              >
                View profile
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
