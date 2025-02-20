require "slim"

input = STDIN.read
command = ARGV[0]

def mode_dependant_asset_path(path)
    mode = ENV['MODE'] || "CLI"
    case mode
    when "WEBSITE" then "#{ENV['PUBLIC_URL_ROOT']}/#{ENV['wfe_version']}/" + path
    when "CLI" then "/#{ENV['wfe_version']}/" + path
    end
end

def svg(filename)
    file_path = "../source/images/#{filename}.svg"

    return "(svg not found)" unless File.exist?(file_path)
    return File.read(file_path).gsub("\n", "").gsub("\r", "").gsub("\t", "")
end

def clarity?
    ENV['CLARITY'] == 'true'
end

def datadog_rum?
    ENV['DATADOG_RUM'] == 'true'
end

case command
when "slim"
    puts Slim::Template.new { input }.render
end
