class PostsController < ApplicationController
  before_action :set_user, only: %i[ index show ]
  before_action :set_post, only: %i[ show ]

  # GET /posts or /posts.json
  def index
    @posts = Post.all
  end

  # GET /posts/1 or /posts/1.json
  def show
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_user
      @user = User.find_by(username: params[:user_id])
    end

    def set_post
      @post = Post.find_by(slug: params[:id].split('-').last)
    end
end
