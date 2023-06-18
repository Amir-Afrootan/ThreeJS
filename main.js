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
import { VRButton } from 'three/addons/webxr/VRButton.js';

import * as CANNON from 'cannon-es';

//#region WebGLRenderer
const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0x000000);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType( 'local' );
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
	labelRenderer.setSize(window.innerWidth, window.innerHeight);
});
//#endregion

//#region Global Functions And Variables
const clock = new THREE.Clock();
const PlatformGroup = new THREE.Group();
const TurretGroup = new THREE.Group();
const CutMachineAGroup = new THREE.Group();
async function LoadGLTFModel(modelUrl)
{
	const loader = new GLTFLoader();
	const gltf = await loader.loadAsync(modelUrl);
	return gltf.scene;
}
function AddWarning(obj)
{
	const WarningDIV = document.createElement('div');
	WarningDIV.className = 'Info00000';
	WarningDIV.innerHTML = '<i class="fa-solid fa-triangle-exclamation fa-beat fa-2xl" style="color: #c80000;"></i>';
	
	const Label = new CSS2DObject(WarningDIV);
	Label.position.set(0, 0, 0);
	Label.center.set(0, 1);
	obj.add(Label);
}
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

	CylinderB.position.copy(CylinderB_Body.position)
	CylinderB.quaternion.copy(CylinderB_Body.quaternion)

	CylinderB_Melt.position.copy(CylinderB_MeltBody.position)
	CylinderB_Melt.quaternion.copy(CylinderB_MeltBody.quaternion)
}
//renderer.setAnimationLoop(AnimateGravity);
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
camera.position.set(-200, 90, 50); //x, y, z
camera.lookAt(-200, 40, 0);

// Shadow camera helper
const MyCameraHelper = new THREE.CameraHelper(camera);
//scene.add(MyCameraHelper);
//#endregion

//#region Controls
//const controls_labelRenderer = new OrbitControls(camera, labelRenderer.domElement);

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
MyFirstPersonControls.movementSpeed = 20;
MyFirstPersonControls.lookSpeed = 0.05;

const ActiveController = function (event) //// onKeyDown keypress
{
	console.log(event)
	switch (event.code)
	{
		case 'KeyE':
			if (!MyFirstPersonControls.enabled)
			{
				MyFirstPersonControls.enabled = true
				console.log(camera.position)
			}
			else
				MyFirstPersonControls.enabled = false
			break;

		case 'Space':
			camera.position.y += 1;
			break;

		case 'KeyX':
			camera.lookAt(0, 0, 0);
			break;
	}
};
document.addEventListener('keypress', ActiveController);// keyup, keypress, keydown
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
//scene.add(MyDirectionalLightHelper);

// SpotLight
const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(-100, 100, 0);
spotLight.castShadow = true;
spotLight.angle = 0.1;
//scene.add(spotLight);

// SpotLight Helper
const spotLightHelper = new THREE.SpotLightHelper(spotLight)
//scene.add(spotLightHelper);

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
const color2 = new THREE.Color(0x213911);
const color3 = new THREE.Color("rgb(125, 36, d5)");
const color4 = new THREE.Color("rgb(10%, 60%, 20%)");
const color5 = new THREE.Color('skyblue');
const color6 = new THREE.Color("hsl(0, 100%, 50%)");
const color7 = new THREE.Color(1, 0, 0);
CubeMat.color = color3
CubeMat.roughness = 0;
CubeMat.metalness = 0;

const cube = new THREE.Mesh(CubeGeo, CubeMat);
cube.name = "Cube";
cube.position.y = 0;
cube.position.set(1, 10, 1);
cube.castShadow = true;
cube.receiveShadow = true;
//scene.add(cube);

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
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
}


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
//scene.add(box);
//cube.add(box);
//#endregion

//#region Line
let points = [];
points.push(new THREE.Vector3(-4, 0, 0));
points.push(new THREE.Vector3(0, 4, 0));
points.push(new THREE.Vector3(4, 0, 0));
const geometryLine = new THREE.BufferGeometry().setFromPoints(points);
const line = new THREE.Line(geometryLine, CubeMat);
//scene.add(line);
//#endregion

//#region sphere
const SphereGeometry = new THREE.SphereGeometry(4, 50, 50);
const SphereTextureLoader = new THREE.TextureLoader().load('Textures/bark_willow_diff_1k.jpg');
const SphereMaterial = new THREE.MeshStandardMaterial({//MeshLambertMaterial
	//color: 0x216971,
	wireframe: false,
	roughness: 0,
	metalness: 1,
	//map: SphereTextureLoader,
	envMap: scene.background,
});
const Sphere = new THREE.Mesh(SphereGeometry, SphereMaterial);
Sphere.position.set(-40, 10, 50);
Sphere.castShadow = true;
Sphere.receiveShadow = true;
//scene.add(Sphere);
//#endregion

//#region Model Ladle and Turret
const ModelTurret = await LoadGLTFModel('Models/Turret2/Turret.gltf');
ModelTurret.scale.set(100, 100, 100);
TurretGroup.add(ModelTurret);
//#endregion

//#region cylinder A Ladel
const CylinderA_Geo = new THREE.CylinderGeometry(3, 3, 10, 32);
const CylinderA_Mat = new THREE.MeshStandardMaterial({
	color: 0xffffFF,
	metalness: 0,
	roughness: 1,
	transparent: true,
	opacity: 0.6
});
const CylinderA = new THREE.Mesh(CylinderA_Geo, CylinderA_Mat);
CylinderA.position.set(8, 8, 0);
CylinderA.castShadow = true;
CylinderA.receiveShadow = true;
//#endregion

//#region Cylinder A Melt Label
const CylinderA_Melt_Geo = new THREE.CylinderGeometry(2, 2, 10);
const CylinderA_Melt_Mat = new THREE.MeshStandardMaterial({
	color: 0xff0000,
	metalness: 0,
	roughness: 0,
});
const CylinderA_Melt = new THREE.Mesh(CylinderA_Melt_Geo, CylinderA_Melt_Mat);

CylinderA.add(CylinderA_Melt);

const CylinderA_MeltDiv = document.createElement('div');
CylinderA_MeltDiv.className = 'Info';
CylinderA_MeltDiv.innerHTML = "1600 C";

const CylinderA_MeltLabel = new CSS2DObject(CylinderA_MeltDiv);
CylinderA_MeltLabel.position.set(0, 0, 0);
CylinderA_MeltLabel.center.set(0, 1);
CylinderA_Melt.add(CylinderA_MeltLabel);

function CylinderA_MeltAnimation()
{
	if (CylinderA_Melt.geometry.parameters.height <= 1)
	{
		CylinderA_Melt.geometry = new THREE.CylinderGeometry(2, 2, 9);
		CylinderA_Melt.position.y = 0;
	}

	if (CylinderA_Melt.geometry.parameters.height <= 10)
	{
		let DischargeSpeed = 0.01
		CylinderA_Melt.geometry = new THREE.CylinderGeometry(2, 2, CylinderA_Melt.geometry.parameters.height - DischargeSpeed);
		CylinderA_Melt.position.y -= (DischargeSpeed / 2);
	}
}

//#endregion

//#region Cylinder B ladle with melt
const CylinderB_Geo = new THREE.CylinderGeometry(3, 3, 10, 32, 1);
const CylinderB_mat = new THREE.MeshStandardMaterial({ color: 0x0000FF, transparent: true, opacity: 0.5 });
const CylinderB = new THREE.Mesh(CylinderB_Geo, CylinderB_mat);
CylinderB.position.set(-8, 8, 0);
CylinderB.castShadow = true;
CylinderB.receiveShadow = true;
AddWarning(CylinderB)

const CylinderB_Body = new CANNON.Body({
	//mass: 0,
	type: CANNON.Body.STATIC,
	shape: new CANNON.Cylinder(3, 3, 10, 32),
	position: new CANNON.Vec3(-8, 8, 0),
	material: new CANNON.Material()
})
world.addBody(CylinderB_Body);

const CylinderB_MeltGeo = new THREE.CylinderGeometry(2, 2, 4, 32);
const CylinderB_MeltMat = new THREE.MeshStandardMaterial({ color: 0xFF0000, transparent: false, opacity: 0.8 });
const CylinderB_Melt = new THREE.Mesh(CylinderB_MeltGeo, CylinderB_MeltMat);
CylinderB_Melt.position.set(0, 20, 0);
CylinderB.add(CylinderB_Melt);

const CylinderB_MeltBody = new CANNON.Body({
	mass: 1,
	shape: new CANNON.Cylinder(2, 2, 4, 32),
	position: new CANNON.Vec3(0, 20, 0),
});
world.addBody(CylinderB_MeltBody);
// waterBody.angularVelocity.set(0, 10, 0);
// waterBody.angularDamping = 0.5;

//#endregion

//#region Model Tundish
//https://www.vectary.com/
const TundishLoader = new GLTFLoader();
let ModelTundish;
TundishLoader.load('Models/Tundish/Tundish.gltf', function (gltf)
{
	const model = gltf.scene;
	model.scale.set(50, 40, 40); // resize the model
	model.rotation.y = Math.PI / 2;
	model.position.set(-40, 1, 0);
	ModelTundish = model;
	PlatformGroup.add(model);

}, undefined, function (error)
{
	console.error(error);
});
if (ModelTundish)
	ModelTundish.position.set(-40, 1, 20);
//#endregion

//#region Model Preheater
const ModelPreheater = await LoadGLTFModel('Models/Preheater/Preheater.gltf');
ModelPreheater.scale.set(40, 40, 40)
ModelPreheater.position.set(-50, 5, 40);
ModelPreheater.rotation.y = 3.15;
ModelPreheater.rotation.z = 1;
PlatformGroup.add(ModelPreheater);
let PreheaterStatus = "start";
function AnimateModelPreheater(model)
{
	if (model.rotation.z <= 1.58 && PreheaterStatus == "start")
	{
		model.rotation.z += 0.001
	}
	else
		PreheaterStatus = "end"

	if (model.rotation.z > 0 && PreheaterStatus == "end")
		model.rotation.z -= 0.001
	else
		PreheaterStatus = "start"
}
//#endregion

//#region model Preheater Body
const PreheaterBodyGeo = new THREE.CylinderGeometry(2, 2, 6, 32)
const PreheaterBodyMat = new THREE.MeshStandardMaterial();
PreheaterBodyMat.color = new THREE.Color(0xffffff)
const PreheaterBody = new THREE.Mesh(PreheaterBodyGeo, PreheaterBodyMat)
PreheaterBody.position.set(-50, 3, 40)
PreheaterBody.name = "Preheater A Body"
PlatformGroup.add(PreheaterBody)
//#endregion

//#region copper mold
const CopperGeo = new THREE.BoxGeometry(1, 3, 5)
const CopperMat = new THREE.MeshStandardMaterial()
CopperMat.color = new THREE.Color(0xCCCCCC)
CopperMat.roughness = 0
CopperMat.metalness = 1
CopperMat.transparent = true
CopperMat.opacity = 0.5
const Copper1 = new THREE.Mesh(CopperGeo, CopperMat);
const Copper2 = new THREE.Mesh(CopperGeo, CopperMat);
Copper1.position.set(-40, -2, 10)
Copper2.position.set(-40, -2, -10)
PlatformGroup.add(Copper1, Copper2)
//#endregion

//#region Curved Strand ribbon Line
// const numPoints = 100;
// const radius = 50;
// const PlaneWidth = (plane.geometry.parameters.width / 2) - 100;
// const PlaneHeight = (plane.geometry.parameters.height / 2);
// var Points = [];
// for (var i = 0; i < numPoints; i++)
// {
// 	var angle = i / numPoints * Math.PI * 2;
// 	//console.log(angle);
// 	if (angle >= 3.1 && angle <= 4.5)
// 	{
// 		var x = Math.cos(angle) * radius;
// 		var y = Math.sin(angle) * radius;
// 		Points.push(new THREE.Vector3(x - PlaneWidth, y + 50, 0));
// 	}
// }

// const LPI = Points.length - 1//Last Point Index
// Points.push(new THREE.Vector3(Points[LPI].x + 30, Points[LPI].y, 0));
// const Paths = new THREE.CatmullRomCurve3(Points);

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

// const TubeGeo = new THREE.TubeGeometry(Paths, 10, 2, 2, false);
// const TubeMat = new THREE.MeshStandardMaterial({ color: 0xff0000, opacity: 1, wireframe: false, transparent: false, roughness: 1, metalness:0 });
// const Strand1 = new THREE.Mesh(TubeGeo, TubeMat);
// const Strand2 = new THREE.Mesh(TubeGeo, TubeMat);
// Strand1.position.set((-Platform.geometry.parameters.width / 2) + 10, 0, 5)
// Strand2.position.set((-Platform.geometry.parameters.width / 2) + 10, 0, -5)
// Strand1.scale.set(4,4,4);
// Strand2.scale.set(4,4,4);
//scene.add(Strand1);
//scene.add(Strand2);


const MyStrand1Geo = new THREE.CylinderGeometry(45, 45, 1, 32, 1, true, 0, 0); // 1.6
const MyStrand1Mat = new THREE.MeshStandardMaterial();
MyStrand1Mat.color = new THREE.Color(0xFF0000)
MyStrand1Mat.side = THREE.DoubleSide;
const MyStrand1 = new THREE.Mesh(MyStrand1Geo, MyStrand1Mat);
const MyStrand2 = new THREE.Mesh(MyStrand1Geo, MyStrand1Mat);

MyStrand1.position.set((-Platform.geometry.parameters.width / 2) + 55, 0, 10)
MyStrand2.position.set((-Platform.geometry.parameters.width / 2) + 55, 0, -10)

MyStrand1.rotateX(Math.PI / 2); // fix
MyStrand2.rotateX(Math.PI / 2); // fix

MyStrand1.rotateY(4.74);
MyStrand2.rotateY(4.74);

PlatformGroup.add(MyStrand1)
PlatformGroup.add(MyStrand2)

function MyStrandAnimation()
{
	if (MyStrand1.geometry.parameters.thetaLength <= 1.6)
	{
		let thetaLength1 = MyStrand1.geometry.parameters.thetaLength + 0.1
		MyStrand1.geometry = new THREE.CylinderGeometry(45, 45, 5, 32, 1, true, 0, thetaLength1); // 1.6
	}
	if (MyStrand2.geometry.parameters.thetaLength <= 1.6)
	{
		let thetaLength2 = MyStrand2.geometry.parameters.thetaLength + 0.001
		MyStrand2.geometry = new THREE.CylinderGeometry(45, 45, 5, 32, 1, true, 0, thetaLength2); // 1.6
	}
	if ((MyStrand1.geometry.parameters.thetaLength >= 1.6) && scene.getObjectByName("MyStrand1Box") === undefined)
	{
		const MyStrand1BoxGeo = new THREE.BoxGeometry(1, 1, 5)
		const MyStrand1BoxMat = new THREE.MeshStandardMaterial()
		MyStrand1BoxMat.color = new THREE.Color(0xFF0000)
		MyStrand1BoxMat.metalness = 0
		MyStrand1BoxMat.roughness = 1
		const MyStrand1Box = new THREE.Mesh(MyStrand1BoxGeo, MyStrand1BoxMat)
		MyStrand1Box.name = "MyStrand1Box"
		MyStrand1Box.position.set(-142, 5, 10)
		scene.add(MyStrand1Box)
	}
	if ((MyStrand2.geometry.parameters.thetaLength >= 1.6) && scene.getObjectByName("MyStrand2Box") === undefined)
	{
		const MyStrand2BoxGeo = new THREE.BoxGeometry(1, 1, 5)
		const MyStrand2BoxMat = new THREE.MeshStandardMaterial()
		MyStrand2BoxMat.color = new THREE.Color(0xFF0000)
		MyStrand2BoxMat.metalness = 0
		MyStrand2BoxMat.roughness = 1
		const MyStrand2Box = new THREE.Mesh(MyStrand2BoxGeo, MyStrand2BoxMat)
		MyStrand2Box.name = "MyStrand2Box"
		MyStrand2Box.position.set(-142, 5, -10)
		scene.add(MyStrand2Box)
	}
}
let ActiveMyStrand1BoxAnimation = true
function MyStrand1BoxAnimation(ActiveMyStrand1BoxAnimation)
{
	if (ActiveMyStrand1BoxAnimation == false)
		return

	let obj = scene.getObjectByName("MyStrand1Box");

	if (obj === undefined)
		return

	let Width = obj.geometry.parameters.width
	const grow = 0.1
	if (Width <= 40)
	{
		obj.geometry = new THREE.BoxGeometry(Width + grow, 1, 5)
		obj.position.x += (grow/2)
	}
	else
		ActiveMyStrand1BoxAnimation = false
}

let ActiveMyStrand2BoxAnimation = true
function MyStrand2BoxAnimation(ActiveMyStrand2BoxAnimation)
{
	if (ActiveMyStrand2BoxAnimation == false)
		return

	let obj = scene.getObjectByName("MyStrand2Box");

	if (obj === undefined)
		return

	let Width = obj.geometry.parameters.width
	const grow = 0.01
	if (Width <= 40)
	{
		obj.geometry = new THREE.BoxGeometry(Width + grow, 1, 5)
		obj.position.x += (grow/2)
	}
	else
		ActiveMyStrand2BoxAnimation = false
}
//#endregion

//#region Segment
const SegmentGeo = new THREE.CylinderGeometry(1, 1, 8, 32, 1, false)
const SegmentMat = new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load('Textures/rusty_metal_diff_1k.png'), side: THREE.DoubleSide })
let Segment1 = new THREE.Mesh(SegmentGeo, SegmentMat)
let Segment2 = new THREE.Mesh(SegmentGeo, SegmentMat)
Segment1.position.set(-(plane.geometry.parameters.width / 2) + 9, 40, 10);
Segment1.rotation.x = Math.PI / 2;

Segment2.position.set(-(plane.geometry.parameters.width / 2) + 9, 40, -10);
Segment2.rotation.x = Math.PI / 2;

scene.add(Segment1)
scene.add(Segment2)

function AnimateRotateSegment()
{
	Segment1.rotation.y -= 0.01;
	Segment2.rotation.y -= 0.01;
}

//#endregion

//#region model Cut Machine
const CutMachineALoader = new GLTFLoader();
CutMachineALoader.load('Models/CutMachine/CutMachine.gltf', function (gltf)
{
	const model = gltf.scene;
	model.scale.set(150, 150, 100); // resize the model
	CutMachineAGroup.add(model);
}, undefined, function (error)
{
	console.error(error);
});
//#endregion

//#region Cut Machine And Torch And Flame
//Torch A
const CMATorchAGeo = new THREE.CylinderGeometry(0.2, 0.2, 2, 32)
const CMATorchAMat = new THREE.MeshStandardMaterial()
CMATorchAMat.color = new THREE.Color(0xAAAAAA)
const CMATorchA = new THREE.Mesh(CMATorchAGeo, CMATorchAMat)
const CMATorchB = new THREE.Mesh(CMATorchAGeo, CMATorchAMat)
CMATorchA.position.set(0, 4, 3)
CMATorchB.position.set(0, 4, -3)
CutMachineAGroup.add(CMATorchA, CMATorchB)

function TorchMovement()
{
	CMATorchA.position.z += 0.005
	if (CMATorchA.position.z >= 3)
		CMATorchA.position.z = 0
}

//Flame A
const CMATorchAFlameGeo = new THREE.CylinderGeometry(0.1, 0.1, 0)
const CMATorchAFlameMat = new THREE.MeshStandardMaterial()
CMATorchAFlameMat.color = new THREE.Color(0xFF0000)
CMATorchAFlameMat.transparent = true
CMATorchAFlameMat.opacity = 0.5
const CMATorchAFlame = new THREE.Mesh(CMATorchAFlameGeo, CMATorchAFlameMat)
CMATorchAFlame.position.set(0, -1.5, 0)
CMATorchA.add(CMATorchAFlame)

//Flame B
const CMATorchBFlameGeo = new THREE.SphereGeometry(1, 5, 2, 0, 6.28, 0, 5.7)
const CMATorchBFlameMat = new THREE.MeshStandardMaterial()
CMATorchBFlameMat.color = new THREE.Color(0xFF0000)
CMATorchBFlameMat.transparent = true
CMATorchBFlameMat.opacity = 0.5
const CMATorchBFlame = new THREE.Mesh(CMATorchBFlameGeo, CMATorchBFlameMat)
CMATorchBFlame.position.set(0, -1.6, 0)
CMATorchBFlame.rotateX(Math.PI)
CMATorchB.add(CMATorchBFlame)

function CMATorchAFlameAnimation()
{
	let radiusTop = CMATorchAFlame.geometry.parameters.radiusTop + 0
	let radiusBottom = CMATorchAFlame.geometry.parameters.radiusBottom * Math.random() + 0.1
	let height = Math.random() + 1
	CMATorchAFlame.geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height);
	CMATorchBFlame.rotateY(0.1)
}

//#endregion

//#region Roller
const RollerBodyGeo = new THREE.CylinderGeometry(0.5, 0.5, 8)
const RollerTextureLoader = new THREE.TextureLoader().load('Textures/painted_metal_shutter_ao_1k.png');
// RollerTextureLoader.rotation = Math.PI / 4;
// RollerTextureLoader.wrapS = THREE.RepeatWrapping;
// RollerTextureLoader.wrapT = THREE.RepeatWrapping;
const RollerBodyMat = new THREE.MeshStandardMaterial({color:0x888888, roughness:0, metalness:0, side: THREE.DoubleSide, map: RollerTextureLoader})
const RollerBody = new THREE.Mesh(RollerBodyGeo, RollerBodyMat)
RollerBody.position.set(-120, 2, 10)
RollerBody.rotateY(-Math.PI / 2)
RollerBody.rotateZ(Math.PI / 2)

const RollerAGeo = new THREE.CylinderGeometry(1, 1, 0.5)
const RollerA = new THREE.Mesh(RollerAGeo, RollerBodyMat)
RollerA.position.y = 4

const RollerB = new THREE.Mesh(RollerAGeo, RollerBodyMat)
RollerB.position.y = 2

const RollerC = new THREE.Mesh(RollerAGeo, RollerBodyMat)
RollerC.position.y = -2

const RollerD = new THREE.Mesh(RollerAGeo, RollerBodyMat)
RollerD.position.y = -4

RollerBody.add(RollerA)
RollerBody.add(RollerB)
RollerBody.add(RollerC)
RollerBody.add(RollerD)

for (let i = 0; i < 10; i++)
{
	const RollerST1 = RollerBody.clone();
	RollerST1.position.x = -110 + (i * 10);
	RollerST1.name = "RollerSTA" + i

	const RollerST2 = RollerBody.clone();
	RollerST2.position.set(-110 + (i * 10), 2, -10);
	RollerST2.name = "RollerSTB" + i

	const RollerST3 = RollerBody.clone();
	RollerST3.position.set(-50 + (i * 10), 2, 0);
	RollerST3.name = "RollerSTC" + i

	scene.add(RollerST1, RollerST2, RollerST3);
}

for (let i = 0; i < 4; i++)
{
	const RollerST4 = RollerBody.clone();
	RollerST4.position.set(60, 2, (i * 10) + 20);
	RollerST4.rotateX(Math.PI/2)
	RollerST4.name = "RollerSTD" + i

	const RollerST5 = RollerBody.clone();
	RollerST5.position.set(60, 2, (i * -10) - 20);
	RollerST5.rotateX(Math.PI/2)
	RollerST5.name = "RollerSTE" + i

	scene.add(RollerST4, RollerST5);
}

function RollerGroupAnimation()
{
	for (let i = 0; i < 10; i++)
		scene.getObjectByName("RollerSTA" + i).rotateY(0.005)
}


// const RollerA1 = RollerBody.clone();
// RollerA1.position.x = -100;
// const RollerA2 = RollerBody.clone();
// RollerA1.position.x = -100;
// const RollerA3 = RollerBody.clone();
// RollerA1.position.x = -100;
// const RollerA4 = RollerBody.clone();
// RollerA1.position.x = -100;
// const RollerA5 = RollerBody.clone();
// RollerA1.position.x = -100;
// const RollerA6 = RollerBody.clone();
// RollerA1.position.x = -100;
// scene.add(RollerA1);



//#endregion

//#region Model Cut Machine Pulpit
const ModelPulpitCutMachine = await LoadGLTFModel('Models/PulpitCutMachine/PulpitCutMachine.gltf');
ModelPulpitCutMachine.scale.set(90, 90, 90);
scene.add(ModelPulpitCutMachine)
//#endregion

//#region Model Blocker
const ModelBlocker = await LoadGLTFModel('Models/Blocker/Blocker.gltf');
ModelBlocker.scale.set(40, 50, 50);
ModelBlocker.position.set(-15, 0, 10)
ModelBlocker.rotateY(Math.PI)

const ModelBlocker2 = ModelBlocker.clone()
ModelBlocker.position.set(-15, 0, -10)

scene.add(ModelBlocker, ModelBlocker2)
//#endregion

//#region Turntable
const TurntableAMGeo = new THREE.CylinderGeometry(10, 10, 1)
const TurntableAMat = new THREE.MeshStandardMaterial({color: 0xAAAAAA, roughness:0, metalness:0})
const TurntableA = new THREE.Mesh(TurntableAMGeo, TurntableAMat)
TurntableA.position.x = 60

const TurntableARoller1 = RollerBody.clone()
TurntableARoller1.position.set(-5, 2, 0)

const TurntableARoller2 = RollerBody.clone()
TurntableARoller2.position.set(5, 2, 0)

TurntableA.add(TurntableARoller1, TurntableARoller2)

scene.add(TurntableA)

function TurntableAAnimation()
{
	TurntableA.rotateY(0.001)
}
//#endregion

//#region Platform group
PlatformGroup.add(Platform);
// PlatformGroup.add(Strand1);
// PlatformGroup.add(Strand2);
PlatformGroup.position.set(-150, 50, 0);
scene.add(PlatformGroup);
//#endregion

//#region TurretGroup
TurretGroup.add(CylinderB);
TurretGroup.add(CylinderA);
TurretGroup.position.set(-Platform.geometry.parameters.width / 2, 5, 0);
TurretGroup.name = "TurretGroup";
PlatformGroup.add(TurretGroup);

function TurretGroupAnimation()
{
	TurretGroup.rotation.y += 0.001;
}

//#endregion

//#region Cut Machine Group
//CutMachineAGroup.add(TorchA);
//CutMachineAGroup.add(TorchB);
CutMachineAGroup.position.set(-110, 4, 10);
CutMachineAGroup.name = "CutMachineAGroup";
scene.add(CutMachineAGroup);
//#endregion

//#region ContextMenu select object by mouse
function OpenContextMenu(event)
{
	//prevent display default browser contextmenu
	event.preventDefault();

	const MyRaycaster = new THREE.Raycaster();
	const mouse = new THREE.Vector2();
	
	//calibrate mouse position
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	MyRaycaster.setFromCamera(mouse, camera);
	const intersects = MyRaycaster.intersectObjects(scene.children);
	intersects[0].object.material.color.setHex(Math.random() * 0xffffff);

	if (intersects[0].object.type != "Mesh")
		return false

	// remove previous ContextMenu
	if (scene.getObjectByName("CSS2DObject") !== undefined )
	{
		const parent = scene.getObjectByName("CSS2DObject").parent
		parent.remove(scene.getObjectByName("CSS2DObject"))
	}

	labelRenderer.domElement.style.pointerEvents = '';
	
	const Div = document.createElement('div');
	Div.className = 'ContextMenu';
	Div.innerHTML =
		"<ul>" +
		"<li>" + intersects[0].object.name + "</li>" +
		"<li> <a href='#'> Coffee </a> </li>" +
		"<li> <a href='?id=" + intersects[0].object.id + "'> properties </a> </li>" +
		"</ul>";

	const MyCSS2DObject = new CSS2DObject(Div);
	MyCSS2DObject.name = "CSS2DObject"
	MyCSS2DObject.position.set(1, 0, 0);
	MyCSS2DObject.center.set(0, 0);
	//earthLabel.layers.set(10);
	intersects[0].object.add(MyCSS2DObject);
}

function CloseContextMenu(event)
{
	labelRenderer.domElement.style.pointerEvents = 'none';
	const parent = scene.getObjectByName("CSS2DObject").parent
	parent.remove(scene.getObjectByName("CSS2DObject"))

	// for (let i = 0; i < scene.children.length; i++)
	// {
	// 	const objects = scene.children[i];
	// 	for (let i2 = 0; i2 < objects.children.length; i2++)
	// 	{
	// 		const child = objects.children[i2];
	// 		//console.log(child)
	// 		if (child instanceof CSS2DObject)
	// 		{
	// 			objects.remove(child);
	// 		}
	// 	}
	// }
}
window.addEventListener('contextmenu', OpenContextMenu);
window.addEventListener("dblclick", CloseContextMenu);

// const contextMenu = document.createElement('div');
// contextMenu.innerHTML =
// 	'<a href="#"> Context. </a>' +
// 	'<a href="#"> menu. </a>' +
// 	'<a href="#"> text. </a>'
// 	;
// contextMenu.className = 'ContextMenu';
// renderer.domElement.addEventListener('dblclick', event =>
// {
// 	event.preventDefault();

// 	// Determine the position of the mouse click
// 	const x = event.clientX;
// 	const y = event.clientY;

// 	// Show the context menu element
// 	contextMenu.style.top = `${y}px`;
// 	contextMenu.style.left = `${x}px`;
// 	contextMenu.style.display = 'block';
// });


// // Add a click event listener to the document object
// document.addEventListener('click', event =>
// {
// 	// Check whether the click occurred within the context menu
// 	if (!contextMenu.contains(event.target))
// 	{
// 		// If not, hide the context menu
// 		contextMenu.style.display = 'none';
// 	}
// });

// document.body.appendChild(contextMenu);
//#endregion

//#region Animate
function Animate()
{
	requestAnimationFrame(Animate);
	AnimateCube()
	AnimateGravity()
	CylinderA_MeltAnimation()
	TurretGroupAnimation();
	AnimateModelPreheater(ModelPreheater)
	AnimateRotateSegment();
	MyStrandAnimation()
	MyStrand1BoxAnimation()
	MyStrand2BoxAnimation()
	TorchMovement()
	CMATorchAFlameAnimation()
	RollerGroupAnimation()
	TurntableAAnimation()
	//MyOrbitControls.update(); // controls.autoRotate disable if we comment this line.
	MyFirstPersonControls.update(clock.getDelta());
	renderer.render(scene, camera); // not any more needed.
	labelRenderer.render(scene, camera);
}
Animate();
//#endregion


// center
//camera.position.set(0, 50, 50); //x, y, z
//camera.lookAt(0, 0, 0);

// Turret Group
camera.position.set(-180, 70, -20); //x, y, z
camera.lookAt(-200, 50, 0);

// // Platform
// camera.position.set(-166, 49, 52); //x, y, z
// camera.lookAt(-166, 30, 0);

// // Strands front
// camera.position.set(-150, 10, 30); //x, y, z
// camera.lookAt(-140, 0, 0);

// // Strands front
// camera.position.set(-80, 22, 0); //x, y, z
// camera.lookAt(-200, 0, 0);

// // Cut machine A front
// camera.position.set(-94, 7, 10); //x, y, z
// camera.lookAt(-200, 0, 0);

// // Roller
// camera.position.set(-90, 10, 0); //x, y, z
// camera.lookAt(-200, -50, 0);

// // Roller
// camera.position.set(0, 10, 0); //x, y, z
// camera.lookAt(-200, -50, 0);
