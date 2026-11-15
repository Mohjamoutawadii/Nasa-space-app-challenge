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

document.querySelector('#start-button').addEventListener('click', () => {
    window.location.href = 'Cosmo-introduction.html';
});