/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/cards-promo.js
  var ORIGIN = "https://www.compliancesigns.com";
  function absUrl(href) {
    try {
      return new URL(href, ORIGIN).href;
    } catch (e) {
      return href;
    }
  }
  function parse(element, { document: document2 }) {
    let bodies = [...element.querySelectorAll(".banner-text")];
    if (!bodies.length) {
      bodies = [...element.querySelectorAll("a.banner-item")];
    }
    const cells = [];
    bodies.forEach((body) => {
      const tile = body.closest("a.banner-item, a[href]") || body.parentElement;
      const href = tile && tile.getAttribute("href");
      let img = null;
      let prev = body.previousElementSibling;
      while (prev && !img) {
        img = prev.matches("img") ? prev : prev.querySelector("img");
        prev = prev.previousElementSibling;
      }
      if (!img && tile) img = tile.querySelector("img");
      const content = [];
      const titleEl = body.querySelector(".banner-title, h1, h2, h3, h4");
      if (titleEl) {
        const h2 = document2.createElement("h2");
        h2.textContent = titleEl.textContent.trim();
        content.push(h2);
      }
      const descEl = body.querySelector(".banner-desc, p");
      if (descEl && descEl.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = descEl.textContent.trim();
        content.push(p);
      }
      const ctaEl = body.querySelector('.button-orange, [class*="button"]');
      const ctaText = ctaEl ? ctaEl.textContent.trim() : "";
      if (href) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = absUrl(href);
        a.textContent = ctaText || (titleEl ? titleEl.textContent.trim() : href);
        p.append(a);
        content.push(p);
      }
      if (!img && !content.length) return;
      cells.push([img || "", content]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-category.js
  var ORIGIN2 = "https://www.compliancesigns.com";
  function absUrl2(href) {
    try {
      return new URL(href, ORIGIN2).href;
    } catch (e) {
      return href;
    }
  }
  function parse2(element, { document: document2 }) {
    let figures = [...element.querySelectorAll("figure")];
    if (!figures.length) {
      figures = [...element.querySelectorAll('[data-content-type="image"]')];
    }
    const cells = [];
    figures.forEach((figure) => {
      const img = figure.querySelector("img:not(.pagebuilder-mobile-only)") || figure.querySelector("img");
      const link2 = figure.querySelector("a[href]");
      const captionEl = figure.querySelector('figcaption, [data-element="caption"]');
      const caption = captionEl ? captionEl.textContent.trim() : "";
      if (!img && !caption) return;
      const content = [];
      if (caption) {
        const p = document2.createElement("p");
        if (link2) {
          const a = document2.createElement("a");
          a.href = absUrl2(link2.getAttribute("href"));
          a.textContent = caption;
          p.append(a);
        } else {
          p.textContent = caption;
        }
        content.push(p);
      }
      cells.push([img || "", content.length ? content : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-category", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-product.js
  var ORIGIN3 = "https://www.compliancesigns.com";
  function absUrl3(href) {
    try {
      return new URL(href, ORIGIN3).href;
    } catch (e) {
      return href;
    }
  }
  function clean(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function priceText(item) {
    const box = item.querySelector(".price-box");
    if (!box) return "";
    const label = box.querySelector(".price-label");
    const price = box.querySelector(".price");
    if (price) return clean(`${label ? label.textContent : ""} ${price.textContent}`);
    return clean(box.textContent);
  }
  function link(document2, href, text) {
    const p = document2.createElement("p");
    const a = document2.createElement("a");
    a.href = absUrl3(href);
    a.textContent = text;
    p.append(a);
    return p;
  }
  function parse3(element, { document: document2 }) {
    let items = [...element.querySelectorAll("li.product-item")];
    if (!items.length) items = [...element.querySelectorAll(".product-item-info")];
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector("img.product-image-photo") || item.querySelector("img");
      const titleLink = item.querySelector("a.product-item-link") || item.querySelector(".product-item-name a[href]");
      const photoLink = item.querySelector("a.product-item-photo");
      const cta = item.querySelector("a.select-options") || item.querySelector(".product-item-actions a[href]");
      const content = [];
      const price = priceText(item);
      if (price) {
        const p = document2.createElement("p");
        p.textContent = price;
        content.push(p);
      }
      const title = titleLink ? clean(titleLink.textContent) || titleLink.getAttribute("title") : "";
      const titleHref = titleLink && titleLink.getAttribute("href") || photoLink && photoLink.getAttribute("href");
      if (title && titleHref) content.push(link(document2, titleHref, title));
      if (cta && cta.getAttribute("href")) content.push(link(document2, cta.getAttribute("href"), clean(cta.textContent)));
      if (!img && !content.length) return;
      cells.push([img || "", content.length ? content : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-industry.js
  var ORIGIN4 = "https://www.compliancesigns.com";
  function absUrl4(href) {
    try {
      return new URL(href, ORIGIN4).href;
    } catch (e) {
      return href;
    }
  }
  function clean2(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function linkPara(document2, href, text) {
    const p = document2.createElement("p");
    const a = document2.createElement("a");
    a.href = absUrl4(href);
    a.textContent = text;
    p.append(a);
    return p;
  }
  function bannerImageUrl(banner) {
    const wrappers = [banner, ...banner.querySelectorAll('[data-background-images], [style*="background-image"]')];
    for (const el of wrappers) {
      const data = el.getAttribute && el.getAttribute("data-background-images");
      if (data) {
        const m = data.match(/(?:https?:)?\/\/[^"'\\\s)]+/);
        if (m) return m[0];
      }
      const style = el.getAttribute && el.getAttribute("style");
      if (style) {
        const m = style.match(/background-image:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
        if (m) return m[1];
      }
    }
    const img = banner.querySelector("img");
    return img ? img.getAttribute("src") : "";
  }
  function buildBannerRow(document2, banner) {
    const link2 = banner.matches("a[href]") ? banner : banner.querySelector("a[href]");
    const nameEl = banner.querySelector(".cate-name") || banner.querySelector(".pagebuilder-poster-content p");
    const ctaEl = banner.querySelector(".button-orange") || banner.querySelector('[class*="button"]');
    const name = nameEl ? clean2(nameEl.textContent) : "";
    const src = bannerImageUrl(banner);
    let img = "";
    if (src) {
      img = document2.createElement("img");
      img.src = absUrl4(src);
      img.alt = "";
    }
    const content = [];
    if (name) {
      const p = document2.createElement("p");
      p.textContent = name;
      content.push(p);
    }
    if (link2) {
      content.push(linkPara(document2, link2.getAttribute("href"), ctaEl && clean2(ctaEl.textContent) || name));
    }
    if (!img && !content.length) return null;
    return [img, content.length ? content : ""];
  }
  function priceText2(item) {
    const box = item.querySelector(".price-box");
    if (!box) return "";
    const label = box.querySelector(".price-label");
    const price = box.querySelector(".price");
    if (price) return clean2(`${label ? label.textContent : ""} ${price.textContent}`);
    return clean2(box.textContent);
  }
  function buildProductRow(document2, item) {
    const img = item.querySelector("img.product-image-photo") || item.querySelector("img");
    const titleLink = item.querySelector("a.product-item-link") || item.querySelector(".product-item-name a[href]");
    const photoLink = item.querySelector("a.product-item-photo");
    const cta = item.querySelector("a.select-options") || item.querySelector(".product-item-actions a[href]");
    const content = [];
    const price = priceText2(item);
    if (price) {
      const p = document2.createElement("p");
      p.textContent = price;
      content.push(p);
    }
    const title = titleLink ? clean2(titleLink.textContent) || titleLink.getAttribute("title") : "";
    const titleHref = titleLink && titleLink.getAttribute("href") || photoLink && photoLink.getAttribute("href");
    if (title && titleHref) content.push(linkPara(document2, titleHref, title));
    if (cta && cta.getAttribute("href")) content.push(linkPara(document2, cta.getAttribute("href"), clean2(cta.textContent)));
    if (!img && !content.length) return null;
    return [img || "", content.length ? content : ""];
  }
  function parse4(element, { document: document2 }) {
    const cells = [];
    const banner = element.querySelector('[data-content-type="banner"]') || element.querySelector(".pagebuilder-banner-wrapper") && element.querySelector(".pagebuilder-banner-wrapper").closest("a[href]");
    if (banner) {
      const row = buildBannerRow(document2, banner);
      if (row) cells.push(row);
    }
    let items = [...element.querySelectorAll("li.product-item")];
    if (!items.length) items = [...element.querySelectorAll(".product-item-info")];
    items.forEach((item) => {
      const row = buildProductRow(document2, item);
      if (row) cells.push(row);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-industry", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-review.js
  var ORIGIN5 = "https://www.compliancesigns.com";
  var STAR_ICON = `${ORIGIN5}/images/icons/star.svg`;
  function clean3(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function para(document2, text) {
    const p = document2.createElement("p");
    p.textContent = text;
    return p;
  }
  function ratingImage(document2, item) {
    const rating = item.querySelector(".review-rating");
    if (!rating) return "";
    const labelled = rating.querySelector("[aria-label], [title], [data-rating]") || rating;
    const label = clean3(
      labelled.getAttribute("aria-label") || labelled.getAttribute("title") || (labelled.getAttribute("data-rating") ? `${labelled.getAttribute("data-rating")} star rating` : "")
    );
    const img = document2.createElement("img");
    img.src = STAR_ICON;
    img.alt = label || "Star rating";
    return img;
  }
  function parse5(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".review-item")].filter((el) => !el.closest(".slick-cloned"));
    if (!items.length) items = [...element.querySelectorAll(".slick-slide:not(.slick-cloned) > div")];
    const cells = [];
    items.forEach((item) => {
      const title = clean3((item.querySelector(":scope > .title, .title") || {}).textContent);
      const text = clean3((item.querySelector(".review-text") || {}).textContent);
      const author = clean3((item.querySelector(".review-author") || {}).textContent);
      if (!title && !text) return;
      const content = [];
      if (title) {
        const p = document2.createElement("p");
        const strong = document2.createElement("strong");
        strong.textContent = title;
        p.append(strong);
        content.push(p);
      }
      if (text) content.push(para(document2, text));
      if (author) content.push(para(document2, author));
      cells.push([ratingImage(document2, item), content]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-review", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-blog.js
  var ORIGIN6 = "https://www.compliancesigns.com";
  function absUrl5(href) {
    try {
      return new URL(href, ORIGIN6).href;
    } catch (e) {
      return href;
    }
  }
  function clean4(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function fixImageSrc(img) {
    const src = img.getAttribute("src") || "";
    const idx = src.lastIndexOf("https://");
    if (idx > 0) img.setAttribute("src", src.slice(idx));
    return img;
  }
  function parse6(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".blog-item")];
    if (!items.length) items = [...element.querySelectorAll(".blog-inf")].map((inf) => inf.parentElement);
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector(".blog-img img") || item.querySelector("img");
      const titleEl = item.querySelector(".blog-title, h3, h2, h4");
      const descEl = item.querySelector(".blog-desc, p");
      const more = item.querySelector("a.read-more") || item.querySelector("a[href]");
      const content = [];
      const title = titleEl ? clean4(titleEl.textContent) : "";
      if (title) {
        const h3 = document2.createElement("h3");
        h3.textContent = title;
        content.push(h3);
      }
      const desc = descEl ? clean4(descEl.textContent) : "";
      if (desc) {
        const p = document2.createElement("p");
        p.textContent = desc;
        content.push(p);
      }
      if (more && more.getAttribute("href")) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = absUrl5(more.getAttribute("href"));
        a.textContent = clean4(more.textContent) || title;
        p.append(a);
        content.push(p);
      }
      if (!img && !content.length) return;
      cells.push([img ? fixImageSrc(img) : "", content.length ? content : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-blog", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/form-newsletter.js
  var FORM_DEFINITION_PATH = "/forms/newsletter.json";
  function parse7(element, { document: document2 }) {
    const form = element.matches("form") ? element : element.querySelector("form");
    const hasFields = form && form.querySelector('input[name="email"], input[type="email"], input, select');
    if (!hasFields) {
      element.remove();
      return;
    }
    const p = document2.createElement("p");
    const a = document2.createElement("a");
    a.href = FORM_DEFINITION_PATH;
    a.textContent = FORM_DEFINITION_PATH;
    p.append(a);
    const cells = [[[p]]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "form-newsletter", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-feature.js
  function clean5(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function parse8(element, { document: document2 }) {
    let columns = [...element.querySelectorAll(":scope > .pagebuilder-column")];
    if (!columns.length) columns = [...element.querySelectorAll('.pagebuilder-column, [data-content-type="column"]')];
    const cells = [];
    columns.forEach((col) => {
      const img = col.querySelector("img:not(.pagebuilder-mobile-only)") || col.querySelector("img");
      const headingEl = col.querySelector('[data-content-type="heading"], h3, h2, h4');
      const textEl = col.querySelector('[data-content-type="text"]') || [...col.querySelectorAll(":scope > div")].find((d) => clean5(d.textContent));
      const content = [];
      const title = headingEl ? clean5(headingEl.textContent) : "";
      if (title) {
        const h3 = document2.createElement("h3");
        h3.textContent = title;
        content.push(h3);
      }
      if (textEl) {
        const paras = [...textEl.querySelectorAll("p")].filter((p) => clean5(p.textContent));
        if (paras.length) content.push(...paras);
        else if (clean5(textEl.textContent)) {
          const p = document2.createElement("p");
          p.textContent = clean5(textEl.textContent);
          content.push(p);
        }
      }
      if (!img && !content.length) return;
      cells.push([img || "", content.length ? content : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/compliancesigns-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Cookiebot (cleaned.html: #CybotCookiebotDialog, #CybotCookiebotDialogBodyUnderlay, iframes at page end)
        "#CybotCookiebotDialog",
        "#CybotCookiebotDialogBodyUnderlay",
        "iframe.CybotCookiebotHiddenIframe",
        "iframe.CybotCookiebotOffscreenIframe",
        // UserWay accessibility widget (cleaned.html: .uw-sl skip links, .uwy menu, reading/ruler guides)
        ".uw-sl",
        ".uwy",
        ".uw-s10-bottom-ruler-guide",
        ".uw-s10-right-ruler-guide",
        ".uw-s10-left-ruler-guide",
        ".uw-s10-reading-guide",
        ".uw-s12-tooltip",
        // HubSpot web interactives (cleaned.html: #hs-web-interactives-top-push-anchor, -top-anchor, -bottom-anchor, -floating-container)
        '[id^="hs-web-interactives"]',
        // Magento Page Builder: responsive duplicate images (cleaned.html: img.pagebuilder-mobile-hidden + img.pagebuilder-mobile-only pairs
        // with identical src in .home-shop-category and .home-why-csign). Keep the desktop copy only.
        "img.pagebuilder-mobile-only",
        // Promo mosaic: keep only .banner-desktop (cleaned.html: .home-banner-section > .banner-desktop);
        // any responsive/mobile duplicate sibling rendered on the live page is dropped.
        ".home-banner-section > :not(.banner-desktop)",
        // Reviews slider (slick): cloned slides and prev/next arrows (cleaned.html: button.slick-arrow.slick-prev/.slick-next)
        ".home-customer-review .slick-cloned",
        ".home-customer-review .slick-arrow",
        // Inline Page Builder <style> blocks inside tab panels (block-context/cards-industry/source.html), scripts
        "style",
        "script",
        "noscript"
      ]);
      const body = element.ownerDocument && element.ownerDocument.body;
      if (body && body.style && body.style.overflow === "hidden") body.style.overflow = "auto";
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".top-bar-header",
        // free-shipping strip above header
        "#main-header",
        // site header + nav
        ".menu-spacing",
        "#new_footer",
        // site footer
        "#searchspring-div",
        // empty Searchspring PLP container after main
        "#bottom-banner",
        "next-route-announcer",
        // Next.js a11y route announcer
        '[id^="batBeacon"]',
        // Bing UET tracking pixels (cleaned.html: #batBeacon510011893555 etc.)
        // Tracking pixels reported on the live page (stripped from cleaned.html by the scraper)
        'img[src*="track.hubspot.com"]',
        'img[src*="hsforms.com"]',
        'img[src*="hsforms.net"]',
        "iframe",
        "noscript",
        "link"
      ]);
    }
  }

  // tools/importer/transformers/compliancesigns-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  var TAB_MARKER_ATTR = "data-excat-tab-id";
  var TAB_TITLE_ATTR = "data-excat-tab-title";
  var TAB_HOST_SELECTOR = ".home-food-service";
  var TAB_STASH_CLASS = "excat-tab-stash";
  var DEFAULT_TAB_STYLE = "light-blue";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function toTabId(title) {
    return String(title || "").toLowerCase().replace(/[^0-9a-z]/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  }
  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
  function preloadTabs(_0) {
    return __async(this, arguments, function* (document2, { tabDelay = 1500, scrollDelay = 250 } = {}) {
      const win = document2.defaultView || window;
      const step = Math.max(win.innerHeight || 0, 600);
      for (let y = 0; y < document2.body.scrollHeight; y += step) {
        win.scrollTo(0, y);
        yield sleep(scrollDelay);
      }
      win.scrollTo(0, 0);
      document2.querySelectorAll("#CybotCookiebotDialog, #CybotCookiebotDialogBodyUnderlay").forEach((el) => el.remove());
      if (document2.body.style.overflow === "hidden") document2.body.style.overflow = "auto";
      const host = document2.querySelector(TAB_HOST_SELECTOR);
      if (!host || host.querySelector(`.${TAB_STASH_CLASS}`)) return;
      const triggers = [...host.querySelectorAll(".tab-trigger")];
      const stashes = [];
      for (const trigger of triggers) {
        trigger.click();
        yield sleep(tabDelay);
        const panel = host.querySelector(".tab-content");
        if (panel) {
          const stash = document2.createElement("div");
          stash.className = TAB_STASH_CLASS;
          stash.setAttribute("data-tab-title", trigger.textContent.trim());
          stash.append(panel.cloneNode(true));
          stashes.push(stash);
        }
      }
      stashes.forEach((stash) => host.append(stash));
    });
  }
  function buildIndustryTabs(document2, root) {
    const host = root.querySelector(TAB_HOST_SELECTOR);
    if (!host) return;
    let panels = [...host.querySelectorAll(`.${TAB_STASH_CLASS}`)].map((stash) => ({
      title: stash.getAttribute("data-tab-title"),
      content: stash.querySelector(".tab-content")
    })).filter((p) => p.content);
    if (!panels.length) {
      const live = host.querySelector(".tab-content");
      if (!live) return;
      const active = host.querySelector(".tab-trigger.active") || host.querySelector(".tab-trigger");
      panels = [{ title: active ? active.textContent.trim() : "Tab 1", content: live }];
    }
    const container = document2.createElement("div");
    container.className = "excat-industry-tabs";
    const usedIds = /* @__PURE__ */ new Set();
    panels.forEach((panel, i) => {
      const title = panel.title || `Tab ${i + 1}`;
      let id = toTabId(title) || `tab-${i + 1}`;
      while (usedIds.has(id)) id = `${id}-${i + 1}`;
      usedIds.add(id);
      const hr = document2.createElement("hr");
      hr.setAttribute(TAB_MARKER_ATTR, id);
      hr.setAttribute(TAB_TITLE_ATTR, title);
      let linkPara2 = null;
      const shopAll = panel.content.querySelector(".bt-view-all a[href]");
      if (shopAll) {
        linkPara2 = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = shopAll.getAttribute("href");
        a.textContent = shopAll.textContent.trim();
        linkPara2.append(a);
        shopAll.closest(".bt-view-all").remove();
      }
      container.append(hr, panel.content);
      if (linkPara2) container.append(linkPara2);
    });
    host.querySelectorAll(`.tab-list, .${TAB_STASH_CLASS}`).forEach((el) => el.remove());
    (host.querySelector(":scope > .container-xl") || host).append(container);
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    const doc = element.ownerDocument || document;
    if (hookName === "beforeTransform") {
      buildIndustryTabs(doc, element);
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = doc.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      const tabHostSection = sections.find((s) => (s.selector || []).includes(TAB_HOST_SELECTOR));
      const tabStyle = tabHostSection && tabHostSection.style || DEFAULT_TAB_STYLE;
      element.querySelectorAll(`hr[${TAB_MARKER_ATTR}]`).forEach((hr) => {
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: {
            style: tabStyle,
            "tab-id": hr.getAttribute(TAB_MARKER_ATTR),
            "tab-title": hr.getAttribute(TAB_TITLE_ATTR)
          }
        });
        hr.after(metadataBlock);
        hr.removeAttribute(TAB_MARKER_ATTR);
        hr.removeAttribute(TAB_TITLE_ATTR);
      });
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }
  transform2.preloadTabs = preloadTabs;

  // tools/importer/import-home.js
  var parsers = {
    "cards-promo": parse,
    "cards-category": parse2,
    "cards-product": parse3,
    "cards-industry": parse4,
    "cards-review": parse5,
    "cards-blog": parse6,
    "form-newsletter": parse7,
    "cards-feature": parse8
  };
  var PAGE_TEMPLATE = {
    name: "home",
    description: "ComplianceSigns homepage: promo tile mosaic, category grid, best sellers, industry tabs, reviews slider, blog teasers, newsletter sign-up and brand value props",
    urls: [
      "https://www.compliancesigns.com/"
    ],
    blocks: [
      { name: "cards-promo", instances: [".home-banner-section .banner-desktop"] },
      { name: "cards-category", instances: [".home-shop-category .pagebuilder-column-group"] },
      { name: "cards-product", instances: [".home-best-seller .products-grid"] },
      { name: "cards-industry", instances: [".home-food-service .tab-content"] },
      { name: "cards-review", instances: [".home-customer-review .reviews-list"] },
      { name: "cards-blog", instances: [".home-lastest-blogs .blogs"] },
      { name: "form-newsletter", instances: ["#my_email_sub_form_footer", ".home-sign-up form"] },
      { name: "cards-feature", instances: [".home-why-csign .pagebuilder-column-group"] }
    ],
    sections: [
      {
        id: "1",
        name: "Promo banner mosaic",
        selector: [".home-banner-section"],
        style: null,
        blocks: ["cards-promo"],
        defaultContent: []
      },
      {
        id: "2",
        name: "Shop by Category",
        selector: [".home-shop-category"],
        style: "light-blue",
        blocks: ["cards-category"],
        defaultContent: [
          ".home-shop-category h1",
          ".home-shop-category h2",
          ".home-shop-category a[href*='safety-5s-product-types']"
        ]
      },
      {
        id: "3",
        name: "Best Sellers",
        selector: [".home-best-seller"],
        style: "grey",
        blocks: ["cards-product"],
        defaultContent: [".home-best-seller h2"]
      },
      {
        id: "4",
        name: "Industry tabs",
        selector: [".home-food-service"],
        style: "light-blue",
        blocks: ["cards-industry"],
        defaultContent: [
          ".home-food-service h2",
          ".home-food-service .tab-content a[href*='compliancesigns.com/']"
        ]
      },
      {
        id: "5",
        name: "Customer reviews",
        selector: [".home-customer-review"],
        style: "dark",
        blocks: ["cards-review"],
        defaultContent: [
          ".home-customer-review .review-left",
          ".home-customer-review p.trustpilot-text"
        ]
      },
      {
        id: "6",
        name: "News & Resources",
        selector: [".home-lastest-blogs"],
        style: "grey",
        blocks: ["cards-blog"],
        defaultContent: [
          ".home-lastest-blogs h2",
          ".home-lastest-blogs a[href$='/blog/']"
        ]
      },
      {
        id: "7",
        name: "Newsletter sign-up",
        selector: [".home-sign-up"],
        style: "newsletter",
        blocks: ["form-newsletter"],
        defaultContent: [
          ".home-sign-up > img",
          ".home-sign-up h2",
          ".home-sign-up .container-xl > div:nth-of-type(2)",
          ".home-sign-up .container-xl > div:nth-of-type(4)"
        ]
      },
      {
        id: "8",
        name: "Why ComplianceSigns",
        selector: [".home-why-csign"],
        style: null,
        blocks: ["cards-feature"],
        defaultContent: [
          ".home-why-csign h2",
          ".home-why-csign .container-xl > div > div > div:nth-of-type(1) p"
        ]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_home_default = {
    /**
     * Runs in the live page before transformation: scrolls to trigger lazy
     * sections, removes the Cookiebot overlay and stashes every industry tab panel.
     */
    onLoad: (_0) => __async(void 0, [_0], function* ({ document: document2 }) {
      yield transform2.preloadTabs(document2);
    }),
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      const meta = {};
      const title = document2.querySelector("title");
      if (title) meta.Title = title.textContent.replace(/[\n\t]/gm, "").trim();
      const desc = document2.querySelector('meta[name="description"], meta[property="og:description"]');
      if (desc) meta.Description = desc.content;
      const ogImage = document2.querySelector('meta[property="og:image"]');
      if (ogImage && ogImage.content) {
        const img = document2.createElement("img");
        img.src = ogImage.content;
        meta.Image = img;
      }
      meta.template = "compliancesigns";
      main.append(WebImporter.Blocks.getMetadataBlock(document2, meta));
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
