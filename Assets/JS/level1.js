/* Логика первого уровня */
const carBrands = [
    { image: 'audi.jpg', answer: 'audi' },
    { image: 'bmw.jpg', answer: 'bmw' },
    { image: 'mercedes.jpg', answer: 'mercedes' },
    { image: 'toyota.jpg', answer: 'toyota' }
];

let currentStage = 1;
let currentCar = null;

document.addEventListener('DOMContentLoaded', () => {
    // Инициализация
    document.getElementById('username').textContent = localStorage.getItem('username');
    loadNewQuestion();
    setupEventListeners();
});

function loadNewQuestion() {
    currentCar = carBrands[Math.floor(Math.random() * carBrands.length)];
    document.getElementById('car-image').src = `../Assets/Images/level1/${currentCar.image}`;
    document.getElementById('answer-input').value = '';
}

function setupEventListeners() {
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('username');
        window.location.href = '../index.html';
    });

    document.getElementById('action-btn').addEventListener('click', checkAnswer);
    document.getElementById('answer-input').addEventListener('keypress', (e) => {
        if(e.key === 'Enter') checkAnswer();
    });
}

function checkAnswer() {
    const userAnswer = document.getElementById('answer-input').value.trim().toLowerCase();
    const isCorrect = userAnswer === currentCar.answer;
    
    if(isCorrect) {
        updateScore(1, 10);
        currentStage++;
        alert('Правильно! +10 баллов');
    } else {
        updateScore(1, -5);
        alert(`Неверно! -5 баллов. Правильный ответ: ${currentCar.answer}`);
    }
    
    updateUI();
    
    if(currentStage <= 3) {
        loadNewQuestion();
    } else {
        finishLevel();
    }
}

function updateUI() {
    const stats = getCurrentStats();
    document.getElementById('current-score').textContent = stats.scores[1];
}

function finishLevel() {
    const stats = getCurrentStats();
    stats.completed = true;
    localStorage.setItem(localStorage.getItem('username'), JSON.stringify(stats));
    alert(`Уровень завершен! Ваш счет: ${stats.scores[1]}`);
    window.location.href = 'index.html';
}