import { buildCardList, unbuttonLink } from '../../scripts/shared.js';

/**
 * Category tile grid: each row is [image] | [linked caption].
 * The caption renders as a plain link stretched over the whole tile.
 * If only the image is linked, that image link is kept as-is.
 * @param {Element} block
 */
export default function decorate(block) {
  const list = buildCardList(block, 'cards-category', { imageWidth: '400' });

  list.querySelectorAll('.cards-category-card-body').forEach((body) => {
    const link = body.querySelector('a[href]');
    if (!link) return;
    unbuttonLink(link);
    link.classList.add('cards-category-card-link');
    // caption link covers the tile, so drop the duplicate image link from the tab order
    const imageLink = body.parentElement.querySelector('.cards-category-card-image a');
    if (imageLink) imageLink.replaceWith(...imageLink.childNodes);
  });

  block.replaceChildren(list);
}
