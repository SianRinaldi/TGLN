# the girls leadership network — website

Static site. No database, no WordPress, no plugins to update.

## Changing the words on the site

Everything you can edit lives in **`content.json`**. Open it, change the text between the quote marks, save. That is the whole job.

The most common change is the registration banner on the home page. Find the `registration` block near the top:

```json
"registration": {
  "status": "closed",
  "heading": "2026 registrations are closed",
  "body": "Our 2026 cohort is full. Join the waitlist ...",
  "ctaLabel": "join the 2027 waitlist",
  "ctaUrl": "https://forms.gle/...",
  "ctaEnabled": true
}
```

- `status` accepts `open`, `closed` or `soon`. It changes the colour of the little pill.
- `ctaEnabled` set to `false` hides the buttons entirely.
- `ctaUrl` is the link the button goes to.

Rules that will save you a headache:

1. Never change the words to the left of a colon. Those are labels the site looks for.
2. Keep every quote mark and comma exactly where it is.
3. If you break it, the site will not build and Vercel will keep the old version live. Nothing goes down.

## Editing without touching a computer terminal

1. Open the repository on github.com.
2. Click `content.json`, then the pencil icon.
3. Make your change and click **Commit changes**.
4. Vercel rebuilds and the site updates in about a minute.

## Adding a blog or podcast post

Add a new block inside `blog.posts` in `content.json`, copying the shape of the existing one. The `slug` becomes the web address, so keep it lowercase with hyphens.

## Adding a photo

1. Put the image in `public/img/` as two webp files: `name-sm.webp` (640px wide) and `name-lg.webp` (1280px wide).
2. Reference it in `content.json` using just the name, for example `"img": "p8"`.

## Running it on your own machine

```bash
node build.mjs        # builds into dist/
npx serve dist        # preview at localhost
```

Needs Node 18 or later. No packages to install.

## Before launch

Three things still need a decision. They are marked with square brackets in `content.json`:

- The waitlist form URL in the `registration` block.
- Whether to name a contact person in the `childSafety` block, alongside the shared mailbox.
- The review date and timeframes in the `privacy` block. The privacy page is switched off (`"published": false`) until these are confirmed.
