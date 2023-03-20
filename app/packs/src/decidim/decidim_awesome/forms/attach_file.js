if (!window.fbControls) window.fbControls = new Array();
window.fbControls.push(function (controlClass) {
  /**
   * Attach one file field.
   */
  class controlAttachFile extends controlClass {
    static get definition() {
      return {
        icon: "🏞️",
        i18n: {
          default: "Attach File"
        }
      }
    }
    configure() {
    }

    /**
     * build a text DOM element, supporting other jquery text form-control's
     * @return DOM Element to be injected into the form.
     */
    build() {
      const { value, userData, ...attrs } = this.config;
      const currentValue = value || (userData ? userData[0] : "");
      const fileControl = this.markup('input', null, {...attrs, id: `${this.config.name}-input`, type: "file"});
      if(!currentValue)
        this.input = fileControl
      else{
        const removeButton = this.markup('button', "remove", {class: "formBuilder__attachField-button"});
        const hiddenInput = this.markup('input', currentValue, {id: `${this.config.name}-input`, type: "hidden", value: currentValue});
        const link = this.markup('a', currentValue, {href: currentValue, target: "_blank", class: "formBuilder__attachField-preview"});
        const input = this.input = this.markup("div", [link, hiddenInput, removeButton], {class: "formBuilder__attachField"})
        $(removeButton).on("click", function(evt) {
          evt.preventDefault();
          $(input).html(fileControl)
        })
      }
      return this.input
    }

    onRender() {
      $('#'+this.config.name).html(value)
    }
  }

  // register this control for the following types & text subtypes
  controlClass.register('attachFile', controlAttachFile);
  return controlAttachFile;
});