/**
 * Footer block.
 *
 * Reads the footer fragment and builds the footer from its sections, in order:
 *   1. brand     (logo link + address paragraph)
 *   2. columns   (h2 heading followed by a list of links, repeated)
 *   3. sign-up   (h2, text, emphasised field label, link whose URL receives the
 *                 form and whose text is the submit label)
 *   4. social    (list of icon links)
 *   5. bottom    (copyright paragraph + list of legal links)
 */

async function fetchFooter() {
  // metadata-independent: /content first (local preview), then root (DA/EDS)
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
  // resolve relative media against the fragment, not the current page
  doc.querySelectorAll('img[src]').forEach((img) => {
    img.setAttribute('src', new URL(img.getAttribute('src'), resp.url).href);
  });
  doc.querySelectorAll('source[srcset]').forEach((source) => {
    const srcset = source.getAttribute('srcset').split(',')
      .map((entry) => {
        const [url, size] = entry.trim().split(/\s+/);
        return [new URL(url, resp.url).href, size].filter(Boolean).join(' ');
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

/** heading + following siblings until the next heading become one column */
function buildColumns(section) {
  const columns = [];
  [...section.children].forEach((child) => {
    if (child.matches('h2, h3')) {
      child.className = 'footer-title';
      columns.push(el('div', 'footer-col', child));
    } else if (columns.length) {
      columns[columns.length - 1].append(child);
    }
  });
  columns.forEach((col) => col.querySelectorAll(':scope > ul').forEach((ul) => ul.classList.add('footer-links')));
  return columns;
}

/** sign-up column: the emphasised paragraph labels the field, the link submits */
function buildSignup(section) {
  const [col] = buildColumns(section);
  if (!col) return null;
  const labelP = [...col.querySelectorAll(':scope > p')].find((p) => p.querySelector(':scope > em'));
  const linkP = [...col.querySelectorAll(':scope > p')].find((p) => p.querySelector(':scope > a'));
  if (labelP && linkP) {
    const link = linkP.querySelector('a');
    const label = labelP.textContent.trim();
    const form = el('form', 'footer-signup');
    form.action = link.href;
    form.method = 'get';
    const id = 'footer-signup-email';
    const fieldLabel = el('label', 'footer-signup-label', label);
    fieldLabel.htmlFor = id;
    const input = document.createElement('input');
    input.type = 'email';
    input.name = 'email';
    input.id = id;
    input.required = true;
    input.autocomplete = 'email';
    const submit = el('button', 'footer-signup-submit', link.textContent.trim());
    submit.type = 'submit';
    form.append(fieldLabel, input, submit);
    labelP.replaceWith(form);
    linkP.remove();
  }
  return col;
}

export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';
  if (!fragment) return;
  const [brand, columns, signup, social, bottom] = [...fragment.children];

  const top = el('div', 'footer-top');
  if (brand) {
    const col = el('div', 'footer-col footer-brand', ...brand.childNodes);
    const logo = col.querySelector('a');
    if (logo) logo.classList.add('footer-logo');
    const address = col.querySelector('p:not(:has(a))');
    if (address) address.classList.add('footer-address');
    top.append(col);
  }
  if (columns) top.append(...buildColumns(columns));
  if (signup) top.append(buildSignup(signup));

  const wrapper = el('div', 'footer-inner', top);
  if (social) {
    const list = social.querySelector('ul');
    if (list) {
      list.className = 'footer-social';
      list.querySelectorAll('a').forEach((a) => {
        const img = a.querySelector('img');
        if (img && img.alt) {
          a.setAttribute('aria-label', img.alt);
          img.alt = '';
        }
      });
      wrapper.append(list);
    }
  }
  if (bottom) {
    const bar = el('div', 'footer-bottom', ...bottom.childNodes);
    const copy = bar.querySelector('p');
    if (copy) copy.classList.add('footer-copyright');
    const legal = bar.querySelector('ul');
    if (legal) legal.classList.add('footer-legal');
    wrapper.append(bar);
  }
  block.append(wrapper);
}
