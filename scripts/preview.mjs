import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.resolve(root, '../outputs');
await mkdir(out, { recursive: true });
const assetMap = {};
for (const dir of ['games','watch']) {
  for (const file of await readdir(path.join(root, 'public/assets', dir))) {
    if (!file.endsWith('.webp')) continue;
    const bytes = await readFile(path.join(root, 'public/assets', dir, file));
    assetMap[`assets/${dir}/${file}`] = 'data:image/webp;base64,' + bytes.toString('base64');
  }
}
let css = await readFile(path.join(root, 'public/styles.css'), 'utf8');
for (const name of ['newsreader','newsreader-italic','jetbrains']) {
  const font = await readFile(path.join(root, 'public/assets/fonts', name+'.woff2'));
  css = css.replaceAll(`assets/fonts/${name}.woff2`, 'data:font/woff2;base64,'+font.toString('base64'));
}
let js = await readFile(path.join(root, 'public/app.js'), 'utf8');
js = '/*PREVIEW_ASSET_MAP*/\n' + js.replace('const gameArt = g => `assets/games/${g.id}.webp`;', 'const gameArt = g => previewAssets[`assets/games/${g.id}.webp`];').replace('src="${src}"', 'src="${previewAssets[src] || src}"').replace('src="assets/games/detroit-landscape.webp"', 'src="'+assetMap['assets/games/detroit-landscape.webp']+'"');
js += `\ndocument.addEventListener('click', e => {const a=e.target.closest('a');if(!a)return;const href=a.getAttribute('href');if(!href)return;const routes={'./':'work','index.html':'work','personal.html':'personal','games.html':'games','watchlist.html':'watchlist','music.html':'music','resume.html':'resume'};const parts=href.split('#');const view=routes[parts[0]];if(view){e.preventDefault();if(view===document.body.dataset.page&&parts[1])document.getElementById(parts[1])?.scrollIntoView();else parent.postMessage({type:'portfolio-navigation',view,anchor:parts[1]||null,motion:canAnimate()&&e.detail!==0},'*')}else if(href.startsWith('#')){e.preventDefault();document.getElementById(href.slice(1))?.scrollIntoView();}});document.addEventListener('motionchange',()=>parent.postMessage({type:'portfolio-motion',enabled:canAnimate()},'*'));addEventListener('message',e=>{if(e.source===parent&&e.data?.type==='preview-anchor')document.getElementById(e.data.anchor)?.scrollIntoView()});`;
const icon = 'data:image/svg+xml;base64,' + (await readFile(path.join(root,'public/assets/favicon.svg'))).toString('base64');
const pages = {};
for (const [view, filename] of [['work','index.html'],['personal','personal.html'],['games','games.html'],['watchlist','watchlist.html'],['music','music.html'],['resume','resume.html']]) {
  let html = await readFile(path.join(root, 'dist', filename), 'utf8');
  html = html.replace(/<link rel="preload"[^>]+>/g, '').replace('href="assets/favicon.svg"','href="'+icon+'"')
    .replace('<link rel="stylesheet" href="styles.css">', '<style>'+css+'</style>')
    .replace('<script src="app.js" defer></script>', '<script>'+js.replaceAll('</script','<\\/script')+'</script>');
  pages[view] = html;
}
const safeJSON = value => JSON.stringify(value).replace(/</g, '\\u003c');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Somil Karmalkar — Portfolio preview</title><style>html,body{margin:0;height:100%;background:#08090b}iframe{border:0;width:100%;height:100svh;display:block}</style></head><body><iframe id="preview" title="Somil Karmalkar portfolio"></iframe><script>const assets=${safeJSON(assetMap)};const pages=${safeJSON(pages)};const frame=document.getElementById('preview');let current='';function show(view,anchor,animate=false){if(!pages[view])view='work';current=view;frame.onload=()=>{if(anchor)frame.contentWindow.postMessage({type:'preview-anchor',anchor},'*');if(animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches){frame.getAnimations().forEach(a=>a.cancel());frame.animate([{opacity:.55},{opacity:1}],{duration:220,easing:'cubic-bezier(.23,1,.32,1)'});}frame.onload=null;};frame.srcdoc=pages[view].replace('/*PREVIEW_ASSET_MAP*/','const previewAssets='+JSON.stringify(assets)+';');document.title=({personal:'Favourites',games:'Games',watchlist:'Watchlist',music:'Music',resume:'Résumé',work:'Somil Karmalkar'}[view])+' — Portfolio preview';}addEventListener('message',e=>{if(e.source!==frame.contentWindow)return;if(e.data?.type==='portfolio-motion'){if(!e.data.enabled)frame.getAnimations().forEach(a=>a.cancel());return;}if(e.data?.type!=='portfolio-navigation')return;const view=e.data.view;if(pages[view]){history.replaceState(null,'','#'+view);show(view,e.data.anchor,e.data.motion===true)}});show(location.hash.slice(1)||'work');</script></body></html>`;
await writeFile(path.join(out,'Somil-Portfolio-Preview.html'),html);
console.log('Created portable, self-contained portfolio preview.');
