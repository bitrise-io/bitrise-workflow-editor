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

	def default_outputs_get_path
		return "mock/default_outputs_get_path.json"
	end

	def all_stacks_get_path
		return "mock/all_stacks_get_path.json"
	end

	def stack_get_path
		return "mock/stack_get_path.json"
	end

	def prov_profiles_get_path
		return "mock/prov_profiles_get_path.json"
	end

	def prov_profiles_delete_path
		return "mock/prov_profiles_delete_path.json"
	end

	def prov_profile_download_path
		return "mock/prov_profile_download_path.json"
	end

	def prov_profile_delete_path
		return "mock/prov_profile_delete_path.json"
	end

	def secrets_get_path
		return "mock/secrets_get_path.json"
	end

	def yml_get_path
		return "mock/yml_get_path.yml"
	end

	def yml_download_path
		return "mock/yml_get_path.yml"
	end

end

configure :build do

	def app_config_get_path
		return data[:routes][:app_config_get]
	end

	def app_config_post_path
		return data[:routes][:app_config_post]
	end

	def default_outputs_get_path
		return data[:routes][:default_outputs_get]
	end

	def all_stacks_get_path
		return data[:routes][:all_stacks_get]
	end

	def stack_get_path
		return data[:routes][:stack_get]
	end

	def prov_profiles_get_path
		return data[:routes][:prov_profiles_get]
	end

	def prov_profiles_delete_path
		return data[:routes][:prov_profiles_delete]
	end

	def prov_profile_download_path
		return data[:routes][:prov_profile_download]
	end

	def prov_profile_delete_path
		return data[:routes][:prov_profile_delete]
	end

	def secrets_get_path
		return data[:routes][:secrets_get]
	end

	def yml_get_path
		return data[:routes][:yml_get]
	end

	def yml_download_path
		return data[:routes][:yml_download]
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
