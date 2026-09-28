/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-category. Base: cards. Source: https://www.compliancesigns.com/
 * Instance selector: .home-shop-category .pagebuilder-column-group
 *
 * Source structure (block-context/cards-category/source.html):
 *   .pagebuilder-column-group > .pagebuilder-column > figure[data-content-type="image"] x10
 *   figure > a[href] > img.pagebuilder-mobile-hidden (+ img.pagebuilder-mobile-only, removed by cleanup)
 *          + figcaption (category name)
 *
 * Output: one row per category: [image] | [linked caption text].
 * Iteration keyed on <figure> (block-level wrapper), never on the inner anchors.
 */
const ORIGIN = 'https://www.compliancesigns.com';

function absUrl(href) {
  try { return new URL(href, ORIGIN).href; } catch (e) { return href; }
}

export default function parse(element, { document }) {
  let figures = [...element.querySelectorAll('figure')];
  if (!figures.length) {
    figures = [...element.querySelectorAll('[data-content-type="image"]')];
  }

  const cells = [];
  figures.forEach((figure) => {
    const img = figure.querySelector('img:not(.pagebuilder-mobile-only)') || figure.querySelector('img');
    const link = figure.querySelector('a[href]');
    const captionEl = figure.querySelector('figcaption, [data-element="caption"]');
    const caption = captionEl ? captionEl.textContent.trim() : '';

    if (!img && !caption) return;

    const content = [];
    if (caption) {
      const p = document.createElement('p');
      if (link) {
        const a = document.createElement('a');
        a.href = absUrl(link.getAttribute('href'));
        a.textContent = caption;
        p.append(a);
      } else {
        p.textContent = caption;
      }
      content.push(p);
    }

    cells.push([img || '', content.length ? content : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-category', cells });
  element.replaceWith(block);
}
