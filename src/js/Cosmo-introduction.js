import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ========================================
// 1. HTML ELEMENTS
// ========================================

const gameContainer = document.querySelector('#game-container');
const loadingMessage = document.querySelector('#loading-message');

const dialogueText = document.querySelector('#dialogue-text');
const nextButton = document.querySelector('#next-button');

const dialogueCounter = document.querySelector('#dialogue-counter');
const dialogueProgress = document.querySelector('#dialogue-progress');
const buttonLabel = document.querySelector('#button-label');

if (!gameContainer || !dialogueText || !nextButton) {
    throw new Error('Some required HTML elements are missing.');
}

// ========================================
// 2. DIALOGUES
// ========================================

const dialogues = [
    "Hello, Astro Hero! My name is Cosmo. It's great to meet you!",

    "I have an exciting mission! I want to explore the Lunar South Pole region.",

    "But I can't do it alone. I need YOUR help, Junior Explorer!",

    "Are you ready to begin our lunar adventure?"
];

let currentDialogue = 0;
let isTransitioning = false;

function updateDialogue() {

    dialogueText.classList.add('changing');

    setTimeout(() => {

        dialogueText.textContent = dialogues[currentDialogue];

        if (dialogueCounter) {
            const current = String(currentDialogue + 1).padStart(2, '0');
            const total = String(dialogues.length).padStart(2, '0');

            dialogueCounter.textContent = `${current} / ${total}`;
        }

        if (dialogueProgress) {
            const progress = ((currentDialogue + 1) / dialogues.length) * 100;
            dialogueProgress.style.width = `${progress}%`;
        }

        if (currentDialogue === dialogues.length - 1) {
            buttonLabel.textContent = 'START EXPLORING';
        } else {
            buttonLabel.textContent = 'NEXT';
        }

        dialogueText.classList.remove('changing');

        isTransitioning = false;

    }, 180);
}

// Initial dialogue
updateDialogue();

// Next dialogue button
nextButton.addEventListener('click', () => {

    if (isTransitioning) return;

    if (currentDialogue < dialogues.length - 1) {

        currentDialogue++;
        isTransitioning = true;
        updateDialogue();

    } else {

        window.location.href = 'path.html';

    }

});

// ========================================
// 3. THREE.JS SCENE
// ========================================

const scene = new THREE.Scene();

// Transparent renderer allows the CSS background to show
scene.background = null;

// Camera
const camera = new THREE.PerspectiveCamera(
    35,
    1,
    0.1,
    100
);

camera.position.set(0, 0, 7);
camera.lookAt(0, 0, 0);


// Renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

gameContainer.appendChild(renderer.domElement);

// ========================================
// 4. LIGHTING
// ========================================

const ambientLight = new THREE.AmbientLight(
    0xffffff,
    2
);

scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(
    0xffffff,
    3
);

mainLight.position.set(3, 5, 5);
scene.add(mainLight);

// Blue light
const blueLight = new THREE.PointLight(
    0x369bff,
    2,
    10
);

blueLight.position.set(-3, 1, 2);
scene.add(blueLight);

// Cyan light
const cyanLight = new THREE.PointLight(
    0x69d9ff,
    1.5,
    8
);

cyanLight.position.set(2, -1, 2);
scene.add(cyanLight);

// ========================================
// 5. STARS
// ========================================

const starsGeometry = new THREE.BufferGeometry();

const starsCount = 450;
const positions = [];

for (let i = 0; i < starsCount; i++) {

    const x = (Math.random() - 0.5) * 35;
    const y = (Math.random() - 0.5) * 25;
    const z = -Math.random() * 20;

    positions.push(x, y, z);

}

starsGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
);

const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.055,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
});

const stars = new THREE.Points(
    starsGeometry,
    starsMaterial
);

scene.add(stars);

// ========================================
// 6. LOAD COSMO
// ========================================

// ========================================
// 6. LOAD COSMO
// ========================================

const loader = new GLTFLoader();
const clock = new THREE.Clock();

let mixer = null;
let astronaut = null;
let astronautGroup = null;
let currentAction = null;

const animationActions = {};

function isMobile() {
    return window.matchMedia('(max-width: 650px)').matches;
}

// Position of the astronaut inside the scene
function positionAstronaut() {
    if (!astronautGroup) return;

    if (isMobile()) {
        astronautGroup.position.set(0, -0.1, 0);
    } else {
        astronautGroup.position.set(0, -0.05, 0);
    }
}

// Play an animation by searching its name
function playAnimation(animationName) {
    const requestedName = animationName.toLowerCase();

    const animationKey = Object.keys(animationActions).find(
        name => name.toLowerCase().includes(requestedName)
    );

    if (!animationKey) {
        console.warn(`Animation "${animationName}" not found.`);
        return false;
    }

    const nextAction = animationActions[animationKey];

    if (currentAction === nextAction) return true;

    if (currentAction) {
        currentAction.fadeOut(0.4);
    }

    nextAction.reset();
    nextAction.fadeIn(0.4);
    nextAction.play();

    currentAction = nextAction;

    return true;
}

// Load the astronaut model
loader.load(
    '/models/scene.gltf',

    (gltf) => {

        astronaut = gltf.scene;

        // Create a group to control Cosmo's position independently
        astronautGroup = new THREE.Group();

        // Measure the original model
        const box = new THREE.Box3().setFromObject(astronaut);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Resize the model
        const targetHeight = 2.8;
        const scale = targetHeight / size.y;

        astronaut.scale.setScalar(scale);

        // Center the actual model inside its group
        astronaut.position.set(
            -center.x * scale,
            -center.y * scale,
            -center.z * scale
        );

        // Slight rotation towards the viewer
        astronaut.rotation.y = THREE.MathUtils.degToRad(25);

        // Add model to the positioning group
        astronautGroup.add(astronaut);

        // Position the complete group
        positionAstronaut();

        scene.add(astronautGroup);

        // Load animations
        mixer = new THREE.AnimationMixer(astronaut);

        gltf.animations.forEach((clip) => {
            animationActions[clip.name] = mixer.clipAction(clip);
            console.log('Cosmo animation found:', clip.name);
        });

        // Greeting animation
        const hasWave = playAnimation('wave');

        if (!hasWave) {
            const firstAnimation = Object.keys(animationActions)[0];

            if (firstAnimation) {
                playAnimation(firstAnimation);
            }
        }

        // Switch to idle after greeting
        setTimeout(() => {
            if (!playAnimation('idle')) {
                playAnimation('floating');
            }
        }, 3000);

        // Hide loading message
        if (loadingMessage) {
            loadingMessage.classList.add('hidden');
        }
    },

    (progress) => {
        if (progress.total > 0) {
            const percentage = Math.round(
                (progress.loaded / progress.total) * 100
            );

            console.log(`Loading Cosmo: ${percentage}%`);
        }
    },

    (error) => {
        console.error('Error loading Cosmo:', error);

        if (loadingMessage) {
            loadingMessage.textContent =
                'Cosmo could not be loaded. Please check the model file.';
        }
    }
);

// ========================================
// 7. ANIMATION LOOP
// ========================================

function animate() {

    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    if (mixer) {
        mixer.update(delta);
    }

    // Very subtle star movement
    stars.rotation.y += 0.00008;

    renderer.render(scene, camera);

}

animate();

// ========================================
// 8. RESPONSIVE RESIZE
// ========================================

function resizeScene() {

    const width = gameContainer.clientWidth;
    const height = gameContainer.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

    positionAstronaut();

}

window.addEventListener('resize', resizeScene);

resizeScene();
