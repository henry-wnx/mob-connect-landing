/* ============================================================
   config.js — single source for pending / gated / data-driven values
   Everything the brief flags as "pending", "gated", or "swap later"
   lives here so the change is one line, no layout rework.
   ============================================================ */

window.MOBCONNECT_CONFIG = {

  /* --- Demo form CRM target (brief §7, §10 open item #1) ---------------
     CRM destination is UNCONFIRMED. Zoho CRM is available but the target
     module (Leads?) and field mapping are not confirmed. Until then the
     form POSTs to this documented STUB endpoint. Do NOT guess Zoho fields.
     When confirmed: set CRM_ENDPOINT to the real intake URL and map fields
     in script.js submitDemoForm(). ------------------------------------- */
  CRM_ENDPOINT: "/api/lead-stub",        // STUB — not a live endpoint
  CRM_ENABLED: false,                    // false => form skips network call, still redirects to thank-you

  /* --- Calendly (brief §7 — PENDING, user to provide) -----------------
     Leave empty until the real scheduling URL is supplied. Empty string
     => thank-you page renders confirmation + mailto fallback only, and the
     Calendly embed stays hidden. Dropping in the URL is the only change. */
  CALENDLY_URL: "",                      // e.g. "https://calendly.com/ituranmob/demo"

  /* --- Canonical site URL (GitHub Pages for now) -----------------------
     Single source for the deploy origin. NOTE: the og:url / og:image tags
     in index.html are hardcoded (crawlers don't execute JS) — if this
     changes, update those tags to match. ------------------------------- */
  SITE_URL: "https://henry-wnx.github.io/mob-connect-landing/",

  /* --- Contact --------------------------------------------------------- */
  SALES_EMAIL: "salesmob@ituranusa.com",

  /* --- Direct order destination (brief §5.7 secondary flow) ------------ */
  ORDER_URL: "https://order.ituranmobusa.com/mob-connect",

  /* --- Trusted-by logo strip (brief §5.5 — data-driven, removable) -----
     Fleet operators only. Sixt / Movida / 99 / DiDi. Adding/removing a
     logo is a one-line change here. To remove the whole strip, delete the
     <section id="trusted"> block in index.html — it is self-contained. -- */
  CUSTOMER_LOGOS: [
    { name: "Sixt",   file: "assets/logos/sixt.png" },
    { name: "Movida", file: "assets/logos/movida.png" },
    { name: "99",     file: "assets/logos/99.png" },
    { name: "DiDi",   file: "assets/logos/didi.png" }
  ],

  /* --- Testimonial (brief §5.5) — none exists yet. Leave null; slot
     stays hidden. Drop a real quote in to render it, no layout rework. -- */
  TESTIMONIAL: null,                     // e.g. { quote: "...", cite: "Name, Role, Company" }

  /* --- Analytics (brief §7) -------------------------------------------
     Instrumentation choice = GA4 (dev's call, flagged in handoff). No
     Measurement ID yet — set GA4_ID to enable real gtag; until then
     track() logs to console + window.dataLayer so events are verifiable. */
  GA4_ID: ""                             // e.g. "G-XXXXXXXXXX"
};
