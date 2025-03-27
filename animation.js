// animation.js
// Funktionen für Hintergrundanimationen, Intro-Blobs, Inaktivitäts-Blobs usw.

export function animateCircles() {
  const canvas = document.getElementById("animationCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const now = Date.now();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Hier kannst du z. B. ein Array von Kreisen durchlaufen und zeichnen
  // Beispiel: circles.forEach(circle => { ... });
  requestAnimationFrame(animateCircles);
}

export function spawnIntroBlobs() {
  const canvas = document.getElementById("animationCanvas");
  if (!canvas) return;
  const cw = canvas.width, ch = canvas.height;
  const positions = [
    { x: cw - 500, y: 100 },
    { x: cw - 30, y: ch - 30 },
    { x: 50, y: ch / 2 }
  ];
  const colors = ["yellow", "pink", "blue"];
  positions.forEach((pos, index) => {
    // Hier kannst du die Logik einfügen, um z. B. Kreise zur Animation hinzuzufügen
    console.log(`Spawn Blob at ${pos.x}, ${pos.y} mit Farbe ${colors[index % colors.length]}`);
  });
}

export function resetInactivityTimer(spawnInactivityBlob, inactivityTimeoutRef) {
  if (inactivityTimeoutRef.value) clearTimeout(inactivityTimeoutRef.value);
  inactivityTimeoutRef.value = setTimeout(spawnInactivityBlob, 180000);
}

export function spawnInactivityBlob() {
  const canvas = document.getElementById("animationCanvas");
  if (!canvas) return;
  const cw = canvas.width, ch = canvas.height;
  const margin = 10;
  const x = Math.random() * (cw - 2 * margin) + margin;
  const y = Math.random() * (ch - 2 * margin) + margin;
  // Hier kannst du z. B. einen Kreis hinzufügen
  console.log(`Inactivity Blob at ${x}, ${y}`);
}
