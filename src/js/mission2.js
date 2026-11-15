//this was completly created by CHatgpt after explaining the game rules but the team
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// =====================================================
// 1. CONFIGURATION
// =====================================================

const chosenBase = localStorage.getItem('chosenLunarSite') || 'Sunny Ridge';

const baseProfiles = {
    'Sunny Ridge': {
        energy: 95,
        oxygen: 85,
        health: 100,
        safety: 85,
        location: 'SUNLIT LUNAR RIDGE',
        light: 1.15
    },
    'Shadowed Crater': {
        energy: 60,
        oxygen: 85,
        health: 100,
        safety: 90,
        location: 'PERMANENTLY SHADOWED CRATER',
        light: 0.55
    },
    'Rocky Plain': {
        energy: 80,
        oxygen: 90,
        health: 100,
        safety: 80,
        location: 'LUNAR ROCKY PLAIN',
        light: 0.9
    }
};

const normalizedBase = chosenBase.toLowerCase();

const profileKey = Object.keys(baseProfiles).find(key =>
    normalizedBase.includes(key.toLowerCase()) ||
    key.toLowerCase().includes(normalizedBase)
);

const baseProfile = baseProfiles[profileKey || 'Sunny Ridge'];

let resources = {
    energy: baseProfile.energy,
    oxygen: baseProfile.oxygen,
    health: baseProfile.health,
    safety: baseProfile.safety
};

let decisions = [];
let currentIncident = 0;
let selectedChoice = null;
let dialogueAction = null;
let gameStarted = false;
let gameFinished = false;

// =====================================================
// 2. HTML ELEMENTS
// =====================================================

const $ = id => document.getElementById(id);

const elements = {
    intro: $('intro-screen'),
    start: $('start-button'),
    dialogue: $('dialogue-panel'),
    dialogueText: $('dialogue-text'),
    dialogueButton: $('dialogue-button'),
    incident: $('incident-panel'),
    incidentType: $('incident-type'),
    incidentTitle: $('incident-title'),
    incidentDescription: $('incident-description'),
    choices: $('choices-container'),
    feedback: $('choice-feedback'),
    confirm: $('confirm-button'),
    report: $('report-screen'),
    reportTitle: $('report-title'),
    reportDescription: $('report-description'),
    decisionList: $('decision-list'),
    finish: $('finish-button'),
    baseName: $('base-name'),
    locationName: $('location-name'),
    counter: $('incident-counter'),
    progress: $('progress-fill')
};

// =====================================================
// 3. INCIDENTS
// =====================================================

const incidents = [
    {
        type: 'SPACE WEATHER ALERT',
        title: 'SOLAR RADIATION ALERT',
        description:
            'MISSION CONTROL WARNING: A solar energetic particle event has been detected. Cosmo is currently outside the habitat. He must decide how to respond. The radiation effects in this scenario are simulated.',

        choices: [
            {
                title: 'Return to the radiation shelter',
                description: 'Stop the exploration and return to the protected habitat.',
                effects: {
                    energy: -8,
                    oxygen: -7,
                    health: 0,
                    safety: 5
                },
                feedback:
                    'Cosmo reaches the shelter. He is protected from the simulated radiation hazard, but the return costs time and energy.',
                dialogue:
                    'Good call! I am back inside the shelter. My health is stable. We lost some exploration time, but safety comes first.'
            },
            {
                title: 'Continue collecting samples',
                description: 'Take the risk and finish collecting the samples.',
                effects: {
                    energy: 5,
                    oxygen: -8,
                    health: -25,
                    safety: -5
                },
                feedback:
                    'Cosmo collects the samples, but the simulated radiation exposure reduces his health.',
                dialogue:
                    'I managed to collect the samples... but I am feeling the effects. My health has dropped. We should be more careful next time.'
            }
        ]
    },

    {
        type: 'POWER SYSTEM ALERT',
        title: 'SOLAR PANEL FAILURE',
        description:
            'WARNING: The base is receiving less solar energy. A micrometeoroid impact has damaged part of the solar panel system. The base must restore or conserve its power.',

        choices: [
            {
                title: 'Go outside and repair the panels',
                description: 'Use repair materials and perform an external repair.',
                effects: {
                    energy: 20,
                    oxygen: -12,
                    health: 0,
                    safety: 5
                },
                feedback:
                    'The repair is successful. Energy production improves, but Cosmo has used oxygen and repair materials.',
                dialogue:
                    'The panels are working again! We have more energy now. It was a difficult repair, but the base can continue operating.'
            },
            {
                title: 'Switch to emergency batteries',
                description: 'Save time by reducing non-essential energy consumption.',
                effects: {
                    energy: -25,
                    oxygen: 0,
                    health: 0,
                    safety: -12
                },
                feedback:
                    'The emergency batteries are activated. Essential systems remain operational, but the base has limited power.',
                dialogue:
                    'Emergency power is active. We avoided an external repair, but our energy reserves are getting low. We need to manage them carefully.'
            }
        ]
    },

    {
        type: 'HABITAT EMERGENCY',
        title: 'OXYGEN PRESSURE LEAK',
        description:
            'CRITICAL WARNING: The habitat monitoring system has detected a pressure drop in one compartment. Cosmo must protect the remaining oxygen supply.',

        choices: [
            {
                title: 'Isolate the damaged compartment',
                description: 'Close the compartment and protect the rest of the habitat.',
                effects: {
                    energy: -10,
                    oxygen: -5,
                    health: 0,
                    safety: 20
                },
                feedback:
                    'The damaged compartment is isolated. The remaining habitat is protected, although energy is needed to stabilize the system.',
                dialogue:
                    'The compartment is isolated. The rest of the habitat is safe. We can repair the damaged section later.'
            },
            {
                title: 'Use the emergency repair kit',
                description: 'Attempt a quick temporary repair without isolating the compartment.',
                effects: {
                    energy: -5,
                    oxygen: -15,
                    health: 0,
                    safety: 5
                },
                feedback:
                    'The emergency kit temporarily seals the leak. Oxygen loss is reduced, but the repair needs to be checked again.',
                dialogue:
                    'The leak is temporarily sealed. We saved the compartment, but this repair may not last. We will need to inspect it again.'
            }
        ]
    }
];

// =====================================================
// 4. THREE.JS SCENE
// =====================================================

const container = $('scene-container');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050916);
scene.fog = new THREE.Fog(0x050916, 22, 85);

const camera = new THREE.PerspectiveCamera(
    48,
    window.innerWidth / window.innerHeight,
    0.1,
    200
);

camera.position.set(0, 7, 17);
camera.lookAt(0, 1.5, 0);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

container.appendChild(renderer.domElement);

// =====================================================
// 5. LIGHTING
// =====================================================

const ambientLight = new THREE.AmbientLight(
    0x9aafd1,
    0.55
);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(
    0xffe4b0,
    2.2 * baseProfile.light
);

sunLight.position.set(-12, 18, 8);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(1024, 1024);
scene.add(sunLight);

const blueLight = new THREE.PointLight(
    0x4a9fff,
    35,
    35
);
blueLight.position.set(4, 5, -5);
scene.add(blueLight);

// =====================================================
// 6. LUNAR TERRAIN
// =====================================================

const groundGeometry = new THREE.PlaneGeometry(200, 200, 70, 70);

const groundPositions = groundGeometry.attributes.position;

for (let i = 0; i < groundPositions.count; i++) {
    const x = groundPositions.getX(i);
    const y = groundPositions.getY(i);

    const variation =
        Math.sin(x * 0.16) * 0.22 +
        Math.cos(y * 0.19) * 0.18 +
        Math.sin((x + y) * 0.11) * 0.12;

    groundPositions.setZ(i, variation);
}

groundGeometry.computeVertexNormals();

const ground = new THREE.Mesh(
    groundGeometry,
    new THREE.MeshStandardMaterial({
        color: 0x85899a,
        roughness: 1,
        metalness: 0
    })
);

ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.12;
ground.receiveShadow = true;
scene.add(ground);

// =====================================================
// 7. STARS
// =====================================================

const starGeometry = new THREE.BufferGeometry();
const starPositions = [];

for (let i = 0; i < 900; i++) {
    starPositions.push(
        (Math.random() - 0.5) * 180,
        Math.random() * 65 + 5,
        (Math.random() - 0.5) * 180
    );
}

starGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(starPositions, 3)
);

const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.16,
        transparent: true,
        opacity: 0.8
    })
);

scene.add(stars);

// =====================================================
// 8. EARTH
// =====================================================

const earth = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 32, 32),
    new THREE.MeshStandardMaterial({
        color: 0x2868bd,
        emissive: 0x071c4d,
        roughness: 0.8
    })
);

earth.position.set(-13, 9, -32);
scene.add(earth);

// =====================================================
// 9. LUNAR BASE
// =====================================================

const baseGroup = new THREE.Group();
scene.add(baseGroup);

function createHabitat(x, z, scale = 1) {
    const habitat = new THREE.Group();

    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.5, 2.5, 32),
        new THREE.MeshStandardMaterial({
            color: 0x9ca9b9,
            metalness: 0.55,
            roughness: 0.45
        })
    );

    body.rotation.z = Math.PI / 2;
    body.castShadow = true;
    habitat.add(body);

    const windowMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 20, 20),
        new THREE.MeshBasicMaterial({
            color: 0x55dfff
        })
    );

    windowMesh.position.set(0, 0.45, 1.3);
    habitat.add(windowMesh);

    const light = new THREE.PointLight(0x58dfff, 4, 8);
    light.position.set(0, 1, 1.7);
    habitat.add(light);

    habitat.position.set(x, 1.25 * scale, z);
    habitat.scale.setScalar(scale);

    baseGroup.add(habitat);
}

createHabitat(-4, -5, 1);
createHabitat(-7, -5, 0.65);

// Solar panels
const solarGroup = new THREE.Group();

for (let i = 0; i < 3; i++) {
    const panel = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 0.08, 1.5),
        new THREE.MeshStandardMaterial({
            color: 0x173f7c,
            metalness: 0.65,
            roughness: 0.3,
            emissive: 0x071d42
        })
    );

    panel.position.set(i * 2.5 - 2.5, 1.5, -8);
    panel.rotation.x = -0.18;
    solarGroup.add(panel);

    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(2.35, 0.04, 1.55),
        new THREE.MeshStandardMaterial({
            color: 0xaab8c8,
            metalness: 0.7
        })
    );

    frame.position.copy(panel.position);
    frame.rotation.copy(panel.rotation);
    solarGroup.add(frame);
}

baseGroup.add(solarGroup);

// Base lights
const baseLight = new THREE.PointLight(0x5bcfff, 7, 18);
baseLight.position.set(-4, 3, -5);
baseGroup.add(baseLight);

// =====================================================
// 10. ROCKS
// =====================================================

const rockMaterial = new THREE.MeshStandardMaterial({
    color: 0x626575,
    roughness: 1
});

for (let i = 0; i < 65; i++) {
    const size = Math.random() * 0.65 + 0.15;

    const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(size, 0),
        rockMaterial
    );

    const angle = Math.random() * Math.PI * 2;
    const radius = 7 + Math.random() * 28;

    rock.position.set(
        Math.cos(angle) * radius,
        size * 0.4,
        Math.sin(angle) * radius
    );

    rock.rotation.set(
        Math.random() * 2,
        Math.random() * 2,
        Math.random() * 2
    );

    rock.scale.y = 0.6 + Math.random() * 0.5;
    rock.castShadow = true;
    rock.receiveShadow = true;

    scene.add(rock);
}

// =====================================================
// 11. COSMO
// =====================================================

const cosmo = new THREE.Group();
cosmo.position.set(-4, 0, 0);
scene.add(cosmo);

let astronautMixer = null;
let cosmoLoaded = false;

const loader = new GLTFLoader();

loader.load(
    '/models/scene.gltf',

    gltf => {
        const model = gltf.scene;

        model.updateMatrixWorld(true);

        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);

        const height = size.y || 1;
        const scale = 1.8 / height;

        model.scale.setScalar(scale);

        model.updateMatrixWorld(true);

        const scaledBox = new THREE.Box3().setFromObject(model);

        model.position.y -= scaledBox.min.y;

        model.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        cosmo.add(model);
        cosmoLoaded = true;

        if (gltf.animations.length > 0) {
            astronautMixer = new THREE.AnimationMixer(model);

            const walkAnimation = gltf.animations.find(animation =>
                /walk|walking|run/i.test(animation.name)
            );

            const animation = walkAnimation || gltf.animations[0];
            astronautMixer.clipAction(animation).play();
        }

        console.log('Cosmo model loaded successfully.');
    },

    undefined,

    error => {
        console.error('Could not load Cosmo model:', error);
        createFallbackAstronaut();
    }
);

function createFallbackAstronaut() {
    if (cosmoLoaded) return;

    const whiteMaterial = new THREE.MeshStandardMaterial({
        color: 0xe4edf6,
        roughness: 0.55
    });

    const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.38, 0.7, 5, 10),
        whiteMaterial
    );

    body.position.y = 1;
    cosmo.add(body);

    const helmet = new THREE.Mesh(
        new THREE.SphereGeometry(0.38, 24, 24),
        new THREE.MeshStandardMaterial({
            color: 0x9bdfff,
            metalness: 0.7,
            roughness: 0.2
        })
    );

    helmet.position.y = 1.85;
    cosmo.add(helmet);
}

// =====================================================
// 12. MOVEMENT
// =====================================================

let movementTarget = null;
let movementCallback = null;
let isMoving = false;

function moveCosmoTo(x, z, callback) {
    movementTarget = new THREE.Vector3(x, 0, z);
    movementCallback = callback;
    isMoving = true;

    const direction = x - cosmo.position.x;

    if (Math.abs(direction) > 0.1) {
        cosmo.rotation.y = direction > 0 ? Math.PI / 2 : -Math.PI / 2;
    }
}

function updateCosmoMovement(delta) {
    if (!isMoving || !movementTarget) return;

    const distance = cosmo.position.distanceTo(movementTarget);

    if (distance < 0.12) {
        cosmo.position.copy(movementTarget);
        isMoving = false;

        const callback = movementCallback;
        movementCallback = null;

        if (callback) callback();
        return;
    }

    const speed = 2.0;
    cosmo.position.lerp(
        movementTarget,
        Math.min(1, speed * delta / Math.max(distance, 0.01))
    );
}

// =====================================================
// 13. INCIDENT LOCATIONS
// =====================================================

const incidentLocations = [
    { x: 3, z: 2, name: 'EXPLORATION ZONE' },
    { x: -8, z: -8, name: 'SOLAR ARRAY' },
    { x: -3, z: -5, name: 'HABITAT MODULE' }
];

// =====================================================
// 14. RESOURCE SYSTEM
// =====================================================

function clamp(value) {
    return Math.max(0, Math.min(100, value));
}

function updateResources(effects = null) {
    if (effects) {
        Object.keys(effects).forEach(key => {
            resources[key] = clamp(resources[key] + effects[key]);
        });
    }

    updateResourceDisplay();
}

function updateResourceDisplay() {
    const keys = ['energy', 'oxygen', 'health', 'safety'];

    keys.forEach(key => {
        const value = Math.round(resources[key]);

        $(`${key}-value`).textContent = `${value}%`;
        $(`${key}-bar`).style.width = `${value}%`;

        const bar = $(`${key}-bar`);

        if (value <= 25) {
            bar.style.opacity = '0.7';
        } else {
            bar.style.opacity = '1';
        }
    });
}

updateResourceDisplay();

elements.baseName.textContent = chosenBase.toUpperCase();
elements.locationName.textContent = baseProfile.location;

// =====================================================
// 15. DIALOGUE SYSTEM
// =====================================================

function showDialogue(message, callback) {
    elements.incident.classList.add('hidden');

    elements.dialogueText.textContent = message;
    elements.dialogue.classList.remove('hidden');

    dialogueAction = callback;
}

elements.dialogueButton.addEventListener('click', () => {
    if (!dialogueAction) return;

    const action = dialogueAction;
    dialogueAction = null;

    elements.dialogue.classList.add('hidden');
    action();
});

// =====================================================
// 16. START EXPLORATION
// =====================================================

elements.start.addEventListener('click', () => {
    if (gameStarted) return;

    gameStarted = true;
    elements.intro.classList.add('hidden');

    showDialogue(
        `Welcome to ${chosenBase}, Cosmo. The base is operational. Let's explore the surroundings and check that all our systems are working properly.`,
        () => {
            elements.locationName.textContent = 'EXPLORATION ZONE';

            moveCosmoTo(
                incidentLocations[0].x,
                incidentLocations[0].z,
                () => showIncident(0)
            );
        }
    );
});

// =====================================================
// 17. SHOW INCIDENT
// =====================================================

function showIncident(index) {
    if (index >= incidents.length) {
        showFinalReport();
        return;
    }

    currentIncident = index;
    selectedChoice = null;

    const incident = incidents[index];

    elements.counter.textContent = `INCIDENT ${index + 1} / 3`;
    elements.progress.style.width = `${(index / 3) * 100}%`;

    elements.incidentType.textContent = incident.type;
    elements.incidentTitle.textContent = incident.title;
    elements.incidentDescription.textContent = incident.description;

    elements.choices.innerHTML = '';
    elements.feedback.classList.add('hidden');
    elements.confirm.classList.add('hidden');

    incident.choices.forEach((choice, choiceIndex) => {
        const button = document.createElement('button');

        button.className = 'choice-button';

        button.innerHTML = `
            <strong>${choiceIndex === 0 ? 'A' : 'B'} · ${choice.title}</strong>
            <small>${choice.description}</small>
        `;

        button.addEventListener('click', () => {
            selectChoice(choiceIndex);
        });

        elements.choices.appendChild(button);
    });

    elements.incident.classList.remove('hidden');
}

// =====================================================
// 18. SELECT CHOICE
// =====================================================

function selectChoice(index) {
    selectedChoice = index;

    const buttons = elements.choices.querySelectorAll('.choice-button');

    buttons.forEach((button, i) => {
        button.classList.toggle('selected', i === index);
    });

    elements.confirm.classList.remove('hidden');
}

elements.confirm.addEventListener('click', () => {
    if (selectedChoice === null) return;

    applyDecision();
});

// =====================================================
// 19. APPLY CONSEQUENCES
// =====================================================

function applyDecision() {
    const incident = incidents[currentIncident];
    const choice = incident.choices[selectedChoice];

    updateResources(choice.effects);

    decisions.push({
        incident: incident.title,
        choice: choice.title
    });

    elements.feedback.textContent = choice.feedback;
    elements.feedback.classList.remove('hidden');

    elements.choices.querySelectorAll('.choice-button').forEach(button => {
        button.disabled = true;
    });

    elements.confirm.classList.add('hidden');

    // Visual reactions to decisions
    if (currentIncident === 0 && selectedChoice === 1) {
        cosmo.materialColor = 0xff7777;
        flashAlert();
    }

    if (currentIncident === 1 && selectedChoice === 1) {
        solarGroup.children.forEach((panel, index) => {
            if (index === 0 || index === 1) {
                panel.visible = false;
            }
        });

        baseLight.intensity = 2;
    }

    if (currentIncident === 2 && selectedChoice === 0) {
        baseLight.color.set(0x65e6b1);
    }

    elements.dialogueButton.textContent = 'CONTINUE →';

    elements.confirm.classList.add('hidden');

    // Show consequence dialogue after a short pause
    setTimeout(() => {
        elements.incident.classList.add('hidden');

        showDialogue(choice.dialogue, () => {
            proceedToNextIncident();
        });
    }, 1800);
}

function flashAlert() {
    sunLight.color.set(0xff7777);

    setTimeout(() => {
        sunLight.color.set(0xffe4b0);
    }, 2500);
}

// =====================================================
// 20. NEXT INCIDENT
// =====================================================

function proceedToNextIncident() {
    const nextIndex = currentIncident + 1;

    elements.progress.style.width = `${(nextIndex / 3) * 100}%`;

    if (nextIndex >= incidents.length) {
        showFinalReport();
        return;
    }

    const nextLocation = incidentLocations[nextIndex];

    elements.locationName.textContent = nextLocation.name;

    moveCosmoTo(
        nextLocation.x,
        nextLocation.z,
        () => showIncident(nextIndex)
    );
}

// =====================================================
// 21. FINAL REPORT
// =====================================================

function showFinalReport() {
    if (gameFinished) return;

    gameFinished = true;

    elements.dialogue.classList.add('hidden');
    elements.incident.classList.add('hidden');

    elements.progress.style.width = '100%';
    elements.counter.textContent = 'MISSION REPORT';

    const survived =
        resources.health > 0 &&
        resources.oxygen > 0 &&
        resources.energy > 0 &&
        resources.safety > 0;

    elements.reportTitle.textContent = survived
        ? 'MISSION COMPLETE'
        : 'MISSION FAILED';

    elements.reportDescription.textContent = survived
        ? 'You have completed all three incidents. Your decisions have shaped the condition of the lunar base. Well done, astronaut!'
        : 'The base could not maintain all its essential resources. Review your decisions and try again to improve the survival outcome.';

    $('final-energy').textContent = `${resources.energy}%`;
    $('final-oxygen').textContent = `${resources.oxygen}%`;
    $('final-health').textContent = `${resources.health}%`;
    $('final-safety').textContent = `${resources.safety}%`;

    elements.decisionList.innerHTML = '';

    decisions.forEach((decision, index) => {
        const item = document.createElement('div');
        item.className = 'decision-item';

        item.textContent =
            `${index + 1}. ${decision.incident} — ${decision.choice}`;

        elements.decisionList.appendChild(item);
    });

    if (survived) {
        localStorage.setItem('mission2Completed', 'true');
        elements.finish.innerHTML = 'RETURN TO MISSION PATH <span>→</span>';
    } else {
        elements.finish.innerHTML = 'TRY AGAIN <span>↻</span>';
    }

    elements.report.classList.remove('hidden');
}

elements.finish.addEventListener('click', () => {
    const survived =
        resources.health > 0 &&
        resources.oxygen > 0 &&
        resources.energy > 0 &&
        resources.safety > 0;

    if (survived) {
        window.location.href = '/path.html';
    } else {
        window.location.reload();
    }
});

// =====================================================
// 22. ANIMATION LOOP
// =====================================================

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.05);

    updateCosmoMovement(delta);

    if (astronautMixer) {
        astronautMixer.update(delta);
    }

    stars.rotation.y += delta * 0.002;
    earth.rotation.y += delta * 0.04;

    if (!isMoving && gameStarted) {
        cosmo.position.y = Math.abs(Math.sin(performance.now() * 0.002)) * 0.035;
    }

    renderer.render(scene, camera);
}

animate();

// =====================================================
// 23. RESPONSIVE RESIZE
// =====================================================

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
});
