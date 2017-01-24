require "slim"

config[:layout] = false

activate :directory_indexes

activate :jasmine

helpers do

	# path helpers

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

		return "(svg not found)" unless File.exists?(file_path)

		return File.read(file_path).gsub!("\n", "").gsub!("\r", "").gsub!("\t", "")
	end

end
