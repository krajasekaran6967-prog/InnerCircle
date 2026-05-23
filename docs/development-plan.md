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
| Friends | Connect with / follow colleagues |
| Messaging | 1:1 and group chats (public and private) |
| Styling | Professional, minimal, responsive UI |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, Flexbox/Grid) |
| Client logic | Vanilla JavaScript (ES modules) |
| Server | Node.js + Express |
| Storage (MVP) | JSON file store (upgrade to SQLite/PostgreSQL later) |
| Sessions | HTTP-only cookies + `express-session` |
| File uploads | `multer` (Phase 2) |

## Architecture

```
Frontend (HTML/CSS/JS)  →  fetch API  →  Express backend  →  JSON data store
                                              ↓
                                         uploads/ (Phase 2)
```

## File Structure

```
InnerCircle/
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── js/
│   │   ├── app.js
│   │   ├── api.js
│   │   └── auth.js
│   └── assets/
├── backend/
│   ├── server.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── users.js
│   ├── middleware/
│   │   └── requireAuth.js
│   ├── data/
│   │   ├── store.js
│   │   └── users.json
│   └── uploads/
└── docs/
    └── development-plan.md
```

## Development Phases

### Phase 0 — Foundation ✅
- Node project setup, brand CSS, responsive layout, Git workflow

### Phase 1 — Authentication & Sessions ✅
- Signup, login, logout, session middleware, route guards

### Phase 2 — Profiles & Member Directory ✅
- Profile edit, thumbnail upload, searchable directory

### Phase 3 — Friends / Connections
- Friend requests, accept/decline, friends list

### Phase 4 — Messaging
- 4a: 1:1 direct messages
- 4b: Group chats (public and private)

### Phase 5 — Polish & QA
- Responsive polish, accessibility, peer review, demo prep


## API Endpoints

```
Auth
  POST   /api/auth/signup
  POST   /api/auth/login
  POST   /api/auth/logout
  GET    /api/auth/me

Users (Phase 2+)
  GET    /api/users
  GET    /api/users/:id
  PUT    /api/users/me
  POST   /api/users/me/avatar

Friends (Phase 3)
  GET    /api/friends
  POST   /api/friends/request
  PUT    /api/friends/:id

Messages (Phase 4)
  GET    /api/conversations
  POST   /api/conversations
  GET    /api/conversations/:id/messages
  POST   /api/conversations/:id/messages
  POST   /api/groups
  POST   /api/groups/:id/members
```

## Build Order

```
Foundation → Auth/Sessions → Profiles + Directory → Friends → 1:1 Messages → Groups → Polish
```

## Quality Process

- Weekly check-ins with phase demos
- Peer review required before merge
- Definition of done: works in browser, styled, handles errors, reviewed
