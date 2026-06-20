# InnerCircle — Project Documentation

Complete overview of the InnerCircle employee social platform: description, architecture, and code summary.

---

## 1. Project Description

### Overview

**InnerCircle** is a social media web application dedicated to employees. Its purpose is to improve cooperation between teams, raise morale, and build a sense of community within a company.

The app uses a **React + Node.js architecture** optimized for mobile and desktop, with a professional minimalistic design and a fixed bottom navigation bar for mobile-friendly use.

### Problem Statement

Employees often work in silos across departments. InnerCircle gives them a single place to discover colleagues, maintain profiles, connect as friends, and communicate — strengthening cross-team relationships and company culture.

### Target Users

- New and existing employees registering and maintaining a profile
- Staff looking to find and connect with colleagues across departments
- Teams building internal community through messaging and collaboration

### Core Requirements

| Requirement | Status |
|-------------|--------|
| Signup process for new employees | ✅ Done |
| Login form with authenticated access | ✅ Done |
| Logout facility | ✅ Done |
| Session control via secure session tokens | ✅ Done |
| User profiles with uploaded thumbnails | ✅ Done |
| Member directory of all employees | ✅ Done |
| Adding and removing friends | ✅ Done |
| Public chat with auto-poll | ✅ Done |
| Direct messages between friends | ✅ Done |
| Mobile-first responsive UI | ✅ Done |
| React component architecture | ✅ Done |
| Automated tests (backend + frontend) | ✅ Done |

### Tech Stack

| Layer | Technology |
|-------|------------|
| Markup | HTML5 (semantic elements) |
| Styling | CSS3 (custom properties, Flexbox, Grid) |
| Client | React 18 + Vite |
| Server | Node.js + Express |
| Authentication | `bcryptjs` + `express-session` |
| File uploads | `multer` |
| Data storage | SQLite (via `better-sqlite3`) |
| Frontend tests | Vitest + React Testing Library |
| Backend tests | Node.js built-in `node:test` |

### Team

| Member | Role focus |
|--------|------------|
| Kishore Prasanth Rajasekaran | Backend: auth, sessions, API |
| Sivmeng Oeng | Frontend: layout, CSS, responsive design |
| Krishnamoorthy Ramanath | Profiles, uploads, directory |
| Xin Rao | Messaging, chat UI, testing & docs |

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Browser (React SPA)                         │
│  App.jsx · screens/ · components/ · api.js               │
│  Built by Vite → dist/ (production) or :5173 (dev)       │
└──────────────────────────┬──────────────────────────────┘
                           │ fetch API (credentials: include)
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Express Server (:3000)                      │
│  /api/auth  ·  /api/users  ·  /api/messages             │
│  /uploads   ·  static frontend/dist/                    │
└──────────────────────────┬──────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
     SQLite (innercircle.db)    backend/uploads/
     users, friends, messages   (profile photos)
```

### Component Design (from class activity)

| Component | Props | State |
|-----------|-------|-------|
| `App` | — | `currentUser`, `activePage` (app-level) |
| `NavBar` | `activePage`, `onNavigate` | — |
| `Avatar` | `user`, `size` | — |
| `Toast` | `message`, `type` | — |
| `MessageItem` | `message` | — |
| `InlineForm` | `onSubmit`, `placeholder` | local input |
| `HomeScreen` | `currentUser`, `onNavigate` | — |
| `DirectoryScreen` | `onViewMember` | `members`, `search` |
| `ProfileScreen` | `currentUser`, `onProfileUpdated`, `onToast` | `form` |
| `MessagesScreen` | `initialTab`, `initialFriendId`, `onToast` | `publicMessages`, `directMessages`, `friends` |
| `MemberScreen` | `userId`, `onBack`, `onMessage`, `onToast` | `member` |

State lives at app-level (`currentUser`, `activePage`) when multiple screens need it. Screen-specific data (messages, search) stays local. Data flows down via props; actions flow up via callbacks.

---

## 3. Running the Project

### Production

```bash
cd frontend && npm run build && cd ..
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

### Development (hot reload)

```bash
# Terminal 1 — backend
npm run dev

# Terminal 2 — Vite dev server
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Tests

```bash
# Backend (48 tests)
npm test

# Frontend (17 tests)
cd frontend && npm test
```

---

## 4. API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | No | Create account |
| POST | `/api/auth/login` | No | Sign in |
| POST | `/api/auth/logout` | Yes | Sign out |
| GET | `/api/auth/me` | Yes | Current user |
| GET | `/api/users?search=` | Yes | Member directory |
| GET | `/api/users/me` | Yes | Current user profile |
| PUT | `/api/users/me` | Yes | Update name, department, bio |
| POST | `/api/users/me/avatar` | Yes | Upload photo (`avatar` field, max 2MB) |
| GET | `/api/users/me/friends` | Yes | Current user's friends |
| GET | `/api/users/:id` | Yes | View member profile |
| POST | `/api/users/:id/friends` | Yes | Add a friend |
| DELETE | `/api/users/:id/friends` | Yes | Remove a friend |
| GET | `/api/messages/public` | Yes | Public chat messages |
| POST | `/api/messages/public` | Yes | Send public message (max 500 chars) |
| GET | `/api/messages/direct/:userId` | Yes | Direct messages with a member |
| POST | `/api/messages/direct/:userId` | Yes | Send direct message |

---

## 5. Code Summary

### Repository Structure

```
InnerCircle/
├── frontend/
│   ├── src/
│   │   ├── App.jsx               Top-level state and routing
│   │   ├── api.js                fetch wrappers for all API calls
│   │   ├── main.jsx              React entry point
│   │   ├── index.css             Global styles
│   │   ├── components/
│   │   │   ├── Avatar.jsx        User avatar (image or initials)
│   │   │   ├── InlineForm.jsx    Reusable send form (sticky)
│   │   │   ├── MessageItem.jsx   Single message row
│   │   │   ├── NavBar.jsx        Fixed bottom navigation bar
│   │   │   └── Toast.jsx         Fade-in notification
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
│   ├── dist/                     Production build (served by Express)
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backend/
│   ├── server.js                 HTTP server entry point
│   ├── app.js                    Express app, middleware, routes
│   ├── routes/
│   │   ├── auth.js               Signup, login, logout, /me
│   │   ├── users.js              Directory, profile, avatar, friends
│   │   └── messages.js           Public and direct messages
│   ├── middleware/
│   │   ├── requireAuth.js        Session guard (returns 401)
│   │   └── upload.js             Multer config for profile photos
│   ├── data/
│   │   ├── db.js                 SQLite connection and schema init
│   │   ├── store.js              User and friends CRUD
│   │   └── messages-store.js     Message CRUD
│   └── uploads/                  Stored profile images
├── test/
│   ├── helper.js                 In-memory test server + request helper
│   ├── auth.test.js              10 auth tests
│   ├── users.test.js             11 user/friends tests
│   ├── users-extra.test.js       9 additional user tests
│   ├── messages.test.js          11 messaging tests
│   └── messages-extra.test.js    7 additional message tests
└── docs/
    ├── project.md                This document
    └── development-plan.md       Phase checklist and file structure
```

### Data Models

#### User (SQLite `users` table)

```js
{
  id: string,           // 32-char hex
  email: string,        // normalized lowercase
  passwordHash: string, // bcrypt (never sent to client)
  name: string,
  department: string,
  bio: string,
  thumbnailUrl: string, // "/uploads/filename.ext"
  createdAt: string     // ISO 8601
}
```

#### Message (SQLite `messages` table)

```js
{
  id: string,
  senderId: string,
  recipientId: string | null,  // null = public
  text: string,                // max 500 chars
  createdAt: string
}
```

### Backend Summary

#### `backend/data/store.js`

| Function | Purpose |
|----------|---------|
| `findUserByEmail(email)` | Lookup for login/signup |
| `findUserById(id)` | Lookup by primary key |
| `createUser(...)` | Insert new user |
| `updateUser(id, updates)` | Patch name, department, bio, thumbnail |
| `searchUsers(query)` | Filter by name, email, department, bio |
| `listFriends(userId)` | Return all friends of a user |
| `addFriend(userId, friendId)` | Bidirectional insert |
| `removeFriend(userId, friendId)` | Returns null if not friends (404) |
| `toPublicUser(user, viewerId)` | Strips passwordHash, adds `isFriend` |

#### `backend/routes/auth.js`
- Signup: validates fields, enforces 8+ char password, bcrypt hash, creates session
- Login: verifies credentials, creates session
- Logout: destroys session
- Me: returns current user or 401

#### `backend/routes/users.js`
- Directory search, profile read/update, avatar upload, friends add/remove
- Avatar upload removes old file before saving new one

#### `backend/routes/messages.js`
- Public messages: list (capped at 100), post (max 500 chars)
- Direct messages: list conversation, post to user (404 if user not found)

### Frontend Summary

#### `App.jsx`
- Holds `currentUser` and `activePage` in state — shared across all screens
- Restores session on load via `GET /api/auth/me`
- `localStorage` persists `activePage` across page refreshes; cleared on logout
- Passes `onToast` callback down to screens; manages toast timer centrally

#### `api.js`
- Central `fetch` client with `credentials: "include"`
- Throws on non-OK responses with server error message

#### Screens
Each screen manages its own data state (messages, members, form fields) and calls the shared `onToast` callback for notifications.

#### `NavBar.jsx`
- Fixed bottom bar, `role="tablist"`, `aria-selected` on each tab
- 64px height, 44px minimum tap target per button

#### `MessagesScreen.jsx`
- Two tabs: Public Chat and Direct Messages
- Public chat polls `GET /api/messages/public` every 15 seconds via `setInterval`
- Clears interval on unmount

### Security

- Passwords hashed with bcrypt (cost 10); never returned in API responses
- Sessions stored server-side; cookie is `httpOnly`, `sameSite=lax`
- All routes except signup/login require valid session via `requireAuth`
- Uploads restricted to JPEG, PNG, GIF, WebP; max 2MB
- React escapes all rendered user content by default (no XSS)

### Dependencies

| Package | Purpose |
|---------|---------|
| `express` | HTTP server and routing |
| `express-session` | Session management |
| `bcryptjs` | Password hashing |
| `multer` | Multipart file upload handling |
| `better-sqlite3` | SQLite data store |
| `react` / `react-dom` | UI framework |
| `vite` / `@vitejs/plugin-react` | Build tool and dev server |
| `vitest` | Frontend test runner |
| `@testing-library/react` | Component testing utilities |

---

*Last updated: All phases complete. 48 backend + 17 frontend tests passing.*
