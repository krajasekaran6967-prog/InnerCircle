# InnerCircle — Project Documentation

Complete overview of the InnerCircle employee social platform: description, development plan, and code summary.

---

## 1. Project Description

### Overview

**InnerCircle** is a social media web application dedicated to employees. Its purpose is to improve cooperation between teams, raise morale, and build a sense of community within a company.

The app uses a **light architecture** optimized for both laptops and mobile devices, with a professional, minimalistic design suitable for a startup-style internal platform.

### Problem Statement

Employees often work in silos across departments. InnerCircle gives them a single place to discover colleagues, maintain profiles, and (in later phases) connect and communicate — strengthening cross-team relationships and company culture.

### Target Users

- New and existing employees who need to register and maintain a profile
- Staff looking to find colleagues across departments
- Teams building internal community and collaboration

### Core Requirements

| Requirement | Status |
|-------------|--------|
| Signup process for new employees | ✅ Done |
| Login form with authenticated access | ✅ Done |
| Logout facility | ✅ Done |
| Session control via secure session tokens | ✅ Done |
| User profiles with uploaded thumbnails | ✅ Done |
| Member directory of all employees | ✅ Done |
| Adding members as friends | 🔲 Phase 3 |
| Public and private messaging (1:1 and group) | 🔲 Phase 4 |
| Professional, minimalistic CSS styling | ✅ Done |

### Tech Stack

| Layer | Technology |
|-------|------------|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, Flexbox, Grid) |
| Client logic | Vanilla JavaScript (ES modules) |
| Server | Node.js + Express |
| Authentication | `bcryptjs` + `express-session` |
| File uploads | `multer` |
| Data storage | JSON file store (`backend/data/users.json`) |
| Profile images | `backend/uploads/` |

### Team

| Member | Role focus |
|--------|------------|
| Kishore Prasanth Rajasekaran | Backend: auth, sessions, API |
| Sivmeng Oeng | Frontend: layout, CSS, responsive design |
| Krishnamoorthy Ramanath | Profiles, uploads, directory |
| Xin Rao | Messaging, chat UI, testing & docs |

### Team Process

- **Clear task allocation** with deadlines at weekly meetings
- **Weekly check-ins** for progress updates and bottleneck resolution
- **Transparent communication** when deadlines may slip
- **Peer review** required before code or design is finalized
- **Missed deadline policy** with support first, then role adjustment if needed

---

## 2. Project Plan

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
│  index.html · style.css · JS modules (app, auth, etc.)  │
└──────────────────────────┬──────────────────────────────┘
                           │ fetch API (credentials: include)
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Express Server (backend/server.js)          │
│  /api/auth  ·  /api/users  ·  /uploads  ·  static files │
└──────────────────────────┬──────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
     backend/data/users.json    backend/uploads/
     (user records)             (profile photos)
```

### Development Phases

#### Phase 0 — Foundation ✅ Complete

**Goal:** Runnable project skeleton and shared conventions.

- [x] Node.js project setup (`package.json`, dependencies)
- [x] Express server serving frontend static files
- [x] Brand CSS variables, responsive layout
- [x] Git workflow and project folder structure
- [x] README and documentation

**Deliverable:** Server runs locally; team can clone and develop.

---

#### Phase 1 — Authentication & Sessions ✅ Complete

**Goal:** Secure signup, login, logout, and persistent sessions.

- [x] `POST /api/auth/signup` — register with name, email, department, password
- [x] `POST /api/auth/login` — authenticate and create session
- [x] `POST /api/auth/logout` — destroy session
- [x] `GET /api/auth/me` — return current logged-in user
- [x] HTTP-only session cookie (`innercircle.sid`)
- [x] Frontend landing, login, and signup views
- [x] Route guard: unauthenticated users see public pages only

**Deliverable:** Users can register, stay logged in across refreshes, and log out.

---

#### Phase 2 — Profiles & Member Directory ✅ Complete

**Goal:** Personalized profiles and colleague discovery.

- [x] `PUT /api/users/me` — update name, department, bio
- [x] `POST /api/users/me/avatar` — upload profile photo (max 2MB)
- [x] `GET /api/users?search=` — searchable member directory
- [x] `GET /api/users/:id` — view another member's profile
- [x] Frontend: Directory, My Profile, and member profile views
- [x] Debounced search by name, department, or email

**Deliverable:** Every employee has a profile with optional photo; directory lists and searches all members.

---

#### Phase 3 — Friends / Connections 🔲 Planned

**Goal:** Employees can connect with colleagues.

- [ ] `POST /api/friends/request` — send friend request
- [ ] `PUT /api/friends/:id` — accept or decline
- [ ] `GET /api/friends` — list friends and pending requests
- [ ] UI: "Add friend" / "Friends" / "Pending" on directory and profiles
- [ ] Data model: `{ requesterId, recipientId, status }`

**Deliverable:** Users can build and manage a friends list.

---

#### Phase 4 — Messaging 🔲 Planned

**Goal:** 1:1 and group conversations (public and private).

**4a — Direct messages**
- [ ] Conversation list and message threads
- [ ] Send and receive 1:1 messages
- [ ] Polling for new messages (WebSockets optional stretch goal)

**4b — Group chats**
- [ ] Create public or private groups
- [ ] Invite members and group messaging UI

**Deliverable:** Working direct and group messaging.

---

#### Phase 5 — Polish & QA 🔲 Planned

**Goal:** Production-quality experience on laptop and mobile.

- [ ] Accessibility pass (labels, keyboard nav, contrast)
- [ ] Empty and loading states across all views
- [ ] End-to-end manual test script
- [ ] Peer review on all features
- [ ] Demo preparation

**Deliverable:** Demo-ready application.

---

### Build Order (Critical Path)

```
Foundation → Auth/Sessions → Profiles + Directory → Friends → 1:1 Messages → Groups → Polish
```

Auth blocks all authenticated features. Directory and profiles unblock friends and messaging.

### API Reference

#### Implemented

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | No | Create account |
| POST | `/api/auth/login` | No | Sign in |
| POST | `/api/auth/logout` | Yes | Sign out |
| GET | `/api/auth/me` | Yes | Current user |
| GET | `/api/users` | Yes | Member directory (`?search=` optional) |
| GET | `/api/users/me` | Yes | Current user profile |
| PUT | `/api/users/me` | Yes | Update name, department, bio |
| POST | `/api/users/me/avatar` | Yes | Upload photo (`avatar` field) |
| GET | `/api/users/:id` | Yes | View member profile |

#### Planned

| Method | Endpoint | Phase |
|--------|----------|-------|
| GET | `/api/friends` | 3 |
| POST | `/api/friends/request` | 3 |
| PUT | `/api/friends/:id` | 3 |
| GET | `/api/conversations` | 4 |
| POST | `/api/conversations` | 4 |
| GET | `/api/conversations/:id/messages` | 4 |
| POST | `/api/conversations/:id/messages` | 4 |
| POST | `/api/groups` | 4 |
| POST | `/api/groups/:id/members` | 4 |

### Running the Project

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

Development with auto-restart:

```bash
npm run dev
```

---

## 3. Code Summary

### Repository Structure

```
InnerCircle/
├── frontend/                    # Client (HTML, CSS, JavaScript)
│   ├── index.html               # Single-page app shell and all views
│   ├── style.css                # Global and component styles
│   └── js/
│       ├── app.js               # Entry point, routing, event wiring
│       ├── api.js               # fetch wrappers for all API calls
│       ├── auth.js              # Login, signup, logout, session check
│       ├── directory.js         # Member directory list and search
│       └── profile.js           # Profile edit, avatar upload, member view
├── backend/                     # Server (Node.js + Express)
│   ├── server.js                # App entry, middleware, static files
│   ├── routes/
│   │   ├── auth.js              # Signup, login, logout, /me
│   │   └── users.js             # Directory, profile, avatar routes
│   ├── middleware/
│   │   ├── requireAuth.js       # Blocks unauthenticated API access
│   │   └── upload.js            # Multer config for profile photos
│   ├── data/
│   │   ├── store.js             # JSON file CRUD and search
│   │   └── users.json           # User records (gitignored at runtime)
│   └── uploads/                 # Stored profile images
├── docs/
│   ├── project.md               # This document
│   └── development-plan.md      # Phase checklist
├── package.json
└── README.md
```

### Data Model

#### User (stored in `users.json`)

```javascript
{
  id: string,           // 32-char hex ID
  email: string,        // normalized lowercase
  passwordHash: string, // bcrypt hash (never sent to client)
  name: string,
  department: string,
  bio: string,
  thumbnailUrl: string, // e.g. "/uploads/userId-timestamp.png"
  createdAt: string     // ISO 8601 timestamp
}
```

Public API responses strip `passwordHash` via `toPublicUser()`.

### Backend Summary

#### `backend/server.js`

- Creates Express app on port 3000
- Parses JSON request bodies
- Configures `express-session` with HTTP-only cookie (7-day max age)
- Mounts `/api/auth` and `/api/users` routers
- Serves uploaded images at `/uploads`
- Serves frontend static files
- Fallback route sends `index.html` for SPA-style navigation

#### `backend/data/store.js`

Data access layer for the JSON file store:

| Function | Purpose |
|----------|---------|
| `readUsers()` | Load all users from disk |
| `writeUsers(users)` | Persist users array |
| `createUser(...)` | Insert new user with generated ID |
| `findUserByEmail(email)` | Lookup for login/signup |
| `findUserById(id)` | Lookup by primary key |
| `updateUser(id, updates)` | Patch name, department, bio, thumbnail |
| `searchUsers(query)` | Filter by name, email, department, bio |
| `toPublicUser(user)` | Remove sensitive fields for API responses |

#### `backend/routes/auth.js`

- **Signup:** Validates fields, enforces 8+ char password, hashes with bcrypt, creates session
- **Login:** Verifies email/password, creates session
- **Logout:** Destroys session and clears cookie
- **Me:** Returns current user from session or 401

#### `backend/routes/users.js`

- **GET /** — List users with optional `?search=` query (auth required)
- **GET /me** — Current user profile
- **PUT /me** — Update profile fields
- **POST /me/avatar** — Multer upload; replaces old image file on disk
- **GET /:id** — Single member profile (must be defined after `/me` routes)

#### `backend/middleware/requireAuth.js`

Checks `req.session.userId`; returns 401 if missing.

#### `backend/middleware/upload.js`

Multer disk storage in `backend/uploads/`:

- Allowed types: JPEG, PNG, GIF, WebP
- Max size: 2MB
- Filename: filename pattern: `{userId}-{timestamp}-{random}.ext`

### Frontend Summary

The frontend is a **single-page application** built with vanilla JavaScript modules — no framework. Views are toggled with the HTML `hidden` attribute.

#### View flow

```
Landing → Login / Signup → App shell
                              ├── Home (dashboard cards)
                              ├── Directory (search + member cards)
                              ├── My profile (edit form + photo upload)
                              └── Member profile (read-only, from directory)
```

#### `frontend/js/app.js`

- Entry point loaded as ES module from `index.html`
- Manages top-level views (landing, login, signup, app) and app panels (home, directory, profile, member)
- Initializes directory, profile, and member modules
- On load, calls `GET /api/auth/me` to restore session
- Wires navigation buttons, forms, and logout

#### `frontend/js/api.js`

Central `fetch` client with `credentials: "include"` for session cookies:

- JSON requests set `Content-Type: application/json`
- FormData uploads omit Content-Type (browser sets multipart boundary)
- Throws on non-OK responses with server error message

#### `frontend/js/auth.js`

- `handleSignup`, `handleLogin`, `handleLogout` form handlers
- `getCurrentUser()` for session restore
- `showMessage()` utility for inline form feedback

#### `frontend/js/directory.js`

- Renders member cards with avatar (image or initials)
- Debounced search input (300ms) calls `GET /api/users?search=`
- "View profile" navigates to member panel

#### `frontend/js/profile.js`

- **Profile edit:** Form submit → `PUT /api/users/me`
- **Avatar upload:** File input change → `POST /api/users/me/avatar`
- **Member view:** Fetches and renders read-only profile for another user

#### `frontend/index.html`

Semantic HTML sections for each view:

- Public: landing hero, login card, signup card
- Authenticated: header, nav tabs, four panels

#### `frontend/style.css`

- CSS custom properties for brand colors and spacing
- Responsive layout (mobile-first with breakpoints)
- Components: buttons, forms, cards, avatars, member cards, nav tabs
- Professional minimal aesthetic (blue primary, neutral grays)

### Security Notes

- Passwords hashed with bcrypt (cost factor 10); never returned in API
- Sessions stored server-side; cookie is HTTP-only
- Protected routes require valid session via `requireAuth`
- Uploads restricted by MIME type and file size
- Old avatar files deleted when a new one is uploaded

### Dependencies

| Package | Purpose |
|---------|---------|
| `express` | HTTP server and routing |
| `express-session` | Session management |
| `bcryptjs` | Password hashing |
| `multer` | Multipart file upload handling |

---

## Appendix: UI Pages

| Page | Route (logical) | Description |
|------|-----------------|-------------|
| Landing | Public | Brand intro, links to login/signup |
| Login | Public | Email + password form |
| Signup | Public | Registration form |
| Home | Authenticated | Welcome and quick links to directory/profile |
| Directory | Authenticated | Searchable employee list |
| My profile | Authenticated | Edit profile and upload photo |
| Member profile | Authenticated | View another employee (from directory) |
| Messages | Authenticated | Planned Phase 4 |

---

*Last updated: Phase 0–2 complete. Phases 3–5 planned.*
