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

    /* ---------- Press credibility line (GATED, brief §5.6/§10) ---------- */
    if (CFG.PRESS_CREDIT_ENABLED && CFG.PRESS_CREDIT_TEXT) {
      var pc = document.getElementById("pressCredit");
      if (pc) { pc.textContent = CFG.PRESS_CREDIT_TEXT; pc.hidden = false; }
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

    /* ---------- Order CTAs (brief §5.7 secondary flow, same tab) ---------- */
    document.querySelectorAll("[data-order-cta]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        track("order_cta_click", { destination: CFG.ORDER_URL });
        window.location.href = CFG.ORDER_URL; // same tab, per brief
      });
    });

    /* ---------- Demo modal open/close (brief §7 Step 1) ---------- */
    var modal = document.getElementById("demoModal");
    var lastFocused = null;

    function openModal() {
      lastFocused = document.activeElement;
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
      var first = modal.querySelector("input, select, button");
      if (first) first.focus();
      track("demo_modal_open");
    }
    function closeModal() {
      modal.classList.remove("active");
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    }

    document.querySelectorAll("[data-demo-cta]").forEach(function (el) {
      el.addEventListener("click", function (e) { e.preventDefault(); openModal(); });
    });
    modal.querySelectorAll("[data-close-modal]").forEach(function (el) {
      el.addEventListener("click", closeModal);
    });
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("active")) closeModal();
    });

    /* ---------- Demo form submit (brief §7) ---------- */
    var form = document.getElementById("demoForm");
    function setInvalid(field, bad) {
      var wrap = field.closest(".form-field");
      if (wrap) wrap.classList.toggle("invalid", bad);
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = form.email;
      var fleet = form.fleet_size;
      var usecase = form.use_case;
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      var fleetOk = !!fleet.value;
      var caseOk = !!usecase.value;
      setInvalid(email, !emailOk);
      setInvalid(fleet, !fleetOk);
      setInvalid(usecase, !caseOk);
      if (!emailOk || !fleetOk || !caseOk) return;

      var lead = {
        email: email.value.trim(),
        phone: form.phone.value.trim(),
        fleet_size: fleet.value,
        use_case: usecase.value,
        source: "mob-connect-landing"
      };
      track("demo_form_submit", { fleet_size: lead.fleet_size, use_case: lead.use_case });
      submitLead(lead).then(function () {
        window.location.href = "thank-you.html";
      });
    });

    /* ---------- CRM submission ----------
       CRM destination UNCONFIRMED (brief §10 open item #1). Until Zoho
       module + field mapping is confirmed, we POST to a documented stub
       and never block the user: any failure still redirects to thank-you
       (sales also gets the low-intent lead via the two-step flow). ------ */
    function submitLead(lead) {
      if (!CFG.CRM_ENABLED || !CFG.CRM_ENDPOINT) {
        // Stub mode: log the payload shape a real CRM integration would receive.
        if (window.console) console.info("[CRM stub] lead captured (not sent):", lead);
        return Promise.resolve();
      }
      return fetch(CFG.CRM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead)
      }).then(function (r) {
        if (!r.ok) throw new Error("CRM POST failed: " + r.status);
      }).catch(function (err) {
        if (window.console) console.warn("[CRM] submission failed, continuing:", err);
        // Do not block the user — proceed to thank-you regardless.
      });
    }

  });
})();
