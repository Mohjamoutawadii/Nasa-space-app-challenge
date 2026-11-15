import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ========================================
// 1. CONFIGURATION DES TROIS SITES
// ========================================

const sites = [
  {
    type: 'ridge',
    name: 'Sunny Ridge',
    icon: '☀️',
    description: 'A ridge that receives a lot of sunlight.',
    look: {
      ground: 0xb8b2a5,
      sun: 0xfff1c0,
      sunPower: 1.5,
      ambient: 0.4,
      rocks: 15
    },
    points: [
      {
        position: [12, 0, 8],
        title: '☀️ Sunlight',
        text: 'This ridge receives a lot of sunlight. Solar panels could produce energy here!'
      },
      {
        position: [20, 0, -8],
        title: '⛰️ Terrain',
        text: 'Look at the slopes. A very steep surface can make landing and building difficult.'
      },
      {
        position: [5, 0, -18],
        title: '🧊 Water ice',
        text: 'We need to investigate whether water ice exists nearby. We cannot assume it is present here.'
      }
    ]
  },
  {
    type: 'crater',
    name: 'Shadowed Crater',
    icon: '🌑',
    description: 'A permanently shadowed region that could preserve water ice.',
    look: {
      ground: 0x5a5f6b,
      sun: 0x8fb4ff,
      sunPower: 0.3,
      ambient: 0.3,
      rocks: 12
    },
    points: [
      {
        position: [8, 0, 10],
        title: '🌑 Sunlight',
        text: 'This crater receives very little direct sunlight. Solar panels would be difficult to use here.'
      },
      {
        position: [20, 0, -5],
        title: '⛰️ Terrain',
        text: 'The crater has slopes and uneven ground. Landing and construction could be challenging.'
      },
      {
        position: [-8, 0, -15],
        title: '🧊 Water ice',
        text: 'Permanently shadowed regions may preserve water ice because they remain extremely cold!'
      }
    ]
  },
  {
    type: 'plain',
    name: 'Rocky Plain',
    icon: '🏜️',
    description: 'A relatively flat area that may be suitable for landing.',
    look: {
      ground: 0x8a8a8a,
      sun: 0xffffff,
      sunPower: 1.0,
      ambient: 0.3,
      rocks: 40
    },
    points: [
      {
        position: [12, 0, 8],
        title: '☀️ Sunlight',
        text: 'This area receives a moderate amount of sunlight. Solar panels could be useful here.'
      },
      {
        position: [20, 0, -8],
        title: '⛰️ Terrain',
        text: 'The relatively flat surface could make landing and building easier.'
      },
      {
        position: [5, 0, -18],
        title: '🧊 Water ice',
        text: 'We still need to investigate whether water ice can be found nearby.'
      }
    ]
  }
];

console.log(sites.length);
// ========================================
// 2. VARIABLES
// ========================================

const holder = document.getElementById('canvasHolder');
const panel = document.getElementById('panel');
const hud = document.getElementById('hud');


let scene;
let camera;
let renderer;
let cosmo;
let mixer;
let walkAction;
let idleAction;

let activeSiteIndex = null;
let activePointIndex = 0;
let isMoving = false;
let targetPosition = null;
let currentSite = null;

const exploredSites = new Set();

const menu = document.getElementById('menu');
const cards = document.getElementById('cards');
const progress = document.getElementById('exploration-progress');

const clock = new THREE.Clock();

// ========================================
// 3. INITIALISER THREE.JS
// ========================================

scene = new THREE.Scene();
scene.background = new THREE.Color(0x05071a);

camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  600
);

camera.position.set(0, 18, 35);
camera.lookAt(0, 0, 0);

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

holder.style.display = 'block';
holder.appendChild(renderer.domElement);
holder.style.position = 'fixed';
holder.style.top = '0';
holder.style.left = '0';
holder.style.width = '100vw';
holder.style.height = '100vh';
holder.style.zIndex = '0';

renderer.domElement.style.display = 'block';
renderer.domElement.style.width = '100%';
renderer.domElement.style.height = '100%';

// ========================================
// 4. TERRAIN
// ========================================

function bump(x, z) {
  return (
    Math.sin(x * 0.35) * Math.cos(z * 0.3) * 0.35 +
    Math.sin(x * 0.11 + z * 0.13) * 0.8
  );
}

function heightAt(type, x, z) {
  const b = bump(x, z);
  const r = Math.sqrt(x * x + z * z);

  if (type === 'ridge') {
    return b * 1.2 +
      3.5 * Math.sin(x * 0.05 + 0.5) *
      Math.cos(z * 0.045);
  }

  if (type === 'crater') {
    const bowl = r < 45
      ? -8 * (1 - (r / 45) ** 2)
      : 0;

    const rim = 5 * Math.exp(-((r - 48) ** 2) / 40);

    return b * 0.6 + bowl + rim;
  }

  return b * 0.35;
}
function showSiteMenu() {
    holder.style.display = 'none';
    hud.style.display = 'none';
    panel.style.display = 'none';

    menu.style.display = 'flex';

    cards.innerHTML = sites.map((site, index) => {
        const explored = exploredSites.has(index);

        return `
            <button
                class="site-card ${explored ? 'explored' : ''}"
                data-site="${index}"
                ${explored ? 'disabled' : ''}
            >
                <span class="site-icon">${site.icon}</span>

                <span class="site-name">${site.name}</span>

                <span class="site-description">
                    ${site.description}
                </span>

                <span class="site-status">
                    ${explored ? '✓ EXPLORED' : 'EXPLORE LOCATION →'}
                </span>
            </button>
        `;
    }).join('');

    progress.textContent =
        `${exploredSites.size} / ${sites.length} LOCATIONS EXPLORED`;

    cards.querySelectorAll('.site-card:not(:disabled)').forEach(button => {
        button.addEventListener('click', () => {
            const index = Number(button.dataset.site);
            startSite(index);
        });
    });

    if (exploredSites.size === sites.length) {
        showComparison();
    }
}
// ========================================
// 5. COSMO - CHARGEMENT DU MODÈLE GLTF
// ========================================

function loadCosmo() {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();

    loader.load(
      '/models/scene.gltf',
      (gltf) => {
        const model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());

        const maxDimension = Math.max(size.x, size.y, size.z);
        model.scale.setScalar(3.5 / maxDimension);

        const scaledBox = new THREE.Box3().setFromObject(model);

        model.position.y -= scaledBox.min.y;

        cosmo = model;
        scene.add(cosmo);

        if (gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(cosmo);

          walkAction = mixer.clipAction(
            THREE.AnimationClip.findByName(gltf.animations, 'moon_walk')
            || gltf.animations[0]
          );

          const idleClip =
            THREE.AnimationClip.findByName(gltf.animations, 'idle');

          if (idleClip) {
            idleAction = mixer.clipAction(idleClip);
            idleAction.play();
          }
        }

        resolve();
      },
      undefined,
      (error) => {
        console.error('Cosmo could not be loaded:', error);
        reject(error);
      }
    );
  });
}

// ========================================
// 6. CONSTRUIRE UN ENVIRONNEMENT LUNAIRE
// ========================================

function buildScene(site) {
  currentSite = site;

  // Nettoyer les anciens objets
  while (scene.children.length > 0) {
    const object = scene.children[0];
    scene.remove(object);
  }

  scene.background = new THREE.Color(0x000000);

  scene.add(
    new THREE.AmbientLight(0xffffff, site.look.ambient)
  );

  const sun = new THREE.DirectionalLight(
    site.look.sun,
    site.look.sunPower
  );

  sun.position.set(40, 30, 20);
  scene.add(sun);

  // Terrain
  const geometry = new THREE.PlaneGeometry(260, 260, 90, 90);
  geometry.rotateX(-Math.PI / 2);

  const positions = geometry.attributes.position;

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);

    positions.setY(i, heightAt(site.type, x, z));
  }

  geometry.computeVertexNormals();

  const ground = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color: site.look.ground,
      flatShading: true
    })
  );

  scene.add(ground);

  // Étoiles
  const starPositions = [];

  for (let i = 0; i < 900; i++) {
    starPositions.push(
      (Math.random() - 0.5) * 500,
      Math.random() * 200 + 15,
      (Math.random() - 0.5) * 500
    );
  }

  const starGeometry = new THREE.BufferGeometry();

  starGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(starPositions, 3)
  );

  scene.add(
    new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.7
      })
    )
  );

  // Terre dans le ciel
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(8, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6 })
  );

  earth.position.set(-90, 70, -160);
  scene.add(earth);

  // Rochers
  const rockMaterial = new THREE.MeshStandardMaterial({
    color: 0x777777,
    flatShading: true
  });

  for (let i = 0; i < site.look.rocks; i++) {
    const x = (Math.random() - 0.5) * 120;
    const z = (Math.random() - 0.5) * 120;

    const rock = new THREE.Mesh(
      new THREE.IcosahedronGeometry(
        0.4 + Math.random() * 0.9,
        0
      ),
      rockMaterial
    );

    rock.scale.y = 0.6;
    rock.position.set(
      x,
      heightAt(site.type, x, z) + 0.2,
      z
    );

    scene.add(rock);
  }

  // Cristaux de glace illustratifs dans le cratère
  if (site.type === 'crater') {
    const iceMaterial = new THREE.MeshStandardMaterial({
      color: 0x9fd8ff,
      emissive: 0x2a6fa8,
      emissiveIntensity: 0.9
    });

    for (let i = 0; i < 9; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 5 + Math.random() * 22;

      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;

      const ice = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.6, 0),
        iceMaterial
      );

      ice.scale.y = 1.7;
      ice.position.set(
        x,
        heightAt('crater', x, z) + 0.5,
        z
      );

      scene.add(ice);
    }
  }

  // Réinsérer Cosmo dans le nouvel environnement
  if (cosmo) {
    scene.add(cosmo);
    cosmo.position.set(0, heightAt(site.type, 0, 0), 0);
  }
}

// ========================================
// 7. DÉPLACEMENT GUIDÉ DE COSMO
// ========================================

function moveCosmoTo(point) {
  if (!cosmo) return;

  const [x, , z] = point.position;
  const y = heightAt(currentSite.type, x, z);

  targetPosition = new THREE.Vector3(x, y, z);
  isMoving = true;

  if (idleAction) idleAction.stop();
  if (walkAction) walkAction.reset().play();

  // Orienter Cosmo vers sa destination
  cosmo.lookAt(x, y, z);
}

function updateMovement() {
  if (!isMoving || !cosmo || !targetPosition) return;

  const distance = cosmo.position.distanceTo(targetPosition);

  if (distance < 0.25) {
    cosmo.position.copy(targetPosition);
    isMoving = false;

    if (walkAction) walkAction.stop();
    if (idleAction) idleAction.reset().play();

    showPointDialogue();
    return;
  }

  const direction = new THREE.Vector3()
    .subVectors(targetPosition, cosmo.position)
    .normalize();

  cosmo.position.addScaledVector(direction, 0.07);

  // Garder Cosmo au niveau du terrain
  cosmo.position.y = heightAt(
    currentSite.type,
    cosmo.position.x,
    cosmo.position.z
  );

  camera.position.lerp(
    new THREE.Vector3(
      cosmo.position.x - direction.x * 9,
      cosmo.position.y + 5,
      cosmo.position.z - direction.z * 9
    ),
    0.04
  );

  camera.lookAt(
    cosmo.position.x,
    cosmo.position.y + 2,
    cosmo.position.z
  );
}

// ========================================
// 8. DIALOGUES ET PROGRESSION
// ========================================

function showPanel(title, message, buttonText, callback) {
  panel.innerHTML = `
    <h3>${title}</h3>
    <p>${message}</p>
    <button id="nextButton">${buttonText}</button>
  `;

  panel.style.display = 'block';

  document.getElementById('nextButton').addEventListener(
    'click',
    callback
  );
}

function showPointDialogue() {
  const point = currentSite.points[activePointIndex];

  showPanel(
    point.title,
    point.text,
    'Next ➜',
    nextPoint
  );
}

function nextPoint() {
  activePointIndex++;

  if (activePointIndex < currentSite.points.length) {
    startPoint();
  } else {
    finishSite();
  }
}

function startPoint() {
  const point = currentSite.points[activePointIndex];

  panel.style.display = 'none';
  moveCosmoTo(point);
}

function finishSite() {
    exploredSites.add(activeSiteIndex);

    showPanel(
        'Exploration complete! 🎉',
        `You have successfully explored ${currentSite.name}. 
         You can now return to the lunar map and choose another location.`,
        'Return to locations ↗',
        () => {
            showSiteMenu();
        }
    );
}


// ========================================
// 9. VISITER LES TROIS SITES
// ========================================
function startSite(index) {
    activeSiteIndex = index;
    activePointIndex = 0;

    currentSite = sites[index];

    menu.style.display = 'none';
    holder.style.display = 'block';
    hud.style.display = 'flex';

    // Recréer l'environnement choisi
    buildScene(currentSite);

    // Repositionner Cosmo et la caméra
    if (cosmo) {
        cosmo.position.set(
            0,
            heightAt(currentSite.type, 0, 0),
            0
        );
    }

    camera.position.set(0, 18, 35);
    camera.lookAt(0, 0, 0);

    hud.innerHTML = `
        <div class="stat">
            ${currentSite.icon} ${currentSite.name}
        </div>

        <div class="stat">
            LOCATION ${exploredSites.size + 1} / ${sites.length}
        </div>

        <button id="exit-site" class="exit-button">
            ✕ EXIT EXPLORATION
        </button>
    `;

    document.getElementById('exit-site').addEventListener('click', () => {
        if (isMoving) return;

        showSiteMenu();
    });

    showPanel(
        `${currentSite.icon} Welcome to ${currentSite.name}`,
        `${currentSite.description} Follow Cosmo to discover this location.`,
        'Start exploring 🚀',
        startPoint
    );
}

// ========================================
// 10. COMPARAISON FINALE
// ========================================

function showComparison() {
    holder.style.display = 'none';
    hud.style.display = 'none';
    panel.style.display = 'block';
    menu.style.display = 'none';

    const choices = sites.map((site, index) => `
        <button class="choice-btn" data-site="${index}">
            ${site.icon} Choose ${site.name}
        </button>
    `).join('');

    panel.innerHTML = `
        <h3>All locations explored! 🌙</h3>

        <p>
            Excellent work, Junior Astronaut!
            You explored all three lunar locations with Cosmo.

            Now compare sunlight, terrain and possible water ice
            to select the best location for your lunar base.
        </p>

        <div class="choices">
            ${choices}
        </div>
    `;

    panel.style.display = 'block';

    document.querySelectorAll('.choice-btn').forEach(button => {
        button.addEventListener('click', () => {
            const index = Number(button.dataset.site);
            const chosen = sites[index];

            localStorage.setItem('mission1Completed', 'true');
            localStorage.setItem('chosenLunarSite', chosen.name);

            showPanel(
                `You selected ${chosen.name}! 🌙`,
                `Your lunar base location has been selected. 
                 Your next mission is waiting!`,
                'Return to missions',
                () => {
                    window.location.href = '/path.html';
                }
            );
        });
    });
}

// ========================================
// 11. ANIMATION
// ========================================

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  if (mixer) mixer.update(delta);

  updateMovement();

  renderer.render(scene, camera);
}

// ========================================
// 12. RESPONSIVE WINDOW
// ========================================

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ========================================
// 13. LANCEMENT
// ========================================
async function init() {
    try {
        await loadCosmo();

        // Afficher directement les trois choix
        showSiteMenu();

        // Lancer la boucle 3D
        animate();

    } catch (error) {
        console.error(error);

        menu.style.display = 'none';
        panel.style.display = 'block';

        panel.innerHTML = `
            <h3>Cosmo could not load 😕</h3>
            <p>
                Check that your model exists at
                public/models/scene.gltf
            </p>
        `;
    }
}

init();
