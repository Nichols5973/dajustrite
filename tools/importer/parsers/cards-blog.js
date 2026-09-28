/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-blog. Base: cards. Source: https://www.compliancesigns.com/
 * Instance selector: .home-lastest-blogs .blogs
 *
 * Source structure (block-context/cards-blog/source.html):
 *   .blogs > .blog-left > .blog-item (featured)
 *          > .blog-right > .blog-item x2
 *   .blog-item > .blog-img > img
 *              > .blog-inf > h3.blog-title, p.blog-desc, a.read-more ("Read More")
 *
 * Output: one row per article: [article image] | [h3 title, excerpt paragraph, 'Read More' link].
 * Document order keeps the featured (.blog-left) teaser as row 1.
 *
 * Some source image URLs are double-prefixed
 * (https://media.compliancesigns.com/media/https://www.compliancesigns.com/blog/...);
 * the inner absolute URL is used in that case.
 */
const ORIGIN = 'https://www.compliancesigns.com';

function absUrl(href) {
  try { return new URL(href, ORIGIN).href; } catch (e) { return href; }
}

function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function fixImageSrc(img) {
  const src = img.getAttribute('src') || '';
  const idx = src.lastIndexOf('https://');
  if (idx > 0) img.setAttribute('src', src.slice(idx));
  return img;
}

export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('.blog-item')];
  if (!items.length) items = [...element.querySelectorAll('.blog-inf')].map((inf) => inf.parentElement);

  const cells = [];
  items.forEach((item) => {
    const img = item.querySelector('.blog-img img') || item.querySelector('img');
    const titleEl = item.querySelector('.blog-title, h3, h2, h4');
    const descEl = item.querySelector('.blog-desc, p');
    const more = item.querySelector('a.read-more') || item.querySelector('a[href]');

    const content = [];
    const title = titleEl ? clean(titleEl.textContent) : '';
    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title;
      content.push(h3);
    }
    const desc = descEl ? clean(descEl.textContent) : '';
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc;
      content.push(p);
    }
    if (more && more.getAttribute('href')) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = absUrl(more.getAttribute('href'));
      a.textContent = clean(more.textContent) || title;
      p.append(a);
      content.push(p);
    }

    if (!img && !content.length) return;
    cells.push([img ? fixImageSrc(img) : '', content.length ? content : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-blog', cells });
  element.replaceWith(block);
}
