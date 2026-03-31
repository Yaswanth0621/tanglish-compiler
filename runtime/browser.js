/**
 * TanglishScript Browser Runtime
 * Provides helper functions available to compiled TanglishScript apps in the browser.
 */

(function (global) {
  'use strict';

  const TanglishRuntime = {
    version: '1.0.0',

    // ─── DOM Helpers ────────────────────────────────────────────────────────────

    /**
     * Select an element by ID, class, or CSS selector.
     * Usage: T.get('#myId') or T.get('.myClass')
     */
    get(selector) {
      return document.querySelector(selector);
    },

    getAll(selector) {
      return Array.from(document.querySelectorAll(selector));
    },

    /**
     * Create an element dynamically
     * T.create('div', { class: 'box', text: 'Hello' })
     */
    create(tag, options = {}) {
      const el = document.createElement(tag);
      if (options.class) el.className = options.class;
      if (options.id) el.id = options.id;
      if (options.text) el.textContent = options.text;
      if (options.html) el.innerHTML = options.html;
      if (options.style) Object.assign(el.style, options.style);
      if (options.on) {
        Object.entries(options.on).forEach(([evt, fn]) => el.addEventListener(evt, fn));
      }
      return el;
    },

    /**
     * Append a child element to a parent
     */
    append(parentSelector, child) {
      const parent = typeof parentSelector === 'string'
        ? document.querySelector(parentSelector)
        : parentSelector;
      if (parent && child) parent.appendChild(child);
    },

    /**
     * Set text content of an element
     */
    setText(selector, text) {
      const el = document.querySelector(selector);
      if (el) el.textContent = text;
    },

    /**
     * Get text content of an element
     */
    getText(selector) {
      const el = document.querySelector(selector);
      return el ? el.textContent : '';
    },

    /**
     * Get/set value of an input element
     */
    val(selector, value) {
      const el = document.querySelector(selector);
      if (!el) return '';
      if (value !== undefined) el.value = value;
      else return el.value;
    },

    /**
     * Show or hide an element
     */
    show(selector) {
      const el = document.querySelector(selector);
      if (el) el.style.display = '';
    },

    hide(selector) {
      const el = document.querySelector(selector);
      if (el) el.style.display = 'none';
    },

    toggle(selector) {
      const el = document.querySelector(selector);
      if (el) el.style.display = el.style.display === 'none' ? '' : 'none';
    },

    /**
     * Add/remove CSS classes
     */
    addClass(selector, cls) {
      const el = document.querySelector(selector);
      if (el) el.classList.add(cls);
    },

    removeClass(selector, cls) {
      const el = document.querySelector(selector);
      if (el) el.classList.remove(cls);
    },

    toggleClass(selector, cls) {
      const el = document.querySelector(selector);
      if (el) el.classList.toggle(cls);
    },

    // ─── Event Helpers ───────────────────────────────────────────────────────────

    on(selector, event, handler) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => el.addEventListener(event, handler));
    },

    off(selector, event, handler) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => el.removeEventListener(event, handler));
    },

    /**
     * Fire a custom event
     */
    emit(selector, eventName, data) {
      const el = document.querySelector(selector);
      if (el) el.dispatchEvent(new CustomEvent(eventName, { detail: data, bubbles: true }));
    },

    // ─── Data & State ────────────────────────────────────────────────────────────

    _state: {},

    /**
     * Simple reactive state store
     */
    setState(key, value) {
      this._state[key] = value;
      // Trigger UI updates for bound elements
      const bound = document.querySelectorAll(`[data-bind="${key}"]`);
      bound.forEach(el => { el.textContent = value; });
    },

    getState(key) {
      return this._state[key];
    },

    // ─── HTTP / Fetch ─────────────────────────────────────────────────────────────

    async fetch(url, options = {}) {
      try {
        const resp = await fetch(url, options);
        const data = await resp.json();
        return data;
      } catch (err) {
        console.error('[TanglishRuntime] Fetch error:', err);
        throw err;
      }
    },

    // ─── Utility ─────────────────────────────────────────────────────────────────

    /**
     * Wait for a given number of milliseconds
     * await T.wait(1000);
     */
    wait(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Format a number with locale
     */
    format(num, locale = 'te-IN') {
      return new Intl.NumberFormat(locale).format(num);
    },

    /**
     * Show an alert dialog
     */
    alert(msg) {
      alert(msg);
    },

    /**
     * Show a confirm dialog
     */
    confirm(msg) {
      return confirm(msg);
    },

    /**
     * Log to console (cheppu)
     */
    log(...args) {
      console.log('[TanglishScript]', ...args);
    },

    // ─── LocalStorage helpers ────────────────────────────────────────────────────

    save(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },

    load(key) {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch { return null; }
    },

    remove(key) {
      localStorage.removeItem(key);
    },

    // ─── Animation ───────────────────────────────────────────────────────────────

    animate(selector, keyframes, options = {}) {
      const el = document.querySelector(selector);
      if (el && el.animate) {
        return el.animate(keyframes, { duration: 300, easing: 'ease', ...options });
      }
    },

    fadeIn(selector, duration = 300) {
      const el = document.querySelector(selector);
      if (!el) return;
      el.style.opacity = 0;
      el.style.display = '';
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration, fill: 'forwards' });
    },

    fadeOut(selector, duration = 300) {
      const el = document.querySelector(selector);
      if (!el) return;
      const anim = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration, fill: 'forwards' });
      anim.onfinish = () => { el.style.display = 'none'; };
    },
  };

  // Expose globally as T (TanglishRuntime shorthand)
  global.T = TanglishRuntime;
  global.TanglishRuntime = TanglishRuntime;

  // Auto-init on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    console.log(`%c🟡 TanglishScript Runtime v${TanglishRuntime.version} ready`, 'color:#f5a623;font-weight:bold;font-size:13px;');
  });

})(window);
