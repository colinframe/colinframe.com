class User < ApplicationRecord
  has_many :posts
  has_one_attached :avatar

  validates :email, presence: true
  validates :username, presence: true
end
