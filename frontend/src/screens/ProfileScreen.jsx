import { useState, useEffect } from "react";
import { api } from "../api.js";
import Avatar from "../components/Avatar.jsx";

export default function ProfileScreen({ currentUser, onProfileUpdated, onToast }) {
  const [form, setForm] = useState({ name: "", department: "", bio: "" });

  useEffect(() => {
    setForm({ name: currentUser.name, department: currentUser.department, bio: currentUser.bio || "" });
  }, [currentUser]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = await api.updateProfile(form);
      onProfileUpdated(data.user);
      onToast("Profile saved.", "success");
    } catch (err) {
      onToast(err.message, "error");
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await api.uploadAvatar(file);
      onProfileUpdated(data.user);
      onToast("Photo updated.", "success");
    } catch (err) {
      onToast(err.message, "error");
    }
    e.target.value = "";
  }

  return (
    <section className="app-panel">
      <h2>My profile</h2>
      <p className="muted panel-intro">Your photo and details are visible to other employees.</p>
      <div className="profile-edit">
        <div className="avatar-upload">
          <Avatar user={currentUser} size="xl" />
          <label className="btn btn-secondary btn-sm avatar-upload-btn">
            Change photo
            <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" hidden onChange={handleAvatarChange} />
          </label>
        </div>
        <form className="form profile-form" onSubmit={handleSubmit}>
          <label>Full name<input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          <label>Department<input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required /></label>
          <label>Bio<textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell colleagues a bit about yourself" /></label>
          <button type="submit" className="btn btn-primary">Save profile</button>
        </form>
      </div>
    </section>
  );
}
