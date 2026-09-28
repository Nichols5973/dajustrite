/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-review. Base: cards. Source: https://www.compliancesigns.com/
 * Instance selector: .home-customer-review .reviews-list
 *
 * Source structure (block-context/cards-review/source.html, react-slick slider):
 *   .reviews-list > .slick-slider > .slick-list > .slick-track > .slick-slide x N
 *   .slick-slide > div > .review-item
 *     > .title ("Easy to find products")
 *     > .content > .review-content > .review-rating > span.rating-star (CSS background star icon)
 *                                  > .review-text
 *                                  > .review-author
 *   Cleanup transformer removes .slick-cloned slides and .slick-arrow buttons.
 *   Empty (not yet rendered) .slick-slide elements are skipped because iteration is keyed
 *   on .review-item.
 *
 * Output: one row per review: [star-rating image] | [bold quoted title, review text, author].
 * The rating is CSS-only on the source (no <img>), so the site's star icon
 * (https://www.compliancesigns.com/images/icons/star.svg) is emitted as the rating image.
 */
const ORIGIN = 'https://www.compliancesigns.com';
const STAR_ICON = `${ORIGIN}/images/icons/star.svg`;

function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function para(document, text) {
  const p = document.createElement('p');
  p.textContent = text;
  return p;
}

function ratingImage(document, item) {
  const rating = item.querySelector('.review-rating');
  if (!rating) return '';
  // The scraper / html2md may materialise the CSS background of the rating track as an
  // <img> (star-empty.svg). Ignore it and always emit the filled star icon.
  const labelled = rating.querySelector('[aria-label], [title], [data-rating]') || rating;
  const label = clean(
    labelled.getAttribute('aria-label')
    || labelled.getAttribute('title')
    || (labelled.getAttribute('data-rating') ? `${labelled.getAttribute('data-rating')} star rating` : ''),
  );
  const img = document.createElement('img');
  img.src = STAR_ICON;
  img.alt = label || 'Star rating';
  return img;
}

export default function parse(element, { document }) {
  // Skip slick clones in case cleanup did not run.
  let items = [...element.querySelectorAll('.review-item')].filter((el) => !el.closest('.slick-cloned'));
  if (!items.length) items = [...element.querySelectorAll('.slick-slide:not(.slick-cloned) > div')];

  const cells = [];
  items.forEach((item) => {
    const title = clean((item.querySelector(':scope > .title, .title') || {}).textContent);
    const text = clean((item.querySelector('.review-text') || {}).textContent);
    const author = clean((item.querySelector('.review-author') || {}).textContent);
    if (!title && !text) return;

    const content = [];
    if (title) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = title;
      p.append(strong);
      content.push(p);
    }
    if (text) content.push(para(document, text));
    if (author) content.push(para(document, author));

    cells.push([ratingImage(document, item), content]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-review', cells });
  element.replaceWith(block);
}
