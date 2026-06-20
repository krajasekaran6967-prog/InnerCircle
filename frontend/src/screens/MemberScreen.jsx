import { useState, useEffect } from "react";
import { api } from "../api.js";
import Avatar from "../components/Avatar.jsx";

export default function MemberScreen({ userId, onBack, onMessage, onToast }) {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadMember() {
    setLoading(true);
    try {
      const data = await api.getUser(userId);
      setMember(data.user);
    } catch (err) {
      onToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadMember(); }, [userId]);

  async function handleAddFriend() {
    try {
      await api.addFriend(userId);
      onToast("Friend added!", "success");
      loadMember();
    } catch (err) {
      onToast(err.message, "error");
    }
  }

  async function handleRemoveFriend() {
    try {
      await api.removeFriend(userId);
      onToast("Friend removed.", "success");
      loadMember();
    } catch (err) {
      onToast(err.message, "error");
    }
  }

  return (
    <section className="app-panel">
      <button type="button" className="link-btn back-link" onClick={onBack}>← Back to directory</button>
      {loading && <p className="muted loading-text">Loading profile…</p>}
      {member && (
        <div className="member-profile-wrap">
          <div className="profile-display">
            <Avatar user={member} size="xl" />
            <div>
              <h2>{member.name}</h2>
              <p className="muted">{member.department}</p>
              <p className="member-email">{member.email}</p>
              <div className="member-actions">
                {member.isFriend
                  ? <button type="button" className="btn btn-secondary btn-sm" onClick={handleRemoveFriend}>Remove friend</button>
                  : <button type="button" className="btn btn-primary btn-sm" onClick={handleAddFriend}>Add friend</button>}
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => onMessage(member.id)}>Message</button>
              </div>
              {member.bio
                ? <p className="profile-bio">{member.bio}</p>
                : <p className="muted">No bio yet.</p>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
