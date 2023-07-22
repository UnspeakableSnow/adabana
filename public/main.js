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
camera.position.set(0, 20, 0);
const loadergltf = new GLTFLoader();
const PLmodelPath=["bibi_rj_t-pose_brawl_stars-edited.glb","bunny_grom_t-pose_brawl_stars.glb","sprout_t-pose_brawl_stars.glb","white_crow_t-pose_brawl_stars.glb","born_bad_buzz_t-pose_brawl_stars.glb"];
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
        this.startposi=PLstartPositions[this.ID]
        loadergltf.load("PLmodels/"+PLmodelPath[type], this.load.bind(this), ()=>{}, function ( error ) {console.error( error );} );
    }
    load( gltf ) {
      this.model = gltf.scene;
      this.animations = gltf.animations;
      scene.add( this.model );
      console.log(this.ID,'成功' );
    }
    setup(){
      this.mixer = new THREE.AnimationMixer(this.model);
      if(this.animations.length>1){
        console.log(this.ID,"animetion hold",this.animations.length)
        this.anime = this.mixer.clipAction(this.animations[1]);
        this.anime.setLoop(THREE.LoopRepeat);
        this.anime.play();
        console.log(this.ID,"play")
      }
      if(this.type==1){this.model.scale.set(0.017, 0.017, 0.017);}
      this.model.position.set(this.startposi[0],this.startposi[1],this.startposi[2]);
    }
}
const PLs=[new PLs_ins(0,0),new PLs_ins(1,1),new PLs_ins(2,2),new PLs_ins(3,3),new PLs_ins(4,4)]

const directionalLight = new THREE.DirectionalLight(0xFFFFFF);// 平行光源
directionalLight.position.set(1, 0.5, 1);
scene.add(directionalLight);// シーンに追加

const grand = new THREE.Mesh(new THREE.PlaneGeometry( 300,300 ),  new THREE.MeshStandardMaterial({color:0xffff88}) );
grand.rotation.x=1.5*Math.PI;
scene.add(grand);

let mouseX=0;
let mouseY=0;
let cccX=0;
// マウス座標はマウスが動いた時のみ取得できる
  document.addEventListener("mousemove", (event) => {
    mouseX = (event.pageX/ window.innerWidth-0.5)*2;
    mouseY = (event.pageY/ window.innerHeight-0.5)*2;
  });
  document.body.addEventListener('keydown',(event) => {
        if (event.key === 'w' ) {
          console.log("Wが押されました");
        }
    });
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
        if(PLs[i].model.position.y==0){
            PLs[i].setup();
        }
        if(PLs[i].mixer!=null){PLs[i].mixer.update(t_delta*3);}
        if(i==0){PLs[i].model.position.z=mouseY*10;}
    }}
    mouseX+=0.0002;
    cccX += (mouseX-cccX)*0.07;
    if(mouseX>1){cccX=-1;mouseX=-1;}
    camera.position.x = Math.sin(cccX*Math.PI) * -60;
    camera.position.z = Math.cos(cccX*Math.PI) * 60;
    camera.lookAt(new THREE.Vector3(0, 0, 0));// 原点方向を見つめる
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
