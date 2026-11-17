# Somil Karmalkar

A personal engineering portfolio and media collection. The current dark serif layout follows aqeelzowmi.com at Somil’s explicit request. Routes: home, favourites, games, watchlist, music, and résumé.

## Update the content

Edit **content/site.json**. Projects, experience, skills, game rotation, watch progress, and favourite artists live in that one file. Add a project object using an existing one as a template, with a unique `id`, description, tags, details, and honest status. The home page renders it as a compact project entry with a notes dialog.

On GitHub, open the file, click the pencil, make the change, and commit to main. GitHub Pages is configured to use the included Actions workflow, which builds and publishes the site automatically.

## Local development

Requires Node.js 22 or later. The website has no package installation step.

```sh
node scripts/build.mjs
node scripts/check.mjs
node scripts/serve.mjs
```

Open http://127.0.0.1:4173. Run the build again after edits. Only dist/ is served or deployed. The résumé page's Print / save PDF button prints the latest content, so there is no stale résumé file to maintain.

## Continue in another chat

Ask: **“Update my website, somilkarmalkar.tech. Read the repository's AGENTS.md and content/site.json first.”**

Repository: https://github.com/somilkarmalkar/somilkarmalkar.github.io. Source was uploaded and GitHub Pages was configured for GitHub Actions on 17 November 2026. The custom domain somilkarmalkar.tech is saved in Pages, Name.com DNS points to GitHub Pages, and domain ownership is verified. The portfolio is live at https://somilkarmalkar.tech with a valid HTTPS certificate, Enforce HTTPS enabled in Pages settings, and https://www.somilkarmalkar.tech redirecting to the canonical apex URL.

AGENTS.md, PRODUCT.md, and DESIGN.md preserve the facts, constraints, and visual decisions. Read the current repository before using older source packages or Somil-Portfolio-Context.md.

See SETUP.md for GitHub Pages and Name.com; TOOLING.md for the requested design skills and Playwright MCP. Artwork sources are recorded in ASSETS.json.
