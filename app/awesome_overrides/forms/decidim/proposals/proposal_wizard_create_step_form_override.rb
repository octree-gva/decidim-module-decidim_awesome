# frozen_string_literal: true

# Recreate validations to take into account custom fields and ignore the length limit in proposals
Decidim::Proposals::ProposalWizardCreateStepForm.class_eval do
  clear_validators!
  attribute :private_body, Decidim::Attributes::CleanString

  validates :title, presence: true, etiquette: true
  validates :title, length: { in: 15..80 }
  validates :body, presence: true, etiquette: true, unless: ->(form) { form.override_validations? }
  validates :body, proposal_length: {
    minimum: 5,
    maximum: ->(record) { record.override_validations? ? 0 : record.component.settings.proposal_length }
  }

  validate :body_is_not_bare_template, unless: ->(form) { form.override_validations? }

  def override_validations?
    return false if context.current_component.settings.participatory_texts_enabled

    custom_fields.present?
  end
  def map_model(model)
    self.title = translated_attribute(model.title)
    self.body = translated_attribute(model.body)
    self.private_body = translated_attribute(model.private_body)

    self.user_group_id = model.user_groups.first&.id
    return unless model.categorization

    self.category_id = model.categorization.decidim_category_id
  end

  def custom_fields
    awesome_config = Decidim::DecidimAwesome::Config.new(context.current_organization)
    awesome_config.context_from_component(context.current_component)
    awesome_config.collect_sub_configs_values("proposal_custom_field")
  end
  
  def private_custom_fields
    awesome_config = Decidim::DecidimAwesome::Config.new(context.current_organization)
    awesome_config.context_from_component(context.current_component)
    awesome_config.collect_sub_configs_values("private_proposal_custom_field")
  end
end
