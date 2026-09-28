/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: compliancesigns.com site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html unless noted.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays / widgets that can block parsing or leak into content.
    WebImporter.DOMUtils.remove(element, [
      // Cookiebot (cleaned.html: #CybotCookiebotDialog, #CybotCookiebotDialogBodyUnderlay, iframes at page end)
      '#CybotCookiebotDialog',
      '#CybotCookiebotDialogBodyUnderlay',
      'iframe.CybotCookiebotHiddenIframe',
      'iframe.CybotCookiebotOffscreenIframe',
      // UserWay accessibility widget (cleaned.html: .uw-sl skip links, .uwy menu, reading/ruler guides)
      '.uw-sl',
      '.uwy',
      '.uw-s10-bottom-ruler-guide',
      '.uw-s10-right-ruler-guide',
      '.uw-s10-left-ruler-guide',
      '.uw-s10-reading-guide',
      '.uw-s12-tooltip',
      // HubSpot web interactives (cleaned.html: #hs-web-interactives-top-push-anchor, -top-anchor, -bottom-anchor, -floating-container)
      '[id^="hs-web-interactives"]',
      // Magento Page Builder: responsive duplicate images (cleaned.html: img.pagebuilder-mobile-hidden + img.pagebuilder-mobile-only pairs
      // with identical src in .home-shop-category and .home-why-csign). Keep the desktop copy only.
      'img.pagebuilder-mobile-only',
      // Promo mosaic: keep only .banner-desktop (cleaned.html: .home-banner-section > .banner-desktop);
      // any responsive/mobile duplicate sibling rendered on the live page is dropped.
      '.home-banner-section > :not(.banner-desktop)',
      // Reviews slider (slick): cloned slides and prev/next arrows (cleaned.html: button.slick-arrow.slick-prev/.slick-next)
      '.home-customer-review .slick-cloned',
      '.home-customer-review .slick-arrow',
      // Inline Page Builder <style> blocks inside tab panels (block-context/cards-industry/source.html), scripts
      'style',
      'script',
      'noscript',
    ]);

    // Cookiebot/UserWay lock scrolling on <body style="overflow: hidden;"> (cleaned.html line 1)
    const body = element.ownerDocument && element.ownerDocument.body;
    if (body && body.style && body.style.overflow === 'hidden') body.style.overflow = 'auto';
  }

  if (hookName === TransformHook.afterTransform) {
    // Global chrome / non-authorable content.
    WebImporter.DOMUtils.remove(element, [
      '.top-bar-header', // free-shipping strip above header
      '#main-header', // site header + nav
      '.menu-spacing',
      '#new_footer', // site footer
      '#searchspring-div', // empty Searchspring PLP container after main
      '#bottom-banner',
      'next-route-announcer', // Next.js a11y route announcer
      '[id^="batBeacon"]', // Bing UET tracking pixels (cleaned.html: #batBeacon510011893555 etc.)
      // Tracking pixels reported on the live page (stripped from cleaned.html by the scraper)
      'img[src*="track.hubspot.com"]',
      'img[src*="hsforms.com"]',
      'img[src*="hsforms.net"]',
      'iframe',
      'noscript',
      'link',
    ]);
  }
}
