# frozen_string_literal: true

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

  local_favicon = favicon_candidates.keys.find do |filename|
    File.file?(File.join(File.dirname(path), filename))
  end

  favicon_links = if local_favicon
    type = favicon_candidates.fetch(local_favicon)
    %(<link rel="icon" type="#{type}" href="#{local_favicon}">)
  else
    <<~HTML.chomp
      <link rel="icon" type="image/png" sizes="64x64" href="/trips/favicon.png">
      <link rel="apple-touch-icon" sizes="180x180" href="/trips/apple-touch-icon.png">
    HTML
  end

  updated = html.sub(/<\/head>/i, "#{favicon_links}\n</head>")
  abort "Не найден </head> в #{path}" if updated == html

  File.binwrite(path, updated)
end
