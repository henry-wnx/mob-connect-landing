/* ============================================================
   config.js — single source for pending / gated / data-driven values
   Everything the brief flags as "pending", "gated", or "swap later"
   lives here so the change is one line, no layout rework.
   ============================================================ */

window.MOBCONNECT_CONFIG = {

  /* --- Lead form endpoint (brief §7 — phase 1, no Zoho) ----------------
     LIVE (2026-07-21): Formspree free tier. Submissions are emailed to
     salesmob@ituranusa.com (Formspree notification setting) AND stored
     in Formspree's exportable submissions table (50/mo on free tier;
     upgrade when volume demands). POST format: JSON body with an
     "Accept: application/json" header so Formspree answers JSON and
     script.js can detect success vs. failure. On failure the modal
     shows an inline error + mailto (lead never lost silently) and
     fires callback_request_error.
     Zoho integration = phase 2: swap this endpoint, page untouched. ---- */
  FORM_ENDPOINT: "https://formspree.io/f/mrenljpb",

  /* --- Calendly — PHASE 2, dormant (brief §7 MVP callback model) -------
     The MVP is callback-only: no Calendly on the thank-you page. The
     embed scaffolding was removed from thank-you.html; if the callback
     model underperforms, restore it there and uncomment this constant. */
  // CALENDLY_URL: "",                   // PHASE 2 — e.g. "https://calendly.com/ituranmob/demo"

  /* --- Canonical site URL (custom domain LIVE, 2026-07-21) -------------
     Single source for the deploy origin: connect.ituranmobusa.com,
     served by GitHub Pages via the CNAME file in the repo root (DNS
     CNAME record -> henry-wnx.github.io). HTTPS enforced. The hardcoded
     og:url / og:image tags in index.html must stay in sync with this
     value (crawlers don't execute JS). ---------------------------------- */
  SITE_URL: "https://connect.ituranmobusa.com/",

  /* --- Contact --------------------------------------------------------- */
  SALES_EMAIL: "salesmob@ituranusa.com",

  /* --- Order flow — PHASE 2, dormant (brief §7 MVP callback model) -----
     The site is lead collection only at launch: NO CTA routes to the
     order page. Set ORDER_FLOW_ENABLED to true in phase 2 to restore the
     pilot flow's cookie handoff + redirect to ORDER_URL (code paths kept
     intact in script.js — do not delete them). ------------------------- */
  ORDER_FLOW_ENABLED: false,
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
