import { buildCardList, createTag, unbuttonLink } from '../../scripts/shared.js';

/**
 * Split a price line such as "From $8.30" into a label and an amount so the
 * amount can be emphasised. Authored bold (<strong>/<b>) is used as the amount when present.
 * @param {Element} price
 */
function splitPrice(price) {
  const bold = price.querySelector('strong, b');
  if (bold) {
    bold.classList.add('cards-product-card-amount');
    return;
  }
  if (price.children.length) return;
  const match = price.textContent.trim().match(/^(.*?)\s*(\S*\d[\d.,]*\S*)$/);
  if (!match) return;
  const [, label, amount] = match;
  price.textContent = '';
  if (label) {
    price.append(createTag('span', { class: 'cards-product-card-price-label' }, label), ' ');
  }
  price.append(createTag('span', { class: 'cards-product-card-amount' }, amount));
}

/**
 * Tag the parts of a product tile body: price, title link and CTA.
 * - price: first element without a link (e.g. "From $8.30")
 * - title: first link, rendered as a plain text link
 * - cta: last link when there is more than one (e.g. "Select Options"), kept as a button
 * @param {Element} body
 */
function tagProductBody(body) {
  const children = [...body.children];
  const price = children.find((el) => !el.querySelector('a[href]') && el.textContent.trim());
  if (price) {
    price.classList.add('cards-product-card-price');
    splitPrice(price);
  }

  const links = [...body.querySelectorAll('a[href]')];
  const [title] = links;
  if (title) {
    unbuttonLink(title);
    title.closest('.cards-product-card-body > *')?.classList.add('cards-product-card-title');
  }
  if (links.length > 1) {
    links[links.length - 1].closest('.cards-product-card-body > *')?.classList.add('cards-product-card-cta');
  }
}

/**
 * Product tile grid: each row is [product image] | [price, title link, CTA link].
 * @param {Element} block
 */
export default function decorate(block) {
  const list = buildCardList(block, 'cards-product', { imageWidth: '500' });
  list.querySelectorAll('.cards-product-card-body').forEach(tagProductBody);
  block.replaceChildren(list);
}
