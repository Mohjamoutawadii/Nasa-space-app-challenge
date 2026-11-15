// ========================================
// ASTROHEROES - JOURNEY PROGRESSION
// ========================================

const startCompleted =
    localStorage.getItem('startCompleted') === 'true';

const mission1Completed =
    localStorage.getItem('mission1Completed') === 'true';

const mission2Completed =
    localStorage.getItem('mission2Completed') === 'true';



const startPoint = document.querySelector('.start-point');
const missionOne = document.querySelector('.mission-one');
const missionTwo = document.querySelector('.mission-two');
const missionThree = document.querySelector('.mission-three');
const certificate = document.querySelector('.certificate-point');

function setMissionState(element, state) {
    if (!element) return;

    element.classList.remove(
        'locked-point',
        'unlocked-point',
        'completed-point'
    );

    element.classList.add(`${state}-point`);
}

// START
setMissionState(startPoint, startCompleted ? 'completed' : 'unlocked');

// MISSION 1
if (mission1Completed) {
    setMissionState(missionOne, 'completed');
} else if (startCompleted) {
    setMissionState(missionOne, 'unlocked');
} else {
    setMissionState(missionOne, 'locked');
}

// MISSION 2
if (mission2Completed) {
    setMissionState(missionTwo, 'completed');
} else if (mission1Completed) {
    setMissionState(missionTwo, 'unlocked');
} else {
    setMissionState(missionTwo, 'locked');
}



// CERTIFICATE
setMissionState(
    certificate,
    mission2Completed ? 'unlocked' : 'locked'
);