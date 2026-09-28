import { buildCardList } from '../../scripts/shared.js';

/**
 * Article teasers: each row is [article image] | [h3 title, excerpt, "Read More" link].
 * The first teaser is featured (large, left); the rest render as horizontal teasers.
 * @param {Element} block
 */
export default function decorate(block) {
  const list = buildCardList(block, 'cards-blog', { imageWidth: '900' });
  list.firstElementChild?.classList.add('cards-blog-card-featured');
  block.replaceChildren(list);
}
