/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: compliancesigns.com section breaks + Section Metadata.
 *
 * Uses payload.template.sections (page-templates.json). Breaks are inserted in
 * beforeTransform (before parsers replace section elements), Section Metadata in
 * afterTransform anchored to marker <hr> elements.
 *
 * Industry tabs (.home-food-service): the live page only renders the active tab
 * panel. Call `transform.preloadTabs(document)` (attached to the default export)
 * from the import script's onLoad to stash
 * every panel as `.excat-tab-stash[data-tab-title] > .tab-content` inside
 * .home-food-service. This transformer then emits:
 *   - section 4 intro (H2) as its own section (style from template)
 *   - one section per tab: that tab's `.tab-content` (parsed by cards-industry)
 *     + its "Shop All" link, with Section Metadata style / tab-id / tab-title.
 * tab-id must be unique per tab: blocks/tabs/tabs.js keys buttons/panels by
 * toClassName(data-tab-id) and groups every `.section[data-tab-id]` on the page.
 * Without a stash (preload not run) the single live panel is used.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';
const TAB_MARKER_ATTR = 'data-excat-tab-id';
const TAB_TITLE_ATTR = 'data-excat-tab-title';
const TAB_HOST_SELECTOR = '.home-food-service'; // cleaned.html: div.home-food-service.full-background
const TAB_STASH_CLASS = 'excat-tab-stash';
const DEFAULT_TAB_STYLE = 'light-blue';

// section.selector is an array of candidate selectors - first match wins.
function querySection(root, selectors) {
  const list = Array.isArray(selectors) ? selectors : [selectors];
  for (const sel of list) {
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

// Mirrors toClassName() in scripts/aem.js so tab ids match what tabs.js computes.
function toTabId(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/[^0-9a-z]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function sleep(ms) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

/**
 * onLoad helper for the import script (runs in the live page before html2md).
 * 1. Scrolls through the page to trigger lazy-loaded sections/images.
 * 2. Removes the Cookiebot overlay and restores body scrolling.
 * 3. Clicks each `.home-food-service .tab-trigger`, waits `tabDelay` ms, and
 *    clones the rendered `.tab-content` into
 *    `<div class="excat-tab-stash" data-tab-title="{label}">` appended
 *    to `.home-food-service`. Idempotent (skips if a stash already exists).
 */
async function preloadTabs(document, { tabDelay = 1500, scrollDelay = 250 } = {}) {
  const win = document.defaultView || window;

  // 1. Lazy-load: scroll to bottom in viewport steps, then back to top.
  const step = Math.max(win.innerHeight || 0, 600);
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    win.scrollTo(0, y);
    // eslint-disable-next-line no-await-in-loop
    await sleep(scrollDelay);
  }
  win.scrollTo(0, 0);

  // 2. Cookiebot overlay (cleaned.html: #CybotCookiebotDialog, #CybotCookiebotDialogBodyUnderlay)
  document.querySelectorAll('#CybotCookiebotDialog, #CybotCookiebotDialogBodyUnderlay')
    .forEach((el) => el.remove());
  if (document.body.style.overflow === 'hidden') document.body.style.overflow = 'auto';

  // 3. Industry tabs
  const host = document.querySelector(TAB_HOST_SELECTOR);
  if (!host || host.querySelector(`.${TAB_STASH_CLASS}`)) return;

  const triggers = [...host.querySelectorAll('.tab-trigger')];
  const stashes = [];
  for (const trigger of triggers) {
    trigger.click();
    // eslint-disable-next-line no-await-in-loop
    await sleep(tabDelay);
    const panel = host.querySelector('.tab-content');
    if (panel) {
      const stash = document.createElement('div');
      stash.className = TAB_STASH_CLASS;
      stash.setAttribute('data-tab-title', trigger.textContent.trim());
      // Intentionally not `hidden`: importer pre-processing may drop hidden nodes.
      stash.append(panel.cloneNode(true));
      stashes.push(stash);
    }
  }
  // Append after the loop so querySelector('.tab-content') always hits the live panel.
  stashes.forEach((stash) => host.append(stash));
}

// Rebuild .home-food-service as: intro | (hr marker, .tab-content, Shop All link) per tab.
function buildIndustryTabs(document, root) {
  const host = root.querySelector(TAB_HOST_SELECTOR);
  if (!host) return;

  let panels = [...host.querySelectorAll(`.${TAB_STASH_CLASS}`)]
    .map((stash) => ({
      title: stash.getAttribute('data-tab-title'),
      content: stash.querySelector('.tab-content'),
    }))
    .filter((p) => p.content);

  if (!panels.length) {
    // Fallback: only the active live panel (preloadTabs not run).
    const live = host.querySelector('.tab-content');
    if (!live) return;
    const active = host.querySelector('.tab-trigger.active') || host.querySelector('.tab-trigger');
    panels = [{ title: active ? active.textContent.trim() : 'Tab 1', content: live }];
  }

  const container = document.createElement('div');
  container.className = 'excat-industry-tabs';
  const usedIds = new Set();

  panels.forEach((panel, i) => {
    const title = panel.title || `Tab ${i + 1}`;
    let id = toTabId(title) || `tab-${i + 1}`;
    while (usedIds.has(id)) id = `${id}-${i + 1}`;
    usedIds.add(id);

    const hr = document.createElement('hr');
    hr.setAttribute(TAB_MARKER_ATTR, id);
    hr.setAttribute(TAB_TITLE_ATTR, title);

    // "Shop All" CTA (cleaned.html: .tab-content .bt-view-all > a.pagebuilder-button-link)
    // becomes default content after the cards-industry block.
    let linkPara = null;
    const shopAll = panel.content.querySelector('.bt-view-all a[href]');
    if (shopAll) {
      linkPara = document.createElement('p');
      const a = document.createElement('a');
      a.href = shopAll.getAttribute('href');
      a.textContent = shopAll.textContent.trim();
      linkPara.append(a);
      shopAll.closest('.bt-view-all').remove();
    }

    container.append(hr, panel.content);
    if (linkPara) container.append(linkPara);
  });

  // Drop the tab UI (triggers + leftover live panel) and the emptied stashes.
  host.querySelectorAll(`.tab-list, .${TAB_STASH_CLASS}`).forEach((el) => el.remove());
  (host.querySelector(':scope > .container-xl') || host).append(container);
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];
  const doc = element.ownerDocument || document;

  if (hookName === 'beforeTransform') {
    buildIndustryTabs(doc, element);

    // Insert breaks now, before parsers can replace any section element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no break, no metadata
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue;

      const hr = doc.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Per-tab Section Metadata (style + tab-id + tab-title).
    const tabHostSection = sections.find((s) => (s.selector || []).includes(TAB_HOST_SELECTOR));
    const tabStyle = (tabHostSection && tabHostSection.style) || DEFAULT_TAB_STYLE;
    element.querySelectorAll(`hr[${TAB_MARKER_ATTR}]`).forEach((hr) => {
      const metadataBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: {
          style: tabStyle,
          'tab-id': hr.getAttribute(TAB_MARKER_ATTR),
          'tab-title': hr.getAttribute(TAB_TITLE_ATTR),
        },
      });
      hr.after(metadataBlock);
      hr.removeAttribute(TAB_MARKER_ATTR);
      hr.removeAttribute(TAB_TITLE_ATTR);
    });

    // Template-section Section Metadata.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue;

      const metadataBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove();
      }
    }
  }
}

// onLoad helper for import.js: `await sectionsTransformer.preloadTabs(document)`.
transform.preloadTabs = preloadTabs;
