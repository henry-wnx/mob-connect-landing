/* ============================================================
   consent.js — region-scoped consent (brief §7 Consent & tracking
   compliance, 2026-07-22). Loaded synchronously in <head> on every
   page, AFTER the gtag bootstrap (it calls gtag on consent updates)
   and INSTEAD of an unconditional Meta pixel bootstrap.

   Model:
   - US and other non-Canadian visitors: opt-out model, exactly the
     pre-consent behavior. Meta pixel loads immediately, Google runs
     on its global granted default. No banner.
   - Canadian visitors (IANA timezone heuristic; Google additionally
     enforces its own region=CA denied default server-side): lean
     opt-in. Meta pixel deferred, slim banner asks Accept / Decline.
     Accept: gtag consent update to granted + Meta pixel loads.
     Decline: everything stays denied, Meta never loads.
   - Choice persists in localStorage ("mobconnect_consent") and is
     honored on every page and visit; the banner never re-shows.
   ============================================================ */
(function () {
  "use strict";

  var META_PIXEL_ID = "1625831645324162"; // keep in sync with config.js META_PIXEL_ID
  var CONSENT_KEY = "mobconnect_consent"; // "granted" | "denied"

  /* Canadian IANA zones (standard America/* Canadian set; browsers
     return canonical zones, legacy Canada/* aliases handled by prefix).
     Timezone is a heuristic: imperfect at borders, accepted for MVP. */
  var CA_ZONES = [
    "America/St_Johns", "America/Halifax", "America/Glace_Bay", "America/Moncton",
    "America/Goose_Bay", "America/Blanc-Sablon", "America/Toronto", "America/Montreal",
    "America/Nipigon", "America/Thunder_Bay", "America/Atikokan", "America/Iqaluit",
    "America/Pangnirtung", "America/Winnipeg", "America/Rainy_River", "America/Resolute",
    "America/Rankin_Inlet", "America/Regina", "America/Swift_Current", "America/Edmonton",
    "America/Cambridge_Bay", "America/Yellowknife", "America/Inuvik", "America/Creston",
    "America/Dawson_Creek", "America/Fort_Nelson", "America/Vancouver", "America/Whitehorse",
    "America/Dawson"
  ];

  function isLikelyCanada() {
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      return CA_ZONES.indexOf(tz) !== -1 || tz.indexOf("Canada/") === 0;
    } catch (err) {
      return false;
    }
  }

  function getChoice() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (err) { return null; }
  }
  function setChoice(v) {
    try { localStorage.setItem(CONSENT_KEY, v); } catch (err) { /* private mode: choice lasts the page */ }
  }

  /* Meta pixel bootstrap (standard snippet), invoked only when allowed.
     The noscript <img> fallback stays in each page's HTML: it cannot be
     consent-gated (no JS), accepted as negligible (noscript users). */
  function loadMetaPixel() {
    if (window.fbq) return; // already bootstrapped
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0";
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", META_PIXEL_ID);
    window.fbq("track", "PageView");
  }

  function grantGoogleConsent() {
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
        analytics_storage: "granted"
      });
    }
  }

  var choice = getChoice();
  var likelyCanada = isLikelyCanada();

  /* Load Meta immediately for: non-Canadian visitors without an explicit
     decline (today's opt-out behavior), and anyone with stored consent.
     A stored "denied" is honored everywhere, not only in Canada. */
  if (choice === "granted") {
    loadMetaPixel();
    grantGoogleConsent(); // overrides the region=CA denied default for consented Canadians
  } else if (!likelyCanada && choice !== "denied") {
    loadMetaPixel();
  }

  /* Banner: Canadian visitors with no stored choice only. Non-blocking. */
  if (likelyCanada && !choice) {
    document.addEventListener("DOMContentLoaded", function () {
      var banner = document.createElement("div");
      banner.className = "consent-banner";
      banner.id = "consentBanner";
      banner.setAttribute("role", "region");
      banner.setAttribute("aria-label", "Cookie consent");
      banner.innerHTML =
        '<p>We use cookies and similar technologies to measure our advertising. ' +
        'See our <a href="privacy.html">Privacy Policy</a> for details.</p>' +
        '<div class="consent-actions">' +
        '<button type="button" class="btn btn-primary" id="consentAccept">Accept</button>' +
        '<button type="button" class="btn btn-ghost-light" id="consentDecline">Decline</button>' +
        '</div>';
      document.body.appendChild(banner);

      document.getElementById("consentAccept").addEventListener("click", function () {
        setChoice("granted");
        grantGoogleConsent();
        loadMetaPixel();
        banner.remove();
      });
      document.getElementById("consentDecline").addEventListener("click", function () {
        setChoice("denied");
        // Google stays on the region=CA denied default; Meta never loads.
        banner.remove();
      });
    });
  }
})();
