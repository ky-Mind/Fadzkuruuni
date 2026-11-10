# Membangun halaman Teka-Teki Kitab (../teka-teki.html) dari sumber.html + gaya & ikon aplikasi + soal-tts.js +
# kitab-data.json. Gaya (css/app.css) dan ikon (js/core/icons.js) diambil langsung dari aplikasi, jadi tampilannya selalu
# sama. Jalankan ulang setiap kali sumber, soal, atau gaya aplikasi berubah:  python3 teka-teki/bangun.py
import pathlib

d = pathlib.Path(__file__).parent
app = d.parent
h = (d / 'sumber.html').read_text()
css = (app / 'css/app.css').read_text()
ikon = (app / 'js/core/icons.js').read_text()
# Hanya daftar ikon + fungsi ic(); baris sesudahnya mengganti [data-i] di halaman aplikasi, tidak dipakai di sini
ikon = ikon[: ikon.index('$$(')].rstrip() + '\n'
soal = (d / 'soal-tts.js').read_text()
data = (d / 'kitab-data.json').read_text()
ganti = {
    '/*APP_CSS*/': css,
    '/*APP_ICONS*/': ikon,
    '<script src="soal-tts.js"></script>': '<script>\n' + soal + '</script>',
    '/*DATA*/ []': data,
}
for isi in (css, ikon, soal, data):
    assert '</style' not in isi and '</script' not in isi
for a, b in ganti.items():
    assert h.count(a) == 1, (a, h.count(a))
    h = h.replace(a, b)
h = h.replace(
    '<!doctype html>',
    '<!doctype html>\n<!-- Dibuat oleh teka-teki/bangun.py dari teka-teki/sumber.html. Jangan diubah langsung. -->',
    1,
)
(app / 'teka-teki.html').write_text(h)
print('teka-teki.html', len(h), 'byte')
