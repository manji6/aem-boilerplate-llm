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

// Brand palette from BuildWidgetRequest (empty here → fallback colors used).
const PALETTE = [];
function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  const lum = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 20; i += 1) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m;
    else lo = m;
  }
  const dr = Math.round(r * lo);
  const dg = Math.round(g * lo);
  const db = Math.round(b * lo);
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return { bg: `#${toHex(dr)}${toHex(dg)}${toHex(db)}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

function render(block, allItems, bridge) {
  const root = document.createElement('div');
  root.className = 'search-content-root';

  // Search bar
  const searchBar = document.createElement('form');
  searchBar.className = 'search-content-bar';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'search-content-input';
  input.placeholder = 'Search the site';
  input.setAttribute('aria-label', 'Search the site');
  searchBar.appendChild(input);

  const searchBtn = document.createElement('button');
  searchBtn.type = 'submit';
  searchBtn.className = 'search-content-search-btn';
  searchBtn.textContent = 'Search';
  searchBar.appendChild(searchBtn);

  root.appendChild(searchBar);

  // Carousel wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'search-content-carousel-wrap';

  const track = document.createElement('div');
  track.className = 'search-content-track';
  wrapper.appendChild(track);

  // Fade gradient
  const fade = document.createElement('div');
  fade.className = 'search-content-fade';
  fade.style.background = `linear-gradient(to right, transparent, ${theme?.bg ?? '#1a1a1a'}cc)`;
  wrapper.appendChild(fade);

  // Nav arrows
  const leftBtn = document.createElement('button');
  leftBtn.type = 'button';
  leftBtn.className = 'search-content-arrow search-content-arrow-left';
  leftBtn.setAttribute('aria-label', 'Scroll left');
  leftBtn.textContent = '◀';

  const rightBtn = document.createElement('button');
  rightBtn.type = 'button';
  rightBtn.className = 'search-content-arrow search-content-arrow-right';
  rightBtn.setAttribute('aria-label', 'Scroll right');
  rightBtn.textContent = '▶';

  wrapper.appendChild(leftBtn);
  wrapper.appendChild(rightBtn);

  root.appendChild(wrapper);

  const emptyState = document.createElement('div');
  emptyState.className = 'search-content-empty';
  emptyState.textContent = 'No matching content found.';
  emptyState.hidden = true;
  root.appendChild(emptyState);

  block.appendChild(root);

  function updateArrows() {
    const maxScroll = track.scrollWidth - track.clientWidth - 1;
    leftBtn.hidden = track.scrollLeft <= 0;
    rightBtn.hidden = track.scrollLeft >= maxScroll;
  }

  function renderCards(list) {
    track.textContent = '';
    const shown = (list || []).slice(0, 5);
    emptyState.hidden = shown.length > 0;
    wrapper.style.display = shown.length > 0 ? '' : 'none';

    shown.forEach((item, i) => {
      const card = document.createElement('div');
      card.className = 'search-content-card';

      const imageContainer = document.createElement('div');
      imageContainer.className = 'search-content-card-image';
      const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
      const colorDiv = () => {
        const d = document.createElement('div');
        d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
        return d;
      };
      if (item.image_url) {
        const img = document.createElement('img');
        img.src = item.image_url;
        img.alt = item.name || '';
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
        img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
        imageContainer.appendChild(img);
      } else {
        imageContainer.appendChild(colorDiv());
      }
      card.appendChild(imageContainer);

      const info = document.createElement('div');
      info.className = 'search-content-card-info';
      info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

      const title = document.createElement('h3');
      title.className = 'search-content-card-title';
      title.textContent = item.name || '';
      info.appendChild(title);

      const desc = document.createElement('p');
      desc.className = 'search-content-card-desc';
      desc.textContent = item.description || '';
      info.appendChild(desc);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'search-content-card-cta';
      if (item.url) {
        btn.textContent = 'View page';
        if (bridge) btn.addEventListener('click', () => bridge.openLink(item.url));
      } else {
        btn.textContent = 'Tell me more';
        if (bridge) btn.addEventListener('click', () => bridge.sendMessage(`Tell me more about ${item.name}`));
      }
      info.appendChild(btn);

      card.appendChild(info);
      track.appendChild(card);
    });

    updateArrows();
  }

  function scrollByCard(dir) {
    const card = track.querySelector('.search-content-card');
    const amount = card ? card.offsetWidth + 16 : 236;
    track.scrollBy({ left: dir * amount, behavior: 'smooth' });
  }

  leftBtn.addEventListener('click', () => scrollByCard(-1));
  rightBtn.addEventListener('click', () => scrollByCard(1));
  [leftBtn, rightBtn].forEach((b) => b.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); b.click(); }
  }));
  track.addEventListener('scroll', updateArrows);

  function runSearch() {
    const q = input.value.trim().toLowerCase();
    if (!q) { renderCards(allItems); return; }
    const filtered = allItems.filter((it) => (
      (it.name || '').toLowerCase().includes(q)
      || (it.description || '').toLowerCase().includes(q)
    ));
    renderCards(filtered);
  }

  searchBar.addEventListener('submit', (e) => { e.preventDefault(); runSearch(); });
  input.addEventListener('input', runSearch);

  renderCards(allItems);
}

export default async function decorate(block, bridge) {
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA;
    } else {
      const result = await bridge.toolResult;
      const structuredContent = result?.structuredContent || result;
      // structuredContent.results — bare array; key derived from actionName "search_content"
      items = structuredContent?.results || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  render(block, items, bridge);

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
