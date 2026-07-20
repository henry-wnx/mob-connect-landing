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

  /* --- Press credibility line (brief §5.6 / §10 open item #2 — GATED) --
     Do NOT enable until old-site press quotes are verified as real and
     about Ituran. When verified, set PRESS_CREDIT_ENABLED = true. ------ */
  PRESS_CREDIT_ENABLED: false,
  PRESS_CREDIT_TEXT: "As covered by Barron's and AutoBlog.",

  /* --- Press page article feed (brief §10 open item #2 — GATED) --------
     The old site's press.html carried these quotes/links. Per §10 they are
     UNVERIFIED — provenance (real, and about Ituran) must be confirmed
     before publishing. Until PRESS_ARTICLES_ENABLED = true, press.html
     renders a neutral "coverage being compiled" state and NONE of these
     render. When each item is verified, flip the flag to true. Do not add
     any quote here that has not been confirmed real. ------------------- */
  PRESS_ARTICLES_ENABLED: false,
  PRESS_ARTICLES: [
    { outlet: "Barron's", featured: true, headline: "This Small-Cap Is Stopping Car Theft.", blurb: "Coverage of Ituran's expansion into new markets and the launch of the IturanMob platform.", url: "" },
    { outlet: "The Weekend Drive", headline: "Small Rental Fleets Have Been Stuck In The Stone Age. Ituran Says That's About To End.", blurb: "How IturanMob is democratizing technology previously available only to the largest fleets.", url: "" },
    { outlet: "AutoBlog", headline: "How Ituran's tech is changing the math on stolen vehicle recovery", blurb: "The shift from passive tracking to active prevention and recovery.", url: "" }
  ],

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
