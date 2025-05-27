// UI Module
console.log('🎨 Loading ui.js...');

export const uiModule = {
    // UI Elements
    elements: {
        score: null,
        streak: null,
        hearts: null,
        noteDisplay: null,
        gameOver: null,
        motivation: null,
        notation: null,
        settingsPanel: null,
        clefTitle: null,
        mainContent: null
    },

    init() {
        console.log('🖼️ Initializing UI module...');
        this.cacheElements();
        this.setupEventListeners();
        this.setupInitialUI();
        this.showMainContent();
    },

    cacheElements() {
        console.log('🔍 Caching UI elements...');
        
        // Score and Game Elements
        this.elements.score = document.getElementById('scoreboardOverlay');
        this.elements.streak = document.getElementById('streakDisplay');
        this.elements.hearts = document.getElementById('heartsContainer');
        this.elements.noteDisplay = document.getElementById('noteNameDisplay');
        this.elements.gameOver = document.getElementById('gameOverOverlay');
        this.elements.motivation = document.getElementById('motivationOverlay');
        
        // Music Elements
        this.elements.notation = document.getElementById('notation');
        this.elements.settingsPanel = document.getElementById('settingsPanel');
        this.elements.clefTitle = document.getElementById('clefTitle');
        this.elements.mainContent = document.getElementById('mainContent');

        // Log which elements were found
        Object.entries(this.elements).forEach(([key, element]) => {
            console.log(`  - ${key}: ${element ? '✅ Found' : '❌ Not found'}`);
        });
    },

    setupInitialUI() {
        console.log('🎨 Setting up initial UI state...');
        
        // Setup notation display
        if (this.elements.notation) {
            console.log('  - Setting up notation display...');
            this.setupNotationDisplay();
            this.elements.notation.style.display = 'block';
        }

        // Setup settings panel
        if (this.elements.settingsPanel) {
            console.log('  - Setting up settings panel...');
            this.setupSettingsPanel();
            this.elements.settingsPanel.style.display = 'flex';
        }

        // Initialize hearts display
        if (this.elements.hearts) {
            console.log('  - Setting up hearts display...');
            this.updateHearts(3);
        }

        // Setup clef title
        if (this.elements.clefTitle) {
            this.elements.clefTitle.textContent = 'C-Lage';
        }
    },

    showMainContent() {
        console.log('🎬 Showing main content...');
        if (this.elements.mainContent) {
            this.elements.mainContent.style.display = 'block';
            // Kurze Verzögerung für die Fade-Animation
            setTimeout(() => {
                this.elements.mainContent.style.opacity = '1';
            }, 100);
        }
    },

    setupNotationDisplay() {
        try {
            const VF = Vex.Flow;
            const div = this.elements.notation;
            const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
            renderer.resize(300, 150);
            const context = renderer.getContext();
            context.setFont("Arial", 10);

            // Erstelle ein neues Notensystem
            const stave = new VF.Stave(10, 0, 280);
            stave.addClef("treble");
            stave.setContext(context).draw();

            console.log('✅ Notation system initialized');
        } catch (error) {
            console.error('❌ Failed to initialize notation system:', error);
        }
    },

    setupSettingsPanel() {
        if (this.elements.settingsPanel) {
            this.elements.settingsPanel.innerHTML = `
                <span onclick="app.toggleMetronome()" title="Metronom">🎵</span>
                <span onclick="app.toggleDarkMode()" title="Dark Mode">🌙</span>
                <span onclick="app.resetGame()" title="Neu starten">🔄</span>
            `;
            console.log('✅ Settings panel initialized');
        }
    },

    setupEventListeners() {
        // Event Listener für UI-Interaktionen
        if (this.elements.clefTitle) {
            this.elements.clefTitle.addEventListener('click', () => {
                // Implementiere Lagenwechsel
                console.log('🎼 Clef change requested');
            });
        }
    },

    updateDisplay(gameState) {
        console.log('🔄 Updating display...', gameState);
        this.updateScore(gameState.score);
        this.updateStreak(gameState.streak);
        this.updateHearts(gameState.hearts);
    },

    updateScore(score) {
        if (this.elements.score) {
            this.elements.score.textContent = `Score: ${score}`;
        }
    },

    updateStreak(streak) {
        if (this.elements.streak) {
            this.elements.streak.textContent = `Streak: ${streak}`;
        }
    },

    updateHearts(hearts) {
        if (this.elements.hearts) {
            this.elements.hearts.innerHTML = '❤️'.repeat(hearts);
        }
    },

    displayNote(midiNote) {
        console.log('🎵 Displaying note:', midiNote);
        if (this.elements.noteDisplay) {
            const noteName = this.getMIDINoteName(midiNote);
            this.elements.noteDisplay.textContent = noteName;
            console.log('  - Displayed note:', noteName);
        }
    },

    getMIDINoteName(midiNote) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteName = noteNames[midiNote % 12];
        const octave = Math.floor(midiNote / 12) - 1;
        return `${noteName}${octave}`;
    },

    showGameOver(finalScore) {
        console.log('🏁 Showing game over screen');
        if (this.elements.gameOver) {
            this.elements.gameOver.innerHTML = `
                <div class="gameOverContent">
                    <h2>Game Over!</h2>
                    <p>Final Score: ${finalScore}</p>
                    <button onclick="location.reload()">Play Again</button>
                </div>
            `;
            this.elements.gameOver.style.display = 'flex';
        }
    },

    showMotivation(message) {
        console.log('💪 Showing motivation:', message);
        if (this.elements.motivation) {
            this.elements.motivation.textContent = message;
            this.elements.motivation.style.display = 'block';
            setTimeout(() => {
                this.elements.motivation.style.display = 'none';
            }, 2000);
        }
    }
}; 