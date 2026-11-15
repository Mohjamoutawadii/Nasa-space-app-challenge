
const canvas = document.getElementById('certificate-canvas');
const ctx = canvas.getContext('2d');

const nameInput = document.getElementById('student-name');
const downloadButton = document.getElementById('download-button');
const lockedScreen = document.getElementById('locked-screen');

const WIDTH = 1600;
const HEIGHT = 1100;

// =====================================================
// 1. CERTIFICATE ACCESS
// =====================================================

if (localStorage.getItem('mission2Completed') !== 'true') {
    lockedScreen.classList.remove('hidden');
} else {
    drawCertificate();
}

// =====================================================
// 2. DRAWING HELPERS
// =====================================================

function roundedRect(x, y, width, height, radius, fill, stroke = null, lineWidth = 1) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);

    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }

    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }
}

function drawStar(x, y, radius, color, opacity = 1) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.beginPath();

    for (let i = 0; i < 10; i++) {
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const r = i % 2 === 0 ? radius : radius * 0.4;

        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }

    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawPlanet(x, y, radius, color1, color2) {
    const gradient = ctx.createRadialGradient(
        x - radius * 0.35,
        y - radius * 0.35,
        radius * 0.05,
        x,
        y,
        radius
    );

    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);

    ctx.save();

    ctx.shadowColor = color1;
    ctx.shadowBlur = 35;

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawRibbon(x, y, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - 25, y);
    ctx.lineTo(x - 44, y + 115);
    ctx.lineTo(x, y + 95);
    ctx.lineTo(x + 44, y + 115);
    ctx.lineTo(x + 25, y);
    ctx.closePath();
    ctx.fill();
}

function drawMedal(cx, cy) {
    // Ribbon
    drawRibbon(cx - 30, cy + 65, '#ed718c');
    drawRibbon(cx + 30, cy + 65, '#5a9fe7');

    // Outer medal
    const gradient = ctx.createRadialGradient(
        cx - 20, cy - 20, 5,
        cx, cy, 100
    );

    gradient.addColorStop(0, '#fff4bd');
    gradient.addColorStop(0.55, '#f7c84f');
    gradient.addColorStop(1, '#bc7726');

    ctx.save();
    ctx.shadowColor = 'rgba(255,206,91,0.55)';
    ctx.shadowBlur = 30;

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, 83, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    ctx.strokeStyle = '#fff0ae';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, 70, 0, Math.PI * 2);
    ctx.stroke();

    // Inner star
    drawStar(cx, cy, 48, '#fff9dc');

    ctx.fillStyle = '#d08b29';
    ctx.font = 'bold 35px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', cx, cy + 2);
}

function drawAstronaut(cx, cy) {
    ctx.save();

    // Backpack
    roundedRect(cx - 49, cy + 30, 98, 135, 25, '#b9d5e9', '#718ca8', 5);

    // Body
    ctx.fillStyle = '#edf5fc';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 88, 67, 87, 0, 0, Math.PI * 2);
    ctx.fill();

    // Arms
    ctx.lineCap = 'round';
    ctx.lineWidth = 28;
    ctx.strokeStyle = '#edf5fc';

    ctx.beginPath();
    ctx.moveTo(cx - 45, cy + 55);
    ctx.lineTo(cx - 91, cy + 105);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 45, cy + 55);
    ctx.lineTo(cx + 91, cy + 105);
    ctx.stroke();

    // Helmet
    ctx.fillStyle = '#f6fbff';
    ctx.beginPath();
    ctx.arc(cx, cy, 65, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#b8cfe3';
    ctx.lineWidth = 7;
    ctx.stroke();

    const visor = ctx.createLinearGradient(cx - 40, cy - 35, cx + 45, cy + 40);
    visor.addColorStop(0, '#8cecff');
    visor.addColorStop(0.5, '#3268a4');
    visor.addColorStop(1, '#142c57');

    ctx.fillStyle = visor;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 1, 48, 43, 0, 0, Math.PI * 2);
    ctx.fill();

    // Visor shine
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx - 7, cy - 3, 31, Math.PI * 1.1, Math.PI * 1.55);
    ctx.stroke();

    // Small chest badge
    drawStar(cx, cy + 88, 15, '#f6c95b');

    ctx.restore();
}

// =====================================================
// 3. CERTIFICATE BACKGROUND
// =====================================================

function drawBackground() {
    const background = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);

    background.addColorStop(0, '#101d4c');
    background.addColorStop(0.5, '#253a78');
    background.addColorStop(1, '#5a438b');

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Soft glowing areas
    const glow = ctx.createRadialGradient(800, 450, 50, 800, 450, 750);
    glow.addColorStop(0, 'rgba(107,209,255,0.22)');
    glow.addColorStop(1, 'rgba(107,209,255,0)');

    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Stars
    for (let i = 0; i < 100; i++) {
        const x = (i * 137.5 + 43) % WIDTH;
        const y = (i * 83.3 + 27) % HEIGHT;
        const radius = i % 5 === 0 ? 5 : 2.2;

        drawStar(x, y, radius, '#ffffff', 0.35 + (i % 5) * 0.12);
    }

    // Planets
    drawPlanet(140, 210, 90, '#ffd3a1', '#c66b78');
    drawPlanet(1450, 840, 125, '#b7a0ff', '#5142a4');

    // Planet rings
    ctx.save();
    ctx.translate(1450, 840);
    ctx.rotate(-0.3);
    ctx.strokeStyle = 'rgba(221,211,255,0.6)';
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.ellipse(0, 0, 190, 45, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Moon at bottom
    drawPlanet(180, 1030, 100, '#e8edf5', '#7f8da8');
}

// =====================================================
// 4. CERTIFICATE BORDER
// =====================================================

function drawBorder() {
    roundedRect(
        35, 35, WIDTH - 70, HEIGHT - 70,
        35, null, '#f4d78b', 5
    );

    roundedRect(
        52, 52, WIDTH - 104, HEIGHT - 104,
        25, null, 'rgba(255,239,189,0.65)', 2
    );

    // Corner stars
    drawStar(100, 100, 25, '#ffe29a');
    drawStar(WIDTH - 100, 100, 25, '#ffe29a');
    drawStar(100, HEIGHT - 100, 25, '#ffe29a');
    drawStar(WIDTH - 100, HEIGHT - 100, 25, '#ffe29a');
}

// =====================================================
// 5. CERTIFICATE TEXT
// =====================================================

function drawText(name) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Top label
    ctx.font = 'bold 21px Arial';
    ctx.fillStyle = '#b8eaff';
    ctx.fillText('✦  ASTROHEROES SPACE ACADEMY  ✦', 800, 145);

    // Main heading
    ctx.font = 'bold 67px Georgia';
    ctx.fillStyle = '#fff3cb';
    ctx.fillText('CERTIFICATE', 800, 255);

    ctx.font = 'bold 35px Georgia';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('OF LUNAR EXPLORATION', 800, 310);

    // Decorative divider
    ctx.strokeStyle = '#f5d78b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(480, 360);
    ctx.lineTo(1120, 360);
    ctx.stroke();

    drawStar(800, 360, 13, '#ffe29a');

    // Award message
    ctx.font = '24px Arial';
    ctx.fillStyle = '#e2e9ff';
    ctx.fillText('THIS CERTIFICATE IS PROUDLY AWARDED TO', 800, 425);

    // Student name
    const safeName = name.trim() || 'YOUR NAME';

    let fontSize = 76;
    ctx.font = `bold ${fontSize}px Georgia`;

    while (ctx.measureText(safeName).width > 1050 && fontSize > 38) {
        fontSize -= 2;
        ctx.font = `bold ${fontSize}px Georgia`;
    }

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(101,232,255,0.55)';
    ctx.shadowBlur = 20;
    ctx.fillText(safeName, 800, 525);
    ctx.shadowBlur = 0;

    // Achievement message
    ctx.font = '24px Arial';
    ctx.fillStyle = '#e2e9ff';
    ctx.fillText('For successfully completing the AstroHeroes lunar missions,', 800, 610);
    ctx.fillText('overcoming challenges and making brave decisions in space!', 800, 648);

    // Achievement title
    roundedRect(500, 700, 600, 75, 37, 'rgba(255,221,143,0.16)', '#f7d88f', 2);

    ctx.font = 'bold 25px Arial';
    ctx.fillStyle = '#ffe6a4';
    ctx.fillText('✦  OFFICIAL LUNAR EXPLORER  ✦', 800, 738);

    // Date
    const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    ctx.font = '19px Arial';
    ctx.fillStyle = '#c4d4f0';
    ctx.fillText(`AWARDED ON ${date.toUpperCase()}`, 800, 850);

    // Signature
    ctx.strokeStyle = '#f2d78e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(600, 940);
    ctx.lineTo(1000, 940);
    ctx.stroke();

    ctx.font = 'bold 20px Georgia';
    ctx.fillStyle = '#fff0c0';
    ctx.fillText('COSMO', 800, 980);

    ctx.font = '15px Arial';
    ctx.fillStyle = '#c1d3f0';
    ctx.fillText('YOUR SPACE EXPLORATION COMPANION', 800, 1012);
}

// =====================================================
// 6. COMPLETE CERTIFICATE
// =====================================================

function drawCertificate() {
    const name = nameInput.value.trim();

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    drawBackground();
    drawBorder();

    // Main astronaut medal
    drawMedal(800, 170);

    drawText(name);

    // Extra decorative astronaut illustration
    drawAstronaut(230, 660);
}

// =====================================================
// 7. LIVE NAME UPDATE
// =====================================================

nameInput.addEventListener('input', drawCertificate);

// =====================================================
// 8. DOWNLOAD CERTIFICATE
// =====================================================

downloadButton.addEventListener('click', () => {
    if (localStorage.getItem('mission2Completed') !== 'true') {
        lockedScreen.classList.remove('hidden');
        return;
    }

    const name = nameInput.value.trim();

    if (!name) {
        nameInput.focus();
        nameInput.placeholder = 'Please enter your name first!';
        return;
    }

    drawCertificate();

    canvas.toBlob(blob => {
        if (!blob) {
            alert('Sorry! The certificate could not be generated.');
            return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        const safeFilename = name
            .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .slice(0, 40) || 'Explorer';

        link.href = url;
        link.download = `AstroHeroes-Certificate-${safeFilename}.png`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
});

// Initial preview
if (localStorage.getItem('mission2Completed') === 'true') {
    drawCertificate();
}
