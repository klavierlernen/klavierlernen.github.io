// Main Application
console.log('🎵 Loading main.js...');

import { audioModule } from 'https://jp0024.github.io/piano.github.io/SCRIPTS/audio.js';
import { gameModule } from 'https://jp0024.github.io/piano.github.io/SCRIPTS/game.js';
import { uiModule } from 'https://jp0024.github.io/piano.github.io/SCRIPTS/ui.js';

console.log('✅ All modules imported successfully');

// Application State
const app = {
    isInitialized: false,
    
    // Initialize Application
    async init() {
        console.log('🎮 Initializing application...');
        try {
            // Initialize all modules
            console.log('🎹 Initializing MIDI...');
            await audioModule.initMIDIAccess();
            
            console.log('🖥️ Initializing UI...');
            uiModule.init();
            
            console.log('🎲 Initializing game...');
            gameModule.init(audioModule, uiModule);
            
            // Setup welcome screen
            console.log('👋 Setting up welcome screen...');
            this.setupWelcomeScreen();
            
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
                welcomeOverlay.style.display = 'none';
                console.log('🎬 Starting game...');
                this.startGame();
            }, 2000);
        } else {
            console.error('❌ Welcome overlay element not found!');
        }
    },

    // Event Listeners
    setupEventListeners() {
        // Document ready
        document.addEventListener('DOMContentLoaded', () => {
            uiModule.resizeCanvas();
        });

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                audioModule.stopMetronome();
            }
        });
    },

    // Game Control
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
    }
};

// Initialize application when the script loads
console.log('🚀 Starting application initialization...');
app.init().catch(error => {
    console.error('❌ Initialization error:', error);
}); 