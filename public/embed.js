/**
 * WHY THIS FILE EXISTS
 * -------------------
 * The embed script that customers paste into their website. This is a self-contained
 * IIFE that:
 *  1. Reads the bot configuration from the script tag's `data-*` attributes
 *  2. Creates a floating chat button in the bottom-right corner
 *  3. Opens an iframe containing the chat widget when clicked
 *  4. Handles opening/closing, mobile responsiveness, and accessibility
 *
 * This file is served as a static asset from /public/embed.js. It has NO
 * dependencies — no React, no build tools, no bundler. It's vanilla JS that
 * works in any browser.
 *
 * Usage on customer website:
 * ```html
 * <script
 *   src="https://supportiq.app/embed.js"
 *   data-bot-id="YOUR_BOT_PUBLIC_ID"
 *   data-position="bottom-right"
 *   data-theme="light"
 * ></script>
 * ```
 */
(function () {
  "use strict";

  // Prevent double-initialization
  if (window.__supportIQInitialized) return;
  window.__supportIQInitialized = true;

  // Read config from script tag
  const scriptTag = document.currentScript;
  const botId = scriptTag?.getAttribute("data-bot-id");
  const position = scriptTag?.getAttribute("data-position") || "bottom-right";
  const theme = scriptTag?.getAttribute("data-theme") || "light";

  if (!botId) {
    console.error("[SupportIQ] data-bot-id attribute is required");
    return;
  }

  // Determine base URL from the script src
  const scriptSrc = scriptTag?.src || "";
  const baseUrl = new URL(scriptSrc).origin;

  let isOpen = false;
  let iframe = null;
  let button = null;
  let container = null;

  function createStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .supportiq-container {
        position: fixed;
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ${position.includes("right") ? "right: 16px;" : "left: 16px;"}
        ${position.includes("bottom") ? "bottom: 16px;" : "top: 16px;"}
      }

      .supportiq-button {
        width: 56px;
        height: 56px;
        border-radius: 28px;
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .supportiq-button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(79, 70, 229, 0.5);
      }

      .supportiq-button:focus-visible {
        outline: 2px solid #6366f1;
        outline-offset: 2px;
      }

      .supportiq-button svg {
        width: 24px;
        height: 24px;
        fill: white;
        transition: transform 0.2s;
      }

      .supportiq-button.open svg {
        transform: rotate(45deg);
      }

      .supportiq-iframe {
        position: absolute;
        ${position.includes("right") ? "right: 0;" : "left: 0;"}
        ${position.includes("bottom") ? "bottom: 72px;" : "top: 72px;"}
        width: 380px;
        height: 560px;
        max-width: calc(100vw - 32px);
        max-height: calc(100vh - 120px);
        border: none;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        background: white;
        opacity: 0;
        transform: translateY(12px) scale(0.95);
        pointer-events: none;
        transition: opacity 0.2s, transform 0.2s;
      }

      .supportiq-iframe.visible {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: all;
      }

      @media (max-width: 480px) {
        .supportiq-iframe {
          width: calc(100vw - 16px);
          height: calc(100vh - 100px);
          right: 8px;
          left: 8px;
          bottom: 72px;
          border-radius: 12px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function toggleChat() {
    isOpen = !isOpen;

    if (isOpen) {
      // Create iframe on first open
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.className = "supportiq-iframe";
        iframe.title = "SupportIQ Chat";
        iframe.allow = "clipboard-write";
        iframe.src = `${baseUrl}/embed/chat?botId=${botId}&theme=${theme}`;
        container.appendChild(iframe);
      }

      requestAnimationFrame(() => {
        iframe.classList.add("visible");
      });

      button.classList.add("open");
      button.setAttribute("aria-label", "Close chat");
    } else {
      iframe?.classList.remove("visible");
      button.classList.remove("open");
      button.setAttribute("aria-label", "Open chat");
    }
  }

  function init() {
    createStyles();

    // Create container
    container = document.createElement("div");
    container.className = "supportiq-container";

    // Create button
    button = document.createElement("button");
    button.className = "supportiq-button";
    button.setAttribute("aria-label", "Open chat");
    button.setAttribute("type", "button");
    button.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" fill="white"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" fill="white"/></svg>`;
    button.addEventListener("click", toggleChat);

    // Keyboard support
    button.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleChat();
      }
      if (e.key === "Escape" && isOpen) {
        toggleChat();
      }
    });

    container.appendChild(button);
    document.body.appendChild(container);
  }

  // Wait for DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
