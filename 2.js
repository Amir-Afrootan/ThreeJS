import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import * as CANNON from 'cannon-es';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const world = new CANNON.World({
	gravity: new CANNON.Vec3(0, -9.81, 0) // m/s²
});

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 30, 80);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

const AmbientLight = new THREE.AmbientLight(0xffffff);
scene.add(AmbientLight);

//#region Plane
const groundGeo = new THREE.PlaneGeometry(30, 30);
const groundMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, wireframe: true });
const groundMesh = new THREE.Mesh(groundGeo, groundMat);
scene.add(groundMesh);
const groundPhysMat = new CANNON.Material();
const groundBody = new CANNON.Body({
	//shape: new CANNON.Plane(),
	//mass: 10
	shape: new CANNON.Box(new CANNON.Vec3(15, 15, 0.1)),
	type: CANNON.Body.STATIC,
	material: groundPhysMat
});
world.addBody(groundBody);
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

//#endregion

//#region Box
const boxGeo = new THREE.BoxGeometry(2, 2, 2);
const boxMat = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: true });
const boxMesh = new THREE.Mesh(boxGeo, boxMat);
scene.add(boxMesh);

const boxPhysMat = new CANNON.Material();
const boxBody = new CANNON.Body({
	mass: 1,
	shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
	position: new CANNON.Vec3(1, 10, 1),
	material: boxPhysMat
});
world.addBody(boxBody);

boxBody.angularVelocity.set(0, 10, 0);
boxBody.angularDamping = 0.5;

const groundBoxContactMat = new CANNON.ContactMaterial(
	groundPhysMat,
	boxPhysMat,
	{ friction: 0.04 }
);
world.addContactMaterial(groundBoxContactMat);

//#endregion

//#region Sphere
const sphereGeo = new THREE.SphereGeometry(2);
const sphereMat = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true, });
const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
scene.add(sphereMesh);

const spherePhysMat = new CANNON.Material();
const sphereBody = new CANNON.Body({
	mass: 10,
	shape: new CANNON.Sphere(2),
	position: new CANNON.Vec3(0, 20, 0),
	material: spherePhysMat
});
world.addBody(sphereBody);
sphereBody.linearDamping = 0.21
//#endregion

//#region sylinder
const cylinderGeo = new THREE.CylinderGeometry(4, 4, 8);
const cylinderMat = new THREE.MeshStandardMaterial({ color: 0x659415, wireframe: false })
const cylinderMesh = new THREE.Mesh(cylinderGeo, cylinderMat);
cylinderMesh.receiveShadow = true;
scene.add(cylinderMesh);

const cylinderBody = new CANNON.Body({
	mass: 10,
	shape: new CANNON.Cylinder(4, 4, 8),
	position: new CANNON.Vec3(0, 5, 0),
})
world.addBody(cylinderBody)

//#endregion








const groundSphereContactMat = new CANNON.ContactMaterial(
	groundPhysMat,
	spherePhysMat,
	{ restitution: 0.9 }
);

world.addContactMaterial(groundSphereContactMat);





function animate()
{
	world.fixedStep()

	groundMesh.position.copy(groundBody.position);
	groundMesh.quaternion.copy(groundBody.quaternion);

	boxMesh.position.copy(boxBody.position);
	boxMesh.quaternion.copy(boxBody.quaternion);

	sphereMesh.position.copy(sphereBody.position);
	sphereMesh.quaternion.copy(sphereBody.quaternion);

	cylinderMesh.position.copy(cylinderBody.position);
	cylinderMesh.quaternion.copy(cylinderBody.quaternion);

	renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function ()
{
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});




