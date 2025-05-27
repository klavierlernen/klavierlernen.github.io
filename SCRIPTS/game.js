// Game Module
export const gameModule = {
    // Game State
    score: 0,
    streak: 0,
    hearts: 3,
    isGameActive: false,
    currentNote: null,
    
    // Game Settings
    maxHearts: 3,
    streakThreshold: 5,
    
    init(audioModule, uiModule) {
        this.audio = audioModule;
        this.ui = uiModule;
        
        // MIDI Handlers überschreiben
        this.audio.onNoteOn = this.handleNoteOn.bind(this);
        this.audio.onNoteOff = this.handleNoteOff.bind(this);
    },

    startGame() {
        this.resetGame();
        this.isGameActive = true;
        this.generateNewNote();
    },

    resetGame() {
        this.score = 0;
        this.streak = 0;
        this.hearts = this.maxHearts;
        this.isGameActive = false;
        this.currentNote = null;
        this.ui.updateDisplay(this);
    },

    handleNoteOn(note, velocity) {
        if (!this.isGameActive || !this.currentNote) return;
        
        if (note === this.currentNote) {
            this.score += 10;
            this.streak++;
            if (this.streak >= this.streakThreshold) {
                this.ui.showMotivation("Großartig!");
            }
            this.generateNewNote();
        } else {
            this.hearts--;
            this.streak = 0;
            if (this.hearts <= 0) {
                this.endGame();
            }
        }
        
        this.ui.updateDisplay(this);
    },

    handleNoteOff(note) {
        // Optional: Implementiere Note-Off Logik
    },

    generateNewNote() {
        // Generiere eine zufällige Note (C4-C5)
        this.currentNote = Math.floor(Math.random() * 13) + 60; // MIDI notes 60-72
        this.ui.displayNote(this.currentNote);
    },

    endGame() {
        this.isGameActive = false;
        this.saveHighScore();
        this.ui.showGameOver(this.score);
    },

    saveHighScore() {
        const currentHighScore = localStorage.getItem('highScore') || 0;
        if (this.score > currentHighScore) {
            localStorage.setItem('highScore', this.score);
        }
    }
}; 