
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 1. Créer la scène
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x10152f);

// Créer les étoiles
const starsGeometry = new THREE.BufferGeometry();
const starsCount = 500;

const positions = [];

for (let i = 0; i < starsCount; i++) {
    const x = (Math.random() - 0.5) * 100;
    const y = (Math.random() - 0.5) * 100;
    const z = -Math.random() * 50;

    positions.push(x, y, z);
}

starsGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
);

const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.12,
    sizeAttenuation: true
});

const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// 2. Créer la caméra
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 1.5, 5);
camera.lookAt(0, 0, 0);

// 3. Créer le moteur de rendu
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

document.querySelector('#game-container').appendChild(renderer.domElement);

// 4. Ajouter les lumières
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(3, 5, 5);
scene.add(directionalLight);

const clock = new THREE.Clock();
let mixer = null;

// 5. Charger Commander Nova
const loader = new GLTFLoader();

loader.load(
    '/models/scene.gltf',
   
(gltf) => {
    const astronaut = gltf.scene;

    const box = new THREE.Box3().setFromObject(astronaut);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    astronaut.scale.setScalar(2 / size.y);
    astronaut.position.sub(center.multiplyScalar(astronaut.scale.x));

    scene.add(astronaut);
    astronaut.position.x -= 3.2;
    astronaut.rotation.y = 50 * (Math.PI / 180);
    astronaut.position.y -= 0.5;

    mixer = new THREE.AnimationMixer(astronaut);

    const actions = {};

    gltf.animations.forEach((clip) => {
        actions[clip.name] = mixer.clipAction(clip);
        console.log('Animation:', clip.name);
    });

    // Fonction pour changer d'animation
    function playAnimation(name) {
        Object.entries(actions).forEach(([animationName, action]) => {
            if (animationName === name) {
                action.reset();
                action.fadeIn(0.5);
                action.play();
            } else {
                action.fadeOut(0.5);
            }
        });
    }

    // Commander Nova salue l'enfant
    playAnimation('wave');

    // Après le salut, il reste debout
    setTimeout(() => {
        playAnimation('idle');
    }, 2500);

    // Dialogues de Commander Nova
    const dialogues = [
        "Hello, Astro Hero! My name is Cosmo. It's great to meet you!",

        "I have an exciting mission! I want to explore the Lunar South Pole region.",

        "But I can't do it alone. I need YOUR help, Junior Explorer!",

        "Are you ready to begin our lunar adventure?"
    ];

    let currentDialogue = 0;

    const dialogueText = document.querySelector('#dialogue-text');
    const nextButton = document.querySelector('#next-button');

    dialogueText.textContent = dialogues[currentDialogue];

    nextButton.addEventListener('click', () => {
        currentDialogue++;

        if (currentDialogue < dialogues.length) {
            dialogueText.textContent = dialogues[currentDialogue];
        } else {
            window.location.href = 'path.html';
        }
    });
},

    undefined,
    (error) => {
        console.error('Erreur de chargement du modèle :', error);
    }
);

// 6. Animer la scène
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    if (mixer) {
        mixer.update(delta);
    }

    renderer.render(scene, camera);
}

animate();

// 7. Adapter la scène à la taille de l'écran
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
