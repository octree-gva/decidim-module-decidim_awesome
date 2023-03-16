require("formBuilder/dist/form-render.min.js")
import "src/decidim/decidim_awesome/forms/rich_text_plugin"

export default class CustomFieldsRenderer { // eslint-disable-line no-unused-vars
  constructor(containerSelector) {
    this.containerSelector = containerSelector || ".proposal_custom_field:last";
    this.lang = this.getLang($("html").attr("lang"));
  }

  getLang(lang) {
    const langs = {
      // ar: 'ar-SA', // Not in decidim yet
      "ar": "ar-TN",
      "ca": "ca-ES",
      "cs": "cs-CZ",
      "da": "da-DK",
      "de": "de-DE",
      "el": "el-GR",
      "en": "en-US",
      "es": "es-ES",
      "fa": "fa-IR",
      "fi": "fi-FI",
      "fr": "fr-FR",
      "he": "he-IL",
      "hu": "hu-HU",
      "it": "it-IT",
      "ja": "ja-JP",
      "my": "my-MM",
      "nb": "nb-NO",
      "nl": "nl-NL",
      "pl": "pl-PL",
      "pt": "pt-BR",
      "qz": "qz-MM",
      "ro": "ro-RO",
      "ru": "ru-RU",
      "sl": "sl-SI",
      "th": "th-TH",
      "tr": "tr-TR",
      "uk": "uk-UA",
      "vi": "vi-VN",
      "zh-TW": "zh-TW",
      "zh": "zh-CN"
    };
    if (langs[lang]) {
      return langs[lang];
    }
    if (langs[lang.substr(0, 2)]) {
      return langs[lang.substr(0, 2)];
    }
    return "en-US";
  }

  /*
  * Creates an XML document with a subset of html-compatible dl/dd/dt elements
  * to store the custom fields answers
  */
  async dataToXML(data) {
    const $dl = $("<dl/>");
    let $dd = null, 
        $div = null, 
        $dt = null, 
        datum = null, 
        key = null, 
        label = null, 
        text = null, 
        val = null;
    $dl.attr("class", "decidim_awesome-custom_fields");
    $dl.attr("data-generator", "decidim_awesome");
    $dl.attr("data-version", window.DecidimAwesome.version);
    for (key in data) { // eslint-disable-line guard-for-in
      // console.log("get the data!", key, data[key]);
      // Richtext plugin does not saves userdata, so we get it from the hidden input
      if (data[key].type === "textarea" && data[key].subtype === "richtext") {
        data[key].userData = [$(`#${data[key].name}-input`).val()];
      }
      if (data[key].type === "file") {
        // upload the file, and set the value to the uploded file url.
        const token = $('meta[name="csrf-token"]').attr("content");
        const formData = new FormData();
        const selectedFile = $(`#${data[key].name}`)[0].files[0];
        if(!!selectedFile){
          formData.append("image", $(`#${data[key].name}`)[0].files[0]);
          await new Promise((resolve) => $.ajax({
            url: DecidimAwesome.editor_uploader_path,
            type: 'POST',
            cache: false,
            data: formData,
            dataType: "json",
            jsonp: false,
            processData: false,
            contentType: false,
            async: false,
            headers:{ "X-CSRF-Token": token },
          }).done((resp) => {
            const {url=""} = resp;
            if(!url) return;
            data[key].userData = [url];
            resolve()
          }));
        }
      }

      if (data[key].userData && data[key].userData.length) {
        $dt = $("<dt/>");
        $dt.text(data[key].label);
        $dt.attr("name", data[key].name);
        $dd = $("<dd/>");
        // console.log("data for", key, data[key].name, data[key].userData)
        for (val in data[key].userData) { // eslint-disable-line guard-for-in
          $div = $("<div/>");
          label = data[key].userData[val];
          text = null;
          if (data[key].values) {
            datum = data[key].values.find((obj) => obj.value === label); // eslint-disable-line no-loop-func
            if (datum) { // eslint-disable-line max-depth
              text = label;
              label = datum.label;
            }
          } else if (data[key].type === "date" && label) {
            datum = new Date(label).toLocaleDateString();
            if (datum) { // eslint-disable-line max-depth
              text = label;
              label = datum;
            }
          }
          // console.log("userData", text, "label", label, 'key', key, 'data', data)
          if (data[key].type === "textarea" && data[key].subtype === "richtext") {
            $div.html(label);
          } else {
            $div.text(label);
          }
          if (text) {
            $div.attr("alt", text);
          }
          $dd.append($div);
        }
        $dd.attr("id", data[key].name);
        $dd.attr("name", data[key].type);
        $dl.append($dt);
        $dl.append($dd);
      }
    }
    return `<xml>${$dl[0].outerHTML}</xml>`;
  }

  fixBuggyFields() {
    if (!this.$container) {
      return false;
    }

    /**
    * Hack to fix required checkboxes being reset
    * Issue: https://github.com/Platoniq/decidim-module-decidim_awesome/issues/82
    */
    this.$container.find(".formbuilder-checkbox-group").each((_key, group) => {
      const inputs = $(".formbuilder-checkbox input", group);
      const data = this.spec.find((obj) => obj.type === "checkbox-group");
      let values = data.userData;
      if (!inputs.length || !data || !values) {
        return;
      }

      inputs.each((_idx, input) => {
        let index = values.indexOf(input.value);
        if (index >= 0) {
          values.splice(index, 1)
          // setting checked=true do not makes the browser aware that the form is valid if the field is required
          if (!input.checked)
          {$(input).click();}
        } else if (input.checked)
        {$(input).click();}
      });

      // Fill "other" option
      const otherOption = $(".other-option", inputs.parent())[0];
      const otherVal = $(".other-val", inputs.parent())[0];
      const otherText = values.join(" ");

      if (otherOption) {
        if (otherText) {
          otherOption.checked = true;
          otherOption.value = otherText;
          otherVal.value = otherText;
        } else {
          otherOption.checked = false;
          otherOption.value = "";
          otherVal.value = "";
        }
      }
    });

    /**
    * Hack to fix required radio buttons "other" value
    * Issue: https://github.com/Platoniq/decidim-module-decidim_awesome/issues/133
    */
    this.$container.find(".formbuilder-radio input.other-val").on("input", (input) => {
      const $input = $(input.currentTarget);
      const $group = $input.closest(".formbuilder-radio-group");
      $group.find("input").each((_key, radio) => {
        const name = $(radio).attr("name");
        if (name && name.endsWith("[]")) {
          $(radio).attr("name", name.slice(0, -2));
        }
      });
    });
    return this;
  }

  // Saves xml to the hidden input
  async storeData() {
    if (!this.$container) {
      return false;
    }
    const $form = this.$container.closest("form");
    const $body = $form.find(`input[name="${this.$element.data("name")}"]`);
    if ($body.length && this.instance) {
      this.spec = this.instance.userData;
      const xmlData = await this.dataToXML(this.spec);
      $body.val(xmlData);
      this.$element.data("spec", this.spec);
    }
    // console.log("storeData spec", this.spec, "$body", $body,"$form",$form,"this",this);
    return this;
  }

  init($element) {
    this.$element = $element;
    this.spec = $element.data("spec");
    if (!this.$container) {
      this.$container = $(this.containerSelector);
    }
    // console.log("init", $element, "this", this)
    // always use the last field (in case of multilang tabs we only render one form due a limitation of the library to handle several instances)
    this.instance = this.$container.formRender({
      i18n: {
        locale: this.lang,
        location: "https://cdn.jsdelivr.net/npm/formbuilder-languages@1.1.0/"
      },
      formData: this.spec,
      render: true
    });
    this.fixBuggyFields();
  }
}
