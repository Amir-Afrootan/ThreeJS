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

//#region scene
const scene = new THREE.Scene();
const axesHelper = new THREE.AxesHelper(50);
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(100, 10);
scene.add(gridHelper);
//#endregion

//#region Camera
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(0, 0, 0); //x, y, z
//camera.lookAt(0, 0, 0);
//#endregion

//#region Light
const MyAmbientLight = new THREE.AmbientLight(0xffffff);
scene.add(MyAmbientLight);
//#endregion

//#region OrbitControls
//const controls = new OrbitControls(camera, renderer.domElement);
const controls = new PointerLockControls(camera, document.body);
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
controls.enableDamping = true;
controls.dampingFactor = 0.1;


const onKeyDown = function (event)
{
	switch (event.code)
	{
		case 'KeyW':
			controls.autoRotate = false;
			camera.position.y -= 10;
			break;

		case 'KeyA':
			controls.autoRotate = false;
			camera.position.x += 10;
			break;

		case 'KeyS':
			controls.autoRotate = false;
			camera.position.y += 10;
			break;

		case 'KeyD':
			controls.autoRotate = false;
			camera.position.x -= 10;
			break;

		case 'KeyQ':
			controls.autoRotate = false;
			camera.position.z -= 10;
			break;

		case 'KeyE':
			controls.autoRotate = false;
			camera.position.z += 10;
			break;





		case 'ArrowUp':
			controls.autoRotate = false;
			camera.rotation.x -= 0.01;
			break;

		case 'ArrowLeft':
			controls.autoRotate = false;
			camera.rotation.y -= 0.1;
			break;

		case 'ArrowDown':
			controls.autoRotate = false;
			camera.rotation.x += 0.01;
			break;

		case 'ArrowRight':
			controls.autoRotate = false;
			camera.rotation.y += 0.1;
			break;

		case 'Space':
			controls.autoRotate = false;
			camera.lookAt(0, 0, 0);
			break;
	}
};

const onKeyUp = function (event)
{
	switch (event.code)
	{
		case 'ArrowUp', 'KeyW':
			controls.autoRotate = true;
			break;

		case 'ArrowLeft', 'KeyA':
			controls.autoRotate = true;
			break;

		case 'ArrowDown', 'KeyS':
			controls.autoRotate = true;
			break;

		case 'ArrowRight', 'KeyD':
			controls.autoRotate = true;
			break;
	}
};

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

















function AnimateCamera()
{
	requestAnimationFrame(AnimateCamera);
	//controls.update(); // controls.autoRotate disable if we comment this line.
	renderer.render(scene, camera); // not any more needed.
}
AnimateCamera();
//#endregion

//#region Plane
const PlaneGeo = new THREE.PlaneGeometry(400, 400)
const PlaneMat = new THREE.MeshStandardMaterial({ color: 0x125493, side: THREE.DoubleSide, wireframe: true });
const MyPlane = new THREE.Mesh(PlaneGeo, PlaneMat)
MyPlane.rotation.x = -Math.PI / 2;
scene.add(MyPlane);
//#endregion