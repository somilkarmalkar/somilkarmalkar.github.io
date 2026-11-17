# Publish at somilkarmalkar.tech

As of 17 November 2026, source is uploaded to the public repository https://github.com/somilkarmalkar/somilkarmalkar.github.io, GitHub Pages is configured for GitHub Actions, and the included workflow has deployed the portfolio. The custom domain somilkarmalkar.tech is saved in Pages, Name.com DNS points to GitHub Pages, and GitHub domain ownership verification has succeeded. The portfolio is live at https://somilkarmalkar.tech with a valid HTTPS certificate and Enforce HTTPS enabled in Pages settings. Both HTTPS hostnames were verified with normal certificate validation; https://www.somilkarmalkar.tech redirects to the canonical apex URL.

## GitHub Pages

The repository and settings below are already configured. Retain this procedure for recovery or migration; do not create a duplicate repository.

1. Use the existing **public** repository **somilkarmalkar.github.io**: https://github.com/somilkarmalkar/somilkarmalkar.github.io. If rebuilding from scratch after its removal, create an empty repository with that name while signed in as somilkarmalkar.
2. Put this project's source at the repository root. Do not upload .cache/, .qa/, node_modules/, or dist/. Use normal Git, or ask ChatGPT to upload through the connected GitHub app once the new repository is accessible.
3. In repository **Settings → Pages → Build and deployment**, set **Source: GitHub Actions**.
4. Run **Actions → Deploy portfolio to GitHub Pages → Run workflow** if a push has not already started it. Wait for a successful deployment. The default URL is https://somilkarmalkar.github.io.
5. In **Settings → Pages → Custom domain**, save **somilkarmalkar.tech**. A custom Actions deployment still needs this setting; the included CNAME file alone is not enough.

GitHub Pages is included on the GitHub Student Developer Pack page and is free for public repositories without needing a student subscription. It supports custom domains and HTTPS. The site needs no server, paid plan, or expiring cloud credits.

## Name.com DNS

These records were saved on 17 November 2026 with TTL 300 and verified against all four authoritative Name.com servers and public resolvers. In Name.com, open **My Domains → somilkarmalkar.tech → Manage DNS Records** to inspect or restore them:

| Type | Host | Value |
| --- | --- | --- |
| A | @ (or blank root host in Name.com) | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | somilkarmalkar.github.io |

Replace conflicting parking or website A/AAAA/ALIAS records for the root and conflicting www records. Preserve unrelated MX, TXT, and other service records. Use Name.com's default TTL. Do not buy Name.com hosting or change nameservers just for this setup.

After DNS resolves to GitHub, return to repository Pages settings and enable **Enforce HTTPS** when the certificate is available. GitHub handles certificate provisioning. DNS and certificate changes may take time; verify both https://somilkarmalkar.tech and https://www.somilkarmalkar.tech.

Domain ownership verification succeeded on 17 November 2026. Retain the GitHub verification TXT record at Name.com. If verification must be repeated, use GitHub **account Settings → Pages → Add a domain**. GitHub supplies the specific TXT challenge value. Do not invent it. Add that exact TXT record at Name.com and verify it in GitHub; retain it afterwards.

## Official references

- Student pack: https://education.github.com/pack
- Pages deployment with Actions: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- Custom domains: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- HTTPS and DNS records: https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
- Domain verification: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages

No hosting subscription has been purchased. Domain registration and renewal remain separate from free hosting.
