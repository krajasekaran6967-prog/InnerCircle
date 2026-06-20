import { useState, useEffect, useCallback } from "react";
import { api } from "./api.js";

import NavBar from "./components/NavBar.jsx";
import Toast from "./components/Toast.jsx";

import LandingScreen from "./screens/LandingScreen.jsx";
import LoginScreen from "./screens/LoginScreen.jsx";
import SignupScreen from "./screens/SignupScreen.jsx";
import HomeScreen from "./screens/HomeScreen.jsx";
import DirectoryScreen from "./screens/DirectoryScreen.jsx";
import ProfileScreen from "./screens/ProfileScreen.jsx";
import MessagesScreen from "./screens/MessagesScreen.jsx";
import MemberScreen from "./screens/MemberScreen.jsx";

/**
 * App.jsx — top-level state and routing
 *
 * Activity discussion answers reflected in this design:
 *
 * Q: Which parts become reusable components?
 *    Avatar, Toast, NavBar, MessageItem, InlineForm — used across multiple screens.
 *
 * Q: What data changes frequently?
 *    currentUser (login/logout/profile updates), activePage (navigation),
 *    toast (any action), messages (poll + send), search text (directory).
 *
 * Q: Where should state live?
 *    currentUser and activePage live here (App) because multiple screens need them.
 *    messages and search live inside each screen component — nothing else needs them.
 *
 * Q: How does data flow from parent to child?
 *    Via props. App passes currentUser down to HomeScreen, ProfileScreen, NavBar.
 *    Callbacks (onLogin, onNavigate, onToast, onProfileUpdated) flow down so child
 *    components can trigger state changes without managing that logic themselves.
 *
 * Q: Why is React easier than jQuery?
 *    When currentUser.name changes (e.g. after profile save), every component that
 *    uses it re-renders automatically. With jQuery we'd have to manually update the
 *    header, welcome panel, and profile form separately. React's one-way data flow
 *    makes that automatic and impossible to forget.
 */

export default function App() {
  // ── App-level state ──
  const [currentUser, setCurrentUser] = useState(null);
  const [authScreen, setAuthScreen] = useState("landing"); // landing | login | signup
  // localStorage persists last active tab across page refreshes (HTML5 Web Storage)
  const [activePage, setActivePage] = useState(
    () => localStorage.getItem("ic_active_page") || "home"
  );
  const [memberViewId, setMemberViewId] = useState(null);
  const [messageNav, setMessageNav] = useState({ tab: "public", friendId: null });
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [toastTimer, setToastTimer] = useState(null);

  // Check session on load
  useEffect(() => {
    api.me().then((data) => setCurrentUser(data.user)).catch(() => {});
  }, []);

  // ── Toast helper ──
  const showToast = useCallback((message, type = "success") => {
    clearTimeout(toastTimer);
    setToast({ message, type });
    const t = setTimeout(() => setToast({ message: "", type: "success" }), 2500);
    setToastTimer(t);
  }, [toastTimer]);

  // ── Auth handlers ──
  function handleLogin(user) {
    setCurrentUser(user);
    setActivePage("home");
  }

  async function handleLogout() {
    try { await api.logout(); } catch {}
    localStorage.removeItem("ic_active_page");
    setCurrentUser(null);
    setAuthScreen("landing");
  }

  // ── Navigation ──
  function navigate(page) {
    setActivePage(page);
    localStorage.setItem("ic_active_page", page);
  }

  function viewMember(userId) {
    setMemberViewId(userId);
    setActivePage("member");
  }

  function messageFromMember(userId) {
    setMessageNav({ tab: "direct", friendId: userId });
    setActivePage("messages");
  }

  // ── Render ──

  // Not logged in — show auth screens
  if (!currentUser) {
    if (authScreen === "login") return <LoginScreen onLogin={handleLogin} onNavigate={setAuthScreen} />;
    if (authScreen === "signup") return <SignupScreen onLogin={handleLogin} onNavigate={setAuthScreen} />;
    return <LandingScreen onNavigate={setAuthScreen} />;
  }

  // Logged in — show app shell
  return (
    <div className="view app-shell">
      <header className="app-header">
        <div className="app-header-brand">
          <div className="logo-mark small" aria-hidden="true">IC</div>
          <div>
            <p className="app-header-title">InnerCircle</p>
            <p className="muted app-header-user">Hi, {currentUser.name}</p>
          </div>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <main className="app-main">
        {activePage === "home" && (
          <HomeScreen currentUser={currentUser} onNavigate={navigate} />
        )}
        {activePage === "directory" && (
          <DirectoryScreen onViewMember={viewMember} />
        )}
        {activePage === "profile" && (
          <ProfileScreen
            currentUser={currentUser}
            onProfileUpdated={setCurrentUser}
            onToast={showToast}
          />
        )}
        {activePage === "messages" && (
          <MessagesScreen
            key={`${messageNav.tab}-${messageNav.friendId}`}
            initialTab={messageNav.tab}
            initialFriendId={messageNav.friendId}
            onToast={showToast}
          />
        )}
        {activePage === "member" && memberViewId && (
          <MemberScreen
            userId={memberViewId}
            onBack={() => setActivePage("directory")}
            onMessage={messageFromMember}
            onToast={showToast}
          />
        )}
      </main>

      {/* Fixed bottom nav — Activity: thumb-reachable, always visible, active tab highlighted */}
      <NavBar activePage={activePage} onNavigate={navigate} />

      {/* Toast — Activity: replaces scattered form-message elements with one reusable component */}
      <Toast message={toast.message} type={toast.type} />
    </div>
  );
}
