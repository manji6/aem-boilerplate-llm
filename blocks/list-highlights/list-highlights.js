// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: 'Unmatched speed', description: 'AEM is the fastest way to publish, create, and serve websites.', category: 'Highlight' },
  { name: 'Content at scale', description: 'AEM allows you to publish more content in shorter time with smaller teams.', category: 'Highlight' },
  { name: 'Uncertainty eliminated', description: 'Preview content at 100% fidelity, get predictable content velocity, and shorten project durations.', category: 'Highlight' },
  { name: 'Widen the talent pool', description: 'Authors on AEM use Microsoft Word, Excel or Google Docs and need no training.', category: 'Highlight' },
  { name: 'The low-code way to developer productivity', description: 'Anyone with a little bit of HTML, CSS, and JS can build a site on AEM.', category: 'Highlight' },
  { name: 'Peak performance', description: "Use AEM's serverless architecture to meet any traffic need and evaluate every Pull-Request for Lighthouse Score.", category: 'Highlight' },
];

// Brand palette from BuildWidgetRequest (empty here — falls back to defaults).
const PALETTE = [];
function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

export default async function decorate(block, bridge) {
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.highlights — bare array outputSchema; key derived from actionName "list_highlights"
      items = structuredContent?.highlights || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderItems(block, items, bridge);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}

function renderItems(block, items, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-highlights-wrapper';

  const track = document.createElement('div');
  track.className = 'list-highlights-track';

  items.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'list-highlights-card';

    const header = document.createElement('div');
    header.className = 'list-highlights-header';
    header.style.cssText = `background-color:${CARD_COLORS[i % CARD_COLORS.length]};`;
    const headerText = document.createElement('span');
    headerText.className = 'list-highlights-header-text';
    headerText.textContent = item.name || '';
    header.appendChild(headerText);
    card.appendChild(header);

    const info = document.createElement('div');
    info.className = 'list-highlights-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    const title = document.createElement('h3');
    title.className = 'list-highlights-title';
    title.textContent = item.name || '';
    info.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'list-highlights-desc';
    desc.textContent = item.description || '';
    info.appendChild(desc);

    const btn = document.createElement('button');
    btn.className = 'list-highlights-cta';
    btn.type = 'button';
    btn.textContent = 'Tell me more';
    if (bridge) {
      btn.addEventListener('click', () => bridge.sendMessage(`Tell me more about ${item.name}`));
    }
    info.appendChild(btn);

    card.appendChild(info);
    track.appendChild(card);
  });

  wrapper.appendChild(track);

  const fade = document.createElement('div');
  fade.className = 'list-highlights-fade';
  fade.style.cssText = `background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);`;
  wrapper.appendChild(fade);

  const leftBtn = document.createElement('button');
  leftBtn.className = 'list-highlights-nav list-highlights-nav-left';
  leftBtn.type = 'button';
  leftBtn.setAttribute('aria-label', 'Scroll left');
  leftBtn.textContent = '◀';

  const rightBtn = document.createElement('button');
  rightBtn.className = 'list-highlights-nav list-highlights-nav-right';
  rightBtn.type = 'button';
  rightBtn.setAttribute('aria-label', 'Scroll right');
  rightBtn.textContent = '▶';

  const scrollByCard = (dir) => {
    const card = track.querySelector('.list-highlights-card');
    const amount = card ? card.offsetWidth + 16 : 236;
    track.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };
  leftBtn.addEventListener('click', () => scrollByCard(-1));
  rightBtn.addEventListener('click', () => scrollByCard(1));
  [leftBtn, rightBtn].forEach((b, idx) => {
    b.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollByCard(idx === 0 ? -1 : 1); }
    });
  });

  const updateNav = () => {
    const maxScroll = track.scrollWidth - track.clientWidth - 1;
    leftBtn.style.display = track.scrollLeft <= 0 ? 'none' : 'flex';
    rightBtn.style.display = track.scrollLeft >= maxScroll ? 'none' : 'flex';
    fade.style.display = track.scrollLeft >= maxScroll ? 'none' : 'block';
  };
  track.addEventListener('scroll', updateNav);
  wrapper.appendChild(leftBtn);
  wrapper.appendChild(rightBtn);

  block.appendChild(wrapper);
  requestAnimationFrame(updateNav);
}
