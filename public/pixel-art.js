/* Render the existing game/anime artwork as small, nearest-neighbour paintings.
   The original local files remain untouched and are the graceful fallback. */
(() => {
  'use strict';
  const cache = new Map();
  const bayer = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
  function painting(img) {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 48;
    const ctx = canvas.getContext('2d', {willReadFrequently:true});
    if (!ctx) throw new Error('Canvas unavailable');
    const scale = Math.max(32/img.naturalWidth,48/img.naturalHeight);
    const width = img.naturalWidth*scale, height = img.naturalHeight*scale;
    ctx.drawImage(img,(32-width)/2,(48-height)/2,width,height);
    const pixels = ctx.getImageData(0,0,32,48);
    for (let y=0;y<48;y++) for (let x=0;x<32;x++) {
      const offset=(y*32+x)*4, d=(bayer[(y%4)*4+x%4]-7.5)*.6;
      for(let channel=0;channel<3;channel++) {
        pixels.data[offset+channel]=Math.max(0,Math.min(255,Math.round((pixels.data[offset+channel]+d)/24)*24));
      }
    }
    ctx.putImageData(pixels,0,0);
    return canvas.toDataURL('image/png');
  }
  function apply(img) {
    if (!(img instanceof HTMLImageElement) || !img.hasAttribute('data-pixel-art') || img.dataset.pixelReady || !img.complete || !img.naturalWidth) return;
    const source=img.getAttribute('src');
    img.dataset.pixelReady='processing';
    try {
      if(!cache.has(source))cache.set(source,painting(img));
      img.dataset.pixelSource=source;
      img.src=cache.get(source);
      img.dataset.pixelReady='true';
    } catch {
      img.dataset.pixelReady='fallback';
    }
  }
  const scan = root => {
    if(root instanceof HTMLImageElement)apply(root);
    root.querySelectorAll?.('img[data-pixel-art]').forEach(apply);
  };
  document.addEventListener('load',e=>apply(e.target),true);
  new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(scan)))
    .observe(document.getElementById('main'),{childList:true,subtree:true});
  scan(document.getElementById('main'));
})();
