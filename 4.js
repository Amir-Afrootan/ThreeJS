import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import * as CANNON from 'cannon-es';


//#region WebGLRenderer
const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0x000000);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Auto resize window
window.addEventListener("resize", function ()
{
	camera.aspect = this.window.innerWidth / this.window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(this.window.innerWidth, window.innerHeight);
});
//#endregion

//#region Global variable
var clock = new THREE.Clock();
//#endregion

//#region scene
const scene = new THREE.Scene();
const axesHelper = new THREE.AxesHelper(50);
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(100, 10);
scene.add(gridHelper);
//#endregion

//#region Camera
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(50, 50, 50); //x, y, z
camera.lookAt(0, 0, 0);
//#endregion

//#region Light
const MyAmbientLight = new THREE.AmbientLight(0xffffff);
scene.add(MyAmbientLight);
//#endregion

//#region Controlers
const MyFirstPersonControls = new FirstPersonControls(camera, renderer.domElement);
MyFirstPersonControls.movementSpeed = 20;
MyFirstPersonControls.lookSpeed = 0.05;
function AnimateCamera()
{
	requestAnimationFrame(AnimateCamera);
	MyFirstPersonControls.update(clock.getDelta());
	renderer.render(scene, camera);
}
AnimateCamera();
//#endregion


// Start Coding in here
async function loadGLTFModel(modelUrl)
{
	const loader = new GLTFLoader();
	const gltf = await loader.loadAsync(modelUrl);
	const model = gltf.scene;
	scene.add(model);
	return model
}
const MyModel1 = await loadGLTFModel('Models/Preheater/Preheater.gltf');
MyModel1.scale.set(90, 90, 90)
MyModel1.position.y = 10

const MyModel2 = await loadGLTFModel('Models/PulpitCutMachine/PulpitCutMachine.gltf');
MyModel2.scale.set(90, 90, 90)
MyModel2.position.x = 10