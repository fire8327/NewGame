/* Авторизация и управление сессией */
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('login-input').value.trim();
    
    if(username) {
        localStorage.setItem('username', username);
        initStats(username); // Из stats.js
        window.location.href = '../../Pages/level1.html';
    }
});