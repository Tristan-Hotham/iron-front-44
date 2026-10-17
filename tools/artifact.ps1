# Builds artifact/iron-front.html, the Claude-artifact copy of the game: that host cannot serve .m4a,
# so the soundtrack points back at the original mp3/ogg files in music/ and the Opus check is dropped.
$root = Split-Path $PSScriptRoot -Parent
$page = [IO.File]::ReadAllText((Join-Path $root 'iron-front.html'))
$missing = @()
$page = [regex]::Replace($page, "\{file:'([\w-]+)\.m4a'", {
  param($m) $n = $m.Groups[1].Value
  $ext = @('mp3', 'ogg') | Where-Object { Test-Path (Join-Path $root "music\$n.$_") } | Select-Object -First 1
  if (-not $ext) { $script:missing += $n; $ext = 'mp3' }
  "{file:'$n.$ext'"
})
$page = $page.Replace("const musicOff = t => (SET.muted || []).includes(t.file) || !OPUS_OK;", "const musicOff = t => (SET.muted || []).includes(t.file);")
New-Item -ItemType Directory -Force (Join-Path $root 'artifact') | Out-Null
[IO.File]::WriteAllText((Join-Path $root 'artifact\iron-front.html'), $page, (New-Object System.Text.UTF8Encoding $false))
"artifact: {0:N0} bytes; tracks without an original: {1}" -f $page.Length, ($(if ($missing) { $missing -join ', ' } else { 'none' }))
