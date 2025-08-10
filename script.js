// SPA for magazine using split content files:
// - index.json            -> site meta, authors, support, archive
// - content/issues/<slug>/meta.json -> per-issue articles
// - content/issues/<slug>/<file>.txt -> article bodies
// Works with fallbacks if directories differ.

let siteIndex = null;
let currentIssueSlug = null;
let currentIssueMeta = null;
let lastNonArticlePage = 'page-main';

// ---------- helpers ----------
async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}
async function fetchText(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.text();
}
function $(sel) { return document.querySelector(sel); }
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => {
    const active = p.id === id;
    p.classList.toggle('active', active);
    p.setAttribute('aria-hidden', active ? 'false' : 'true');
  });
  if (id !== 'page-article') lastNonArticlePage = id;

  if (id === 'page-authors') renderAuthorsPage();
  if (id === 'page-support') renderSupportPage();
}
function backToPrevious() { showPage(lastNonArticlePage || 'page-main'); }

// ---------- init ----------
async function init() {
  try {
    siteIndex = await fetchJSON('content/index.json'); // authors, support, archive, issues
    const issues = siteIndex.issues || [];
    if (!issues.length) throw new Error('Brak numerów w content/index.json');

    // pick the latest issue (last in the array)
    const latest = issues[issues.length - 1];
    currentIssueSlug = latest.slug;

    // fill main header from the latest issue
    $('#main-issue-title').textContent = latest.title || '';
    $('#main-issue-subtitle').textContent = latest.subtitle || '';
    $('#main-issue-date').textContent = latest.date || '';

    // load its meta.json (with a fallback)
    await loadIssueMeta(currentIssueSlug);

    // archive slideshow & static pages
    buildSlideshow(issues);
    renderAuthorsPage();
    renderSupportPage();
  } catch (e) {
    console.error(e);
    $('#main-issue-title').textContent = 'Błąd wczytywania danych';
  }
}
document.addEventListener('DOMContentLoaded', init);

// ---------- issue meta / categories ----------
async function loadIssueMeta(slug) {
  currentIssueSlug = slug;
  const primary = `content/issues/${slug}/meta.json`;
  try {
    currentIssueMeta = await fetchJSON(primary);
  } catch {
    // fallback (in case files are kept flat for demo)
    currentIssueMeta = await fetchJSON('meta.json');
  }
}

function showMainCategory(category) {
  if (!currentIssueMeta) return;

  const items = (currentIssueMeta.articles && currentIssueMeta.articles[category]) || [];
  $('#category-header').textContent =
    category === 'fikcja' ? 'Fikcja' :
    category === 'realia' ? 'Realia' :
    category === 'poezja' ? 'Poezja' : category;

  const list = $('#category-list');
  list.innerHTML = '';

  if (!items.length) {
    list.innerHTML = '<p>Brak tekstów w tej kategorii.</p>';
  } else {
    items.forEach((a, i) => {
      const row = document.createElement('div');
      row.className = 'teaser-container';
      row.onclick = () => openArticle(category, i);
      const teaserBg = a.teaserImage ? `style="background-image:url('${a.teaserImage}')" ` : '';
      row.innerHTML = `
        <div class="teaser-label" ${teaserBg}>GRAFIKA (DO TEKSTU)</div>
        <div class="teaser-text">${a.title}</div>
      `;
      list.appendChild(row);
    });
  }
  showPage('page-category');
}

// ---------- article ----------
async function openArticle(category, idx) {
  const item = currentIssueMeta?.articles?.[category]?.[idx];
  if (!item) return;

  $('#article-title').textContent = item.title || '';

  // yellow header matching your mock
  const headerHolder = document.querySelector('#page-article .article-header');
  headerHolder.innerHTML = `<div class="support-hero" style="margin:10px auto;max-width:820px;">GRAFIKA (DO TEKSTU)</div>`;

  // read body from TXT beside meta.json
  let body = '';
  const primary = `content/issues/${currentIssueSlug}/${item.file}`;
  try {
    body = await fetchText(primary);
  } catch {
    body = await fetchText(item.file); // fallback if files are flat
  }

  // render body (keep big "TEKST" headline like on your screenshot)
  const paras = body
    .split(/\r?\n\r?\n|\r?\n/)
    .filter(Boolean)
    .map(p => `<p>${p}</p>`)
    .join('');
  $('#article-body').innerHTML =
    `<div style="font-size:2.8rem;text-align:center;margin-bottom:10px;">TEKST</div>` +
    (paras || '<p>(brak treści)</p>');

  showPage('page-article');
}

// ---------- authors ----------
function renderAuthorsPage() {
  const grid = $('#authors-grid');
  if (!grid || !siteIndex) return;
  grid.innerHTML = '';
  (siteIndex.authors || []).forEach(a => {
    const card = document.createElement('div');
    card.className = 'author-card';
    card.innerHTML = `
      <div class="author-circle">${a.initials || ''}</div>
      <div class="author-name">${a.fullName || ''}</div>
      <div style="font-size:.8rem;color:#666;">Inicjały</div>
    `;
    grid.appendChild(card);
  });
}

// ---------- support ----------
function renderSupportPage() {
  if (!siteIndex) return;
  const s = siteIndex.support || {};
  const copy = $('#support-copy');
  const btn = $('#support-button');
  if (copy) {
    const goals = (s.goals || []).map(g => `<li>${g}</li>`).join('');
    copy.innerHTML = `
      <p>${s.description || ''}</p>
      ${goals ? `<ul style="margin-left:1em">${goals}</ul>` : ''}
      ${s.bankAccount ? `<p><strong>Konto bankowe:</strong> ${s.bankAccount}</p>` : ''}
      ${s.additionalInfo ? `<p>${s.additionalInfo}</p>` : ''}
    `;
  }
  if (btn) {
    btn.textContent = s.buttonText || 'WSPIERAJ NAS';
    btn.href = s.paypalLink || '#';
  }
}

// ---------- archive slideshow ----------
let slides = [], dots = [], currentSlideIndex = 0;

function buildSlideshow(issues) {
  const wrap = $('#slideshow');
  const dotWrap = $('#slide-dots');
  if (!wrap || !dotWrap) return;

  wrap.innerHTML = '';
  dotWrap.innerHTML = '';

  issues.forEach((iss, i) => {
    const slide = document.createElement('div');
    slide.className = 'slide' + (i === 0 ? ' active' : '');
    slide.innerHTML = `
      <div class="slide-image" data-image="images/archive/${iss.slug}-cover.jpg" onclick="openArchiveIssue('${iss.slug}')">OKŁADKA</div>
      <div class="slide-title">${iss.title || ''}</div>
      <div class="slide-description">${iss.subtitle || ''}</div>
      <div class="slide-date">${iss.date || ''}</div>`;
    wrap.appendChild(slide);

    const dot = document.createElement('span');
    dot.className = 'indicator' + (i === 0 ? ' active' : '');
    dot.onclick = () => currentSlide(i + 1);
    dotWrap.appendChild(dot);
  });

  slides = Array.from(wrap.querySelectorAll('.slide'));
  dots = Array.from(dotWrap.querySelectorAll('.indicator'));
  currentSlideIndex = 0;
  loadArchiveImages();
}

function loadArchiveImages(){
  document.querySelectorAll('.slide-image[data-image]').forEach(div=>{
    const url=div.getAttribute('data-image'); if(!url) return;
    const img=new Image();
    img.onload=()=>{ div.style.backgroundImage=`url(${url})`; div.style.color='#fff'; div.style.textShadow='2px 2px 4px rgba(0,0,0,.8)'; };
    img.onerror=()=>{ div.style.backgroundColor='#daa520'; };
    img.src=url;
  });
}

async function switchIssue(slug) {
  try {
    await loadIssueMeta(slug);
    // Update header as visual confirmation
    const iss = (siteIndex.issues || []).find(i => i.slug === slug) || {};
    $('#main-issue-title').textContent = iss.title || '';
    $('#main-issue-subtitle').textContent = iss.subtitle || '';
    $('#main-issue-date').textContent = iss.date || '';
    showPage('page-main');
  } catch (e) {
    console.error(e);
  }
}

function currentSlide(n) {
  if (!slides.length) return;
  const idx = Math.max(0, Math.min(slides.length - 1, n - 1));
  slides[currentSlideIndex].classList.remove('active');
  dots[currentSlideIndex].classList.remove('active');
  slides[idx].classList.add('active');
  dots[idx].classList.add('active');
  currentSlideIndex = idx;
}
function changeSlide(dir) {
  if (!slides.length) return;
  const n = ((currentSlideIndex + dir) % slides.length + slides.length) % slides.length;
  currentSlide(n + 1);
}

// expose to inline handlers
window.showPage = showPage;
window.backToPrevious = backToPrevious;
window.showMainCategory = showMainCategory;
window.changeSlide = changeSlide;
window.currentSlide = currentSlide;
window.switchIssue = switchIssue;
