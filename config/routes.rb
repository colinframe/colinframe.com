Rails.application.routes.draw do
  namespace :admin do
    resources :posts
    resources :users
  end

  resources :users, only: [:show] do
    resources :posts, only: [:index, :show]
  end
end
