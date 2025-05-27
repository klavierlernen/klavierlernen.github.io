// Main Application
console.log('🎵 Loading main.js...');

import { audioModule } from 'https://jp0024.github.io/piano.github.io/SCRIPTS/audio.js';
import { gameModule } from 'https://jp0024.github.io/piano.github.io/SCRIPTS/game.js';
import { uiModule } from 'https://jp0024.github.io/piano.github.io/SCRIPTS/ui.js';

console.log('✅ All modules imported successfully');

// Application State
const app = {
    isInitialized: false,
    
    async init() {
        console.log('🎮 Initializing application...');
        try {
            console.log('🎹 Initializing MIDI...');
            await audioModule.initMIDIAccess();
            
            console.log('🖥️ Initializing UI...');
            uiModule.init(); // UI-Elemente cachen und EventListener einrichten
            
            console.log('🎲 Initializing game...');
            gameModule.init(audioModule, uiModule);
            
            console.log('👋 Setting up welcome screen...');
            this.setupWelcomeScreen(); // Dies startet den Prozess, der zum Spiel führt
            
            this.isInitialized = true;
            console.log('✨ Application initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
        }
    },

    setupWelcomeScreen() {
        const welcomeOverlay = document.getElementById('welcomeOverlay');
        if (welcomeOverlay) {
            console.log('⏳ Welcome screen visible, game will start in 2 seconds...');
            setTimeout(() => {
                if (welcomeOverlay) welcomeOverlay.style.display = 'none';
                console.log('🎬 Showing main content and starting game...');
                uiModule.showMainContent(); // Jetzt den Hauptinhalt explizit anzeigen
                this.startGame();
            }, 2000);
        } else {
            console.error('❌ Welcome overlay element not found! Game may not start correctly.');
            // Fallback: Direkt Hauptinhalt anzeigen und Spiel starten, wenn Welcome-Screen fehlt
            uiModule.showMainContent(); 
            this.startGame();
        }
    },

    startGame() {
        console.log('🎮 Game starting...');
        gameModule.startGame();
    },

    pauseGame() {
        console.log('⏸️ Game paused');
        audioModule.stopMetronome();
    },

    resumeGame() {
        console.log('▶️ Game resumed');
    },

    endGame() {
        console.log('🏁 Game ended');
        audioModule.stopMetronome();
        gameModule.endGame();
    },

    // Globale Funktionen für Buttons
    toggleMetronome() {
        if (audioModule.isMetronomeActive) {
            audioModule.stopMetronome();
        } else {
            audioModule.startMetronome();
        }
    },

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        console.log('🌙 Dark mode toggled');
    },

    resetGame() {
        console.log('🔄 Resetting game via button...');
        gameModule.resetGame(); 
        uiModule.showMainContent(); // Sicherstellen, dass UI sichtbar ist
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
}); 