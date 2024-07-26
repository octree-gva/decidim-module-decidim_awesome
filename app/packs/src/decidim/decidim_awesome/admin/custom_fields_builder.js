require("formBuilder/dist/form-builder.min.js")
import {register as registerRichTextPlugin} from "src/decidim/decidim_awesome/forms/rich_text_plugin"
import {register as registerAttachFilePlugin} from "src/decidim/decidim_awesome/forms/attach_file"
import {register as registerBudgetField} from "src/decidim/decidim_awesome/forms/budget_field"

let CustomFieldsBuilders = window.CustomFieldsBuilders || {}
window.CustomFieldsBuilders = CustomFieldsBuilders;

$(() => {
  registerRichTextPlugin();
  registerAttachFilePlugin();
  registerBudgetField();

  $(".awesome-edit-config .proposal_custom_fields_container").each((_idx, el) => {
    
    const $container = $(el);
    const key = $container.data("key");
    $container.find(".proposal_custom_fields_editor").each((idx, editor) => {
      const editorKey = $(editor).data("key")
      // DOCS: https://formbuilder.online/docs
      CustomFieldsBuilders[`${key}${idx}`] =  {
        el: editor,
        key: `${key}${idx}`,
        input: `input[name="config[${editorKey}][${key}]"]`,
        config: {
          i18n: {
            locale: "en-US",
            location: "https://cdn.jsdelivr.net/npm/formbuilder-languages@1.1.0/"
          },
          formData: $(`input[name="config[${editorKey}][${key}]"]`).val(),
          disableFields: ["button", "file"],
          disabledActionButtons: ["save", "data", "clear"],
          disabledAttrs: [
            "access",
            "inline",
            "className"
          ],
          controlOrder: [
            "text",
            "textarea",
            "number",
            "date",
            "checkbox-group",
            "radio-group",
            "select",
            "autocomplete",
            "header",
            "paragraph"
          ],
          disabledSubtypes: {
            // default color as it generate hashtags in decidim (TODO: fix hashtag generator with this)
            text: ["color"], 
            // disable default wysiwyg editors as they present problems
            textarea: ["tinymce", "quill"] 
          }
        },
        instance: null,
        instanceId: -1
      }
    })
  })

  let formIDs = Object.keys(CustomFieldsBuilders)
  let fbInstances = []
  let options = Object.values(CustomFieldsBuilders)
  let init = function(i) {
      if (i < formIDs.length) {
          const form = CustomFieldsBuilders[formIDs[i]]
          $(form.el).find(".loading-spinner").remove();
          const deepClonedOptions = JSON.parse(JSON.stringify(options[i].config))
          $(form.el).formBuilder(deepClonedOptions).promise.then(res => {
              fbInstances.push(res)
              form.instance = res;
              form.instanceId = i;
              form.el.FormBuilder = res;
              i++
              init(i)
          })
      }
  }
  init(0)


  $("form.awesome-edit-config").on("submit", (event) => {
    Object.entries(CustomFieldsBuilders).forEach(([key, config]) => {
      const value = JSON.stringify(fbInstances[config.instanceId].actions.getData());
      $(config.input).val(value)
    });
    return true;
  });

});

