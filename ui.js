// ui.js
// UI-bezogene Funktionen: Event-Listener, UI-Updates, Toggle-Buttons, Overlays etc.

export function updateTimer(appStartTime, sessionCounter) {
  const elapsed = Math.floor((Date.now() - appStartTime) / 1000);
  let display;
  if (elapsed < 60) { display = elapsed + " s"; }
  else {
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    display = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes);
  }
  const timerElem = document.getElementById("timerContainer");
  if (timerElem) {
    timerElem.textContent = display + " | " + sessionCounter;
  }
}

export function updateHeartsDisplay(unlimitedLives, hearts) {
  const heartsElem = document.getElementById("heartsContainer");
  if (heartsElem) {
    heartsElem.textContent = unlimitedLives ? "∞" : "❤️".repeat(hearts);
  }
}

export function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

export function setupUIEventListeners() {
  // Beispiel: Event Listener für den Space-Key, um ein MIDI-Event zu simulieren
  document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      // Hier kannst du z. B. eine Funktion aus gameLogic.js aufrufen
      console.log("Space gedrückt");
    }
  });

  // Weitere UI-Elemente (z.B. DarkMode-Toggle, Hand-Toggle, Scoreboard etc.)
  const darkModeToggle = document.getElementById("darkModeToggle");
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", toggleDarkMode);
  }
}
