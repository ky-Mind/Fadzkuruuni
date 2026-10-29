/* js/core/quran-api.js - Pengambilan teks Al-Qur'an (disimpan service worker untuk offline) */
const qUrl=n=>`https://api.alquran.cloud/v1/surah/${n}/editions/quran-uthmani,id.indonesian,en.transliteration`;
const qGet=async n=>{const r=await fetch(qUrl(n));if(!r.ok)throw 0;const d=(await r.json()).data;return d[0].ayahs.map((a,i)=>({a:a.text,t:d[1].ayahs[i].text,l:d[2]?.ayahs?.[i]?.text||''}))};
