# Week 7 Refined App — Screencast Script

**Duration:** 5:30–6:30 minutes

---

## Intro (0:00–0:30)

> "Hi, I'm [name] from team InnerCircle. This is our Week 7 refined app video. InnerCircle is an employee social platform for team cooperation and community building. In this video I'll walk you through the app and the key improvements we made based on our usability testing feedback."

*Show the GitHub repo — briefly show the PR and the phase-2 branch.*

---

## What we changed based on usability testing (0:30–1:15)

> "Our usability testing revealed three main issues. First, navigation was unclear — users didn't know where they were in the app. Second, the messages screen was too cramped on mobile with two panels side by side. Third, error messages disappeared too quickly or were hard to notice."

> "Here's what we did to fix each one."

---

## Demo: Navigation (1:15–2:00)

*Open the app at localhost:3000. Show the landing screen.*

> "We replaced the top navigation bar with a fixed bottom navigation bar. It stays visible at all times, shows icons and labels for Home, Directory, Messages, and Profile, and highlights the active tab so users always know where they are."

*Click through each tab — Home, Directory, Messages, Profile. Point out the active highlight.*

> "We also use localStorage to remember your last active tab — so if you refresh the page, you land right back where you were."

*Refresh the page and show it returns to the same tab.*

---

## Demo: Sign up and profile (2:00–2:45)

*Click Create Account, fill in the form.*

> "Signup and login are unchanged in functionality. Once logged in you land on the Home screen with quick links to all sections."

*Go to Profile tab.*

> "Users can update their name, department, and bio, and upload a profile photo. When you save, a toast notification confirms the action — that was one of our usability fixes. Instead of inline error text that was easy to miss, every action now shows a brief toast at the bottom of the screen."

*Save the profile and show the toast.*

---

## Demo: Directory and friends (2:45–3:30)

*Go to the Directory tab.*

> "The member directory has live search — results filter as you type with no submit button needed."

*Type a name in the search box.*

> "Click View Profile on any member to see their details and add them as a friend."

*Click View Profile, click Add Friend, show the toast confirmation.*

---

## Demo: Messages — tabbed layout (3:30–4:30)

*Go to Messages tab.*

> "This was our biggest UI improvement. Previously, Public Chat and Direct Messages appeared side by side, which was unreadable on a phone. We redesigned it as a tabbed layout."

*Click the Public Chat tab.*

> "Public Chat is the default. All employees can see and send messages here. The app polls for new messages automatically every 15 seconds — you don't need to refresh."

*Send a public message, show the toast.*

*Click the Direct tab.*

> "The Direct tab shows a friend selector and your message history with that person. The send input is sticky at the bottom so it stays accessible even on a small screen."

*Select a friend, send a direct message.*

---

## Demo: Mobile design (4:30–5:15)

*Open browser DevTools, switch to a mobile viewport (e.g. iPhone 12).*

> "All of our improvements were mobile-first. Every button is at least 44 pixels tall — Apple and Google's minimum tap target guideline. On small screens, member cards stack vertically and the send button goes full width so it's easy to tap with your thumb."

*Show the bottom nav, tap through tabs on mobile viewport.*

> "We also added ARIA roles to the navigation so screen readers announce which tab is active."

---

## Tests and code quality (5:15–5:45)

*Switch to the terminal.*

> "On the code side, we migrated from vanilla JavaScript to React, which was a big architectural improvement. State that's shared across screens — like the current user — lives at the top-level App component and flows down as props. Each screen manages its own local state."

*Run `npm test` — show 48 passing.*

> "We have 48 backend tests covering auth, profiles, friends, and messaging. We also added a Vitest frontend test suite with 17 tests for our React components and screens."

*Run `cd frontend && npm test` — show 17 passing.*

---

## Closing (5:45–6:15)

> "To summarize, the three main improvements from usability testing were: a fixed bottom navigation bar so users always know where they are, a tabbed Messages screen that works on mobile, and toast notifications for every action so feedback is never missed."

> "The app is live on GitHub at the link in the submission. Thanks for watching."

---

## Recording tips

- Use a window size of 1280×800 so text is readable
- Mute notifications before recording
- Keep DevTools closed except during the mobile demo section
- Run `cd frontend && npm run build && cd .. && npm start` before recording so there's no Vite toolbar visible
