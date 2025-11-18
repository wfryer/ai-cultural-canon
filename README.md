# AI Cultural Canon (Firestore + Vanilla JS)

A classroom-friendly web app for exploring a curated “canon” of people — with short bios, links, and videos — backed by Firebase Firestore.

This repo is an “open notebook” of how I vibe-coded a working project that:

- Shows students a filterable gallery of people and short bios.
- Lets a teacher log in to a private admin page to add / edit entries.
- Seeds the database from a one-time script so you can start with example data.

The example content focuses on **AI leaders**, but you can easily adapt this to any topic: civil rights leaders, scientists, authors, role models, etc.

---

## Live demo

- Public explorer (read-only): <https://wesfryer.com/testcode/canon/>
- Embedded version: <https://ai.wesfryer.com/canon>

> Note: This repo is generalized for others to re-use. It does **not** include my real Firebase keys or data.

---

## What this project does

### Public explorer (`index.html` + `app.js`)

- Students select a **category** (for example *Contemporary Industry Leaders*, *AI Ethics & Governance*).
- They can either:
  - Choose a single **person**, or
  - Click **“Show All Entries in Category”**.
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

- **Frontend:** Plain HTML, CSS, and vanilla JavaScript
- **Data:** [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Auth:** Firebase Email/Password Authentication (for the admin page)
- **Markdown:** A small embedded Markdown parser (`markdownParser.js`) that works inside Google Sites iframes (no external CDN required)

There is **no custom backend server**. Everything runs in the browser using Firebase’s client SDKs.

---

## Files & structure

All files live in the root of the repo:

```text
.gitignore                # Ignores firebase-config.js (real keys)
LICENSE                   # MIT license
README.md                 # This file

firebase-config.sample.js # Example Firebase config (NO real keys)
firebase.json             # Optional: Firebase Hosting + Firestore rules
firestore.rules           # Firestore security rules for this project

index.html                # Public explorer UI
app.js                    # Reads from Firestore, renders cards

admin.html                # Admin dashboard UI (login + forms)
admin.js                  # Admin CRUD logic (Auth + Firestore writes)

seed.html                 # One-time Firestore seeding page
seed.js                   # Example categories + people

markdownParser.js         # Tiny Markdown parser for bios
```

When you deploy, you’ll also create a **local, untracked** `firebase-config.js` file (see below).

---

## Setup & Configuration (Beginner-Friendly)

These steps assume **no prior Firebase experience**.

### 1. Get the code

You can either:

- Click **Code → Download ZIP**, or  
- Clone the repo:

```bash
git clone https://github.com/wfryer/ai-cultural-canon.git
cd ai-cultural-canon
```

All the web files live in the root of this repo (`index.html`, `admin.html`, `seed.html`, etc.).

---

### 2. Create a Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com/).
2. Click **“Add project”** and give it a name (for example `ai-canon-demo`).
3. Accept defaults and finish the wizard.

---

### 3. Add a Web App & copy your config

1. In your new project, click the **Web (`</>`)** icon to add an app.
2. Give it a nickname (for example `ai-canon-web`).
3. Firebase shows you a `const firebaseConfig = { ... }` snippet.

You’ll paste those values into a **local** file named `firebase-config.js` (next step).

---

### 4. Create `firebase-config.js` locally (do NOT commit this file)

In the same folder as `index.html`, copy the sample file:

```bash
cp firebase-config.sample.js firebase-config.js
```

Then edit `firebase-config.js` and replace the placeholder values with your real Firebase config from step 3:

```js
export const firebaseConfig = {
  apiKey: "YOUR_REAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.firebasestorage.app",
  messagingSenderId: "YOUR_REAL_SENDER_ID",
  appId: "YOUR_REAL_APP_ID"
};
```

> **Important:** `.gitignore` already ignores `firebase-config.js`, so it won’t be committed to GitHub.

---

### 5. Enable Firestore

1. In the Firebase console, go to **Build → Firestore Database**.
2. Click **“Create database”**.
3. Start in **Production mode**.
4. Choose a location and finish the wizard.

---

### 6. Enable Email/Password authentication

This is required for the admin page (`admin.html`).

1. In Firebase console go to **Build → Authentication → Sign-in method**.
2. Enable **Email/Password**.
3. On the **Users** tab, click **“Add user”** and create an account  
   (this will be your admin login for the site).

---

### 7. Set Firestore security rules (critical for safety)

By default many people start development with “allow all” rules like:

```text
match /{document=**} {
  allow read, write: if true;
}
```

Those are convenient for quick testing but **very insecure** for a live site.

For this project, use the following rules (these are also in `firestore.rules`):

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Public collections: anyone can read, only signed-in users can write
    match /categories/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /people/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Lock everything else by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Apply them either via:

- **Firebase CLI** (from the repo folder):

  ```bash
  firebase deploy --only firestore:rules
  ```

- **or** by pasting the rules into **Firestore → Rules** in the Firebase console and clicking **Publish**.

---

### 8. Serve the files & seed the database (optional starter data)

You can run this from any static web host (Netlify, GitHub Pages, your own VPS, etc.).  
For quick local testing you can use a simple dev server, for example:

```bash
# using Node's http-server (npm install -g http-server)
http-server .
```

Then:

1. Open `http://localhost:8080/seed.html` (or whatever port your server uses).
2. Watch the browser console; the script in `seed.js` will create example:
   - Categories (for example “Foundational AI Figures”)
   - People (with bios, image URLs, YouTube URLs, etc.)

You only need to run `seed.html` once. After that you can manage data entirely via the admin page.

---

### 9. Use the admin dashboard

1. Visit `admin.html` on your host (for example `http://localhost:8080/admin.html` or `https://yourdomain.com/admin.html`).
2. Sign in with the Email + Password you created in Firebase Authentication.
3. Use the forms to:
   - Add/edit **categories**
   - Add/edit **people**
4. Open `index.html` (the public page) in another tab to see how the changes appear for students.

---

## Security & Firestore Rules

This app uses Firebase **entirely from the browser**, which means:

- Your Firebase configuration (`apiKey`, `authDomain`, etc.) is *not* a secret in the deployed site.
- Visitors can always see that config in browser DevTools.
- **Security comes from Firestore rules**, not from hiding the `apiKey`.

That’s why the rules above are so important:

- `allow read: if true;` on `categories` and `people` makes the canon **publicly readable**.
- `allow write: if request.auth != null;` means **only authenticated users** (logged in via Firebase Auth) can create, update, or delete entries.
- The final catch-all

  ```text
  match /{document=**} {
    allow read, write: if false;
  }
  ```

  locks down any other collections by default.

If you ever temporarily loosen rules to seed data (for example `allow read, write: if true;`), make sure to switch back to the locked-down rules before sharing the URL or using the app with students.

---

## Adapting this for your own “canon”

To repurpose this for a different topic (for example, civil rights leaders):

1. **Update the category names** (through `admin.html` or your seed script).
2. **Edit or replace the seed data** in `seed.js` to reflect your topic.
3. Use the admin page to gradually build out your canon:
   - Classroom-friendly bios
   - Image URLs from allowed, copyright-friendly sources
   - Optional videos

Because the public explorer is read-only and the admin is password-protected, this model works well embedded in a **Google Site** via an `<iframe>` for classroom use.

---

## License

This project is released under the MIT License.  
See the [LICENSE](LICENSE) file for full details.
