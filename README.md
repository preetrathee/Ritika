# Cute Yes/No GitHub Page

This repo is a single-page site you can host with GitHub Pages:

- Shows an attractive “cutie” photo collage
- “No” button dodges around
- Clicking “Yes” reveals your photos (you + me + us)

## Add your photos

Drop your real images into `assets/` using these names.
Recommended: use `.jpg` for everything (fast + simplest).

- `assets/her-1.jpg`
- `assets/her-2.jpg`
- `assets/her-3.jpg`
- `assets/her.jpg`
- `assets/mine.jpg`
- `assets/us.jpg`

Optional gallery (add as many as you want; missing ones stay as placeholders):

- `assets/cutie-01.jpg` … `assets/cutie-30.jpg`

The site ships with a placeholder image; `script.js` automatically swaps to your real files when they exist.

If you keep non-`.jpg` extensions without editing `index.html`, open the site with `?tryExts=1` to make it try `.png`/`.webp` too (slower).

## Customize text

Edit `index.html`, or use URL params:

- `?name=HerName`
- `?question=Will%20you%20go%20out%20with%20me%3F`
- `?message=Say%20yes%20and%20I%27ll%20plan%20the%20date.`

Example:

`https://YOUR-USER.github.io/YOUR-REPO/?name=Cutie&question=Be%20my%20date%3F&message=I%20promise%20it%27ll%20be%20cute.`

## Enable GitHub Pages

On GitHub: **Repo → Settings → Pages → Build and deployment**

- Source: **Deploy from a branch**
- Branch: `main` (or `master`)
- Folder: `/ (root)`
