/**
 * Three.js 3D Particle Background
 * Creates an underwater-inspired particle field with mouse parallax
 */
import * as THREE from 'three';

// ─── Performance Detection ───────────────────────────────
const isMobile = /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent);
const pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);
const PARTICLE_COUNT = isMobile ? 1500 : 4000;

// ─── Scene Setup ─────────────────────────────────────────
const canvas = document.getElementById('hero-canvas');
const scene = new THREE.Scene();

// Detect if WebGL is available
let useWebGL = true;
try {
  const testCanvas = document.createElement('canvas');
  const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
  if (!gl) useWebGL = false;
} catch (e) {
  useWebGL = false;
}

if (!useWebGL) {
  // Hide canvas gracefully — no 3D background
  canvas.style.display = 'none';
  console.log('WebGL not available — 3D background disabled');
} else {
  initBackground();
}

function initBackground() {
  // Camera
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 30;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);

  // ─── Particle Geometry ──────────────────────────────────
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const velocities = new Float32Array(PARTICLE_COUNT); // For individual float speeds

  // Color palettes for underwater feel
  const palette = [
    new THREE.Color('#64ffda'), // mint accent
    new THREE.Color('#00b8f0'), // bright aqua
    new THREE.Color('#4dd4ff'), // light cyan
    new THREE.Color('#008e76'), // deep teal
    new THREE.Color('#80e0ff'), // pale blue
    new THREE.Color('#ffffff'), // white sparkle
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Distribute in a 3D volume (wider than tall for hero section)
    const spreadX = 40;
    const spreadY = 25;
    const spreadZ = 20;

    positions[i * 3] = (Math.random() - 0.5) * spreadX;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spreadY;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spreadZ;

    // Random color from palette
    const color = palette[Math.floor(Math.random() * palette.length)].clone();
    // Slight variation
    color.r += (Math.random() - 0.5) * 0.1;
    color.g += (Math.random() - 0.5) * 0.1;
    color.b += (Math.random() - 0.5) * 0.1;

    colors[i * 3] = Math.max(0, Math.min(1, color.r));
    colors[i * 3 + 1] = Math.max(0, Math.min(1, color.g));
    colors[i * 3 + 2] = Math.max(0, Math.min(1, color.b));

    // Varying sizes: some big (bubbles), some small (sparkles)
    sizes[i] = Math.random() < 0.15
      ? 0.08 + Math.random() * 0.12   // 15% big particles
      : 0.015 + Math.random() * 0.04; // 85% small particles

    velocities[i] = 0.003 + Math.random() * 0.015;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.userData = { velocities };

  // ─── Circle Texture (generated, no external file) ───────
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = 64;
  textureCanvas.height = 64;
  const ctx = textureCanvas.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.1, 'rgba(255, 255, 255, 0.9)');
  gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)');
  gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.05)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  const particleTexture = new THREE.CanvasTexture(textureCanvas);

  // ─── Material ───────────────────────────────────────────
  const material = new THREE.PointsMaterial({
    size: 0.15,
    map: particleTexture,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: true,
    transparent: true,
    opacity: 0.8,
  });

  // ─── Points System ──────────────────────────────────────
  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // ─── Secondary particle ring (orbiting dust) ────────────
  const ringGeom = new THREE.BufferGeometry();
  const ringCount = 800;
  const ringPositions = new Float32Array(ringCount * 3);
  for (let i = 0; i < ringCount; i++) {
    const angle = (i / ringCount) * Math.PI * 2;
    const radius = 12 + Math.random() * 6;
    const height = (Math.random() - 0.5) * 18;
    ringPositions[i * 3] = Math.cos(angle) * radius;
    ringPositions[i * 3 + 1] = height;
    ringPositions[i * 3 + 2] = Math.sin(angle) * radius + 5;
  }
  ringGeom.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));

  const ringMat = new THREE.PointsMaterial({
    size: 0.04,
    map: particleTexture,
    color: new THREE.Color('#64ffda'),
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.3,
  });

  const ring = new THREE.Points(ringGeom, ringMat);
  ring.name = 'ring';
  scene.add(ring);

  // ─── Mouse Interaction ──────────────────────────────────
  const mouse = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Touch support
  window.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
  }, { passive: true });

  // ─── Animation Loop ─────────────────────────────────────
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const time = performance.now() * 0.001;

    // Smooth mouse follow (lerp)
    target.x += (mouse.x - target.x) * 0.03;
    target.y += (mouse.y - target.y) * 0.03;

    // Rotate entire scene slightly toward mouse
    particles.rotation.y += (target.x * 0.2 - particles.rotation.y) * 0.02;
    particles.rotation.x += (target.y * 0.15 - particles.rotation.x) * 0.02;

    ring.rotation.y += (target.x * 0.15 - ring.rotation.y) * 0.02;
    ring.rotation.x += (target.y * 0.1 - ring.rotation.x) * 0.02;

    // Animate individual particles (subtle float)
    const posArray = geometry.attributes.position.array;
    const velArray = geometry.userData.velocities;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Gentle sinusoidal float
      posArray[i * 3 + 1] += Math.sin(time * 0.8 + i * 0.01) * velArray[i];
      posArray[i * 3] += Math.cos(time * 0.6 + i * 0.013) * velArray[i] * 0.5;

      // Wrap particles that drift too far
      if (posArray[i * 3 + 1] > 15) posArray[i * 3 + 1] = -15;
      if (posArray[i * 3 + 1] < -15) posArray[i * 3 + 1] = 15;
    }
    geometry.attributes.position.needsUpdate = true;

    // Subtle camera movement
    camera.position.x += (target.x * 2 - camera.position.x) * 0.02;
    camera.position.y += (target.y * 1.5 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();

  // ─── Resize Handler ─────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(pixelRatio);
  });

  console.log(`🌊 Underwater particle field initialized: ${PARTICLE_COUNT} particles`);
}
