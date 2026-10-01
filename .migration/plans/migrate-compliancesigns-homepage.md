# Plan: Migrate the compliancesigns.com Homepage to dajustrite

## Overview
Bring the homepage of **https://www.compliancesigns.com/** into the **dajustrite** Document Authoring site as the main homepage (`/index`). The page content will be split into Edge Delivery blocks styled to match the original. You asked for the Commerce add-on, so product and listing content on the page will be checked and handled by the commerce workflow.

**Your choices**
| Decision | Choice |
|---|---|
| Target page | Site homepage (`/index`), which replaces the current homepage content |
| Commerce add-on | Enable it |
| Scope | Page content and blocks only. Header/navigation, footer and publishing to Document Authoring are not included |

## Current Project State
- The site uses Document Authoring (content source: `nichols5973/dajustrite`).
- These blocks already exist and can be reused: hero, cards, columns, teaser, product-grid, tabs, table, faq, embed, fragment, modal, form, search, header and footer.
- The Commerce add-on is not enabled yet. Turning it on is the first step and needs Execute mode.

## Approach
1. **Enable Commerce add-on**: Add the commerce plugin to the project's agent settings. The add-on becomes available on your next message, so the migration continues from there.
2. **Commerce classification**: Check whether the homepage counts as a product or listing page. A homepage usually counts as a normal page that contains product-like sections, so it will most likely go through the standard migration. Any product carousels or tiles will be flagged so the commerce workflow can handle them.
3. **Page analysis**: Scrape the page with its images and metadata, then map out its sections: hero or promo banner, category tiles, featured products, trust or benefit strips, promotional text and so on. Give each block variant a name.
4. **Block mapping**: Match each section to an existing block (hero, cards, columns, product-grid, teaser) and create new variants only where nothing existing fits.
5. **Block generation and styling**: Build or update the block code and CSS so they match the original site's look on mobile, tablet and desktop (600/900/1200px breakpoints).
6. **Import infrastructure**: Generate an import script: block parsers plus cleanup and section transformers.
7. **Content import**: Run the import to produce the `/index` page content.
8. **Preview and visual check**: Render the page in the local preview, compare it with the original, and fix any differences in layout, spacing, colors or missing content.
9. **Quality checks**: Run lint, check the heading order, confirm every image has alt text, and confirm no user-facing text is hard-coded in code.

## Out of Scope (not selected)
- Header and mega-menu rebuild
- Footer rebuild
- Uploading or publishing the page to Document Authoring. The page stays in the local preview until you ask me to publish it.

## Risks / Notes
- **Bot protection:** Store sites often block scrapers. If the page can't be fetched directly, I'll fall back to a protected-site scraping method.
- **Dynamic product content:** Prices, stock and personalized recommendations won't carry over as live data. They'll be captured as they appear at migration time, or handled by the commerce workflow if it applies.
- **Replacing the homepage:** Whatever is currently on `/index` will be replaced.
- **Links:** Product and category links will point to the original compliancesigns.com URLs unless you want to change that.

## Checklist
- [ ] Switch to Execute mode (needed before anything below can run)
- [ ] Enable the Commerce add-on in the project's agent settings, then send one more message so it loads
- [ ] Run the commerce classification on the compliancesigns.com homepage and route it to the standard or commerce migration
- [ ] Scrape the homepage (content, images, metadata, screenshots)
- [ ] Analyze the page structure and name the block variants for each section
- [ ] Map sections to existing blocks and list any new variants needed
- [ ] Generate or augment block code (JS/CSS) for all variants
- [ ] Match the block styling to the original site (mobile and desktop)
- [ ] Generate the import parsers and transformers and bundle the import script
- [ ] Run the content import to create the `/index` page
- [ ] Preview the page and compare it with the original, section by section
- [ ] Fix visual or content differences found in the comparison
- [ ] Run lint and accessibility checks (heading order, alt text)
- [ ] Summarize the results and suggest optional next steps (header, footer, publishing to Document Authoring)
