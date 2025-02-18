// Авторизация и сброс текущей сессии
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('login-input').value.trim();
    
    if(username) {
        // Сброс текущей сессии
        localStorage.removeItem('currentSession');
        localStorage.setItem('username', username);
        
        // Инициализация новой сессии
        const newSession = {
            level: 1,
            scores: { 1: 0, 2: 0, 3: 0 },
            completedLevels: 0
        };
        localStorage.setItem('currentSession', JSON.stringify(newSession));
        
        window.location.href = 'Pages/level1.html';
    }
});