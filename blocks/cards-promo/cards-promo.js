import { buildCardList } from '../../scripts/shared.js';

/**
 * Promo mosaic: each row is a promo tile [image] | [heading, text, CTA].
 * The first tile is the large feature tile; the image sits behind the text.
 * The primary CTA link is stretched over the whole tile so the tile is clickable.
 * @param {Element} block
 */
export default function decorate(block) {
  const list = buildCardList(block, 'cards-promo', { imageWidth: '1200', eagerFirst: true });

  [...list.children].forEach((card, index) => {
    if (index === 0) card.classList.add('cards-promo-card-featured');
    const body = card.querySelector('.cards-promo-card-body');
    const links = body ? [...body.querySelectorAll('a[href]')] : [];
    const cta = links[links.length - 1];
    if (cta) cta.classList.add('cards-promo-card-cta');
  });

  block.replaceChildren(list);
}
