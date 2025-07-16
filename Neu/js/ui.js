import { state } from './state.js';
import { noteAnimals } from './config.js';

// DOM-Elemente
const elements = {
    notation: document.getElementById('notation'),
    noteName: document.getElementById('noteNameDisplay'),
    lageButton: document.getElementById('lageButton'),
    toneButton: document.getElementById('toneButton'),
    welcomeOverlay: document.getElementById('welcomeOverlay'),
    mainContent: document.getElementById('mainContent'),
    introOverlay: document.getElementById('introOverlay'),
};

export function showWelcomeScreen(onFinish) {
    elements.introOverlay.classList.add('hidden');
    elements.welcomeOverlay.classList.remove('hidden');
    
    // Hole den Namen des Benutzers und zeige eine Begrüßung an
    const storedName = localStorage.getItem("userName") || "Gast";
    document.getElementById("welcomeMessage").textContent = `Hallo, ${storedName}!`;

    setTimeout(() => {
        elements.welcomeOverlay.style.opacity = "0";
        setTimeout(() => {
            elements.welcomeOverlay.classList.add("hidden");
            elements.mainContent.style.display = "block";
            onFinish(); // Callback ausführen
        }, 1000);
    }, 3000);
}

export function drawSeries() {
    const { currentSeries, seriesCounter, kidsMode } = state;
    if (!currentSeries || currentSeries.length === 0) return;

    elements.notation.innerHTML = '';
    const renderer = new Vex.Flow.Renderer(elements.notation, Vex.Flow.Renderer.Backends.SVG);
    renderer.resize(600, 150);
    const context = renderer.getContext();
    
    const stave = new Vex.Flow.Stave(10, 10, 580);
    const firstNote = currentSeries[0];
    stave.addClef(firstNote.clef).addKeySignature(state.currentLage);
    stave.setContext(context).draw();

    const staveNotes = currentSeries.map(item => {
        const key = `${item.note.toLowerCase()}/${item.octave}`;
        const note = new Vex.Flow.StaveNote({
            keys: [key],
            duration: "q",
            clef: item.clef,
        });
        if (item.color) {
            note.setStyle({ fillStyle: item.color, strokeStyle: item.color });
        }
        if(item.note.includes('#') || item.note.includes('b')) {
            note.addAccidental(0, new Vex.Flow.Accidental(item.note.slice(1)));
        }
        return note;
    });

    Vex.Flow.Formatter.FormatAndDraw(context, stave, staveNotes);

    // Aktive Note markieren
    if (seriesCounter < staveNotes.length) {
        const activeNote = staveNotes[seriesCounter];
        const bbox = activeNote.getBoundingBox();
        if (bbox) {
            const triangle = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            const noteX = bbox.getX() + bbox.getW() / 2;
            const noteY = stave.getY() - 6;
            triangle.setAttribute('points', `${noteX - 5},${noteY - 5} ${noteX + 5},${noteY - 5} ${noteX},${noteY}`);
            triangle.setAttribute('fill', 'black');
            elements.notation.querySelector('svg').appendChild(triangle);
        }
    }
    
    if (kidsMode) {
        // Emoji-Logik hier einfügen...
    }
}

export function updateNoteNameDisplay(text, color) {
    elements.noteName.innerHTML = `<span style="color:${color};">${text}</span>`;
}

export function updateLageButtons() {
    elements.lageButton.textContent = `${state.currentLage}-Lage`;
    elements.toneButton.textContent = state.currentTone;
    elements.lageButton.style.opacity = state.selectedMode === 'lage' ? '1' : '0.5';
    elements.toneButton.style.opacity = state.selectedMode === 'tone' ? '1' : '0.5';
}

export function setupUIEventListeners({ onCycleLage, onCycleTone }) {
    elements.lageButton.addEventListener('click', onCycleLage);
    elements.toneButton.addEventListener('click', onCycleTone);
    // ... weitere Event Listener für Settings Panel etc.
}
