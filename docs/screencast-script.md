# InnerCircle — Screencast Script

**Target length:** 3–5 minutes  
**Tone:** Conversational, confident, demo-style  
**Setup before recording:** GitHub repo open in browser, app running at `http://localhost:3000` in another tab, one test account ready (e.g., Alice in Engineering)

---

## [0:00 – 0:15] Introduction

> "Hi everyone. In this walkthrough I'll show you InnerCircle — an employee social platform built with HTML, CSS, and JavaScript. Let's start by looking at the project on GitHub."

*Screen: GitHub repo page*

---

## [0:15 – 0:45] Repository Overview

> "Here's our repository. You can see the project structure — we have a `frontend` folder for all our HTML, CSS, and JavaScript, and a `docs` folder with our project plan and documentation."

*Point to the file tree: `frontend/`, `docs/`*

> "The README gives a quick overview of the app and lists the current features and the team members who contributed."

*Scroll the README just far enough to show the project title, the Current Features list, and the Team section — stop before any backend or security sections*

---

## [0:45 – 1:15] Project Structure in the Repo

> "Back in the file tree — inside `frontend/js` you can see our JavaScript is split into modules: `app.js` for routing and navigation, `auth.js` for login and signup, `directory.js` for the member list, and `profile.js` for profile editing. `style.css` handles all the layout and responsive design."

*Click into `frontend/js/` to show the files, then click `frontend/style.css`*

> "Everything is plain HTML, CSS, and JavaScript — no frameworks. Now let's see it running in the browser."

---

## [1:30 – 2:10] Sign Up

*Switch to browser tab with the app at `http://localhost:3000`*

> "When you first arrive you see the landing page. Let's create a new account — I'll click **Sign Up**."

*Click Sign Up → signup form appears*

> "The form asks for a name, email, department, and password, with validation before submission."

*Type: Name = `Alice Chen`, Email = `alice@company.com`, Department = `Engineering`, Password = `secret123`*

> "I'll hit **Create Account** — and we're in. The app remembers the session, so I stay logged in even after a page refresh."

*Click Create Account → app shell loads*

---

## [2:10 – 2:45] Member Directory & Search

*Click **Directory** tab*

> "The Directory lists every employee. Each card shows their name, department, and profile photo — or initials as a placeholder. Search filters live as you type."

*Type `marketing` → cards filter; clear, type `Bob` → Bob's card appears*

> "Clicking **View Profile** opens a read-only profile for that member — name, department, bio, and photo."

*Click View Profile on Bob's card*

---

## [2:45 – 3:30] My Profile — Edit & Photo Upload

*Click **My Profile** tab*

> "My Profile lets me update my own information. I'll update the bio and save."

*Type a bio → click Save Changes → success message appears*

> "Now I'll upload a profile photo."

*Click Choose File → select an image → avatar updates in the card*

> "The photo updates immediately here and in the directory. The layout is also fully responsive — let me resize the window to show that."

*Resize browser window narrower → layout adapts*

---

## [3:30 – 4:00] Login & Logout

*Click **Logout***

> "Logging out clears the session and returns me to the landing page. Protected pages redirect back here if you're not signed in. Let me log back in."

*Click Log In → enter credentials → Sign In*

> "Session restored, all my data is exactly as I left it."

---

## [4:00 – 4:20] Wrap-up

> "That's InnerCircle at Week 3 — a working signup and login flow, a searchable member directory, editable profiles with photo upload, and a responsive layout, all built with HTML, CSS, and vanilla JavaScript. In future weeks we'll be adding messaging and more social features as we cover additional technologies. Thanks for watching."

*Screen: Directory panel showing member cards*

---

## Recording Tips

- Use a browser window at **1280 × 720** or larger for clarity.
- Slow your mouse movements slightly — viewers need time to follow.
- Pause 1–2 seconds after each click before narrating the result.
- Keep the terminal hidden during the recording.
