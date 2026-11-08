/* js/dokumen.js - Halaman dokumen (Kebijakan Privasi, Penghapusan Data): tombol ganti tema terang / gelap.
   Pilihan disimpan di localStorage.fzdok (hanya untuk halaman dokumen; tema aplikasi tidak berubah). */
(function(){var b=document.getElementById('tema'),h=document.documentElement;if(!b)return;
 var ikon=function(){var t=h.dataset.theme=='dark';b.innerHTML=t?'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>':'<svg viewBox="0 0 24 24"><path d="M20 14a8 8 0 1 1-10-10 6.5 6.5 0 0 0 10 10z"/></svg>';b.setAttribute('aria-label',t?'Ganti ke tema terang':'Ganti ke tema gelap')};
 ikon();b.onclick=function(){var t=h.dataset.theme=='dark'?'light':'dark';h.dataset.theme=t;try{localStorage.fzdok=t}catch(e){}ikon()}})();
/* Kembali: bila dibuka dari aplikasi, kembali ke halaman aplikasi sebelumnya (riwayat), bukan memuat ulang dari awal */
document.querySelectorAll('[data-kembali]').forEach(function(a){a.addEventListener('click',function(e){try{if(document.referrer&&new URL(document.referrer).origin==location.origin&&history.length>1){e.preventDefault();history.back()}}catch(x){}})});
