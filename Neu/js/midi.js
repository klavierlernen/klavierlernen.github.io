function midiNoteToInfo(midiNote) {
    const noteNames = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
    const octave = Math.floor(midiNote / 12) - 1;
    const note = noteNames[midiNote % 12];
    return { note, octave };
}

export function initializeMidi(onNotePlayed) {
    if (!navigator.requestMIDIAccess) {
        console.warn("Web MIDI API wird nicht unterstützt.");
        alert("Dein Browser unterstützt kein MIDI. Bitte nutze Chrome oder Edge.");
        return;
    }

    navigator.requestMIDIAccess({ sysex: false })
        .then((midiAccess) => {
            console.log("MIDI-Zugriff erfolgreich.");
            
            const handleMessage = (event) => {
                const [status, data1, data2] = event.data;
                // Note-On Event mit Velocity > 0
                if ((status & 0xF0) === 0x90 && data2 > 0) {
                    const noteInfo = midiNoteToInfo(data1);
                    onNotePlayed(noteInfo);
                }
            };

            midiAccess.inputs.forEach((input) => {
                console.log(`MIDI-Gerät verbunden: ${input.name}`);
                input.onmidimessage = handleMessage;
            });

            midiAccess.onstatechange = (event) => {
                if (event.port.type === "input" && event.port.state === "connected") {
                    console.log(`Neues MIDI-Gerät: ${event.port.name}`);
                    event.port.onmidimessage = handleMessage;
                }
            };
        })
        .catch((err) => {
            console.error("MIDI-Zugriff fehlgeschlagen:", err);
            alert("Fehler beim Zugriff auf MIDI-Geräte.");
        });
}
