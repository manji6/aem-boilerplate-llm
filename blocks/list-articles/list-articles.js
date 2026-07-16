// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    path: '/article/20260701-new-solution',
    title: '20260701 新ソリューションの発表 | AEM Boilerplate',
    description: '新しい技術を利用した新ソリューションの発表を行いました。',
    image: 'https://main--aem-boilerplate-llm--manji6.aem.live/article/media_1b3acb65f3be4f690f9a14f3d48ae90480019bd6b.jpg?width=1200&format=pjpg&optimize=medium',
  },
  {
    path: '/article/20260702-new-business',
    title: '20260702 新ビジネスの発表 | AEM Boilerplate',
    description: '新しい技術を利用した新ビジネスの発表を行いました。',
    image: 'https://main--aem-boilerplate-llm--manji6.aem.live/article/media_1a4a5aa3c86d90cbc417507bc774de7007703665e.png?width=1200&format=pjpg&optimize=medium',
  },
];

// EDS単体（bridgeなし）表示時のフォールバック。LLM Apps側 actions/latest-article/index.js
// と同じフィルタ・ソート・件数制限ロジックをクライアント側で再現している。
async function fetchArticles(limit = 10) {
  try {
    const resp = await fetch('/article/query-index.json');
    if (!resp.ok) {
      console.warn(`list-articles: query-index.json returned ${resp.status}`);
      return [];
    }
    const json = await resp.json();
    const rows = Array.isArray(json.data) ? json.data : [];
    return rows
      .filter((item) => item.title || item.description || item.image || item.date)
      .map((item) => ({
        path: item.path || '',
        title: item.title || '',
        description: item.description || '',
        image: item.image || '',
        date: item.date || '',
      }))
      .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
      .slice(0, limit);
  } catch (e) {
    console.warn('list-articles: failed to fetch query-index.json', e);
    return [];
  }
}

function renderItems(block, items, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-articles-wrapper';

  const track = document.createElement('div');
  track.className = 'list-articles-track';

  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'list-articles-card';

    const header = document.createElement('div');
    header.className = 'list-articles-header';
    if (item.image) {
      header.style.backgroundImage = `url("${item.image}")`;
    }
    card.appendChild(header);

    const info = document.createElement('div');
    info.className = 'list-articles-info';

    const title = document.createElement('h3');
    title.className = 'list-articles-title';
    title.textContent = item.title || '';
    info.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'list-articles-desc';
    desc.textContent = item.description || '';
    info.appendChild(desc);

    if (bridge) {
      const btn = document.createElement('button');
      btn.className = 'list-articles-cta';
      btn.type = 'button';
      btn.textContent = 'Tell me more';
      btn.addEventListener('click', () => {
        const url = item.path ? `${window.location.origin}${item.path}` : '';
        const prompt = url
          ? `Tell me more about the article "${item.title}" (${url})`
          : `Tell me more about the article "${item.title}"`;
        bridge.sendMessage(prompt);
      });
      info.appendChild(btn);
    } else {
      const link = document.createElement('a');
      link.className = 'list-articles-cta';
      link.href = item.path || '#';
      link.textContent = '詳しく見る';
      info.appendChild(link);
    }

    card.appendChild(info);
    track.appendChild(card);
  });

  wrapper.appendChild(track);

  const fade = document.createElement('div');
  fade.className = 'list-articles-fade';
  wrapper.appendChild(fade);

  const leftBtn = document.createElement('button');
  leftBtn.className = 'list-articles-nav list-articles-nav-left';
  leftBtn.type = 'button';
  leftBtn.setAttribute('aria-label', 'Scroll left');
  leftBtn.textContent = '◀';

  const rightBtn = document.createElement('button');
  rightBtn.className = 'list-articles-nav list-articles-nav-right';
  rightBtn.type = 'button';
  rightBtn.setAttribute('aria-label', 'Scroll right');
  rightBtn.textContent = '▶';

  const scrollByCard = (dir) => {
    const card = track.querySelector('.list-articles-card');
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
      // structuredContent.articles — bare array outputSchema; key derived
      // from actionName "list_articles"
      items = structuredContent?.articles || [];
    }
  } else {
    items = await fetchArticles();
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
