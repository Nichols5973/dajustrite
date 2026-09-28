import { buildCardList } from '../../scripts/shared.js';

/**
 * Feature highlights: each row is [icon image] | [h3 title, description].
 * @param {Element} block
 */
export default function decorate(block) {
  block.replaceChildren(buildCardList(block, 'cards-feature', { imageWidth: '200' }));
}
