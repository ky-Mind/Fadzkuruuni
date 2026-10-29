/* js/pages/artikel.js - Artikel */
P.artikel=i=>i!=null&&ART[i]?{html:head(ART[i].t,'#/artikel')+`<span class="chip">${ART[i].g}</span><p>${ART[i].b}</p>`}:{html:`<h1>Artikel</h1>`+artList()};
const artList=()=>list(ART,(a,i)=>`<a class="row" href="#/artikel/${i}"><span class="t"><span class="chip">${a.g}</span><br>${a.t}</span>${ic('next',18)}</a>`);
