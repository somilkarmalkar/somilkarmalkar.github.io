import { readFile, access } from 'node:fs/promises';
const data = JSON.parse(await readFile(new URL('../content/site.json',import.meta.url),'utf8'));
const ids = data.projects.map(p=>p.id).concat(data.games.map(g=>g.id));
if(new Set(ids).size!==ids.length) throw new Error('Duplicate content IDs');
for(const p of data.projects) for(const key of ['id','name','summary','tags','details']) if(!p[key]) throw new Error(`Missing ${key}: ${p.id}`);
for(const g of data.games) {
  if(!g.title || !['rotation','favourite','liked'].includes(g.status)) throw new Error(`Invalid game: ${g.id}`);
  await access(new URL(`../public/assets/games/${g.id}.webp`,import.meta.url));
}
for(const s of [...data.anime,...data.shows]) {
  if(!s.title || !s.progress || !['pending','watching','complete','caught-up'].includes(s.status)) throw new Error(`Invalid watch entry: ${s.title}`);
  if(s.image) await access(new URL('../public/'+s.image,import.meta.url));
}
for(const page of ['index.html','personal.html','games.html','watchlist.html','music.html','resume.html']) await access(new URL('../dist/'+page,import.meta.url));
for(const model of ['gameboy','controller','headphones','laptop','computer','books','television']) await access(new URL('../public/assets/models/'+model+'.glb',import.meta.url));
for(const asset of ['model-renderer.js','vendor/three.module.min.js','vendor/GLTFLoader.js','vendor/BufferGeometryUtils.js','vendor/RoomEnvironment.js','vendor/LICENSE-three.txt','assets/models/credits.html']) await access(new URL('../public/'+asset,import.meta.url));
console.log(`Content checked: ${data.projects.length} projects, ${data.games.length} games, ${data.anime.length} anime, ${data.shows.length} shows.`);
