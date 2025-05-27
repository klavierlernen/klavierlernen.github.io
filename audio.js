// Audio Module
export const audioModule = {
    // MIDI State
    midiAccess: null,
    midiInputs: [],
    
    // Metronome State
    metronomeInterval: null,
    isMetronomeActive: false,

    // MIDI Functions
    async initMIDIAccess() {
        try {
            const access = await navigator.requestMIDIAccess();
            this.midiAccess = access;
            this.updateMIDIInputs();
            return true;
        } catch (error) {
            console.error('MIDI access failed:', error);
            return false;
        }
    },

    updateMIDIInputs() {
        this.midiInputs = Array.from(this.midiAccess.inputs.values());
    },

    // Metronome Functions
    startMetronome() {
        if (this.isMetronomeActive) return;
        
        const click = new Audio('metronome-click.mp3');
        this.metronomeInterval = setInterval(() => {
            click.play();
        }, 60000 / tempo); // tempo should be defined globally or passed as parameter
        
        this.isMetronomeActive = true;
    },

    stopMetronome() {
        if (this.metronomeInterval) {
            clearInterval(this.metronomeInterval);
            this.metronomeInterval = null;
            this.isMetronomeActive = false;
        }
    },

    // MIDI Message Handler
    handleMIDIMessage(message) {
        const [status, note, velocity] = message.data;
        // Implementation of MIDI message handling
    }
}; 