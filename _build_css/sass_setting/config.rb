# Require any additional compass plugins here.
require "compass"

#require "./sass_setting/color.rb"
#require "./sass_setting/skyward_design.rb"
# require "animation"

# Set this to the root of your project when deployed:
# ************************************
#  HTTP Path
# ************************************
# http://から始まるパスを指定すると
# image-url で取得するパスなどが http_path から始まる URL になる
http_path = ""

# ************************************
#  Project Path
# ************************************
# Project用のディレクトリを指定
project_path = "../examples"


# ************************************
#  Sass Directory
# ************************************
# project_path からの相対で指定
sass_dir = "../_dev"


# ************************************
#  CSS Directory
# ************************************
# project_path からの相対で指定（コンパイル後）
css_dir = "../examples"


# ************************************
#  Image Directory
# ************************************
# project_path からの相対で指定（コンパイル後）
# image-whidth でサイズを取得したりスプライトを作ったりなど
images_dir = "/"


# ************************************
#  Font Directory
# ************************************
# project_path からの相対で指定（コンパイル後）
fonts_dir = "font"


# ************************************
#  JavaScript Directory
# ************************************
# project_path からの相対で指定（コンパイル後）
javascripts_dir = "/"


# ************************************
#  Output Style Setting
# ************************************
# environment = :production の場合に :compressed で出力
# environment = :development の場合に :expanded で出力
output_style = ( environment == :production ) ? :compressed : :expanded
# output_style = ( environment == :production ) ? :compressed : :compressed


# ************************************
#  Debug Setting
# ************************************
# environment = :production の場合に行番号を出力しない
# environment = :development の場合に行番号を出力する
# line_comments = ( environment == :production ) ? false : true
line_comments = false
# compass compile -e production --force
# sass_options = (environment == :production) ? { :debug_info => false } : { :debug_info => true }
sass_options = false
# environment = :production の場合に false で出力しない
# environment = :development の場合に true で出力
sass_options = ( environment == :production ) ? { :sourcemap => false } : { :sourcemap => true }

# ************************************
#  Other
# ************************************
# kill create .sass-cache/ directory
# cache = false
# kill cache buster (出力 CSS の画像 URL にクエリを付けない) 
asset_cache_buster :none
# use relative path
# To enable relative paths to assets via compass helper functions. Uncomment:
relative_assets = true


# ************************************
#  Sprites
# ************************************
# Make a copy of sprites with a name that has no uniqueness of the hash.
# on_sprite_saved do |filename|
#   if File.exists?(filename)
#     FileUtils.cp filename, filename.gsub(%r{-s[a-z0-9]{10}\.png$}, '.png')
#     # FileUtils.rm filename
#   end
# end

# Replace in stylesheets generated references to sprites
# by their counterparts without the hash uniqueness.
# on_stylesheet_saved do |filename|
#   if File.exists?(filename)
#     css = File.read filename
#     File.open(filename, 'w+') do |f|
#       f << css.gsub(%r{-s[a-z0-9]{10}\.png}, '.png')
#     end
#   end
# end

# If you prefer the indented syntax, you might want to regenerate this
# project again passing --syntax sass, or you can uncomment this:
# preferred_syntax = :sass
# and then run:
# sass-convert -R --from scss --to sass sass scss && rm -rf sass && mv scss sass
