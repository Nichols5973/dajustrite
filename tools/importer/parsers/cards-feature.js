/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-feature. Base: cards. Source: https://www.compliancesigns.com/
 * Instance selector: .home-why-csign .pagebuilder-column-group
 *
 * Source structure (block-context/cards-feature/source.html, Magento Page Builder):
 *   .pagebuilder-column-group > .pagebuilder-column x4
 *   .pagebuilder-column > figure > img.pagebuilder-mobile-hidden (+ .pagebuilder-mobile-only, removed by cleanup)
 *                       > h3[data-content-type="heading"]
 *                       > div[data-content-type="text"] > p
 *
 * Output: one row per feature: [icon image] | [h3 title, description].
 */
function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

export default function parse(element, { document }) {
  let columns = [...element.querySelectorAll(':scope > .pagebuilder-column')];
  if (!columns.length) columns = [...element.querySelectorAll('.pagebuilder-column, [data-content-type="column"]')];

  const cells = [];
  columns.forEach((col) => {
    const img = col.querySelector('img:not(.pagebuilder-mobile-only)') || col.querySelector('img');
    const headingEl = col.querySelector('[data-content-type="heading"], h3, h2, h4');
    // Page Builder text wrapper; data-* attributes may be stripped, so fall back to the
    // first direct child <div> holding the description.
    const textEl = col.querySelector('[data-content-type="text"]')
      || [...col.querySelectorAll(':scope > div')].find((d) => clean(d.textContent));

    const content = [];
    const title = headingEl ? clean(headingEl.textContent) : '';
    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title;
      content.push(h3);
    }
    if (textEl) {
      const paras = [...textEl.querySelectorAll('p')].filter((p) => clean(p.textContent));
      if (paras.length) content.push(...paras);
      else if (clean(textEl.textContent)) {
        const p = document.createElement('p');
        p.textContent = clean(textEl.textContent);
        content.push(p);
      }
    }

    if (!img && !content.length) return;
    cells.push([img || '', content.length ? content : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
  element.replaceWith(block);
}
