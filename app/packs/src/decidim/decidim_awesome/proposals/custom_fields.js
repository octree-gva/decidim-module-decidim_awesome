import CustomFieldsRenderer from "src/decidim/decidim_awesome/forms/custom_fields_renderer"

const customFieldsRenderers = window.DecidimAwesome.CustomFieldsRenderer || []

$(() => {
  // use admin multilang specs if exists
  let $customFieldElements = $(".proposal_custom_field", ".tabs-title.is-active");
  if (!$customFieldElements.length) {
    $customFieldElements = $(".proposal_custom_field");
  }
  $customFieldElements.each((index, element) => {
    if(index >= customFieldsRenderers.length) {
      const $element = $(element)
      const renderer = new CustomFieldsRenderer(`#${$element.attr("id")}`)
      customFieldsRenderers.push(renderer);
      renderer.init($element);
    }
  })

  if(customFieldsRenderers.length > 0){
    customFieldsRenderers[0].$container.closest("form").on("submit", async (evt) => {
        evt.preventDefault();
        if (evt.target.checkValidity()) {
          // save current editor
          await Promise.all(customFieldsRenderers.map(async (renderer) => {
            await renderer.storeData()
          }))
          evt.target.submit();
        } else {
          evt.target.reportValidity();
        }
      });
  }
});


window.DecidimAwesome.CustomFieldsRenderer = customFieldsRenderers;
