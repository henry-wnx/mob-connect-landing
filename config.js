/* ============================================================
   config.js — single source for pending / gated / data-driven values
   Everything the brief flags as "pending", "gated", or "swap later"
   lives here so the change is one line, no layout rework.
   ============================================================ */

window.MOBCONNECT_CONFIG = {

  /* --- Lead form endpoint (brief §7 — phase 1, no Zoho) ----------------
     Form-backend service (Formspree, or Web3Forms if cost matters):
     submissions are emailed to SALES_EMAIL and stored in the service's
     exportable table. PLACEHOLDER until the user creates the form and
     pastes its POST URL here, e.g. "https://formspree.io/f/xxxxxxxx".
     Accepts a Formspree-style POST (JSON or form-encoded).
     While empty: script.js logs the lead to the console and the UX flow
     (redirect / thank-you) still proceeds, so nothing breaks.
     Zoho integration = phase 2: swap this endpoint, page untouched. ---- */
  FORM_ENDPOINT: "",                     // PLACEHOLDER — paste the Formspree/Web3Forms URL here

  /* --- Calendly (brief §7 — PENDING, user to provide) -----------------
     Leave empty until the real scheduling URL is supplied. Empty string
     => thank-you page renders confirmation + mailto fallback only, and the
     Calendly embed stays hidden. Dropping in the URL is the only change. */
  CALENDLY_URL: "",                      // e.g. "https://calendly.com/ituranmob/demo"

  /* --- Canonical site URL (GitHub Pages for now) -----------------------
     Single source for the deploy origin. Custom domain PENDING:
     connect.ituranmobusa.com (CNAME file is in the repo root; GitHub
     Pages will serve it once the user creates the DNS CNAME record ->
     henry-wnx.github.io; until then the github.io URL keeps working).
     When DNS is live: update this value AND the hardcoded og:url /
     og:image tags in index.html (crawlers don't execute JS). The
     .ituranmobusa.com cookie handoff in script.js activates on the new
     hostname automatically. ------------------------------------------- */
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
