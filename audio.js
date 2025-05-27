// Audio Module
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
        try {
            this.midiAccess = await navigator.requestMIDIAccess();
            this.midiInputs = Array.from(this.midiAccess.inputs.values());
            this.setupMIDIListeners();
            return true;
        } catch (error) {
            console.error('MIDI access failed:', error);
            return false;
        }
    },

    setupMIDIListeners() {
        this.midiInputs.forEach(input => {
            input.onmidimessage = this.handleMIDIMessage.bind(this);
        });
    },

    // Metronome Functions
    startMetronome() {
        if (this.isMetronomeActive) return;
        
        const click = new Audio('tick.mp3');
        this.metronomeInterval = setInterval(() => {
            click.play();
        }, 60000 / this.tempo);
        
        this.isMetronomeActive = true;
    },

    stopMetronome() {
        if (this.metronomeInterval) {
            clearInterval(this.metronomeInterval);
            this.metronomeInterval = null;
            this.isMetronomeActive = false;
        }
    },

    setTempo(newTempo) {
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
            this.onNoteOn(note, velocity);
        }
        // Note Off
        else if (status === 128 || (status === 144 && velocity === 0)) {
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