/* js/pages/menu.js - Semua Menu */
P.menu=()=>({html:head('Semua Menu')+MENUALL.map(g=>`<h2>${g[0]}</h2><div class="grid g2">${g[1].map(m=>`<a href="#/${m[0]}"><b>${ic(m[1],26)}</b>${m[2]}</a>`).join('')}</div>`).join('')});
