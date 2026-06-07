# InnerCircle

Employee social platform for team cooperation and community building.

## Quick start

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

For development with auto-restart:

```bash
npm run dev
```

## Project structure

```
frontend/     HTML, CSS, vanilla JavaScript (client)
backend/      Node.js + Express (API, sessions)
docs/         Development plan and team docs
```

## Current features

- User signup, login, logout, and session persistence
- Member directory with search (name, department, email)
- User profiles: edit name, department, bio
- Profile photo upload (JPEG, PNG, GIF, WebP, max 2MB)
- View other members’ profiles from the directory
- Add and remove friends
- Public chat messages visible to all members
- Direct messages between two members

## Security and reliability updates

- Safer file-locking for user/message writes (prevents lock stealing and write races)
- Session cookies are HTTP-only and use `sameSite=lax`
- `SESSION_SECRET` is required when `NODE_ENV=production`

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
| GET | `/api/users/:id` | View a member’s profile |
| GET | `/api/messages/public` | Public chat messages |
| POST | `/api/messages/public` | Send a public chat message |
| GET | `/api/messages/direct/:userId` | Direct messages with a member |
| POST | `/api/messages/direct/:userId` | Send direct message to a member |

## Team

- Kishore Prasanth Rajasekaran
- Sivmeng Oeng
- Krishnamoorthy Ramanath
- Xin Rao

See [docs/project.md](docs/project.md) for the full project description, plan, and code summary.
