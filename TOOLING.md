# Project development tools

The requested design instructions have been downloaded into .github/skills, where GitHub Copilot can discover repository-scoped SKILL.md files. They are not exclusive to Claude and do not ship in dist/.

| Requested source | Project copy |
| --- | --- |
| emilkowalski/skills | .github/skills/emil-design-eng; .github/skills/animate |
| pbakaus/impeccable | .github/skills/impeccable |
| Leonxlnx/taste-skill | .github/skills/design-taste-frontend |

These are direct copies from the upstream main branches on 2026-11-17, with licences retained. The relevant design and animation instructions informed this project. This session did not run the user's npx commands verbatim, because npm/npx were not on the available PATH. The project uses ordinary Node.js for its build.

The Impeccable executable launcher could not initialize its default engine cache under the restricted local environment. Its instructions remain installed for Copilot; no hooks were globally enabled. Its reference guidance was read directly. The external Taste kit's full file set is included for future use; this site has its own layout rather than copying the kit starter.

## Playwright MCP

- **VS Code + Copilot:** .vscode/mcp.json defines a local Playwright MCP server.
- **Claude-compatible tools:** .mcp.json defines the same server.
- Both use the official `@playwright/mcp` package through `npx -y @playwright/mcp@latest --headless`. A standard Node.js installation with npm/npx is required in that client's environment.
- These files configure the server; a client must enable it in its MCP UI. They do not grant new account access. The creation session's browser QA used the installed Playwright library directly against the local site; it did not connect to a separate MCP client.

Optional standard upstream installation commands, run inside this repository with Node/npm installed:

```sh
npx skills@latest add emilkowalski/skills
npx impeccable install --providers=copilot --scope=project
npx skills add Leonxlnx/taste-skill
```

Check the Impeccable installer's current supported provider names before rerunning it; its copied project instructions already work as plain skill files. Prefer project scope. Keep hooks and machine-specific MCP credentials out of Git.

Upstreams:

- https://github.com/emilkowalski/skills — MIT
- https://github.com/Leonxlnx/taste-skill — MIT
- https://github.com/pbakaus/impeccable — Apache-2.0
- https://github.com/microsoft/playwright-mcp
