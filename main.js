// Main Application
import { audioModule } from 'https://jp0024.github.io/piano.github.io/audio.js';
import { gameModule } from 'https://jp0024.github.io/piano.github.io/game.js';
import { uiModule } from 'https://jp0024.github.io/piano.github.io/ui.js';

// Application State
const app = {
    isInitialized: false,
    
    // Initialize Application
    async init() {
        try {
            // Initialize all modules
            await audioModule.initMIDIAccess();
            uiModule.init();
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('Application initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
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
        gameModule.resetGame();
        uiModule.updateHeartsDisplay();
        uiModule.updateTimer();
    },

    pauseGame() {
        audioModule.stopMetronome();
        // Additional pause logic
    },

    resumeGame() {
        // Resume game logic
    },

    endGame() {
        audioModule.stopMetronome();
        gameModule.saveStatistics();
        // Additional end game logic
    }
};

// Initialize application when the script loads
app.init().catch(console.error); 