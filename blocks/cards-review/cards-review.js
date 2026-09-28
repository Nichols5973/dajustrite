import { getMetadata } from '../../scripts/aem.js';
import { buildCardList, createTag } from '../../scripts/shared.js';

let instanceCount = 0;

/**
 * Accessible name for a slider button. Uses the configurable page metadata label
 * (`slider-previous` / `slider-next`) when present; otherwise falls back to the
 * title of the review the button scrolls to (content-derived, no hard-coded text).
 * @param {string} configured
 * @param {Element} [targetCard]
 * @returns {string}
 */
function buttonLabel(configured, targetCard) {
  if (configured) return configured;
  const title = targetCard?.querySelector('.cards-review-card-title');
  return (title || targetCard)?.textContent.trim() || '';
}

/**
 * Reviews slider: each row is [star-rating image] | [bold title, review text, author].
 * Renders as a horizontally scrolling, snap-aligned list with previous/next buttons.
 * @param {Element} block
 */
export default function decorate(block) {
  instanceCount += 1;
  const list = buildCardList(block, 'cards-review', { imageWidth: '200' });
  list.id = `cards-review-list-${instanceCount}`;
  const cards = [...list.children];

  cards.forEach((card) => {
    // rating image is a single star; CSS repeats it across the rating width
    const ratingImg = card.querySelector('.cards-review-card-image img');
    if (ratingImg) {
      card.querySelector('.cards-review-card-image')
        .style.setProperty('--cards-review-rating', `url("${ratingImg.src}")`);
    }

    const body = card.querySelector('.cards-review-card-body');
    if (!body) return;
    const parts = [...body.children];
    // title goes above the stars, author is the last line
    if (parts.length > 1) {
      parts[0].classList.add('cards-review-card-title');
      card.prepend(parts[0]);
      parts[parts.length - 1].classList.add('cards-review-card-author');
    }
  });

  const labels = {
    prev: getMetadata('slider-previous'),
    next: getMetadata('slider-next'),
  };
  const prev = createTag('button', { type: 'button', class: 'cards-review-prev', 'aria-controls': list.id });
  const next = createTag('button', { type: 'button', class: 'cards-review-next', 'aria-controls': list.id });

  const step = () => (cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : list.clientWidth);
  const currentIndex = () => Math.round(list.scrollLeft / (step() || 1));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const update = () => {
    const index = currentIndex();
    const maxScroll = list.scrollWidth - list.clientWidth;
    prev.disabled = list.scrollLeft <= 1;
    next.disabled = list.scrollLeft >= maxScroll - 1;
    prev.setAttribute('aria-label', buttonLabel(labels.prev, cards[Math.max(index - 1, 0)]));
    next.setAttribute('aria-label', buttonLabel(labels.next, cards[Math.min(index + 1, cards.length - 1)]));
  };

  const go = (direction) => {
    const target = Math.min(Math.max(currentIndex() + direction, 0), cards.length - 1);
    list.scrollTo({
      left: cards[target] ? cards[target].offsetLeft - cards[0].offsetLeft : 0,
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
    });
  };

  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));

  let frame;
  list.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  }, { passive: true });
  new ResizeObserver(update).observe(list);

  block.replaceChildren(prev, list, next);
  update();
}
