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

const clock = new THREE.Clock();


//#region scene
const scene = new THREE.Scene();
const axesHelper = new THREE.AxesHelper(1000);
scene.add(axesHelper);
const gridHelper = new THREE.GridHelper(1000, 5);
scene.add(gridHelper);
//#endregion

//#region Camera
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(0, 10, -10); //x, y, z
camera.lookAt(0, 0, 0);

const CameraLookAt = new THREE.Vector3(0, 0, 0);
camera.lookAt(CameraLookAt);
//#endregion

//#region Controls
// const MyOrbitControls = new OrbitControls(camera, renderer.domElement);
// MyOrbitControls.autoRotate = true;
// MyOrbitControls.autoRotateSpeed = 0.5;
// MyOrbitControls.enableDamping = true;
// MyOrbitControls.dampingFactor = 0.1;

const MyFirstPersonControls = new FirstPersonControls(camera, renderer.domElement);
MyFirstPersonControls.enabled = false
MyFirstPersonControls.movementSpeed = 150;
MyFirstPersonControls.lookSpeed = 0.1;

const onKeyDown = function (event)
{
	switch (event.code)
	{
		case 'ShiftLeft'://'KeyX'
			//MyOrbitControls.enabled = false
			MyFirstPersonControls.enabled = true
			break;

		case 'Space':
			MyFirstPersonControls.enabled = true
			camera.lookAt(0, 0, 0);
			MyFirstPersonControls.enabled = false
			break;
	}
};

const onKeyUp = function (event)
{
	switch (event.code)
	{
		case 'ShiftLeft':
			//MyOrbitControls.enabled = true
			MyFirstPersonControls.enabled = false
			break;
	}
};

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);
//#endregion







// Create an HTML element and make it clickable
const element = document.createElement('a');
element.textContent = 'Download';
element.href = '#';
element.style.color = 'white';
element.style.textDecoration = 'none';
element.addEventListener('click', event =>
{
	event.preventDefault();
	console.log('Download clicked!');
});

// Create a CSS2DRenderer and add the HTML element to the scene
const cssRenderer = new CSS2DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
cssRenderer.domElement.style.position = 'absolute';
cssRenderer.domElement.style.top = '-1';
document.body.appendChild(cssRenderer.domElement);
















function AnimateCamera()
{
	requestAnimationFrame(AnimateCamera);
	//MyOrbitControls.update();
	MyFirstPersonControls.update(clock.getDelta());
	renderer.render(scene, camera);
	//cssRenderer.render(scene, camera);
}
AnimateCamera();