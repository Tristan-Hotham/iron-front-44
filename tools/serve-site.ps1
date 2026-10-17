# Dev only: serves a static site folder ($env:SITE_ROOT) for previewing before a deploy.
# Serves this folder on http://localhost:<port>/ (the game page is iron-front.html).
param([int]$Port = $(if ($env:PORT) { [int]$env:PORT } else { 8790 }))
$root = $env:SITE_ROOT
$types = @{ '.html'='text/html; charset=utf-8'; '.js'='text/javascript'; '.json'='application/json'; '.ogg'='audio/ogg'; '.mp3'='audio/mpeg'; '.wav'='audio/wav'; '.opus'='audio/ogg'; '.mp4'='video/mp4'; '.jpg'='image/jpeg'; '.png'='image/png'; '.css'='text/css'; '.svg'='image/svg+xml'; '.woff2'='font/woff2'; '.vtt'='text/vtt'; '.webmanifest'='application/manifest+json' }
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$Port/")
$l.Start()
Write-Output "Bit-zkrieg: Iron Front '44 at http://localhost:$Port/"
while ($l.IsListening) {
  $c = $l.GetContext()
  try {
    $p = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath.TrimStart('/'))
    if ($p -eq '' -or $p.EndsWith('/')) { $p = $p + 'index.html' }
    if ($c.Request.HttpMethod -eq 'POST' -and $p -match '^shot/([\w-]+)$') {   # dev: the page posts a PNG data URL of a canvas
      $name = $Matches[1]; $r = New-Object IO.StreamReader($c.Request.InputStream); $body = $r.ReadToEnd()
      $dir = Join-Path $root 'shots'; New-Item -ItemType Directory -Force $dir | Out-Null
      [IO.File]::WriteAllBytes((Join-Path $dir "$name.png"), [Convert]::FromBase64String($body.Substring($body.IndexOf(',') + 1)))
      $c.Response.StatusCode = 204; $c.Response.Close(); continue
    }
    if ($c.Request.HttpMethod -eq 'POST' -and $p -match '^report/([\w-]+)$') {   # dev: the page posts a text report (AI testers)
      $dir = Join-Path $root 'reports'; New-Item -ItemType Directory -Force $dir | Out-Null
      $r = New-Object IO.StreamReader($c.Request.InputStream, [Text.Encoding]::UTF8); [IO.File]::WriteAllText((Join-Path $dir "$($Matches[1]).txt"), $r.ReadToEnd(), (New-Object Text.UTF8Encoding $false))
      $c.Response.StatusCode = 204; $c.Response.Close(); continue
    }
    if ($c.Request.HttpMethod -eq 'POST' -and $p -match '^save/(music|sfx|trailer)/([\w-]+\.(mp3|ogg|mp4|webm|jpg|png))$') {   # dev: store an approved audio file fetched by the page
      $dir = Join-Path $root $Matches[1]; New-Item -ItemType Directory -Force $dir | Out-Null
      $ms = New-Object IO.MemoryStream; $c.Request.InputStream.CopyTo($ms)
      [IO.File]::WriteAllBytes((Join-Path $dir $Matches[2]), $ms.ToArray())
      $c.Response.StatusCode = 204; $c.Response.Close(); continue
    }
    $f = [IO.Path]::GetFullPath((Join-Path $root $p))
    # dev: big music files are not served. The browser pauses long audio downloads part-way, and on this
    # single-threaded server a stalled write blocks every other request. Sound effects (small) still play.
    if ($c.Request.HttpMethod -eq 'GET' -and (Test-Path $f -PathType Leaf) -and ((Get-Item $f).Length -gt 1MB) -and $f -match '\.(mp3|ogg|oga|opus|wav)$' -and -not $env:SERVE_MUSIC) { $c.Response.StatusCode = 404; $c.Response.Close(); continue }
    if ($c.Request.HttpMethod -eq 'GET' -and $f.StartsWith([IO.Path]::GetFullPath($root)) -and (Test-Path $f -PathType Leaf)) {
      $b = [IO.File]::ReadAllBytes($f); $ext = [IO.Path]::GetExtension($f).ToLower()
      if ($types.ContainsKey($ext)) { $c.Response.ContentType = $types[$ext] }
      $c.Response.OutputStream.Write($b, 0, $b.Length)
    } else { $c.Response.StatusCode = 404 }
  } catch { }
  try { $c.Response.Close() } catch { }
}
