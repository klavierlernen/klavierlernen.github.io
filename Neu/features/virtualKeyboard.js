// js/features/virtualKeyboard.js

let keyboard;

function noteToMidi(note) {
    const semitones = { c:0, "c#":1, d:2, "d#":3, e:4, f:5, "f#":6, g:7, "g#":8, a:9, "a#":10, b:11 };
    const match = note.match(/^([a-g]#?)(\d)$/i);
    if (!match) return 60; // Fallback
    const pitch = match[1].toLowerCase();
    const octave = parseInt(match[2], 10);
    return (octave + 1) * 12 + semitones[pitch];
}

export function initializeVirtualKeyboard(onNotePlayed) {
    if (typeof QwertyHancock === 'undefined') {
        console.error("QwertyHancock ist nicht geladen.");
        return;
    }

    const keyboardDiv = document.getElementById('virtualKeyboard');
    if (!keyboardDiv) return;

    keyboard = new QwertyHancock({
        id: 'virtualKeyboard',
        width: window.innerWidth,
        height: 150,
        octaves: 2,
        startNote: 'C4',
        whiteNotesColour: '#fff',
        blackNotesColour: '#000',
        hoverColour: '#f3e939'
    });

    keyboard.keyDown = (note, freq) => {
        // Konvertiere Note (z.B. 'C4') zu MIDI-Objekt
        const midiNumber = noteToMidi(note);
        const midiInfo = {
             note: note.slice(0, -1).toLowerCase(), // 'c', 'c#'
             octave: parseInt(note.slice(-1), 10)
        };
        onNotePlayed(midiInfo);
    };
}

export function toggleVirtualKeyboard() {
    const keyboardDiv = document.getElementById('virtualKeyboard');
    if(keyboardDiv) {
        keyboardDiv.classList.toggle('hidden');
    }
}
