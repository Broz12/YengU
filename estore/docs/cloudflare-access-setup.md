# Cloudflare Access Setup for YengU (GitHub Pages)

This guide puts an authentication gate in front of your public GitHub Pages site.

## Target
- GitHub Pages origin: `https://broz12.github.io/YengU/estore/`
- Protected domain example: `https://shop.yengu.in`

## Prerequisites
- Domain added to Cloudflare and DNS managed by Cloudflare.
- GitHub Pages enabled for `Broz12/YengU`.
- Optional: if you use a custom domain in GitHub Pages, add a `CNAME` file in repo root.

## 1) Point domain to GitHub Pages
1. In Cloudflare DNS, add `CNAME`:
- Name: `shop` (or your subdomain)
- Target: `broz12.github.io`
- Proxy status: `Proxied` (orange cloud)

2. In GitHub repo settings (`Pages`), set custom domain to your full subdomain (example `shop.yengu.in`) and enforce HTTPS.

## 2) Create Cloudflare Access application
1. Go to Cloudflare Zero Trust dashboard.
2. Access -> Applications -> Add an application.
3. Type: `Self-hosted`.
4. Application domain:
- Domain: your protected domain (example `shop.yengu.in`)
- Path: `/*`
5. Session duration: `24h` (or stricter).

## 3) Add Access policies
Create policy order exactly as below:

1. `Allow` trusted emails
- Rule type: `Emails`
- Include: your email(s)

2. Optional `Allow` domain users
- Rule type: `Email domain`
- Include: your domain

3. `Block` everyone else
- Action: `Block`
- Include: `Everyone`

## 4) Lock direct GitHub Pages URL
Cloudflare only protects your custom domain, not `broz12.github.io` directly.

Use one of these controls:
- Keep the GitHub Pages URL unlisted and only distribute protected domain.
- Add a JavaScript redirect from GitHub URL to custom domain.
- Best control: host behind Cloudflare Tunnel or move to Cloudflare Pages where Access is first-class.

## 5) Validate
1. Open protected domain in incognito.
2. Confirm Access login prompt appears.
3. Confirm authenticated users can browse pages and buy buttons still work.
4. Confirm unauthenticated access is blocked.

## 6) After Access is active
- Remove or relax `noindex` settings only if you want search traffic.
- Update `robots.txt` accordingly.

## Operational checks
- Review Access logs weekly.
- Rotate allowed users quarterly.
- Keep GitHub branch protection enabled.
