// storage.js
// Funktionen zum Laden und Speichern von Daten (LocalStorage, Statistiken, Highscores etc.)

export function saveStatistics(stats) {
  localStorage.setItem("appStatistics", JSON.stringify(stats));
}

export function loadStatistics() {
  const statsStr = localStorage.getItem("appStatistics");
  if (statsStr) {
    return JSON.parse(statsStr);
  }
  return null;
}

export function updateStreak() {
  let streak = Number(localStorage.getItem("streak")) || 0;
  let lastDateStr = localStorage.getItem("lastLearnDate");
  let today = new Date();
  today.setHours(0,0,0,0);
  if (lastDateStr) {
    let lastDate = new Date(lastDateStr);
    lastDate.setHours(0,0,0,0);
    let diffDays = (today - lastDate) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      streak++;
    } else if (diffDays > 1) {
      streak = 1;
    }
  } else {
    streak = 1;
  }
  localStorage.setItem("lastLearnDate", today.toISOString());
  localStorage.setItem("streak", streak);
  return streak;
}

export function saveOpenTime() {
  const openTimes = JSON.parse(localStorage.getItem("openTimes") || "[]");
  openTimes.push(new Date().toISOString());
  localStorage.setItem("openTimes", JSON.stringify(openTimes));
}
