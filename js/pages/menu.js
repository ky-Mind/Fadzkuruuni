/* js/pages/menu.js - Semua Menu */
/* Kelompok & isi diatur admin (TATA.menu, js/core/tata.js) */
P.menu = () => ({
  html:
    head('Semua Menu') +
    tataMenu()
      .map(
        (g, gi) =>
          `<h2>${esc(g[0])}</h2><div class="grid g2">${g[1].map((m) => `<a href="#/${m[0]}" data-ta="menu:${gi}|${m[0]}"><b>${ic(m[1], 26)}</b>${esc(m[2])}</a>`).join('')}</div>`
      )
      .join(''),
});
