require "slim"
require './serve_root'

use ServeRoot

config[:layout] = false

activate :directory_indexes

activate :jasmine

helpers do

	# path helpers

	def stylesheet_path(path)
		case environment
		when :development then asset_path(:css, path)
		when :build then "#{ENV['BITRISE_WORKFLOW_EDITOR_ROOT_PATH_ON_WEBSITE']}/stylesheets/" + path + ".css"
		end
	end

	def javascripts_path(path)
		case environment
		when :development then asset_path(:js, path)
		when :build then "#{ENV['BITRISE_WORKFLOW_EDITOR_ROOT_PATH_ON_WEBSITE']}/javascripts/" + path + ".js"
		end
	end

	def template_path(path)
		case environment
		when :development then path
		when :build then "#{ENV['BITRISE_WORKFLOW_EDITOR_ROOT_PATH_ON_WEBSITE']}" + path
		end
	end

	def endpoint_path(path)
		case environment
		when :development then path
		when :build then "#{ENV['BITRISE_WORKFLOW_EDITOR_ROOT_PATH_ON_WEBSITE']}" + path
		end
	end

	def webserver_path(path)
		case environment
		when :development then "#{ENV['WEBSITE_DEVELOPMENT_WEBSERVER_ROOT_PATH']}" + path
		when :build then path
		end
	end

	def local_server_path(path)
		case environment
		when :development then "http://localhost:#{ENV['API_SERVER_PORT']}" + path
		when :build then path
		end
	end

	# string helpers

	def string_with_urls(string, urls)
		urls.each do |url|
			string = string.sub("<url>", url)
		end

		return string
	end

	# asset helpers

	def svg(filename)
		root = Middleman::Application.root
		file_path = "#{root}/source/images/#{filename}.svg"
		return File.read(file_path) if File.exists?(file_path)
		return "(svg not found)"
	end

end
