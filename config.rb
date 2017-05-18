require "slim"

config[:layout] = false

activate :directory_indexes

activate :jasmine

helpers do

	# path helpers

	def webserver_path(path)
		case mode
		when "website" then path
		when "cli" then "not_available"
		end
	end

	def local_server_path(path)
		case mode
		when "website" then "not_available"
		when "cli"
			case environment
				when :development then "http://localhost:#{ENV['API_SERVER_PORT']}" + path
				when :build then path
			end
		end
	end

	def mode_dependant_asset_path(path)
		case mode
		when "website" then "/bitrise_workflow_editor-#{ENV['UNIX_TIMESTAMP']}/" + path
		when "cli" then path
		end
	end

	def mode
		case "#{ENV['MODE']}"
		when "WEBSITE" then "website"
		when "CLI" then "cli"
		end
	end

	# string helpers

	def replaced_string(string, replacements)
		replacements.each do |replacement|
			string = string.sub(/<[a-zA-Z0-9\-\_\.]+>/, replacement)
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
