require 'rubygems'
require 'sinatra'

set :public, Dir.pwd

get '/' do
  File.read('index.html')
end

run Sinatra::Application
