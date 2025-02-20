/* открытие модального окна с формой входа */
document.getElementById('open-login-modal').addEventListener('click', function() {
    document.getElementById('login-modal').classList.remove('hidden');
});

/* закрытие модального окна при клике вне формы */
document.getElementById('login-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        this.classList.add('hidden');
    }
});

/* авторизация */
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('login-input').value.trim();
    
    if(username) {
        // cохраняем имя пользователя
        localStorage.setItem('username', username);

        // инициализируем новую сессию с нулевыми баллами
        const newSession = {
            level: 1,
            scores: { 1: 0, 2: 0, 3: 0 },
            completedLevels: 0
        };
        localStorage.setItem('currentSession', JSON.stringify(newSession));

        // закрываем модальное окно и обновляем интерфейс
        document.getElementById('login-modal').classList.add('hidden');
        updateUserInfo(username);
        showLevelSelect();
    }
});

/* обновление информации о пользователе в шапке */
function updateUserInfo(username) {
    const userInfo = document.getElementById('user-info');
    const usernameDisplay = document.getElementById('username');
    usernameDisplay.textContent = `${username}`;
    userInfo.classList.remove('hidden');
}

/* показать блок выбора уровня */
function showLevelSelect() {
    document.getElementById('open-login-modal').classList.add('hidden');
    document.getElementById('level-select').classList.remove('hidden');
}

/* функция для обнуления баллов */
function resetScores() {
    const session = JSON.parse(localStorage.getItem('currentSession'));
    if (session) {
        session.scores = { 1: 0, 2: 0, 3: 0 }; // Обнуляем баллы
        localStorage.setItem('currentSession', JSON.stringify(session));
    }
}

/* выбор уровня */
document.getElementById('level1-btn').addEventListener('click', function() {
    resetScores(); /* обнуляем баллы перед переходом на уровень */
    window.location.href = 'Pages/level1.html';
});

document.getElementById('level2-btn').addEventListener('click', function() {
    resetScores(); /* обнуляем баллы перед переходом на уровень */
    window.location.href = 'Pages/level2.html';
});

document.getElementById('level3-btn').addEventListener('click', function() {
    resetScores(); /* обнуляем баллы перед переходом на уровень */
    window.location.href = 'Pages/level3.html';
});

/* выход из аккаунта */
document.getElementById('logout-btn').addEventListener('click', function() {
    localStorage.removeItem('username');
    document.getElementById('user-info').classList.add('hidden');
    document.getElementById('level-select').classList.add('hidden');
    document.getElementById('open-login-modal').classList.remove('hidden');
});

/* проверка авторизации при загрузке страницы */
window.addEventListener('load', function() {
    const username = localStorage.getItem('username');
    if (username) {
        updateUserInfo(username);
        showLevelSelect();
    }
});