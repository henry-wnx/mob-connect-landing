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

    /* ---------- Lead modal (brief §7 — shared by demo / pilot / full-solution) ----------
       One modal, one form. The opening CTA sets the hidden lead_type, the
       title/intro/submit label, and (Turo section) a use_case pre-fill. */
    var modal = document.getElementById("leadModal");
    var form = document.getElementById("leadForm");
    var lastFocused = null;

    var MODAL_PRESETS = {
      "demo": {
        title: "Book a demo",
        intro: "Tell us where to reach you. A sales rep will follow up within 24 hours, or book a slot on the next screen.",
        button: "Request demo"
      },
      "pilot": {
        title: "Start your pilot",
        intro: "Tell us where to reach you, then continue straight to the order page.",
        button: "Continue to order"
      },
      "full-solution": {
        title: "Schedule a meeting",
        intro: "Tell us where to reach you. We'll reach out to scope your project.",
        button: "Schedule a meeting"
      }
    };

    function openModal(leadType, useCase) {
      var preset = MODAL_PRESETS[leadType] || MODAL_PRESETS.demo;
      document.getElementById("leadModalTitle").textContent = preset.title;
      document.getElementById("leadModalIntro").textContent = preset.intro;
      document.getElementById("leadSubmitBtn").textContent = preset.button;
      form.lead_type.value = leadType;
      if (useCase) form.use_case.value = useCase; // pre-fill from tagged sections (e.g. Turo)
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

    /* ---------- Lead form submit (brief §7) ----------
       Mandatory: Name + Phone. Optional: email (format-checked only when
       filled), fleet size, use case. Flow branches on lead_type. */
    function setInvalid(field, bad) {
      var wrap = field.closest(".form-field");
      if (wrap) wrap.classList.toggle("invalid", bad);
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      // form.name is the form's own name attribute, so fields are fetched via elements.
      var name = form.elements.namedItem("name");
      var phone = form.elements.namedItem("phone");
      var email = form.elements.namedItem("email");

      var nameOk = !!name.value.trim();
      var phoneOk = (phone.value.replace(/\D/g, "").length >= 7);
      var emailOk = !email.value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      setInvalid(name, !nameOk);
      setInvalid(phone, !phoneOk);
      setInvalid(email, !emailOk);
      if (!nameOk || !phoneOk || !emailOk) return;

      var lead = {
        name: name.value.trim(),
        phone: phone.value.trim(),
        email: email.value.trim(),
        fleet_size: form.fleet_size.value,
        use_case: form.use_case.value,
        lead_type: form.lead_type.value,
        source: "mob-connect-landing"
      };

      var SUBMIT_EVENTS = { "demo": "demo_form_submit", "pilot": "pilot_form_submit", "full-solution": "fullsolution_form_submit" };
      track(SUBMIT_EVENTS[lead.lead_type] || "demo_form_submit", {
        lead_type: lead.lead_type, fleet_size: lead.fleet_size, use_case: lead.use_case
      });

      submitLead(lead).then(function () {
        if (lead.lead_type === "pilot") {
          // Checkout pre-fill handoff (brief §7 modal 2): first-party cookie
          // scoped to .ituranmobusa.com. NEVER in the redirect URL. On
          // github.io the hostname can't set that cookie: skip silently.
          setHandoffCookie(lead);
          window.location.href = CFG.ORDER_URL; // same tab, per brief
        } else if (lead.lead_type === "full-solution") {
          window.location.href = "thank-you.html?variant=full-solution";
        } else {
          window.location.href = "thank-you.html";
        }
      });
    });

    /* ---------- Cookie handoff (brief §7 — pilot flow only) ---------- */
    function setHandoffCookie(lead) {
      var h = window.location.hostname;
      var onDomain = (h === "ituranmobusa.com") || /\.ituranmobusa\.com$/.test(h);
      if (!onDomain) return; // github.io etc: skip silently, still redirect
      var payload = {
        name: lead.name, phone: lead.phone, email: lead.email,
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
