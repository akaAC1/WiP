# Family Dinner Plan

A weekly dinner planner made for phones that you can install as an app (PWA). It has the same plan and layout
as the Family Dinner Plan artifact: five heart-healthy weeknight dinners, Sunday
prep and a leftover map, recipe checklists, thumbs-up/down and ease ratings, and a
grocery list priced across Aldi, Jewel-Osco, Mariano's and Costco with
"how much do I have" sliders.

There is no build step and no backend: just plain HTML, CSS and JavaScript.

## Run locally

```sh
cd family-dinner
python3 -m http.server 8000
# open http://localhost:8000
```

## Install on your phone

1. Deploy it (see below) and open the URL on your phone.
2. iPhone: Safari → Share → **Add to Home Screen**.
   Android: Chrome → menu → **Install app**.

It opens full screen and works offline after the first load.

## Deploy

The repo's GitHub Pages workflow (`jekyll-gh-pages.yml`) publishes the whole
repository, so this app is served at `/family-dinner/`. Any static host
(Netlify, Cloudflare Pages, Vercel) also works if you point it at this folder.

## A new week's plan

The app reads `plans/current.json`. To publish a new week, replace that file,
keep a copy as `plans/<weekOf>.json` for history, and push. Open apps pick up the
new plan the next time they come back to the foreground. You can also load a plan file
directly on a phone with **Week → Your data → Import backup or plan**.

## Your data

Ratings, slider positions, store choices, names and recipe checklists are saved in
the browser's local storage on that device. Use **Week → Your data → Export
backup** to save a JSON file, and **Import backup or plan** to restore it or
move it to another phone.

## Differences from the artifact

- Data is stored on the device instead of in your claude.ai account, so two
  phones don't share it automatically. Use export/import to move it.
- The plan comes from `plans/current.json` instead of the artifact's database.
- It works offline and installs to the home screen.
- Each recipe has a **Keep screen on** button so the phone doesn't lock while you cook.
