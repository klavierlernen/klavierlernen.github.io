// UI Module
console.log('🎨 Loading ui.js...');

// Globale VexFlow-Instanz, falls benötigt
const { Factory, StaveNote, Accidental, Beam, Formatter } = Vex.Flow;

export const uiModule = {
    // --- Gecachte DOM-Elemente ---
    scoreDisplay: null,
    heartsDisplay: null,
    notationElement: null,
    motivationDisplay: null,
    gameOverScreen: null,
    finalScoreDisplay: null,
    mainContent: null,
    welcomeOverlay: null,
    settingsPanel: null,
    timerDisplay: null,
    pauseTiles: null,
    pauseProgress: null,
    orientationWarning: null,
    backgroundBlobs: [],
    clefTitle: null,
    playedNoteDisplay: null,
    correctNoteDisplay: null,
    metronomeButton: null,
    darkModeToggle: null,
    randomToggle: null,
    handToggle: null,
    rangeButton: null, 
    wizardToggle: null,
    kidsModeToggle: null,
    staccatoButton: null,
    legatoButton: null,
    pauseScreen: null,
    pauseCountdown: null,
    userNameInput: null,
    welcomeMessage: null,
    scoreboardOverlay: null,
    scoreboardBody: null,
    infoButton: null,
    tutorialOverlay: null,
    tutorialSteps: [],
    currentTutorialStep: 0,

    // --- VexFlow spezifisch ---
    vf: null, // VexFlow Factory
    stave: null, 
    context: null,

    // --- UI Zustand ---
    inactivityTimer: null,
    vfInitialized: false,
    blobsEnabled: true, // Default, kann über Settings geändert werden
    initialBackgroundColor: "#f0f0f0", // Default oder aus CSS auslesen

    init() {
        console.log('🎨 Initializing UI module...');
        this.cacheElements();
        this.setupEventListeners();
        this.setupFadeOnHover();
        this.checkOrientation(); // Initial check
        
        // Lade Dark Mode Preferenz
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
            if(this.darkModeToggle) this.darkModeToggle.checked = true;
        }
        this.initialBackgroundColor = getComputedStyle(document.body).backgroundColor;
        console.log('✅ UI module initialized');
    },

    cacheElements() {
        console.log('🔍 Caching DOM elements...');
        this.scoreDisplay = document.getElementById('score');
        this.heartsDisplay = document.getElementById('hearts');
        this.notationElement = document.getElementById('notation');
        this.motivationDisplay = document.getElementById('motivation');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.finalScoreDisplay = document.getElementById('finalScore');
        this.mainContent = document.getElementById('mainContent');
        this.welcomeOverlay = document.getElementById('welcomeOverlay');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.timerDisplay = document.getElementById('timer');
        this.pauseTiles = document.getElementById('pauseTiles');
        this.pauseProgress = document.getElementById('pauseProgress');
        this.orientationWarning = document.getElementById('orientationWarning');
        this.backgroundBlobs = Array.from(document.querySelectorAll('.blob'));
        this.clefTitle = document.getElementById('clefTitle');
        this.playedNoteDisplay = document.getElementById('playedNoteDisplay');
        this.correctNoteDisplay = document.getElementById('correctNoteDisplay');
        this.metronomeButton = document.getElementById('metronomeButton');
        this.darkModeToggle = document.getElementById('darkModeToggle');
        this.randomToggle = document.getElementById('randomToggle');
        this.handToggle = document.getElementById('handToggle');
        this.rangeButton = document.getElementById('rangeButton');
        this.wizardToggle = document.getElementById('wizardToggle');
        this.kidsModeToggle = document.getElementById('kidsModeToggle');
        this.staccatoButton = document.getElementById('staccatoButton');
        this.legatoButton = document.getElementById('legatoButton');
        this.pauseScreen = document.getElementById('pauseScreen');
        this.pauseCountdown = document.getElementById('pauseCountdown');
        this.userNameInput = document.getElementById('userNameInput');
        this.welcomeMessage = document.getElementById('welcomeMessage');
        this.scoreboardOverlay = document.getElementById('scoreboardOverlay');
        this.scoreboardBody = document.getElementById('scoreboardBody');
        this.infoButton = document.getElementById('infoButton');
        this.tutorialOverlay = document.getElementById('tutorialOverlay');
        if (this.tutorialOverlay) {
            this.tutorialSteps = Array.from(this.tutorialOverlay.querySelectorAll('.tutorial-step'));
        }
    },

    setupEventListeners() {
        console.log('🎧 Setting up UI event listeners...');
        if (this.settingsPanel) {
            const settingsButton = document.getElementById('settingsButton');
            if (settingsButton) settingsButton.addEventListener('click', () => this.toggleSettingsPanel());
            
            // Event Listener für toggles im Settings Panel
            if (this.metronomeButton) this.metronomeButton.addEventListener('change', () => window.app.toggleMetronome(this.getBpmInput()));
            if (this.darkModeToggle) this.darkModeToggle.addEventListener('change', () => window.app.toggleDarkMode());
            if (this.randomToggle) this.randomToggle.addEventListener('change', () => window.app.game.toggleRandomMode());
            if (this.wizardToggle) this.wizardToggle.addEventListener('change', () => window.app.game.toggleWizardMode());
            if (this.kidsModeToggle) this.kidsModeToggle.addEventListener('change', () => window.app.game.toggleKidsMode());
            if (this.staccatoButton) this.staccatoButton.addEventListener('click', () => window.app.game.setArticulationMode('staccato'));
            if (this.legatoButton) this.legatoButton.addEventListener('click', () => window.app.game.setArticulationMode('legato'));

            const bpmSlider = document.getElementById("bpmSlider");
            const bpmValue = document.getElementById("bpmValue");
            if (bpmSlider && bpmValue) {
                bpmSlider.addEventListener("input", (e) => {
                    bpmValue.textContent = e.target.value;
                    if (window.app.audio.isMetronomeActive) {
                        window.app.audio.startMetronome(parseInt(e.target.value));
                    }
                });
                window.app.audio.metronomeBPM = parseInt(bpmSlider.value); // Initiale BPM setzen
            }
        }
        // Event listener für globale Aktionen (Reset, Hand, Range, Scoreboard)
        // Diese sind jetzt im HTML mit onclick="app.funktion()"

        if (this.infoButton) this.infoButton.addEventListener('click', () => this.startTutorialSequence());

        document.addEventListener("mousemove", this.resetInactivityTimer.bind(this));
        document.addEventListener("keypress", this.resetInactivityTimer.bind(this));
    },

    setupVexFlow() {
        if (!this.notationElement || this.vfInitialized) return;
        console.log('🎼 Setting up VexFlow...');
        try {
            this.vf = new Factory({
                renderer: { elementId: 'notation', width: this.notationElement.offsetWidth, height: this.notationElement.offsetHeight }
            });
            this.context = this.vf.getContext();
            this.vfInitialized = true;
            console.log('✅ VexFlow initialized.');
        } catch (e) {
            console.error('❌ VexFlow initialization failed:', e);
            this.vfInitialized = false;
        }
    },

    drawSeries(notes, currentIndex, isKidsMode, customSettings) {
        if (!this.vfInitialized && this.notationElement) this.setupVexFlow();
        if (!this.vf || !this.notationElement || !notes || notes.length === 0) return;

        this.context.clear();
        const clef = notes[0].clef;
        const staveWidth = this.notationElement.offsetWidth * 0.8;
        const staveX = (this.notationElement.offsetWidth - staveWidth) / 2;
        this.stave = this.vf.Stave(staveX, 20, staveWidth).addClef(clef);
        if (customSettings && customSettings.keySignature) {
            this.stave.addKeySignature(customSettings.keySignature);
        }
        this.stave.setContext(this.context).draw();

        const vexNotes = notes.map((noteData, index) => {
            let noteKey = noteData.note + "/" + noteData.octave;
            if (isKidsMode) {
                const emoji = this.getEmojiForNote(noteKey, clef);
                // VexFlow kann keine direkten Emojis zeichnen, dies ist eine alternative Darstellung
                // Wir können stattdessen den Notennamen unter die Note schreiben
                // Oder eine komplexere Textannotation verwenden
            }
            const staveNote = new StaveNote({ keys: [noteKey], duration: "q", clef: clef });
            if (noteData.accidental) {
                staveNote.addAccidental(0, new Accidental(noteData.accidental));
            }
            if (noteData.color) {
                staveNote.setStyle({ fillStyle: noteData.color, strokeStyle: noteData.color });
            }
            if (index === currentIndex) {
                staveNote.setStyle({ fillStyle: "blue", strokeStyle: "blue" });
            }
            return staveNote;
        });

        if (vexNotes.length > 0) {
            Formatter.FormatAndDraw(this.context, this.stave, vexNotes);
        }
    },

    getEmojiForNote(noteKey, clef) {
        // Basierend auf dem alten Code
        const noteMap = clef === 'bass' ? 
            { "c/3": "🐢", "d/3": "🦆", "e/3": "🐘", "f/3": "🦊", "g/3": "🦒", "a/3": "🐻", "b/3": "🐳"} :
            { "c/4": "🍎", "d/4": "🍌", "e/4": "🍒", "f/4": "🍇", "g/4": "🍓", "a/4": "🥝", "b/4": "🍍"};
        return noteMap[noteKey.toLowerCase()] || '🎵';
    },
    
    updateClefTitle(title, animate = false) {
        if (this.clefTitle) {
            this.clefTitle.textContent = title;
            if (animate) {
                this.clefTitle.classList.add('changed');
                setTimeout(() => this.clefTitle.classList.remove('changed'), 500);
            }
        }
    },

    displayPlayedNote(playedNoteObj, color, expectedNoteObj, isKidsMode) {
        if (this.playedNoteDisplay && this.correctNoteDisplay) {
            let playedText = `${playedNoteObj.note.toUpperCase()}${playedNoteObj.octave}`;
            let expectedText = `${expectedNoteObj.note.toUpperCase()}${expectedNoteObj.octave}`;
            if(isKidsMode) {
                playedText = this.getEmojiForNote(`${playedNoteObj.note}/${playedNoteObj.octave}`, playedNoteObj.clef);
                expectedText = this.getEmojiForNote(`${expectedNoteObj.note}/${expectedNoteObj.octave}`, expectedNoteObj.clef);
            }

            this.playedNoteDisplay.textContent = playedText;
            this.playedNoteDisplay.style.color = color;
            this.correctNoteDisplay.textContent = `(Erwartet: ${expectedText})`;
        }
    },
    
    clearNoteNameDisplay() {
        if(this.playedNoteDisplay) this.playedNoteDisplay.textContent = "";
        if(this.correctNoteDisplay) this.correctNoteDisplay.textContent = "";
    },

    updateDisplay(gameState) {
        if (this.scoreDisplay) this.scoreDisplay.textContent = `Punkte: ${gameState.score}`;
        this.updateHeartsDisplay(gameState.hearts, gameState.unlimitedLives);
        // Streak Anzeige fehlt hier noch im Vergleich zum alten Code
    },

    updateHeartsDisplay(hearts, unlimited) {
        if (this.heartsDisplay) {
            if (unlimited) {
                this.heartsDisplay.innerHTML = '❤️ &infin;'; 
            } else {
                this.heartsDisplay.innerHTML = '❤️ '.repeat(Math.max(0, hearts));
            }
        }
    },

    updateTimer(sessionCounter, responseTimes, totalAttempts, correctAnswers) {
        if (this.timerDisplay) {
            const avgTime = responseTimes.length > 0 ? (responseTimes.reduce((a,b) => a+b, 0) / responseTimes.length / 1000).toFixed(2) : "N/A";
            const accuracy = totalAttempts > 0 ? ((correctAnswers / totalAttempts) * 100).toFixed(1) : "N/A";
            this.timerDisplay.innerHTML = 
                `Noten bis Pause: <strong>${sessionCounter}</strong> | ` +
                `Ø Zeit: <strong>${avgTime}s</strong> | ` +
                `Genauigkeit: <strong>${accuracy}%</strong>`;
        }
    },
    
    showMotivation(text) {
        if (this.motivationDisplay) {
            this.motivationDisplay.textContent = text;
            this.motivationDisplay.style.opacity = 1;
            setTimeout(() => {
                if (this.motivationDisplay) this.motivationDisplay.style.opacity = 0;
            }, 1500);
        }
    },

    clearMotivation() {
        if (this.motivationDisplay) {
            this.motivationDisplay.textContent = '';
            this.motivationDisplay.style.opacity = 0;
        }
    },

    showGameOverScreen(score) {
        if (this.gameOverScreen && this.finalScoreDisplay) {
            this.finalScoreDisplay.textContent = score;
            this.gameOverScreen.style.display = 'flex';
            this.mainContent.style.display = 'none';
        }
    },
    hideGameOverScreen() {
        if (this.gameOverScreen) this.gameOverScreen.style.display = 'none';
        this.showMainContent();
    },

    showMainContent() {
        if (this.mainContent) this.mainContent.style.display = 'flex';
        if (this.welcomeOverlay) this.welcomeOverlay.style.display = 'none';
    },
    
    toggleSettingsPanel() {
        if (this.settingsPanel) {
            this.settingsPanel.classList.toggle('open');
            this.blinkGreenBackground(); // Effekt
        }
    },
    
    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        this.initialBackgroundColor = getComputedStyle(document.body).backgroundColor; // Update für blinkGreenBackground
        this.blinkGreenBackground();
        console.log('🌙 Dark mode toggled');
    },
    
    updateToggleState(elementId, isActive) {
        const toggle = document.getElementById(elementId);
        if (toggle && typeof toggle.checked !== 'undefined') {
            toggle.checked = isActive;
        }
    },

    updateHandToggle(handOption) {
        if (this.handToggle) {
            this.handToggle.textContent = handOption.symbol;
            if (handOption.flip) {
                this.handToggle.style.transform = "scaleX(-1)";
            } else {
                this.handToggle.style.transform = "scaleX(1)";
            }
        }
    },
    
    updateArticulationToggle(mode) {
        // Knöpfe hervorheben
        [this.staccatoButton, this.legatoButton].forEach(btn => {
            if(btn) btn.classList.remove('active');
        });
        if (mode === 'staccato' && this.staccatoButton) this.staccatoButton.classList.add('active');
        if (mode === 'legato' && this.legatoButton) this.legatoButton.classList.add('active');
    },
    
    updateMetronomeDisplay(bpm, isActive) {
        if (this.metronomeButton && this.metronomeButton.nextElementSibling) {
            // Assuming the text is in a span next to the toggle
            this.metronomeButton.nextElementSibling.textContent = isActive ? `${bpm} BPM` : "Metronom";
        }
        if (document.getElementById("bpmSlider")) {
            document.getElementById("bpmSlider").value = bpm;
        }
        if (document.getElementById("bpmValue")) {
            document.getElementById("bpmValue").textContent = bpm;
        }
    },

    setupFadeOnHover() {
        const hoverElements = document.querySelectorAll('.hover-fade');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => el.style.opacity = '1');
            el.addEventListener('mouseleave', () => el.style.opacity = '0.7');
        });
    },

    animateCircles() {
        const circles = document.querySelectorAll('.circle-animation div');
        circles.forEach((circle, index) => {
            circle.style.animationDelay = `${index * 0.1}s`;
        });
    },
    
    addCircle(type) { // type: "positive" oder "negative"
        const container = document.querySelector(".feedback-circles");
        if (!container) return;
        const circle = document.createElement("div");
        circle.classList.add(type === "positive" ? "positive-circle" : "negative-circle");
        container.appendChild(circle);
        setTimeout(() => circle.remove(), 2000); // Lebensdauer des Kreises
    },

    spawnIntroBlobs() {
        if (!this.blobsEnabled) return;
        this.backgroundBlobs.forEach(blob => {
            blob.style.left = `${Math.random() * 100}vw`;
            blob.style.top = `${Math.random() * 100}vh`;
            blob.style.width = `${Math.random() * 150 + 50}px`;
            blob.style.height = blob.style.width; 
            blob.style.opacity = `${Math.random() * 0.3 + 0.1}`;
            blob.style.animationDuration = `${Math.random() * 20 + 10}s`;
        });
    },

    resetInactivityTimer() {
        clearTimeout(this.inactivityTimer);
        if (this.welcomeOverlay && this.welcomeOverlay.style.display !== 'none') return;
        if (this.pauseScreen && this.pauseScreen.style.display !== 'none') return;

        this.inactivityTimer = setTimeout(() => {
            // Zeige einen Hinweis oder führe eine Aktion aus
            // Z.B. Spiel pausieren oder zurück zum Startbildschirm
            console.log("😴 Inactivity detected, showing reminder or pausing...");
            this.showMotivation("Noch da? Spiel weiter!");
            // window.app.pauseGame(); // Beispiel
        }, 60000 * 5); // 5 Minuten Inaktivität
    },

    checkOrientation() {
        if (this.orientationWarning) {
            if (window.innerHeight > window.innerWidth && window.innerWidth < 768) { // Porträt auf kleinen Geräten
                this.orientationWarning.style.display = 'flex';
            } else {
                this.orientationWarning.style.display = 'none';
            }
        }
    },
    
    showTrophyTransitionScreen(callback) {
        const trophyScreen = document.getElementById('trophyTransitionScreen');
        if (trophyScreen) {
            trophyScreen.style.display = 'flex';
            setTimeout(() => {
                trophyScreen.style.display = 'none';
                if (callback) callback();
            }, 3000); // 3 Sekunden anzeigen
        }
    },
    
    updateScoreboard(scores) {
        if (!this.scoreboardBody) return;
        this.scoreboardBody.innerHTML = ''; // Clear old scores
        if (scores && scores.length > 0) {
            const table = document.createElement('table');
            const header = table.createTHead().insertRow();
            ["Datum", "Modus", "Genauigkeit", "Dauer"].forEach(text => {
                const th = document.createElement('th');
                th.textContent = text;
                header.appendChild(th);
            });
            const tbody = table.createTBody();
            scores.forEach(score => {
                const row = tbody.insertRow();
                row.insertCell().textContent = score.date;
                row.insertCell().textContent = score.mode;
                row.insertCell().textContent = `${score.accuracy}%`;
                row.insertCell().textContent = score.duration;
            });
            this.scoreboardBody.appendChild(table);
        } else {
            this.scoreboardBody.textContent = 'Noch keine Highscores gespeichert.';
        }
    },

    toggleScoreboard(scores) {
        if (this.scoreboardOverlay) {
            const isOpen = this.scoreboardOverlay.style.display === 'flex';
            if (!isOpen) {
                this.updateScoreboard(scores);
                this.scoreboardOverlay.style.display = 'flex';
            } else {
                this.scoreboardOverlay.style.display = 'none';
            }
        }
    },

    promptForUserName(callback) {
        if (this.welcomeOverlay && this.userNameInput && this.welcomeMessage) {
            this.welcomeOverlay.style.display = 'flex';
            this.mainContent.style.display = 'none';
            this.welcomeMessage.textContent = "Hallo! Wie heißt du?";
            const nameForm = document.getElementById('nameForm');
            if (nameForm) {
                nameForm.onsubmit = (e) => {
                    e.preventDefault();
                    const userName = this.userNameInput.value.trim();
                    if (userName) {
                        localStorage.setItem("userName", userName);
                        this.displayWelcomeMessage(userName, false, callback);
                    }
                };
            }
        }
    },

    displayWelcomeMessage(userName, returningUser, callback) {
        if (this.welcomeOverlay && this.welcomeMessage) {
            this.welcomeOverlay.style.display = 'flex';
            this.mainContent.style.display = 'none';
            if (document.getElementById('nameForm')) document.getElementById('nameForm').style.display = 'none';
            
            this.welcomeMessage.innerHTML = returningUser ? 
                `Willkommen zurück, <strong>${userName}</strong>!` :
                `Hallo, <strong>${userName}</strong>! Schön, dass du da bist.`;
            
            setTimeout(() => {
                if (this.welcomeOverlay) this.welcomeOverlay.style.opacity = 0;
                 setTimeout(() => {
                     if (this.welcomeOverlay) this.welcomeOverlay.style.display = 'none';
                     this.showMainContent();
                     if (callback) callback();
                 }, 500); // Fade-out duration
            }, returningUser ? 2000 : 3000); // Kürzere Anzeige für wiederkehrende Nutzer
        }
    },

    proceedToMainScreen() {
        if (this.welcomeOverlay) this.welcomeOverlay.style.display = 'none';
        this.showMainContent();
        if (!this.vfInitialized) this.setupVexFlow();
        // Weitere UI-Initialisierungen für den Hauptbildschirm hier, falls nötig
    },
    
    updatePauseScreen(remainingTime, onEndCallback) {
        if (this.pauseScreen && this.pauseCountdown) {
            this.pauseScreen.style.display = 'flex';
            let timeLeft = Math.ceil(remainingTime / 1000);
            this.pauseCountdown.textContent = timeLeft;
            const interval = setInterval(() => {
                timeLeft--;
                this.pauseCountdown.textContent = timeLeft;
                if (timeLeft <= 0) {
                    clearInterval(interval);
                    this.hidePauseScreen();
                    if (onEndCallback) onEndCallback();
                }
            }, 1000);
        } 
    },
    showPauseScreen(breakTime, onEndCallback) {
        if (this.pauseScreen) {
            this.pauseScreen.style.display = 'flex';
        }
        this.updatePauseScreen(breakTime, onEndCallback);
    },

    hidePauseScreen() {
        if (this.pauseScreen) this.pauseScreen.style.display = 'none';
    },

    updatePauseTiles(count) { // Aus altem Code, falls noch verwendet
        if (this.pauseTiles) {
            this.pauseTiles.innerHTML = '';
            for (let i = 0; i < count; i++) {
                const tile = document.createElement('div');
                tile.classList.add('pause-tile');
                this.pauseTiles.appendChild(tile);
            }
        }
    },
    updatePauseProgress(progress) { // Aus altem Code
        if (this.pauseProgress) {
            this.pauseProgress.style.width = `${progress}%`;
        }
    },

    hideNotation() {
        if (this.notationElement) this.notationElement.style.display = 'none';
        if (this.playedNoteDisplay) this.playedNoteDisplay.style.display = 'none';
        if (this.correctNoteDisplay) this.correctNoteDisplay.style.display = 'none';
    },

    showNotation() {
        if (this.notationElement) this.notationElement.style.display = 'block';
        if (this.playedNoteDisplay) this.playedNoteDisplay.style.display = 'block';
        if (this.correctNoteDisplay) this.correctNoteDisplay.style.display = 'block';
    },
    
    handleKeyPressAnimation() { // Für Tastenanschlag-Feedback auf Menü-Elementen
        const menu = document.getElementById("menuContainer");
        if (menu) {
            menu.classList.add("key-pressed");
            setTimeout(() => menu.classList.remove("key-pressed"), 100);
        }
    },

    blinkGreenBackground() {
        document.body.style.transition = 'background-color 0.1s ease-in-out';
        document.body.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
        setTimeout(() => {
            document.body.style.backgroundColor = this.initialBackgroundColor; 
        }, 100);
    },

    saveButtonEffect(buttonElement) {
        if (buttonElement) {
            buttonElement.classList.add('button-saved');
            setTimeout(() => buttonElement.classList.remove('button-saved'), 1000);
        }
    },

    startTutorialSequence(onComplete) {
        if (!this.tutorialOverlay || this.tutorialSteps.length === 0) {
            if (onComplete) onComplete();
            return;
        }
        console.log("📚 Starting tutorial...");
        this.tutorialOverlay.style.display = 'flex';
        this.currentTutorialStep = 0;
        this.showTutorialStep(this.currentTutorialStep);

        const nextButton = this.tutorialOverlay.querySelector('#nextTutorial');
        const prevButton = this.tutorialOverlay.querySelector('#prevTutorial');
        const endButton = this.tutorialOverlay.querySelector('#endTutorial');

        const handleNext = () => {
            this.currentTutorialStep++;
            if (this.currentTutorialStep < this.tutorialSteps.length) {
                this.showTutorialStep(this.currentTutorialStep);
            } else {
                this.endTutorial(onComplete);
            }
        };

        const handlePrev = () => {
            this.currentTutorialStep = Math.max(0, this.currentTutorialStep - 1);
            this.showTutorialStep(this.currentTutorialStep);
        };
        
        // Remove old listeners before adding new ones to prevent multiple triggers
        nextButton.replaceWith(nextButton.cloneNode(true));
        prevButton.replaceWith(prevButton.cloneNode(true));
        endButton.replaceWith(endButton.cloneNode(true));

        this.tutorialOverlay.querySelector('#nextTutorial').addEventListener('click', handleNext);
        this.tutorialOverlay.querySelector('#prevTutorial').addEventListener('click', handlePrev);
        this.tutorialOverlay.querySelector('#endTutorial').addEventListener('click', () => this.endTutorial(onComplete));
    },

    showTutorialStep(stepIndex) {
        this.tutorialSteps.forEach((step, index) => {
            step.style.display = (index === stepIndex) ? 'block' : 'none';
        });
        const prevButton = this.tutorialOverlay.querySelector('#prevTutorial');
        const nextButton = this.tutorialOverlay.querySelector('#nextTutorial');
        if (prevButton) prevButton.disabled = (stepIndex === 0);
        if (nextButton) nextButton.textContent = (stepIndex === this.tutorialSteps.length - 1) ? "Fertig" : "Weiter";
    },

    endTutorial(onComplete) {
        if (this.tutorialOverlay) this.tutorialOverlay.style.display = 'none';
        console.log("✅ Tutorial finished.");
        if (onComplete) onComplete();
    },

    updateArticulationFeedback(message, correct) {
        const feedbackEl = document.getElementById('articulationFeedback');
        if (feedbackEl) {
            feedbackEl.textContent = message;
            feedbackEl.style.color = correct ? 'green' : 'red';
            feedbackEl.style.opacity = 1;
            setTimeout(() => feedbackEl.style.opacity = 0, 2000);
        }
    }
}; 