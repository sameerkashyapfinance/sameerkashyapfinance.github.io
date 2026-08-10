# Avenir Solutions — Website v2

TBEA-inspired corporate redesign of avenirsolutions.in. Pure static HTML/CSS/JS — no build step, no dependencies, ready for GitHub Pages.

**27 pages** · Google Sans Flex typography · fully responsive · working weight calculator · filterable camlock price list (72 variants) · inquiry-list system · complete blog (11 articles)

---

## Deploy to GitHub Pages (one-time, ~10 minutes)

### 1. Create the repository
1. Sign in at github.com → **New repository**
2. Name it anything (e.g. `avenir-website`). Keep it **Public**. Do NOT add a README.
3. On the empty-repo page choose **"uploading an existing file"**, then drag the **contents** of this `avenir-site` folder (all files and folders — index.html, assets, blog, etc.) into the upload area. Commit.

> Uploading via drag-and-drop skips folders in some browsers. If folders don't upload, install [GitHub Desktop](https://desktop.github.com), clone the repo, copy the files in, and push.

### 2. Enable GitHub Pages
1. Repo → **Settings → Pages**
2. Source: **Deploy from a branch** → Branch: `main`, folder `/ (root)` → Save
3. In ~1 minute the site is live at `https://<username>.github.io/<repo>/`
   (styling only fully works once the custom domain is set, because links are root-absolute)

### 3. Point avenirsolutions.in to GitHub (at Hostinger)
1. Hostinger hPanel → **Domains → avenirsolutions.in → DNS / Name Servers**
2. Delete existing A records for `@`, then add these four **A records** (name `@`):
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
3. Add a **CNAME record**: name `www` → value `<username>.github.io`
4. Back in GitHub: Settings → Pages → **Custom domain** → enter `avenirsolutions.in` → Save. (The `CNAME` file in this repo already matches.)
5. Tick **Enforce HTTPS** once the certificate is issued (can take up to an hour).

DNS propagation takes minutes to a few hours. Your old Hostinger site keeps serving until DNS flips.

---

## Notes & customization

- **Contact form / inquiry list** send email via the visitor's mail app (`mailto:` to sales@avenirbharat.com) — zero backend needed. For direct in-browser submission later, create a free form endpoint at formspree.io and swap the form handler in `assets/js/main.js`.
- **Images** are hot-linked from Unsplash (free license). For maximum control/speed, download your favorites (or real factory photos!) into `assets/img/` and update the URLs.
- **Fonts**: Google Sans Flex with DM Sans fallback, loaded from Google Fonts.
- **Editing content**: every page is plain HTML — open in any editor. Site-wide styles live in `assets/css/style.css`.
- **FAQ answers, privacy & terms** were newly written (the old site kept them collapsed/absent) — worth a quick review.
- `sitemap.xml` + `robots.txt` included; update if you add pages.

## Local preview
Root-absolute links mean double-clicking `index.html` won't style correctly. Use the bundled **avenir-site-preview** folder (self-contained pages, just double-click `index.html`) — or run any local server in this folder.
