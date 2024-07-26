require("formBuilder/dist/form-render.min.js")
import {register as registerRichTextPlugin} from "src/decidim/decidim_awesome/forms/rich_text_plugin"
import {register as registerAttachFilePlugin} from "src/decidim/decidim_awesome/forms/attach_file"
import {register as registerBudgetField} from "src/decidim/decidim_awesome/forms/budget_field"

import CustomFieldsRenderer from "src/decidim/decidim_awesome/forms/custom_fields_renderer"

const customFieldsRenderers = window.DecidimAwesome.CustomFieldsRenderer || []

jQuery(($) => {
  registerRichTextPlugin();
  registerAttachFilePlugin();
  registerBudgetField();
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
