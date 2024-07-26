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
  console.log("awesome::customfield: Form render ready")
  // use admin multilang specs if exists
  let $customFieldElements = $(".proposal_custom_field", ".tabs-title.is-active");
  if (!$customFieldElements.length) {
    console.warn("awesome::customfield: fallback: get .proposal_custom_field")
    $customFieldElements = $(".proposal_custom_field");
  }
  const initFunctions = [];
  $customFieldElements.each((index, element) => {
    console.log(`awesome::customfield: ${index}: mount renderer #${$(element).attr("id")}`)
    const $element = $(element)
    if($element.hasClass("proposal_custom_field--empty")){
      console.warn(`awesome::customfield: skip empty #${$(element).attr("id")}`)
      return;
    }
    const renderer = new CustomFieldsRenderer(`#${$element.attr("id")}`)
    customFieldsRenderers.push(renderer);
    initFunctions.push(() => renderer.init($element));
  })
  console.log(`awesome::customfield: initializing ${initFunctions.length} forms `)
  Promise.all(
    initFunctions.map((func) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          func();
          resolve();
        }, 64)
      })
    })
  ).then(() => {
    console.log(`awesome::customfield: form initialized `)

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
  window.DecidimAwesome.CustomFieldsRenderer = customFieldsRenderers;
});


