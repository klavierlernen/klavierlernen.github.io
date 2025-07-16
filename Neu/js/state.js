export let state = {
    // Spielzustand
    sessionPaused: false,
    gameOver: false,
    hearts: 4,
    unlimitedLives: true,
    seriesCounter: 0,
    currentSeries: [],
    
    // Konfiguration & Modus
    selectedMode: 'left',
    currentLage: 'C',
    currentTone: 'A',
    currentLageIndex: 0,
    currentToneIndex: 0,
    kidsMode: false,
    randomMode: false,
    
    // Statistiken
    totalAttempts: 0,
    correctAnswers: 0,
    responseTimes: [],
    errorNotes: [],
    lastNoteTimestamp: Date.now(),
    appStartTime: Date.now(),
};

export function resetGameStats() {
    state.totalAttempts = 0;
    state.correctAnswers = 0;
    state.seriesCounter = 0;
    state.hearts = state.unlimitedLives ? Infinity : 4;
    state.errorNotes = [];
    state.gameOver = false;
}

export function saveStatistics() {
    const stats = {
        totalAttempts: state.totalAttempts,
        correctAnswers: state.correctAnswers,
        // ... weitere zu speichernde Werte
    };
    localStorage.setItem("appStatistics", JSON.stringify(stats));
}

export function loadStatistics() {
    const statsStr = localStorage.getItem("appStatistics");
    if (statsStr) {
        const stats = JSON.parse(statsStr);
        state.totalAttempts = stats.totalAttempts || 0;
        state.correctAnswers = stats.correctAnswers || 0;
        // ...
    }
    state.appStartTime = Date.now(); // Startzeit immer neu setzen
}
