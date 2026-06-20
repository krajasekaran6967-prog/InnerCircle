# InnerCircle — Development Plan

Based on **Week 1 Team Agreement and App Brainstorm V2-2**.

## Project Summary

**InnerCircle** is an employee-only social web app to improve cross-team cooperation, morale, and company community.

| Feature | Description |
|--------|-------------|
| Signup | New employees register via a secure internal flow |
| Login / Logout | Authenticated access and secure session end |
| Session control | Logged-in state persists across pages via session tokens |
| User profiles | Personalized profiles with uploaded profile pictures |
| Member directory | Searchable list of all employees |
| Friends | Connect with colleagues |
| Messaging | Public chat and 1:1 direct messages |
| Styling | Professional, minimal, mobile-first responsive UI |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Markup | HTML5 (semantic elements) |
| Styling | CSS3 (custom properties, Flexbox/Grid) |
| Client | React 18 + Vite |
| Server | Node.js + Express |
| Storage | SQLite (via better-sqlite3) |
| Sessions | HTTP-only cookies + `express-session` |
| File uploads | `multer` |

## Architecture

```
React (Vite dev / dist)  →  fetch API  →  Express backend  →  SQLite
                                               ↓
                                          uploads/ (profile photos)
```

## File Structure

```
InnerCircle/
├── frontend/
│   ├── src/
│   │   ├── App.jsx           Top-level state and routing
│   │   ├── api.js            fetch wrappers for all API calls
│   │   ├── main.jsx          React entry point
│   │   ├── index.css         Global styles
│   │   ├── components/
│   │   │   ├── Avatar.jsx
│   │   │   ├── InlineForm.jsx
│   │   │   ├── MessageItem.jsx
│   │   │   ├── NavBar.jsx
│   │   │   └── Toast.jsx
│   │   ├── screens/
│   │   │   ├── LandingScreen.jsx
│   │   │   ├── LoginScreen.jsx
│   │   │   ├── SignupScreen.jsx
│   │   │   ├── HomeScreen.jsx
│   │   │   ├── DirectoryScreen.jsx
│   │   │   ├── ProfileScreen.jsx
│   │   │   ├── MessagesScreen.jsx
│   │   │   └── MemberScreen.jsx
│   │   └── test/
│   │       ├── components.test.jsx
│   │       ├── screens.test.jsx
│   │       └── setup.js
│   ├── dist/                 Production build (served by Express)
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backend/
│   ├── server.js
│   ├── app.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   └── messages.js
│   ├── middleware/
│   │   ├── requireAuth.js
│   │   └── upload.js
│   ├── data/
│   │   ├── db.js
│   │   ├── store.js
│   │   └── messages-store.js
│   └── uploads/
├── test/
│   ├── auth.test.js
│   ├── users.test.js
│   ├── users-extra.test.js
│   ├── messages.test.js
│   ├── messages-extra.test.js
│   └── helper.js
└── docs/
    ├── project.md
    └── development-plan.md
```

## Development Phases

### Phase 0 — Foundation ✅
- Node project setup, brand CSS, responsive layout, Git workflow

### Phase 1 — Authentication & Sessions ✅
- Signup, login, logout, session middleware, route guards

### Phase 2 — Profiles & Member Directory ✅
- Profile edit, thumbnail upload, searchable directory, SQLite migration

### Phase 3 — Friends / Connections ✅
- Add/remove friends, friends list, bidirectional relationship

### Phase 4 — Messaging ✅
- Public chat with 15s auto-poll
- 1:1 direct messages between friends
- Tabbed Messages screen (Public / Direct)

### Phase 5 — React Migration & Mobile Redesign ✅
- Migrated frontend from vanilla JS to React 18 + Vite
- Component-based architecture (App, screens, shared components)
- Fixed bottom navigation bar with ARIA roles
- localStorage persistence for active tab
- Toast notification system
- 44px minimum tap targets throughout
- Vitest + React Testing Library frontend test suite

### Phase 6 — Polish & QA ✅
- 48 backend tests (node:test)
- 17 frontend component and screen tests (Vitest)
- Backend bug fixes found by tests (500 char limit, remove non-friend 404)
- Accessibility: semantic HTML, aria-label, aria-selected, role=tablist

## API Endpoints

```
Auth
  POST   /api/auth/signup
  POST   /api/auth/login
  POST   /api/auth/logout
  GET    /api/auth/me

Users
  GET    /api/users?search=
  GET    /api/users/me
  PUT    /api/users/me
  POST   /api/users/me/avatar
  GET    /api/users/me/friends
  GET    /api/users/:id
  POST   /api/users/:id/friends
  DELETE /api/users/:id/friends

Messages
  GET    /api/messages/public
  POST   /api/messages/public      (max 500 chars)
  GET    /api/messages/direct/:userId
  POST   /api/messages/direct/:userId
```

## Build Order

```
Foundation → Auth → Profiles + Directory → Friends → Messaging → React Migration → QA
```

## Quality Process

- Weekly check-ins with phase demos
- Peer review required before merge
- Definition of done: works in browser, styled, handles errors, tested, reviewed
