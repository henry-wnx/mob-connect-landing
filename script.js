/* ============================================================
   script.js — mob-connect landing behavior
   Depends on config.js (window.MOBCONNECT_CONFIG).
   ============================================================ */

(function () {
  "use strict";
  var CFG = window.MOBCONNECT_CONFIG || {};

  /* ---------- Analytics (GA4-style, brief §7) --------------------------
     Pushes to window.dataLayer and, if a GA4 ID is configured, gtag().
     Until GA4_ID is set, events still log to the console so they are
     verifiable in dev. Instrumentation choice = GA4 (flagged in handoff). */
  window.dataLayer = window.dataLayer || [];
  function track(event, params) {
    var payload = Object.assign({ event: event }, params || {});
    window.dataLayer.push(payload);
    if (CFG.GA4_ID && typeof window.gtag === "function") {
      window.gtag("event", event, params || {});
    }
    if (window.console && console.debug) console.debug("[analytics]", payload);
  }

  document.addEventListener("DOMContentLoaded", function () {

    /* ---------- Mobile nav toggle ---------- */
    var toggle = document.querySelector(".mobile-toggle");
    var navMenu = document.getElementById("navMenu");
    if (toggle && navMenu) {
      toggle.addEventListener("click", function () {
        var open = navMenu.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      navMenu.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          navMenu.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    /* ---------- Trusted-by logos (data-driven, brief §5.5) ---------- */
    var logoWrap = document.getElementById("trustedLogos");
    if (logoWrap && Array.isArray(CFG.CUSTOMER_LOGOS)) {
      CFG.CUSTOMER_LOGOS.forEach(function (logo) {
        var img = document.createElement("img");
        img.src = logo.file;
        img.alt = logo.name;
        img.loading = "lazy";
        logoWrap.appendChild(img);
      });
    }

    /* ---------- Testimonial slot (renders only if a real quote exists) ---------- */
    var t = CFG.TESTIMONIAL;
    if (t && t.quote) {
      var slot = document.getElementById("testimonialSlot");
      document.getElementById("testimonialQuote").textContent = "“" + t.quote + "”";
      document.getElementById("testimonialCite").textContent = t.cite || "";
      if (slot) slot.hidden = false;
    }

    /* ---------- Porsche Cup trust video (brief §5.6) ----------
       Click-to-play only: film has sound, so no autoplay. preload="none"
       keeps the 14MB file off the initial pageload. Controls appear
       after start; analytics fires once on first play. */
    var porscheVideo = document.getElementById("porscheVideo");
    var porschePlay = document.getElementById("porschePlay");
    if (porscheVideo && porschePlay) {
      var porscheTracked = false;
      porschePlay.addEventListener("click", function () {
        porschePlay.hidden = true;
        porscheVideo.setAttribute("controls", "");
        porscheVideo.play();
      });
      porscheVideo.addEventListener("play", function () {
        if (!porscheTracked) {
          porscheTracked = true;
          track("porsche_video_play");
        }
      });
    }

    /* ---------- FAQ accordion (expand on click) ---------- */
    document.querySelectorAll(".faq-question").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".faq-item");
        var answer = item.querySelector(".faq-answer");
        var isOpen = item.classList.contains("active");
        // close all
        document.querySelectorAll(".faq-item").forEach(function (i) {
          i.classList.remove("active");
          i.querySelector(".faq-answer").style.maxHeight = null;
          i.querySelector(".faq-question").setAttribute("aria-expanded", "false");
        });
        if (!isOpen) {
          item.classList.add("active");
          answer.style.maxHeight = answer.scrollHeight + "px";
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });

    /* ---------- Callback modal (brief §7 MVP callback model) ----------
       One shared modal for every CTA: the lead picks when sales calls
       them. The opening CTA sets the hidden lead_type, the title/intro,
       and (Turo section) a hidden use_case pre-tag. CTA labels stay
       unchanged; only the behavior converges here. */
    var modal = document.getElementById("leadModal");
    var form = document.getElementById("leadForm");
    var lastFocused = null;

    var MODAL_PRESETS = {
      "demo": {
        title: "Book a demo",
        intro: "Tell us when to call you. The demo takes 15 minutes."
      },
      "pilot": {
        title: "Start your pilot",
        intro: "Tell us when to call you. We'll set up your pilot on that call."
      },
      "full-solution": {
        title: "Schedule a meeting",
        intro: "Tell us when to call you. We'll scope your project on that call."
      }
    };

    /* Best-time-to-call date: native date input, min = tomorrow (local). */
    function localISODate(d) {
      return d.getFullYear() + "-" +
        String(d.getMonth() + 1).padStart(2, "0") + "-" +
        String(d.getDate()).padStart(2, "0");
    }
    function minCallDate() {
      var t = new Date();
      t.setDate(t.getDate() + 1);
      return localISODate(t);
    }

    /* Timezone auto-detect (brief §7): browser IANA zone mapped to
       ET/CT/MT/PT when possible; anything unmapped falls back to "other".
       Always editable by the user. */
    var TZ_MAP = {
      "America/New_York": "ET", "America/Detroit": "ET", "America/Toronto": "ET",
      "America/Montreal": "ET", "America/Indiana/Indianapolis": "ET", "America/Kentucky/Louisville": "ET",
      "America/Chicago": "CT", "America/Winnipeg": "CT",
      "America/Denver": "MT", "America/Edmonton": "MT", "America/Boise": "MT", "America/Phoenix": "MT",
      "America/Los_Angeles": "PT", "America/Vancouver": "PT", "America/Tijuana": "PT"
    };
    function detectTimezone() {
      try {
        var iana = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        return TZ_MAP[iana] || "other";
      } catch (err) {
        return "other";
      }
    }

    function openModal(leadType, useCase) {
      var preset = MODAL_PRESETS[leadType] || MODAL_PRESETS.demo;
      document.getElementById("leadModalTitle").textContent = preset.title;
      document.getElementById("leadModalIntro").textContent = preset.intro;
      form.lead_type.value = leadType;
      form.use_case.value = useCase || ""; // hidden pre-tag from tagged sections (e.g. Turo)
      document.getElementById("lf-date").min = minCallDate();
      if (!form.call_timezone.value) form.call_timezone.value = detectTimezone();
      lastFocused = document.activeElement;
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
      var first = modal.querySelector("input:not([type=hidden]), select, button");
      if (first) first.focus();
      track("modal_open", { lead_type: leadType });
    }
    function closeModal() {
      modal.classList.remove("active");
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    }

    document.querySelectorAll("[data-demo-cta]").forEach(function (el) {
      el.addEventListener("click", function (e) { e.preventDefault(); openModal("demo"); });
    });
    document.querySelectorAll("[data-pilot-cta]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        openModal("pilot", el.getAttribute("data-use-case") || "");
      });
    });
    document.querySelectorAll("[data-fullsolution-cta]").forEach(function (el) {
      el.addEventListener("click", function (e) { e.preventDefault(); openModal("full-solution"); });
    });
    modal.querySelectorAll("[data-close-modal]").forEach(function (el) {
      el.addEventListener("click", closeModal);
    });
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("active")) closeModal();
    });

    /* ---------- Callback form submit (brief §7 MVP callback model) ----------
       Mandatory: Name, Phone, Best time to call (date >= tomorrow, time
       window, timezone). Optional: company, fleet size, notes. All lead
       types share one flow: POST -> sessionStorage slot -> thank-you. */
    function setInvalid(field, bad) {
      var wrap = field.closest(".form-field");
      if (wrap) wrap.classList.toggle("invalid", bad);
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      // form.name is the form's own name attribute, so fields are fetched via elements.
      var name = form.elements.namedItem("name");
      var phone = form.elements.namedItem("phone");
      var date = form.elements.namedItem("call_date");
      var windowSel = form.elements.namedItem("call_window");
      var tz = form.elements.namedItem("call_timezone");

      var nameOk = !!name.value.trim();
      var phoneOk = (phone.value.replace(/\D/g, "").length >= 7);
      var dateOk = !!date.value && date.value >= minCallDate(); // ISO dates compare lexicographically
      var windowOk = !!windowSel.value;
      var tzOk = !!tz.value;
      setInvalid(name, !nameOk);
      setInvalid(phone, !phoneOk);
      setInvalid(date, !dateOk);
      setInvalid(windowSel, !windowOk);
      setInvalid(tz, !tzOk);
      if (!nameOk || !phoneOk || !dateOk || !windowOk || !tzOk) return;

      var lead = {
        name: name.value.trim(),
        phone: phone.value.trim(),
        call_date: date.value,
        call_window: windowSel.value,
        call_timezone: tz.value,
        company: form.company.value.trim(),
        fleet_size: form.fleet_size.value,
        notes: form.notes.value.trim(),
        use_case: form.use_case.value,
        lead_type: form.lead_type.value,
        source: "mob-connect-landing"
      };

      track("callback_request_submit", {
        lead_type: lead.lead_type, fleet_size: lead.fleet_size, use_case: lead.use_case,
        call_window: lead.call_window, call_timezone: lead.call_timezone
      });

      submitLead(lead).then(function () {
        /* ---- DORMANT: phase-2 order flow (brief §7 MVP callback model).
           Do NOT delete. Re-enable via ORDER_FLOW_ENABLED in config.js:
           pilot leads then get the cookie handoff + order-page redirect. */
        if (CFG.ORDER_FLOW_ENABLED && lead.lead_type === "pilot") {
          setHandoffCookie(lead);
          window.location.href = CFG.ORDER_URL; // same tab, per brief
          return;
        }
        // Callback slot for the thank-you message: same-origin
        // sessionStorage, NEVER URL params (no personal data in query strings).
        try {
          sessionStorage.setItem("mobconnect_callback", JSON.stringify({
            date: lead.call_date, window: lead.call_window, timezone: lead.call_timezone
          }));
        } catch (err) { /* private mode etc: thank-you falls back to generic copy */ }
        window.location.href = "thank-you.html";
      });
    });

    /* ---------- Cookie handoff — DORMANT, phase 2 (brief §7) ----------
       Do NOT delete. Gated behind CFG.ORDER_FLOW_ENABLED above. When the
       order flow returns: first-party cookie scoped to .ituranmobusa.com,
       read by order.ituranmobusa.com to pre-populate checkout. Only set
       when served from an ituranmobusa.com hostname; skipped silently
       elsewhere. Fields NEVER go in the redirect URL. ------------------- */
    function setHandoffCookie(lead) {
      var h = window.location.hostname;
      var onDomain = (h === "ituranmobusa.com") || /\.ituranmobusa\.com$/.test(h);
      if (!onDomain) return;
      var payload = {
        name: lead.name, phone: lead.phone,
        fleet_size: lead.fleet_size, use_case: lead.use_case
      };
      document.cookie = "mobconnect_lead=" + encodeURIComponent(JSON.stringify(payload)) +
        "; domain=.ituranmobusa.com; path=/; max-age=1800; secure; samesite=lax";
    }

    /* ---------- Lead submission (brief §7 — phase 1 form backend) ----------
       Formspree-style JSON POST to CFG.FORM_ENDPOINT. While the endpoint is
       the empty placeholder, log to console and still proceed with the UX
       flow (redirect / thank-you) so nothing breaks. Never block the user:
       network failures also proceed (lead loss beats flow breakage). ------ */
    function submitLead(lead) {
      if (!CFG.FORM_ENDPOINT) {
        if (window.console) console.info("[lead] FORM_ENDPOINT not configured. Lead captured locally only:", lead);
        return Promise.resolve();
      }
      return fetch(CFG.FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(lead)
      }).then(function (r) {
        if (!r.ok) throw new Error("Form POST failed: " + r.status);
      }).catch(function (err) {
        if (window.console) console.warn("[lead] submission failed, continuing:", err);
      });
    }

  });
})();
