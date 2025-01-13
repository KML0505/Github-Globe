import * as THREE from 'three';
import Globe from 'three-globe';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import countries from "./files/custom.geo.json";
import lines from "./files/lines.json";
import map from "./files/map.json";

let renderer, camera, scene, controls;
let mouseX = 0;
let mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

init();
initGlobe();
animate();

function init() {
  // Initialize Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Initialize Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050e1c);

  // Initialize Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 400);
  scene.add(camera);

  // Add Lighting
  const ambientLight = new THREE.AmbientLight(0xbbbbbb, 2);
  scene.add(ambientLight);

  const dLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dLight.position.set(-800, 2000, 400);
  camera.add(dLight);

  const dLight1 = new THREE.DirectionalLight(0x7982f6, 1);
  dLight1.position.set(-200, 500, 200);
  camera.add(dLight1);

  const dLight2 = new THREE.PointLight(0x8566cc, 0.5);
  dLight2.position.set(-200, 500, 200);
  camera.add(dLight2);

  scene.fog = new THREE.Fog(0x535ef3, 400, 2000);

  // Initialize Orbit Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dynamicDampingFactor = 0.01;
  controls.enablePan = false;
  controls.minDistance = 200;
  controls.maxDistance = 500;
  controls.rotateSpeed = 0.8;
  controls.zoomSpeed = 0.8;
  controls.autoRotate = false;
  controls.minPolarAngle = Math.PI / 3.5;
  controls.maxPolarAngle = Math.PI - Math.PI / 3;

  // Add Event Listeners
  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("mousemove", onMouseMove);

  // Stars
  addStars()
}

function initGlobe() {
  const globe = new Globe({ waitForGlobeReady: true, animateIn: true })
    .hexPolygonsData(countries.features)
    .hexPolygonResolution(3)
    .hexPolygonMargin(0.7)
    .showAtmosphere(true)
    .atmosphereColor("#3a228a")
    .atmosphereAltitude(0.25);

  setTimeout(() => {
    globe
      .arcsData(lines.pulls)
      .arcColor((e) => (e.status ? "#9cff00" : "#ff4000"))
      .arcAltitude((e) => e.arcAlt)
      .arcStroke((e) => (e.status ? 0.5 : 0.3))
      .arcDashLength(0.5)
      .arcDashGap(4)
      .arcDashAnimateTime(1000)
      .arcsTransitionDuration(1000)
      .arcDashInitialGap((e) => e.order * 1)
      .labelsData(map.maps)
      .labelColor(() => "#ffcb21")
      .labelDotRadius(0.3)
      .labelSize((e) => e.size)
      .labelText("city")
      .labelResolution(6)
      .labelAltitude(0.01)
      .pointsData(map.maps)
      .pointColor(() => "#ffffff")
      .pointsMerge(true)
      .pointAltitude(0.07)
      .pointRadius(0.05);
  }, 1000);

  globe.rotateY(-Math.PI * (5 / 9));
  globe.rotateZ(-Math.PI / 6);

  const globeMaterial = globe.globeMaterial();
  globeMaterial.color = new THREE.Color(0x3a228a);
  globeMaterial.emissive = new THREE.Color(0x220038);
  globeMaterial.emissiveIntensity = 0.2;
  globeMaterial.shininess = 0.7;

  scene.add(globe);
}

function onMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  camera.position.x +=
    Math.abs(mouseX) <= windowHalfX / 2
      ? (mouseX / 2 - camera.position.x) * 0.005
      : 0;
  camera.position.y += (-mouseY / 2 - camera.position.y) * 0.005;
  camera.lookAt(scene.position);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function addStars() {
    const starCount = 1000; 
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const sizes = [];
  
    // Create random positions and sizes for the stars
    for (let i = 0; i < starCount; i++) {
      const x = (Math.random() - 0.5) * 2000; 
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      positions.push(x, y, z);
      sizes.push(Math.random() * 1.5 + 0.5); 
    }
  
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setAttribute(
      "size",
      new THREE.Float32BufferAttribute(sizes, 1)
    );
  
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      map: new THREE.TextureLoader().load(
        "star.png"
      ),
      blending: THREE.AdditiveBlending,
    });
  
    const stars = new THREE.Points(geometry, material);
  
    scene.add(stars);
  
    const clock = new THREE.Clock();
    function animateStars() {
      const time = clock.getElapsedTime();
      stars.material.opacity = 0.6 + Math.sin(time * 1) * 0.4; 
      requestAnimationFrame(animateStars);
    }
    animateStars();
  }
  
