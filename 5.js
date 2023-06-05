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

import Stats from 'three/addons/libs/stats.module.js';

let container, stats;

let camera, scene, renderer;

let group;

let targetRotation = 0;
let targetRotationOnPointerDown = 0;

let pointerX = 0;
let pointerXOnPointerDown = 0;

let windowHalfX = window.innerWidth / 2;

init();
animate();

function init()
{

	container = document.createElement('div');
	document.body.appendChild(container);

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xf0f0f0);

	camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(0, 150, 500);
	scene.add(camera);

	const light = new THREE.PointLight(0xffffff, 0.8);
	camera.add(light);

	group = new THREE.Group();
	group.position.y = 50;
	scene.add(group);

	const loader = new THREE.TextureLoader();
	const texture = loader.load('textures/uv_grid_opengl.jpg');


	// California
	const californiaPts = [];
	californiaPts.push(new THREE.Vector2(610, 320));
	californiaPts.push(new THREE.Vector2(450, 300));
	californiaPts.push(new THREE.Vector2(392, 392));
	californiaPts.push(new THREE.Vector2(266, 438));
	californiaPts.push(new THREE.Vector2(190, 570));
	californiaPts.push(new THREE.Vector2(190, 600));
	californiaPts.push(new THREE.Vector2(160, 620));
	californiaPts.push(new THREE.Vector2(160, 650));
	californiaPts.push(new THREE.Vector2(180, 640));
	californiaPts.push(new THREE.Vector2(165, 680));
	californiaPts.push(new THREE.Vector2(150, 670));
	californiaPts.push(new THREE.Vector2(90, 737));
	californiaPts.push(new THREE.Vector2(80, 795));
	californiaPts.push(new THREE.Vector2(50, 835));
	californiaPts.push(new THREE.Vector2(64, 870));
	californiaPts.push(new THREE.Vector2(60, 945));
	californiaPts.push(new THREE.Vector2(300, 945));
	californiaPts.push(new THREE.Vector2(300, 743));
	californiaPts.push(new THREE.Vector2(600, 473));
	californiaPts.push(new THREE.Vector2(626, 425));
	californiaPts.push(new THREE.Vector2(600, 370));
	californiaPts.push(new THREE.Vector2(610, 320));

	for (let i = 0; i < californiaPts.length; i++)
	californiaPts[i].multiplyScalar(0.25);
	const californiaShape = new THREE.Shape(californiaPts);


	// Triangle
	const triangleShape = new THREE.Shape()
		.moveTo(80, 20)
		.lineTo(40, 80)
		.lineTo(120, 80)
		.lineTo(80, 20); // close path


	// Heart
	const x = 0, y = 0;
	const heartShape = new THREE.Shape()
		.moveTo(x + 25, y + 25)
		.bezierCurveTo(x + 25, y + 25, x + 20, y, x, y)
		.bezierCurveTo(x - 30, y, x - 30, y + 35, x - 30, y + 35)
		.bezierCurveTo(x - 30, y + 55, x - 10, y + 77, x + 25, y + 95)
		.bezierCurveTo(x + 60, y + 77, x + 80, y + 55, x + 80, y + 35)
		.bezierCurveTo(x + 80, y + 35, x + 80, y, x + 50, y)
		.bezierCurveTo(x + 35, y, x + 25, y + 25, x + 25, y + 25);


	// Square
	const sqLength = 80;
	const squareShape = new THREE.Shape()
		.moveTo(0, 0)
		.lineTo(0, sqLength)
		.lineTo(sqLength, sqLength)
		.lineTo(sqLength, 0)
		.lineTo(0, 0);


	// Rounded rectangle
	const roundedRectShape = new THREE.Shape();
	(function roundedRect(ctx, x, y, width, height, radius)
	{
		ctx.moveTo(x, y + radius);
		ctx.lineTo(x, y + height - radius);
		ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
		ctx.lineTo(x + width - radius, y + height);
		ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
		ctx.lineTo(x + width, y + radius);
		ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
		ctx.lineTo(x + radius, y);
		ctx.quadraticCurveTo(x, y, x, y + radius);

	})(roundedRectShape, 0, 0, 50, 50, 20);


	// Track
	const trackShape = new THREE.Shape()
		.moveTo(40, 40)
		.lineTo(40, 160)
		.absarc(60, 160, 20, Math.PI, 0, true)
		.lineTo(80, 40)
		.absarc(60, 40, 20, 2 * Math.PI, Math.PI, true);


	// Circle
	const circleRadius = 40;
	const circleShape = new THREE.Shape()
		.moveTo(0, circleRadius)
		.quadraticCurveTo(circleRadius, circleRadius, circleRadius, 0)
		.quadraticCurveTo(circleRadius, - circleRadius, 0, - circleRadius)
		.quadraticCurveTo(- circleRadius, - circleRadius, - circleRadius, 0)
		.quadraticCurveTo(- circleRadius, circleRadius, 0, circleRadius);


	// Fish
	const fishShape = new THREE.Shape()
		.moveTo(x, y)
		.quadraticCurveTo(x + 50, y - 80, x + 90, y - 10)
		.quadraticCurveTo(x + 100, y - 10, x + 115, y - 40)
		.quadraticCurveTo(x + 115, y, x + 115, y + 40)
		.quadraticCurveTo(x + 100, y + 10, x + 90, y + 10)
		.quadraticCurveTo(x + 50, y + 80, x, y);


	// Arc circle
	const arcShape = new THREE.Shape()
		.moveTo(50, 10)
		.absarc(10, 10, 40, 0, Math.PI * 2, false);

	const holePath = new THREE.Path()
		.moveTo(20, 10)
		.absarc(10, 10, 10, 0, Math.PI * 2, true);

	arcShape.holes.push(holePath);


	// Smiley
	const smileyShape = new THREE.Shape()
		.moveTo(80, 40)
		.absarc(40, 40, 40, 0, Math.PI * 2, false);

	const smileyEye1Path = new THREE.Path()
		.moveTo(35, 20)
		.absellipse(25, 20, 10, 10, 0, Math.PI * 2, true);

	const smileyEye2Path = new THREE.Path()
		.moveTo(65, 20)
		.absarc(55, 20, 10, 0, Math.PI * 2, true);

	const smileyMouthPath = new THREE.Path()
		.moveTo(20, 40)
		.quadraticCurveTo(40, 60, 60, 40)
		.bezierCurveTo(70, 45, 70, 50, 60, 60)
		.quadraticCurveTo(40, 80, 20, 60)
		.quadraticCurveTo(5, 50, 20, 40);

	smileyShape.holes.push(smileyEye1Path);
	smileyShape.holes.push(smileyEye2Path);
	smileyShape.holes.push(smileyMouthPath);


	// Spline shape
	const splinepts = [];
	splinepts.push(new THREE.Vector2(70, 20));
	splinepts.push(new THREE.Vector2(80, 90));
	splinepts.push(new THREE.Vector2(- 30, 70));
	splinepts.push(new THREE.Vector2(0, 0));

	const splineShape = new THREE.Shape()
		.moveTo(0, 0)
		.splineThru(splinepts);





	//Help: addShape( shape, color, x, y, z, rx, ry,rz, s );
	// addShape(californiaShape, extrudeSettings, 0xf08000, - 300, - 100, 0, 0, 0, 0, 1);
	addShape(triangleShape, 0xFF0000);
	// addShape(roundedRectShape, extrudeSettings, 0x008000, - 150, 150, 0, 0, 0, 0, 1);
	// addShape(trackShape, extrudeSettings, 0x008080, 200, - 100, 0, 0, 0, 0, 1);
	// addShape(squareShape, extrudeSettings, 0x0040f0, 150, 100, 0, 0, 0, 0, 1);
	// addShape(heartShape, extrudeSettings, 0xf00000, 60, 100, 0, 0, 0, Math.PI, 1);
	// addShape(circleShape, extrudeSettings, 0x00f000, 120, 250, 0, 0, 0, 0, 1);
	// addShape(fishShape, extrudeSettings, 0x404040, - 60, 200, 0, 0, 0, 0, 1);
	// addShape(smileyShape, extrudeSettings, 0xf000f0, - 200, 250, 0, 0, 0, Math.PI, 1);
	// addShape(arcShape, extrudeSettings, 0x804000, 150, 0, 0, 0, 0, 0, 1);
	// addShape(splineShape, extrudeSettings, 0x808080, - 50, - 100, 0, 0, 0, 0, 1);


	function addShape(shape, color)
	{
		// extruded shape
		const extrudeSettings = { depth: 10, bevelEnabled: true, bevelSegments: 20, steps: 20, bevelSize: 10, bevelThickness: 10 };
		let geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
		let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: color }));
		group.add(mesh);
	}




	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	stats = new Stats();
	container.appendChild(stats.dom);

	container.style.touchAction = 'none';
	container.addEventListener('pointerdown', onPointerDown);
	window.addEventListener('resize', onWindowResize);
}

function onWindowResize()
{

	windowHalfX = window.innerWidth / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

}

function onPointerDown(event)
{
	if (event.isPrimary === false) return;
	pointerXOnPointerDown = event.clientX - windowHalfX;
	targetRotationOnPointerDown = targetRotation;
	document.addEventListener('pointermove', onPointerMove);
	document.addEventListener('pointerup', onPointerUp);

}

function onPointerMove(event)
{
	if (event.isPrimary === false) return;
	pointerX = event.clientX - windowHalfX;
	targetRotation = targetRotationOnPointerDown + (pointerX - pointerXOnPointerDown) * 0.02;
}

function onPointerUp()
{

	if (event.isPrimary === false) return;
	document.removeEventListener('pointermove', onPointerMove);
	document.removeEventListener('pointerup', onPointerUp);
}

function animate()
{
	requestAnimationFrame(animate);
	render();
	stats.update();
}

function render()
{
	group.rotation.y += (targetRotation - group.rotation.y) * 0.05;
	renderer.render(scene, camera);
}