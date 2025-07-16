// js/features/animations.js

// DOM-Elemente
const canvas = document.getElementById('animationCanvas');
const ctx = canvas.getContext('2d');

// Zustand
let circles = [];
const gradients = {
  "green": ["rgba(0,255,0,1)", "rgba(0,255,0,0.3)", "rgba(255,255,255,0)"],
  "red": ["rgba(255,0,0,1)", "rgba(255,0,0,0.3)", "rgba(255,255,255,0)"],
  // ... weitere Farben bei Bedarf
};

function animateCircles() {
    if (!canvas) return;
    const now = Date.now();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    circles = circles.filter(circle => {
        const t = now - circle.creationTime;
        if (t >= circle.duration) return false;

        let opacity = (t < 500) ? (t / 500) : (1 - (t - 500) / (circle.duration - 500));
        
        const gradColors = gradients[circle.color] || [circle.color, circle.color, "rgba(255,255,255,0)"];
        const grad = ctx.createRadialGradient(circle.x, circle.y, 0, circle.x, circle.y, circle.radius);
        grad.addColorStop(0, gradColors[0]);
        grad.addColorStop(0.7, gradColors[1]);
        grad.addColorStop(1, gradColors[2]);
        
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.globalAlpha = 1;
        
        return true;
    });

    requestAnimationFrame(animateCircles);
}

export function addCircle(type) {
    if (!canvas) return;
    const color = type === 'positive' ? 'green' : 'red';
    circles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 800 + 400,
        color: color,
        creationTime: Date.now(),
        duration: 2000,
    });
}

export function initializeAnimations() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    animateCircles();
}
