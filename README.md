# AI Cultural Canon (Firestore + Vanilla JS)

A classroom-friendly web app for exploring a curated “canon” of people — with short bios, links, and videos — backed by Firebase Firestore.

This repo is an “open notebook” of how I vibe-coded a working project that:

- Shows students a filterable gallery of people and short bios.
- Lets a teacher log in to a private admin page to add / edit entries.
- Seeds the database from a one-time script so you can start with example data.

The example content focuses on **AI leaders**, but you can easily adapt this to any topic: civil rights leaders, scientists, authors, role models, etc.

---

## Live demo

- Public explorer (read-only): `https://wesfryer.com/testcode/canon/`
- Blog / context: `https://ai.wesfryer.com/canon`

> Note: The repo you’re reading is generalized for others to re-use. It does **not** include my real Firebase keys or data.

---

## What this project does

### Public explorer (`index.html` + `app.js`)

- Students select a **category** (e.g., *Contemporary Industry Leaders*, *AI Ethics & Governance*).
- They can either:
  - Choose a single **person**, or
  - Click **“Show All Entries”** in that category.
- Each profile card shows:
  - Name (linked to Wikipedia)
  - Date of birth / death (DOB / DOD)
  - Short, classroom-friendly **Markdown bio**
  - Optional portrait image
  - Optional embedded YouTube video

Everything is loaded **read-only** from a Firestore database.

### Admin dashboard (`admin.html` + `admin.js`)

A private admin page for teachers (or trusted adults) to manage the data:

- **Firebase Email + Password login**
- **Categories**:
  - Add / edit / delete high-level categories
  - Example: “Historical & Foundational AI Figures”
- **People**:
  - Name, Wikipedia URL
  - Category
  - DOB, DOD
  - Image URL
  - YouTube URL
  - Tags (comma-separated)
  - Bio in Markdown

Changes appear in the public explorer in real time.

### Seeder (`seed.html` + `seed.js`)

A one-time tool to pre-populate Firestore with starter data:

- Creates a few example categories.
- Inserts a set of people (AI leaders) with bios, tags, and optional videos.

You can keep the example seed data, replace it with your own, or delete it once you’ve populated the database via the admin UI.

---

## Tech stack

- **Frontend**: Plain HTML, CSS, and vanilla JavaScript
- **Data**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Auth**: Firebase Email/Password Authentication (for the admin page)
- **Markdown**: A small embedded Markdown parser (`markdownParser.js`) that works inside Google Sites iframes (no external CDN required)

There is **no custom backend server**. Everything runs in the browser using Firebase’s client SDKs.

---

## Files & structure

A typical project layout looks like:

```text
index.html             # Public explorer UI
app.js                 # Reads from Firestore, renders cards
admin.html             # Admin dashboard UI (login + forms)
admin.js               # Admin CRUD logic (Auth + Firestore writes)
seed.html              # One-time Firestore seeding page
seed.js                # Example categories + people
markdownParser.js      # Tiny Markdown parser for bios
firebase-config.sample.js  # Example Firebase config (NO real keys)
firebase.json          # Optional: Firebase Hosting + Firestore rules
firestore.rules        # Firestore security rules for this project
README.md
