const lunarVideos = [
    {
        src: '/videos/Water on the Moon.mp4',
        title: 'Searching for Water on the Moon',
        description: `Scientists have long suspected that frozen water could survive in permanently shadowed craters near the Moon's poles.

NASA's Lunar Reconnaissance Orbiter (LRO) uses an instrument called LEND (Lunar Exploration Neutron Detector) to investigate the presence of hydrogen in lunar soil.

By observing how neutrons interact with the lunar surface, scientists can identify areas with reduced neutron flux, which may indicate the presence of hydrogen and potentially water.

The dark blue regions in this visualization show areas with suppressed neutron flux near the lunar South Pole. These measurements provide evidence of possible water ice beneath the lunar surface.`,
        credit: 'NASA Goddard Space Flight Center – Scientific Visualization Studio'
    },
    {
        src: '/videos/lunar renaissance.mp4',
        title: "Mapping the Moon's South Pole in 3D",
        description: `This visualization presents real topographic measurements collected by NASA's Lunar Reconnaissance Orbiter (LRO).

LRO was launched on June 18, 2009, to study and map the Moon.

One of its instruments, LOLA (Lunar Orbiter Laser Altimeter), uses laser pulses to measure the distance between the spacecraft and the lunar surface.

These measurements help scientists create detailed elevation maps and 3D representations of the lunar terrain.`,
        credit: 'Visualization: Alex Kekesi | NASA Goddard Space Flight Center – Scientific Visualization Studio | Data: LRO / LOLA'
    },
    {
        src: '/videos/reflectance and temperature data.mp4',
        title: 'Searching for Water Frost at the Moon’s Poles',
        description: `NASA scientists combined measurements from two instruments aboard the Lunar Reconnaissance Orbiter (LRO) to identify locations where water frost might exist.

Diviner measures the temperature of the lunar surface, helping scientists identify extremely cold regions.

LOLA provides surface reflectance measurements, helping identify areas that may contain frost.

Combining these observations provides evidence of possible surface water frost near the Moon's poles. However, this does not confirm the presence of ice in every highlighted location.`,
        credit: 'NASA Goddard Space Flight Center – Scientific Visualization Studio | Data: LRO / Diviner and LOLA'
    }
];

let activeVideo = 0;

const videoElement = document.getElementById('lunar-video');
const videoTitle = document.getElementById('video-title');
const videoDescription = document.getElementById('video-description');
const videoCredit = document.getElementById('video-credit');
const videoDots = document.getElementById('video-dots');

function displayVideo(index) {

    activeVideo = (index + lunarVideos.length) % lunarVideos.length;

    const video = lunarVideos[activeVideo];

    videoElement.pause();
    videoElement.src = video.src;
    videoElement.load();

    videoElement.play().catch(error => {
        console.log('Video playback:', error);
    });

    videoTitle.textContent = video.title;
    videoDescription.textContent = video.description;
    videoCredit.textContent = video.credit;

    document.querySelectorAll('.video-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === activeVideo);
    });
}

// Create navigation dots
lunarVideos.forEach((video, index) => {

    const dot = document.createElement('button');
    dot.className = 'video-dot';
    dot.setAttribute('aria-label', `Play video ${index + 1}: ${video.title}`);

    dot.addEventListener('click', () => {
        displayVideo(index);
    });

    videoDots.appendChild(dot);

});

// Navigation
document.getElementById('prev-video').addEventListener('click', () => {
    displayVideo(activeVideo - 1);
});

document.getElementById('next-video').addEventListener('click', () => {
    displayVideo(activeVideo + 1);
});

// First video
displayVideo(0);

// Explore button
const discoverButton = document.getElementById('discover-button');

discoverButton.addEventListener('click', () => {
    document.getElementById('discoveries').scrollIntoView({
        behavior: 'smooth'
    });
});

const startButton = document.getElementById('start-button');

if (startButton) {
    startButton.addEventListener('click', () => {
        localStorage.setItem('startCompleted', 'true');
        window.location.href = '/path.html';
    });
}