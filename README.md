# Socially — Mini Social Media Platform

Responsive mini social app built with HTML, CSS, vanilla JavaScript and Express.js.

## Features
- Register/login with hashed passwords and JWT sessions
- User profiles and profile editing
- Create/delete posts; optional image URL
- Like/unlike posts and add comments
- Follow/unfollow people
- Feed search, latest/popular sorting, discover people
- Persistent data in `data/db.json` (created automatically)
- Responsive desktop, tablet and mobile layouts

## Run
1. Install Node.js 18 or newer.
2. Open this folder in a terminal.
3. Run `npm install`
4. Copy `.env.example` to `.env`, and set a private `JWT_SECRET`.
5. Run `npm start`
6. Visit http://localhost:3000

Demo login: `demo@socially.dev` / `Demo123!`

The JSON data file is a beginner-friendly persistent database for this self-contained demo. For production, use PostgreSQL/MongoDB and add rate limiting, email verification, backups and deployment secrets.


## Troubleshooting login / registration
- If the demo login returns 401 after previous testing, stop the server and remove `data/db.json`, then restart `npm start`. The demo data will be recreated automatically. This resets local demo users/posts.
- Registration validates email, username (3–20 letters/numbers/underscores), and password (at least 6 characters).


### Uploading images
- When creating a post, click **Upload image**, choose a JPG/PNG/WEBP/GIF image from your device, preview it, and click **Share post**. No image URL needs to be pasted.
- Profile photos can also be selected from the device in **My profile → Edit profile**.
- The server validates image type and a 5 MB limit, saves the file in `public/uploads/`, and returns an automatically generated URL such as `/uploads/<generated-name>.jpg`. That URL is stored with the post/profile.
- Uploaded images are local to this server. If you deploy the app to a hosting provider with an ephemeral filesystem, use persistent storage or a cloud image service for production.
