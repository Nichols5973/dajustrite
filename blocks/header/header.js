/**
 * Header block.
 *
 * Reads the nav fragment and builds the header from its sections, in order:
 *   1. promo bar          (paragraph)
 *   2. brand              (logo link)
 *   3. search             (link to the search results page; its text is the
 *                          field placeholder and the button label)
 *   4. tools              (list of icon / phone links)
 *   5. main navigation    (list: each item is a trigger link plus its panel)
 *   6. call to action     (link)
 *   7. mobile drawer      (h2 title, plain paragraphs with the close and back
 *                          labels, h3 + link promo, account links list,
 *                          help bar list)
 *
 * Panel content conventions (section 5):
 *   ul > li          column / group: heading link ("#" = plain heading) + nested ul
 *   li > strong > a  emphasised "shop all" link
 *   ol               promo image cards (last item without image = "see all" link)
 *   p > em > a       outlined "view all" button
 *   p > a            full-width footer bar (direct child of the trigger item)
 * A group that carries its own cards or buttons turns the panel into a
 * category sidebar whose hovered category swaps the right-hand content.
 */

const DESKTOP = window.matchMedia('(width >= 900px)');

async function fetchNav() {
  // metadata-independent: /content first (local preview), then root (DA/EDS)
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
  // the publishing pipeline wraps the label of an item that has a sub-list in a
  // paragraph (li > p > a + ul); unwrap it so local and published markup match
  doc.querySelectorAll('li').forEach((li) => {
    const first = li.firstElementChild;
    if (first && first.tagName === 'P' && li.querySelector(':scope > ul, :scope > ol')) {
      first.replaceWith(...first.childNodes);
    }
  });
  // resolve relative media against the fragment, not the current page
  const base = resp.url;
  doc.querySelectorAll('img[src]').forEach((img) => {
    img.setAttribute('src', new URL(img.getAttribute('src'), base).href);
  });
  doc.querySelectorAll('source[srcset]').forEach((source) => {
    const srcset = source.getAttribute('srcset').split(',')
      .map((entry) => {
        const [url, size] = entry.trim().split(/\s+/);
        return [new URL(url, base).href, size].filter(Boolean).join(' ');
      }).join(', ');
    source.setAttribute('srcset', srcset);
  });
  return doc.body;
}

function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children.filter(Boolean));
  return node;
}

const directChildren = (parent, selector) => [...parent.children]
  .filter((child) => child.matches(selector));

/** labels read from the drawer section of the nav fragment */
const labels = { menu: '', close: '', back: '' };

/** chevron button that expands / collapses `container` (mobile accordions) */
function addToggle(container, label, expanded = false) {
  const button = el('button', 'nav-toggle');
  button.type = 'button';
  button.setAttribute('aria-label', label);
  button.setAttribute('aria-expanded', String(expanded));
  container.classList.toggle('is-expanded', expanded);
  button.addEventListener('click', () => {
    const open = !container.classList.contains('is-expanded');
    container.classList.toggle('is-expanded', open);
    button.setAttribute('aria-expanded', String(open));
  });
  return button;
}

/* ---------- panel building ---------- */

function decorateLinks(scope) {
  scope.querySelectorAll('a').forEach((a) => {
    if (a.getAttribute('href') === '#') {
      const heading = el('span', 'nav-heading');
      heading.append(...a.childNodes);
      a.replaceWith(heading);
    }
    if (a.querySelector('img')) a.classList.add('nav-icon-link');
  });
  scope.querySelectorAll('li > strong > a').forEach((a) => a.classList.add('nav-shop-all'));
  scope.querySelectorAll('p > em > a').forEach((a) => {
    a.classList.add('nav-panel-button');
    a.closest('p').classList.add('nav-panel-button-wrapper');
  });
}

function decorateCards(ol) {
  ol.classList.add('nav-cards');
  const items = directChildren(ol, 'li');
  const last = items[items.length - 1];
  if (last && !last.querySelector('img')) {
    ol.classList.add('nav-cards-teasers');
    last.classList.add('nav-cards-more');
  }
  items.forEach((li) => {
    const a = li.querySelector('a');
    if (!a) return;
    const media = a.querySelector('picture, img');
    if (media) {
      const text = el('span', 'nav-card-text');
      [...a.childNodes].filter((n) => n !== media).forEach((n) => text.append(n));
      a.append(text);
    }
  });
}

function buildGroups(ul, expandFirst = false) {
  ul.classList.add('nav-groups');
  directChildren(ul, 'li').forEach((li, index) => {
    li.classList.add('nav-group');
    const heading = [...li.children].find((c) => c.matches('a, span.nav-heading'));
    if (heading) heading.classList.add('nav-group-heading');
    if (heading && directChildren(li, 'ul').length) {
      heading.after(addToggle(li, heading.textContent.trim(), expandFirst && index === 0));
    }
    directChildren(li, 'ul').forEach((items) => {
      items.classList.add('nav-group-items');
      directChildren(items, 'li').forEach((item) => {
        const sub = directChildren(item, 'ul')[0];
        if (sub) {
          item.classList.add('nav-subgroup');
          sub.classList.add('nav-subgroup-items');
        }
      });
    });
  });
}

function buildColumnsPanel(trigger, content) {
  const body = el('div', 'nav-panel-content');
  const main = el('div', 'nav-panel-main');
  directChildren(trigger, 'ul').forEach((ul) => {
    buildGroups(ul, true);
    main.append(ul);
  });
  directChildren(trigger, 'p').forEach((p) => {
    if (p.querySelector(':scope > em > a')) main.append(p);
  });
  body.append(main);
  directChildren(trigger, 'ol').forEach((ol) => {
    decorateCards(ol);
    body.append(el('div', 'nav-panel-aside', ol));
  });
  content.append(body);
}

function activateTab(tabs, index) {
  tabs.querySelectorAll(':scope > .nav-tab-list > li').forEach((li, i) => {
    li.classList.toggle('is-active', i === index);
  });
  tabs.querySelectorAll(':scope > .nav-tab-pane').forEach((pane, i) => {
    pane.hidden = i !== index;
  });
}

function buildTabsPanel(trigger, content) {
  const tabs = el('div', 'nav-tabs');
  const list = el('ul', 'nav-tab-list');
  const categories = directChildren(directChildren(trigger, 'ul')[0], 'li');
  categories.forEach((category, index) => {
    const link = directChildren(category, 'a')[0];
    const tab = el('li', 'nav-tab', link);
    list.append(tab);
    const pane = el('div', 'nav-tab-pane');
    // mobile: each category is an accordion bar (label navigates, chevron expands)
    const bar = el('div', 'nav-pane-bar', link.cloneNode(true));
    bar.append(addToggle(pane, link.textContent.trim()));
    pane.append(bar);
    const main = el('div', 'nav-panel-main');
    directChildren(category, 'ul').forEach((ul) => {
      buildGroups(ul);
      main.append(ul);
    });
    const buttons = directChildren(category, 'p');
    if (buttons.length) main.append(el('div', 'nav-pane-footer', ...buttons));
    pane.append(main);
    directChildren(category, 'ol').forEach((ol) => {
      decorateCards(ol);
      pane.append(el('div', 'nav-panel-aside', ol));
    });
    tabs.append(pane);
    const activate = () => activateTab(tabs, index);
    tab.addEventListener('mouseenter', activate);
    link.addEventListener('focus', activate);
  });
  directChildren(trigger, 'ul')[0].remove();
  tabs.prepend(list);
  activateTab(tabs, 0);
  content.append(tabs);
}

function isTabbed(trigger) {
  const columns = directChildren(trigger, 'ul')[0];
  return !!columns && directChildren(columns, 'li')
    .some((li) => directChildren(li, 'ol, p').length > 0);
}

function buildPanelHead(trigger, onClose) {
  const label = trigger.querySelector(':scope > a').textContent.trim();
  const back = el('button', 'nav-panel-back');
  back.type = 'button';
  back.setAttribute('aria-label', `${labels.back} ${label}`.trim());
  back.addEventListener('click', () => {
    trigger.classList.remove('is-open');
    trigger.querySelector(':scope > a').setAttribute('aria-expanded', 'false');
  });
  const close = el('button', 'nav-panel-close');
  close.type = 'button';
  close.setAttribute('aria-label', labels.close);
  close.addEventListener('click', onClose);
  return el('div', 'nav-panel-head', back, el('span', 'nav-panel-title', label), close);
}

function buildPanel(trigger, onClose) {
  decorateLinks(trigger);
  const panel = el('div', 'nav-panel');
  panel.append(buildPanelHead(trigger, onClose));
  const content = el('div', 'nav-panel-inner');
  const footers = directChildren(trigger, 'p').filter((p) => p.querySelector(':scope > a'));
  if (isTabbed(trigger)) {
    panel.classList.add('nav-panel-tabs');
    buildTabsPanel(trigger, content);
  } else {
    panel.classList.add('nav-panel-columns');
    buildColumnsPanel(trigger, content);
  }
  panel.append(content);
  footers.forEach((p) => {
    p.className = 'nav-panel-footer';
    panel.append(p);
  });
  trigger.append(panel);
}

/* ---------- open / close ---------- */

function closeAll(sections) {
  sections.querySelectorAll(':scope > li.is-open').forEach((li) => {
    li.classList.remove('is-open');
    li.querySelector(':scope > a').setAttribute('aria-expanded', 'false');
  });
}

function setOpen(sections, li, open) {
  if (open) closeAll(sections);
  li.classList.toggle('is-open', open);
  li.querySelector(':scope > a').setAttribute('aria-expanded', String(open));
}

function initTrigger(sections, li) {
  const link = li.querySelector(':scope > a');
  link.classList.add('nav-trigger');
  link.setAttribute('aria-haspopup', 'true');
  link.setAttribute('aria-expanded', 'false');
  li.addEventListener('mouseenter', () => { if (DESKTOP.matches) setOpen(sections, li, true); });
  li.addEventListener('mouseleave', () => { if (DESKTOP.matches) setOpen(sections, li, false); });
  li.addEventListener('focusin', () => { if (DESKTOP.matches) setOpen(sections, li, true); });
  li.addEventListener('focusout', (e) => {
    if (DESKTOP.matches && !li.contains(e.relatedTarget)) setOpen(sections, li, false);
  });
  li.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      setOpen(sections, li, false);
      link.focus();
    }
  });
  link.addEventListener('click', (e) => {
    if (DESKTOP.matches) return;
    e.preventDefault();
    setOpen(sections, li, true);
  });
}

/* ---------- mobile drawer ---------- */

function toggleDrawer(header, button, open) {
  header.classList.toggle('is-drawer-open', open);
  button.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('nav-drawer-open', open);
  if (!open) closeAll(header.querySelector('.nav-sections'));
}

function readDrawer(section) {
  if (!section) return null;
  const title = section.querySelector('h2');
  const plain = directChildren(section, 'p').filter((p) => !p.querySelector('a'));
  labels.menu = title ? title.textContent.trim() : '';
  [labels.close = '', labels.back = ''] = plain.map((p) => p.textContent.trim());
  const lists = directChildren(section, 'ul');
  const helpbar = lists.length > 1 ? lists.pop() : null;
  const promo = el('div', 'nav-drawer-promo', ...directChildren(section, 'h3, p').filter((n) => !plain.includes(n)));
  lists.forEach((ul) => ul.classList.add('nav-drawer-links'));
  if (helpbar) helpbar.className = 'nav-helpbar';
  return {
    extras: el('div', 'nav-drawer-extras', promo, ...lists),
    helpbar,
  };
}

/* ---------- header rows ---------- */

function buildSearch(section) {
  const link = section.querySelector('a');
  if (!link) return null;
  const label = link.textContent.trim();
  const icon = link.querySelector('img');
  const url = new URL(link.href);
  const form = el('form', 'nav-search');
  form.action = url.origin + url.pathname;
  form.method = 'get';
  form.setAttribute('role', 'search');
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.placeholder = label;
  input.setAttribute('aria-label', label);
  const button = el('button', 'nav-search-button', icon, el('span', null, label));
  button.type = 'submit';
  form.append(input, button);
  return form;
}

function buildTools(section) {
  const list = section.querySelector('ul');
  if (!list) return null;
  list.className = 'nav-tools';
  list.querySelectorAll('a').forEach((a) => {
    const img = a.querySelector('img');
    const text = a.textContent.trim();
    if (!text) return;
    const span = el('span', null);
    [...a.childNodes].filter((n) => n !== img).forEach((n) => span.append(n));
    a.append(span);
    // phone numbers show their text; other tools are icons with a hidden label
    if (a.protocol === 'tel:') {
      a.classList.add('nav-tool-text');
    } else {
      a.classList.add('nav-tool-icon');
      a.title = text;
    }
  });
  return list;
}

export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;
  const [promo, brand, search, tools, navSection, cta, drawerSection] = [...fragment.children];
  const drawer = readDrawer(drawerSection);
  const header = block.closest('header') || block;
  const hamburger = el('button', 'nav-hamburger');
  hamburger.type = 'button';
  hamburger.setAttribute('aria-controls', 'nav-drawer');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', labels.menu);
  const closeDrawer = () => toggleDrawer(header, hamburger, false);
  hamburger.addEventListener('click', () => toggleDrawer(header, hamburger, !header.classList.contains('is-drawer-open')));

  const wrapper = el('div', 'nav-wrapper');
  if (promo) wrapper.append(el('div', 'nav-promo', ...promo.childNodes));

  const nav = el('nav', null);
  nav.id = 'nav';
  const main = el('div', 'nav-main', hamburger);
  if (brand) main.append(el('div', 'nav-brand', ...brand.childNodes));
  if (search) main.append(buildSearch(search));
  if (tools) main.append(buildTools(tools));
  nav.append(main);

  const bar = el('div', 'nav-bar');
  bar.id = 'nav-drawer';
  const drawerClose = el('button', 'nav-drawer-close');
  drawerClose.type = 'button';
  drawerClose.setAttribute('aria-label', labels.close);
  drawerClose.addEventListener('click', closeDrawer);
  bar.append(el('div', 'nav-drawer-head', el('span', 'nav-drawer-title', labels.menu), drawerClose));
  const sections = navSection && navSection.querySelector('ul');
  if (sections) {
    sections.className = 'nav-sections nav-list';
    directChildren(sections, 'li').forEach((li) => {
      li.classList.add('nav-section');
      if (directChildren(li, 'ul, ol, p').length) {
        buildPanel(li, closeDrawer);
        initTrigger(sections, li);
      }
    });
    bar.append(sections);
  }
  if (drawer) bar.append(drawer.extras);
  if (cta) {
    const ctaWrap = el('div', 'nav-cta', ...cta.childNodes);
    bar.append(ctaWrap);
  }
  if (drawer && drawer.helpbar) bar.append(drawer.helpbar);
  nav.append(bar);
  wrapper.append(nav);
  block.append(wrapper);

  // keep the sticky offset equal to the (wrapping) promo bar height
  const promoBar = wrapper.querySelector('.nav-promo');
  if (promoBar) {
    new ResizeObserver(() => {
      header.style.setProperty('--hdr-promo-height', `${promoBar.offsetHeight}px`);
    }).observe(promoBar);
  }

  // reset menus when crossing the desktop breakpoint
  DESKTOP.addEventListener('change', () => {
    toggleDrawer(header, hamburger, false);
    if (sections) closeAll(sections);
  });
  header.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && header.classList.contains('is-drawer-open')) {
      closeDrawer();
      hamburger.focus();
    }
  });
}
