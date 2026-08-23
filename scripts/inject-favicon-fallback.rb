# frozen_string_literal: true

require 'pathname'

site_root = File.expand_path(ARGV.fetch(0))
root_index = File.join(site_root, 'index.html')

favicon_candidates = {
  'favicon.svg' => 'image/svg+xml',
  'favicon.png' => 'image/png',
  'favicon.ico' => 'image/x-icon'
}

Dir.glob(File.join(site_root, '**', 'index.html')).sort.each do |path|
  next if File.expand_path(path) == root_index

  html = File.binread(path)
  has_own_favicon = html.scan(/<link\b[^>]*>/i).any? do |tag|
    rel = tag[/\brel\s*=\s*(["'])(.*?)\1/i, 2]
    rel&.downcase&.split&.include?('icon')
  end
  next if has_own_favicon

  page_dir = File.dirname(path)
  source_dir = page_dir
  favicon_filename = nil

  loop do
    favicon_filename = favicon_candidates.keys.find do |filename|
      File.file?(File.join(source_dir, filename))
    end
    break if favicon_filename || source_dir == site_root

    parent_dir = File.dirname(source_dir)
    break unless parent_dir.start_with?(site_root)

    source_dir = parent_dir
  end

  abort "Не найден favicon для #{path}" unless favicon_filename

  favicon_path = File.join(source_dir, favicon_filename)
  favicon_href = Pathname.new(favicon_path).relative_path_from(Pathname.new(page_dir)).to_s
  type = favicon_candidates.fetch(favicon_filename)
  favicon_links = %(<link rel="icon" type="#{type}" href="#{favicon_href}">)

  touch_path = File.join(source_dir, 'apple-touch-icon.png')
  touch_path = favicon_path unless File.file?(touch_path)
  touch_href = Pathname.new(touch_path).relative_path_from(Pathname.new(page_dir)).to_s
  favicon_links += %(\n<link rel="apple-touch-icon" href="#{touch_href}">)

  updated = html.sub(/<\/head>/i, "#{favicon_links}\n</head>")
  abort "Не найден </head> в #{path}" if updated == html

  File.binwrite(path, updated)
end
