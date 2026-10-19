# Builds the single-file game from src/ (modules concatenated in order).
#   iron-front.html       -> the page that is published (no doctype; the host adds the skeleton)
#   dist/index.html       -> a standalone copy with a doctype, for playing offline
# Test in the browser:  iron-front.html#validate   and   iron-front.html#autoplay
$src = Join-Path $PSScriptRoot 'src'
$order = 'data.js','maps.js','engine.js','art.js','audio.js','music.js','sfx-credits.js','fx.js','battle.js','intel.js','history.js','theatres.js','theatres-art.js','missions2.js','history2.js','modes.js','desert.js','zombies.js','barks.js','italy.js','carrier.js','desertfox.js','burma.js','winterwar.js','barbarossa.js','norway.js','italy44.js','maple.js','anzacs.js','philippines.js','fareast.js','harden.js','medals.js','editor.js','ai.js','ui.js','title.js','difficulty.js','net.js','pad.js','test.js'
$js = ($order | ForEach-Object { [IO.File]::ReadAllText((Join-Path $src $_)) }) -join "`n"
$css = [IO.File]::ReadAllText((Join-Path $src 'style.css'))
$shell = [IO.File]::ReadAllText((Join-Path $src 'shell.html'))
$page = $shell.Replace('/*__CSS__*/', $css).Replace('/*__JS__*/', $js)
$utf8 = New-Object System.Text.UTF8Encoding $false
[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'iron-front.html'), $page, $utf8)
New-Item -ItemType Directory -Force (Join-Path $PSScriptRoot 'dist') | Out-Null
$doc = "<!doctype html>`n<html lang=`"en`"><head><meta charset=`"utf-8`">`n" + $page + "`n</html>"
[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'dist\index.html'), $doc, $utf8)
[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'index.html'), $doc, $utf8)   # root copy: GitHub Pages and git clones play it beside music/ and sfx/
"built: {0:N0} bytes" -f $page.Length
# syntax-check the whole script as the browser will see it (a comment that swallows the end of a line passes each file's own check)
$node = (Get-Command node -ErrorAction SilentlyContinue).Source; if (-not $node) { $node = Get-ChildItem "$env:TEMP\nodep" -Recurse -Filter node.exe -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName }
if ($node) { $chk = Join-Path $env:TEMP 'if44-built.js'; [IO.File]::WriteAllText($chk, $js, $utf8); $err = & $node --check $chk 2>&1; if ($LASTEXITCODE) { Write-Warning "BUILD SCRIPT DOES NOT PARSE:"; $err | Select-Object -First 6 | ForEach-Object { Write-Warning $_ } } else { 'script parses' } }
