/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-product. Base: cards. Source: https://www.compliancesigns.com/
 * Instance selector: .home-best-seller .products-grid
 *
 * Source structure (block-context/cards-product/source.html, Magento product widget):
 *   .products-grid > ul.product-items > li.product-item x6
 *   li.product-item > .product-item-info
 *     > a.product-item-photo > .product-image-container > .product-image-wrapper > img.product-image-photo
 *     > .product-item-details
 *         > .price-box > .minimal-price > .price-label ("From" / "As low as") + .price ("$8.30")
 *         > strong.product-item-name > a.product-item-link (title)
 *         > .product-item-actions a.select-options ("Select Options")
 *
 * Output: one row per product: [product image] | [price paragraph, title link, CTA link].
 * Iteration keyed on li.product-item (block-level), never on anchors.
 */
const ORIGIN = 'https://www.compliancesigns.com';

function absUrl(href) {
  try { return new URL(href, ORIGIN).href; } catch (e) { return href; }
}

function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function priceText(item) {
  const box = item.querySelector('.price-box');
  if (!box) return '';
  const label = box.querySelector('.price-label');
  const price = box.querySelector('.price');
  if (price) return clean(`${label ? label.textContent : ''} ${price.textContent}`);
  return clean(box.textContent);
}

function link(document, href, text) {
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = absUrl(href);
  a.textContent = text;
  p.append(a);
  return p;
}

export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('li.product-item')];
  if (!items.length) items = [...element.querySelectorAll('.product-item-info')];

  const cells = [];
  items.forEach((item) => {
    const img = item.querySelector('img.product-image-photo') || item.querySelector('img');
    const titleLink = item.querySelector('a.product-item-link') || item.querySelector('.product-item-name a[href]');
    const photoLink = item.querySelector('a.product-item-photo');
    const cta = item.querySelector('a.select-options') || item.querySelector('.product-item-actions a[href]');

    const content = [];
    const price = priceText(item);
    if (price) {
      const p = document.createElement('p');
      p.textContent = price;
      content.push(p);
    }
    const title = titleLink ? clean(titleLink.textContent) || titleLink.getAttribute('title') : '';
    const titleHref = (titleLink && titleLink.getAttribute('href')) || (photoLink && photoLink.getAttribute('href'));
    if (title && titleHref) content.push(link(document, titleHref, title));
    if (cta && cta.getAttribute('href')) content.push(link(document, cta.getAttribute('href'), clean(cta.textContent)));

    if (!img && !content.length) return;
    cells.push([img || '', content.length ? content : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });
  element.replaceWith(block);
}
