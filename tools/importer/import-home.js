/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsPromoParser from './parsers/cards-promo.js';
import cardsCategoryParser from './parsers/cards-category.js';
import cardsProductParser from './parsers/cards-product.js';
import cardsIndustryParser from './parsers/cards-industry.js';
import cardsReviewParser from './parsers/cards-review.js';
import cardsBlogParser from './parsers/cards-blog.js';
import formNewsletterParser from './parsers/form-newsletter.js';
import cardsFeatureParser from './parsers/cards-feature.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/compliancesigns-cleanup.js';
import sectionsTransformer from './transformers/compliancesigns-sections.js';

// PARSER REGISTRY
const parsers = {
  'cards-promo': cardsPromoParser,
  'cards-category': cardsCategoryParser,
  'cards-product': cardsProductParser,
  'cards-industry': cardsIndustryParser,
  'cards-review': cardsReviewParser,
  'cards-blog': cardsBlogParser,
  'form-newsletter': formNewsletterParser,
  'cards-feature': cardsFeatureParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'home',
  description: 'ComplianceSigns homepage: promo tile mosaic, category grid, best sellers, industry tabs, reviews slider, blog teasers, newsletter sign-up and brand value props',
  urls: [
    'https://www.compliancesigns.com/',
  ],
  blocks: [
    { name: 'cards-promo', instances: ['.home-banner-section .banner-desktop'] },
    { name: 'cards-category', instances: ['.home-shop-category .pagebuilder-column-group'] },
    { name: 'cards-product', instances: ['.home-best-seller .products-grid'] },
    { name: 'cards-industry', instances: ['.home-food-service .tab-content'] },
    { name: 'cards-review', instances: ['.home-customer-review .reviews-list'] },
    { name: 'cards-blog', instances: ['.home-lastest-blogs .blogs'] },
    { name: 'form-newsletter', instances: ['#my_email_sub_form_footer', '.home-sign-up form'] },
    { name: 'cards-feature', instances: ['.home-why-csign .pagebuilder-column-group'] },
  ],
  sections: [
    {
      id: '1',
      name: 'Promo banner mosaic',
      selector: ['.home-banner-section'],
      style: null,
      blocks: ['cards-promo'],
      defaultContent: [],
    },
    {
      id: '2',
      name: 'Shop by Category',
      selector: ['.home-shop-category'],
      style: 'light-blue',
      blocks: ['cards-category'],
      defaultContent: [
        '.home-shop-category h1',
        '.home-shop-category h2',
        ".home-shop-category a[href*='safety-5s-product-types']",
      ],
    },
    {
      id: '3',
      name: 'Best Sellers',
      selector: ['.home-best-seller'],
      style: 'grey',
      blocks: ['cards-product'],
      defaultContent: ['.home-best-seller h2'],
    },
    {
      id: '4',
      name: 'Industry tabs',
      selector: ['.home-food-service'],
      style: 'light-blue',
      blocks: ['cards-industry'],
      defaultContent: [
        '.home-food-service h2',
        ".home-food-service .tab-content a[href*='compliancesigns.com/']",
      ],
    },
    {
      id: '5',
      name: 'Customer reviews',
      selector: ['.home-customer-review'],
      style: 'dark',
      blocks: ['cards-review'],
      defaultContent: [
        '.home-customer-review .review-left',
        '.home-customer-review p.trustpilot-text',
      ],
    },
    {
      id: '6',
      name: 'News & Resources',
      selector: ['.home-lastest-blogs'],
      style: 'grey',
      blocks: ['cards-blog'],
      defaultContent: [
        '.home-lastest-blogs h2',
        ".home-lastest-blogs a[href$='/blog/']",
      ],
    },
    {
      id: '7',
      name: 'Newsletter sign-up',
      selector: ['.home-sign-up'],
      style: 'newsletter',
      blocks: ['form-newsletter'],
      defaultContent: [
        '.home-sign-up > img',
        '.home-sign-up h2',
        '.home-sign-up .container-xl > div:nth-of-type(2)',
        '.home-sign-up .container-xl > div:nth-of-type(4)',
      ],
    },
    {
      id: '8',
      name: 'Why ComplianceSigns',
      selector: ['.home-why-csign'],
      style: null,
      blocks: ['cards-feature'],
      defaultContent: [
        '.home-why-csign h2',
        '.home-why-csign .container-xl > div > div > div:nth-of-type(1) p',
      ],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, then sections (breaks + section metadata)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        // the same element may match several instance selectors
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  /**
   * Runs in the live page before transformation: scrolls to trigger lazy
   * sections, removes the Cookiebot overlay and stashes every industry tab panel.
   */
  onLoad: async ({ document }) => {
    await sectionsTransformer.preloadTabs(document);
  },

  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. beforeTransform transformers (cleanup, tab expansion, section breaks)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // already replaced by an earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform transformers (final cleanup + section metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    const meta = {};
    const title = document.querySelector('title');
    if (title) meta.Title = title.textContent.replace(/[\n\t]/gm, '').trim();
    const desc = document.querySelector('meta[name="description"], meta[property="og:description"]');
    if (desc) meta.Description = desc.content;
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && ogImage.content) {
      const img = document.createElement('img');
      img.src = ogImage.content;
      meta.Image = img;
    }
    // page template scopes the ComplianceSigns brand styling to this page
    meta.template = 'compliancesigns';
    main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path; root URL maps to /index
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
