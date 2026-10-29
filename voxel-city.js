import * as THREE from "./assets/three.module.min.js";

const canvas = document.getElementById("voxelCity");
if (canvas) initVoxelCity(canvas);

function initVoxelCity(canvas) {
  const stage = canvas.closest(".voxel-stage");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch (_) {
    if (stage) stage.classList.add("no3d");
    return;
  }

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06100b, 0.026);

  const camera = new THREE.PerspectiveCamera(34, 16 / 9, 0.1, 140);
  camera.position.set(-6.4, 10.2, 22.5);
  camera.lookAt(1.4, 1.6, 0);

  const world = new THREE.Group();
  scene.add(world);

  scene.add(new THREE.HemisphereLight(0xd4f2d8, 0x08120e, 1.55));

  const key = new THREE.DirectionalLight(0xd9f5c8, 1.8);
  key.position.set(-9, 16, 11);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x9fe6d8, 0.55);
  fill.position.set(8, 6, 16);
  scene.add(fill);

  const warm = new THREE.PointLight(0x8fe3b6, 30, 30, 2);
  warm.position.set(5, 4.6, 4.5);
  scene.add(warm);

  const cyan = new THREE.PointLight(0x5fd6a8, 18, 28, 2);
  cyan.position.set(-7, 3.6, -4);
  scene.add(cyan);

  const mint = new THREE.PointLight(0xa9efbd, 12, 22, 2);
  mint.position.set(0, 2.6, 7);
  scene.add(mint);

  // ---------------------------------------------------------------- ground
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x0a1a10,
    roughness: 0.95,
    metalness: 0.05,
  });
  const ground = new THREE.Mesh(new THREE.BoxGeometry(30, 0.2, 30), groundMat);
  ground.position.y = -0.1;
  world.add(ground);

  const grid = new THREE.GridHelper(30, 30, 0x2b5f3c, 0x163a24);
  grid.position.y = 0.01;
  grid.material.transparent = true;
  grid.material.opacity = 0.24;
  world.add(grid);

  // road
  const road = new THREE.Mesh(
    new THREE.BoxGeometry(22, 0.14, 3.1),
    new THREE.MeshStandardMaterial({ color: 0x0b140f, roughness: 0.8, metalness: 0.15 }),
  );
  road.position.y = 0.05;
  world.add(road);

  const dashMat = new THREE.MeshBasicMaterial({ color: 0xc9e6a8, transparent: true, opacity: 0.75 });
  for (let x = -10; x <= 10; x += 2.6) {
    const dash = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.02, 0.09), dashMat);
    dash.position.set(x, 0.13, 0);
    world.add(dash);
  }
  for (let x = -10.5; x <= 10.5; x += 0.6) {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.02, 0.75),
      new THREE.MeshBasicMaterial({ color: 0x5f7060, transparent: true, opacity: 0.55 }),
    );
    stripe.position.set(x, 0.13, 1.55);
    world.add(stripe);
  }

  // sidewalks
  const walkMat = new THREE.MeshStandardMaterial({ color: 0x16241a, roughness: 0.9 });
  [-2.15, 2.15].forEach((z) => {
    const walk = new THREE.Mesh(new THREE.BoxGeometry(23, 0.12, 1.15), walkMat);
    walk.position.set(0, 0.04, z);
    world.add(walk);
  });

  // ---------------------------------------------------------------- buildings
  let seed = 91;
  function rand() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  const bodies = [];
  const windows = [];
  const palette = [0x11251f, 0x16302a, 0x1b3730, 0x142a2b, 0x22332a, 0x0f2020];
  const winPalette = [0xd9f7a8, 0xb9f5c9, 0xa9efbd, 0x6fd6a8, 0xa9efbd];

  for (let x = -10.2; x <= 10.2; x += 1.75) {
    [-1, 1].forEach((side) => {
      for (let row = 0; row < 2; row++) {
        if (Math.abs(x) < 0.9) continue;
        // keep the near side open in the middle so the road and car are visible
        if (side === 1 && Math.abs(x) < 4.6) continue;
        const w = 1.0 + rand() * 0.7;
        const d = 1.0 + rand() * 0.7;
        const h = 1.2 + rand() * (row === 0 ? 4.2 : 3.4);
        const z = side * (2.6 + row * 1.9);
        bodies.push({
          x: x + (rand() - 0.5) * 0.24,
          z,
          w,
          d,
          h,
          color: palette[Math.floor(rand() * palette.length)],
          side,
        });

        if (h > 3.8 && rand() > 0.45) {
          windows.push({ kind: "cap", x, z, w, d, h });
        }
      }
    });
  }

  const bodyGeo = new THREE.BoxGeometry(1, 1, 1);
  const bodyMat = new THREE.MeshStandardMaterial({ roughness: 0.84, metalness: 0.08 });
  const bodyMesh = new THREE.InstancedMesh(bodyGeo, bodyMat, bodies.length);
  bodyMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);

  const dummy = new THREE.Object3D();
  const col = new THREE.Color();

  bodies.forEach((b, i) => {
    dummy.position.set(b.x, b.h / 2 + 0.12, b.z);
    dummy.scale.set(b.w, b.h, b.d);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    bodyMesh.setMatrixAt(i, dummy.matrix);
    const base = new THREE.Color(b.color);
    const tint = 0.85 + rand() * 0.3;
    bodyMesh.setColorAt(i, base.multiplyScalar(tint));
  });
  bodyMesh.instanceMatrix.needsUpdate = true;
  if (bodyMesh.instanceColor) bodyMesh.instanceColor.needsUpdate = true;
  world.add(bodyMesh);

  // window panels, instanced
  const winGeo = new THREE.PlaneGeometry(0.2, 0.22);
  const winMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, toneMapped: false });
  const winMesh = new THREE.InstancedMesh(winGeo, winMat, 2400);
  winMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  let wi = 0;

  function addWindow(px, py, pz, rotY, color, scale) {
    if (wi >= 2400) return;
    dummy.position.set(px, py, pz);
    dummy.rotation.set(0, rotY, 0);
    dummy.scale.set(scale, scale, 1);
    dummy.updateMatrix();
    winMesh.setMatrixAt(wi, dummy.matrix);
    winMesh.setColorAt(wi, col.setHex(color));
    wi += 1;
  }

  bodies.forEach((b) => {
    const cols = Math.max(1, Math.floor(b.w / 0.42));
    const rows = Math.max(1, Math.floor(b.h / 0.62));
    const faceZ = b.z + (b.side * (b.d / 2 + 0.012));
    const rotY = b.side > 0 ? Math.PI : 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const litChance = rand();
        if (litChance < 0.42) continue;
        const color = winPalette[Math.floor(rand() * winPalette.length)];
        const scale = litChance > 0.9 ? 1.15 : 1;
        addWindow(
          b.x - b.w / 2 + 0.24 + c * 0.42,
          0.55 + r * 0.62,
          faceZ,
          rotY,
          color,
          scale,
        );
      }
    }
  });

  winMesh.count = wi;
  winMesh.instanceMatrix.needsUpdate = true;
  if (winMesh.instanceColor) winMesh.instanceColor.needsUpdate = true;
  world.add(winMesh);

  // rooftop caps
  const capMat = new THREE.MeshBasicMaterial({ color: 0x8fe3b6, transparent: true, opacity: 0.9 });
  windows.forEach((w) => {
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.1, 0.26), capMat);
    cap.position.set(w.x, w.h + 0.2, w.z);
    world.add(cap);
  });

  // antenna beacons
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xb9f5c9 });
  const beacons = [];
  bodies.forEach((b, i) => {
    if (b.h > 4.4 && i % 5 === 0) {
      const beacon = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.28, 0.07), beaconMat);
      beacon.position.set(b.x, b.h + 0.38, b.z);
      world.add(beacon);
      beacons.push(beacon);
    }
  });

  // street lamps
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x1c2a1e, roughness: 0.7, metalness: 0.35 });
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xd9ffcf, toneMapped: false });
  const lampPositions = [-7.4, -2.6, 2.6, 7.4];
  lampPositions.forEach((x) => {
    const pole = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.4, 0.08), poleMat);
    pole.position.set(x, 1.2, 1.95);
    world.add(pole);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 0.12), lampMat);
    head.position.set(x, 2.42, 1.86);
    world.add(head);
  });

  // ---------------------------------------------------------------- car
  const car = new THREE.Group();
  const carBody = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.36, 0.74),
    new THREE.MeshStandardMaterial({ color: 0x5f9e7f, roughness: 0.42, metalness: 0.3 }),
  );
  carBody.position.y = 0.46;
  car.add(carBody);

  const carTop = new THREE.Mesh(
    new THREE.BoxGeometry(0.74, 0.3, 0.62),
    new THREE.MeshStandardMaterial({ color: 0x123a26, roughness: 0.3, metalness: 0.35 }),
  );
  carTop.position.set(0.06, 0.78, 0);
  car.add(carTop);

  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x060a0b, roughness: 0.95 });
  for (let i = 0; i < 4; i++) {
    const wheel = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.3, 0.16), wheelMat);
    wheel.position.set(i < 2 ? -0.46 : 0.46, 0.22, i % 2 === 0 ? 0.41 : -0.41);
    car.add(wheel);
  }

  const headMat = new THREE.MeshBasicMaterial({ color: 0xe4ffd6, toneMapped: false });
  [-0.22, 0.22].forEach((z) => {
    const light = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.14), headMat);
    light.position.set(0.77, 0.48, z);
    car.add(light);
  });

  const tailMat = new THREE.MeshBasicMaterial({ color: 0xb9f5c9, toneMapped: false });
  [-0.22, 0.22].forEach((z) => {
    const light = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.12), tailMat);
    light.position.set(-0.77, 0.48, z);
    car.add(light);
  });

  const beam = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 1.2),
    new THREE.MeshBasicMaterial({
      color: 0xd9ffcf,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    }),
  );
  beam.position.set(2.4, 0.5, 0);
  beam.rotation.x = -Math.PI / 2;
  car.add(beam);

  car.position.set(-4, 0.14, 0.85);
  world.add(car);

  // ---------------------------------------------------------------- sky
  const starGeo = new THREE.BufferGeometry();
  const starPos = [];
  for (let i = 0; i < 170; i++) {
    starPos.push((rand() - 0.5) * 46, 9 + rand() * 18, (rand() - 0.5) * 40);
  }
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      color: 0xe6f0e0,
      size: 0.14,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    }),
  );
  scene.add(stars);

  // a few floating dust motes close to camera
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = [];
  for (let i = 0; i < 60; i++) {
    dustPos.push((rand() - 0.5) * 18, rand() * 8, (rand() - 0.5) * 14);
  }
  dustGeo.setAttribute("position", new THREE.Float32BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      color: 0xa9efbd,
      size: 0.05,
      transparent: true,
      opacity: 0.5,
    }),
  );
  world.add(dust);

  // ---------------------------------------------------------------- resize + loop
  let pointerX = 0;
  let pointerY = 0;
  let visible = true;
  let running = false;
  const clock = new THREE.Clock();

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(320, Math.round(rect.width));
    const h = Math.max(220, Math.round(rect.height));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (reduceMotion.matches) renderer.render(scene, camera);
  }

  function animate() {
    if (!running) return;
    const t = clock.getElapsedTime();

    world.rotation.y = Math.sin(t * 0.1) * 0.045;
    car.position.x = Math.sin(t * 0.42) * 3.8;
    car.position.z = 0.95 + Math.sin(t * 0.42 + 1) * 0.12;

    camera.position.x = -6.4 + pointerX * 1.5 + Math.sin(t * 0.13) * 0.55;
    camera.position.y = 10.2 + pointerY * 0.7;
    camera.lookAt(1.4, 1.6, 0);

    warm.intensity = 24 + Math.sin(t * 1.5) * 6;
    cyan.intensity = 16 + Math.sin(t * 0.9 + 2) * 4;
    stars.rotation.y = t * 0.006;
    dust.position.y = Math.sin(t * 0.3) * 0.35;
    beacons.forEach((b, i) => {
      b.visible = Math.sin(t * 1.7 + i * 1.3) > -0.2;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  function start() {
    if (running || reduceMotion.matches) return;
    running = true;
    clock.getDelta();
    requestAnimationFrame(animate);
  }
  function stop() { running = false; }

  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas);
  window.addEventListener("pointermove", (e) => {
    if (reduceMotion.matches) return;
    pointerX = (e.clientX / window.innerWidth - 0.5) * 1.3;
    pointerY = (e.clientY / window.innerHeight - 0.5) * 0.55;
  }, { passive: true });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      visible = !!(entries[0] && entries[0].isIntersecting);
      if (visible) start(); else stop();
    }, { rootMargin: "140px" }).observe(canvas);
  } else {
    start();
  }

  resize();
  renderer.render(scene, camera);
  start();

  reduceMotion.addEventListener("change", () => {
    if (reduceMotion.matches) {
      stop();
      renderer.render(scene, camera);
    } else {
      start();
    }
  });
}
