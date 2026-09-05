# Archive

Pages kept for reference but no longer published.

Jekyll ignores any top-level directory beginning with `_` (other than its own
`_posts`, `_drafts`, `_layouts`, `_includes`, `_data`, `_plugins`), so nothing
in here is built or deployed.

## `about.html`

The old hand-written About page, with the `stylesheets/` it depends on. Long out
of date, but kept for the design. Open `about.html` directly in a browser to
view it — the stylesheet paths are relative, so it renders from disk.

It was previously served at `/about/`. To restore it, move the file and
`stylesheets/` back to the repo root, re-add the front matter:

```
---
title: About
permalink: /about/
---
```

change the five stylesheet `href`s back to `/stylesheets/...`, and put the nav
link back in `_includes/navigation.html`.
