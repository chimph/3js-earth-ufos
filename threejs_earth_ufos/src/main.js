import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Earth
const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
const earthTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
const earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture });
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// Clouds
const cloudGeometry = new THREE.SphereGeometry(1.01, 32, 32);
const cloudTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png');
const cloudMaterial = new THREE.MeshPhongMaterial({ map: cloudTexture, transparent: true, opacity: 0.75 });
const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
scene.add(clouds);

// Surrounding Starfield
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.05 });

const starVertices = [];
for (let i = 0; i < 10000; i++) {
  const theta = 2 * Math.PI * Math.random();
  const phi = Math.acos(2 * Math.random() - 1);
  const radius = 50 + Math.random() * 50; // Stars between radius 50 and 100

  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi) * Math.sin(theta);
  const z = radius * Math.cos(phi);

  starVertices.push(x, y, z);
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// UFOs
const ufoGeometry = new THREE.ConeGeometry(0.05, 0.02, 32);
const ufoMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
const ufos = [];

// Laser material
const laserMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });

for (let i = 0; i < 5; i++) {
  const ufo = new THREE.Mesh(ufoGeometry, ufoMaterial);
  const angle = Math.random() * Math.PI * 2;
  const radius = 1.5 + Math.random() * 0.5;
  ufo.position.set(
    Math.cos(angle) * radius,
    (Math.random() - 0.5) * 2,
    Math.sin(angle) * radius
  );
  ufo.rotation.x = Math.PI / 2;
  scene.add(ufo);

  // Create laser
  const laserGeometry = new THREE.BufferGeometry();
  const laser = new THREE.Line(laserGeometry, laserMaterial);
  laser.visible = false;
  scene.add(laser);

  ufos.push({
    mesh: ufo,
    laser: laser,
    speed: 0.001 + Math.random() * 0.002,
    angle,
    lastShot: 0
  });
}

// Lighting
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xFFFFFF, 1, 100);
pointLight.position.set(5, 3, 5);
scene.add(pointLight);

// Camera position
camera.position.z = 3;

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Animation
function animate() {
  requestAnimationFrame(animate);

  const time = Date.now() * 0.001; // Current time in seconds

  earth.rotation.y += 0.001;
  clouds.rotation.y += 0.0012;

  // Animate UFOs and lasers
  ufos.forEach(ufo => {
    ufo.angle += ufo.speed;
    const radius = Math.sqrt(ufo.mesh.position.x ** 2 + ufo.mesh.position.z ** 2);
    ufo.mesh.position.x = Math.cos(ufo.angle) * radius;
    ufo.mesh.position.z = Math.sin(ufo.angle) * radius;
    ufo.mesh.rotation.y += 0.01;

    // Update laser position
    const start = ufo.mesh.position.clone();
    const earthCenter = new THREE.Vector3(0, 0, 0);
    const direction = earthCenter.sub(start).normalize();
    const earthIntersection = start.clone().add(direction.multiplyScalar(start.length() - 1.01));

    ufo.laser.geometry.setFromPoints([start, earthIntersection]);

    // Shoot laser
    if (time - ufo.lastShot > 2 + Math.random() * 3) { // Random interval between 2 and 5 seconds
      ufo.laser.visible = true;
      ufo.lastShot = time;

      // Animate laser
      setTimeout(() => {
        ufo.laser.visible = false;
      }, 200); // Laser visible for 200ms
    }
  });

  controls.update();

  renderer.render(scene, camera);
}

animate();

// Responsive design
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
