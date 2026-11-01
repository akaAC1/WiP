# Peak on Peak

Phone-first training log, installable as an app (PWA). Same program as the
Peak on Peak artifact: six weekly sessions, month-aligned waves
(W1, W2, W3, Peak in 5-week months, Deload), set and weight logging,
a rest timer and a full-year tracker with body-weight trend.

No build step and no backend: plain HTML, CSS and JavaScript.

## Run locally

```sh
cd peak-on-peak
python3 -m http.server 8000
# open http://localhost:8000
```

## Install on your phone

1. Deploy it (below) and open the URL on your phone.
2. iPhone: Safari → Share → **Add to Home Screen**.
   Android: Chrome → menu → **Install app**.

It opens full screen and works offline after the first load.

## Deploy

The repo's GitHub Pages workflow (`jekyll-gh-pages.yml`) publishes the whole
repository on every push to `main`, so this app is served at `/peak-on-peak/`.
Turn it on once in the repo: **Settings → Pages → Source: GitHub Actions**.
Any static host (Netlify, Cloudflare Pages, Vercel) also works: point it at this folder.

## Your data

Logs live in the browser's local storage on that device. Use
**Year → Your data → Export backup** to save a JSON file, and **Import backup**
to restore it or move it to another phone.

## Differences from the artifact

- Data is stored on the device instead of your claude.ai account.
- Export/import backups.
- Works offline; installs to the home screen.
- Screen stays awake while the rest timer runs.
- "Today" rolls over if the app is left open past midnight.
