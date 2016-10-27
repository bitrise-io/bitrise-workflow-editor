require "slim"
require './serve_root'

use ServeRoot

config[:layout] = false

activate :directory_indexes

helpers do

	def stylesheet_path(path)
		case environment
		when :development then asset_path(:css, path)
		when :build then "#{ENV['bitrise_workflow_editor_root_path']}stylesheets/" + path + ".css"
		end
	end

	def javascripts_path(path)
		case environment
		when :development then asset_path(:js, path)
		when :build then "#{ENV['bitrise_workflow_editor_root_path']}javascripts/" + path + ".js"
		end
	end

	def environment_dependent_path(path)
		case environment
		when :development then "/" + path
		when :build then "#{ENV['bitrise_workflow_editor_root_path']}" + path
		end
	end

	def string_with_urls(string, urls)
		urls.each do |url|
			string = string.sub("<url>", url)
		end

		return string
	end

end
