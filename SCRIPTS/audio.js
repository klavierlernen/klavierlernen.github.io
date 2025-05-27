// Audio Module
console.log('🎵 Loading audio.js...');

export const audioModule = {
    midiAccess: null,
    midiInputs: [],
    isMetronomeActive: false,
    metronomeBPM: 0, // Wird vom UI/game gesetzt
    metronomeIntervalId: null,
    metronomeTimerId: null, // Für setInterval
    lastTickTime: 0,
    metronomeTolerance: 100, // ms
    tickSound: null, 
    gongSound: null,

    async initMIDIAccess() {
        console.log('🎹 Requesting MIDI access...');
        try {
            this.midiAccess = await navigator.requestMIDIAccess({ sysex: false });
            this.midiInputs = Array.from(this.midiAccess.inputs.values());
            console.log(`✅ MIDI access granted. Found ${this.midiInputs.length} input(s)`);
            this.setupMIDIListeners();
            this.loadSounds();
            return true;
        } catch (error) {
            console.error('❌ MIDI access failed:', error);
            return false;
        }
    },

    loadSounds() {
        console.log("🔊 Loading sounds...");
        this.tickSound = new Audio('https://jp0024.github.io/piano.github.io/AUDIO/tick.mp3');
        this.gongSound = new Audio('https://jp0024.github.io/piano.github.io/AUDIO/gong-2-232435.mp3');
        // Optional: Vorladen der Sounds, um Verzögerungen zu minimieren
        this.tickSound.preload = "auto";
        this.gongSound.preload = "auto";
        console.log("✅ Sounds loaded (tick, gong)");
    },

    setupMIDIListeners() {
        console.log('🎹 Setting up MIDI listeners...');
        this.midiAccess.inputs.forEach(input => {
            console.log(`  - Found MIDI input: ${input.name}`);
            input.onmidimessage = (message) => this.handleMIDIMessage(message); // Direkt binden oder Wrapper in main.js
        });
        this.midiAccess.onstatechange = (event) => {
            console.log("🔌 MIDI state change:", event.port.name, event.port.state);
            this.midiInputs = Array.from(this.midiAccess.inputs.values());
            this.setupMIDIListeners(); // Neu verbinden, falls nötig
        };
    },

    startMetronome(bpm) {
        if (this.isMetronomeActive) this.stopMetronome();
        if (bpm) this.metronomeBPM = bpm;
        if (this.metronomeBPM <= 0) {
            console.warn(" Metronome BPM is 0 or less, not starting.");
            return;
        }

        console.log(`⏰ Starting metronome at ${this.metronomeBPM} BPM...`);
        const intervalMs = 60000 / this.metronomeBPM;
        this.metronomeTolerance = intervalMs * 0.3; // 30% Toleranz
        this.lastTickTime = Date.now();
        if (this.tickSound) {
            this.tickSound.currentTime = 0;
            this.tickSound.play();
        }
        this.metronomeTimerId = setInterval(() => {
            if (this.tickSound) {
                this.tickSound.currentTime = 0;
                this.tickSound.play();
            }
            this.lastTickTime = Date.now();
        }, intervalMs);
        this.isMetronomeActive = true;
        console.log(`✅ Metronome started.`);
        // uiModule.updateMetronomeDisplay(this.metronomeBPM, true); // UI aktualisieren
    },

    stopMetronome() {
        if (this.metronomeTimerId) {
            console.log('⏹️ Stopping metronome...');
            clearInterval(this.metronomeTimerId);
            this.metronomeTimerId = null;
        }
        this.isMetronomeActive = false;
        // uiModule.updateMetronomeDisplay(0, false); // UI aktualisieren
    },

    toggleMetronome(bpmToSet) {
        if (this.isMetronomeActive) {
            this.stopMetronome();
        } else {
            if (bpmToSet) {
                this.startMetronome(bpmToSet);
            } else {
                // Versuche BPM aus UI oder Default zu bekommen
                // const currentBpmFromUi = uiModule.getBpmInput(); 
                this.startMetronome(this.metronomeBPM || 60); 
            }
        }
    },

    playGongSound() {
        if (this.gongSound) {
            this.gongSound.currentTime = 0;
            this.gongSound.play();
            console.log("🔔 Gong sound played");
        }
    },

    // Wird von main.js (handleMIDIMessageWrapper) aufgerufen
    handleMIDIMessage(message) {
        const [status, data1, data2] = message.data;
        // Articulation Mode Check from main.js's wrapper already handles sessionPaused
        
        // NOTE-OFF für Staccato-Modus (auch NOTE-ON mit Velocity 0)
        // Die app.articulationMode Prüfung passiert im Wrapper in main.js
        if (((status & 0xf0) === 0x80) || ((status & 0xf0) === 0x90 && data2 === 0)) {
            // Staccato Note Off wird speziell behandelt, wenn articulationMode aktiv ist
            if (typeof this.onNoteOffStaccato === 'function') {
                this.onNoteOffStaccato(data1); // data1 ist die Note
            }
            return; // Für Staccato Note-Off nicht die normale Note-On Logik aufrufen
        }

        // NOTE-ON
        if ((status & 0xf0) === 0x90 && data2 > 0) {
            console.log(`🎹 Note On: ${data1} (velocity: ${data2})`);
            if (typeof this.onNoteOn === 'function') {
                 this.onNoteOn(data1, data2); // data1 ist Note, data2 Velocity
            }
        }
        // Kein expliziter Note-Off Handler hier, da Staccato das oben abfängt
        // und für Legato (falls implementiert) das Timing zwischen On-Events zählt.
    },

    // Diese Callbacks werden von game.js gesetzt
    onNoteOn: function(note, velocity) { console.warn("audioModule.onNoteOn not overridden by gameModule"); },
    onNoteOffStaccato: function(note) { console.warn("audioModule.onNoteOffStaccato not overridden by gameModule for articulation"); }
}; 