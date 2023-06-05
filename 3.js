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


let camera, scene, renderer, controls;
const clock = new THREE.Clock();
const objects = [];

let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();

init();
animate();

function init()
{
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(10, 10, 10);
	camera.lookAt(0, 0, 0)

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xffffff);
	scene.fog = new THREE.Fog(0xffffff, 0, 750);

	const axesHelper = new THREE.AxesHelper(100);
	scene.add(axesHelper);
	const gridHelper = new THREE.GridHelper(100, 10, 0xffffff, 0x986987);
	scene.add(gridHelper);

	const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
	light.position.set(0.5, 1, 0.75);
	scene.add(light);

	controls = new FirstPersonControls(camera, document.body);
	controls.movementSpeed = 4;
	controls.lookSpeed = 0.1;




	//#region Code here

	//#endregion





	window.addEventListener('resize', onWindowResize);
}

function onWindowResize()
{
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate()
{
	requestAnimationFrame(animate);
	controls.update(clock.getDelta());
	renderer.render(scene, camera);
}