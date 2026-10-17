/* Dev tool, not part of the build: re-encodes the soundtrack to mono Opus in MP4 (.m4a) in the browser,
   with WebCodecs and mp4-muxer, so the deployed game is a fraction of the size and plays in every current
   browser. Run in the game page served by serve.ps1:  transcodeMusic()  */
window.transcodeMusic = async (kbps = 56) => {
  if (!window.Mp4Muxer) await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/mp4-muxer@5.1.3/build/mp4-muxer.js'; s.onload = res; s.onerror = rej; document.head.append(s); });
  const SR = 48000, ac = new AudioContext({sampleRate:SR}), log = [];
  for (const t of MUSIC.tracks) {
    const name = t.file.replace(/\.(mp3|ogg)$/, '.m4a');
    try {
      const buf = await ac.decodeAudioData(await fetch('music/' + t.file).then(r => r.arrayBuffer()));
      const n = buf.length, mono = new Float32Array(n), chs = buf.numberOfChannels;
      for (let c = 0; c < chs; c++) { const d = buf.getChannelData(c); for (let i = 0; i < n; i++) mono[i] += d[i] / chs; }
      const target = new Mp4Muxer.ArrayBufferTarget();
      const muxer = new Mp4Muxer.Muxer({target, audio:{codec:'opus', numberOfChannels:1, sampleRate:SR}, fastStart:'in-memory'});
      let fail = null; const enc = new AudioEncoder({output:(chunk, meta) => muxer.addAudioChunk(chunk, meta), error:e => { fail = e; }});
      enc.configure({codec:'opus', sampleRate:SR, numberOfChannels:1, bitrate:kbps * 1000});
      const F = 4096;
      for (let i = 0; i < n; i += F) {
        const len = Math.min(F, n - i), data = mono.subarray(i, i + len).slice();
        enc.encode(new AudioData({format:'f32-planar', sampleRate:SR, numberOfFrames:len, numberOfChannels:1, timestamp:Math.round(i / SR * 1e6), data}));
        if (enc.encodeQueueSize > 64) await new Promise(r => setTimeout(r, 0));
      }
      if (fail) throw fail; await enc.flush(); enc.close(); muxer.finalize();
      const out = new Blob([target.buffer], {type:'audio/mp4'});
      const st = (await fetch('/save/music/' + name, {method:'POST', body:out})).status;
      log.push(`${name} ${Math.round(buf.duration)}s ${(out.size / 1e6).toFixed(2)}MB ${st}`);
    } catch (e) { log.push(`${t.file} FAILED ${e && e.message}`); }
    window.TRANSCODE = log;
  }
  window.TRANSCODE_DONE = true; return log;
};
