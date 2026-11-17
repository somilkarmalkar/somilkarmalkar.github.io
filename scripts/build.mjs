import { mkdir, readFile, writeFile, cp, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(path.join(root, 'public'), dist, { recursive: true });
const data = JSON.parse(await readFile(path.join(root, 'content/site.json'), 'utf8'));
const serialized = JSON.stringify(data).replace(/</g, '\\u003c');
const safe = value => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const template = await readFile(path.join(root, 'src/layout.html'), 'utf8');
const nav = `<a href="./" data-nav="work">me</a><div class="nav-sub"><a href="./#projects">projects</a><a href="./#experience">experience</a></div><a href="personal.html" data-nav="personal">favourites</a><a href="games.html" data-nav="games">games</a><a href="watchlist.html" data-nav="watchlist">watchlist</a><a href="music.html" data-nav="music">music</a><a href="resume.html" data-nav="resume">résumé</a>`;
for (const [file, page, title, description] of [
  ['index.html', 'work', 'Somil Karmalkar — Engineering & things I make', 'First-year Nanotechnology Engineering at Waterloo. Swift, Python, native apps, and engineering design. Seeking Spring 2027 co-op.'],
  ['personal.html', 'personal', 'Favourites · Somil Karmalkar', 'The games, anime, and stories in Somil Karmalkar’s corner of the internet.'],
  ['games.html', 'games', 'Games · Somil Karmalkar', 'Somil’s game shelf: Detroit: Become Human, the games in rotation, and the collection.'],
  ['watchlist.html', 'watchlist', 'Watchlist · Somil Karmalkar', 'Somil’s anime and TV watchlist, with personal watch progress.'],
  ['music.html', 'music', 'Music · Somil Karmalkar', 'Kanye West and Drake, the two artists at the top of Somil’s list.'],
  ['resume.html', 'resume', 'Résumé — Somil Karmalkar', 'Somil Karmalkar — Nanotechnology Engineering, University of Waterloo. Seeking Spring 2027 co-op.']
]) {
  const canonical = 'https://' + data.profile.domain + '/' + (file === 'index.html' ? '' : file);
  const html = template.replaceAll('%%TITLE%%', safe(title)).replaceAll('%%DESCRIPTION%%', safe(description)).replaceAll('%%PAGE%%', page).replaceAll('%%CANONICAL%%', canonical).replaceAll('%%NAV%%', nav).replace('%%DATA%%', serialized);
  await writeFile(path.join(dist, file), html);
}
await writeFile(path.join(dist, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: https://somilkarmalkar.tech/sitemap.xml\n');
await writeFile(path.join(dist, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+['','personal.html','games.html','watchlist.html','music.html','resume.html'].map(p=>`<url><loc>https://somilkarmalkar.tech/${p}</loc></url>`).join('')+'</urlset>');
console.log('Built 6 pages in dist/. No runtime dependencies.');
