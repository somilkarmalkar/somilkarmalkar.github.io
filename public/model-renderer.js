import * as THREE from './vendor/three.module.min.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

// These are existing, credited artist assets. Their geometry and material colours
// remain in the original local GLBs; only framing, lighting and display are ours.
export const modelCatalog = {
  laptop: {file:'laptop.glb',label:'Laptop',yaw:1.305,pitch:.591},
  computer: {file:'computer.glb',label:'Desktop computer',yaw:2.913,pitch:.374},
  controller: {file:'controller.glb',label:'Game controller',yaw:0,pitch:.3,orientX:Math.PI/2},
  gameboy: {file:'gameboy.glb',label:'Game Boy',yaw:-.12,pitch:.06,orientY:-Math.PI/2},
  books: {file:'books.glb',label:'Books',yaw:-.15,pitch:.05},
  television: {file:'television.glb',label:'Vintage television',yaw:2.913,pitch:.374},
  headphones: {file:'headphones.glb',label:'Headphones',yaw:.1,pitch:0}
};

export function createModelRenderer(onReady) {
  let renderer, scene, camera, pivot, environment, failed=false, renderSize=0;
  const assets=new Map(), pending=new Map();
  const sampling=document.createElement('canvas');
  const sample=sampling.getContext('2d',{willReadFrequently:true});
  const loader=new GLTFLoader();
  const bayer=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];

  function initialize() {
    if(renderer||failed)return !!renderer;
    try {
      renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'low-power'});
      renderer.setPixelRatio(1);
      renderer.setClearColor(0,0);
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      renderer.toneMapping=THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure=.8;
      scene=new THREE.Scene();
      camera=new THREE.PerspectiveCamera(33,1,.05,30);
      camera.position.set(0,.05,4.7);
      camera.lookAt(0,0,0);
      pivot=new THREE.Group();scene.add(pivot);
      scene.add(new THREE.HemisphereLight(0xffffff,0x303344,.4));
      const key=new THREE.DirectionalLight(0xffffff,1.6);key.position.set(-3,4,5);scene.add(key);
      const fill=new THREE.DirectionalLight(0xbdd5ff,.4);fill.position.set(4,1,2);scene.add(fill);
      const room=new RoomEnvironment();
      const pmrem=new THREE.PMREMGenerator(renderer);
      environment=pmrem.fromScene(room,.04);
      scene.environment=environment.texture;
      scene.environmentIntensity=.5;
      room.dispose();pmrem.dispose();
      return true;
    } catch {
      failed=true;
      renderer?.dispose();renderer=null;
      onReady?.(null,'unavailable');
      return false;
    }
  }

  function prepare(kind) {
    if(assets.has(kind)||pending.has(kind)||!modelCatalog[kind]||!initialize())return;
    const config=modelCatalog[kind];
    const request=loader.loadAsync(new URL('assets/models/'+config.file,import.meta.url).href).then(gltf=>{
      const asset=gltf.scene;
      if(config.orientX)asset.rotateX(config.orientX);
      if(config.orientY)asset.rotateY(config.orientY);
      const bounds=new THREE.Box3().setFromObject(asset);
      const center=bounds.getCenter(new THREE.Vector3());
      const size=bounds.getSize(new THREE.Vector3());
      const extent=Math.max(size.x,size.y,size.z);
      if(!Number.isFinite(extent)||extent<=0)throw new Error('Empty model');
      const holder=new THREE.Group();
      asset.position.sub(center);
      holder.add(asset);holder.scale.setScalar(2/extent);
      assets.set(kind,holder);
      onReady?.(kind,'ready');
    }).catch(()=>{onReady?.(kind,'unavailable');});
    pending.set(kind,request);
  }

  function draw(ctx,{kind,x,y,radius,angle,pitch,opacity=1,cell=5}) {
    const asset=assets.get(kind),config=modelCatalog[kind];
    if(!asset||!renderer||!sample||opacity<=0)return false;
    const count=Math.max(48,Math.min(220,Math.round(radius*2/cell)));
    if(count!==renderSize){renderSize=count;renderer.setSize(count,count,false);sampling.width=sampling.height=count;}
    pivot.clear();pivot.add(asset);
    pivot.rotation.set(pitch+config.pitch,angle+config.yaw,0);
    renderer.render(scene,camera);
    sample.clearRect(0,0,count,count);
    sample.drawImage(renderer.domElement,0,0,count,count);
    const rgba=sample.getImageData(0,0,count,count).data;
    const left=Math.round((x-count*cell/2)/cell)*cell;
    const top=Math.round((y-count*cell/2)/cell)*cell;
    for(let row=0;row<count;row++)for(let col=0;col<count;col++){
      const i=(row*count+col)*4,alpha=rgba[i+3]/255;
      if(alpha<.04)continue;
      const threshold=(bayer[(row&3)*4+(col&3)]+.5)/16;
      if(alpha<threshold*.7)continue;
      const d=(threshold-.5)*9;
      const channel=n=>Math.max(0,Math.min(255,Math.round((n+d)/12)*12));
      const r=channel(rgba[i]),g=channel(rgba[i+1]),b=channel(rgba[i+2]);
      ctx.globalAlpha=opacity*Math.min(1,alpha*1.2);
      ctx.fillStyle=`rgb(${r} ${g} ${b})`;
      ctx.fillRect(left+col*cell,top+row*cell,cell-1,cell-1);
    }
    ctx.globalAlpha=1;
    return true;
  }

  function dispose(){
    const seen=new Set();
    for(const holder of assets.values())holder.traverse(object=>{
      if(object.geometry&&!seen.has(object.geometry)){seen.add(object.geometry);object.geometry.dispose();}
      for(const material of (Array.isArray(object.material)?object.material:[object.material])){
        if(!material||seen.has(material))continue;seen.add(material);
        for(const value of Object.values(material))if(value?.isTexture&&!seen.has(value)){seen.add(value);value.dispose();}
        material.dispose();
      }
    });
    environment?.dispose();renderer?.dispose();
  }
  return {prepare,draw,has:kind=>assets.has(kind),dispose};
}
