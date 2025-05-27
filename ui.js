// UI Module
export const uiModule = {
    // UI Elements
    elements: {
        score: null,
        streak: null,
        hearts: null,
        noteDisplay: null,
        gameOver: null,
        motivation: null
    },

    init() {
        this.cacheElements();
        this.setupEventListeners();
    },

    cacheElements() {
        this.elements.score = document.getElementById('scoreboardOverlay');
        this.elements.streak = document.getElementById('streakDisplay');
        this.elements.hearts = document.getElementById('heartsContainer');
        this.elements.noteDisplay = document.getElementById('noteNameDisplay');
        this.elements.gameOver = document.getElementById('gameOverOverlay');
        this.elements.motivation = document.getElementById('motivationOverlay');
    },

    setupEventListeners() {
        // Event Listener für UI-Interaktionen
    },

    updateDisplay(gameState) {
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
        if (this.elements.noteDisplay) {
            const noteName = this.getMIDINoteName(midiNote);
            this.elements.noteDisplay.textContent = noteName;
        }
    },

    getMIDINoteName(midiNote) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteName = noteNames[midiNote % 12];
        const octave = Math.floor(midiNote / 12) - 1;
        return `${noteName}${octave}`;
    },

    showGameOver(finalScore) {
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
        if (this.elements.motivation) {
            this.elements.motivation.textContent = message;
            this.elements.motivation.style.display = 'block';
            setTimeout(() => {
                this.elements.motivation.style.display = 'none';
            }, 2000);
        }
    }
}; 