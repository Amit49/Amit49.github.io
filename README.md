# Portfolio (static website)

A single-page portfolio built from the resume in `Android_Focused/`. No build step — just HTML, CSS, and JavaScript.

## View locally

Open `index.html` in your browser, or run a simple server from this folder:

```bash
# Python
python -m http.server 8080

# Node (if you have npx)
npx serve .
```

Then visit `http://localhost:8080`.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure and content |
| `css/style.css` | Layout and styling |
| `js/main.js` | Navigation, scroll effects, animations |

Resume PDF links point to `Amit_Paul_Resume_Android.pdf`.

## Host on GitHub Pages (optional, manual)

1. Push the `portfolio/` folder to your repo (or use it as the repo root for `username.github.io`).
2. In **Settings → Pages**, choose **Deploy from a branch** and select the folder that contains `index.html`.
3. No GitHub Actions required.
