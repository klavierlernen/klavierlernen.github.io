// notation.js
// Alle Funktionen zur Darstellung der Notation mit VexFlow

export function drawSeries(currentSeriesSingle, currentRange, seriesLength) {
  const notationDiv = document.getElementById("notation");
  const baseWidth = 800;
  const ratio = window.devicePixelRatio || 1;
  const height = 300 * ratio;
  notationDiv.style.display = "block";
  notationDiv.innerHTML = "";
  
  const renderer = new Vex.Flow.Renderer(notationDiv, Vex.Flow.Renderer.Backends.SVG);
  renderer.resize(baseWidth * ratio, height);
  const svg = notationDiv.querySelector("svg");
  if (svg) {
    svg.setAttribute("width", baseWidth);
    svg.setAttribute("height", 300);
  }
  
  const context = renderer.getContext();
  const stave = new Vex.Flow.Stave(10, 40, baseWidth - 20);
  
  if (currentSeriesSingle.length) {
    stave.addClef(currentSeriesSingle[0].clef);
  }
  if (currentRange === "D") {
    stave.addKeySignature("D");
  }
  
  stave.setContext(context).draw();
  
  const staveNotes = currentSeriesSingle.map(item => {
    const note = new Vex.Flow.StaveNote({
      clef: item.clef,
      keys: [item.note + "/" + item.octave],
      duration: "q"
    }).setStyle({ fillStyle: item.color, strokeStyle: item.color });
    
    if (currentRange !== "D") {
      if(item.note.includes("#")) {
        note.addAccidental(0, new Vex.Flow.Accidental("#"));
      } else if(item.note === "bb") {
        note.addAccidental(0, new Vex.Flow.Accidental("b"));
      }
    }
    
    const stemDirection = item.octave < 4 ? 1 : -1;
    note.setStemDirection(stemDirection);
    
    return note;
  });
  
  const voice = new Vex.Flow.Voice({ num_beats: seriesLength, beat_value: 4 });
  voice.setStrict(false);
  staveNotes.forEach(note => voice.addTickable(note));
  
  new Vex.Flow.Formatter()
    .joinVoices([voice])
    .format([voice], stave.getWidth() - 20);
  
  voice.draw(context, stave);
}
