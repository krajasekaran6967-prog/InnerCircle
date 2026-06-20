# InnerCircle

Employee social platform for team cooperation and community building.

## Quick start

```bash
# Build frontend then start the server
cd frontend && npm run build && cd ..
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development (hot reload)

```bash
# Terminal 1 — backend
npm run dev

# Terminal 2 — Vite dev server (proxies /api to :3000)
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Project structure

```
frontend/         React + Vite (client)
  src/
    App.jsx           Top-level state and routing
    api.js            fetch wrappers for all API calls
    components/       Avatar, NavBar, Toast, MessageItem, InlineForm
    screens/          LandingScreen, LoginScreen, SignupScreen,
                      HomeScreen, DirectoryScreen, ProfileScreen,
                      MessagesScreen, MemberScreen
    test/             Vitest + React Testing Library
  dist/             Production build output (served by Express)
backend/          Node.js + Express (API, sessions, SQLite)
docs/             Project description and development plan
test/             Backend API tests (node:test)
```

## Features

- User signup, login, logout, and session persistence
- Member directory with live search (name, department, email)
- User profiles: edit name, department, bio
- Profile photo upload (JPEG, PNG, GIF, WebP, max 2MB)
- View other members' profiles from the directory
- Add and remove friends
- Public chat with 15-second auto-poll for new messages
- Direct messages between friends (tabbed Messages screen)
- Toast notifications for all actions
- Fixed bottom navigation bar (mobile-friendly, 44px tap targets)
- Last active tab persisted in localStorage across refreshes

## Running tests

```bash
# Backend (48 tests)
npm test

# Frontend (17 tests — Vitest + React Testing Library)
cd frontend && npm test
```

## Security

- Session cookies are HTTP-only and use `sameSite=lax`
- `SESSION_SECRET` is required when `NODE_ENV=production`
- Passwords hashed with bcrypt; never returned by the API
- React escapes all user content by default (no XSS)

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Current user |
| GET | `/api/users?search=` | Member directory (optional search) |
| GET | `/api/users/me` | Current user profile |
| PUT | `/api/users/me` | Update profile |
| POST | `/api/users/me/avatar` | Upload profile photo (`multipart/form-data`, field `avatar`) |
| GET | `/api/users/me/friends` | Current user's friends |
| POST | `/api/users/:id/friends` | Add a friend |
| DELETE | `/api/users/:id/friends` | Remove a friend |
| GET | `/api/users/:id` | View a member's profile |
| GET | `/api/messages/public` | Public chat messages |
| POST | `/api/messages/public` | Send a public chat message (max 500 chars) |
| GET | `/api/messages/direct/:userId` | Direct messages with a member |
| POST | `/api/messages/direct/:userId` | Send direct message to a member |

## Team

- Kishore Prasanth Rajasekaran
- Sivmeng Oeng
- Krishnamoorthy Ramanath
- Xin Rao

See [docs/project.md](docs/project.md) for the full project description and code summary.
