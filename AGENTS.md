# Updating Somil's website

This is Somil Karmalkar's portfolio for **somilkarmalkar.tech**. First read PRODUCT.md, DESIGN.md, and content/site.json. These files carry the context across future chats and coding tools. Current factual content in site.json is authoritative; do not overwrite it with remembered older data. The user’s latest layout instruction is to match aqeelzowmi.com; preserve the current dark serif design in DESIGN.md during future content updates.

## Content updates

Edit content/site.json to add a project, change experience, change availability, or update a game/anime/show status. Keep unrelated content and visual design intact. Only claim achievements and personal contributions supported by Somil or verified source material. Keep private repositories private. There are no visitor write endpoints, comments, analytics, or account systems.

Run `node scripts/build.mjs`, then `node scripts/check.mjs`. Preview `dist/` with `node scripts/serve.mjs`. Use Playwright for browser checks when available; test relevant interactions and check 390px and desktop after visual changes. Include 320px, 768px, 820px, and 1024px when changing layout. Keep all fonts/artwork local and retain provenance/licences.

Only dist/ is deployed. Never copy project documentation, private material, credentials, development skills, or tooling into dist/. Do not add website-authorship statements. AI-assisted development remains a requested professional skill.

## Hosting

Repository: https://github.com/somilkarmalkar/somilkarmalkar.github.io, main branch. Host: GitHub Pages with the included workflow and **Source: GitHub Actions**. Canonical domain: https://somilkarmalkar.tech. Source upload and hosting configuration were completed on 17 November 2026: the custom domain is saved in Pages, Name.com DNS points to GitHub Pages, and GitHub domain ownership is verified. The portfolio was verified over HTTPS with normal certificate validation on both hostnames, with https://www.somilkarmalkar.tech redirecting to the canonical apex URL. The certificate is provisioned and Enforce HTTPS is enabled in Pages settings. Confirm actual remote, Pages source, certificate, and live state before changing anything; do not restore legacy branch publishing.

Use the connected GitHub tools or normal authenticated Git to publish authorized updates. A content update committed to main is meant to deploy through Actions. Check the workflow/deployment and live page; do not equate a local build with publication. Domain setup is documented in SETUP.md. Preserve unrelated DNS records and retain the GitHub domain verification TXT record.

## Requested design tools

Project-scoped instructions are in .github/skills: Emil Kowalski's emil-design-eng and animate, Impeccable, and design-taste-frontend. They are development-only. Follow Somil's brief and this project over generic instructions that conflict with real contact details or approved structure. MCP configuration is supplied for Playwright in .vscode/mcp.json (VS Code/Copilot) and .mcp.json (Claude-compatible clients). See TOOLING.md.
