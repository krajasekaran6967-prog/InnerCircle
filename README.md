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

## Current features (Phase 0–2)

- User signup, login, logout, and session persistence
- Member directory with search (name, department, email)
- User profiles: edit name, department, bio
- Profile photo upload (JPEG, PNG, GIF, WebP, max 2MB)
- View other members’ profiles from the directory

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
| GET | `/api/users/:id` | View a member’s profile |

## Team

- Kishore Prasanth Rajasekaran
- Sivmeng Oeng
- Krishnamoorthy Ramanath
- Xin Rao

See [docs/project.md](docs/project.md) for the full project description, plan, and code summary.
