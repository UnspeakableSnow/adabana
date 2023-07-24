import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
window.addEventListener('DOMContentLoaded', init);
let width = window.innerWidth;let height = window.innerHeight;
function init() {
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#myCanvas')
});
renderer.setSize(width, height);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
camera.position.set(0, 70, -80);
const loadergltf = new GLTFLoader();
const PLmodelPath=["bibi_rj_t-pose_brawl_stars-edited.glb","bunny_grom_t-pose_brawl_stars.glb","sprout_t-pose_brawl_stars-edited.glb","white_crow_t-pose_brawl_stars-edited.glb","born_bad_buzz_t-pose_brawl_stars-edited.glb"];
const PLstartPositions=[[-5,1,0],[5,1,0],[0,1,5],[0,1,-5],[5,1,10]];
const archmodelPath=["dae_bazaar_-_lamp_seller.glb","middle_eastern_cafe_-_dae_bazaar.glb","stylized_wagon.glb"];
const light = new THREE.HemisphereLight(0x888888, 0x505000, 1.0);
scene.add(light);
let clock = new THREE.Clock();

class PLs_ins{
    constructor(ID,type){
        this.ID=ID;
        this.type=type;
        this.model = null;
        this.mixer=null;
        this.mode=null;
        this.startposi=PLstartPositions[this.ID]
        loadergltf.load("PLmodels/"+PLmodelPath[type], this.load.bind(this), ()=>{}, function ( error ) {console.error( error );} );
    }
    load( gltf ) {
      this.model = gltf.scene;
      this.animations = gltf.animations;
      scene.add( this.model );
      console.log('成功 :',this.ID);
    }
    setup(){
      this.mixer = new THREE.AnimationMixer(this.model);
      if(this.type==1){this.model.scale.set(0.017, 0.017, 0.017);}
      this.model.position.set(this.startposi[0],this.startposi[1],this.startposi[2]);
      this.modeset(0);
    }
    modeset(num) {
      this.mixer.stopAllAction();
      this.mode=num;
      if(this.animations.length<=num || num<0){return -1;}
      this.anime = this.mixer.clipAction(this.animations[num]);
      this.anime.setLoop(THREE.LoopRepeat);
      this.anime.clampWhenFinished = true;
      this.anime.play();
      // if(this.mode==2)this.modeset(0);
    }
}
// const PLs=[new PLs_ins(0,3),new PLs_ins(1,4),new PLs_ins(2,2),new PLs_ins(3,0)]
const PLs=[new PLs_ins(0,3)]

const directionalLight = new THREE.DirectionalLight(0xFFFFFF);// 平行光源
directionalLight.position.set(1, 0.5, 1);
scene.add(directionalLight);// シーンに追加

const grand = new THREE.Mesh(new THREE.PlaneGeometry( 300,300 ),  new THREE.MeshStandardMaterial({color:0xffff88}) );
grand.rotation.x=1.5*Math.PI;
scene.add(grand);

let mouseX=0;
let mouseY=0;
let cccX=0;
let wasd=[0,0,0,0];
let spacedown=false;
// マウス座標はマウスが動いた時のみ取得できる
  document.addEventListener("mousemove", (event) => {
    mouseX = (event.pageX/ window.innerWidth-0.5)*2;
    mouseY = (event.pageY/ window.innerHeight-0.5)*2;
  });
  document.body.addEventListener('keydown',(event) => {
        if (event.key=='w'){wasd[0]=1;}
        if (event.key=='a'){wasd[1]=1;}
        if (event.key=='s'){wasd[2]=1;}
        if (event.key=='d'){wasd[3]=1;}
        if (event.key==' '){spacedown=true;}  });
    document.body.addEventListener('keyup',(event) => {
          if (event.key=='w'){wasd[0]=0;}
          if (event.key=='a'){wasd[1]=0;}
          if (event.key=='s'){wasd[2]=0;}
          if (event.key=='d'){wasd[3]=0;}
          if (event.key==' '){spacedown=false;}  });
    window.addEventListener('resize',(event) => {
    width = window.innerWidth;height = window.innerHeight;
    renderer.setPixelRatio(window.devicePixelRatio);renderer.setSize(width, height);camera.aspect = width / height;
    camera.updateProjectionMatrix();
});
  tick();
  // 毎フレーム時に実行されるループイベントです
  function tick() {
    var t_delta=clock.getDelta();
    for(var i=0;i<PLs.length;i++){if(PLs[i].model!=null){
        if(PLs[i].model.position.y==0)PLs[i].setup();
        if(i==0 && PLs[i].mixer!=null){
          var wasdsum=wasd.reduce((a,b)=>a+b);
          if(wasdsum!=0 && wasdsum<3 && PLs[i].mode!=2){
            var togo= Math.PI*(wasd[0]*0+ wasd[1]*0.5+ wasd[2]*1+ wasd[3]*1.5)/ wasdsum;
            if(wasd[0]==1&& wasd[3]==1)togo=1.75*Math.PI;
            if(PLs[i].mode!=1)PLs[i].modeset(1);
            PLs[i].model.rotation.y=togo;
            PLs[i].model.position.x+=Math.sin(togo)*t_delta*20;
            PLs[i].model.position.z+=Math.cos(togo)*t_delta*20;
          }else if(PLs[i].mode==1)PLs[i].modeset(0);
          if(spacedown==true && PLs[i].mode==0)PLs[0].modeset(2);
          if(PLs[i].mode==2 && PLs[i].anime._loopCount>0)PLs[0].modeset(0);
        }
        if(PLs[i].mixer!=null)PLs[i].mixer.update(t_delta);
      }}
    mouseX+=0.0002;
    cccX += (mouseX-cccX)*0.07;
    if(mouseX>1){cccX=-1;mouseX=-1;}
    camera.lookAt(new THREE.Vector3(0, 0, 0));
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
