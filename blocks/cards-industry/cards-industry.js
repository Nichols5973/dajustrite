import { buildCardList, unbuttonLink } from '../../scripts/shared.js';

/**
 * Tag a product tile body: price (first element without a link), title (first link,
 * rendered as a plain link) and CTA (last link, kept as a button).
 * @param {Element} body
 */
function tagProductBody(body) {
  const price = [...body.children].find((el) => !el.querySelector('a[href]') && el.textContent.trim());
  if (price) {
    price.classList.add('cards-industry-card-price');
    // style the amount apart from its authored label (e.g. "From $7.00")
    const [, label, amount] = price.textContent.trim().match(/^(.*?)\s*(\S*\d[\d.,]*\S*)$/) || [];
    if (amount && price.children.length === 0) {
      const amountEl = document.createElement('span');
      amountEl.className = 'cards-industry-card-amount';
      amountEl.textContent = amount;
      price.replaceChildren(...(label ? [`${label} `] : []), amountEl);
    }
  }

  const links = [...body.querySelectorAll('a[href]')];
  const [title] = links;
  if (title) {
    unbuttonLink(title);
    title.closest('.cards-industry-card-body > *')?.classList.add('cards-industry-card-title');
  }
  if (links.length > 1) {
    links[links.length - 1].closest('.cards-industry-card-body > *')?.classList.add('cards-industry-card-cta');
  }
}

/**
 * Industry panel: row 1 is the industry banner tile [photo] | [industry name, "Shop All" link];
 * the remaining rows are product tiles [product image] | [price, title link, CTA link].
 * Used once per tab panel (section-driven tabs), so each panel is its own block instance.
 * @param {Element} block
 */
export default function decorate(block) {
  const list = buildCardList(block, 'cards-industry', { imageWidth: '500' });

  [...list.children].forEach((card, index) => {
    const body = card.querySelector('.cards-industry-card-body');
    if (index === 0) {
      card.classList.add('cards-industry-card-featured');
      const links = body ? [...body.querySelectorAll('a[href]')] : [];
      const cta = links[links.length - 1];
      if (cta) cta.classList.add('cards-industry-card-featured-link');
    } else if (body) {
      tagProductBody(body);
    }
  });

  block.replaceChildren(list);
}
