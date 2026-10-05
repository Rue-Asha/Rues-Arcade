# Erklärungen

"Erklärung" on a game's start screen shows `static/explain/<slug>/index.html` fullscreen. Without that
file it shows "Für dieses Spiel gibt es noch keine Erklärung." Commit the file and rebuild; no code or
registry change is needed. `<slug>` is the game's slug from the registry (`imposter`, `wavelength`).

```
static/explain/
  imposter/
    index.html
    runde.png
    slides.css
```

## Format

- **Self-contained HTML.** One `index.html` per game; styles and scripts inline or as files next to it.
- **Assets next to `index.html`.** Reference them relatively (`src="runde.png"`, not `/explain/...` or
  `../`). Everything in the folder is served as-is at `/explain/<slug>/`.
- **No CDN, no external requests.** No web fonts, script tags or images from other hosts. The app runs on
  a home server and has to work offline; ship what you need in the folder.
- **Sandboxed.** The iframe has `sandbox="allow-scripts"` and no `allow-same-origin`: scripts run, but
  the page has an opaque origin. It can't read the app's `localStorage`, cookies or DOM, can't navigate
  the app, and can't open popups or submit forms. `localStorage` inside the slides throws, so keep slide
  state in memory.
- **Phone first.** Add `<meta name="viewport" content="width=device-width, initial-scale=1">` and lay out
  for 390×844 as well as desktop. Navigation between slides is up to the page (buttons, swipe, arrow keys).
- **Keep the top-right corner free.** The viewer's close button (48×48, 12px from the edge) sits on top of
  the slides. Esc closes the viewer while focus is in the app; once someone taps inside the slides, the
  close button is the way out.
- **Dark ground.** Use the app's ground `#111234` as the page background so opening and closing doesn't flash.

## Check it

`npm run build && node build`, then open `/spiele/<slug>/erklaerung`.
