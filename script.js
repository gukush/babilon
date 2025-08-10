/* script.js — Babilon (archive + authors images + per-issue categories)
   This file assumes:
   - /content/index.json lists issues (with slug: "issue-1", etc.) and (optionally) authors.
   - /content/issues/<slug>/meta.json exists for each issue (see resolveCategoryArticles()).
   - Article texts live at /content/issues/<slug>/<file>.txt
   - Cover images live at /images/archive/<slug>-cover.jpg  (e.g. issue-1-cover.jpg)
   - Author photos are under /images/authors/...
*/

(() => {
  'use strict';

  // ---------- CONFIG ----------
  const INDEX_JSON = 'content/index.json';
  const CONTENT_JSON_CANDIDATES = ['content/content.json', 'content.json']; // support both locations
  const ISSUE_META_URL = slug => `content/issues/${slug}/meta.json`;
  const ARTICLE_URL    = (slug, filename) => `content/issues/${slug}/${filename}`;
  const COVER_PATH     = slug => `images/archive/${slug}-cover.jpg`; // e.g., images/archive/issue-1-cover.jpg

  // ---------- STATE ----------
  let SITE = { issues: [], authors: [], support: {} };
  let AUTHORS = [];
  let latestIssueSlug = null;   // last issue in index.json
  let activeIssueSlug = null;   // current browsing issue (changed by clicking a cover)
  const ISSUE_META_CACHE = new Map();
  const pageHistory = [];

  // ---------- UTIL ----------
  async function fetchJSON(url){ const r = await fetch(url); if(!r.ok) throw new Error(`Fetch failed: ${url}`); return r.json(); }
  async function fetchText(url){ const r = await fetch(url); if(!r.ok) throw new Error(`Fetch failed: ${url}`); return r.text(); }

  const norm = s => (s || '').toLowerCase().normalize('NFKD');
  const normalizeCategory = c =>
    norm(c).replace(/\s+/g,'').replace(/[ó]/g,'o').replace(/[ł]/g,'l');
  const labelForCategory = c => ({ fikcja:'Fikcja', realia:'Realia', poezja:'Poezja' }[normalizeCategory(c)] || c);

  // Polish diacritics → ASCII, then slug
  function slugifyTitle(t){
    const map = { 'ą':'a','ć':'c','ę':'e','ł':'l','ń':'n','ó':'o','ś':'s','ż':'z','ź':'z',
                  'Ą':'A','Ć':'C','Ę':'E','Ł':'L','Ń':'N','Ó':'O','Ś':'S','Ż':'Z','Ź':'Z' };
    const ascii = (t || '').replace(/[ąćęłńóśżźĄĆĘŁŃÓŚŻŹ]/g, ch => map[ch] || ch);
    return ascii.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g,'').trim().replace(/\s+/g,'-') + '.txt';
  }

  function normalizeAuthor(a){
    // Accept both index.json and content.json shapes
    return {
      id: a.id,
      initials: a.initials || a.name || '',
      fullName: a.fullName || a.name || '',
      photo: a.photo ? a.photo.replace(/^\.?\//,'') : ''
    };
  }
  function resolveAuthorName(authorIdOrName){
    if (!authorIdOrName) return '';
    if (typeof authorIdOrName === 'number') {
      const found = AUTHORS.find(a => a.id === authorIdOrName);
      return found?.fullName || '';
    }
    return authorIdOrName; // already a string
  }

  // ---------- PAGE NAV ----------
  function showPage(id){
    const pages = document.querySelectorAll('.page');
    const current = document.querySelector('.page.active');
    if (current && current.id !== id) pageHistory.push(current.id);

    pages.forEach(p => p.classList.remove('active'));
    const t = document.getElementById(id);
    if (t) {
      t.classList.add('active');
      t.setAttribute('aria-hidden','false');
    }
    pages.forEach(p => { if (p.id !== id) p.setAttribute('aria-hidden','true'); });
  }
  function backToPrevious(){
    const prev = pageHistory.pop();
    if (prev) showPage(prev);
    else showPage('page-main');
  }
  window.showPage = showPage;
  window.backToPrevious = backToPrevious;

  // ---------- ARCHIVE (SLIDESHOW) ----------
  function updateMainIssueHeader(slug){
    const info = SITE.issues.find(i => i.slug === slug);
    if (!info) return;
    const titleEl = document.getElementById('main-issue-title');
    const subEl   = document.getElementById('main-issue-subtitle');
    const dateEl  = document.getElementById('main-issue-date');
    if (titleEl) titleEl.textContent = info.title || 'Numer';
    if (subEl)   subEl.textContent   = info.subtitle || '';
    if (dateEl)  dateEl.textContent  = info.date || '';
  }

  function openIssue(slug){
    activeIssueSlug = slug;      // <- bind the UI to that issue
    updateMainIssueHeader(slug); // update header
    showPage('page-main');       // reuse main layout
  }

  function buildArchiveSlideshow(){
    const holder = document.getElementById('slideshow');
    const dots   = document.getElementById('slide-dots');
    if (!holder || !dots || !SITE.issues?.length) return;

    holder.innerHTML = '';
    dots.innerHTML = '';

    SITE.issues.forEach((issue, idx) => {
      const isActive = idx === SITE.issues.length - 1;

      const slide = document.createElement('div');
      slide.className = 'slide' + (isActive ? ' active' : '');

      const cover = document.createElement('div');
      cover.className = 'slide-image';
      cover.style.backgroundImage = `url(${COVER_PATH(issue.slug)})`;
      cover.title = 'OKŁADKA — ' + (issue.title || issue.slug);
      cover.addEventListener('click', () => openIssue(issue.slug));

      // simple text bits (keeps existing styling)
      const t = document.createElement('div'); t.textContent = issue.title || '';
      const s = document.createElement('div'); s.textContent = issue.subtitle || '';
      const d = document.createElement('div'); d.textContent = issue.date || '';

      slide.append(cover, t, s, d);
      holder.appendChild(slide);

      const dot = document.createElement('span');
      dot.className = 'indicator' + (isActive ? ' active' : '');
      dot.addEventListener('click', () => showSlide(idx));
      dots.appendChild(dot);
    });
  }

  function showSlide(n){
    const slides = [...document.querySelectorAll('#slideshow .slide')];
    const dots   = [...document.querySelectorAll('#slide-dots .indicator')];
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    if (!slides[n]) return;
    slides[n].classList.add('active');
    dots[n]?.classList.add('active');
  }
  function changeSlide(step){
    const slides = [...document.querySelectorAll('#slideshow .slide')];
    const cur = slides.findIndex(s => s.classList.contains('active'));
    const next = (cur + step + slides.length) % slides.length;
    showSlide(next);
  }
  window.changeSlide = changeSlide;

  // ---------- AUTHORS ----------
  function initialsCircle(text){
    const div = document.createElement('div');
    div.className = 'author-circle';
    div.textContent = text || '??';
    return div;
  }
  function renderAuthorsGrid(list){
    const grid = document.getElementById('authors-grid');
    if (!grid) return;
    grid.innerHTML = '';

    (list || []).forEach(a => {
      const card = document.createElement('div');
      card.className = 'author-card';

      if (a.photo) {
        const img = document.createElement('img');
        img.className = 'author-photo';
        img.alt = a.fullName || a.initials || '';
        img.src = a.photo.replace(/^\.?\//,''); // normalize './' or leading '/'
        img.loading = 'lazy';
        img.onerror = () => { img.remove(); card.prepend(initialsCircle(a.initials)); };
        card.appendChild(img);
      } else {
        card.appendChild(initialsCircle(a.initials));
      }

      const name = document.createElement('div');
      name.className = 'author-name';
      name.textContent = a.fullName || a.initials || '';
      card.appendChild(name);

      grid.appendChild(card);
    });
  }

  // ---------- CATEGORY & ARTICLES (PER-ISSUE) ----------
  async function getIssueMeta(slug){
    if (ISSUE_META_CACHE.has(slug)) return ISSUE_META_CACHE.get(slug);
    try {
      const meta = await fetchJSON(ISSUE_META_URL(slug));
      ISSUE_META_CACHE.set(slug, meta);
      return meta;
    } catch (e) {
      console.warn(`No meta for ${slug}`, e);
      ISSUE_META_CACHE.set(slug, null);
      return null;
    }
  }

  // Supports:
  //  A) meta.articles = [{ title, author|authorId, category, file, teaserImage, mainImage }, ...]
  //  B) meta.fikcja / meta.realia / meta.poezja arrays of items
function resolveCategoryArticles(meta, category){
  const cat = normalizeCategory(category);
  if (!meta) return [];

  // A) Twoja obecna struktura: meta.articles.{cat} = []
  if (meta.articles && Array.isArray(meta.articles[cat])) {
    return meta.articles[cat];
  }

  // B) Płaska lista: meta.articles = [{category: 'fikcja', ...}]
  if (Array.isArray(meta.articles)) {
    return meta.articles.filter(a => normalizeCategory(a.category) === cat);
  }

  // C) Klucze top-level: meta[cat] = []
  if (Array.isArray(meta[cat])) {
    return meta[cat];
  }
  return [];
}
async function openArticle(slug, item) {
  if (!item) return;

  document.getElementById('article-title').textContent = item.title || '';

  // header
  const headerHolder = document.querySelector('#page-article .article-header');
  if (item.headerImage) {
    headerHolder.innerHTML = `
      <figure style="margin:10px auto;max-width:820px;">
        <img src="${item.headerImage}" alt="${item.headerAlt || item.title || ''}"
             style="width:100%;height:auto;display:block;border-radius:8px;">
        ${item.headerAlt ? `<figcaption style="font-size:.85rem;color:#555;margin-top:6px;">${item.headerAlt}</figcaption>` : ''}
      </figure>`;
  } else {
    headerHolder.innerHTML = `<div class="support-hero" style="margin:10px auto;max-width:820px;">GRAFIKA (DO TEKSTU)</div>`;
  }

  // body z .txt w content/issues/<slug>/<file>.txt
  let body = '';
  try {
    body = await fetchText(ARTICLE_URL(slug, item.file));
  } catch {
    // ewentualny fallback
    body = await fetchText(item.file);
  }

  const paras = body
    .split(/\r?\n\r?\n|\r?\n/)
    .filter(Boolean)
    .map(p => `<p>${p}</p>`)
    .join('');

  document.getElementById('article-body').innerHTML =
    `<div style="font-size:2.8rem;text-align:center;margin-bottom:10px;">TEKST</div>` +
    (paras || '<p>(brak treści)</p>');

  showPage('page-article');
}


async function showMainCategory(category, slugOverride) {
  const slug = slugOverride || activeIssueSlug || latestIssueSlug;
  const meta = await getIssueMeta(slug);

  const list = document.getElementById('category-list');
  const header = document.getElementById('category-header');
  if (header) {
    const issueTitle = SITE.issues.find(i => i.slug === slug)?.title || slug;
    header.textContent = `${labelForCategory(category)} — ${issueTitle}`;
  }
  if (list) list.innerHTML = '';

  const items = resolveCategoryArticles(meta, category);

  (items || []).forEach(item => {
    const teaser = document.createElement('div');
    teaser.className = 'teaser-container';
    teaser.addEventListener('click', () => openArticle(slug, item));
    console.debug('[category]', category, 'slug=', slug, 'items=', items);
    const label = document.createElement('div');
    label.className = 'teaser-label';
    if (item.teaserImage) {
      label.style.backgroundImage = `url(${item.teaserImage})`;
    } else {
      label.textContent = 'OKŁADKA';
    }

    const text = document.createElement('div');
    text.className = 'teaser-text';
    const authorName = resolveAuthorName(item.authorId || item.author);
    text.textContent = `${item.title}${authorName ? ' — ' + authorName : ''}`;

    teaser.append(label, text);
    list?.appendChild(teaser);
  });

  showPage('page-category');
}

  window.showMainCategory = showMainCategory;

  // ---------- SUPPORT (optional fill from JSON) ----------
  function fillSupport(){
    const s = SITE.support || {};
    const copy = document.getElementById('support-copy');
    const btn  = document.getElementById('support-button');
    if (copy) {
      const lines = [
        `<strong>${s.title || ''}</strong>`,
        s.description || '',
        s.additionalInfo || '',
        s.goals?.length ? ('<ul>' + s.goals.map(g=>`<li>${g}</li>`).join('') + '</ul>') : ''
      ].filter(Boolean);
      copy.innerHTML = lines.join('<br/>');
    }
    if (btn) {
      btn.textContent = (s.buttonText || 'WSPARCIE').toUpperCase();
      if (s.paypalLink) btn.href = s.paypalLink;
    }
  }

  // ---------- LOADERS ----------
  async function loadSiteIndex(){
    SITE = await fetchJSON(INDEX_JSON);
  }

  async function loadAuthors(){
    // prefer authors from content.json if present
    for (const path of CONTENT_JSON_CANDIDATES) {
      try {
        const c = await fetchJSON(path);
        if (Array.isArray(c.authors) && c.authors.length) {
          AUTHORS = c.authors.map(normalizeAuthor);
          return;
        }
      } catch { /* try next */ }
    }
    // fallback to index.json authors
    if (!AUTHORS.length && Array.isArray(SITE.authors)) {
      AUTHORS = SITE.authors.map(normalizeAuthor);
    }
  }

  // ---------- BOOT ----------
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      await loadSiteIndex(); // /content/index.json
    } catch (e) {
      console.error('Nie mogę wczytać index.json', e);
    }

    try {
      await loadAuthors();   // /content/content.json or /content.json, else fallback
    } catch (e) {
      console.warn('Brak content.json — używam autorów z index.json (o ile są).');
    }

    // choose last issue as "latest"
    latestIssueSlug = SITE.issues?.[SITE.issues.length - 1]?.slug || 'issue-1';
    activeIssueSlug = latestIssueSlug;

    updateMainIssueHeader(activeIssueSlug);  // main header for the active issue
    buildArchiveSlideshow();                 // build ARCHIWUM slideshow
    renderAuthorsGrid(AUTHORS);              // authors page
    fillSupport();                           // optional support info
  });
})();
