# frozen_string_literal: true

module Decidim
    module DecidimAwesome
      class EditorFile < ApplicationRecord
        self.table_name = "decidim_awesome_editor_files"
  
        belongs_to :author, foreign_key: :decidim_author_id, class_name: "Decidim::User"
        belongs_to :organization, foreign_key: :decidim_organization_id, class_name: "Decidim::Organization"
  
        validates :organization, presence: true
        validates :author, presence: true
  
        validates :file, presence: true  
        mount_uploader :file, Decidim::ApplicationUploader
  
        delegate :url, to: :file
        delegate :thumbnail, to: :file
      end
    end
  end
  