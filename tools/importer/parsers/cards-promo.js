/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-promo. Base: cards. Source: https://www.compliancesigns.com/
 * Instance selector: .home-banner-section .banner-desktop
 *
 * Source structure (block-context/cards-promo/source.html):
 *   .banner-desktop > .banner-desktop-left > a.banner-item (feature tile)
 *                   > .banner-desktop-right > a.banner-item x3
 *   a.banner-item > img.home-banner-image + .banner-text > h2.banner-title, p.banner-desc, span.button-orange
 *
 * Output: one row per tile: [image] | [h2 heading, description paragraph, CTA link].
 * Iteration is keyed on the inner .banner-text wrapper (not the a.banner-item anchors) so
 * html2md inline-element merging can never collapse tiles.
 */
const ORIGIN = 'https://www.compliancesigns.com';

function absUrl(href) {
  try { return new URL(href, ORIGIN).href; } catch (e) { return href; }
}

export default function parse(element, { document }) {
  let bodies = [...element.querySelectorAll('.banner-text')];
  if (!bodies.length) {
    bodies = [...element.querySelectorAll('a.banner-item')];
  }

  const cells = [];
  bodies.forEach((body) => {
    const tile = body.closest('a.banner-item, a[href]') || body.parentElement;
    const href = tile && tile.getAttribute('href');

    // Image: sibling of .banner-text inside the tile anchor
    let img = null;
    let prev = body.previousElementSibling;
    while (prev && !img) {
      img = prev.matches('img') ? prev : prev.querySelector('img');
      prev = prev.previousElementSibling;
    }
    if (!img && tile) img = tile.querySelector('img');

    const content = [];
    const titleEl = body.querySelector('.banner-title, h1, h2, h3, h4');
    if (titleEl) {
      const h2 = document.createElement('h2');
      h2.textContent = titleEl.textContent.trim();
      content.push(h2);
    }
    const descEl = body.querySelector('.banner-desc, p');
    if (descEl && descEl.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = descEl.textContent.trim();
      content.push(p);
    }
    const ctaEl = body.querySelector('.button-orange, [class*="button"]');
    const ctaText = ctaEl ? ctaEl.textContent.trim() : '';
    if (href) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = absUrl(href);
      a.textContent = ctaText || (titleEl ? titleEl.textContent.trim() : href);
      p.append(a);
      content.push(p);
    }

    if (!img && !content.length) return;
    cells.push([img || '', content]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo', cells });
  element.replaceWith(block);
}
