# RidePilot — Deploy to GitHub Pages

## What you have

6 files. All belong **at the root of your GitHub repo** (not in subfolders).

```
ridepilot_pro.html    ← main app
manifest.json         ← PWA manifest
sw.js                 ← service worker
icon-180.png          ← Apple touch icon
icon-192.png          ← Android icon
icon-512.png          ← splash + maskable icon
```

## Step-by-step deploy (15 minutes)

### 1. Create a GitHub repo

- Go to https://github.com/new
- Name: `ridepilot` (lowercase, simple)
- **Public** (private repos can't use free GitHub Pages)
- Skip README / .gitignore / license — leave empty
- Click **Create repository**

### 2. Upload all 6 files

Easiest way without git:

- On the new repo's home page, click **uploading an existing file**
- Drag all 6 files in
- Commit message: `Initial RidePilot deploy`
- Click **Commit changes**

### 3. Turn on GitHub Pages

- Repo → **Settings** → left sidebar → **Pages**
- Under **Source**, pick **Deploy from a branch**
- Branch: `main` (or whatever you have), folder: `/ (root)`
- **Save**
- Wait ~1 minute. GitHub will show: **Your site is live at https://YOUR_USERNAME.github.io/ridepilot/**

### 4. Test on your iPhone

- Safari (must be Safari, not Chrome) → open `https://YOUR_USERNAME.github.io/ridepilot/ridepilot_pro.html`
- Tap **Share** (square with up arrow) → **Add to Home Screen**
- Name shows as "RidePilot" — confirm
- Close Safari. Tap the new RidePilot icon on your home screen.

You should see RidePilot **full-screen, no address bar, custom icon**. That's PWA mode.

### 5. Test notifications

- In RidePilot, set a wait timer (e.g. tap 「我已到达」then「开始等单」)
- The first time, iOS will ask for notification permission — tap **Allow**
- Switch to another app or lock the phone
- Wait for the timer to expire — you should get a system notification

### Troubleshooting

**"Add to Home Screen" only saves a Safari bookmark, not an app**
→ Make sure you opened the page from `https://...github.io/...`, not from a local file. Service workers and PWA only work over HTTPS.

**No notification fires**
→ iOS 16.4+ required. Check **Settings → Notifications → RidePilot** is enabled. If permission was declined, you have to delete + re-install the PWA to ask again.

**Notification fires only when app is in foreground**
→ iOS may have killed the PWA after long backgrounding. This is an iOS limit, not RidePilot. Short backgrounding (a few minutes) should still work.

**Icon looks wrong**
→ iOS aggressively caches PWA icons. Delete from home screen + re-add to fix.

## Updating later

When you ship a new version:

1. Replace `ridepilot_pro.html` (and any other changed files) on GitHub
2. **Bump the VERSION constant in `sw.js`** (e.g. `'ridepilot-v8.33.0'` → `'ridepilot-v8.34.0'`)
   This forces the service worker to drop the old cache and pull fresh files.
3. Commit
4. On iPhone: open RidePilot. The new SW version takes effect after the **second** open (first open downloads it in the background, second open uses it).

## Custom domain (optional, later)

When you're ready to publish for real:

1. Buy a domain (Namecheap, Cloudflare Registrar — `~$15/year`)
2. Repo → Settings → Pages → **Custom domain** → enter `ridepilot.app`
3. Add DNS records as GitHub instructs

The PWA works exactly the same — but now drivers see `ridepilot.app` instead of `username.github.io/ridepilot`.

## What's NOT in scope yet

- **No remote push** (server-driven). All notifications are scheduled locally on the phone.
- **No accounts / sync**. Data stays in `localStorage` on the phone.
- **No analytics**. App is fully offline-capable, doesn't phone home.

Future: when you want server push (e.g. "your platform is surging in your zone"), add a Cloudflare Worker + VAPID. That's a separate iteration.
