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

## Update Pricing & Availability
- Update prices and stock status inside each review page.
- Update the `Price last checked` timestamp on each review page.

## Click Tracking
Affiliate link clicks are tracked via `js/affiliate-tracker.js`. You can connect analytics by adding your GA tag and enabling the `gtag` call.

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
│   ├── style.css
│   └── review-page.css
├── js/
│   ├── affiliate-config.js
│   ├── affiliate-tracker.js
│   └── price-comparison.js
├── docs/
│   └── cloudflare-access-setup.md
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

## Platform Notes
- All purchase buttons are external affiliate links.
- No checkout, payment processing, or customer service is handled on this site.
- Make sure the affiliate disclosure text stays visible on every page that contains affiliate links.
