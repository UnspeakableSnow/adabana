import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
window.addEventListener('DOMContentLoaded', init);
let width = window.innerWidth;let height = window.innerHeight;
const socket = io();
function init() {
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#myCanvas')
});
renderer.setSize(width, height);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);

const loadergltf = new GLTFLoader();
const normloader = new THREE.TextureLoader();

// "bunny_grom_t-pose_brawl_stars.glb"
const PLmodelPath=["bibi_rj_t-pose_brawl_stars-edited.glb","sprout_t-pose_brawl_stars-edited.glb","white_crow_t-pose_brawl_stars-edited.glb","born_bad_buzz_t-pose_brawl_stars-edited.glb"];
let loadcompd=0;
const PLstartPositions=[[-7,0,0],[7,0,0],[0,0,7],[0,0,-7],[7,0,14],[7,0,-14],[-7,0,14],[-7,0,-14]];
const archmodelPath=["dae_bazaar_-_lamp_seller.glb","middle_eastern_cafe_-_dae_bazaar.glb","stylized_wagon.glb"];
const light = new THREE.HemisphereLight(0x888888, 0x505000, 1.0);
scene.add(light);
let clock = new THREE.Clock();
let gamemode=0;
let usingPL=-1;

class PLs_ins{
    constructor(ID,type){
        this.ID=ID;
        this.type=type;
        this.model = null;
        this.mixer=null;
        this.mode=null;
        this.startposi=PLstartPositions[this.ID%PLstartPositions.length];
        switch(this.type){
          case 0:
            this.hit=[Math.PI*0.5,8];
            this.power=1;
            this.MaxHP=7;
            break;
          case 1:
            this.hit=[Math.PI*0.3,7];
            this.power=3;
            this.MaxHP=5;
            break;
          case 2:
            this.hit=[Math.PI*0.06,24];
            this.power=0.5;
            this.MaxHP=5;
            break;
          case 3:
            this.hit=[Math.PI*0.5,8];
            this.power=1;
            this.MaxHP=3;
            break;
          default:
            this.hit=[Math.PI*1,3];
            this.power=1;
            this.MaxHP=2;
            break;
        }
        this.HP=this.MaxHP;
        loadergltf.load("PLmodels/"+PLmodelPath[type], this.load.bind(this), ()=>{}, function ( error ) {console.error( error );} );
    }
    load( gltf ) {
      this.model = gltf.scene;
      this.animations = gltf.animations;
      scene.add( this.model );
      console.log('成功 :',this.ID);
      loadcompd+=1;
    }
    setup(){
      this.mixer = new THREE.AnimationMixer(this.model);
      this.model.position.set(this.startposi[0],this.startposi[1],this.startposi[2]);
      this.modeset(0);
      this.HPbar= new THREE.Mesh(new THREE.PlaneGeometry(5,1), new THREE.MeshBasicMaterial( {color: 0x00ff00, side: THREE.DoubleSide}));
      scene.add( this.HPbar );
      this.startposi=null;
    }
    modeset(num) {
      if(!this.mixer || this.mode==num) return -1;
      this.mixer.stopAllAction();
      this.mode=num;
      if(this.ID==usingPL) socket.emit('modechange',[this.mode,this.model.rotation.y]);
      if(this.animations.length<=num || num<0){return -1;}
      this.anime = this.mixer.clipAction(this.animations[num]);
      this.anime.setLoop(THREE.LoopRepeat);
      this.anime.clampWhenFinished = true;
      this.anime.play();
    }
    update(movto){
      if(!this.model) return -1;
      if(this.startposi)this.setup();
      if(this.anime && this.mode==2 && this.anime._loopCount>0)this.modeset(0);
      if(this.ID==usingPL && movto && this.mode!=2){
        this.model.rotation.y=movto[0];
        this.model.position.x+=movto[1];
        this.model.position.z+=movto[2];
        if(this.mode!=1)this.modeset(1);
      }else if(this.ID==usingPL && this.mode==1)this.modeset(0);
      if(this.HP<0)this.HP=0;
      this.HPbar.scale.x=this.HP/this.MaxHP;
      this.HPbar.position.set(this.model.position.x+2*(this.MaxHP-this.HP)/this.MaxHP,this.model.position.y+10,this.model.position.z);
    }
    attack(mouseX,mouseY){
      if(!this.model || this.mode!=0) return -1;
      var phi = Math.atan2(-mouseX,-mouseY);
      this.model.rotation.y=phi;
      this.modeset(2);
      for(var i=0;i<PLs.length;i++){
        if(!PLs[i].model || i==this.ID) continue;
        var disx=PLs[i].model.position.x-this.model.position.x;
        var disz=PLs[i].model.position.z-this.model.position.z;
        var rad=Math.sqrt(disx*disx+disz*disz);
        var tagphi=Math.atan2(disx,disz);
        if(Math.abs(tagphi-phi)<this.hit[0] && rad<this.hit[1]){PLs[i].HP-=this.power;}
      }
    }
}
class arch_ins{
  constructor(ID,type){
      this.ID=ID;
      this.type=type;
      this.model = null;
      if(this.type<2)this.startposi=[(Math.random()-0.5)*150,7,(Math.random()-0.5)*150];
      else this.startposi=[Math.random()*100,0,Math.random()*100];
      loadergltf.load("archmodels/"+archmodelPath[type], this.load.bind(this), ()=>{}, function ( error ) {console.error( error );} );
  }
  load( gltf ) {
    this.model = gltf.scene;
    scene.add( this.model );
    this.model.position.set(this.startposi[0],this.startposi[1],this.startposi[2]);
    this.model.scale.set(4,4,4);
    this.model.rotation.y=Math.PI;
    console.log('arch成功 :',this.ID);
  }
}
let PLs=[];
let archs=null;
let setupPL=null;

function cameraset(track=null){
  switch(Number(gamemode)){
    case 0:
      camera.position.set(0,-100,0);
      camera.lookAt(0,-100,-2);
      break;
    case 1:
      if(!PLs[track].model)return -1;
      var trackmodel= PLs[track].model
      camera.position.set(trackmodel.position.x,60,trackmodel.position.z-80);
      camera.lookAt(trackmodel.position.x,trackmodel.position.y,trackmodel.position.z);
      if(track==usingPL){
      var phi= Math.atan2(-mouseX,-mouseY);
      if(PLs[usingPL].model)
        mousepoint.position.set(trackmodel.position.x+PLs[usingPL].hit[1]*Math.sin(phi),
        1,trackmodel.position.z+PLs[usingPL].hit[1]*Math.cos(phi));}
      break;
  }
}

const directionalLight = new THREE.DirectionalLight(0xFFFFFF);// 平行光源
directionalLight.position.set(1, 0.5, 1);
scene.add(directionalLight);

const grand = new THREE.Mesh(new THREE.PlaneGeometry( 300,300 ),  new THREE.MeshStandardMaterial({color:0xffff88}) );
grand.rotation.x=1.5*Math.PI;
scene.add(grand);

const mousepoint_texture = normloader.load('other_sozai/mousepoint.png');
const mousepoint = new THREE.Mesh(new THREE.PlaneGeometry( 3,3 ),  new THREE.MeshStandardMaterial({map:mousepoint_texture, transparent: true}) );
mousepoint.rotation.x=1.5*Math.PI;
mousepoint.position.y=0.1;
scene.add(mousepoint);

const titlewallpic = normloader.load('other_sozai/titlewall.png');
const titlewall = new THREE.Mesh(new THREE.PlaneGeometry( 5,5 ),  new THREE.MeshStandardMaterial({map:titlewallpic}) );
titlewall.position.set(0,-100,-10);
scene.add(titlewall);
cameraset();
const loadingbar= new THREE.Mesh(new THREE.PlaneGeometry(4,0.01), 
  new THREE.MeshBasicMaterial( {color: 0xff0000, side: THREE.DoubleSide}));
loadingbar.position.set(0,-102,-9.9);
loadingbar.scale.x=0;
scene.add(loadingbar);
renderer.render(scene, camera);

let mouseX=0;
let mouseY=0;
let wasd=[0,0,0,0];
let mousedown=false;
document.addEventListener("mousemove", (event) => {
  mouseX = event.pageX-0.5*window.innerWidth;
  mouseY = event.pageY-0.5*window.innerHeight;  });
document.addEventListener("mousedown", (event) => {mousedown=true;});
document.addEventListener("mouseup", (event) => {mousedown=false;});
document.body.addEventListener('keydown',(event) => {
  if (event.key=='w'){wasd[0]=1;}
  if (event.key=='a'){wasd[1]=1;}
  if (event.key=='s'){wasd[2]=1;}
  if (event.key=='d'){wasd[3]=1;}  });
document.body.addEventListener('keyup',(event) => {
  if (event.key=='w'){wasd[0]=0;}
  if (event.key=='a'){wasd[1]=0;}
  if (event.key=='s'){wasd[2]=0;}
  if (event.key=='d'){wasd[3]=0;}  });
window.addEventListener('resize',(event) => {
  width = window.innerWidth;height = window.innerHeight;
  renderer.setPixelRatio(window.devicePixelRatio);renderer.setSize(width, height);camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

socket.on('reqType', ()=>{socket.emit('setType', Number(prompt('キャラクターを選択')));});
socket.on('adopt', (setupdata)=>{
  usingPL=setupdata[0];
  setupPL=setupdata[1];
  cameraset();
  gamemode=0.1;
});
socket.on('downdate', (loc)=>{
  if(PLs.length<=loc[1] || !PLs[loc[1]].model) return -1;
  PLs[loc[1]].modeset(loc[3]);
  if(loc[5])PLs[loc[1]].model.position.set(loc[5][0],loc[5][1],loc[5][2]);
  if(loc[6]!=null)PLs[loc[1]].model.rotation.y=loc[6];
  // console.log(loc[1],loc[6],PLs[loc[1]].model.rotation.y);
});

tick();
function tick() {
  var t_delta=clock.getDelta();
  // console.log(usingPL)

  switch(gamemode){
  case 0:
    cameraset();
    loadingbar.scale.x=0.1;
    break;
  case 0.1:
    loadingbar.scale.x=0.2+0.8*loadcompd/setupPL.length;

    if(PLs.length==0)for(var i=0;i<setupPL.length;i++){
      if(setupPL[i][2]!=-1) PLs.push(new PLs_ins(setupPL[i][1],setupPL[i][2]));
    }
    // if(!archs)archs=[new arch_ins(0,0),new arch_ins(1,1),new arch_ins(2,2)];
    if(loadcompd==setupPL.length)gamemode=1;
    break;

  case 1:
    var wasdsum=wasd.reduce((a,b)=>a+b);
    var togo= Math.PI*(wasd[0]*0+ wasd[1]*0.5+ wasd[2]*1+ wasd[3]*1.5)/ wasdsum;
    if(wasd[0]==1&& wasd[3]==1)togo=1.75*Math.PI;
    for(var i=0;i<PLs.length;i++){
      if(i==usingPL && wasdsum!=0 && wasdsum<3){
        PLs[i].update([togo,Math.sin(togo)*t_delta*50, Math.cos(togo)*t_delta*50]);
        socket.emit('move',[[PLs[i].model.position.x,PLs[i].model.position.y,PLs[i].model.position.z],PLs[i].model.rotation.y]);
      }else if(i==usingPL && mousedown==true) PLs[i].attack(mouseX,mouseY);
      else{
        PLs[i].update(null); //ここに他キャラクターの挙動を設定
      }
      if(PLs[i].mixer!=null){
        PLs[i].mixer.update(t_delta);
        if(PLs[i].mode==2)PLs[i].mixer.update(t_delta);}
    }
    cameraset(usingPL);
    break;
  }
  renderer.render(scene, camera);// レンダリング
  requestAnimationFrame(tick);
}
}

// "Bibi RJ t-pose Brawl Stars" (https://skfb.ly/oHI6z) by shertiku is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
// "Bunny Grom t-pose Brawl Stars" (https://skfb.ly/oHJFO) by shertiku is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
// "White Crow t-pose Brawl Stars" (https://skfb.ly/oIqZY) by shertiku is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
// "Sprout t-pose Brawl Stars" (https://skfb.ly/oHRPH) by shertiku is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
// "Born Bad Buzz t-pose Brawl Stars" (https://skfb.ly/oItru) by shertiku is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).

// "DAE Bazaar - Lamp Seller" (https://skfb.ly/oIAF8) by March Gutman is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
// "Stylized wagon" (https://skfb.ly/oEYx8) by Irina Kostina is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
// "Middle eastern cafe - DAE Bazaar" (https://skfb.ly/oIyZU) by Petru Grati is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
