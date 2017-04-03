require "slim"

config[:layout] = false

activate :directory_indexes

activate :jasmine

helpers do

	# path helpers

	def webserver_path(path)
		case "#{ENV['MODE']}"
		when "WEBSITE" then path
		when "CLI" then "not_available"
		end
	end

	def local_server_path(path)
		case "#{ENV['MODE']}"
		when "WEBSITE" then "not_available"
		when "CLI"
			case environment
				when :development then "http://localhost:#{ENV['API_SERVER_PORT']}" + path
				when :build then path
			end
		end
	end

	def mode_dependant_asset_path(path)
		case "#{ENV['MODE']}"
		when "WEBSITE" then "/bitrise_workflow_editor/" + path
		when "CLI" then path
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

		return "(svg not found)" unless File.exists?(file_path)

		return File.read(file_path).gsub!("\n", "").gsub!("\r", "").gsub!("\t", "")
	end

end

set :images_dir, mode_dependant_asset_path("images")
