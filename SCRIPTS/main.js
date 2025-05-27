// Main Application
console.log('🎵 Loading main.js...');

import { audioModule, initMIDIAccess as initAudioMIDIAccess, handleMIDIMessage as audioHandleMIDIMessage, startMetronome as audioStartMetronome, stopMetronome as audioStopMetronome } from 'https://jp0024.github.io/piano.github.io/SCRIPTS/audio.js';
import { gameModule, generateSeries as gameGenerateSeries, resetGame as gameResetGame, isNoteCorrect as gameIsNoteCorrect, removeFromErrorNotes as gameRemoveFromErrorNotes, recordScore as gameRecordScore, autoSelectMode as gameAutoSelectMode } from 'https://jp0024.github.io/piano.github.io/SCRIPTS/game.js';
import { uiModule, drawSeries as uiDrawSeries, updateHeartsDisplay as uiUpdateHeartsDisplay, updateTimer as uiUpdateTimer, updatePauseTiles as uiUpdatePauseTiles, updatePauseProgress as uiUpdatePauseProgress, showMotivation as uiShowMotivation, clearMotivation as uiClearMotivation, toggleDarkMode as uiToggleDarkMode, setupFadeOnHover as uiSetupFadeOnHover, animateCircles as uiAnimateCircles, spawnIntroBlobs as uiSpawnIntroBlobs, resetInactivityTimer as uiResetInactivityTimer, checkOrientation as uiCheckOrientation, showTrophyTransitionScreen as uiShowTrophyTransitionScreen, updateScoreboard as uiUpdateScoreboard, toggleScoreboard as uiToggleScoreboard, proceedToMainScreen as uiProceedToMainScreen, blinkGreenBackground as uiBlinkGreenBackground, saveButtonEffect as uiSaveButtonEffect } from 'https://jp0024.github.io/piano.github.io/SCRIPTS/ui.js';

console.log('✅ All modules imported successfully');

// Application State
const app = {
    // Flags & State (Beispiele, werden von Modulen verwaltet)
    isInitialized: false,
    sessionPaused: false,
    gameOver: false,
    scoreRecorded: false,
    randomMode: false, // Wird von gameModule beeinflusst
    wizardMode: true, // Wird von gameModule beeinflusst
    kidsMode: false, // Wird von gameModule beeinflusst
    articulationMode: null, // Wird von gameModule beeinflusst
    blobsEnabled: true, // Wird von uiModule beeinflusst
    
    // Verweise auf Module, damit app.module.funktion() möglich ist
    audio: audioModule,
    game: gameModule,
    ui: uiModule,

    async init() {
        console.log('🎮 Initializing application...');
        try {
            this.ui.cacheElements(); // DOM-Elemente früh cachen

            console.log('🎹 Initializing MIDI...');
            await this.audio.initMIDIAccess();
            
            console.log('🎨 Initializing UI components...');
            this.ui.init(); // UI Event Listener und Basis-Setup
            this.ui.animateCircles();
            this.ui.resetInactivityTimer();
            this.ui.checkOrientation();
            window.addEventListener("resize", this.ui.checkOrientation);

            console.log('🎲 Initializing game logic...');
            this.game.init(this.audio, this.ui); // Game Modul braucht ggf. Referenzen
            
            this.setupGlobalEventHandlers();
            this.loadPersistentData();

            const storedName = localStorage.getItem("userName");
            if (storedName !== null) {
                this.ui.displayWelcomeMessage(storedName, true, this.proceedToMainScreen.bind(this));
            } else {
                this.ui.promptForUserName(this.proceedToMainScreen.bind(this));
            }
            
            this.isInitialized = true;
            console.log('✨ Application initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
        }
    },

    proceedToMainScreen() {
        console.log("🚀 Proceeding to main screen");
        this.ui.proceedToMainScreen(); // UI-Modul kümmert sich um die Anzeige
        this.game.autoSelectMode();
        this.game.generateSeries(); 
        this.ui.updateHeartsDisplay();
        
        // Tutorial, falls nicht abgeschlossen
        if (!localStorage.getItem('tutorialCompleted')) {
            this.startTutorialSequence();
        }
    },

    loadPersistentData() {
        console.log("💾 Loading persistent data...");
        this.game.loadStatistics();
        this.game.sessionCounter = Number(localStorage.getItem("sessionCounter")) || 5;
        // Weitere Daten laden...
    },

    setupGlobalEventHandlers() {
        console.log("🎧 Setting up global event handlers...");
        document.addEventListener("keydown", (event) => {
            if (event.code === "Space" && !this.sessionPaused) { 
                // Finde eine passende Note zum Simulieren, z.B. C4 (MIDI 60)
                this.audio.handleMIDIMessage({ data: [144, 60, 127] }); 
            }
        });
        window.addEventListener("beforeunload", this.game.saveStatistics);

        // TODO: Weitere globale Listener wie 'scroll' oder 'orientationchange' hier zentralisieren,
        // und dann an die jeweiligen Module delegieren, falls nötig.
        window.addEventListener('scroll', function(e) {
            e.preventDefault();
            window.scrollTo(0, 0);
        }, { passive: false });
    },

    // --- Wrapper für direkte HTML Event Handler oder globale Aufrufe ---
    handleMIDIMessageWrapper(status, data1, data2) {
        if (this.sessionPaused && !(this.articulationMode === "staccato" && ((status & 0xf0) === 0x80 || ((status & 0xf0) === 0x90 && data2 === 0)))) return;
        // Animationen für Menüs etc.
        this.ui.handleKeyPressAnimation(); 
        this.audio.handleMIDIMessage({data: [status, data1, data2]});
    },

    startPauseCountdown() {
        console.log("⏱️ Starting pause countdown...");
        this.sessionPaused = true;
        this.audio.stopMetronome();
        this.game.sessionCount++; // Gehört eher ins gameModule
        // Die Logik für adaptiveBreakTime etc. sollte ins gameModule oder uiModule
        this.ui.showPauseScreen(this.game.calculateAdaptiveBreakTime(), () => this.endPause());
        this.game.logSessionStart();
    },

    endPause() {
        console.log("▶️ Ending pause...");
        this.sessionPaused = false;
        this.ui.hidePauseScreen();
        this.audio.playGongSound(); // Gong gehört zum audioModule
        this.game.resetGame(); // Oder spezifischere Logik für "nach Pause"
    },
    
    startLocalTimer() { // Gehört eher zum ui oder game module
        this.ui.startLocalTimer(() => this.endLocalTimer());
    },

    endLocalTimer() {
        this.ui.endLocalTimer();
        this.audio.playGongSound();
        this.game.resetGame();
    },

    endGame() {
        console.log('🏁 Game ended by app');
        this.gameOver = true;
        this.ui.showGameOverScreen(this.game.score); // Score vom gameModule holen
        if (!this.scoreRecorded) this.game.recordScore();
        setTimeout(() => this.game.resetGame(), 5000);
    },

    resetGame() {
        console.log("🔄 Resetting game via app...");
        this.gameOver = false;
        this.scoreRecorded = false;
        this.sessionPaused = false;
        this.game.resetGame(); // Ruft resetGame im gameModule auf
        this.ui.hidePauseScreen();
        this.ui.hideGameOverScreen();
        this.ui.updateHeartsDisplay(); // UI Aktualisierung
        this.game.generateSeries(); // Neue Noten generieren
    },

    toggleMetronome() {
        this.audio.toggleMetronome(); 
    },

    toggleDarkMode() {
        this.ui.toggleDarkMode();
    },

    cycleRange() {
        console.log("🔄 Cycling range...");
        this.game.cycleRange(); // Logik in gameModule
        // uiModule.updateClefTitle(this.game.currentRange); // UI Aktualisierung
        this.game.generateSeries();
        this.ui.updateHeartsDisplay();
    },

    toggleScoreboard() {
        this.ui.toggleScoreboard(this.game.getHighScores()); // Highscores von gameModule
    },
    
    startTutorialSequence() {
        this.ui.startTutorialSequence(() => {
            localStorage.setItem("tutorialCompleted", "true");
            // Ggf. UI-Elemente neu positionieren oder Spiel starten
        });
    },
    
    checkArticulation(startTime, endTime, velocity) {
        this.game.checkArticulation(startTime, endTime, velocity);
    },

    // --- Platzhalter für Funktionen, die Module bereitstellen ---
    // Diese werden normalerweise direkt über app.module.funktion() aufgerufen
    // Aber falls alte globale Aufrufe existieren, kann man hier temporär wrappen

    // Beispiel: ui.js könnte eine Funktion haben, die von hier getriggert wird
    // wenn es keinen direkten Button-Handler mehr gibt.
    updateSpecificUIComponent(data) {
        this.ui.updateComponent(data);
    }
};

// App global verfügbar machen für Inline-Event-Handler in HTML
window.app = app;

// Initialisierung starten, nachdem der DOM vollständig geladen ist
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM fully loaded. Starting application initialization...');
    app.init().catch(error => {
        console.error('❌ Initialization error caught by DOMContentLoaded:', error);
    });
}); 