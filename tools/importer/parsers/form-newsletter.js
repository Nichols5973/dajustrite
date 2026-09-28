/* eslint-disable */
/* global WebImporter */
/**
 * Parser for form-newsletter. Base: form. Source: https://www.compliancesigns.com/
 * Instance selectors: #my_email_sub_form_footer, .home-sign-up form
 *
 * Source structure (block-context/form-newsletter/source.html): HubSpot embedded form
 *   #my_email_sub_form_footer > form.hs-form[data-portal-id][data-form-id]
 *     fieldset > .hs_firstname input[name=firstname], .hs_lastname input[name=lastname]
 *     fieldset > .hs_email input[name=email][required], select[name="0-2/industry"] (~230 options)
 *     .hs_submit input[type=submit]
 *
 * Block contract (blocks/form-newsletter/README.md): one row, one cell containing a link to the
 * form-definition sheet (fields, labels, options and button text live in the sheet), optionally
 * followed by a link to a submission endpoint. The fields are NOT emitted inline.
 *
 * The HubSpot endpoint is not emitted as the submit link: blocks/form posts
 * JSON `{ data }`, which the HubSpot multipart endpoint does not accept, so the
 * submission endpoint is configured later by the author.
 */
const FORM_DEFINITION_PATH = '/forms/newsletter.json';

export default function parse(element, { document }) {
  const form = element.matches('form') ? element : element.querySelector('form');
  const hasFields = form && form.querySelector('input[name="email"], input[type="email"], input, select');
  if (!hasFields) {
    // Not a rendered form (e.g. empty HubSpot root) - leave nothing behind.
    element.remove();
    return;
  }

  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = FORM_DEFINITION_PATH;
  a.textContent = FORM_DEFINITION_PATH;
  p.append(a);

  const cells = [[[p]]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'form-newsletter', cells });
  element.replaceWith(block);
}
