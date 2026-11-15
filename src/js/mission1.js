
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ========================================
// 1. BACKGROUND STARS
// ========================================

const starsContainer = document.querySelector('#stars');

if (starsContainer) {
    for (let i = 0; i < 120; i++) {
        const star = document.createElement('div');

        star.className = 'star';

        const size = Math.random() * 2.5 + 0.5;

        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;

        starsContainer.appendChild(star);
    }
}

// ========================================
// 2. THREE.JS SCENE
// ========================================

const canvas = document.querySelector('#astronaut-canvas');

let scene;
let camera;
let renderer;
let mixer = null;
let astronaut = null;

const clock = new THREE.Clock();

if (canvas) {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        35,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        100
    );

    camera.position.set(0, 0.2, 6);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 3);
    mainLight.position.set(3, 5, 5);
    scene.add(mainLight);

    const blueLight = new THREE.PointLight(0x4b9fff, 25, 10);
    blueLight.position.set(-3, 1, 2);
    scene.add(blueLight);

    const purpleLight = new THREE.PointLight(0x9870ff, 15, 10);
    purpleLight.position.set(3, -2, -2);
    scene.add(purpleLight);

    // ========================================
    // 3. LOAD COSMO MODEL
    // ========================================

    const loader = new GLTFLoader();

    loader.load(
        '/models/scene.gltf',

        (gltf) => {

            astronaut = gltf.scene;

            // Calculate model dimensions
            const box = new THREE.Box3().setFromObject(astronaut);

            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            // Scale model
            const maxDimension = Math.max(size.x, size.y, size.z);
            const scale = 2.5 / maxDimension;

            astronaut.scale.setScalar(scale);

            // Center model
            astronaut.position.set(
                -center.x * scale,
                -center.y * scale,
                -center.z * scale
            );

            // Adjust astronaut rotation
            astronaut.rotation.y = 50 * (Math.PI / 180);

            scene.add(astronaut);

            // Animation mixer
            if (gltf.animations.length > 0) {

                mixer = new THREE.AnimationMixer(astronaut);

                const actions = {};

                gltf.animations.forEach((clip) => {

                    actions[clip.name.toLowerCase()] =
                        mixer.clipAction(clip);

                    console.log('Animation found:', clip.name);

                });

                function playAnimation(name) {

                    const selectedAction = actions[name.toLowerCase()];

                    if (!selectedAction) {
                        console.warn(`Animation "${name}" not found.`);
                        return;
                    }

                    Object.entries(actions).forEach(([animationName, action]) => {

                        if (animationName === name.toLowerCase()) {

                            action.reset();
                            action.fadeIn(0.5);
                            action.play();

                        } else {

                            action.fadeOut(0.5);

                        }

                    });
                }

                // Cosmo greeting animation
                if (actions['wave']) {

                    playAnimation('wave');

                    setTimeout(() => {

                        if (actions['idle']) {
                            playAnimation('idle');
                        }

                    }, 2500);

                } else if (actions['floating']) {

                    playAnimation('floating');

                } else if (actions['idle']) {

                    playAnimation('idle');

                } else {

                    // Play the first available animation
                    const firstAnimation = Object.keys(actions)[0];

                    if (firstAnimation) {
                        playAnimation(firstAnimation);
                    }
                }
            }

            console.log('Cosmo loaded successfully!');

        },

        (progress) => {
            if (progress.total > 0) {
                const percentage =
                    (progress.loaded / progress.total) * 100;

                console.log(`Loading Cosmo: ${percentage.toFixed(0)}%`);
            }
        },

        (error) => {
            console.error('Error loading Cosmo:', error);
        }
    );

    // ========================================
    // 4. ANIMATION LOOP
    // ========================================

    function animate() {

        requestAnimationFrame(animate);

        const delta = clock.getDelta();

        if (mixer) {
            mixer.update(delta);
        }

        renderer.render(scene, camera);
    }

    animate();

    // ========================================
    // 5. RESPONSIVE CANVAS
    // ========================================

    function resizeAstronaut() {

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        if (!width || !height) return;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    window.addEventListener('resize', resizeAstronaut);

}

// ========================================
// 6. COSMO'S DIALOGUE SYSTEM
// ========================================

const dialogues = [

    "Hello, AstroHero! Welcome to the Lunar South Pole!",

    "We need to find the perfect location for our future lunar base. But this won't be easy!",

    "We must investigate three important things: sunlight, terrain and water ice.",

    "Your mission is to explore three possible locations, collect scientific data and choose the best place for our base!",

    "Are you ready to become a Lunar Site Explorer?"

];

let currentDialogue = 0;

// HTML elements
const dialogueText = document.querySelector('#dialogue-text');
const startButton = document.querySelector('#start-button');
const buttonLabel = document.querySelector('#button-label');
const dialogueCounter = document.querySelector('#dialogue-counter');
const dialogueProgress = document.querySelector('#dialogue-progress');

// Update dialogue interface
function updateDialogue() {

    if (!dialogueText) return;

    dialogueText.textContent = dialogues[currentDialogue];

    // Update message counter
    if (dialogueCounter) {

        dialogueCounter.textContent =
            `${String(currentDialogue + 1).padStart(2, '0')} / ${String(dialogues.length).padStart(2, '0')}`;

    }

    // Update progress bar
    if (dialogueProgress) {

        const progress =
            ((currentDialogue + 1) / dialogues.length) * 100;

        dialogueProgress.style.width = `${progress}%`;

    }

    // Update button
    if (currentDialogue === dialogues.length - 1) {

        if (buttonLabel) {
            buttonLabel.textContent = 'START EXPLORATION';
        }

        const arrow = startButton?.querySelector('.button-arrow');

        if (arrow) {
            arrow.textContent = '🚀';
        }

    } else {

        if (buttonLabel) {
            buttonLabel.textContent = 'NEXT MESSAGE';
        }

        const arrow = startButton?.querySelector('.button-arrow');

        if (arrow) {
            arrow.textContent = '→';
        }

    }
}

// Button interaction
if (startButton) {

    startButton.addEventListener('click', () => {

        if (currentDialogue < dialogues.length - 1) {

            currentDialogue++;

            updateDialogue();

        } else {

            console.log('Mission briefing completed!');

            // Connect your Mission 1 exploration page here.
            window.location.href = '/mission1-exploration.html';

        }

    });

}

// Initialize dialogue
updateDialogue();

// ========================================
// 7. INITIALIZATION
// ========================================

console.log('AstroHeroes Mission 1 briefing initialized!');
