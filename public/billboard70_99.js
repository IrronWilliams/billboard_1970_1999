// ── iTunes image fetch ───────────────────────────────────
async function getArtwork(term) {
  try {
    const r = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=album&limit=3`
    );
    if (!r.ok) return null;
    const d = await r.json();
    const hit = d.results && d.results.find(x => x.artworkUrl100);
    return hit ? hit.artworkUrl100.replace('100x100bb', '500x500bb') : null;
  } catch { return null; }
}

// ── Hero wall ────────────────────────────────────────────
const heroTerms = [
  'Michael Jackson', 'Madonna', 'Prince', 'Stevie Wonder',
  'Whitney Houston', 'Elton John', 'Led Zeppelin', 'Marvin Gaye',
  'Donna Summer', 'Earth Wind Fire', 'Nirvana', 'Mariah Carey',
  'TLC group', 'Boyz II Men', 'ABBA', 'Fleetwood Mac'
];

function buildHeroWall() {
  const wall = document.getElementById('heroWall');
  heroTerms.forEach((_, i) => {
    const cell = document.createElement('div');
    cell.className = 'hero-cell';
    cell.id = `hc${i}`;
    wall.appendChild(cell);
  });
  heroTerms.forEach(async (term, i) => {
    const url = await getArtwork(term);
    const cell = document.getElementById(`hc${i}`);
    if (!cell || !url) return;
    const img = document.createElement('img');
    img.alt = term;
    img.onload = () => setTimeout(() => img.classList.add('in'), i * 70);
    img.src = url;
    cell.appendChild(img);
  });
}

// ── Artist grids ─────────────────────────────────────────
const decades = {
  '70s': [
    { q: 'Stevie Wonder',    n: 'Stevie Wonder'      },
    { q: 'Elton John',       n: 'Elton John'         },
    { q: 'Donna Summer',     n: 'Donna Summer'       },
    { q: 'Marvin Gaye',      n: 'Marvin Gaye'        },
    { q: 'Led Zeppelin',     n: 'Led Zeppelin'       },
    { q: 'ABBA',             n: 'ABBA'               },
    { q: 'Earth Wind Fire',  n: 'Earth, Wind & Fire' },
    { q: 'Fleetwood Mac',    n: 'Fleetwood Mac'      },
  ],
  '80s': [
    { q: 'Michael Jackson',   n: 'Michael Jackson'   },
    { q: 'Madonna',           n: 'Madonna'           },
    { q: 'Prince',            n: 'Prince'            },
    { q: 'Whitney Houston',   n: 'Whitney Houston'   },
    { q: 'Bruce Springsteen', n: 'Bruce Springsteen' },
    { q: 'Cyndi Lauper',      n: 'Cyndi Lauper'      },
    { q: 'U2',                n: 'U2'                },
    { q: 'Duran Duran',       n: 'Duran Duran'       },
  ],
  '90s': [
    { q: 'Mariah Carey',      n: 'Mariah Carey'      },
    { q: 'Nirvana',           n: 'Nirvana'           },
    { q: 'TLC group',         n: 'TLC'               },
    { q: 'Boyz II Men',       n: 'Boyz II Men'       },
    { q: 'Alanis Morissette', n: 'Alanis Morissette' },
    { q: 'Backstreet Boys',   n: 'Backstreet Boys'   },
    { q: 'Tupac',             n: '2Pac'              },
    { q: 'Spice Girls',       n: 'Spice Girls'       },
  ]
};

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

async function buildGrid(decade) {
  const grid = document.getElementById(`ag-${decade}`);
  const artists = decades[decade];

  artists.forEach((a, i) => {
    const card = document.createElement('div');
    card.className = 'a-card';
    card.innerHTML = `
      <div class="a-card-init">${initials(a.n)}</div>
      <div class="a-card-shade"><div class="a-card-name">${a.n}</div></div>`;
    card.addEventListener('click', () => {
      window.location.href = `artist2.html?artist=${encodeURIComponent(a.n)}`;
    });
    grid.appendChild(card);
  });

  artists.forEach(async (a, i) => {
    const url = await getArtwork(a.q);
    const card = grid.children[i];
    if (!url || !card) return;
    const img = document.createElement('img');
    img.alt = a.n;
    img.onload = () => {
      const init = card.querySelector('.a-card-init');
      if (init) init.style.display = 'none';
      card.insertBefore(img, card.firstChild);
    };
    img.src = url;
  });
}

// ── Stat counters ────────────────────────────────────────
function runCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const dur = 1400;
  const t0 = performance.now();
  (function tick(now) {
    const p = Math.min((now - t0) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(ease * target).toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}

// ── Intersection observers ───────────────────────────────
function setupIO() {
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revealIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(
    '.fact-item, .pull-quote, .a-card, .w-card, .trend-bar'
  ).forEach(el => revealIO.observe(el));

  const statIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        runCounter(e.target);
        statIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-num[data-target]').forEach(el => statIO.observe(el));
}

// ── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildHeroWall();
  buildGrid('70s');
  buildGrid('80s');
  buildGrid('90s');
  setupIO();
});
