import { useState, useEffect, useRef } from "react";
import { api } from "../api.js";
import MessageItem from "../components/MessageItem.jsx";
import InlineForm from "../components/InlineForm.jsx";

export default function MessagesScreen({ initialTab = "public", initialFriendId = null, onToast }) {
  const [tab, setTab] = useState(initialTab);
  const [publicMessages, setPublicMessages] = useState([]);
  const [directMessages, setDirectMessages] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendId, setFriendId] = useState(initialFriendId || "");
  const pollRef = useRef(null);
  const publicListRef = useRef(null);
  const directListRef = useRef(null);

  async function loadPublic() {
    try {
      const data = await api.getPublicMessages();
      setPublicMessages(data.messages || []);
    } catch (err) {
      onToast(err.message, "error");
    }
  }

  async function loadDirect(fid) {
    const id = fid ?? friendId;
    if (!id) return;
    try {
      const data = await api.getDirectMessages(id);
      setDirectMessages(data.messages || []);
    } catch (err) {
      onToast(err.message, "error");
    }
  }

  // Load friends and initial messages
  useEffect(() => {
    api.getFriends().then((data) => {
      const list = data.users || [];
      setFriends(list);
      const id = initialFriendId || (list[0]?.id ?? "");
      setFriendId(id);
      if (id) loadDirect(id);
    });
    loadPublic();
    pollRef.current = setInterval(loadPublic, 15000);
    return () => clearInterval(pollRef.current);
  }, []);

  // Scroll message lists to bottom when messages update
  useEffect(() => {
    if (publicListRef.current) publicListRef.current.scrollTop = publicListRef.current.scrollHeight;
  }, [publicMessages]);

  useEffect(() => {
    if (directListRef.current) directListRef.current.scrollTop = directListRef.current.scrollHeight;
  }, [directMessages]);

  async function sendPublic(text) {
    try {
      await api.postPublicMessage(text);
      await loadPublic();
      onToast("Message sent!", "success");
    } catch (err) {
      onToast(err.message, "error");
    }
  }

  async function sendDirect(text) {
    if (!friendId) return;
    try {
      await api.postDirectMessage(friendId, text);
      await loadDirect();
      onToast("Message sent!", "success");
    } catch (err) {
      onToast(err.message, "error");
    }
  }

  function handleFriendChange(e) {
    const id = e.target.value;
    setFriendId(id);
    loadDirect(id);
  }

  return (
    <section className="app-panel messages-panel">
      <h2>Messages</h2>

      {/* Tabs — Activity design decision: tabs instead of side-by-side grid */}
      <div className="msg-tabs" role="tablist">
        {["public", "direct"].map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={`msg-tab${tab === t ? " msg-tab-active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "public" ? "Public Chat" : "Direct"}
          </button>
        ))}
      </div>

      {/* Public tab */}
      {tab === "public" && (
        <div className="msg-pane">
          <div className="message-list" ref={publicListRef}>
            {publicMessages.length === 0
              ? <p className="muted">No public messages yet.</p>
              : publicMessages.map((m) => <MessageItem key={m.id} message={m} />)}
          </div>
          <InlineForm onSubmit={sendPublic} placeholder="Write to everyone…" />
        </div>
      )}

      {/* Direct tab */}
      {tab === "direct" && (
        <div className="msg-pane">
          <label className="search-label">
            Friend
            <select value={friendId} onChange={handleFriendChange}>
              {friends.length === 0
                ? <option value="">No friends yet</option>
                : friends.map((f) => <option key={f.id} value={f.id}>{f.name} ({f.department})</option>)}
            </select>
          </label>
          <div className="message-list" ref={directListRef}>
            {directMessages.length === 0
              ? <p className="muted">{friendId ? "No direct messages yet." : "Add friends to start direct messaging."}</p>
              : directMessages.map((m) => <MessageItem key={m.id} message={m} />)}
          </div>
          <InlineForm onSubmit={sendDirect} placeholder="Write a direct message…" />
        </div>
      )}
    </section>
  );
}
