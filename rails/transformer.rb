require "erb"
require "slim"
require "json"
require "slim/include"
require "./strings"

input = STDIN.read
command = ARGV[0]

def webserver_path(path)
    return "not_available" if mode.eql?("cli")
    return path
end

def local_server_path(path)
    return "not_available" if mode.eql?("website")
    return path
end

def mode_dependant_asset_path(path)
    case mode
    when "website" then "#{ENV['PUBLIC_URL_ROOT']}/#{ENV['wfe_version']}/" + path
    when "cli" then "/#{ENV['wfe_version']}/" + path
    end
end

def mode
    mode = ENV['MODE'] || "CLI"

    case mode
        when "WEBSITE" then "website"
        when "CLI" then "cli"
    end
end

# string helpers

def replaced_string(string, replacements)
    replacements.each do |replacement|
        string = string.sub(/<[a-zA-Z0-9\-\_\.]+>/, replacement) unless replacement.nil?
    end

    return string
end

# asset helpers

def image_path(image)
    mode_dependant_asset_path("images/#{image}")
end

def svg(filename)
    file_path = "../source/images/#{filename}.svg"

    return "(svg not found)" unless File.exist?(file_path)
    return File.read(file_path).gsub("\n", "").gsub("\r", "").gsub("\t", "")
end

def data
    strings
end

def prod?
    ENV['NODE_ENV'] == 'prod'
end

def analytics?
    ENV['ANALYTICS'] == 'true'
end

def hotjar?
    ENV['HOTJAR'] == 'true'
end

def freshpaint?
    ENV['FRESHPAINT'] == 'true'
end

def datadog_rum?
    ENV['DATADOG_RUM'] == 'true'
end

case command
when "erb"
    puts ERB.new(input).result
when "slim"
    def favicon_tag(name, rel: "icon", href: nil, type: "image/icon", sizes: "16x16")
        href ||= name
        "<link href=\"#{href}\" rel=\"#{rel}\" type=\"#{type}\" sizes=\"#{sizes}\" />"
    end

    def include_slim(name, options = {}, &block)
        path = "#{Dir.pwd}/../source/templates/"
        Slim::Template.new("#{path}#{name}.slim", options).render(self, &block)
    end

    puts Slim::Template.new { input }.render
end
