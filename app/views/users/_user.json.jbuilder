json.extract! user, :id, :first_name, :last_names, :email, :username, :avatar, :created_at, :updated_at
json.url user_url(user, format: :json)
json.avatar url_for(user.avatar)
