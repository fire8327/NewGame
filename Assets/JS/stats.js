// Управление статистикой
function getCurrentStats() {
    return JSON.parse(localStorage.getItem('currentSession')) || {
        scores: { 1: 0, 2: 0, 3: 0 },
        completedLevels: 0
    };
}

function updateLevelStats(points, level) {
    const stats = getCurrentStats();
    const newScore = Math.max((stats.scores[level] || 0) + points, 0);
    stats.scores[level] = newScore;
    localStorage.setItem('currentSession', JSON.stringify(stats));
}

function completeLevel(level) {
    const stats = getCurrentStats();
    stats.completedLevels = Math.max(stats.completedLevels, level);
    localStorage.setItem('currentSession', JSON.stringify(stats));
}

function updateRating(username, totalScore) {
    const rating = JSON.parse(localStorage.getItem('rating')) || [];
    // Удаляем старый результат если есть
    const newRating = rating.filter(item => item.username !== username);
    newRating.push({ username, score: totalScore, date: new Date().toISOString() });
    localStorage.setItem('rating', JSON.stringify(newRating.sort((a, b) => b.score - a.score)));
}