// = require_self

if (!window.fbControls) window.fbControls = new Array();

const defaultConfig = {
  currency: "CHF",
  labelPlaceholder: "Matériel",
  pricePlaceholder: "150",
  addLineLabel: "+ ajouter une ligne",
  totalLabel: "Montant total du budget: "
}
window.fbControls.push(function (controlClass) {
  /**
   * Budget field
   * Add line of budget and get a total
   */
  class controlBudgetField extends controlClass {
    static get definition() {
      return {
        icon: "💸",
        i18n: {
          default: "Budget",
        },
        defaultAttrs: {
          currency: {
            label: "Currency",
            value: "€",
            type: "text",
          },
          labelPlaceholder: {
            label: "Placeholder on new line (label)",
            value: "Material",
            type: "text",
          },
          pricePlaceholder: {
            label: "Placeholder on new line (price)",
            value: "150",
            type: "text",
          },
          addLineLabel: {
            label: "Label to add a new line",
            value: "+ new line",
            type: "text",
          },
          totalLabel: {
            label: "Total label",
            value: "Total:",
            type: "text",
          },
        },
      };
    }
    configure() {}

    /**
     * build a text DOM element, supporting other jquery text form-control's
     * @return DOM Element to be injected into the form.
     */
    build() {
      const {
        value,
        userData,
        name,
        currency =defaultConfig.currency,
        addLineLabel=defaultConfig.addLineLabel,
        required = undefined,
        labelPlaceholder = defaultConfig.labelPlaceholder,
        pricePlaceholder = defaultConfig.pricePlaceholder,
      } = this.config;
      console.log({ required });
      const rawValue = value || (userData ? userData[0] : "<table />");
      let currentValue;
      try {
        currentValue = JSON.parse($(rawValue).find("pre").first().html());
      } catch (e) {
        currentValue = {};
      }
      let handlers = [];
      const markup = this.markup.bind(this);
      const addNewLine = (lines) => {
        lines.push({ label: "", price: 0, id: `${+new Date()}` });
      };
      const reRender = (data = {}) => {
        // preconditions
        data.lines = data.lines || [];
        if (data.lines.length < 1 && !!required) {
          addNewLine(data.lines);
        }
        // Clean previous handlers
        handlers.forEach((h) => $(h).off());
        handlers = [];
        // add line button
        const addLine = markup("button", addLineLabel || "+ new line", {
          class: "formBuilder__budgetField-addLine",
        });
        $(addLine).on("click", function (evt) {
          evt.preventDefault();
          addNewLine(data.lines);
          $(`#${name}-container`).html(reRender(data));
          $(`#${name}-container .formBuilder__budgetField-label`)
            .last()
            .trigger("focus");
        });
        handlers.push(addLine);
        // Compute current lines
        const lines = data.lines.map((line, index) => {
          const inputField = markup("input", undefined, {
            class: "formBuilder__budgetField-label",
            type: "text",
            name: `${name}-input[${index}][label]`,
            value: line.label || "",
            placeholder: labelPlaceholder,
          });
          if (!!required) $(inputField).prop("required", "required");
          $(inputField).on("keyup", function (evt) {
            const newValue = evt.target.value;
            line.label = newValue;
            $(`input[name="${name}"]`).val(JSON.stringify(data, null, 2));
          });
          handlers.push(inputField);
          const priceField = markup("input", undefined, {
            class: "input-group-field formBuilder__budgetField-price",
            required: true,
            type: "number",
            name: `${name}-input[${index}][label]`,
            value: line.price || "",
            placeholder: pricePlaceholder,
          });
          if (!!required) $(priceField).prop("required", "required");

          $(priceField).on("keyup", function (evt) {
            const newValue = evt.target.value;
            line.price = parseInt(newValue, 10);
            $(`input[name="${name}"]`).val(JSON.stringify(data, null, 2));
          });

          const removeLine = markup("button", "X", {
            class: "button small hollow formBuilder__budgetField-removeLine",
            tabIndex: -1,
          });
          $(removeLine).on("click", function (evt) {
            evt.preventDefault();
            $(`#${name}-container`).html(
              reRender({
                ...data,
                lines: data.lines.filter(({ id }) => id !== line.id),
              })
            );
          });
          handlers.push(removeLine);

          return markup(
            "div",
            [
              inputField,
              markup(
                "div",
                [
                  priceField,
                  this.markup("span", currency, { class: "input-group-label" }),
                ],
                { class: "input-group formBuilder__budgetField-priceGroup" }
              ),
              removeLine,
            ],
            { class: "formBuilder__budgetField-editor" }
          );
        });
        return [...lines, addLine];
      };
      const container = markup("div", reRender(currentValue), {
        id: `${name}-container`,
        class: "formBuilder__budgetField-container clearfix",
      });
      this.input = markup("div", [
        container,
        markup("input", undefined, {
          type: "hidden",
          value: JSON.stringify(currentValue),
          name: `${name}`,
          id: `${name}`,
          class: "formBuilder__budgetField",
        }),
      ]);
      return this.input;
    }

    onRender() {
      $(`#${this.config.name}`).html(
        renderBudget(this.config.value, this.config)
      );
    }
  }

  // register this control for the following types & text subtypes
  controlClass.register("budget", controlBudgetField);
});

window.renderBudget = (value, config) => {
  let currentValue;
  try {
    currentValue = JSON.parse(value || "{}");
  } catch (e) {
    currentValue = {};
  }
  const { lines = [] } = currentValue;
  const $container = $("<div />");
  const $dataContainer = $("<pre />");
  $dataContainer.addClass("hide");
  $dataContainer.css({ display: "none !important" });
  $dataContainer.html(value);
  $container.append($dataContainer);

  const $table = $("<table />");
  $table.data("json", value);
  $table.addClass("table stack formBuilder__budgetField-table");
  const $tbody = $("<tbody />");
  const $tfoot = $("<tfoot />");
  let total = 0;
  lines.forEach((line) => {
    const $line = $("<tr />");
    $line.addClass("formBuilder__budgetField-line");
    const $label = $("<td />").prop("id", line.id);
    $label.addClass(
      "formBuilder__budgetField-cell formBuilder__budgetField-cell--label"
    );
    $label.text(line.label);
    $line.append($label);

    const $price = $("<td />");
    $price.addClass(
      "formBuilder__budgetField-cell formBuilder__budgetField-cell--price"
    );
    $price.append($("<span />").text(line.price));
    $price.append($("<span />").text(` ${config.currency || defaultConfig.currency}`));
    $line.append($price);
    total += line.price;
    $tbody.append($line);
  });
  $table.append($tbody);
  $tfoot.append(
    $("<tr/>").append(
      $("<td/>")
        .prop("colspan", 2)
        .addClass(
          "formBuilder__budgetField-cell formBuilder__budgetField-cell--total"
        )
        .append(
          $("<span />")
            .text((config.totalLabel || defaultConfig.totalLabel) + ` ${total}`)
            .prop("alt", "total")
        )
        .append($("<span />").text(` ${config.currency || defaultConfig.currency}`))
    )
  );
  $table.append($tfoot);
  $container.append($table);
  return $container;
};
