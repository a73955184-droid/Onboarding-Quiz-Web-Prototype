# AaronBux Flow Prototype

This is a GitHub Pages-ready HTML prototype exported from Stitch-style screens and wired as a mini web app.

## Files

- `index.html` redirects to `step1.html`
- `step1.html` through `step7.html` are onboarding screens
- `investment_profile.html` is the final recommendation/profile screen

## State flow

The prototype passes state through the URL query parameter:

```txt
?state=<url-encoded-json>
```

Each screen reads the incoming state, updates `state.scores`, and forwards the state to the next screen.

## Run locally

From this folder:

```bash
python -m http.server 8000
```

Open:

```txt
http://localhost:8000/
```

## Deploy to GitHub Pages

1. Create a new GitHub repository.
2. Upload all files in this folder to the repository root.
3. Go to Settings -> Pages.
4. Set Source to `Deploy from a branch`.
5. Choose your main branch and `/root`.
6. Save and open the GitHub Pages URL when it finishes deploying.

## Debugging

On the final screen, the URL should include `?state=...`.

In DevTools console, run:

```js
new URLSearchParams(window.location.search).get("state")
```

If it returns `null`, state was not passed into the final screen.
