/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-industry. Base: cards. Source: https://www.compliancesigns.com/
 * Instance selector: .home-food-service .tab-content (one instance per industry tab;
 * the sections transformer stashes all 4 panels and moves each ".bt-view-all" Shop All
 * link out of the panel before parsing, so it is not handled here).
 *
 * Source structure (block-context/cards-industry/source.html):
 *   .tab-content > .home-tab-N > ... .pagebuilder-column
 *     > [data-content-type="banner"] > a[href] (industry page)
 *         > .pagebuilder-banner-wrapper[data-background-images='{"desktop_image":"..."}']
 *             ... .pagebuilder-poster-content p.cate-name (industry name) + span.button-orange ("Shop All")
 *     > [data-content-type="products"] .products-grid li.product-item x4 (same markup as cards-product)
 *
 * The banner photo is a CSS background (inline <style> is stripped by cleanup), so it is
 * read from data-background-images and emitted as an <img>.
 *
 * Output: row 1: [industry photo] | [industry name, 'Shop All' link];
 *         rows 2+: [product image] | [price, product title link, 'Select Options' link].
 */
const ORIGIN = 'https://www.compliancesigns.com';

function absUrl(href) {
  try { return new URL(href, ORIGIN).href; } catch (e) { return href; }
}

function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function linkPara(document, href, text) {
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = absUrl(href);
  a.textContent = text;
  p.append(a);
  return p;
}

function bannerImageUrl(banner) {
  const wrappers = [banner, ...banner.querySelectorAll('[data-background-images], [style*="background-image"]')];
  for (const el of wrappers) {
    const data = el.getAttribute && el.getAttribute('data-background-images');
    if (data) {
      const m = data.match(/(?:https?:)?\/\/[^"'\\\s)]+/);
      if (m) return m[0];
    }
    const style = el.getAttribute && el.getAttribute('style');
    if (style) {
      const m = style.match(/background-image:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
      if (m) return m[1];
    }
  }
  const img = banner.querySelector('img');
  return img ? img.getAttribute('src') : '';
}

function buildBannerRow(document, banner) {
  const link = banner.matches('a[href]') ? banner : banner.querySelector('a[href]');
  const nameEl = banner.querySelector('.cate-name') || banner.querySelector('.pagebuilder-poster-content p');
  const ctaEl = banner.querySelector('.button-orange') || banner.querySelector('[class*="button"]');
  const name = nameEl ? clean(nameEl.textContent) : '';

  const src = bannerImageUrl(banner);
  let img = '';
  if (src) {
    img = document.createElement('img');
    img.src = absUrl(src);
    img.alt = '';
  }

  const content = [];
  if (name) {
    const p = document.createElement('p');
    p.textContent = name;
    content.push(p);
  }
  if (link) {
    content.push(linkPara(document, link.getAttribute('href'), (ctaEl && clean(ctaEl.textContent)) || name));
  }
  if (!img && !content.length) return null;
  return [img, content.length ? content : ''];
}

function priceText(item) {
  const box = item.querySelector('.price-box');
  if (!box) return '';
  const label = box.querySelector('.price-label');
  const price = box.querySelector('.price');
  if (price) return clean(`${label ? label.textContent : ''} ${price.textContent}`);
  return clean(box.textContent);
}

function buildProductRow(document, item) {
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
  if (title && titleHref) content.push(linkPara(document, titleHref, title));
  if (cta && cta.getAttribute('href')) content.push(linkPara(document, cta.getAttribute('href'), clean(cta.textContent)));

  if (!img && !content.length) return null;
  return [img || '', content.length ? content : ''];
}

export default function parse(element, { document }) {
  const cells = [];

  // Row 1: industry banner tile
  const banner = element.querySelector('[data-content-type="banner"]')
    || (element.querySelector('.pagebuilder-banner-wrapper') && element.querySelector('.pagebuilder-banner-wrapper').closest('a[href]'));
  if (banner) {
    const row = buildBannerRow(document, banner);
    if (row) cells.push(row);
  }

  // Rows 2+: product tiles
  let items = [...element.querySelectorAll('li.product-item')];
  if (!items.length) items = [...element.querySelectorAll('.product-item-info')];
  items.forEach((item) => {
    const row = buildProductRow(document, item);
    if (row) cells.push(row);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-industry', cells });
  element.replaceWith(block);
}
