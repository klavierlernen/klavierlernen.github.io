import { state, resetGameStats } from './state.js';
import * as ui from './ui.js';
import * as config from './config.js';

export function generateSeries() {
    state.seriesCounter = 0;
    const notesForRange = config.rangeNotes[state.currentLage] || config.rangeNotes['C'];
    const clef = (state.selectedMode === 'left') ? 'bass' : 'treble';

    state.currentSeries = [];
    for (let i = 0; i < config.SERIES_LENGTH; i++) {
        const noteName = notesForRange[Math.floor(Math.random() * notesForRange.length)];
        let octave = (clef === 'bass') ? 3 : 4;
        // Oktav-Anpassungen für spezielle Lagen
        if (state.currentLage === 'G' && (noteName === 'c' || noteName === 'd')) {
            octave = 5;
        }

        state.currentSeries.push({
            note: noteName,
            octave: octave,
            clef: clef,
            color: 'black'
        });
    }
    ui.drawSeries();
}

export function handleMIDIMessage(playedMidi) {
    if (state.sessionPaused || state.gameOver) return;

    const { currentSeries, seriesCounter } = state;
    if (seriesCounter >= currentSeries.length) return;

    const expectedNote = currentSeries[seriesCounter];
    state.totalAttempts++;
    state.lastNoteTimestamp = Date.now();
    
    // Konvertiere MIDI-Note-Name für die Anzeige
    const playedNoteName = (playedMidi.note === 'b' ? 'h' : playedMidi.note).toUpperCase();

    if (isNoteCorrect(playedMidi, expectedNote)) {
        handleCorrectAnswer(playedNoteName);
    } else {
        handleWrongAnswer(playedNoteName);
    }

    state.seriesCounter++;
    
    if (state.seriesCounter >= currentSeries.length) {
        setTimeout(generateSeries, 500); // Kurze Pause vor der nächsten Serie
    } else {
        ui.drawSeries();
    }
}

function isNoteCorrect(played, expected) {
    // Normalisiere Notennamen für den Vergleich (z.B. 'bb' vs 'a#')
    const playedNote = played.note.toLowerCase();
    const expectedNoteName = expected.note.toLowerCase();
    return playedNote === expectedNoteName && played.octave === expected.octave;
}

function handleCorrectAnswer(playedNoteName) {
    state.correctAnswers++;
    state.currentSeries[state.seriesCounter].color = 'green';
    ui.updateNoteNameDisplay(playedNoteName, 'green');
}

function handleWrongAnswer(playedNoteName) {
    state.currentSeries[state.seriesCounter].color = 'red';
    ui.updateNoteNameDisplay(playedNoteName, 'red');
    if (!state.unlimitedLives) {
        state.hearts--;
        if (state.hearts <= 0) {
            state.gameOver = true;
            // zeige Game Over Screen
        }
    }
}

export function cycleLage() {
    state.currentLageIndex = (state.currentLageIndex + 1) % config.lageArray.length;
    state.currentLage = config.lageArray[state.currentLageIndex];
    state.selectedMode = 'lage';
    ui.updateLageButtons();
    generateSeries();
}

export function cycleTone() {
    state.currentToneIndex = (state.currentToneIndex + 1) % config.toneArray.length;
    state.currentLage = config.toneArray[state.currentToneIndex]; // Quintenzirkel als "Lage"
    state.selectedMode = 'tone';
    ui.updateLageButtons();
    generateSeries();
}
