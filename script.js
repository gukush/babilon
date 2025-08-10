// ---------------- helpers ----------------
async function loadJSON(path){
  const r = await fetch(path);
  if(!r.ok) throw new Error(`HTTP ${r.status} for ${path}`);
  return r.json();
}
async function loadText(path){
  const r = await fetch(path);
  if(!r.ok) throw new Error(`HTTP ${r.status} for ${path}`);
  return r.text();
}
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>{
    const active = p.id === id;
    p.classList.toggle('active', active);
    p.toggleAttribute('aria-hidden', !active);
  });
  if(id !== 'page-article') lastNonArticlePage = id;
}
function label(c){ return {fikcja:'Fikcja',realia:'Realia',poezja:'Poezja'}[c]||c; }


// ---------------- authors & support pages ----------------
function renderAuthorsPage() {
  const grid = document.getElementById('authors-grid');
  if (!grid || !siteIndex || !siteIndex.authors) return;
  grid.innerHTML = '';

  siteIndex.authors.forEach(a => {
    const card = document.createElement('div');
    card.className = 'author-card';
    card.innerHTML = `
      <div class="author-circle" style="background-image: url('${a.photo}'); background-size: cover; background-position: center;">
        ${a.name}
      </div>
      <div class="author-name">${a.fullName}</div>
      <div style="font-size:.8rem;color:#666;">Inicjaty</div>
    `;
    grid.appendChild(card);
  });
}

function renderSupportPage() {
  const s = (siteIndex && siteIndex.support) || {};
  const copy = document.getElementById('support-copy');
  const btn = document.getElementById('support-button');
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
    btn.textContent = s.buttonText || 'WESPRZYJ NAS';
    btn.href = s.paypalLink || '#';
  }
}

// ---------------- state ----------------
let siteIndex = null;          // content/index.json
let latestIssueSlug = null;    // slug of current (latest or chosen from archive)
let latestIssueMeta = null;    // meta.json for current
let lastNonArticlePage = 'page-main';

let slides=[], dots=[], currentSlideIndex=0; // archive slideshow

// ---------------- init ----------------
document.addEventListener('DOMContentLoaded', init);
async function init(){
  try{
    siteIndex = await loadJSON('content/index.json');

    // pre-render creators/support
    renderAuthorsPage();
    renderSupportPage();

    // Choose latest = last item in index.json (keep JSON ordered oldest -> newest)
    const issues = siteIndex.issues || [];
    if(!issues.length){
      document.getElementById('main-issue-title').textContent = 'Brak numerów';
      return;
    }
    const latest = issues[issues.length - 1];
    latestIssueSlug = latest.slug;
    await loadCurrentIssueMeta();

    // Build archive page slideshow (you see it only when you go to Archiwum)
    buildSlideshow(issues);
  }catch(e){
    console.error(e);
    document.getElementById('main-issue-title').textContent = 'Nie mogę wczytać content/index.json';
  }
}

// ---------------- current issue (main) ----------------
async function loadCurrentIssueMeta(){
  try{
    latestIssueMeta = await loadJSON(`content/issues/${latestIssueSlug}/meta.json`);
    document.getElementById('main-issue-title').textContent = latestIssueMeta.title || '';
    document.getElementById('main-issue-subtitle').textContent = latestIssueMeta.subtitle || '';
    document.getElementById('main-issue-date').textContent = latestIssueMeta.date || '';
  }catch(e){
    console.error(e);
    alert(`Nie mogę wczytać meta.json dla numeru: ${latestIssueSlug}\n${e.message}`);
  }
}

// Vertical buttons on main page
function showMainCategory(category){
  if(!latestIssueMeta) return;
  renderCategoryPage(latestIssueMeta, category);
  showPage('page-category');
}

function renderCategoryPage(issueMeta, category){
  const items = (issueMeta.articles && issueMeta.articles[category]) || [];
  document.getElementById('category-header').textContent =
    items.length ? `${label(category)} – ${issueMeta.title}` : `Brak tekstów: ${label(category)}`;

  const list = document.getElementById('category-list');
  list.innerHTML = '';
  items.forEach(a=>{
    const row = document.createElement('div');
    row.className = 'teaser-container';
    row.onclick = () => openArticle(latestIssueSlug, category, a.file, a.title, a.author, a.teaserImage, true);
    row.innerHTML = `
      <div class="teaser-label" ${a.teaserImage ? `data-image="${a.teaserImage}"` : ''}>GRAFIKA (DO TEKSTU)</div>
      <div class="teaser-text">${a.title || a.file}</div>`;
    list.appendChild(row);
  });

  // lazy-apply teaser backgrounds
  setTimeout(()=>{
    document.querySelectorAll('.teaser-label[data-image]').forEach(div=>{
      const u = div.getAttribute('data-image');
      const img = new Image();
      img.onload = ()=>{ div.style.backgroundImage = `url(${u})`; div.style.color='#fff'; div.style.textShadow='2px 2px 4px rgba(0,0,0,.8)'; };
      img.onerror = ()=>{ div.style.backgroundColor='#daa520'; };
      img.src = u;
    });
  }, 0);
}

// ---------------- archive page ----------------
function buildSlideshow(issues){
  const wrap=document.getElementById('slideshow');
  const dotWrap=document.getElementById('slide-dots');
  if(!wrap || !dotWrap) return;

  wrap.innerHTML=''; dotWrap.innerHTML=''; slides=[]; dots=[];
  issues.forEach((iss,i)=>{
    const slide=document.createElement('div');
    slide.className='slide'+(i===0?' active':'');
    slide.innerHTML=`
      <div class="slide-image" data-image="images/archive/${iss.slug}-cover.jpg" onclick="openArchiveIssue('${iss.slug}')">OKŁADKA</div>
      <div class="slide-title">${iss.title||''}</div>
      <div class="slide-description">${iss.subtitle||''}</div>
      <div class="slide-date">${iss.date||''}</div>`;
    wrap.appendChild(slide);

    const dot=document.createElement('span');
    dot.className='indicator'+(i===0?' active':'');
    dot.onclick=()=>currentSlide(i+1);
    dotWrap.appendChild(dot);
  });

  slides=[...wrap.querySelectorAll('.slide')];
  dots=[...dotWrap.querySelectorAll('.indicator')];
  currentSlideIndex=0;
  showSlide(0);
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
function showSlide(i){
  slides.forEach(s=>s.classList.remove('active'));
  dots.forEach(d=>d.classList.remove('active'));
  if(slides[i]) slides[i].classList.add('active');
  if(dots[i]) dots[i].classList.add('active');
}
function changeSlide(dir){
  if(!slides.length) return;
  currentSlideIndex += dir;
  if(currentSlideIndex >= slides.length) currentSlideIndex = 0;
  if(currentSlideIndex < 0) currentSlideIndex = slides.length - 1;
  showSlide(currentSlideIndex);
}
function currentSlide(i){ currentSlideIndex = i-1; showSlide(currentSlideIndex); }

async function openArchiveIssue(slug){
  try{
    latestIssueSlug = slug;
    await loadCurrentIssueMeta();  // updates title/subtitle/date
    // Go to main page (where vertical categories live)
    showPage('page-main');
  }catch(e){
    console.error(e);
    alert(`Nie udało się wczytać numeru archiwalnego (${slug}).\nSzukany plik: content/issues/${slug}/meta.json\n${e.message}`);
  }
}

// ---------------- article page ----------------
async function openArticle(issueSlug, category, file, title, author, teaserImage) {
  try {
    const path = `content/issues/${issueSlug}/${category}/${file}`;
    let txt = await loadText(path);

    // Split content into paragraphs
    const lines = txt.split(/\r?\n/);
    let t = title || '', a = author || '';
    if (lines[0] && !t && lines[0].length < 160) t = lines.shift();
    if (lines[0] && !a && /^Autor\s*:\s*/i.test(lines[0])) a = lines.shift().replace(/^Autor\s*:\s*/i, '');
    const body = lines.join('\n').trim();

    // Display article details
    document.getElementById('article-title').textContent = t || 'Tekst';
    document.getElementById('article-body').innerHTML =
      body.split(/\n\n+/).map(p => `<p style="margin:1em 0; font-size:1.1em; line-height:1.6">${p.replace(/\n/g, '<br>')}</p>`).join('');

    // Display teaser image
    const articleHeader = document.querySelector('.article-header');
    if (teaserImage) {
      articleHeader.innerHTML = `
        <div class="article-image" style="background-image: url(${teaserImage}); background-size: cover; background-position: center;">
          GRAFIKA (DO TEKSTU)
        </div>
      `;
    }

    showPage('page-article');
  } catch (e) {
    console.error(e);
    alert(`Nie udało się wczytać tekstu.\nSzukany plik: content/issues/${issueSlug}/${category}/${file}\n${e.message}`);
  }
}
function backToPrevious(){ showPage(lastNonArticlePage || 'page-main'); }

// Expose for inline handlers
window.showPage = showPage;
window.changeSlide = changeSlide;
window.currentSlide = currentSlide;
window.openArchiveIssue = openArchiveIssue;
window.openArticle = (category,file,title,author)=>openArticle(latestIssueSlug, category, file, title, author, true);
window.showMainCategory = showMainCategory;
