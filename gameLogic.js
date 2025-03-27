// gameLogic.js
// Kernlogik des Spiels: Notengenerierung, Überprüfung, Pausen-Logik, Score-Recording

import { drawSeries } from "./notation.js";

export function generateSeries(rangeNotes, currentRange, seriesLength, randomMode, selectedMode, errorNotes) {
  let seriesCounter = 0;
  let currentSeriesSingle = [];
  const seriesClef = randomMode
    ? (Math.random() < 0.5 ? "bass" : "treble")
    : ((selectedMode === "left") ? "bass" : "treble");

  const chooseNote = () => {
    if (errorNotes.length > 0 && Math.random() < 0.6) {
      const idx = errorNotes.findIndex(note => note.clef === seriesClef);
      if (idx !== -1) { return errorNotes.splice(idx, 1)[0]; }
    }
    let availableNotes;
    if (currentRange === "MC") {
      availableNotes = seriesClef === "bass" ? ["f", "g", "a", "b", "c"] : ["c", "d", "e", "f", "g"];
    } else {
      availableNotes = rangeNotes[currentRange];
    }
    const randomIndex = Math.floor(Math.random() * availableNotes.length);
    const chosenNote = availableNotes[randomIndex];
    let noteOctave;
    if (currentRange === "MC") {
      noteOctave = seriesClef === "bass" ? (chosenNote === "c" ? 4 : 3) : 4;
    } else {
      noteOctave = seriesClef === "bass" ? 3 : 4;
    }
    return { note: chosenNote, octave: noteOctave, clef: seriesClef, color: "black" };
  };

  for (let i = 0; i < seriesLength; i++) {
    currentSeriesSingle.push(chooseNote());
  }
  // Zeichne die Notation
  drawSeries(currentSeriesSingle, currentRange, seriesLength);
  return currentSeriesSingle;
}

export function isNoteCorrect(midiInfo, currentSeriesSingle, seriesCounter) {
  const currentNote = currentSeriesSingle[seriesCounter];
  return midiInfo.note === currentNote.note && midiInfo.octave === currentNote.octave;
}

export function removeFromErrorNotes(note, errorNotes) {
  return errorNotes.filter(n => n !== note);
}

export function startPauseCountdown(params) {
  // Implementiere hier deine Logik zur Pause (Pausen-Dauer, Anzeige, etc.)
  console.log("Pause gestartet", params);
}

export function recordScore(params) {
  // Implementiere hier das Score-Recording
  console.log("Score aufgezeichnet", params);
}

export function resetGame(params) {
  // Setze Spielvariablen zurück und starte eine neue Serie
  console.log("Spiel zurückgesetzt", params);
}
