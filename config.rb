require "slim"
require './serve_root'

use ServeRoot

config[:layout] = false

activate :directory_indexes

configure :development do

	def app_config_get_path
		return "mock/app_config_get_path.json"
	end

	def app_config_post_path
		return "mock/app_config_post_path.json"
	end

end

configure :build do

	def app_config_get_path
		return data[:routes][:app_config_get]
	end

	def app_config_post_path
		return data[:routes][:app_config_post]
	end
	
end

helpers do

	def string_with_urls(string, urls)
		urls.each do |url|
			string = string.sub("<url>", url)
		end

		return string
	end

end
