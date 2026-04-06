/* app.js
   FocusFlow landing page interactions:
   - Mobile nav toggle
   - Sticky header (adds class after scroll)
   - Smooth scrolling for anchor links
   - Pricing toggle (monthly/yearly)
   - FAQ accordion (single-open)
   - Signup form validation + toast notifications
*/

(() => {
  "use strict";

  // -----------------------------
  // Helpers
  // -----------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function isValidEmail(email) {
    // Simple, practical email check (good enough for client-side validation)
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  }

  // Toast (non-blocking notifications)
  const toastEl = $("#toast");
  const toastMsgEl = $("#toastMessage");
  const toastCloseBtn = $("#toastClose");
  let toastTimer = null;

  function showToast(message, { duration = 3500 } = {}) {
    if (!toastEl || !toastMsgEl) return;

    toastMsgEl.textContent = message;
    toastEl.hidden = false;

    // Clear previous timer
    if (toastTimer) clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      hideToast();
    }, duration);
  }

  function hideToast() {
    if (!toastEl) return;
    toastEl.hidden = true;
  }

  if (toastCloseBtn) {
    toastCloseBtn.addEventListener("click", () => hideToast());
  }

  // -----------------------------
  // Mobile nav toggle - Hamburger menu
  // -----------------------------
  const navToggle = $("#navToggle");
  const siteNav = $("#siteNav");

  function setNavOpen(isOpen) {
    if (!navToggle || !siteNav) return;

    navToggle.setAttribute("aria-expanded", String(isOpen));
    siteNav.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("nav-open", isOpen);
  }
 
  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      setNavOpen(!expanded);
    });

    // Close nav when clicking a link (mobile UX)
    $$(".nav-link", siteNav).forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });

    // Close nav on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setNavOpen(false);
    });
  }

  // Close nav when clicking outside menu
  document.addEventListener("click", (event) => {
    const nav = document.getElementById("siteNav");
    const toggle = document.getElementById("navToggle");

    if (!nav.classList.contains("is-open")) return;

    if (!nav.contains(event.target) && !toggle.contains(event.target)) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

    // Close nav when pressing Escape
  document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const nav = document.getElementById("siteNav");
    const toggle = document.getElementById("navToggle");

    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }
});

  // -----------------------------
  // Sticky header on scroll
  // -----------------------------
  const headerEl = $("#siteHeader");
  const STICKY_THRESHOLD = 80;

  function onScroll() {
    if (!headerEl) return;
    const isSticky = window.scrollY > STICKY_THRESHOLD;
    headerEl.classList.toggle("is-sticky", isSticky);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // -----------------------------
  // Smooth scroll for internal anchors
  // -----------------------------
  // Note: Many browsers support CSS scroll-behavior, but we implement JS to ensure offset for sticky header.
  function smoothScrollToId(id) {
    const target = document.getElementById(id);
    if (!target) return;

    const headerHeight = headerEl ? headerEl.offsetHeight : 0;
    const targetTop = target.getBoundingClientRect().top + window.pageYOffset;
    const offsetTop = Math.max(0, targetTop - headerHeight - 12); // small breathing room

    window.scrollTo({
      top: offsetTop,
      behavior: "smooth",
    });
  }

  $$('a[href^="#"]').forEach((a) => {
    const href = a.getAttribute("href");
    if (!href || href === "#" || href === "#top") return;

    const id = href.slice(1);
    a.addEventListener("click", (e) => {
      console.log("Clicked link:", href);
      console.log("Target id exists?", document.getElementById(id));
      
      // Only handle if element exists
      if (document.getElementById(id)) {
        e.preventDefault();
        console.log("Calling smoothScrollToId with:", id);
        smoothScrollToId(id);
      }
    });
  });

  // -----------------------------
  // Pricing toggle: monthly/yearly
  // -----------------------------
  const billingToggle = $("#billingToggle");
  const saveBadge = $("#saveBadge");
  const proNote = $("#proBilledNote");
  const teamNote = $("#teamBilledNote");
  const priceEls = $$("[data-plan]");
    
  // Monthly base prices
  const pricing = {
    starter: { monthly: 0, yearly: 0 }, // keep free
    pro: { monthly: 9, yearly: 86 },    // yearly total (approx: 9*12*0.8 = 86.4)
    team: { monthly: 19, yearly: 182 }, // yearly total (19*12*0.8 = 182.4)
  };

  // Whether to display yearly as total/year or as "per month billed yearly"
  // Here we show total per year for yearly mode and update the term label.
  const termEls = $$(".price-term");
  const currencyEls = $$(".price-currency");

  let isYearly = false;

  function setBillingMode(yearly) {
    isYearly = yearly;

    if (billingToggle) billingToggle.setAttribute("aria-checked", String(isYearly));
    /* if (saveBadge) saveBadge.hidden = !isYearly; */
    if (saveBadge) saveBadge.classList.toggle("visible", isYearly)

    // Update price values
    priceEls.forEach((el) => {
      const plan = el.getAttribute("data-plan");
      if (!plan || !pricing[plan]) return;

      if (isYearly) {
        // Display total per year
        el.textContent = String(pricing[plan].yearly);
      } else {
        // Display monthly
        el.textContent = String(pricing[plan].monthly);
      }
    });

    // Update term labels
    termEls.forEach((t) => {
      t.textContent = isYearly ? "/yr" : "/mo";
    });

    // Update notes for Pro/Team
    if (proNote) proNote.textContent = isYearly ? "Billed yearly (20% off)" : "Billed monthly";
    if (teamNote) teamNote.textContent = isYearly ? "Billed yearly (20% off)" : "Billed monthly";
  }

  if (billingToggle) {
    billingToggle.addEventListener("click", () => {
      setBillingMode(!isYearly);
    });
  }

  // Initialize
  setBillingMode(false);

  // -----------------------------
  // FAQ Accordion (single open)
  // -----------------------------
  const accordion = $("#faqAccordion");
  if (accordion) {
    const items = $$(".accordion-item", accordion);

    function closeAll(exceptItem = null) {
      items.forEach((item) => {
        if (item === exceptItem) return;

        const trigger = $(".accordion-trigger", item);
        const panel = $(".accordion-panel", item);
        if (!trigger || !panel) return;

        trigger.setAttribute("aria-expanded", "false");
        panel.hidden = true;
      });
    }

    items.forEach((item) => {
      const trigger = $(".accordion-trigger", item);
      const panel = $(".accordion-panel", item);
      if (!trigger || !panel) return;

      trigger.addEventListener("click", () => {
        const expanded = trigger.getAttribute("aria-expanded") === "true";

        if (expanded) {
          trigger.setAttribute("aria-expanded", "false");
          panel.hidden = true;
        } else {
          closeAll(item);
          trigger.setAttribute("aria-expanded", "true");
          panel.hidden = false;
        }
      });
    });
  }

  // -----------------------------
  // Signup form validation + toast
  // -----------------------------
  const signupForm = $("#signupForm");
  const emailInput = $("#email");

  if (signupForm && emailInput) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = emailInput.value.trim();

      if (!email) {
        showToast("Please enter your email to start the trial.");
        emailInput.focus();
        return;
      }

      if (!isValidEmail(email)) {
        showToast("That email doesn’t look right. Please check and try again.");
        emailInput.focus();
        return;
      }

      // Simulate success
      showToast("You’re in! Check your inbox for the welcome link.");
      signupForm.reset();
    });
  }

  // -----------------------------
  // Nice-to-have: close toast on Escape
  // -----------------------------
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideToast();
  });
})();