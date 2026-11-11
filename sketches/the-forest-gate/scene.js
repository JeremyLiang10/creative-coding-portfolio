import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color('#17232a');
scene.fog = new THREE.Fog('#17232a', 9, 24);

const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
camera.position.set(2.5, 2.1, 8.4);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.domElement.setAttribute('aria-label', 'A soldier on a forest path in front of a purple magic gate');
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.35, 0.4);
controls.enablePan = false;
controls.enableZoom = false;
controls.minPolarAngle = Math.PI / 5;
controls.maxPolarAngle = Math.PI / 2;
controls.update();

function addMesh(geometry, material, x, y, z) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  scene.add(mesh);
  return mesh;
}

function matte(color) {
  return new THREE.MeshStandardMaterial({ color, flatShading: true });
}

function box(width, height, depth, material, x, y, z) {
  return addMesh(new THREE.BoxGeometry(width, height, depth), material, x, y, z);
}

const ground = addMesh(new THREE.PlaneGeometry(60, 60), matte('#344634'), 0, 0.12, 0);
ground.rotation.x = -Math.PI / 2;

// Trace the edges of the dirt path in ground coordinates (x, z).
const pathOutline = [
  [-0.75, -0.28], [-0.72, 0.68], [-0.83, 1.40], [-0.69, 2.24],
  [-0.93, 3.16], [-1.38, 4.44], [-1.45, 5.58], [-1.86, 7.24],
  [-1.24, 9.65], [0.92, 9.58], [0.73, 7.25], [0.96, 5.62],
  [0.89, 4.44], [1.20, 3.14], [1.07, 2.30], [0.84, 1.50],
  [0.78, 0.72], [0.75, -0.28]
];
const pathShape = new THREE.Shape(pathOutline.map(([x, z]) => new THREE.Vector2(x, -z)));
const dirt = addMesh(new THREE.ShapeGeometry(pathShape), matte('#594838'), 0, 0.123, 0);
dirt.rotation.x = -Math.PI / 2;

// A few flat patches break up the color of the forest floor.
const moss = matte('#3e5137');
function mossPatch(x, z, width, depth, angle) {
  const patch = addMesh(new THREE.CircleGeometry(1, 7), moss, x, 0.122, z);
  patch.rotation.set(-Math.PI / 2, 0, angle);
  patch.scale.set(width, depth, 1);
}

mossPatch(-2.1, 0.7, 0.82, 0.51, 0.31);
mossPatch(2.5, 1.7, 1.12, 0.62, -0.24);
mossPatch(-2.4, 3.5, 1.35, 0.63, -0.35);
mossPatch(2.2, 4.1, 0.84, 0.47, 0.48);

// Build each pine from a trunk and two overlapping cones.
const bark = matte('#51413d');
const lowerLeaves = matte('#25493f');
const upperLeaves = matte('#355c4c');

function pine(x, z, height) {
  addMesh(new THREE.CylinderGeometry(0.035 * height, 0.05 * height, 0.56 * height, 6),
    bark, x, 0.12 + height * 0.28, z);
  addMesh(new THREE.ConeGeometry(0.24 * height, 0.65 * height, 6),
    lowerLeaves, x, 0.12 + height * 0.55, z);
  addMesh(new THREE.ConeGeometry(0.18 * height, 0.55 * height, 6),
    upperLeaves, x, 0.12 + height * 0.77, z);
}

// Leave a clearing in the middle so the gate stays visible.
pine(-3.4, 1.0, 4.5);
pine(3.7, 2.1, 4.8);
pine(-2.8, -1.7, 3.8);
pine(2.8, -0.9, 3.7);
pine(-4.9, -3.9, 4.9);
pine(4.9, -3.6, 4.9);
pine(-2.2, -4.6, 4.3);
pine(0.1, -5.5, 4.6);
pine(2.5, -5.8, 5.0);
pine(-5.2, -7.8, 5.3);
pine(-2.9, -8.5, 5.4);
pine(0.6, -8.8, 5.5);
pine(4.4, -8.1, 5.5);

// Two pillars and one beam frame a flat violet portal.
const stone = matte('#77708e');
box(0.42, 2.15, 0.46, stone, -0.95, 1.195, -0.22);
box(0.42, 2.15, 0.46, stone, 0.95, 1.195, -0.22);
box(2.45, 0.42, 0.52, stone, 0, 2.48, -0.22);

const portalMaterial = new THREE.MeshBasicMaterial({
  color: '#ae68ff',
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.76
});
addMesh(new THREE.PlaneGeometry(1.48, 2.15), portalMaterial, 0, 1.195, -0.22);

const portalLight = new THREE.PointLight('#bf68ff', 9, 5);
portalLight.position.set(0, 0.95, 0.4);
scene.add(portalLight);

// Three flat stones make a short path to the gate.
const pathStone = matte('#545453');
box(1.10, 0.10, 0.58, pathStone, 0, 0.15, 0.55).rotation.y = 0.05;
box(1.02, 0.10, 0.54, pathStone, 0.09, 0.15, 1.38).rotation.y = -0.12;
box(1.18, 0.10, 0.60, pathStone, 0.29, 0.15, 2.25).rotation.y = 0.13;

scene.add(new THREE.HemisphereLight('#d9dfff', '#8a80a4', 1.65));
const moonlight = new THREE.DirectionalLight('#d1dfff', 2.2);
moonlight.position.set(-3, 6, 4);
scene.add(moonlight);

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.zoom = Math.min(1, camera.aspect / 0.9);
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', resize);
resize();

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let soldierMixer;

// Mixamo's Soldier model from the Three.js skinning and blending example.
const loader = new GLTFLoader();
const soldierUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/r180/examples/models/gltf/Soldier.glb';
loader.load(soldierUrl, (gltf) => {
  const soldier = gltf.scene;
  soldier.position.set(-0.45, 0.123, 3.1);
  soldier.rotation.y = -0.14;
  scene.add(soldier);

  soldierMixer = new THREE.AnimationMixer(soldier);
  const idle = THREE.AnimationClip.findByName(gltf.animations, 'Idle');
  soldierMixer.clipAction(idle).play();
  soldierMixer.update(0);
}, undefined, (error) => {
  console.error('Could not load Soldier.glb:', error);
});

let previousTime;
renderer.setAnimationLoop((time) => {
  const delta = previousTime === undefined ? 0 : Math.min((time - previousTime) / 1000, 0.05);
  previousTime = time;
  if (soldierMixer && !reducedMotion.matches) soldierMixer.update(delta);

  const pulse = reducedMotion.matches ? 0 : Math.sin(time * 0.002);
  portalMaterial.opacity = 0.76 + pulse * 0.1;
  portalLight.intensity = 9 + pulse * 2;
  renderer.render(scene, camera);
});
