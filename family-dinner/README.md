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

## Sync between phones

Connected phones share their ratings, grocery sliders and recipe checklists
through this repo, on the `family-dinner-data` branch:

- `family-dinner/ratings.json`: ratings. The Saturday plan task reads this
  along with ratings made in the Claude artifact, so app ratings shape next
  week's plan.
- `family-dinner/shared.json`: grocery slider positions and checked-off
  ingredients and steps. Checklists older than five weeks are dropped.

Saving to a separate branch means a sync doesn't redeploy the site. Store
choices and names stay per phone.

One-time setup on each phone:

1. On GitHub, open **Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → Generate new token**
   (direct link: https://github.com/settings/personal-access-tokens/new).
2. **Token name:** `Family Dinner app` (add the phone's name if you're making two).
   **Expiration:** 1 year (or what you're comfortable with).
3. **Repository access:** *Only select repositories* → `akaAC1/WiP`.
4. **Permissions → Repository permissions → Contents:** *Read and write*.
   Leave everything else at *No access*.
5. **Generate token** and copy it (it starts with `github_pat_`).
6. In the app, open **Week → Sync between phones**. Check the owner and
   repository, paste the token, and tap **Connect & sync**.

After that, changes sync a few seconds after you make them. The app also
checks for the other phone's changes every 30 seconds while it's open, and
whenever you switch back to it. Each thumb, the ease rating, each slider and
each checkbox is merged separately, and the most recent change wins. That way
two phones can work on the same list without overwriting each other.

The token is stored only in that phone's browser storage and isn't included in
backups. Anyone using that phone could use it to change files in this one repo,
so keep the scope to this repository. To turn sync off, tap **Disconnect**, or
revoke the token on GitHub. When the token expires, the app says so; make a
new one and paste it in.

## Your data

Ratings, slider positions, store choices, names and recipe checklists are saved in
the browser's local storage on that device, and synced as described above. Use **Week → Your data → Export
backup** to save a JSON file, and **Import backup or plan** to restore it or
move it to another phone.

## Differences from the artifact

- Data is stored on the device. Ratings, sliders and checklists sync between
  phones once each one is connected (see above). Use export/import to move
  everything else.
- The plan comes from `plans/current.json` instead of the artifact's database.
- It works offline and installs to the home screen.
- Each recipe has a **Keep screen on** button so the phone doesn't lock while you cook.
