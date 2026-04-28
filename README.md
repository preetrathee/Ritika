# Cute Yes/No GitHub Page

This repo is a single-page site you can host with GitHub Pages:

- Shows an attractive “cutie” photo collage
- “No” button dodges around
- Clicking “Yes” reveals your photos (you + me + us)

## Add your photos

Put your images in `assets/` and name them like:

- `assets/1.jpg`, `assets/2.jpg`, `assets/3.jpg`, …

This page uses:

- Collage: `1.jpg`, `2.jpg`, `3.jpg`
- “Yes” reveal: `4.jpg`, `5.jpg`, `6.jpg`
- Gallery: keeps loading `1.jpg`, `2.jpg`, … until it can’t find more

If you don’t want duplicates (because collage/reveal already use 1–6), open:

- `?start=7`

Tip: keep everything as `.jpg` for best loading speed.

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
