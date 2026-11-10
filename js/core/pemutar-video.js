/* js/core/pemutar-video.js - Pemutar video bersama: video tutorial dan rekaman kelas online.
   Satu tampilan untuk semua sumber:
   - berkas video biasa (<video>, mis. tutorial, rekaman .mp4/.webm, Google Drive), dan
   - video YouTube (lewat YouTube IFrame API, dikendalikan dari bilah yang sama).
   Bilah kendali di bawah video: bilah waktu yang bisa digeser bebas (dengan waktu berjalan / total), mundur 10 detik,
   putar/jeda, maju 10 detik, kecepatan 0,75× · 1× · 1,25× · 1,5× · 2× (diingat di S.vpSpd), dan layar penuh.
   Ketuk video = putar/jeda. Papan ketik saat pemutar disorot: spasi/K putar-jeda, ←/→ 10 detik, F layar penuh. */

const VP_SPD = [0.75, 1, 1.25, 1.5, 2];
const vpKecepatan = () => S.vpSpd || S.tutSpd || 1;
const vpJam = (d) => {
  if (!isFinite(d) || d < 0) d = 0;
  d = Math.floor(d);
  const j = Math.floor(d / 3600),
    m = Math.floor((d % 3600) / 60),
    s = String(d % 60).padStart(2, '0');
  return j ? `${j}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
};

/* Markup pemutar.
   o.src    : alamat berkas video (jenis berkas)
   o.yt     : ID video YouTube (jenis YouTube)
   o.poster : gambar sampul (opsional)
   o.label  : nama video untuk pembaca layar
   o.cadangan : alamat yang dibuka di iframe bila berkas gagal diputar (mis. pratinjau Google Drive) */
function vpHtml(o) {
  const media = o.yt
    ? `<div class="vpm vpyt" data-vpyt="${esc(o.yt)}"></div>`
    : `<video class="vpm" playsinline preload="metadata"${o.poster ? ` poster="${esc(o.poster)}"` : ''} src="${esc(o.src)}"${o.cadangan ? ` data-vpcad="${esc(o.cadangan)}"` : ''}></video>`;
  const sp = vpKecepatan();
  return `<div class="vp${o.kelas ? ' ' + o.kelas : ''}" tabindex="0" role="region" aria-label="Pemutar video: ${esc(o.label || 'video')}">
  <div class="vpl">${media}<button type="button" class="vpbesar" data-vp="main" aria-label="Putar">${ic('play', 34)}</button><span class="vpmuat" hidden></span></div>
  <div class="vpk">
    <div class="vpw"><span class="vpt0">0:00</span><input class="vps" type="range" min="0" max="1000" step="1" value="0" aria-label="Geser waktu video"><span class="vpt1">0:00</span></div>
    <div class="vpb">
      <button type="button" class="vpi" data-vp="-10" aria-label="Mundur 10 detik"><span class="vpn">${ic('back', 18)}<i>10</i></span></button>
      <button type="button" class="vpi vpp" data-vp="main" aria-label="Putar">${ic('play', 22)}</button>
      <button type="button" class="vpi" data-vp="10" aria-label="Maju 10 detik"><span class="vpn"><i>10</i>${ic('next', 18)}</span></button>
      <div class="vpsp" role="group" aria-label="Kecepatan">${VP_SPD.map((v) => `<button type="button" data-vpsp="${v}" aria-pressed="${v == sp}"${v == sp ? ' class="on"' : ''}>${String(v).replace('.', ',')}×</button>`).join('')}</div>
      <button type="button" class="vpi" data-vp="penuh" aria-label="Layar penuh">${ic('full', 18)}</button>
    </div>
  </div>
</div>`;
}

/* ---------- Penghubung sumber video: berkas (<video>) dan YouTube, dengan antarmuka yang sama ---------- */
const VPYT = new WeakMap();
let VPYT_API = null;
const vpYtApi = () =>
  VPYT_API ||
  (VPYT_API = new Promise((ok, gagal) => {
    if (window.YT && YT.Player) return ok();
    const lama = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      lama && lama();
      ok();
    };
    ldjs('https://www.youtube.com/iframe_api').catch((e) => {
      VPYT_API = null;
      gagal(e);
    });
  }));

function vpSumber(vp) {
  const v = vp.querySelector('video.vpm');
  if (v)
    return {
      waktu: () => v.currentTime || 0,
      total: () => v.duration || 0,
      main: () => !v.paused && !v.ended,
      putar: () => v.play().catch(() => {}),
      jeda: () => v.pause(),
      ke: (t) => (v.currentTime = Math.max(0, Math.min((v.duration || 1e9) - 0.2, t))),
      laju: (x) => (v.playbackRate = v.defaultPlaybackRate = x),
    };
  const p = VPYT.get(vp);
  if (!p || !p.getPlayerState) return null;
  return {
    waktu: () => p.getCurrentTime() || 0,
    total: () => p.getDuration() || 0,
    main: () => p.getPlayerState() == 1,
    putar: () => p.playVideo(),
    jeda: () => p.pauseVideo(),
    ke: (t) => p.seekTo(Math.max(0, Math.min((p.getDuration() || 1e9) - 0.5, t)), true),
    laju: (x) => p.setPlaybackRate(x),
  };
}

/* Gambar ulang bilah dari keadaan video */
function vpGambar(vp) {
  const s = vpSumber(vp);
  if (!s) return;
  const t = s.waktu(),
    d = s.total(),
    main = s.main(),
    geser = vp.querySelector('.vps');
  if (geser && !vp.vpTarik) {
    geser.value = d ? Math.round((t / d) * 1000) : 0;
    geser.style.setProperty('--p', (d ? (t / d) * 100 : 0) + '%');
  }
  vp.querySelector('.vpt0').textContent = vpJam(t);
  vp.querySelector('.vpt1').textContent = vpJam(d);
  if (vp.vpMain !== main) {
    vp.vpMain = main;
    vp.classList.toggle('main', main);
    vp.querySelectorAll('[data-vp="main"]').forEach((b) => {
      b.setAttribute('aria-label', main ? 'Jeda' : 'Putar');
      if (b.classList.contains('vpp')) b.innerHTML = ic(main ? 'pause' : 'play', 22);
    });
  }
}

/* Pasang semua pemutar di dalam el (dipanggil setelah markup dimasukkan) */
function vpPasang(el) {
  (el || document).querySelectorAll('.vp:not([data-vpsiap])').forEach((vp) => {
    vp.dataset.vpsiap = '1';
    const v = vp.querySelector('video.vpm');
    if (v) {
      const muat = vp.querySelector('.vpmuat');
      ['timeupdate', 'play', 'pause', 'ended', 'loadedmetadata', 'durationchange', 'seeked'].forEach((n) =>
        v.addEventListener(n, () => vpGambar(vp))
      );
      v.addEventListener('play', () => (v.playbackRate = v.defaultPlaybackRate = vpKecepatan()));
      v.addEventListener('waiting', () => (muat.hidden = false));
      ['playing', 'canplay', 'pause'].forEach((n) => v.addEventListener(n, () => (muat.hidden = true)));
      /* Berkas tidak bisa diputar langsung (mis. Google Drive berukuran besar): ganti dengan pratinjau sumbernya */
      v.addEventListener('error', () => {
        const cad = v.dataset.vpcad;
        if (!cad) return toast('Video belum bisa diputar. Periksa koneksi lalu coba lagi.');
        vp.classList.add('vpcad');
        vp.querySelector('.vpl').innerHTML =
          `<iframe src="${esc(cad)}" allow="autoplay; fullscreen" allowfullscreen title="Video"></iframe>`;
        vp.querySelector('.vpk').innerHTML =
          '<p class="mut vpcatat">Video ini diputar dari Google Drive, gunakan tombol di dalam video untuk menggeser dan mengatur kecepatan.</p>';
      });
      return;
    }
    const kotak = vp.querySelector('[data-vpyt]');
    if (!kotak) return;
    vpYtApi()
      .then(() => {
        if (!kotak.isConnected) return;
        const p = new YT.Player(kotak, {
          videoId: kotak.dataset.vpyt,
          host: 'https://www.youtube-nocookie.com',
          playerVars: {
            autoplay: 1,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            controls: 0,
            disablekb: 1,
            iv_load_policy: 3,
          },
          events: {
            onReady: () => {
              VPYT.set(vp, p);
              p.setPlaybackRate(vpKecepatan());
              vpGambar(vp);
              /* YouTube tidak mengabarkan waktu berjalan: dibaca 4× per detik selama pemutar masih tampil */
              const jam = setInterval(() => (vp.isConnected ? vpGambar(vp) : clearInterval(jam)), 250);
            },
            onStateChange: () => vpGambar(vp),
          },
        });
      })
      .catch(() => {
        /* API YouTube tidak termuat: video tetap bisa ditonton dengan kendali bawaan YouTube */
        kotak.outerHTML = `<iframe class="vpm" src="https://www.youtube-nocookie.com/embed/${esc(kotak.dataset.vpyt)}?autoplay=1&playsinline=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="Video"></iframe>`;
        vp.querySelector('.vpk').hidden = true;
        vp.querySelector('.vpbesar').hidden = true;
      });
  });
}

/* ---------- Kendali (didelegasikan: berlaku untuk semua pemutar) ---------- */
function vpPenuh(vp) {
  const keluar = document.fullscreenElement || document.webkitFullscreenElement;
  if (keluar) return (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  const v = vp.querySelector('video.vpm');
  if (vp.requestFullscreen)
    return vp.requestFullscreen().catch(() => v && v.webkitEnterFullscreen && v.webkitEnterFullscreen());
  if (vp.webkitRequestFullscreen) return vp.webkitRequestFullscreen();
  if (v && v.webkitEnterFullscreen) v.webkitEnterFullscreen();
}

function vpAksi(vp, a) {
  const s = vpSumber(vp);
  if (!s) return;
  if (a == 'main') s.main() ? s.jeda() : s.putar();
  else if (a == 'penuh') vpPenuh(vp);
  else s.ke(s.waktu() + +a);
  setTimeout(() => vpGambar(vp), 60);
}

document.addEventListener('click', (e) => {
  const t = e.target;
  if (!t.closest) return;
  const vp = t.closest('.vp');
  if (!vp) return;
  const b = t.closest('[data-vp]');
  if (b) return vpAksi(vp, b.dataset.vp);
  const sp = t.closest('[data-vpsp]');
  if (sp) {
    const x = +sp.dataset.vpsp;
    S.vpSpd = x;
    save();
    vpSumber(vp)?.laju(x);
    sp.parentElement.querySelectorAll('button').forEach((y) => {
      y.classList.toggle('on', y == sp);
      y.setAttribute('aria-pressed', y == sp);
    });
    return toast('Kecepatan video ' + String(x).replace('.', ',') + '×');
  }
  /* Ketuk gambar video = putar/jeda */
  if (t.closest('.vpl') && t.matches('video.vpm')) vpAksi(vp, 'main');
});

/* Bilah waktu: ikut jari selama digeser, video melompat saat dilepas (dan sesekali saat digeser, agar gambarnya ikut) */
document.addEventListener('input', (e) => {
  const g = e.target;
  if (!g.matches || !g.matches('.vp .vps')) return;
  const vp = g.closest('.vp'),
    s = vpSumber(vp);
  if (!s) return;
  vp.vpTarik = 1;
  const t = (g.value / 1000) * s.total();
  g.style.setProperty('--p', g.value / 10 + '%');
  vp.querySelector('.vpt0').textContent = vpJam(t);
  clearTimeout(vp.vpT);
  vp.vpT = setTimeout(() => s.ke(t), 120);
});
document.addEventListener('change', (e) => {
  const g = e.target;
  if (!g.matches || !g.matches('.vp .vps')) return;
  const vp = g.closest('.vp'),
    s = vpSumber(vp);
  if (s) s.ke((g.value / 1000) * s.total());
  vp.vpTarik = 0;
});

addEventListener('keydown', (e) => {
  const vp = e.target.closest && e.target.closest('.vp');
  if (!vp || e.target.matches('input:not(.vps),textarea')) return;
  const k = e.key.toLowerCase(),
    a = k == ' ' || k == 'k' ? 'main' : k == 'arrowleft' ? '-10' : k == 'arrowright' ? '10' : k == 'f' ? 'penuh' : '';
  if (!a) return;
  e.preventDefault();
  vpAksi(vp, a);
});
