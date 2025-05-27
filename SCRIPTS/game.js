// Game Module
console.log('🎮 Loading game.js...');

export const gameModule = {
    // Game State
    score: 0,
    streak: 0,
    hearts: 4,
    isGameActive: false,
    currentNote: null,
    totalAttempts: 0,
    correctAnswers: 0,
    correctNoteCount: 0,
    responseTimes: [],
    errorNotes: [],
    lastNoteTimestamp: 0,
    appStartTime: 0,
    sessionCounter: 5,
    sessionCount: 0,
    unlimitedLives: true,
    nextMotivationThreshold: 0,
    currentSeriesSingle: [],
    seriesCounter: 0,
    seriesLength: 5,
    
    // Game Settings
    maxHearts: 3,
    streakThreshold: 5,
    selectedMode: "left",
    randomMode: false,
    currentRange: "C",
    currentHandIndex: 0,
    currentRangeIndex: 0,
    handOptions: [
        { mode: "left", symbol: "✋" },
        { mode: "right", symbol: "✋", flip: true }
    ],
    rangeArray: ["C", "D", "F", "G", "MC"],
    alternatingRanges: ["C", "D", "MC"],
    rangeNotes: {
        "C": ["c", "d", "e", "f", "g"],
        "D": ["d", "e", "f#", "g", "a"],
        "F": ["f", "g", "a", "bb", "c"],
        "G": ["g", "a", "b", "c", "d"],
        "MC": ["c", "d", "e", "f", "g"]
    },
    customModeSettings: null,
    wizardMode: true,
    kidsMode: false,
    articulationMode: null,
    activeNotes: {},
    notesInCurrentPhase: 0,
    
    // Modulreferenzen
    audio: null,
    ui: null,
    
    init(audioModule, uiModule) {
        console.log('🎲 Initializing game module...');
        this.audio = audioModule;
        this.ui = uiModule;
        
        this.audio.onNoteOn = this.handleNoteOn.bind(this);
        this.audio.onNoteOffStaccato = this.handleNoteOffStaccato.bind(this);

        this.appStartTime = Date.now();
        this.lastNoteTimestamp = Date.now();
        this.nextMotivationThreshold = this.getRandomThreshold();
        this.hearts = this.unlimitedLives ? Infinity : 4;
        console.log('✅ Game module initialized');
    },

    getRandomThreshold() {
        return Math.floor(Math.random() * 4) + 2;
    },

    startGame() {
        console.log('🎮 Starting new game...');
        this.resetGame();
        this.isGameActive = true;
        this.generateNewNote();
    },

    resetGame() {
        console.log('🔄 Resetting game state (full)...');
        this.score = 0;
        this.streak = 0;
        this.totalAttempts = 0;
        this.correctAnswers = 0;
        this.correctNoteCount = 0;
        this.responseTimes = [];
        this.errorNotes = [];
        this.seriesCounter = 0;
        this.sessionCounter = Number(localStorage.getItem("sessionCounter")) || 5;
        this.hearts = this.unlimitedLives ? Infinity : (Number(localStorage.getItem("appStatistics")) ? JSON.parse(localStorage.getItem("appStatistics")).hearts : 4) || 4;
        this.appStartTime = Date.now();
        this.lastNoteTimestamp = Date.now();
        this.activeNotes = {};
        this.nextMotivationThreshold = this.getRandomThreshold();
        this.isGameActive = false;
        this.currentNote = null;
        this.ui.updateDisplay(this);
        this.ui.updateTimer(this.sessionCounter, this.responseTimes, this.totalAttempts, this.correctAnswers);
        console.log("✅ Game reset complete.");
    },

    handleNoteOn(midiNoteNumber, velocity) {
        if (window.app.sessionPaused) return;
        if (this.articulationMode === "staccato") {
            if (!this.activeNotes[midiNoteNumber]) {
                this.activeNotes[midiNoteNumber] = { timestamp: Date.now(), velocity: velocity };
            }
            return;
        }

        if (this.seriesCounter >= this.currentSeriesSingle.length) return;

        const currentTime = Date.now();
        const responseTime = currentTime - this.lastNoteTimestamp;
        this.responseTimes.push(responseTime);
        this.lastNoteTimestamp = currentTime;
        this.totalAttempts++;

        const playedNoteInfo = this.convertMIDIToNoteObject(midiNoteNumber);
        const expectedNoteObject = this.currentSeriesSingle[this.seriesCounter];

        if (this.isNoteCorrect(playedNoteInfo, expectedNoteObject)) {
            console.log('✅ Correct note!');
            this.currentSeriesSingle[this.seriesCounter].color = "green";
            if (this.audio.isMetronomeActive) {
                const diff = Math.abs(currentTime - this.audio.lastTickTime);
                if (diff > this.audio.metronomeTolerance) {
                    this.currentSeriesSingle[this.seriesCounter].color = "orange";
                    this.ui.showMotivation(diff < this.audio.metronomeIntervalId / 2 ? "Zu schnell!" : "Zu langsam!");
                } else {
                    this.ui.showMotivation("Super! Weiter so!");
                }
            } else {
                 this.ui.showMotivation("Super! Weiter so!");
            }
            
            this.correctAnswers++;
            this.correctNoteCount++;
            this.removeFromErrorNotes(expectedNoteObject);
            this.ui.addCircle("positive"); 
            this.sessionCounter--;
            
        } else {
            console.log('❌ Wrong note!');
            this.currentSeriesSingle[this.seriesCounter].color = "red";
            this.errorNotes.push(expectedNoteObject);
            this.ui.addCircle("negative");
            if (!this.unlimitedLives) {
            this.hearts--;
                this.ui.updateHeartsDisplay(this.hearts);
            if (this.hearts <= 0) {
                    window.app.endGame();
                    return;
                }
            }
            if (this.wizardMode) {
                const correctNoteName = (expectedNoteObject.note.toUpperCase() === "B" ? "H" : expectedNoteObject.note.toUpperCase());
                console.log(`🧙 Wizard: Played ${playedNoteInfo.note}, expected ${correctNoteName}`);
            }
        }
        this.ui.displayPlayedNote(playedNoteInfo, this.currentSeriesSingle[this.seriesCounter].color, expectedNoteObject, this.kidsMode);

        if (this.sessionCounter <= 0 && !window.app.sessionPaused) {
            this.sessionCounter = 0;
            this.ui.updateTimer(this.sessionCounter, this.responseTimes, this.totalAttempts, this.correctAnswers);
            window.app.startLocalTimer();
            return;
        }

        this.seriesCounter++;
        if (this.seriesCounter >= this.seriesLength) {
            this.generateSeries();
        } else {
            this.ui.drawSeries(this.currentSeriesSingle, this.seriesCounter, this.kidsMode, this.customModeSettings);
        }
        this.ui.updateTimer(this.sessionCounter, this.responseTimes, this.totalAttempts, this.correctAnswers);
        this.ui.updateHeartsDisplay(this.hearts, this.unlimitedLives);

        if (this.correctNoteCount >= this.nextMotivationThreshold) {
            this.nextMotivationThreshold += this.getRandomThreshold();
        }
        window.app.ui.resetInactivityTimer();
    },

    handleNoteOffStaccato(midiNoteNumber) {
        if (!window.app.sessionPaused && this.articulationMode === "staccato") {
            if (this.activeNotes[midiNoteNumber]) {
                const noteData = this.activeNotes[midiNoteNumber];
                this.checkArticulation(noteData.timestamp, Date.now(), noteData.velocity);
                delete this.activeNotes[midiNoteNumber];
            }
        }
    },

    checkArticulation(startTime, endTime, velocity) {
        let correct = false;
        let message = "";
        if (this.articulationMode === "staccato") {
            correct = (endTime - startTime) < 350 && velocity > 30;
            message = correct ? "Richtig! (Staccato)" : "Zu lang! Kürzer spielen.";
        } else if (this.articulationMode === "legato") {
            correct = (endTime - startTime) > 500 && velocity > 30;
            message = correct ? "Richtig! (Legato)" : "Zu kurz! Länger halten.";
        }
        this.ui.updateArticulationFeedback(message, correct);
    },

    convertMIDIToNoteObject(midiNoteNumber) {
        const noteNames = ['c','c#','d','d#','e','f','f#','g','g#','a','a#','b'];
        const octave = Math.floor(midiNoteNumber / 12) - 1;
        let rawNote = noteNames[midiNoteNumber % 12];
        if (this.currentRange === "G" && rawNote === "f") rawNote = "f#";
        if (this.currentRange === "F" && rawNote === "a#") rawNote = "bb";
        return { note: rawNote, octave: octave, clef: this.seriesClefForNote(rawNote, octave) }; 
    },

    seriesClefForNote(noteName, octave) {
        if (this.customModeSettings && this.customModeSettings.clef) return this.customModeSettings.clef;
        return (this.selectedMode === "left") ? "bass" : "treble";
    },

    isNoteCorrect(playedNoteObj, expectedNoteObj) {
        if (!expectedNoteObj) return false;
        const normalize = n => n.replace("♭", "b").replace("♯", "#").toLowerCase();
        const played = normalize(playedNoteObj.note);
        const expected = normalize(expectedNoteObj.note);
        return played === expected && playedNoteObj.octave === expectedNoteObj.octave;
    },

    removeFromErrorNotes(noteObj) {
        this.errorNotes = this.errorNotes.filter(n => 
            !(n.note === noteObj.note && n.octave === noteObj.octave && n.clef === noteObj.clef)
        );
    },

    generateSeries() {
        console.log("🎶 Generating new series...");
        this.seriesCounter = 0;
        this.correctNoteCount = 0;
        this.nextMotivationThreshold = this.getRandomThreshold();
        this.ui.clearNoteNameDisplay();

        let seriesClef, chooseNoteFn;

        if (this.customModeSettings && this.customModeSettings.selectedNotes && this.customModeSettings.selectedNotes.length > 0 && this.customModeSettings.clef) {
            seriesClef = this.customModeSettings.clef;
            this.currentRange = this.customModeSettings.range;
            const customNotes = this.customModeSettings.selectedNotes;
            chooseNoteFn = () => {
                const randomIndex = Math.floor(Math.random() * customNotes.length);
                const chosenNoteRaw = customNotes[randomIndex];
                let baseNote = chosenNoteRaw.replace(/'+/g, "").toLowerCase();
                let apostrophes = (chosenNoteRaw.match(/'/g) || []).length;
                let noteOctave = (seriesClef === "bass") ? 2 : 4; 
                noteOctave += apostrophes;
                return { note: baseNote, octave: noteOctave, clef: seriesClef, color: "black", accidental: undefined };
            };
        } else {
            if (this.randomMode) {
                seriesClef = Math.random() < 0.5 ? "bass" : "treble";
                this.notesInCurrentPhase += this.seriesLength;
                if (this.notesInCurrentPhase >= 20 && this.alternatingRanges.length > 0) {
                    let oldRange = this.currentRange;
                    this.currentRange = this.alternatingRanges[Math.floor(Math.random() * this.alternatingRanges.length)];
                    if (oldRange !== this.currentRange) {
                        this.audio.playGongSound();
                        this.ui.updateClefTitle(this.currentRange, true);
                    }
                    this.notesInCurrentPhase = 0;
                } else {
                    this.ui.updateClefTitle(this.currentRange, false);
                }
            } else {
                seriesClef = (this.selectedMode === "left") ? "bass" : "treble";
                this.ui.updateClefTitle(this.currentRange, false);
            }

            chooseNoteFn = () => {
                if (this.errorNotes.length > 0 && Math.random() < 0.6) {
                    const idx = this.errorNotes.findIndex(note => note.clef === seriesClef);
                    if (idx !== -1) return this.errorNotes.splice(idx, 1)[0];
                }
                let notesForRange = this.rangeNotes[this.currentRange];
                if (this.currentRange === "MC") {
                    notesForRange = seriesClef === "bass" ? ["f", "g", "a", "b", "c"] : ["c", "d", "e", "f", "g"];
                }
                const randomIndex = Math.floor(Math.random() * notesForRange.length);
                const chosenNote = notesForRange[randomIndex];
                let noteOctave = seriesClef === "bass" ? 3 : 4;
                if (this.currentRange === "F" && seriesClef === "treble" && chosenNote.toLowerCase() === "c") {
                    noteOctave = 5;
                }
                let accidental = undefined;
                if (this.currentRange === "F" && chosenNote.toLowerCase() === "bb") accidental = "b";
                if (this.currentRange === "G" && chosenNote.toLowerCase() === "f#") accidental = "#";

                return { note: chosenNote, octave: noteOctave, clef: seriesClef, color: "black", accidental: accidental };
            };
        }

        this.currentSeriesSingle = [];
        for (let i = 0; i < this.seriesLength; i++) {
            this.currentSeriesSingle.push(chooseNoteFn());
        }
        this.ui.drawSeries(this.currentSeriesSingle, this.seriesCounter, this.kidsMode, this.customModeSettings);
    },

    toggleRandomMode() {
        this.randomMode = !this.randomMode;
        this.customModeSettings = null;
        this.generateSeries();
        this.ui.updateToggleState('randomToggle', this.randomMode);
    },

    toggleHandMode() {
        if (this.randomMode) return;
        this.currentHandIndex = (this.currentHandIndex + 1) % this.handOptions.length;
        this.selectedMode = this.handOptions[this.currentHandIndex].mode;
        this.customModeSettings = null;
        this.generateSeries();
        this.ui.updateHandToggle(this.handOptions[this.currentHandIndex]);
    },
    
    toggleWizardMode() {
        this.wizardMode = !this.wizardMode;
        this.ui.updateToggleState('wizardToggle', this.wizardMode);
    },

    toggleKidsMode() {
        this.kidsMode = !this.kidsMode;
        this.ui.updateToggleState('kidsModeToggle', this.kidsMode);
        this.ui.drawSeries(this.currentSeriesSingle, this.seriesCounter, this.kidsMode, this.customModeSettings);
    },

    setArticulationMode(mode) {
        this.articulationMode = mode;
        this.ui.updateArticulationToggle(mode);
        if (mode) {
            this.ui.hideNotation();
            this.ui.updateClefTitle(mode === "staccato" ? "🥁 Staccato" : "🎻 Legato", false);
        } else {
            this.ui.showNotation();
            this.ui.updateClefTitle(this.currentRange, false);
        }
    },

    cycleRange() {
        this.customModeSettings = null;
        this.currentRangeIndex = (this.currentRangeIndex + 1) % this.rangeArray.length;
        this.currentRange = this.rangeArray[this.currentRangeIndex];
        this.generateSeries();
        this.ui.updateHeartsDisplay(this.hearts, this.unlimitedLives);
    },

    autoSelectMode() {
        let highScores = JSON.parse(localStorage.getItem("highScores") || "[]");
        const leftScores = highScores.filter(score => score.mode === "left");
        const rightScores = highScores.filter(score => score.mode === "right");
        const bestLeft = leftScores.length ? Math.max(...leftScores.map(s => s.accuracy)) : 0;
        const bestRight = rightScores.length ? Math.max(...rightScores.map(s => s.accuracy)) : 0;
        
        this.selectedMode = (bestLeft <= bestRight) ? "left" : "right"; 
        this.currentHandIndex = this.handOptions.findIndex(h => h.mode === this.selectedMode);
        if (this.currentHandIndex === -1) this.currentHandIndex = 0;
        this.selectedMode = this.handOptions[this.currentHandIndex].mode;
        
        this.ui.updateHandToggle(this.handOptions[this.currentHandIndex]);
    },

    saveStatistics() {
        const stats = {
            totalAttempts: this.totalAttempts,
            correctAnswers: this.correctAnswers,
            correctNoteCount: this.correctNoteCount,
            responseTimes: this.responseTimes,
            sessionCount: this.sessionCount,
            hearts: this.hearts,
            errorNotes: this.errorNotes,
            appStartTime: this.appStartTime
        };
        localStorage.setItem("appStatistics", JSON.stringify(stats));
        localStorage.setItem("sessionCounter", this.sessionCounter.toString());
        console.log("💾 Statistics saved.");
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.gameCenter) {
            window.webkit.messageHandlers.gameCenter.postMessage({
                type: "highscore",
                value: {
                    accuracy: Math.round((this.correctAnswers / this.totalAttempts) * 100) || 0,
                    duration: Math.floor((Date.now() - this.appStartTime) / 1000),
                    mode: this.randomMode ? "random" : this.selectedMode
                }
            });
        }
    },

    loadStatistics() {
        const statsStr = localStorage.getItem("appStatistics");
        if (statsStr) {
            const stats = JSON.parse(statsStr);
            this.totalAttempts = stats.totalAttempts || 0;
            this.correctAnswers = stats.correctAnswers || 0;
            this.correctNoteCount = stats.correctNoteCount || 0;
            this.responseTimes = stats.responseTimes || [];
            this.sessionCount = stats.sessionCount || 0;
            this.hearts = stats.hearts === Infinity || typeof stats.hearts !== 'number' ? (this.unlimitedLives ? Infinity : 4) : stats.hearts;
            this.errorNotes = stats.errorNotes || [];
            this.appStartTime = stats.appStartTime || Date.now();
            console.log("📊 Statistics loaded.");
        } else {
            this.appStartTime = Date.now();
        }
        this.sessionCounter = Number(localStorage.getItem("sessionCounter")) || 5;
        this.ui.updateHeartsDisplay(this.hearts, this.unlimitedLives);
    },

    recordScore() {
        if (this.totalAttempts <= 0) return;
        const durationMs = Date.now() - this.appStartTime;
        const secondsTotal = Math.floor(durationMs / 1000);
        const accuracy = Math.round((this.correctAnswers / this.totalAttempts) * 100) || 0;
        const now = new Date();
        const dateStr = `${now.getDate()}.${now.getMonth()+1}`;
        const scoreObj = { 
            date: dateStr, 
            accuracy: accuracy, 
            duration: `${Math.floor(secondsTotal/60)}:${String(secondsTotal%60).padStart(2,'0')}`,
            seconds: secondsTotal, 
            mode: this.randomMode ? "random" : this.selectedMode 
        };
        let highScores = JSON.parse(localStorage.getItem("highScores") || "[]");
        highScores.push(scoreObj);
        highScores.sort((a, b) => (b.accuracy !== a.accuracy ? b.accuracy - a.accuracy : a.seconds - b.seconds));
        highScores = highScores.slice(0, 10);
        localStorage.setItem("highScores", JSON.stringify(highScores));
        console.log("🏆 Score recorded.");
        window.app.scoreRecorded = true;
    },

    getHighScores() {
        return JSON.parse(localStorage.getItem("highScores") || "[]");
    },

    logSessionStart() {
        const sessionTimes = JSON.parse(localStorage.getItem("sessionTimes") || "[]");
        sessionTimes.push(new Date().toISOString());
        localStorage.setItem("sessionTimes", JSON.stringify(sessionTimes));
    },

    calculateAdaptiveBreakTime() {
        let avgResponse = this.responseTimes.length > 0
            ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
            : 1000;
        let hitRate = this.totalAttempts > 0 ? (this.correctAnswers / this.totalAttempts) : 1;
        return avgResponse * (1 + (1 - hitRate));
    }
}; 