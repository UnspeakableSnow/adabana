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
camera.position.set(0, 60, 0);
const loadergltf = new GLTFLoader();
const PLmodelPath=["PLmodels/bibi_rj_t-pose_brawl_stars.glb","PLmodels/bunny_grom_t-pose_brawl_stars.glb","PLmodels/sprout_t-pose_brawl_stars.glb","PLmodels/white_crow_t-pose_brawl_stars.glb"]
const PLstartPositions=[[-10,1,0],[10,1,0],[0,1,30],[0,1,-30]]
const light = new THREE.HemisphereLight(0x888888, 0x505000, 1.0);
scene.add(light);

class PLs_ins{
    constructor(ID,type){
        this.ID=ID;
        this.model = null;
        this.mixer=null;
        this.startposi=PLstartPositions[this.ID]
        loadergltf.load(PLmodelPath[type], this.load.bind(this), ()=>{}, function ( error ) {console.error( error );} );
    }
    load( gltf ) {
        this.model = gltf.scene;
        scene.add( this.model );
        console.log(this.ID,'成功' );
    }
    setup(){
        if(this.ID==1){this.model.scale.set(0.02, 0.02, 0.02);}
        this.model.position.set(this.startposi[0],this.startposi[1],this.startposi[2]);
    }
}
const PLs=[new PLs_ins(0,0),new PLs_ins(1,1),new PLs_ins(2,2),new PLs_ins(3,3)]

const directionalLight = new THREE.DirectionalLight(0xFFFFFF);// 平行光源
directionalLight.position.set(1, 0.5, 1);
scene.add(directionalLight);// シーンに追加

const grand = new THREE.Mesh(new THREE.PlaneGeometry( 300,300 ),  new THREE.MeshStandardMaterial({color:0xffff88}) );
grand.rotation.x=1.5*Math.PI;
scene.add(grand);

let mouseX=0;
let cccX=0;
// マウス座標はマウスが動いた時のみ取得できる
  document.addEventListener("mousemove", (event) => {
    mouseX = (event.pageX/ window.innerWidth-0.5)*2;
    // nowmouseY = event.pageY;
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
    for(var i=0;i<PLs.length;i++){if(PLs[i].model!=null){
        if(PLs[i].model.position.y==0){
            console.log(PLs[i].model.position.y)
            PLs[i].setup();
        }
    }}
    mouseX+=0.001
    cccX += (mouseX-cccX)*0.07;
    if(mouseX>1){cccX-=1;mouseX-=1;}
    camera.position.x = Math.sin(cccX*2*Math.PI) * -120;
    camera.position.z = Math.cos(cccX*2*Math.PI) * 120;
    camera.lookAt(new THREE.Vector3(0, 0, 0));// 原点方向を見つめる
    renderer.render(scene, camera);// レンダリング
    requestAnimationFrame(tick);
  }
}

// "Bibi RJ t-pose Brawl Stars" (https://skfb.ly/oHI6z) by shertiku is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
// "Bunny Grom t-pose Brawl Stars" (https://skfb.ly/oHJFO) by shertiku is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
// "White Crow t-pose Brawl Stars" (https://skfb.ly/oIqZY) by shertiku is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
// "Sprout t-pose Brawl Stars" (https://skfb.ly/oHRPH) by shertiku is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).

// "DAE Bazaar - Lamp Seller" (https://skfb.ly/oIAF8) by March Gutman is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
// "Stylized wagon" (https://skfb.ly/oEYx8) by Irina Kostina is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
// "Middle eastern cafe - DAE Bazaar" (https://skfb.ly/oIyZU) by Petru Grati is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
