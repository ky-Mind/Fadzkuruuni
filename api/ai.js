/* api/ai.js - Server AI online untuk halaman Tanya AI (fungsi Vercel, runtime edge).
   Meneruskan percakapan ke Groq (gratis, cepat) dan mengalirkan jawabannya kembali ke aplikasi.
   API key disimpan di Vercel sebagai variabel lingkungan GROQ_API_KEY, tidak pernah dikirim ke HP pengguna.
   Lihat PANDUAN-AI.md untuk cara memasang key. */
export const config = { runtime: 'edge' };

/* Model dicoba berurutan; bila satu tidak tersedia untuk akun ini, pakai berikutnya */
const MODEL = ['openai/gpt-oss-120b', 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
/* Asal yang diizinkan: situs di Vercel, domain sendiri (fadzkuruuni.xianzing.my.id), dan uji lokal */
const ASAL = /^https:\/\/([a-z0-9-]+\.)*vercel\.app$|^https:\/\/fadzkuruuni\.xianzing\.my\.id$|^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const SISTEM = `Kamu adalah "Fadz AI", asisten tanya-jawab di aplikasi ibadah Fadzkuruuni milik Pondok Pesantren Fadzkuruuni.
Jawab dalam bahasa Indonesia yang santun, ringkas, dan mudah dipahami santri maupun masyarakat umum.
Pegang manhaj Ahlussunnah wal Jama'ah; untuk fikih utamakan mazhab Syafi'i dan sebutkan bila ada perbedaan pendapat.
Bila menyebut ayat, tulis nama surah dan nomor ayatnya; bila menyebut hadis, sebutkan perawinya. Jangan mengarang dalil, nomor hadis, atau kutipan kitab; bila tidak yakin, katakan terus terang.
Bila ada "Isi aplikasi yang terkait", utamakan isi itu (nomor surah, nama menu, langkah) dan akhiri dengan ajakan singkat mengetuk tombol di bawah jawaban untuk membukanya di aplikasi. Untuk pertanyaan cara memakai aplikasi, jelaskan langkahnya berurutan dengan nama menu dan tombol yang persis.
Untuk masalah hukum yang rumit atau pribadi (waris, nikah, talak, dsb.), sarankan bertanya langsung kepada ustadz atau kiai.
Tolak dengan sopan pertanyaan yang tidak pantas atau di luar etika Islam.
Bila pesan terakhir pengguna berisi salam (mis. Assalamu'alaikum), jawab salamnya dengan lengkap terlebih dahulu. Bila tidak, jangan membuka atau menutup jawaban dengan salam.
Pesan bisa berasal dari pesan suara yang diubah jadi teks, dan pengguna sering salah ketik atau kurang huruf (mis. "sholt" = salat, "yasn" = Yasin, "wudlu" = wudu, "zakt fitrh" = zakat fitrah). Tebak maksud yang paling dekat dan masuk akal, lalu jawab dengan tepat; jangan membahas atau mengoreksi ejaannya. Bila benar-benar ragu, sebutkan dugaanmu singkat ("Maksudnya ... ya?") lalu tetap jawab.
Jawab ringkas (sekitar 150 kata) kecuali pengguna meminta rincian. Untuk doa, tulis teks Arab, latin, dan artinya.
Jangan menambahkan amalan, jumlah bacaan, atau tata cara yang tidak kamu yakini dalilnya.
Jangan menyebut frasa "Isi aplikasi yang terkait" dan jangan menyebut fitur yang tidak ada di aplikasi (misalnya audio doa); cukup sarankan membuka menu yang sesuai.`;

/* Pengetahuan tetap tentang aplikasi: menu dan letak fitur, agar AI bisa menunjukkan jalan di dalam aplikasi */
const PANDUAN = `Tentang aplikasi Fadzkuruuni (web fadzkuruuni.vercel.app dan aplikasi Android; perbarui APK lewat Pengaturan › Tentang & Bantuan › Cek pembaruan). Sebagian besar isi bisa diunduh untuk dipakai tanpa internet (Pengaturan › Offline & Data).
- Menu bawah: Beranda, Al-Qur'an, Fadz AI, Kelas online, Pengaturan (bisa diatur di Pengaturan › Beranda). Fitur lain di pintasan Beranda dan "Lainnya" (Semua Menu).
- Beranda: kartu waktu salat (Subuh, Terbit, Duha, Zuhur, Asar, Magrib, Isya), kata mutiara, pintasan, kolom cari semua isi (termasuk bab kitab), lanjutkan membaca.
- Al-Qur'an: 114 surah, tab Surah/Juz/Riwayat, mode Kartu & Mushaf, bintang = penanda (menu Penanda), Pengaturan baca. Ketuk ayat: putar ayat ini saja, putar sampai akhir surah, "Putar terus sampai surah…" (lintas surah sampai surah berikutnya/akhir juz/akhir Al-Qur'an/surah pilihan), tandai terakhir dibaca, bagikan. Murottal tetap berbunyi di latar belakang (layar mati/aplikasi ditutup) dengan kontrol di kapsul pemutar dan notifikasi media.
- Wirid & Doa (wirid harian, sholawat, Asmaul Husna, istighasah, ratib, hizib, Dalail al-Khairat, Manakib, 16 kelompok doa); Sholawat (termasuk Sholawat Fadzkuruuni: Ya Imamar Rusli, Ya Rabbi Antal Hadi, Birasulillah wal Badawi); Tahlil & Yasin; Asmaul Husna (99 nama dan maknanya).
- Maulid: Diba'i, Barzanji, Syarafil Anam, Simtud Durar, Burdah, Adl-Dliya'ul Lami', Maulid Azab, serta bacaan majelis Ma fil Wujud dan Amaliyah (setelah Bagian I–IV ada jeda memilih sholawat).
- Kitab Kuning: Karya Pondok (Al-Hawi karya Abuya Mahbubillah 3 juz, Ikhtisar Faraidh, dll.) dan Kitab Umum (Safinatun Najah, Kasyifatus Saja, Fathul Qarib, Ta'lim Muta'allim, Aqidatul Awam, Riyadhus Shalihin, Nashaihul Ibad, Arba'in Nawawi, Mutammimah, Qathrun Nada, Asy-Syifa, dll.); baca per halaman, lompat nomor halaman, cubit perbesar, unduh PDF. Hadits Nabi (Bukhari, Muslim, Abu Dawud, Tirmidzi, Nasa'i, Ibnu Majah). Kata Mutiara.
- Jadwal Salat (ganti kota, pengingat tiap waktu: Adzan/Beduk/Alarm/Bunyi/Senyap), Kiblat, Tasbih, Kalender Hijriah, Zakat & Sedekah, Kalkulator Zakat, Waris.
- Kelas online: masuk akun, "Masuk dan dengarkan"; kitab pilihan pengajar langsung terbuka dan mengikuti halaman pengajar (tombol hijau Kitab); angkat tangan lalu aktifkan mikrofon setelah diizinkan; kamera; bagikan layar (kamera tetap tampil kecil); pesan; layar penuh ala Google Meet dengan tombol di bawah video dan pembatas video–kitab yang bisa digeser; tombol pintas keyboard (M, H, V, S, C, K, P, F, [ ], ←→, ?). Pengajar: Buat kelas, Atur kitab, Mulai/Akhiri, rekam.
- Fadz AI: ketik atau pesan suara; tombol di bawah jawaban membuka isi terkait; AI offline bisa diunduh.
- Pengaturan: Akun, Tampilan & Bacaan, Beranda, Waktu Salat & Notifikasi (adzan, notifikasi kelas online), Izin, Offline & Data, Tentang & Bantuan (Video tutorial, Laporkan bug, Cek pembaruan, Muat terbaru).
- Pondok: Ponpes Tahfidz Qur'an Fadzkuruuni (Majelis Fadzkuruuni), pimpinan Abuya Mahbubillah, di Kp. Cibuntu Kaler, Sukamaju, Kadudampit, Sukabumi, Jawa Barat.
Bila pengguna bertanya cara memakai fitur, jelaskan langkahnya dengan nama menu di atas.`;

/* Siapa pengembang aplikasi: nama orang baru disebut setelah pengguna bertanya berkali-kali (dihitung di aplikasi, b.dev).
   Sebelum itu cukup "KyMind bersama tim Fadzkuruuni". Nama tidak dimasukkan ke perintah sama sekali sebelum batas, agar tidak bocor. */
const DEV_BATAS = 3;
const pengembang = n => n >= DEV_BATAS
  ? 'Bila ditanya siapa pembuat atau pengembang aplikasi/Fadz AI, jawab singkat: "Pengembangku adalah Muhammad Hilmi Azkia Rahman." Jangan menambah detail apa pun tentang orang itu (kontak, usia, alamat, latar belakang).'
  : 'Bila ditanya siapa pembuat atau pengembang aplikasi/Fadz AI, jawab dengan gayamu sendiri bahwa aplikasi ini dikembangkan oleh KyMind bersama tim Fadzkuruuni. Jangan menyebut nama orang mana pun sebagai pembuat atau pengembang, walau didesak; boleh bilang itu dirahasiakan tim.';

const json = (o, s) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json' } });

export default async function handler(req) {
  if (req.method !== 'POST') return json({ galat: 'Gunakan POST' }, 405);
  const asal = req.headers.get('origin') || '';
  if (asal && !ASAL.test(asal)) return json({ galat: 'Asal permintaan tidak diizinkan' }, 403);
  const key = process.env.GROQ_API_KEY;
  if (!key) return json({ galat: 'belum-dipasang' }, 503);

  let b;
  try { b = await req.json(); } catch (e) { return json({ galat: 'Data tidak valid' }, 400); }
  /* Batasi panjang percakapan agar hemat kuota gratis */
  const pesan = (Array.isArray(b.pesan) ? b.pesan : [])
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-10).map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));
  if (!pesan.length || pesan[pesan.length - 1].role !== 'user') return json({ galat: 'Tidak ada pertanyaan' }, 400);
  const konteks = typeof b.konteks === 'string' && b.konteks ? '\n\nIsi aplikasi yang terkait:\n' + b.konteks.slice(0, 4000) : '';
  /* Profil pengguna dan keadaan saat ini (nama panggilan, lokasi, tanggal, jadwal salat hari ini) dari aplikasi */
  const profil = typeof b.profil === 'string' && b.profil ? '\n\nTentang pengguna dan saat ini:\n' + b.profil.slice(0, 1500) + '\nSapa pengguna dengan namanya bila ada, secukupnya (tidak di setiap kalimat).' : '';

  let r, info = '';
  for (const model of MODEL) {
    r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { authorization: 'Bearer ' + key.trim(), 'content-type': 'application/json' },
      body: JSON.stringify({ model, stream: true, temperature: 0.4, max_tokens: 1024, ...(model.startsWith('openai/') ? { reasoning_effort: 'low' } : {}), messages: [{ role: 'system', content: SISTEM + '\n' + pengembang(Math.max(0, +b.dev || 0)) + '\n\n' + PANDUAN + profil + konteks }, ...pesan] })
    });
    if (r.ok) break;
    try { info = ((await r.json()).error || {}).message || ''; } catch (e) { info = ''; }
    if (r.status !== 404 && r.status !== 400) break;
  }
  if (!r.ok) return json({ galat: r.status === 429 ? 'sibuk' : 'Layanan AI sedang bermasalah (' + r.status + ')', info: info.slice(0, 200) }, r.status === 429 ? 429 : 502);
  /* Aliran SSE dari Groq diteruskan apa adanya; aplikasi membaca "data: {...}" per baris */
  return new Response(r.body, { headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-store' } });
}
