/* Original procedural sculptures rendered on the background's own dither grid. */
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
  const STEP = .028;
  const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const palettes = {
    dark: ['#08090b', '#11192d', '#1b2b50', '#29467e', '#4267aa', '#7799cc', '#b6cee7'],
    dim: ['#17191d', '#202837', '#2a3c57', '#3a557a', '#59769c', '#8da5c2', '#c0d1e0'],
    light: ['#f0ede6', '#e6e0d5', '#d5ccbd', '#bcb6aa', '#959ba0', '#6c7d91', '#425e7e']
  };
  const labels = {
    atom: 'Floating atom', chip: 'Floating microchip', controller: 'Floating game controller',
    star: 'Floating anime star', clapper: 'Floating film clapperboard',
    headphones: 'Floating headphones', cap: 'Floating graduation cap', envelope: 'Floating envelope'
  };
  const models = new Map();
  let width = 1, height = 1, cols = 1, rows = 1, cells = new Float32Array(1);
  let depths = new Float32Array(1), lights = new Float32Array(1), palette = palettes.dark;
  let scene = { x: 0, y: 0, radius: 0, visible: false };
  let current = '', previousModel = '', changedAt = 0, changeDuration = 0;
  let frame = 0, lastFrame = 0, time = 0, yaw = -.33, pitch = -.22, spin = 0;
  let dragging = false, dragId = null, lastX = 0, lastY = 0, distance = 0;
  let motion = true, pixels = true, disposed = false;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0, power: 0, target: 0, ready: false, last: 0 };
  let ripples = [];
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

  // Surface samples, rather than a high-resolution image, keep every model native to the pixel field.
  function geometry(kind) {
    if (models.has(kind)) return models.get(kind);
    const out = [];
    const add = (x, y, z, nx, ny, nz, tone = 1, roll = 0, cx = 0, cy = 0, cz = 0) => {
      const c = Math.cos(roll), s = Math.sin(roll);
      out.push(cx + x * c - y * s, cy + x * s + y * c, cz + z, nx * c - ny * s, nx * s + ny * c, nz, tone);
    };
    const box = (cx, cy, cz, sx, sy, sz, tone = 1, roll = 0) => {
      const sizes = [sx, sy, sz];
      for (let axis = 0; axis < 3; axis++) for (const sign of [-1, 1]) {
        const a = (axis + 1) % 3, b = (axis + 2) % 3;
        const na = Math.max(1, Math.ceil(sizes[a] / STEP)), nb = Math.max(1, Math.ceil(sizes[b] / STEP));
        for (let ia = 0; ia <= na; ia++) for (let ib = 0; ib <= nb; ib++) {
          const p = [0, 0, 0], n = [0, 0, 0];
          p[axis] = sign * sizes[axis] / 2; p[a] = (ia / na - .5) * sizes[a]; p[b] = (ib / nb - .5) * sizes[b]; n[axis] = sign;
          add(...p, ...n, tone, roll, cx, cy, cz);
        }
      }
    };
    const ellipsoid = (cx, cy, cz, rx, ry, rz, tone = 1, roll = 0) => {
      const nu = Math.max(16, Math.ceil(Math.PI * Math.max(rx, ry, rz) / STEP));
      const nv = nu * 2;
      for (let u = 0; u <= nu; u++) {
        const a = Math.PI * u / nu, sa = Math.sin(a), ca = Math.cos(a);
        for (let v = 0; v < nv; v++) {
          const b = Math.PI * 2 * v / nv, cb = Math.cos(b), sb = Math.sin(b);
          const nx = sa * cb / rx, ny = ca / ry, nz = sa * sb / rz, length = Math.hypot(nx, ny, nz);
          add(rx * sa * cb, ry * ca, rz * sa * sb, nx / length, ny / length, nz / length, tone, roll, cx, cy, cz);
        }
      }
    };
    const ring = (radius, tube, tiltX = 0, tiltY = 0, start = 0, end = Math.PI * 2, tone = 1, cy = 0) => {
      const nu = Math.ceil((end - start) * radius / STEP), nv = Math.max(8, Math.ceil(Math.PI * 2 * tube / STEP));
      const cx = Math.cos(tiltX), sx = Math.sin(tiltX), cyaw = Math.cos(tiltY), syaw = Math.sin(tiltY);
      const transform = (x, y, z) => { const yy = y * cx - z * sx, zz = y * sx + z * cx; return [x * cyaw + zz * syaw, yy, -x * syaw + zz * cyaw]; };
      for (let u = 0; u <= nu; u++) for (let v = 0; v < nv; v++) {
        const a = start + (end - start) * u / nu, b = Math.PI * 2 * v / nv;
        const nx = Math.cos(a) * Math.cos(b), ny = Math.sin(a) * Math.cos(b), nz = Math.sin(b);
        const p = transform((radius + tube * Math.cos(b)) * Math.cos(a), (radius + tube * Math.cos(b)) * Math.sin(a), tube * Math.sin(b));
        const n = transform(nx, ny, nz);
        add(p[0], p[1] + cy, p[2], ...n, tone);
      }
    };
    const triangle = (a, b, c, tone = 1) => {
      const ab = b.map((n, i) => n - a[i]), ac = c.map((n, i) => n - a[i]);
      const normal = [ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0]];
      const length = Math.hypot(...normal); normal.forEach((n, i) => normal[i] = n / length);
      const steps = Math.ceil(Math.max(Math.hypot(...ab), Math.hypot(...ac)) / STEP);
      for (let u = 0; u <= steps; u++) for (let v = 0; v <= steps - u; v++) {
        const p = a.map((n, i) => n + ab[i] * u / steps + ac[i] * v / steps);
        add(...p, ...normal, tone);
      }
    };

    if (kind === 'controller') {
      ellipsoid(0, -.08, 0, 1.23, .55, .33, .86);
      ellipsoid(-.88, .33, -.015, .38, .72, .33, .86, .32);
      ellipsoid(.88, .33, -.015, .38, .72, .33, .86, -.32);
      box(-.68, -.13, .315, .52, .15, .14, .35); box(-.68, -.13, .32, .15, .52, .14, .35);
      for (const [x, y] of [[.7, -.37], [.94, -.14], [.7, .09], [.46, -.14]]) ellipsoid(x, y, .335, .095, .095, .09, 1.2);
      ellipsoid(-.35, .31, .34, .17, .17, .12, .43); ellipsoid(.35, .31, .34, .17, .17, .12, .43);
      box(-.16, -.1, .35, .14, .055, .07, 1.15); box(.16, -.1, .35, .14, .055, .07, 1.15);
      box(-.75, -.57, -.03, .55, .13, .25, .48); box(.75, -.57, -.03, .55, .13, .25, .48);
    } else if (kind === 'atom') {
      ring(1.15, .043, .9, .2, 0, Math.PI * 2, .95);
      ring(1.15, .043, -.65, .75, 0, Math.PI * 2, 1.05);
      ring(1.15, .043, .2, -1, 0, Math.PI * 2, .85);
      ellipsoid(-.11, -.03, .06, .23, .23, .23, 1.2); ellipsoid(.14, .08, -.03, .23, .23, .23, .85);
      ellipsoid(.85, -.68, -.06, .13, .13, .13, 1.25); ellipsoid(-.85, .53, .25, .13, .13, .13, 1.25);
    } else if (kind === 'chip') {
      box(0, 0, 0, 1.65, 1.55, .3, .78); box(0, 0, .18, 1.14, 1.04, .1, 1.12);
      for (let i = -4; i <= 4; i++) for (const sign of [-1, 1]) {
        box(sign * 1.02, i * .17, -.015, .41, .07, .1, .88);
        box(i * .17, sign * .98, -.015, .07, .41, .1, .88);
      }
      box(-.25, -.23, .25, .37, .07, .035, .42); box(.22, -.23, .25, .25, .07, .035, .42);
      box(0, .03, .25, .85, .07, .035, .42); box(-.1, .29, .25, .65, .07, .035, .42);
    } else if (kind === 'clapper') {
      box(0, .2, 0, 2, 1.28, .3, .78);
      box(0, -.65, 0, 2.13, .32, .38, .4);
      box(-.02, -.99, -.02, 2.13, .3, .32, .9, -.14);
      for (let i = -2; i <= 2; i++) {
        box(i * .39, -.65, .205, .17, .30, .045, 1.2, -.36);
        box(i * .39 - .03, -.99 - i * .055, .17, .17, .28, .04, .38, -.5);
      }
      box(-.13, .04, .18, 1.4, .045, .035, 1.15); box(-.34, .29, .18, .96, .045, .035, 1.15);
      box(-.04, .53, .18, 1.56, .045, .035, 1.15);
    } else if (kind === 'headphones') {
      ring(1.02, .145, 0, 0, Math.PI, Math.PI * 2, .97, -.02);
      box(-1.01, .05, 0, .15, .6, .19, .75); box(1.01, .05, 0, .15, .6, .19, .75);
      ellipsoid(-1.04, .45, .04, .31, .56, .35, .93); ellipsoid(1.04, .45, .04, .31, .56, .35, .93);
      ellipsoid(-.84, .45, .04, .1, .43, .3, .42); ellipsoid(.84, .45, .04, .1, .43, .3, .42);
    } else if (kind === 'cap') {
      ellipsoid(0, .14, 0, .72, .48, .65, .74);
      box(0, -.36, 0, 1.95, .13, 1.95, 1.08);
      ellipsoid(0, -.47, 0, .09, .06, .09, 1.2);
      box(.74, -.27, .76, .055, .58, .055, 1.15);
      ellipsoid(.74, .13, .76, .09, .21, .09, 1.2);
    } else if (kind === 'envelope') {
      box(0, 0, 0, 2.2, 1.45, .22, .95);
      box(-.49, -.18, .14, 1.25, .045, .035, .4, .54);
      box(.49, -.18, .14, 1.25, .045, .035, .4, -.54);
      box(-.61, .37, .14, 1.03, .04, .035, .58, -.52);
      box(.61, .37, .14, 1.03, .04, .035, .58, .52);
    } else {
      const outline = Array.from({ length: 10 }, (_, i) => {
        const angle = -Math.PI / 2 + i * Math.PI / 5, radius = i % 2 ? .5 : 1.18;
        return [Math.cos(angle) * radius, Math.sin(angle) * radius];
      });
      for (let i = 0; i < outline.length; i++) {
        const p = outline[i], q = outline[(i + 1) % outline.length];
        triangle([0, 0, .34], [...p, .04], [...q, .04], i % 2 ? .85 : 1.15);
        triangle([0, 0, -.19], [...q, -.04], [...p, -.04], .72);
        triangle([...p, .04], [...p, -.04], [...q, .04], .7);
        triangle([...q, .04], [...p, -.04], [...q, -.04], .7);
      }
    }
    let extent = 1;
    for (let i = 0; i < out.length; i += 7) extent = Math.max(extent, Math.abs(out[i]), Math.abs(out[i + 1]), Math.abs(out[i + 2]));
    const points = new Float32Array(out);
    for (let i = 0; i < points.length; i += 7) for (let j = 0; j < 3; j++) points[i + j] /= extent;
    models.set(kind, points);
    return points;
  }

  function contextModel() {
    const page = document.body.dataset.page;
    if (page === 'work') {
      if (scrollY < 32) return 'atom';
      let selected = 'atom';
      const focus = height * .4;
      for (const [id, kind] of [['projects', 'chip'], ['experience', 'cap'], ['contact', 'envelope']]) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= focus) selected = kind;
      }
      return selected;
    }
    if (page === 'personal') {
      const category = document.querySelector('[data-feature-tab][aria-selected="true"]')?.dataset.featureTab;
      return category === 'anime' ? 'star' : category === 'shows' ? 'clapper' : 'controller';
    }
    if (page === 'watchlist') return document.querySelector('[data-watch-tab="shows"][aria-selected="true"]') ? 'clapper' : 'star';
    return { games: 'controller', music: 'headphones', resume: 'cap' }[page] || 'atom';
  }

  function selectModel() {
    const next = contextModel();
    if (next === current) return;
    previousModel = current; current = next; changedAt = performance.now();
    changeDuration = active() && root.dataset.input !== 'keyboard' ? 240 : 0;
    geometry(next);
    canvas.dataset.model = stage.dataset.model = next;
    handle.setAttribute('aria-label', labels[next] + ': drag to turn, or use Enter and arrow keys');
    wake(true);
  }

  function buildBackground() {
    palette = palettes[root.dataset.theme] || palettes.dark;
    bg.clearRect(0, 0, width, height);
    const reading = main.getBoundingClientRect();
    const light = root.dataset.theme === 'light';
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const nx = x / cols, ny = y / rows;
      const glow = Math.pow(Math.max(0, 1 - Math.hypot((nx - 1.03) * 1.18, (ny - 1.06)) / 1.11), 1.7) * .81;
      const sweep = Math.pow(Math.max(0, 1 - Math.hypot((nx - .57) * 1.1, (ny - 1.36) * 1.65) / .82), 2) * .28;
      const quiet = x * CELL > reading.left - 24 && x * CELL < reading.right + 18 ? .58 : 1;
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
  }

  function drawObject(kind, opacity, angle) {
    if (!scene.visible || opacity <= 0) return;
    depths.fill(-Infinity); lights.fill(0);
    const points = geometry(kind), ca = Math.cos(angle), sa = Math.sin(angle), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const scale = scene.radius * .86;
    for (let i = 0; i < points.length; i += 7) {
      const x = points[i] * ca + points[i + 2] * sa, z = -points[i] * sa + points[i + 2] * ca;
      const y = points[i + 1] * cp - z * sp, zz = points[i + 1] * sp + z * cp;
      const nx = points[i + 3] * ca + points[i + 5] * sa, nz = -points[i + 3] * sa + points[i + 5] * ca;
      const ny = points[i + 4] * cp - nz * sp, nzz = points[i + 4] * sp + nz * cp;
      if (nzz < -.08) continue;
      const perspective = 4.2 / (4.2 - zz);
      const px = Math.floor((scene.x + x * scale * perspective) / CELL), py = Math.floor((scene.y + y * scale * perspective) / CELL);
      if (px < 0 || py < 0 || px >= cols || py >= rows) continue;
      const cell = py * cols + px;
      if (zz <= depths[cell]) continue;
      depths[cell] = zz;
      const diffuse = Math.max(0, -.42 * nx - .6 * ny + .69 * nzz);
      const shine = Math.pow(Math.max(0, -.25 * nx - .3 * ny + .91 * nzz), 13);
      lights[cell] = clamp(cells[cell] * .29 + (.24 + diffuse * .57 + shine * .12) * points[i + 6], .06, .98);
    }
    const x0 = Math.max(0, Math.floor((scene.x - scene.radius * 1.3) / CELL));
    const x1 = Math.min(cols - 1, Math.ceil((scene.x + scene.radius * 1.3) / CELL));
    const y0 = Math.max(0, Math.floor((scene.y - scene.radius * 1.3) / CELL));
    const y1 = Math.min(rows - 1, Math.ceil((scene.y + scene.radius * 1.3) / CELL));
    ctx.globalAlpha = opacity;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const cell = y * cols + x;
      if (depths[cell] === -Infinity) continue;
      ctx.fillStyle = palette[quantize(lights[cell], x, y)];
      ctx.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1);
    }
    ctx.globalAlpha = 1;
  }

  function drawPointer(now) {
    const moving = pointer.power > .005;
    if (!moving && !ripples.length) return;
    const radius = 125;
    const x0 = Math.max(0, Math.floor((pointer.x - radius - 20) / CELL)), x1 = Math.min(cols - 1, Math.ceil((pointer.x + radius + 20) / CELL));
    const y0 = Math.max(0, Math.floor((pointer.y - radius - 20) / CELL)), y1 = Math.min(rows - 1, Math.ceil((pointer.y + radius + 20) / CELL));
    if (moving) {
      ctx.save(); ctx.beginPath(); ctx.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2); ctx.clip(); ctx.clearRect(0, 0, width, height);
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const px = x * CELL + CELL / 2, py = y * CELL + CELL / 2;
        const dx = px - pointer.x, dy = py - pointer.y, distance = Math.hypot(dx, dy) || 1;
        const force = Math.pow(Math.max(0, 1 - distance / radius), 2) * pointer.power;
        const color = quantize(cells[y * cols + x] + force * .13, x, y);
        const shift = force * 18 / distance;
        ctx.fillStyle = color ? palette[color] : 'rgba(185,204,236,.045)';
        const size = color ? CELL - 1 : 1;
        ctx.fillRect(Math.round(px - size / 2 + dx * shift), Math.round(py - size / 2 + dy * shift), size, size);
      }
      ctx.restore();
    }
    ripples = ripples.filter(r => now - r.born < 850);
    for (const ripple of ripples) {
      const progress = (now - ripple.born) / 850, reach = 15 + progress * 210, fade = Math.pow(1 - progress, 2);
      const minX = Math.max(0, Math.floor((ripple.x - reach - 10) / CELL)), maxX = Math.min(cols - 1, Math.ceil((ripple.x + reach + 10) / CELL));
      const minY = Math.max(0, Math.floor((ripple.y - reach - 10) / CELL)), maxY = Math.min(rows - 1, Math.ceil((ripple.y + reach + 10) / CELL));
      for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
        const wave = Math.max(0, 1 - Math.abs(Math.hypot(x * CELL - ripple.x, y * CELL - ripple.y) - reach) / 12) * fade;
        if (!wave) continue;
        ctx.globalAlpha = wave * .5; ctx.fillStyle = palette[4]; ctx.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1);
      }
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
        pointer.vx += (pointer.tx - pointer.x) * 100 * dt; pointer.vy += (pointer.ty - pointer.y) * 100 * dt;
        const damping = Math.exp(-10 * dt); pointer.vx *= damping; pointer.vy *= damping;
        pointer.x += pointer.vx * dt; pointer.y += pointer.vy * dt;
      }
      const target = now - pointer.last < 700 ? pointer.target : 0;
      pointer.power += (target - pointer.power) * (1 - Math.exp(-10 * dt));
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
    if (elapsed >= 32) { draw(now, elapsed); lastFrame = now; }
    if (active() && pixels) frame = requestAnimationFrame(tick);
  }
  function wake(immediate = false) {
    if (disposed) return;
    if (immediate || !active()) draw(performance.now());
    if (!frame && active() && pixels && !document.hidden) { lastFrame = performance.now() - 33; frame = requestAnimationFrame(tick); }
  }
  function clearPointer() {
    pointer.power = pointer.target = pointer.vx = pointer.vy = 0; pointer.ready = false; ripples = [];
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
    cells = new Float32Array(cols * rows); depths = new Float32Array(cols * rows); lights = new Float32Array(cols * rows);
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
  window.addEventListener('pointerdown', event => {
    if (active() && pixels && finePointer.matches && !event.target.closest('a,button,input,select,dialog,[role="button"]')) {
      ripples.push({ x: event.clientX, y: event.clientY, born: performance.now() });
      if (ripples.length > 3) ripples.shift(); wake();
    }
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
    if (!event.persisted) { disposed = true; tabs.disconnect(); }
  });
  window.addEventListener('pageshow', event => { if (event.persisted) resize(); });
  resize(); refreshControls();
})();
