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
	camera.position.y = 10;

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xffffff);
	scene.fog = new THREE.Fog(0xffffff, 0, 750);

	const axesHelper = new THREE.AxesHelper(5000);
	scene.add(axesHelper);
	const gridHelper = new THREE.GridHelper(1000, 1000, 0xffffff, 0x986987);
	scene.add(gridHelper);

	const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
	light.position.set(0.5, 1, 0.75);
	scene.add(light);

	controls = new PointerLockControls(camera, document.body);
	controls.lock();

	// const blocker = document.getElementById('blocker');
	// const instructions = document.getElementById('instructions');

	// instructions.addEventListener('click', function ()
	// {
	// 	controls.lock();
	// });

	// controls.addEventListener('lock', function ()
	// {
	// 	instructions.style.display = 'none';
	// 	blocker.style.display = 'none';
	// });

	// controls.addEventListener('unlock', function ()
	// {
	// 	blocker.style.display = 'block';
	// 	instructions.style.display = '';
	// });

	scene.add(controls.getObject());
	const onKeyDown = function (event)
	{
		switch (event.code)
		{

			case 'ArrowUp':
			case 'KeyW':
				moveForward = true;
				break;

			case 'ArrowLeft':
			case 'KeyA':
				moveLeft = true;
				break;

			case 'ArrowDown':
			case 'KeyS':
				moveBackward = true;
				break;

			case 'ArrowRight':
			case 'KeyD':
				moveRight = true;
				break;

			case 'Space':
				if (canJump === true) velocity.y += 400;
				canJump = false;
				break;

		}

	};

	const onKeyUp = function (event)
	{

		switch (event.code)
		{

			case 'ArrowUp':
			case 'KeyW':
				moveForward = false;
				break;

			case 'ArrowLeft':
			case 'KeyA':
				moveLeft = false;
				break;

			case 'ArrowDown':
			case 'KeyS':
				moveBackward = false;
				break;

			case 'ArrowRight':
			case 'KeyD':
				moveRight = false;
				break;

		}

	};

	document.addEventListener('keydown', onKeyDown);
	document.addEventListener('keyup', onKeyUp);

	raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, - 1, 0), 0, 10);
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

	const time = performance.now();

	if (controls.isLocked === true)
	{
		// raycaster.ray.origin.copy(controls.getObject().position);
		// raycaster.ray.origin.y -= 10;

		const delta = (time - prevTime) / 1000;

		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;

		velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

		direction.z = Number(moveForward) - Number(moveBackward);
		direction.x = Number(moveRight) - Number(moveLeft);
		direction.normalize(); // this ensures consistent movements in all directions

		if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
		if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;


		controls.moveRight(- velocity.x * delta);
		controls.moveForward(- velocity.z * delta);

		controls.getObject().position.y += (velocity.y * delta); // new behavior

		if (controls.getObject().position.y < 10)
		{
			velocity.y = 0;
			controls.getObject().position.y = 10;
			canJump = true;
		}
	}

	prevTime = time;

	renderer.render(scene, camera);

}