(() => {
  const search = document.querySelector('#article-search');
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const results = document.querySelector('[data-results]');
  const cards = results ? [...results.querySelectorAll('[data-card]')] : [];
  let filter = 'all';
  const update = () => {
    const q = (search?.value || '').trim().toLocaleLowerCase();
    let count = 0;
    for (const card of cards) {
      card.hidden = !(filter === 'all' || card.dataset.topic === filter) || !card.textContent.toLocaleLowerCase().includes(q);
      if (!card.hidden) count++;
    }
    const status = document.querySelector('#result-count');
    if (status) status.textContent = `${count} ${results.dataset.countLabel}`;
    const empty = document.querySelector('#empty-results');
    if (empty) empty.hidden = count !== 0;
  };
  search?.addEventListener('input', update);
  buttons.forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    update();
  }));
  document.querySelector('#text-size')?.addEventListener('click', e => {
    const large = document.querySelector('#article-body').classList.toggle('large-text');
    e.currentTarget.setAttribute('aria-pressed', String(large));
  });
  document.querySelector('#copy-link')?.addEventListener('click', async e => {
    const button = e.currentTarget;
    try { await navigator.clipboard.writeText(location.origin + location.pathname); document.querySelector('#copy-status').textContent = button.dataset.success; }
    catch { document.querySelector('#copy-status').textContent = button.dataset.failure; }
  });
  const progress = document.querySelector('#reading-progress');
  if (progress) {
    let pending = false;
    const paint = () => { const max = document.documentElement.scrollHeight - innerHeight; progress.style.width = `${max > 0 ? Math.min(100, scrollY/max*100) : 100}%`; pending = false; };
    addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(paint); } }, {passive:true});
    addEventListener('resize', paint); paint();
  }
  const modal = document.querySelector('#gallery-modal');
  let opener;
  document.querySelectorAll('[data-gallery-open]').forEach(button => button.addEventListener('click', () => {
    opener = button;
    modal.querySelector('img').src = button.dataset.src;
    modal.querySelector('img').alt = button.dataset.title;
    modal.querySelector('h2').textContent = button.dataset.title;
    modal.querySelector('a').href = button.dataset.story;
    modal.showModal();
  }));
  modal?.querySelector('[data-close]').addEventListener('click', () => modal.close());
  modal?.addEventListener('close', () => opener?.focus());
})();
