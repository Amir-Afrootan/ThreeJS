import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import Stats from 'three/addons/libs/stats.module.js';
import { GPUStatsPanel } from 'three/addons/utils/GPUStatsPanel.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import * as GeometryUtils from 'three/addons/utils/GeometryUtils.js';

import * as CANNON from 'cannon-es';

//#region WebGLRenderer
const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0x000000);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Render Label
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

// Auto resize window
window.addEventListener("resize", function ()
{
	camera.aspect = this.window.innerWidth / this.window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(this.window.innerWidth, window.innerHeight);
});

//for select object by mouse
const rayCaster = new THREE.Raycaster();
const mousePosition = new THREE.Vector2();
window.addEventListener('mousemove', function (e)
{
	mousePosition.x = (e.clientX / this.window.innerWidth) * 2 - 1;
	mousePosition.y = -(e.clientY / this.window.innerHeight) * 2 + 1;
});
//#endregion

//#region Global Variable
const clock = new THREE.Clock();
//#endregion

//#region Add Gravity, Collision, And Other Physics Laws To Your 3D Web App
const world = new CANNON.World({
	gravity: new CANNON.Vec3(0, -9.81, 0) // This is gravity power direction.
});

const timeStep = 1 / 60;
function AnimateGravity()
{
	world.step(timeStep);

	plane.position.copy(PlaneBody.position)
	plane.quaternion.copy(PlaneBody.quaternion)

	glassMesh.position.copy(GlassBody.position)
	glassMesh.quaternion.copy(GlassBody.quaternion)

	waterMesh.position.copy(waterBody.position)
	waterMesh.quaternion.copy(waterBody.quaternion)

	renderer.render(scene, camera);
}
renderer.setAnimationLoop(AnimateGravity);
//#endregion

//#region scene
const scene = new THREE.Scene();

const axesHelper = new THREE.AxesHelper(50);
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(100, 10);
scene.add(gridHelper);

// Ambient Texture
//https://polyhaven.com/hdris/studio
//https://matheowis.github.io/HDRI-to-CubeMap/
const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
	'./Textures/Scene Background/px.png',
	'./Textures/Scene Background/nx.png',
	'./Textures/Scene Background/py.png',
	'./Textures/Scene Background/ny.png',
	'./Textures/Scene Background/pz.png',
	'./Textures/Scene Background/nz.png',
]);
scene.background = new THREE.Color(0xefd1b5);
scene.background = texture;
scene.fog = new THREE.Fog(0xffffff, 0, 300);
//scene.fog = new THREE.FogExp2(0xefd1b5, 0.0025);

//#endregion

//#region Camera
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(0, 90, 50); //x, y, z
camera.lookAt(0, 0, 0);

// Shadow camera helper
const MyCameraHelper = new THREE.CameraHelper(camera);
//scene.add(MyCameraHelper);
//#endregion

//#region Controls
const controls_labelRenderer = new OrbitControls(camera, labelRenderer.domElement);

//const MyOrbitControls = new OrbitControls(camera, renderer.domElement);
//MyOrbitControls.listenToKeyEvents(window); // optional
// MyOrbitControls.autoRotate = true;
// MyOrbitControls.autoRotateSpeed = 0.5;
// MyOrbitControls.enableDamping = true;
// MyOrbitControls.dampingFactor = 0.1;
//controls.update();//controls.update() must be called after any manual changes to the camera's transform
// MyOrbitControls.keys = {
// 	LEFT: 'ArrowLeft', //left arrow
// 	UP: 'ArrowUp', // up arrow
// 	RIGHT: 'ArrowRight', // right arrow
// 	BOTTOM: 'ArrowDown' // down arrow
// }
// MyOrbitControls.mouseButtons = {
// 	LEFT: THREE.MOUSE.ROTATE,
// 	MIDDLE: THREE.MOUSE.DOLLY,
// 	RIGHT: THREE.MOUSE.PAN
// }

//FirstPersonControls
const MyFirstPersonControls = new FirstPersonControls(camera, renderer.domElement);
MyFirstPersonControls.enabled = false
MyFirstPersonControls.movementSpeed = 150;
MyFirstPersonControls.lookSpeed = 0.1;

const onKeyDown = function (event)
{
	//console.log(event)
	switch (event.code)
	{
		case 'ShiftLeft':
			MyFirstPersonControls.enabled = true
			break;

		case 'Space':
			camera.position.y += 1;
			break;

		case 'KeyX':
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
			MyFirstPersonControls.enabled = false
			break;
		case 'Space':
			MyFirstPersonControls.enabled = false
			break;
	}
};
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

function AnimateCamera()
{
	requestAnimationFrame(AnimateCamera);
	//MyOrbitControls.update(); // controls.autoRotate disable if we comment this line.
	MyFirstPersonControls.update(clock.getDelta());
	renderer.render(scene, camera); // not any more needed.
	labelRenderer.render(scene, camera);
}
AnimateCamera();
//#endregion

//#region Light
//AmbientLight
const AmbientLight = new THREE.AmbientLight(0xffffff);
//scene.add(AmbientLight);

//DirectionalLight
const MyDirectionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
MyDirectionalLight.position.set(20, 50, 20);
MyDirectionalLight.target.position.set(0, 0, 0);
MyDirectionalLight.castShadow = true;
MyDirectionalLight.shadow.bias = -0.001;
// MyDirectionalLight.shadow.mapSize.width = 1024;
// MyDirectionalLight.shadow.mapSize.height = 1024;
// MyDirectionalLight.shadow.camera.near = 0.1;
// MyDirectionalLight.shadow.camera.far = 500.0;
// MyDirectionalLight.shadow.camera.near = 0.5;
// MyDirectionalLight.shadow.camera.far = 500.0;
MyDirectionalLight.shadow.camera.left = 10;
MyDirectionalLight.shadow.camera.right = -10;
MyDirectionalLight.shadow.camera.top = 10;
MyDirectionalLight.shadow.camera.bottom = -10;
scene.add(MyDirectionalLight);

//Direction Light helper
const MyDirectionalLightHelper = new THREE.DirectionalLightHelper(MyDirectionalLight);
scene.add(MyDirectionalLightHelper);

// SpotLight
const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(-100, 100, 0);
spotLight.castShadow = true;
spotLight.angle = 0.1;
//scene.add(spotLight);

// SpotLight Helper
const spotLightHelper = new THREE.SpotLightHelper(spotLight)
scene.add(spotLightHelper);

//#endregion

//#region Plane
const plane = new THREE.Mesh(
	new THREE.PlaneGeometry(400, 100),
	new THREE.MeshStandardMaterial({
		color: 0xFFFFFF,
		side: THREE.DoubleSide
	}));
plane.castShadow = true;
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;

scene.add(plane);

const PlaneBody = new CANNON.Body({
	mass: 0,
	shape: new CANNON.Plane()
})
world.addBody(PlaneBody);
PlaneBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

//#endregion

//#region Plane2: Platform
const PlatformGeo = new THREE.PlaneGeometry(100, 100);
const PlatformMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.2, side: THREE.DoubleSide })
const Platform = new THREE.Mesh(PlatformGeo, PlatformMat);
//Platform.position.set(-150, 50, 0);
Platform.castShadow = true;
Platform.receiveShadow = true;
Platform.rotation.x = -Math.PI / 2;
//scene.add(Platform);
//#endregion

//#region Cube
const CubeGeo = new THREE.BoxGeometry(10, 10, 10);
const CubeMat = new THREE.MeshStandardMaterial(); // enable Shdow
const color2 = new THREE.Color( 0x213911 );
const color3 = new THREE.Color("rgb(125, 36, d5)");
const color4 = new THREE.Color("rgb(10%, 60%, 20%)");
const color5 = new THREE.Color( 'skyblue' );
const color6 = new THREE.Color("hsl(0, 100%, 50%)");
const color7 = new THREE.Color( 1, 0, 0 );
CubeMat.color = color3
CubeMat.roughness = 0;
CubeMat.metalness = 0;

const cube = new THREE.Mesh(CubeGeo, CubeMat);
cube.name = "Cube";
cube.position.y = 0;
cube.position.set(1, 10, 1);
cube.castShadow = true;
cube.receiveShadow = true;
scene.add(cube);

// const CubeDiv = document.createElement('div');
// CubeDiv.className = 'label';
// CubeDiv.textContent = 'My Simple Text';

// const earthLabel = new CSS2DObject(CubeDiv);
// earthLabel.position.set(1, 0, 0);
// earthLabel.center.set(0, 1);
// earthLabel.layers.set(0);
// cube.add(earthLabel);

function AnimateCube()
{
	requestAnimationFrame(AnimateCube);
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
	renderer.render(scene, camera);
}
AnimateCube();

//#endregion

//#region Box
const BoxTextureLoader = new THREE.TextureLoader().load('Textures/wood_floor_deck_diff_1k.png');
const Boxmaterial = new THREE.MeshBasicMaterial({ map: BoxTextureLoader });//color: 0xffffff, map: texture
const MultiBoxmaterial = [
	new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('Textures/bark_willow_diff_1k.jpg') }),
	new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('Textures/bark_willow_diff_1k.jpg') }),
	new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('Textures/bark_willow_diff_1k.jpg') }),
	new THREE.MeshBasicMaterial({ map: BoxTextureLoader }),
	new THREE.MeshBasicMaterial({ map: BoxTextureLoader }),
	new THREE.MeshBasicMaterial({ map: BoxTextureLoader })
]
const boxGeometry = new THREE.BoxGeometry(5, 5, 5);
const box = new THREE.Mesh(boxGeometry, MultiBoxmaterial);//Boxmaterial

box.position.set(-10, 10, -10);
scene.add(box);
cube.add(box);
//#endregion

//#region Hollow Box

// // Create the outer box
// const outerBoxGeometry = new THREE.BoxGeometry(2, 2, 2);
// const outerBoxMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
// const outerBoxMesh = new THREE.Mesh(outerBoxGeometry, outerBoxMaterial);

// // Create the inner box
// const innerBoxGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
// const innerBoxMesh = new THREE.Mesh(innerBoxGeometry);

// // Subtract the inner box from the outer box
// const outerBoxCSG = THREE.CSG.fromMesh(outerBoxMesh);
// const innerBoxCSG = THREE.CSG.fromMesh(innerBoxMesh);
// const finalBoxCSG = outerBoxCSG.subtract(innerBoxCSG);
// const finalBoxMesh = THREE.CSG.toMesh(finalBoxCSG, outerBoxMesh.matrix);

// // Add the final box to the scene
// scene.add(finalBoxMesh);
//#endregion

//#region sphere
const SphereGeometry = new THREE.SphereGeometry(4, 50, 50);
const SphereTextureLoader = new THREE.TextureLoader().load('Textures/bark_willow_diff_1k.jpg');
const SphereMaterial = new THREE.MeshStandardMaterial({//MeshLambertMaterial
	//color: 0x216971,
	wireframe: false,
	roughness:0,
	metalness:1,
	//map: SphereTextureLoader,
	envMap: scene.background,
});
const Sphere = new THREE.Mesh(SphereGeometry, SphereMaterial);
Sphere.position.set(-40, 10, 50);
Sphere.castShadow = true;
Sphere.receiveShadow = true;
scene.add(Sphere);
//#endregion

//#region cylinder Ladel
const cylindergeometry = new THREE.CylinderGeometry(3, 3, 10, 20);
const cylinderMaterial1 = new THREE.MeshBasicMaterial({ color: 0xffff00 });		// don't accept shadow.
const cylinderMaterial2 = new THREE.MeshPhysicalMaterial({ color: 0xffffff });	// accept shadow.
const cylinderMaterial3 = new THREE.MeshStandardMaterial({						// accept shadow.
	color: 0xffffFF,
	metalness: false,
	roughness: 0,
	transparent: true,
	opacity: 0.6
});
const cylinder = new THREE.Mesh(cylindergeometry, cylinderMaterial3);
cylinder.position.set(8, 8, 0);
cylinder.castShadow = true;
cylinder.receiveShadow = true;
//scene.add(cylinder);
//#endregion

//#region Cylinder Melt
const cylindergeometry2 = new THREE.CylinderGeometry(2, 2, 1, 20);
const cylinderMaterial23 = new THREE.MeshStandardMaterial({						// accept shadow.
	color: 0xff0000,
	metalness: false,
	//roughness: 1,
});
const cylinder2 = new THREE.Mesh(cylindergeometry2, cylinderMaterial23);
cylinder2.position.set(0, -4, 0);
cylinder.add(cylinder2);

const cylinder2Div = document.createElement('div');
cylinder2Div.className = 'label';
cylinder2Div.textContent = "1600 C";

const cylinder2Label = new CSS2DObject(cylinder2Div);
cylinder2Label.position.set(1, 0, 0);
cylinder2Label.center.set(0, 1);
cylinder2Label.layers.set(0);
cylinder2.add(cylinder2Label);
//#endregion

//#region Cylinder Segment
const SegmentGeo = new THREE.CylinderGeometry(1, 1, 8, 32, 1, false)
const SegmentMat = new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load('Textures/rusty_metal_diff_1k.png'), side: THREE.DoubleSide })
const Segment1 = new THREE.Mesh(SegmentGeo, SegmentMat)
let Segment2 = new THREE.Mesh(SegmentGeo, SegmentMat)
Segment1.position.set(-(plane.geometry.parameters.width / 2) + 9, 40, 10);
Segment1.rotation.x = 1.6;
scene.add(Segment1)
scene.add(Segment2)

function AnimateRotateSegment()
{
	requestAnimationFrame(AnimateRotateSegment);
	Segment1.rotation.y -= 0.01;
	renderer.render(scene, camera);
}
AnimateRotateSegment();
//#endregion

//#region second ladle with melt
const glassGeometry = new THREE.CylinderGeometry(3, 3, 10, 32);
const glassMaterial = new THREE.MeshStandardMaterial({ color: 0xFF00FF, transparent: true, opacity: 0.5 });
const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
glassMesh.castShadow = true;
glassMesh.receiveShadow = true;
glassMesh.position.set(-8, 8, 0);

const GlassBody = new CANNON.Body({
	//mass: 0,
	type: CANNON.Body.STATIC,
	shape: new CANNON.Cylinder(3, 3, 10, 32),
	position: new CANNON.Vec3(-8, 8, 0),
	material: new CANNON.Material()
})
world.addBody(GlassBody);




const waterGeometry = new THREE.CylinderGeometry(2, 2, 4, 32);
const waterMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff, transparent: false, opacity: 0.8 });
const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
waterMesh.position.set(0, 10, 0);

const waterBody = new CANNON.Body({
	mass: 1,
	shape: new CANNON.Cylinder(1, 1, 2, 32),
	position: new CANNON.Vec3(0, 10, 0),
});
world.addBody(waterBody);
// waterBody.angularVelocity.set(0, 10, 0);
// waterBody.angularDamping = 0.5;

glassMesh.add(waterMesh);
//scene.add(glassMesh);
//#endregion

//#region Line
let points = [];
points.push(new THREE.Vector3(-4, 0, 0));
points.push(new THREE.Vector3(0, 4, 0));
points.push(new THREE.Vector3(4, 0, 0));
const geometryLine = new THREE.BufferGeometry().setFromPoints(points);
const line = new THREE.Line(geometryLine, CubeMat);
scene.add(line);
renderer.render(scene, camera);

function AnimateLine()
{
	requestAnimationFrame(AnimateLine);
	line.rotation.x += 0.01;
	line.rotation.y += 0.01;
	renderer.render(scene, camera);
}
AnimateLine();
//#endregion

//#region ribbon CurveLine
const numPoints = 100;
const radius = 50;
const PlaneWidth = (plane.geometry.parameters.width / 2) - 100;
const PlaneHeight = (plane.geometry.parameters.height / 2);
var Points = [];
for (var i = 0; i < numPoints; i++)
{
	var angle = i / numPoints * Math.PI * 2;
	//console.log(angle);
	if (angle >= 3.1 && angle <= 4.5)
	{
		var x = Math.cos(angle) * radius;
		var y = Math.sin(angle) * radius;
		Points.push(new THREE.Vector3(x - PlaneWidth, y + 50, 0));
	}
}
//console.log(Points);
const LPI = Points.length - 1//Last Point Index
Points.push(new THREE.Vector3(Points[LPI].x + 30, Points[LPI].y, 0));

const Paths = new THREE.CatmullRomCurve3(Points);

/*
 [
	new THREE.Vector3(-xpoint, 40, 0),
	new THREE.Vector3(-xpoint, 30, 0),
	new THREE.Vector3(-xpoint + 2, 30, 0),
	new THREE.Vector3(-xpoint + 5, 25, 0),
	new THREE.Vector3(-xpoint + 12, 22, 0),
	new THREE.Vector3(-xpoint + 25, 20, 0),
	new THREE.Vector3(-xpoint + 25, 20, 0),
]
*/

const TubeGeo = new THREE.TubeGeometry(Paths, 100, 1, 2, false);
const TubeMat = new THREE.MeshStandardMaterial({ color: 0xff0000, opacity: 1, wireframe: false, transparent: false, roughness: 0, metalness: 0 });
const Strand1 = new THREE.Mesh(TubeGeo, TubeMat);
const Strand2 = new THREE.Mesh(TubeGeo, TubeMat);
Strand1.position.set((-Platform.geometry.parameters.width / 2) + 10, 0, 10)
Strand2.position.set((-Platform.geometry.parameters.width / 2) + 10, 0, -10)
// Strand1.scale.set(4,4,4);
// Strand2.scale.set(4,4,4);
scene.add(Strand1);
scene.add(Strand2);
//#endregion

//#region  define group variables before loading miodel
const PlatformGroup = new THREE.Group();
//#endregion

//#region Tundish
const TundishLoader = new GLTFLoader();
let ModelTundish;
TundishLoader.load('Models/Tundish/Tundish.gltf', function (gltf)
{
	const model = gltf.scene;
	model.scale.set(40, 40, 40); // resize the model
	model.rotation.y = 1.6;
	model.position.set(-40, 1, -10);
	ModelTundish = model;
	PlatformGroup.add(model);

}, undefined, function (error)
{
	console.error(error);
});
if (ModelTundish)
	ModelTundish.position.set(-40, 1, 20);
//#endregion

//#region Model Ladle and Turret
const TurretLoader = new GLTFLoader();
let ModelTurret;
TurretLoader.load('Models/Turret2/Turret.gltf', function (gltf)
{
	const model = gltf.scene;
	model.scale.set(100, 100, 100); // resize the model
	ModelTurret = model;
	TurretGroup.add(model);
	//scene.add(model);

}, undefined, function (error)
{
	console.error(error);
});
//#endregion

//#region Platform group
PlatformGroup.add(Platform);
// PlatformGroup.add(Strand1);
// PlatformGroup.add(Strand2);
PlatformGroup.position.set(-150, 50, 0);
scene.add(PlatformGroup);
//#endregion

//#region TurretGroup
const TurretGroup = new THREE.Group();
TurretGroup.add(glassMesh);
TurretGroup.add(cylinder);
TurretGroup.position.set(-Platform.geometry.parameters.width / 2, 5, 0);
TurretGroup.name = "TurretGroup";
PlatformGroup.add(TurretGroup);
//#endregion

//#region select object by mouse
box.name = "Box";
function TrackMouse()
{
	requestAnimationFrame(TrackMouse);
	rayCaster.setFromCamera(mousePosition, camera);
	const intersects = rayCaster.intersectObjects(scene.children);
	//console.log(intersects);

	for (let i = 0; i < intersects.length; i++)
	{
		if (intersects[i].object.id === cube.id)
		{
			intersects[i].object.material.color.setHex(Math.random() * 0xffffff);
		}

		if (intersects[i].object.name === "Box")
		{
			//intersects[i].object.rotation.x += 0.1;
			box.rotation.x += 0.1;
		}
	}
}
//TrackMouse();


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event)
{
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function OpenContextMenu(event)
{
	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(scene.children);

	if (intersects.length > 0)
	{
		const object = intersects[0].object;

		// Display HTML content based on the object that was clicked
		if (object.name === "Cube")
		{
			// <p> Display HTML content based on the object that was clicked </p>
			object.material.color.setHex(Math.random() * 0xffffff);
			const CubeDiv = document.createElement('div');
			CubeDiv.className = 'label';
			CubeDiv.innerHTML = "<ul><li><a href='#'>Coffee</a></li><li>Tea</li><li>Milk</li></ul>";
			CubeDiv.addEventListener('click', event =>
			{
				event.preventDefault();
				console.log('Download clicked!');
			});

			const earthLabel = new CSS2DObject(CubeDiv);
			earthLabel.position.set(1, 0, 0);
			earthLabel.center.set(0, 0);
			//earthLabel.layers.set(10);
			cube.add(earthLabel);

			
			
		}
		else if (object.name === 'Box')
		{
			// <p> Display HTML content for myOtherObject! ... </p>
			object.material.color.setHex(Math.random() * 0xffffff);
		}
	}
}

function CloseContextMenu(event)
{
	for (let i = 0; i < scene.children.length; i++)
	{
		const objects = scene.children[i];
		for (let i2 = 0; i2 < objects.children.length; i2++)
		{
			const child = objects.children[i2];
			console.log(child)
			if (child instanceof CSS2DObject)
			{
				objects.remove(child);
			}
		}
	}

	// const labelDiv = document.querySelector(".label")
	// console.log(labelDiv);
	// labelDiv.innerHTML = "";
	// labelDiv.style.display = 'none';
	// console.log(labelDiv);
}
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('contextmenu', OpenContextMenu);
window.addEventListener("dblclick", CloseContextMenu);











//#endregion

//#region ContextMenu
const contextMenu = document.createElement('div');
contextMenu.innerHTML =
	'<a href="#"> Context. </a>' +
	'<a href="#"> menu. </a>' +
	'<a href="#"> text. </a>'
	;
contextMenu.className = 'ContextMenu';
renderer.domElement.addEventListener('dblclick', event =>
{
	event.preventDefault();

	// Determine the position of the mouse click
	const x = event.clientX;
	const y = event.clientY;

	// Show the context menu element
	contextMenu.style.top = `${y}px`;
	contextMenu.style.left = `${x}px`;
	contextMenu.style.display = 'block';
});


// Add a click event listener to the document object
document.addEventListener('click', event =>
{
	// Check whether the click occurred within the context menu
	if (!contextMenu.contains(event.target))
	{
		// If not, hide the context menu
		contextMenu.style.display = 'none';
	}
});

document.body.appendChild(contextMenu);
//#endregion


