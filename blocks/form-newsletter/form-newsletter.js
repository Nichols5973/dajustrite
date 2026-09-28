import decorateForm from '../form/form.js';

/**
 * Newsletter sign-up form.
 * Content contract (same as the base form block): the block contains a link to a
 * form-definition sheet/JSON (fields: firstname, lastname, email [required],
 * industry [select], submit) and, optionally, a second link to the submission endpoint.
 * Field labels, placeholders, options and button text all come from that sheet, so no
 * user-facing strings live in code. This variant only changes the layout
 * (single inline row on desktop), so it reuses the base form builder.
 * @param {Element} block
 */
export default function decorate(block) {
  decorateForm(block);
}
