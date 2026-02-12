# YengU Affiliate Fashion Discovery Site

This is a GitHub-Pages-ready, static affiliate/referral website for luxury fashion discovery. It includes product reviews, buying guides, and multi-retailer price comparisons with affiliate click tracking.

## Quick Start
- Open `index.html` in a browser to preview locally.
- Deploy the repository to GitHub Pages (Settings → Pages → Deploy from branch).

## Affiliate Setup (Single File)
Set affiliate IDs in `js/affiliate-config.js`:
- `amazonTag`
- `flipkartAffid`
- `myntraSource`

Product links are generated automatically from platform + product IDs in page markup. Optional direct URL overrides are also supported in `linkOverrides`.

## Login / Signup Setup (Supabase)
This site includes secure auth pages:
- `auth.html`
- `account.html`

Configure credentials in `js/auth-config.js`:
- `supabaseUrl`
- `supabaseAnonKey`

Steps:
1. Create a Supabase project.
2. Enable Email auth provider in Supabase Authentication settings.
3. Add your production URL to Supabase redirect URLs:
- `https://broz12.github.io/YengU/estore/account.html`
4. Paste project URL and anon key into `js/auth-config.js`.

If auth config is empty, forms stay visible but show a setup error and do not authenticate.

## Supabase/Postgres Data Setup
This site also writes data to Supabase/Postgres for:
- Email capture forms
- Affiliate click telemetry

Run schema:
- `supabase/schema.sql`

Setup guide:
- `docs/supabase-postgres-setup.md`

## Update Pricing & Availability
- Update prices and stock status inside each review page.
- Update the `Price last checked` timestamp on each review page.

## Click Tracking
Affiliate link clicks are tracked via `js/affiliate-tracker.js`. Optional persistence to Supabase is handled by `js/supabase-data.js`.

## File Structure
```
/
├── index.html
├── about.html
├── disclosure.html
├── reviews/
│   ├── product-1.html
│   └── product-2.html
├── guides/
│   └── luxury-fashion-buying-guide.html
├── category/
│   ├── dresses.html
│   └── handbags.html
├── css/
│   ├── auth.css
│   ├── style.css
│   └── review-page.css
├── js/
│   ├── affiliate-config.js
│   ├── affiliate-tracker.js
│   ├── auth-config.js
│   ├── auth.js
│   ├── price-comparison.js
│   └── supabase-data.js
├── auth.html
├── account.html
├── docs/
│   ├── cloudflare-access-setup.md
│   └── supabase-postgres-setup.md
├── supabase/
│   └── schema.sql
├── images/
│   └── products/
│       ├── aurora-silk-gown.svg
│       ├── sable-dress.svg
│       ├── velour-handbag.svg
│       └── ivory-handbag.svg
├── robots.txt
└── README.md
```

## Security Notes
- `robots.txt` currently blocks indexing (`Disallow: /`) to reduce discoverability.
- Pages include `noindex` and security meta policies (CSP, referrer policy, permissions policy).
- Inline affiliate `onclick` handlers were removed to support stricter CSP behavior.
- Cloudflare Access rollout steps are documented in `docs/cloudflare-access-setup.md`.
- Auth pages use Supabase (`@supabase/supabase-js`) and only store session tokens from that provider.

## Platform Notes
- All purchase buttons are external affiliate links.
- No checkout, payment processing, or customer service is handled on this site.
- Make sure the affiliate disclosure text stays visible on every page that contains affiliate links.
