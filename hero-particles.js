import * as THREE from 'three';

/* ============================================
   HERO PARTICLES — тор-узел (torus knot)
   Адаптировано из particle swarm:
   - форма: спираль тор-узла (40 витков), как в оригинале
   - монохромная палитра под сайт (вместо неоновых цветов)
   - THREE.Points вместо InstancedMesh + конусов (легче)
   - без OrbitControls и bloom (перф + не мешает скроллу)
   ============================================ */

const canvas = document.getElementById('hero-particles');
if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const section = document.getElementById('hero-particles-section');

  const COUNT = 6000;
  // Масштаб тор-узла под размер сцены (в оригинале R=25, r=8 — уменьшаем пропорционально)
  const R = 4.2;
  const r = 1.4;
  const TURNS = 40;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    55,
    section.clientWidth / section.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 11);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(section.clientWidth, section.clientHeight);

  /* ---------- Точки по формуле тор-узла ---------- */
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(COUNT * 3);

  for (let i = 0; i < COUNT; i++) {
    const u = (i / COUNT) * Math.PI * 2 * TURNS;
    const v = (i / COUNT) * Math.PI * 2;

    const x = (R + r * Math.cos(u)) * Math.cos(v);
    const y = (R + r * Math.cos(u)) * Math.sin(v);
    const z = r * Math.sin(u);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y * 0.5; // сплющиваем по Y под альбомный формат hero
    positions[i * 3 + 2] = z;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0x9a9a9a,
    size: 0.026,
    transparent: true,
    opacity: 0.4,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  /* ---------- Автовращение + лёгкая реакция на курсор ---------- */
  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  const clock = new THREE.Clock();

  function animate() {
    const t = clock.getElapsedTime();

    points.rotation.z = t * 0.06 + mouseX * 0.12;
    points.rotation.x = 0.35 + mouseY * 0.08;

    material.opacity = 0.36 + Math.sin(t * 0.4) * 0.06;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  /* ---------- Ресайз ---------- */
  window.addEventListener('resize', () => {
    const w = section.clientWidth;
    const h = section.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}
