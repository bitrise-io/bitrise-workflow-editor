require "slim"
require './serve_root'

use ServeRoot

config[:layout] = false

activate :directory_indexes

helpers do

	def stylesheet_path(path)
		case environment
		when :development then asset_path(:css, path)
		when :build then "#{ENV['bitrise_workflow_editor_root_path_on_website']}/stylesheets/" + path + ".css"
		end
	end

	def javascripts_path(path)
		case environment
		when :development then asset_path(:js, path)
		when :build then "#{ENV['bitrise_workflow_editor_root_path_on_website']}/javascripts/" + path + ".js"
		end
	end

	def template_path(path)
		case environment
		when :development then path
		when :build then "#{ENV['bitrise_workflow_editor_root_path_on_website']}" + path
		end
	end

	def endpoint_path(path)
		case environment
		when :development then path
		when :build then "#{ENV['bitrise_workflow_editor_root_path_on_website']}" + path
		end
	end

	def webserver_path(path)
		case environment
		when :development then "#{ENV['website_development_webserver_root_path']}" + path
		when :build then path
		end
	end

	def local_server_path(path)
		case environment
		when :development then "#{ENV['local_server_url']}" + path
		when :build then path
		end
	end

	def string_with_urls(string, urls)
		urls.each do |url|
			string = string.sub("<url>", url)
		end

		return string
	end

end
