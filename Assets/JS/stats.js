// Управление статистикой и рейтингом
export function updateRating(username, totalScore) {
    const rating = JSON.parse(localStorage.getItem('rating')) || [];
    rating.push({ username, score: totalScore, date: new Date().toISOString() });
    localStorage.setItem('rating', JSON.stringify(rating.sort((a, b) => b.score - a.score)));
}

export function getCurrentStats() {
    return JSON.parse(localStorage.getItem('currentSession'));
}

export function updateLevelStats(points, level) {
    const stats = getCurrentStats() || { scores: {} };
    stats.scores[level] = (stats.scores[level] || 0) + points;
    localStorage.setItem('currentSession', JSON.stringify(stats));
}

export function completeLevel(level) {
    const stats = getCurrentStats();
    stats.completedLevels = Math.max(stats.completedLevels, level);
    localStorage.setItem('currentSession', JSON.stringify(stats));
}