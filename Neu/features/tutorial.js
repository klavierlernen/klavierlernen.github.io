// js/features/tutorial.js

const steps = [
    "Willkommen! Lass uns dir kurz die App zeigen.",
    "Auf dem Bildschirm siehst du Noten. Spiele sie einfach auf deinem MIDI-Keyboard.",
    "Im Menü rechts kannst du verschiedene Einstellungen vornehmen.",
    "Viel Spaß beim Üben! Tippe, um zu starten."
];

function showTutorial(onFinish) {
    let stepIndex = 0;
    const overlay = document.createElement('div');
    overlay.id = 'tutorialOverlay'; // Stylen mit CSS
    overlay.style.position = 'fixed';
    overlay.style.inset = 0;
    overlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
    overlay.style.color = 'white';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.textAlign = 'center';
    overlay.style.fontSize = '1.5em';
    overlay.style.zIndex = '9999';
    overlay.style.cursor = 'pointer';

    const textElement = document.createElement('p');
    textElement.textContent = steps[stepIndex];
    overlay.appendChild(textElement);
    
    overlay.addEventListener('click', () => {
        stepIndex++;
        if (stepIndex < steps.length) {
            textElement.textContent = steps[stepIndex];
        } else {
            overlay.remove();
            localStorage.setItem("tutorialCompleted", "true");
            onFinish();
        }
    });

    document.body.appendChild(overlay);
}

export function startTutorialIfNeeded(onFinish) {
    if (!localStorage.getItem("tutorialCompleted")) {
        showTutorial(onFinish);
    } else {
        onFinish(); // Tutorial bereits abgeschlossen, direkt fortfahren
    }
}
