# Supabase/Postgres Setup for YengU

## 1) Create Supabase project
- Create a new project in Supabase.
- Copy:
  - Project URL
  - Anon public key

## 2) Apply DB schema
- Open Supabase SQL Editor.
- Paste and run: `supabase/schema.sql`.

## 3) Configure frontend
Edit `js/auth-config.js`:

```js
window.YENGU_AUTH_CONFIG = {
  supabaseUrl: "https://YOUR_PROJECT.supabase.co",
  supabaseAnonKey: "YOUR_SUPABASE_ANON_KEY",
};
```

## 4) Configure authentication URLs
In Supabase -> Authentication -> URL Configuration:
- Site URL: `https://broz12.github.io/YengU/estore/`
- Redirect URL: `https://broz12.github.io/YengU/estore/account.html`

## 5) Validate flows
1. Open `/estore/auth.html` and sign up.
2. Confirm email if enabled.
3. Log in and verify `/estore/account.html` shows your email and user id.
4. Submit email capture form on home/guide pages and confirm row appears in `price_alert_subscriptions`.
5. Click affiliate buttons and confirm rows appear in `affiliate_click_events`.

## Tables wired from frontend
- `price_alert_subscriptions`: email capture forms.
- `affiliate_click_events`: affiliate click telemetry.
- `user_profiles`: auto-created on new auth user.
- `saved_products`: reserved for next feature.

## Security posture
- RLS is enabled on all tables.
- Anonymous inserts are allowed only for lead capture and click events.
- Read access remains restricted unless user-owned.
