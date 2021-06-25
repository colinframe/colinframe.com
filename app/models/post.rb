class Post < ApplicationRecord
  belongs_to :author, class_name: 'User', foreign_key: :user_id
  has_rich_text :content

  validates :title, presence: true
  validates :slug, presence: true, uniqueness: true

  before_validation on: :create do
    self.slug = SecureRandom.hex(8)
  end

  def to_param
    "#{title.parameterize}-#{slug}"
  end
end
