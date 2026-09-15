/* ── Tile columns ── */
['tcl1','tcl2','tcr2','tcr1'].forEach(function(id,ci){
  var el=document.getElementById(id),n=[10,8,8,10][ci];
  for(var i=0;i<n;i++){var d=document.createElement('div');d.className='tile';el.appendChild(d);}
});

/* ── Waitlist counter (seeds once per browser) ── */
var base=1247;
try{
  var stored=localStorage.getItem('cv_wl');
  if(!stored){stored=base+Math.floor(Math.random()*12);localStorage.setItem('cv_wl',stored);}
  document.getElementById('cnt').textContent=Number(stored).toLocaleString();
}catch(e){}

/* ────────────────────────────────────────────
   COUNTDOWN
   Reads the launch date from localStorage key
   "cv_launch_target" (set via settings.html).
   Falls back to October 20, 2026 if nothing is set.
────────────────────────────────────────────*/
var DEFAULT_LAUNCH = '2026-10-20T00:00:00';

function pad2(n){ return String(n).padStart(2,'0'); }

function getLaunchDate(){
  try{
    var stored = localStorage.getItem('cv_launch_target');
    if (stored){
      var d = new Date(stored);
      if (!isNaN(d.getTime())) return d;
    }
  }catch(e){}
  return new Date(DEFAULT_LAUNCH);
}

function updateCountdown(){
  var target = getLaunchDate();
  var diff = target.getTime() - Date.now();
  if (diff < 0) diff = 0;
  var d = Math.floor(diff / 86400000);
  var h = Math.floor((diff % 86400000) / 3600000);
  var m = Math.floor((diff % 3600000) / 60000);
  var s = Math.floor((diff % 60000) / 1000);
  document.getElementById('cd-d').textContent = pad2(d);
  document.getElementById('cd-h').textContent = pad2(h);
  document.getElementById('cd-m').textContent = pad2(m);
  document.getElementById('cd-s').textContent = pad2(s);
}
updateCountdown();
setInterval(updateCountdown, 1000);

/* ── Globe (Three.js) ── */
function initGlobe(){
  var W=window.innerWidth,H=window.innerHeight;
  var canvas=document.getElementById('globe-canvas');
  canvas.width=W;canvas.height=H;

  var scene=new THREE.Scene();
  var camera=new THREE.PerspectiveCamera(45,W/H,0.1,1000);
  camera.position.z=2.5;

  var renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(W,H);
  renderer.setClearColor(0x000000,0);

  var globe=new THREE.Group();
  scene.add(globe);

  var loader=new THREE.TextureLoader();
  loader.crossOrigin='anonymous';

  var BASE='https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/';

  var earthTex  =loader.load(BASE+'earth_atmos_2048.jpg');
  var normalTex =loader.load(BASE+'earth_normal_2048.jpg');
  var specTex   =loader.load(BASE+'earth_specular_2048.jpg');
  var cloudTex  =loader.load(BASE+'earth_clouds_1024.png');

  var earthGeo=new THREE.SphereGeometry(1,64,32);
  var earthMat=new THREE.MeshPhongMaterial({
    map:earthTex,
    normalMap:normalTex,
    normalScale:new THREE.Vector2(0.85,0.85),
    specularMap:specTex,
    specular:new THREE.Color(0x2266aa),
    shininess:18,
  });
  var earthMesh=new THREE.Mesh(earthGeo,earthMat);
  globe.add(earthMesh);

  var cloudGeo=new THREE.SphereGeometry(1.008,64,32);
  var cloudMat=new THREE.MeshPhongMaterial({
    map:cloudTex,
    transparent:true,
    opacity:0.42,
    depthWrite:false,
  });
  var cloudMesh=new THREE.Mesh(cloudGeo,cloudMat);
  globe.add(cloudMesh);

  function addAtmo(radius,opacity,color,side){
    var g=new THREE.SphereGeometry(radius,64,32);
    var m=new THREE.MeshBasicMaterial({color:color,transparent:true,opacity:opacity,side:side||THREE.BackSide});
    scene.add(new THREE.Mesh(g,m));
  }
  addAtmo(1.035,0.16,0x4488ff,THREE.BackSide);
  addAtmo(1.08, 0.09,0x3366cc,THREE.BackSide);
  addAtmo(1.18, 0.04,0x224488,THREE.BackSide);
  addAtmo(1.30, 0.018,0x112244,THREE.BackSide);

  var rimGeo=new THREE.SphereGeometry(1.01,64,32);
  var rimMat=new THREE.MeshBasicMaterial({color:0x3399ff,transparent:true,opacity:0.06,side:THREE.FrontSide});
  globe.add(new THREE.Mesh(rimGeo,rimMat));

  var sun=new THREE.DirectionalLight(0xffffff,1.1);
  sun.position.set(5,3,5);
  scene.add(sun);

  var fill=new THREE.DirectionalLight(0x112244,0.2);
  fill.position.set(-5,-2,-3);
  scene.add(fill);

  scene.add(new THREE.AmbientLight(0x111122,0.4));

  var starPos=new Float32Array(3000*3);
  for(var i=0;i<3000;i++){
    var r=80+Math.random()*120;
    var theta=Math.random()*Math.PI*2;
    var phi=Math.acos(2*Math.random()-1);
    starPos[i*3]=r*Math.sin(phi)*Math.cos(theta);
    starPos[i*3+1]=r*Math.sin(phi)*Math.sin(theta);
    starPos[i*3+2]=r*Math.cos(phi);
  }
  var starGeo=new THREE.BufferGeometry();
  starGeo.setAttribute('position',new THREE.BufferAttribute(starPos,3));
  var starMat=new THREE.PointsMaterial({color:0xffffff,size:0.25,transparent:true,opacity:0.55});
  scene.add(new THREE.Points(starGeo,starMat));

  globe.rotation.x=0.3;
  globe.rotation.y=0.5;

  function onResize(){
    W=window.innerWidth;H=window.innerHeight;
    camera.aspect=W/H;camera.updateProjectionMatrix();
    renderer.setSize(W,H);
    var sc=W<520?0.62:W<768?0.79:1;
    globe.scale.setScalar(sc);
  }
  window.addEventListener('resize',onResize);onResize();

  var mx=0,my=0;
  window.addEventListener('mousemove',function(e){
    mx=(e.clientX/W-0.5)*0.28;
    my=(e.clientY/H-0.5)*0.18;
  });

  function animate(){
    requestAnimationFrame(animate);
    earthMesh.rotation.y+=0.0014;
    cloudMesh.rotation.y+=0.0018;
    globe.rotation.x+=(0.3+my-globe.rotation.x)*0.04;
    globe.rotation.z+=(-0.02+mx-globe.rotation.z)*0.04;
    renderer.render(scene,camera);
  }
  animate();
}

/* Load Three.js from CDN with SRI, fallback to gradient background */
(function(){
  var script=document.createElement('script');
  script.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  script.integrity='sha384-CI3ELBVUz9XQO+97x6nwMDPosPR5XvsxW2ua7N1Xeygeh1IxtgqtCkGfQY9WWdHu';
  script.crossOrigin='anonymous';
  script.onload=function(){ initGlobe(); };
  script.onerror=function(){
    document.getElementById('globe-fallback').style.display='block';
  };
  document.head.appendChild(script);
})();
