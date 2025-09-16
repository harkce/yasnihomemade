// 🔧 EDIT THESE VALUES with your real details
const LINKS = {
  instagram: "https://instagram.com/yasni.homemade",
  whatsapp: "https://api.whatsapp.com/send?phone=37253956477",
};

const DATA = {
  wise: {
    label: "Wise",
    name: "Yasni Tya Insani",
    iban: "BE91967476698176",
    tagLabel: "Wisetag",
    tag: "@yasnityai",
  },
  revolut: {
    label: "Revolut",
    name: "Yasni Tya Insani",
    iban: "LT743250095189241828",
    tagLabel: "Revtag",
    tag: "@yasni95",
  },
  lhv: {
    label: "LHV",
    name: "Muhammad Habib Fikri Sundayana",
    iban: "EE177700771008621121",
  },
  swedbank: {
    label: "Swedbank",
    name: "Muhammad Habib Fikri Sundayana",
    iban: "EE842200221092040190",
  },
};

// Constants
const COPY_FEEDBACK_DURATION = 1200; // Cupertino recommended duration for success feedback
const REFERENCE_TEXT = "Food order";

// Reusable copy icon SVG
const COPY_ICON_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" 
       fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" 
       stroke-linejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
`;

// DOM Elements Cache
const elements = {
  sheet: document.getElementById("payment-sheet"),
  overlay: document.getElementById("overlay"),
  closeBtn: document.getElementById("close-btn"),
  name: document.getElementById("recipient-name"),
  iban: document.getElementById("recipient-iban"),
  reference: document.getElementById("recipient-reference"),
  tagField: document.getElementById("tag-field"),
  tagLabel: document.getElementById("tag-label"),
  tag: document.getElementById("recipient-tag"),
  title: document.getElementById("sheet-title"),
};

// Utility Functions
const utils = {
  showCopyFeedback(
    spanEl,
    message = "Copied!",
    duration = COPY_FEEDBACK_DURATION
  ) {
    const originalText = spanEl.textContent;
    spanEl.textContent = message;
    setTimeout(() => {
      spanEl.textContent = originalText;
    }, duration);
  },

  async copyToClipboard(text, spanEl) {
    try {
      await navigator.clipboard.writeText(text);
      this.showCopyFeedback(spanEl);
    } catch (err) {
      // Fallback for older browsers
      try {
        const range = document.createRange();
        const el = document.getElementById(
          spanEl.closest(".copy").getAttribute("data-copy")
        );
        range.selectNode(el);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        document.execCommand("copy");
        sel.removeAllRanges();
        this.showCopyFeedback(spanEl);
      } catch (e) {
        this.showCopyFeedback(spanEl, "Failed");
      }
    }
  },

  toggleAriaExpanded(targetKind) {
    document.querySelectorAll("[data-target]").forEach((btn) => {
      btn.setAttribute(
        "aria-expanded",
        btn.dataset.target === targetKind ? "true" : "false"
      );
    });
  },

  populateSheetData(data) {
    elements.name.textContent = data.name;
    elements.iban.textContent = data.iban;
    elements.reference.textContent = REFERENCE_TEXT;
    elements.title.textContent = `${data.label} – Details`;

    // Handle tag field visibility and content
    const hasTag = data.tag && data.tagLabel;
    elements.tagField.style.display = hasTag ? "block" : "none";

    if (hasTag) {
      elements.tagLabel.textContent = data.tagLabel;
      elements.tag.textContent = data.tag;
    }
  },
};

// Sheet Management
const sheetManager = {
  open(kind) {
    const data = DATA[kind];
    if (!data) return;

    utils.populateSheetData(data);

    elements.sheet.classList.add("show");
    elements.overlay.classList.add("show");

    utils.toggleAriaExpanded(kind);
    elements.closeBtn.focus();
  },

  close() {
    elements.sheet.classList.remove("show");
    elements.overlay.classList.remove("show");
    utils.toggleAriaExpanded(null);
  },
};

// Event Handlers
const eventHandlers = {
  initPaymentButtons() {
    document.querySelectorAll("[data-target]").forEach((btn) => {
      btn.addEventListener("click", () =>
        sheetManager.open(btn.dataset.target)
      );
    });
  },

  initSheetControls() {
    elements.overlay.addEventListener("click", sheetManager.close);
    elements.closeBtn.addEventListener("click", sheetManager.close);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") sheetManager.close();
    });
  },

  initCopyButtons() {
    document.querySelectorAll(".copy").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const targetId = btn.getAttribute("data-copy");
        const targetEl = document.getElementById(targetId);
        if (!targetEl) return;

        const value = targetEl.textContent.trim();
        const spanEl = btn.querySelector("span");

        await utils.copyToClipboard(value, spanEl);
      });
    });
  },

  initSocialLinks() {
    const socialLinks = {
      ig: document.getElementById("btn-ig"),
      wa: document.getElementById("btn-wa"),
    };

    if (LINKS.instagram && LINKS.instagram !== "#") {
      socialLinks.ig.href = LINKS.instagram;
    }
    if (LINKS.whatsapp && LINKS.whatsapp !== "#") {
      socialLinks.wa.href = LINKS.whatsapp;
    }
  },
};

// Initialize Application
function init() {
  eventHandlers.initPaymentButtons();
  eventHandlers.initSheetControls();
  eventHandlers.initCopyButtons();
  eventHandlers.initSocialLinks();
}

// Start the application
init();
