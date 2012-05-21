require 'rubygems'
require 'rake'

desc 'starts server on port 4000'
task :server do
  `rackup --port 4000`
end

desc 'deploy to Dropbox'
task :dropbox do
  dropbox = File.expand_path(ENV['DROPBOX'] || '~/Dropbox')
  if File.directory?(dropbox)
    `git checkout-index -f -a --prefix=#{dropbox}/Public/paperballoon/`
  else
    puts "`#{dropbox}` doesn't exist or it's not a directory."
  end
end

task :default do
  puts 'Run rake --tasks for more information.'
end
