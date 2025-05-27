// Audio Module
console.log('🎵 Loading audio.js...');

export const audioModule = {
    // MIDI State
    midiAccess: null,
    midiInputs: [],
    
    // Metronome State
    metronomeInterval: null,
    isMetronomeActive: false,
    tempo: 60, // Standard-Tempo

    // MIDI Functions
    async initMIDIAccess() {
        console.log('🎹 Requesting MIDI access...');
        try {
            this.midiAccess = await navigator.requestMIDIAccess();
            this.midiInputs = Array.from(this.midiAccess.inputs.values());
            console.log(`✅ MIDI access granted. Found ${this.midiInputs.length} input(s)`);
            this.setupMIDIListeners();
            return true;
        } catch (error) {
            console.error('❌ MIDI access failed:', error);
            return false;
        }
    },

    setupMIDIListeners() {
        console.log('🎹 Setting up MIDI listeners...');
        this.midiInputs.forEach(input => {
            console.log(`  - Found MIDI input: ${input.name}`);
            input.onmidimessage = this.handleMIDIMessage.bind(this);
        });
    },

    // Metronome Functions
    startMetronome() {
        if (this.isMetronomeActive) return;
        
        console.log('⏰ Starting metronome...');
        const click = new Audio('https://jp0024.github.io/piano.github.io/AUDIO/tick.mp3');
        this.metronomeInterval = setInterval(() => {
            click.play();
        }, 60000 / this.tempo);
        
        this.isMetronomeActive = true;
        console.log(`✅ Metronome started at ${this.tempo} BPM`);
    },

    stopMetronome() {
        if (this.metronomeInterval) {
            console.log('⏹️ Stopping metronome...');
            clearInterval(this.metronomeInterval);
            this.metronomeInterval = null;
            this.isMetronomeActive = false;
        }
    },

    setTempo(newTempo) {
        console.log(`🎯 Setting tempo to ${newTempo} BPM`);
        this.tempo = newTempo;
        if (this.isMetronomeActive) {
            this.stopMetronome();
            this.startMetronome();
        }
    },

    // MIDI Message Handler
    handleMIDIMessage(message) {
        const [status, note, velocity] = message.data;
        
        // Note On
        if (status === 144 && velocity > 0) {
            console.log(`🎹 Note On: ${note} (velocity: ${velocity})`);
            this.onNoteOn(note, velocity);
        }
        // Note Off
        else if (status === 128 || (status === 144 && velocity === 0)) {
            console.log(`🎹 Note Off: ${note}`);
            this.onNoteOff(note);
        }
    },

    onNoteOn(note, velocity) {
        // Wird von game.js überschrieben
    },

    onNoteOff(note) {
        // Wird von game.js überschrieben
    }
}; 