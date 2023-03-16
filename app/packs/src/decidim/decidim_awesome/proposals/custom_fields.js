import CustomFieldsRenderer from "src/decidim/decidim_awesome/forms/custom_fields_renderer"

window.DecidimAwesome.CustomFieldsRenderer = window.DecidimAwesome.CustomFieldsRenderer || new CustomFieldsRenderer();

$(() => {
  // use admin multilang specs if exists
  let $el = $("proposal_custom_field:first", ".tabs-title.is-active");
  if (!$el.length) {
    $el = $(".proposal_custom_field:first");
  }
  window.DecidimAwesome.CustomFieldsRenderer.init($el);

  window.DecidimAwesome.CustomFieldsRenderer.$container.closest("form").on("submit", async function (evt) {
    if (evt.target.checkValidity()) {
      evt.preventDefault();
      const form = this;
      await window.DecidimAwesome.CustomFieldsRenderer.storeData();
      form.submit();
    } else {
      evt.preventDefault();
      evt.target.reportValidity();
    }
  });
});
