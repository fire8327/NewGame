import { getCurrentStats, updateLevelStats, completeLevel, updateRating } from './stats.js';

const carBrands = [
    { image: 'audi.jpg', answer: 'audi' },
    { image: 'bmw.jpg', answer: 'bmw' },
    { image: 'mercedes.jpg', answer: 'mercedes' },
    { image: 'toyota.jpg', answer: 'toyota' }
];

let currentStage = 1;
let currentCar = null;
let isProcessing = false;

// Предзагрузка изображений
const preloadedImages = [];
carBrands.forEach(brand => {
    const img = new Image();
    img.src = `../Assets/Images/level1/${brand.image}`;
    preloadedImages.push(img);
});

document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('username')) {
        window.location.href = '../index.html';
        return;
    }

    document.getElementById('username').textContent = localStorage.getItem('username');
    loadNewQuestion();
    setupEventListeners();
    updateUI();
});

function loadNewQuestion() {
    currentCar = carBrands[Math.floor(Math.random() * carBrands.length)];
    document.getElementById('car-image').src = preloadedImages.find(
        img => img.src.endsWith(currentCar.image)
    ).src;
    document.getElementById('answer-input').value = '';
    document.getElementById('answer-input').focus();
    isProcessing = false;
}

function setupEventListeners() {
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../index.html';
    });

    document.getElementById('action-btn').addEventListener('click', async () => {
        if (!isProcessing) await checkAnswer();
    });

    document.getElementById('answer-input').addEventListener('keypress', async (e) => {
        if (e.key === 'Enter' && !isProcessing) await checkAnswer();
    });
}

async function checkAnswer() {
    isProcessing = true;
    const userAnswer = document.getElementById('answer-input').value.trim().toLowerCase();
    const isCorrect = userAnswer === currentCar.answer;

    updateLevelStats(isCorrect ? 10 : -5, 1);
    currentStage++;

    showFeedback(isCorrect);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Задержка для отображения фидбека

    if (currentStage <= 3) {
        loadNewQuestion();
    } else {
        completeLevel(1);
        if (getCurrentStats().completedLevels === 3) {
            updateRating(localStorage.getItem('username'), getTotalScore());
        }
        window.location.href = getCurrentStats().completedLevels >= 3 
            ? '../index.html' 
            : '../Pages/level2.html';
    }
    
    updateUI();
}

function showFeedback(isCorrect) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = isCorrect 
        ? 'Правильно! +10 баллов' 
        : `Неверно! -5 баллов. Правильный ответ: ${currentCar.answer}`;
    feedback.className = `feedback ${isCorrect ? 'correct' : 'wrong'}`;
}

function updateUI() {
    const stats = getCurrentStats();
    document.getElementById('current-score').textContent = stats.scores[1] || 0;
    if (currentStage <= 3) {
        document.getElementById('progress').textContent = `${currentStage}/3`;
    }
}

function getTotalScore() {
    const stats = getCurrentStats();
    return Object.values(stats.scores).reduce((a, b) => a + b, 0);
}