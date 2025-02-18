/* Управление статистикой */
function initStats(username) {
    if(!localStorage.getItem(username)) {
        const stats = {
            currentLevel: 1,
            scores: { 1: 0, 2: 0, 3: 0 },
            completed: false
        };
        localStorage.setItem(username, JSON.stringify(stats));
    }
}

function updateScore(level, points) {
    const username = localStorage.getItem('username');
    const stats = JSON.parse(localStorage.getItem(username));
    stats.scores[level] += points;
    localStorage.setItem(username, JSON.stringify(stats));
}

function getCurrentStats() {
    const username = localStorage.getItem('username');
    return JSON.parse(localStorage.getItem(username));
}