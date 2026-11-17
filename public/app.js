'use strict';
const data = JSON.parse(document.getElementById('site-content').textContent);
const page = document.body.dataset.page;
const main = document.getElementById('main');
const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const gameArt = g => `assets/games/${g.id}.webp`;
const image = (src,alt,extra='') => `<img src="${src}" alt="${esc(alt)}" loading="lazy" decoding="async" ${extra}>`;
const icon = (name,cls='') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${({github:'<path d="M9 19c-4 1-4-2-6-2m12 5v-4c0-1 .1-1.5-.5-2 3.5-.4 7-1.7 7-6a4.6 4.6 0 0 0-1.3-3.2A4.3 4.3 0 0 0 20 3s-1.3-.4-4 1.5a13.8 13.8 0 0 0-8 0C5.3 2.6 4 3 4 3a4.3 4.3 0 0 0-.2 3.8A4.6 4.6 0 0 0 2.5 10c0 4.3 3.5 5.6 7 6-.5.5-.5 1.3-.5 2v4"/>',mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',document:'<path d="M6 2h8l4 4v16H6Z"/><path d="M14 2v5h4M9 12h6M9 16h6"/>',app:'<rect x="4" y="2" width="16" height="20" rx="3"/><path d="M9 5h6M10 19h4"/>',rotor:'<circle cx="12" cy="12" r="3"/><path d="M12 9c-8-9 7-10 6-3l-3 5m-1 4c-3 12-12 1-6-2m2-3C-2 7 7-2 10 6"/>',folder:'<path d="M3 6h7l2 3h9v12H3Z"/><path d="M3 9h18"/>',arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',left:'<path d="m14 5-7 7 7 7"/>',right:'<path d="m10 5 7 7-7 7"/>',school:'<path d="m2 9 10-6 10 6-10 6ZM6 12v6c4 3 8 3 12 0v-6M22 9v8"/>',briefcase:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 13h18M10 13v3h4v-3"/>'})[name]||''}</svg>`;
const arrow = '<span class="external" aria-hidden="true">↗</span>';
const statusNames={rotation:'in rotation',favourite:'all-time favourite',liked:'on my shelf',complete:'complete',watching:'watching',pending:'next up','caught-up':'caught up'};
const header=(title,description)=>`<section class="page-intro"><h1>${esc(title)}</h1><p class="page-description">${esc(description)}</p></section>`;
const projectIcons={somodoro:'app',teng:'rotor',sign:'folder'};
const socialLinks=()=>`<div class="social-links"><a href="resume.html">${icon('document')} résumé${arrow}</a><a href="${data.profile.github}" target="_blank" rel="noopener noreferrer">${icon('github')} github${arrow}</a><a href="mailto:${data.profile.email}">${icon('mail')} email</a></div>`;
const gameCard=g=>`<button class="shelf-item" data-game="${g.id}"><span class="shelf-cover">${image(gameArt(g),g.title)}</span><span class="shelf-title">${esc(g.title)}</span><span class="shelf-meta">${statusNames[g.status]}</span></button>`;

function renderWork(){
  main.innerHTML=`<section class="intro" id="me"><div class="name-row"><h1 class="name">${data.profile.name.toLowerCase().split('').map(c=>`<span${c===' '?' class="name-space"':''}>${c===' '?'&nbsp;':esc(c)}</span>`).join('')}</h1>${socialLinks()}</div><ul class="intro-list"><li><span class="program-tag">[nano @ uwaterloo]</span> first year</li><li>looking for <span class="date-tag">[spring 2027]</span> co-op opportunities</li><li>interested in semiconductors, hardware, and the software that makes things work</li><li>i build native apps with Swift, work with Python, and like figuring things out</li></ul></section>
  <section id="projects"><h2>Things I'm working on.</h2><div class="project-list">${data.projects.map(p=>`<article class="project"><h3>${icon(projectIcons[p.id]||'folder')}<button class="inline-link" data-project="${p.id}">${esc(p.name)}${arrow}</button>${p.status==='In progress'?'<span class="project-badge">IN PROGRESS</span>':''}</h3><p>${esc(p.summary)}</p><div class="metadata">${esc(p.status)} · ${p.tags.map(esc).join(' · ')} <button class="inline-link" data-project="${p.id}">notes${arrow}</button></div></article>`).join('')}</div>${renderActivity()}</section>
  <section id="experience"><h2>Where I've been.</h2><div class="timeline"><article class="timeline-row"><span class="timeline-period">first year</span><span class="org-mark university-mark">UW</span><div><h3>Nanotechnology Engineering at <a href="https://uwaterloo.ca/" target="_blank" rel="noopener noreferrer">University of Waterloo${arrow}</a></h3><p>Learning the engineering fundamentals. Interested in semiconductors and chip design.</p></div></article><h3 class="minor-heading">EXPERIENCE & LEADERSHIP</h3>${data.experience.map((e,i)=>`<article class="timeline-row"><span class="timeline-period">${esc(e.period)}</span><span class="org-mark">${icon(i===0?'school':'briefcase')}</span><div><h3>${esc(e.role)} at <span>${esc(e.organization)}</span></h3><p>${esc(e.description)}</p></div></article>`).join('')}</div><div class="tools"><h3 class="minor-heading">TOOLS & SKILLS</h3>${data.skills.map(s=>`<p><strong>${esc(s.name)}</strong> · ${esc(s.detail)}</p>`).join('')}</div></section>
  <section class="contact" id="contact"><h2>Say hi.</h2><p><a class="email-address" href="mailto:${data.profile.email}">${data.profile.email}</a><button class="copy-label copy-email">COPY</button></p><p class="contact-note">Looking for a Spring 2027 co-op. Happy to talk about what I'm building.</p></section>`;
  const name=main.querySelector('.name');
  name.addEventListener('pointermove',e=>{if(!canAnimate())return;const r=name.getBoundingClientRect();const x=e.clientX-r.left;name.querySelectorAll('span').forEach(s=>{const p=s.offsetLeft+s.offsetWidth/2;s.style.transform=`translateY(${-Math.max(0,1-Math.abs(p-x)/65)*3}px)`;});});
  name.addEventListener('pointerleave',()=>name.querySelectorAll('span').forEach(s=>s.style.transform=''));
}

function renderActivity(){
  const activity=data.activity;if(!activity?.days?.length)return `<p class="activity-link metadata"><a href="${data.profile.github}">Public GitHub activity${arrow}</a></p>`;
  return `<div class="activity"><a class="metadata inline-link" href="${data.profile.github}" target="_blank" rel="noopener noreferrer">Public GitHub activity${arrow}</a><div class="activity-months metadata"><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span></div><div class="contribution-grid" role="img" aria-label="${activity.total} public GitHub contributions between May and November 2026">${activity.days.map(d=>`<span class="contribution level-${d.level}" title="${esc(d.date)}: ${d.count} public contribution${d.count===1?'':'s'}"></span>`).join('')}</div><p class="activity-note metadata">public activity · snapshot ${esc(activity.asOf)}</p></div>`;
}

function renderPersonal(){
  main.innerHTML=header('Favourites','my corner of the internet: games, anime, shows, and the stories i keep coming back to.')+`<section class="collection-section"><h2>A few of my worlds.</h2><div class="collection-tabs" role="tablist" aria-label="Favourite collection"><button id="feature-games" role="tab" aria-selected="true" aria-controls="collection-panel" data-feature-tab="games" tabindex="0">games</button><button id="feature-anime" role="tab" aria-selected="false" aria-controls="collection-panel" data-feature-tab="anime" tabindex="-1">anime</button><button id="feature-shows" role="tab" aria-selected="false" aria-controls="collection-panel" data-feature-tab="shows" tabindex="-1">shows</button><span class="flow-counter metadata" id="flow-counter"></span></div><div id="collection-panel" role="tabpanel" aria-labelledby="feature-games"><div class="coverflow" tabindex="0" aria-label="Media covers. Use left and right arrow keys."><div id="flow-covers"></div><button class="flow-arrow flow-arrow-left" aria-label="Previous item">${icon('left')}</button><button class="flow-arrow flow-arrow-right" aria-label="Next item">${icon('right')}</button></div><div class="flow-caption" aria-live="polite"><h3 id="flow-title"></h3><p class="metadata" id="flow-meta"></p></div><div class="flow-indicators" id="flow-indicators" aria-hidden="true"></div></div><p class="collection-links metadata"><a href="games.html">all ${data.games.length} games →</a> · <a href="watchlist.html">the watchlist →</a> · <a href="music.html">my top two artists →</a></p></section>`;
  initCoverflow();
}

function initCoverflow(){
  let category='games',index=0;
  const orderedGames=[...data.games.filter(g=>g.status==='favourite'),...data.games.filter(g=>g.status==='rotation'),...data.games.filter(g=>g.status==='liked')];
  const items=()=>category==='games'?orderedGames:data[category];
  const getItem=(item,i)=>({title:item.title,image:category==='games'?gameArt(item):item.image,meta:category==='games'?statusNames[item.status]:item.progress,key:category==='games'?item.id:i});
  const render=({animate=false,direction=0}={})=>{
    const holder=document.getElementById('flow-covers'),moving=animate&&canAnimate();
    const previous=new Map(moving?[...holder.querySelectorAll('.flow-card')].map(card=>[card.dataset.flowKey,{rect:card.getBoundingClientRect(),opacity:getComputedStyle(card).opacity}]):[]);
    const list=items();index=(index+list.length)%list.length;const current=getItem(list[index],index);
    holder.innerHTML=[-1,0,1].map(offset=>{const i=(index+offset+list.length)%list.length;const item=getItem(list[i],i);return `<button class="flow-card ${offset===0?'flow-current':offset<0?'flow-previous':'flow-next'}" data-flow-key="${category}:${esc(item.key)}" ${offset===0?`data-flow-open="${item.key}"`:`data-flow-step="${offset}"`} aria-label="${offset===0?'Read about':offset<0?'Previous:':'Next:'} ${esc(item.title)}">${image(item.image,item.title)}</button>`;}).join('');
    document.getElementById('flow-title').textContent=current.title;document.getElementById('flow-meta').textContent=current.meta;
    document.getElementById('flow-counter').innerHTML=String(index+1).padStart(2,'0')+'<span>/'+String(list.length).padStart(2,'0')+'</span>';
    document.getElementById('flow-indicators').innerHTML=list.map((_,i)=>`<span class="${i===index?'active':''}"></span>`).join('');
    if(!moving)document.querySelector('.flow-caption').getAnimations().forEach(animation=>animation.cancel());
    if(moving){
      const easing=getComputedStyle(document.documentElement).getPropertyValue('--ease-out').trim()||'cubic-bezier(.23,1,.32,1)';
      for(const card of holder.querySelectorAll('.flow-card')){
        const old=previous.get(card.dataset.flowKey),rect=card.getBoundingClientRect(),style=getComputedStyle(card),base=style.transform==='none'?'':style.transform;
        const dx=old?(old.rect.left+old.rect.width/2)-(rect.left+rect.width/2):direction*holder.clientWidth*.22;
        const dy=old?(old.rect.top+old.rect.height/2)-(rect.top+rect.height/2):6;
        const sx=old?old.rect.width/rect.width:.97,sy=old?old.rect.height/rect.height:.97;
        card.animate([{transform:`translate(${dx}px,${dy}px) ${base} scale(${sx},${sy})`,opacity:old?old.opacity:0},{transform:base,opacity:style.opacity}],{duration:280,easing});
      }
      document.querySelector('.flow-caption').animate([{opacity:.5,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:180,easing});
    }
  };
  const step=(direction,keyboard=false)=>{index+=direction;render({animate:!keyboard,direction});};
  document.querySelector('.flow-arrow-left').addEventListener('click',e=>step(-1,e.detail===0));
  document.querySelector('.flow-arrow-right').addEventListener('click',e=>step(1,e.detail===0));
  const flow=document.querySelector('.coverflow');let pointerStart=0,moved=false;
  flow.addEventListener('pointerdown',e=>{pointerStart=e.clientX;moved=false;});flow.addEventListener('pointerup',e=>{if(Math.abs(e.clientX-pointerStart)>45){moved=true;step(e.clientX<pointerStart?1:-1);}});
  flow.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();step(e.key==='ArrowLeft'?-1:1,true);}});
  flow.addEventListener('click',e=>{if(moved){moved=false;return;}const side=e.target.closest('[data-flow-step]');if(side)step(Number(side.dataset.flowStep),e.detail===0);const open=e.target.closest('[data-flow-open]');if(open){if(category==='games')openGame(open.dataset.flowOpen);else openSeries(data[category][Number(open.dataset.flowOpen)]);}});
  const tabs=[...document.querySelectorAll('[data-feature-tab]')];
  const activate=(button,keyboard=false)=>{category=button.dataset.featureTab;index=0;tabs.forEach(b=>{b.setAttribute('aria-selected',b===button);b.tabIndex=b===button?0:-1;});document.getElementById('collection-panel').setAttribute('aria-labelledby',button.id);render({animate:!keyboard});};
  tabs.forEach((b,i)=>{b.addEventListener('click',e=>activate(b,e.detail===0));b.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;activate(tabs[n],true);tabs[n].focus();}});});render();
}

function renderGames(){
  const featured=[data.games.find(g=>g.status==='favourite'),...data.games.filter(g=>g.status==='rotation')];
  main.innerHTML=header('Games','what i’m playing, what i like, and the one game that stays at the top.')+`<section><h2>Favourite & in rotation.</h2><div class="media-shelf featured-shelf">${featured.map(gameCard).join('')}</div></section><section id="games"><div class="heading-row"><h2>The shelf.</h2><button id="pick-game" class="inline-link metadata">pick a game for me ↗</button></div><div class="library-toolbar"><div class="filter-group" role="group" aria-label="Filter games"><button class="filter active" data-game-filter="all" aria-pressed="true">all <span>${data.games.length}</span></button><button class="filter" data-game-filter="rotation" aria-pressed="false">in rotation</button><button class="filter" data-game-filter="favourite" aria-pressed="false">favourite</button><button class="filter" data-game-filter="liked" aria-pressed="false">liked</button></div><label class="search-label"><span class="sr-only">Search games</span><input id="game-search" type="search" placeholder="find a game…" autocomplete="off"></label></div><p id="game-count" class="sr-only" role="status" aria-live="polite"></p><div class="media-shelf game-grid" id="game-grid"></div></section>`;
  let filter='all';const render=()=>{const q=document.getElementById('game-search').value.trim().toLowerCase();const results=data.games.filter(g=>(filter==='all'||g.status===filter)&&g.title.toLowerCase().includes(q));document.getElementById('game-grid').innerHTML=results.length?results.map(gameCard).join(''):'<p class="empty-state">Nothing on this shelf by that name. Try another search.</p>';document.getElementById('game-count').textContent=results.length+' games shown';};document.querySelectorAll('[data-game-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.gameFilter;document.querySelectorAll('[data-game-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b);});render();}));document.getElementById('game-search').addEventListener('input',render);document.getElementById('pick-game').addEventListener('click',()=>openGame(data.games[Math.floor(Math.random()*data.games.length)].id,true));render();
}

function renderWatchlist(){
  main.innerHTML=header('Watchlist','what i’ve been watching, and where i am in the story. no spoilers.')+`<section><div class="watch-tabs" role="tablist" aria-label="Watchlist category"><button id="anime-tab" role="tab" aria-selected="true" aria-controls="watch-panel" tabindex="0" data-watch-tab="anime">anime <span>${data.anime.length}</span></button><button id="shows-tab" role="tab" aria-selected="false" aria-controls="watch-panel" tabindex="-1" data-watch-tab="shows">tv shows <span>${data.shows.length}</span></button></div><div id="watch-panel" role="tabpanel" aria-labelledby="anime-tab"><h2>From the watchlist.</h2><div class="media-shelf" id="watch-featured"></div><div class="heading-row progress-heading"><h2>Progress.</h2><span class="metadata">my watchlist · november 2026</span></div><div class="watch-tools"><label class="search-label"><span class="sr-only">Search watchlist</span><input id="watch-search" type="search" placeholder="find a series…" autocomplete="off"></label><label class="status-select"><span class="sr-only">Filter watch status</span><select id="watch-filter"><option value="all">everything</option><option value="watching">watching</option><option value="complete">complete</option><option value="caught-up">caught up</option><option value="pending">next up</option></select></label></div><p id="watch-count" class="sr-only" role="status" aria-live="polite"></p><div id="watch-grid" class="watch-list"></div></div></section>`;
  let category='anime';const render=()=>{const list=data[category];document.getElementById('watch-featured').innerHTML=list.slice(0,4).map((s,i)=>`<button class="shelf-item" data-series="${i}" data-category="${category}"><span class="shelf-cover">${image(s.image,s.title)}</span><span class="shelf-title">${esc(s.title)}</span></button>`).join('');const q=document.getElementById('watch-search').value.trim().toLowerCase(),status=document.getElementById('watch-filter').value;const results=list.filter(s=>s.title.toLowerCase().includes(q)&&(status==='all'||s.status===status));document.getElementById('watch-grid').innerHTML=results.length?results.map(s=>`<article class="watch-row"><span class="watch-status metadata">${statusNames[s.status]}</span><button class="watch-thumb" data-series="${list.indexOf(s)}" data-category="${category}" aria-label="Read about ${esc(s.title)}">${image(s.image,s.title)}</button><div><h3><button class="inline-link" data-series="${list.indexOf(s)}" data-category="${category}">${esc(s.title)}</button></h3><p>${esc(s.progress)}</p></div></article>`).join(''):'<p class="empty-state">No series match that search and status. Try “everything” or another title.</p>';document.getElementById('watch-count').textContent=results.length+' series shown';};const tabs=[...document.querySelectorAll('[data-watch-tab]')];const activate=b=>{category=b.dataset.watchTab;tabs.forEach(x=>{x.setAttribute('aria-selected',x===b);x.tabIndex=x===b?0:-1;});document.getElementById('watch-panel').setAttribute('aria-labelledby',b.id);render();};tabs.forEach((b,i)=>{b.addEventListener('click',()=>activate(b));b.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const next=tabs[(i+1)%2];activate(next);next.focus();}})});document.getElementById('watch-search').addEventListener('input',render);document.getElementById('watch-filter').addEventListener('change',render);render();
}

function renderMusic(){
  main.innerHTML=header('Music','the two artists i keep coming back to. ranked in exactly this order.')+`<section><h2>Top two.</h2><div class="artist-shelf">${data.artists.map((a,i)=>`<a class="artist-record" href="${a.url}" target="_blank" rel="noopener noreferrer"><span class="record record-${i}"><span class="record-label"><span>${a.rank}</span>${esc(a.name)}<i></i></span></span><span class="shelf-title">${esc(a.name)}${arrow}</span><span class="shelf-meta">${i===0?'my favourite artist':'a very close second'}</span></a>`).join('')}</div></section><section class="music-notes"><h2>Always in rotation.</h2><p>Kanye West first, Drake second. That’s the order.</p><p>Something to have on while I’m studying, building, or getting into another game.</p><div class="artist-links">${data.artists.map(a=>`<a class="inline-link" href="${a.url}" target="_blank" rel="noopener noreferrer">${esc(a.name)} on Apple Music${arrow}</a>`).join('')}</div></section>`;
}

function renderResume(){
  main.innerHTML=`<section class="resume"><div class="resume-actions"><a class="inline-link" href="./">← back to portfolio</a><button class="inline-link" id="print-resume">print / save PDF ↗</button></div><h1>${esc(data.profile.name)}</h1><p class="resume-tagline">Nanotechnology Engineering · University of Waterloo</p><p class="resume-contact"><a href="mailto:${data.profile.email}">${data.profile.email}</a> · <a href="${data.profile.github}">github.com/somilkarmalkar</a> · <a href="https://${data.profile.domain}">${data.profile.domain}</a></p><p>${esc(data.profile.availability)}</p><h2>Education</h2><h3>University of Waterloo</h3><p>Nanotechnology Engineering · First year</p><h2>Projects</h2>${data.projects.map(p=>`<article><h3>${esc(p.name)} <span>— ${esc(p.category)}</span></h3><p>${esc(p.summary)}</p><p class="metadata">${p.tags.map(esc).join(' · ')} · ${esc(p.status)}</p></article>`).join('')}<h2>Skills</h2>${data.skills.map(s=>`<p><strong>${esc(s.name)}:</strong> ${esc(s.detail)}</p>`).join('')}<h2>Experience & leadership</h2>${data.experience.map(e=>`<article><h3>${esc(e.role)} <span>— ${esc(e.organization)}</span></h3><p>${esc(e.description)}</p></article>`).join('')}</section>`;document.getElementById('print-resume').addEventListener('click',()=>window.print());
}

const detailDialog=document.getElementById('detail-dialog'),dialogContent=document.getElementById('dialog-content');
function openProject(id){const p=data.projects.find(p=>p.id===id);if(!p)return;dialogContent.innerHTML=`<div class="project-detail"><p class="metadata">${esc(p.category)} · ${esc(p.status)}</p><h2 id="dialog-title">${esc(p.name)}</h2><p>${esc(p.summary)}</p><p class="metadata">${p.tags.map(esc).join(' · ')}</p><h3>Inside the project.</h3><ul>${p.details.map(d=>`<li>${esc(d)}</li>`).join('')}</ul><p class="dialog-note">${esc(p.note)}</p><a class="inline-link" href="mailto:${data.profile.email}?subject=${encodeURIComponent('Let’s talk about '+p.name)}">ask me about it${arrow}</a></div>`;detailDialog.showModal();}
function openGame(id,picked=false){const g=data.games.find(g=>g.id===id);if(!g)return;dialogContent.innerHTML=`<div class="media-detail">${image(gameArt(g),g.title)}<div><p class="metadata">${picked?'tonight’s pick':statusNames[g.status]}</p><h2 id="dialog-title">${esc(g.title)}</h2><p>${g.status==='favourite'?'My all-time favourite game.':g.status==='rotation'?'One of the games I’m currently playing.':'One of the games I like and have spent time with.'}</p><button class="inline-link" data-close-dialog>back to the shelf →</button></div></div>`;detailDialog.showModal();}
function openSeries(s){if(!s)return;dialogContent.innerHTML=`<div class="media-detail">${image(s.image,s.title)}<div><p class="metadata">${statusNames[s.status]}</p><h2 id="dialog-title">${esc(s.title)}</h2><p>${esc(s.progress)}</p><button class="inline-link" data-close-dialog>back to the watchlist →</button></div></div>`;detailDialog.showModal();}
document.addEventListener('click',e=>{const p=e.target.closest('[data-project]'),g=e.target.closest('[data-game]'),s=e.target.closest('[data-series]');if(p)openProject(p.dataset.project);if(g)openGame(g.dataset.game);if(s)openSeries(data[s.dataset.category][Number(s.dataset.series)]);if(e.target.closest('[data-close-dialog],.dialog-close'))detailDialog.close();});
detailDialog.addEventListener('click',e=>{if(e.target===detailDialog){const r=detailDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)detailDialog.close();}});
function toast(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('visible'),2500);}
async function copyEmail(){try{await navigator.clipboard.writeText(data.profile.email);toast('email copied');}catch{toast(data.profile.email);}}

if(page==='work')renderWork();else if(page==='personal')renderPersonal();else if(page==='games')renderGames();else if(page==='watchlist')renderWatchlist();else if(page==='music')renderMusic();else renderResume();
document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===page)a.setAttribute('aria-current','page');});
document.getElementById('year').textContent=new Date().getFullYear();
document.querySelectorAll('.copy-email').forEach(b=>b.addEventListener('click',copyEmail));
const navDialog=document.getElementById('nav-dialog');document.querySelector('.menu-toggle').addEventListener('click',()=>navDialog.showModal());document.querySelector('.menu-close').addEventListener('click',()=>navDialog.close());navDialog.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>navDialog.close()));
document.querySelector('.display-more').addEventListener('click',e=>{const b=e.currentTarget;const open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',open);document.querySelector('.display-toggles').classList.toggle('expanded',open);});
const deckButton=document.querySelector('.deck-toggle'),deckPanel=document.querySelector('.deck-panel');deckButton.addEventListener('click',()=>{const open=deckPanel.hidden;deckPanel.hidden=!open;deckButton.setAttribute('aria-expanded',open);});document.addEventListener('click',e=>{if(!e.target.closest('.music-dock')){deckPanel.hidden=true;deckButton.setAttribute('aria-expanded','false');}});document.addEventListener('keydown',e=>{if(e.key==='Escape'){deckPanel.hidden=true;deckButton.setAttribute('aria-expanded','false');}});
document.querySelectorAll('a[href^="#"],a[href^="./#"]').forEach(a=>a.addEventListener('click',e=>{const href=a.getAttribute('href');if(href.startsWith('./#')&&page!=='work')return;const target=document.getElementById(href.split('#')[1]);if(target){e.preventDefault();target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}}));
initScene();
initInteractionPolish();

function canAnimate(){return document.documentElement.dataset.motion!=='paused'&&!matchMedia('(prefers-reduced-motion: reduce)').matches;}

function initInteractionPolish(){
  let surface=null,rect=null,x=0,y=0,paint=0;
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  document.addEventListener('pointermove',e=>{
    if(!canAnimate()||!fine.matches)return;
    const target=e.target.closest('.shelf-cover,.flow-card,.record');
    if(!target){surface=null;rect=null;return;}
    if(target!==surface){surface=target;rect=surface.getBoundingClientRect();}
    x=Math.max(0,Math.min(100,(e.clientX-rect.left)/rect.width*100));y=Math.max(0,Math.min(100,(e.clientY-rect.top)/rect.height*100));
    if(!paint)paint=requestAnimationFrame(()=>{paint=0;if(surface&&rect){surface.style.setProperty('--shine-x',x+'%');surface.style.setProperty('--shine-y',y+'%');}});
  },{passive:true});
  const reset=()=>{surface=null;rect=null;};
  window.addEventListener('scroll',reset,{passive:true});window.addEventListener('resize',reset);
  document.addEventListener('motionchange',()=>{if(!canAnimate()){document.getAnimations().forEach(a=>a.cancel());document.querySelectorAll('.name span').forEach(s=>s.style.transform='');}});
  document.addEventListener('keydown',()=>document.documentElement.dataset.input='keyboard',{capture:true});
  document.addEventListener('pointerdown',()=>document.documentElement.dataset.input='pointer',{passive:true,capture:true});
  document.addEventListener('click',e=>{const link=e.target.closest('a[href]');if(!link||link.target||link.href.startsWith('mailto:'))return;const url=new URL(link.href,location.href);if(url.origin===location.origin&&url.pathname!==location.pathname){try{sessionStorage.setItem('somil-skip-enter',e.detail===0?'1':'0');}catch{}}});
  for(const type of ['pageswap','pagereveal'])window.addEventListener(type,e=>{if(!canAnimate()||document.documentElement.dataset.enter==='skip'||document.documentElement.dataset.input==='keyboard')e.viewTransition?.skipTransition();});
  window.addEventListener('pagehide',()=>cancelAnimationFrame(paint),{once:true});
}

function initScene(){
  const ambient=document.getElementById('ambient'),object=document.getElementById('desk-object');const bg=ambient.getContext('2d'),ctx=object.getContext('2d');if(!bg||!ctx)return;
  const low=document.createElement('canvas');low.width=80;low.height=100;const lc=low.getContext('2d');const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let texture=true,motion=true,angle=.4,tilt=.15,spin=0,dragging=false,lastX=0,lastY=0,dragDistance=0,w=0,h=0,frame=0,previous=0,lastBg=-Infinity,sceneTime=0,objectVisible=true,contentRight=0,cells=[];
  const pointer={x:0,y:0,tx:0,ty:0,vx:0,vy:0,energy:0,target:0,lastMoved:-Infinity,ready:false};
  let trail=[],ripples=[];
  try{texture=localStorage.getItem('somil-pixels')!=='off';motion=localStorage.getItem('somil-motion')!=='paused';}catch{}
  const themeButton=document.getElementById('theme-toggle'),textureButton=document.getElementById('texture-toggle'),motionButton=document.getElementById('motion-toggle');
  const active=()=>motion&&!reduced.matches;
  const refresh=()=>{const theme=document.documentElement.dataset.theme;const next={dark:'dim',dim:'light',light:'dark'}[theme]||'dark';document.documentElement.dataset.motion=active()?'on':'paused';themeButton.setAttribute('aria-label','Switch to '+next+' theme');themeButton.title='theme: '+theme+' · switch to '+next;textureButton.setAttribute('aria-pressed',texture);motionButton.setAttribute('aria-pressed',active());motionButton.setAttribute('aria-label',active()?'Pause motion':'Resume motion');motionButton.disabled=reduced.matches;motionButton.title=reduced.matches?'Reduced motion is enabled in system settings':active()?'Pause motion':'Resume motion';document.querySelector('meta[name="theme-color"]').content=theme==='light'?'#f0ede6':theme==='dim'?'#17191d':'#08090b';document.dispatchEvent(new Event('motionchange'));};
  const clearEffects=()=>{pointer.energy=0;pointer.target=0;pointer.vx=0;pointer.vy=0;pointer.ready=false;pointer.lastMoved=-Infinity;trail=[];ripples=[];};
  const background=(time,now)=>{
    bg.clearRect(0,0,w,h);if(!texture)return;
    const light=document.documentElement.dataset.theme==='light',cell=w<600?7:8;
    const cx=w*(w<600?.93:.89),cy=h*(.72+Math.sin(time*.000045)*.05),radius=Math.max(w*.49,h*.68),reach=Math.min(220,w*.43),reach2=reach*reach;
    const moving=active()&&pointer.energy>.002;
    for(const c of cells){
      const dx=(c.x-cx)/radius,dy=(c.y-cy)/(radius*.95),base=Math.max(0,1-dx*dx-dy*dy)**2;
      let hover=0,wake=0,wave=0,shiftX=0,shiftY=0;
      if(moving){const px=c.x-pointer.x,py=c.y-pointer.y,d2=px*px+py*py;if(d2<reach2){const d=Math.sqrt(d2),influence=(1-d/reach)**2*pointer.energy;hover=influence;const force=influence*13/(d||1);shiftX+=px*force;shiftY+=py*force;}}
      for(const t of trail){const px=c.x-t.x,py=c.y-t.y;if(Math.abs(px)>105||Math.abs(py)>105)continue;const d2=px*px+py*py;if(d2<11025)wake=Math.max(wake,(1-d2/11025)**2*t.life*.5);}
      for(const r of ripples){const px=c.x-r.x,py=c.y-r.y;if(Math.abs(px)>r.radius+24||Math.abs(py)>r.radius+24)continue;const d=Math.hypot(px,py),ring=Math.max(0,1-Math.abs(d-r.radius)/18)*r.life*r.life;wave=Math.max(wave,ring);if(ring){const force=ring*8/(d||1);shiftX+=px*force;shiftY+=py*force;}}
      const energy=Math.min(1,hover*.9+wake+wave*.8);
      if(c.noise>base*.86+energy*.78+.045)continue;
      const quiet=c.x<contentRight+16?.45:1,phone=w<600?.2+.8*Math.pow(c.x/w,1.5):1;
      bg.globalAlpha=(light?Math.max(base*.13+.02,energy*.22):Math.max(base*.55+.04,energy*.62*quiet))*phone;
      bg.fillStyle=energy>.25?c.bright:c.color;
      const size=cell-2+hover*.8;
      bg.fillRect(Math.round(c.x+1+shiftX),Math.round(c.y+1+shiftY),size,size);
    }
    bg.globalAlpha=1;
  };
  const vertices=[[0,-1.45,0],[.8,0,0],[0,0,.6],[-.8,0,0],[0,0,-.6],[0,1.45,0]],faces=[[0,1,2],[0,2,3],[0,3,4],[0,4,1],[5,2,1],[5,3,2],[5,4,3],[5,1,4]],colors=['#d0f6bb','#69c981','#36795d','#2e7158','#a5e5ad','#61bb88','#2e6b56','#468c69'];
  const drawObject=time=>{if(!objectVisible)return;lc.clearRect(0,0,80,100);const a=angle+time*.00014,bob=Math.sin(time*.001)*2;const points=vertices.map(([x,y,z])=>{let xx=x*Math.cos(a)+z*Math.sin(a),zz=-x*Math.sin(a)+z*Math.cos(a);let yy=y*Math.cos(tilt)-zz*Math.sin(tilt);zz=y*Math.sin(tilt)+zz*Math.cos(tilt);const p=3.8/(3.8+zz);return {x:40+xx*28*p,y:50+yy*28*p+bob,z:zz};});const sorted=faces.map((f,i)=>({f,i,z:f.reduce((s,j)=>s+points[j].z,0)/3})).sort((a,b)=>b.z-a.z);for(const {f,i}of sorted){lc.beginPath();f.forEach((j,n)=>{const p=points[j];if(!n)lc.moveTo(p.x,p.y);else lc.lineTo(p.x,p.y);});lc.closePath();lc.fillStyle=colors[i];lc.fill();lc.strokeStyle=colors[i];lc.lineWidth=.5;lc.stroke();}ctx.clearRect(0,0,object.width,object.height);const pixels=lc.getImageData(0,0,80,100).data,scale=object.width/80;for(let y=0;y<100;y++)for(let x=0;x<80;x++){const i=(y*80+x)*4;if(pixels[i+3]<100)continue;ctx.fillStyle=`rgb(${pixels[i]} ${pixels[i+1]} ${pixels[i+2]})`;ctx.fillRect(x*scale,y*scale,Math.max(1,scale-(texture?1:0)),Math.max(1,scale-(texture?1:0)));}};
  const render=now=>{
    frame=0;
    const live=active()&&!document.hidden,elapsed=Math.max(0,now-previous),dt=Math.min(elapsed/1000,1/30);
    const responding=live&&(now-pointer.lastMoved<950||ripples.length||Math.abs(pointer.target-pointer.energy)>.004);
    if(elapsed>=(responding?16:32)||!live){
      if(live){
        sceneTime+=Math.min(elapsed,60);
        if(pointer.ready){pointer.vx+=(pointer.tx-pointer.x)*100*dt;pointer.vy+=(pointer.ty-pointer.y)*100*dt;pointer.vx*=Math.exp(-10*dt);pointer.vy*=Math.exp(-10*dt);pointer.x+=pointer.vx*dt;pointer.y+=pointer.vy*dt;}
        pointer.energy+=(pointer.target-pointer.energy)*(1-Math.exp(-12*dt));
        trail=trail.filter(t=>now-t.born<650);for(const t of trail)t.life=1-(now-t.born)/650;
        ripples=ripples.filter(r=>now-r.born<900);for(const r of ripples){const progress=(now-r.born)/900;r.radius=16+progress*230;r.life=1-progress;}
        if(spin){angle+=spin;spin*=.94;if(spin<.001)spin=0;}
      }
      drawObject(sceneTime);
      if(now-lastBg>(responding?15:120)||!live){background(sceneTime,now);lastBg=now;}
      previous=now;
    }
    if(live&&(texture||objectVisible))frame=requestAnimationFrame(render);
  };
  const restart=()=>{cancelAnimationFrame(frame);lastBg=-Infinity;previous=performance.now()-33;render(performance.now());};
  const wake=()=>{if(!frame&&active()&&!document.hidden)frame=requestAnimationFrame(render);};
  const resize=()=>{
    w=innerWidth;h=innerHeight;ambient.width=w;ambient.height=h;object.width=320;object.height=400;contentRight=main.getBoundingClientRect().right;objectVisible=getComputedStyle(object.parentElement).display!=='none';
    cells=[];const cell=w<600?7:8;
    for(let y=0;y<h;y+=cell)for(let x=0;x<w;x+=cell){let seed=(((x+1)*73856093)^((y+1)*19349663))>>>0;seed=Math.imul(seed^(seed>>>16),2246822507)>>>0;const noise=(seed%997)/997;cells.push({x,y,noise,color:noise>.7?'#5383d7':noise>.4?'#234c9d':'#183672',bright:noise>.7?'#528ce0':'#3264be'});}
    clearEffects();restart();
  };
  const follow=e=>{
    if(!active()||!texture||document.hidden)return;
    const now=performance.now();if(!pointer.ready){pointer.x=e.clientX;pointer.y=e.clientY;pointer.tx=e.clientX;pointer.ty=e.clientY;pointer.ready=true;}
    const distance=Math.hypot(e.clientX-pointer.tx,e.clientY-pointer.ty);pointer.tx=e.clientX;pointer.ty=e.clientY;pointer.target=1;pointer.lastMoved=now;
    const last=trail[trail.length-1];if(distance>3&&(!last||now-last.born>28)){trail.push({x:e.clientX,y:e.clientY,born:now,life:1});if(trail.length>10)trail.shift();}
    wake();
  };
  const leave=()=>{pointer.target=0;pointer.lastMoved=performance.now();wake();};
  window.addEventListener('pointermove',follow,{passive:true});
  window.addEventListener('pointerdown',e=>{follow(e);if(active()&&texture){ripples.push({x:e.clientX,y:e.clientY,born:performance.now(),radius:16,life:1});if(ripples.length>3)ripples.shift();wake();}},{passive:true});
  window.addEventListener('pointerup',e=>{if(e.pointerType==='touch')leave();},{passive:true});window.addEventListener('pointercancel',leave,{passive:true});window.addEventListener('pointerout',e=>{if(!e.relatedTarget)leave();},{passive:true});window.addEventListener('blur',leave);
  themeButton.addEventListener('click',()=>{const next={dark:'dim',dim:'light',light:'dark'}[document.documentElement.dataset.theme]||'dark';document.documentElement.dataset.theme=next;try{localStorage.setItem('somil-display-v2',next);}catch{}refresh();restart();});
  textureButton.addEventListener('click',()=>{texture=!texture;clearEffects();try{localStorage.setItem('somil-pixels',texture?'on':'off');}catch{}refresh();restart();});
  motionButton.addEventListener('click',()=>{motion=!motion;clearEffects();try{localStorage.setItem('somil-motion',motion?'on':'paused');}catch{}refresh();restart();});
  const turn=()=>{if(active())spin=.2;else angle+=Math.PI/2;restart();};
  object.addEventListener('pointerdown',e=>{dragging=true;dragDistance=0;lastX=e.clientX;lastY=e.clientY;object.setPointerCapture(e.pointerId);});object.addEventListener('pointermove',e=>{if(!dragging)return;dragDistance+=Math.abs(e.clientX-lastX);angle+=(e.clientX-lastX)*.015;tilt=Math.max(-.6,Math.min(.6,tilt+(e.clientY-lastY)*.008));lastX=e.clientX;lastY=e.clientY;restart();});object.addEventListener('pointerup',()=>{dragging=false;if(dragDistance<5)turn();});object.addEventListener('pointercancel',()=>dragging=false);object.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();turn();}if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();angle+=e.key==='ArrowLeft'?-.2:.2;restart();}});
  reduced.addEventListener('change',()=>{clearEffects();refresh();restart();});document.addEventListener('visibilitychange',()=>{clearEffects();restart();});window.addEventListener('resize',resize);window.addEventListener('pagehide',()=>cancelAnimationFrame(frame),{once:true});refresh();resize();
}
