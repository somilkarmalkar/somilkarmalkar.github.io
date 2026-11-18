import {createModelRenderer,modelCatalog} from './model-renderer.js';
/* Existing artist-created models and a continuous shared background. */
(() => {
  'use strict';
  const canvas = document.getElementById('ambient');
  const handle = document.getElementById('desk-object');
  const stage = handle?.closest('.object-stage');
  const ctx = canvas?.getContext('2d', { alpha: true });
  if (!ctx || !handle || !stage) return;

  const root = document.documentElement;
  const main = document.getElementById('main');
  const themeButton = document.getElementById('theme-toggle');
  const pixelsButton = document.getElementById('texture-toggle');
  const motionButton = document.getElementById('motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const background = document.createElement('canvas');
  const bg = background.getContext('2d', { alpha: true });
  if (!bg) return;
  const CELL = 5;
  const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const palettes = {
    dark: ['#08090b', '#11192d', '#1b2b50', '#29467e', '#4267aa', '#7799cc', '#b6cee7'],
    dim: ['#17191d', '#202837', '#2a3c57', '#3a557a', '#59769c', '#8da5c2', '#c0d1e0'],
    light: ['#f0ede6', '#e6e0d5', '#d5ccbd', '#bcb6aa', '#959ba0', '#6c7d91', '#425e7e']
  };
  const labels = Object.fromEntries(Object.entries(modelCatalog).map(([key,value])=>[key,'3D '+value.label]));
  let width = 1, height = 1, cols = 1, rows = 1, cells = new Float32Array(1);
  let palette = palettes.dark;
  let scene = { x: 0, y: 0, radius: 0, visible: false };
  let current = '', previousModel = '', changedAt = 0, changeDuration = 0;
  const importedModels=createModelRenderer((kind,status)=>{
    if(!kind || kind===current){canvas.dataset.assetStatus=status;wake(true);}
  });
  let frame = 0, lastFrame = 0, time = 0, yaw = -.33, pitch = -.22, spin = 0;
  let dragging = false, dragId = null, lastX = 0, lastY = 0, distance = 0;
  let motion = true, pixels = true, disposed = false;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, power: 0, target: 0, ready: false, last: 0 };
  try {
    motion = localStorage.getItem('somil-motion') !== 'paused';
    pixels = localStorage.getItem('somil-pixels') !== 'off';
  } catch {}
  const active = () => motion && !reduced.matches;
  const hash = (x, y) => {
    let n = Math.imul(x + 73, 374761393) ^ Math.imul(y + 179, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  };
  const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
  const quantize = (value, x, y) => {
    const scaled = clamp(value) * (palette.length - 1);
    const low = Math.floor(scaled);
    return Math.min(palette.length - 1, low + (scaled - low > (bayer[(y & 3) * 4 + (x & 3)] + .5) / 16 ? 1 : 0));
  };

  function contextModel() {
    const page = document.body.dataset.page;
    if (page === 'work') {
      if (scrollY < 32) return 'laptop';
      let selected = 'laptop';
      const focus = height * .4;
      for (const [id,kind] of [['projects','computer'],['experience','books'],['contact','headphones']]) {
        const section=document.getElementById(id);
        if(section && section.getBoundingClientRect().top<=focus)selected=kind;
      }
      return selected;
    }
    if(page==='personal') {
      const category=document.querySelector('[data-feature-tab][aria-selected="true"]')?.dataset.featureTab;
      return category==='anime'?'books':category==='shows'?'television':'controller';
    }
    if(page==='watchlist')return document.querySelector('[data-watch-tab="shows"][aria-selected="true"]')?'television':'books';
    return {games:'gameboy',music:'headphones',resume:'books'}[page] || 'laptop';
  }

  function selectModel() {
    const next = contextModel();
    if (next === current) return;
    previousModel = current; current = next; changedAt = performance.now();
    changeDuration = active() && root.dataset.input !== 'keyboard' ? 240 : 0;
    if(scene.visible)importedModels.prepare(next);
    canvas.dataset.modelAsset='assets/models/'+modelCatalog[next].file;
    canvas.dataset.assetStatus=importedModels.has(next)?'ready':'loading';
    canvas.dataset.model = stage.dataset.model = next;
    handle.setAttribute('aria-label', labels[next] + ': drag to turn, or use Enter and arrow keys');
    wake(true);
  }

  function buildBackground() {
    palette = palettes[root.dataset.theme] || palettes.dark;
    bg.clearRect(0, 0, width, height);
    const reading = main.getBoundingClientRect();
    const readingCenter = (reading.left + reading.right) / 2;
    const readingFalloff = Math.max(220, reading.width * .66);
    const light = root.dataset.theme === 'light';
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const nx = x / cols, ny = y / rows;
      const glow = Math.pow(Math.max(0, 1 - Math.hypot((nx - 1.03) * 1.18, (ny - 1.06)) / 1.11), 1.7) * .81;
      const sweep = Math.pow(Math.max(0, 1 - Math.hypot((nx - .57) * 1.1, (ny - 1.36) * 1.65) / .82), 2) * .28;
      // Protect the reading area without painting a rectangular panel into the field.
      // This envelope and its derivative are continuous across both content edges.
      const readingDistance = (x * CELL - readingCenter) / readingFalloff;
      const quiet = 1 - .42 * Math.exp(-.5 * readingDistance * readingDistance);
      const level = Math.max(0, (glow + sweep + (hash(x, y) - .5) * .055) * quiet);
      cells[y * cols + x] = level;
      const color = quantize(level, x, y);
      if (color) {
        bg.fillStyle = palette[color]; bg.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1);
      } else {
        bg.fillStyle = light ? 'rgba(80,70,55,.055)' : 'rgba(185,204,236,.04)';
        bg.fillRect(x * CELL + 2, y * CELL + 2, 1, 1);
      }
    }
    bg.font = '9px ui-monospace, monospace';
    for (let y = 15; y < height; y += 30) for (let x = 12; x < width; x += 30) {
      const n = hash(x, y);
      if (n < .73) continue;
      bg.fillStyle = light ? 'rgba(75,65,50,.055)' : 'rgba(177,198,235,.055)';
      bg.fillText(n > .94 ? '+' : '0', x, y);
    }
  }

  function placeScene() {
    const right = main.getBoundingClientRect().right;
    const free = width - right;
    scene.visible = width > 1100 && free >= 240 && pixels;
    scene.radius = Math.min(free * .445, height * .31, 465);
    scene.x = right + free * .47;
    scene.y = height * .48;
    stage.style.display = scene.visible ? 'block' : 'none';
    stage.style.left = (scene.x - scene.radius) + 'px';
    stage.style.top = (scene.y - scene.radius) + 'px';
    stage.style.width = stage.style.height = scene.radius * 2 + 'px';
    handle.width = handle.height = 1;
    if(scene.visible && current)importedModels.prepare(current);
  }

  function drawObject(kind,opacity,angle) {
    if(!scene.visible || opacity<=0)return;
    importedModels.draw(ctx,{kind,x:scene.x,y:scene.y,radius:scene.radius,angle,pitch,opacity,cell:CELL});
  }

  function drawPointer(now) {
    if (!pointer.ready || pointer.power < .008) return;
    const radius = 68, radiusSquared = radius * radius;
    const x0 = Math.max(0, Math.floor((pointer.x - radius) / CELL)), x1 = Math.min(cols - 1, Math.ceil((pointer.x + radius) / CELL));
    const y0 = Math.max(0, Math.floor((pointer.y - radius) / CELL)), y1 = Math.min(rows - 1, Math.ceil((pointer.y + radius) / CELL));
    // A small additive highlight keeps the lattice intact. No lens erases or shifts
    // the background, and no cursor pass can cut through a rendered model.
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const dx = x * CELL + CELL / 2 - pointer.x, dy = y * CELL + CELL / 2 - pointer.y;
      const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared >= radiusSquared) continue;
      const influence = Math.pow(1 - distanceSquared / radiusSquared, 3) * pointer.power;
      const color = Math.min(palette.length - 1, quantize(cells[y * cols + x], x, y) + 1);
      ctx.globalAlpha = influence * .22;
      ctx.fillStyle = palette[color];
      ctx.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1);
    }
    ctx.globalAlpha = 1;
  }

  function draw(now, elapsed = 0) {
    ctx.clearRect(0, 0, width, height);
    if (!pixels) return;
    const live = active() && !document.hidden;
    if (live) {
      const dt = Math.min(elapsed / 1000, .034);
      time += Math.min(elapsed, 70);
      if (pointer.ready) {
        const follow = 1 - Math.exp(-38 * dt);
        pointer.x += (pointer.tx - pointer.x) * follow;
        pointer.y += (pointer.ty - pointer.y) * follow;
      }
      const target = now - pointer.last < 95 ? pointer.target : 0;
      pointer.power += (target - pointer.power) * (1 - Math.exp(-(target ? 42 : 30) * dt));
      if (!dragging && spin) { yaw += spin * dt; spin *= Math.exp(-3.2 * dt); if (Math.abs(spin) < .005) spin = 0; }
    }
    ctx.drawImage(background, 0, 0);
    if (live) drawPointer(now);
    const blend = changeDuration ? clamp((now - changedAt) / changeDuration) : 1;
    const angle = yaw + Math.sin(time * .00013) * .26;
    if (blend < 1 && previousModel) drawObject(previousModel, 1 - blend, angle);
    drawObject(current, blend, angle);
  }

  function tick(now) {
    frame = 0;
    if (disposed || document.hidden) return;
    const elapsed = now - lastFrame;
    const interval=dragging || (pointer.ready && now-pointer.last<140)?16:32;
    if (elapsed >= interval) { draw(now, elapsed); lastFrame = now; }
    if (active() && pixels) frame = requestAnimationFrame(tick);
  }
  function wake(immediate = false) {
    if (disposed) return;
    if (immediate || !active()) draw(performance.now());
    if (!frame && active() && pixels && !document.hidden) { lastFrame = performance.now() - 33; frame = requestAnimationFrame(tick); }
  }
  function clearPointer() {
    pointer.power = pointer.target = 0; pointer.ready = false;
  }
  function refreshControls() {
    const theme = root.dataset.theme || 'dark', next = { dark: 'dim', dim: 'light', light: 'dark' }[theme];
    root.dataset.motion = active() ? 'on' : 'paused'; root.dataset.pixels = pixels ? 'on' : 'off';
    themeButton.setAttribute('aria-label', 'Switch to ' + next + ' theme'); themeButton.title = 'theme: ' + theme + ' · switch to ' + next;
    pixelsButton.setAttribute('aria-pressed', String(pixels));
    motionButton.setAttribute('aria-pressed', String(active())); motionButton.setAttribute('aria-label', active() ? 'Pause motion' : 'Resume motion');
    motionButton.disabled = reduced.matches; motionButton.title = reduced.matches ? 'Reduced motion is enabled in system settings' : active() ? 'Pause motion' : 'Resume motion';
    document.querySelector('meta[name="theme-color"]').content = { dark: '#08090b', dim: '#17191d', light: '#f0ede6' }[theme];
    if (!active()) changeDuration = 0;
    clearPointer(); cancelAnimationFrame(frame); frame = 0;
    document.dispatchEvent(new Event('motionchange')); placeScene(); wake(true);
  }
  function resize() {
    width = innerWidth; height = innerHeight;
    canvas.width = background.width = width; canvas.height = background.height = height;
    cols = Math.ceil(width / CELL); rows = Math.ceil(height / CELL);
    cells = new Float32Array(cols * rows);
    buildBackground(); placeScene(); selectModel(); clearPointer(); wake(true);
  }
  function turn(event) {
    if (event?.detail === 0 || !active()) { yaw += Math.PI / 2; draw(performance.now()); }
    else { spin = 5; wake(); }
  }

  themeButton.addEventListener('click', () => {
    root.dataset.theme = { dark: 'dim', dim: 'light', light: 'dark' }[root.dataset.theme] || 'dark';
    try { localStorage.setItem('somil-display-v2', root.dataset.theme); } catch {}
    buildBackground(); refreshControls();
  });
  pixelsButton.addEventListener('click', () => { pixels = !pixels; try { localStorage.setItem('somil-pixels', pixels ? 'on' : 'off'); } catch {} refreshControls(); });
  motionButton.addEventListener('click', () => { motion = !motion; try { localStorage.setItem('somil-motion', motion ? 'on' : 'paused'); } catch {} refreshControls(); });
  window.addEventListener('pointermove', event => {
    if (!active() || !pixels || !finePointer.matches || document.hidden) return;
    if (!pointer.ready) { pointer.x = pointer.tx = event.clientX; pointer.y = pointer.ty = event.clientY; pointer.ready = true; }
    pointer.tx = event.clientX; pointer.ty = event.clientY; pointer.target = 1; pointer.last = performance.now(); wake();
  }, { passive: true });
  const leave = () => { pointer.target = 0; pointer.last = -Infinity; wake(); };
  window.addEventListener('pointerout', event => { if (!event.relatedTarget) leave(); }, { passive: true });
  window.addEventListener('blur', leave);
  handle.addEventListener('pointerdown', event => {
    if (dragging || event.pointerType === 'touch') return;
    dragging = true; dragId = event.pointerId; lastX = event.clientX; lastY = event.clientY; distance = 0; spin = 0;
    handle.setPointerCapture(event.pointerId);
  });
  handle.addEventListener('pointermove', event => {
    if (!dragging || event.pointerId !== dragId) return;
    const dx = event.clientX - lastX, dy = event.clientY - lastY; distance += Math.abs(dx) + Math.abs(dy);
    yaw += dx * .009; pitch = clamp(pitch + dy * .006, -.85, .85);
    lastX = event.clientX; lastY = event.clientY; wake(true);
  });
  handle.addEventListener('pointerup', event => { if (event.pointerId === dragId) { dragging = false; dragId = null; } });
  handle.addEventListener('pointercancel', () => { dragging = false; dragId = null; });
  handle.addEventListener('click', event => { if (distance < 6) turn(event); distance = 0; });
  handle.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); yaw += event.key === 'ArrowLeft' ? -.25 : .25; draw(performance.now()); }
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); yaw += Math.PI / 2; draw(performance.now()); }
  });
  let scrollFrame = 0;
  window.addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; selectModel(); }); }, { passive: true });
  const tabs = new MutationObserver(selectModel);
  main.querySelectorAll('[data-feature-tab],[data-watch-tab]').forEach(tab => tabs.observe(tab, { attributes: true, attributeFilter: ['aria-selected'] }));
  reduced.addEventListener('change', refreshControls);
  document.addEventListener('visibilitychange', () => { clearPointer(); cancelAnimationFrame(frame); frame = 0; if (!document.hidden) wake(true); });
  window.addEventListener('resize', resize);
  window.addEventListener('pagehide', event => {
    cancelAnimationFrame(frame); cancelAnimationFrame(scrollFrame); frame = scrollFrame = 0;
    if (!event.persisted) { disposed = true; tabs.disconnect(); importedModels.dispose(); }
  });
  window.addEventListener('pageshow', event => { if (event.persisted) resize(); });
  resize(); refreshControls();
})();
