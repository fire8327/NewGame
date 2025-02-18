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

    // Обновляем баллы с проверкой на отрицательные значения
    const currentScore = getCurrentStats().scores[1] || 0;
    const newScore = Math.max(currentScore + (isCorrect ? 10 : -5), 0);
    updateLevelStats(newScore - currentScore, 1);

    showFeedback(isCorrect);
    await new Promise(resolve => setTimeout(resolve, 1500));

    currentStage++;
    
    if (currentStage <= 3) {
        loadNewQuestion();
    } else {
        completeLevel(1);
        const stats = getCurrentStats();
        if(stats.completedLevels === 3) {
            updateRating(localStorage.getItem('username'), 
                Object.values(stats.scores).reduce((a, b) => a + b, 0));
        }
        window.location.href = 'level2.html';
    }
    
    updateUI();
}

function showFeedback(isCorrect) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = isCorrect 
        ? 'Правильно! +10 баллов' 
        : `Неверно! -5 баллов. Правильный ответ: ${currentCar.answer}`;
    feedback.className = `text-center px-4 py-2 rounded-lg transition-opacity ${
        isCorrect ? 'text-green-500' : 'text-red-500'
    }`;
    setTimeout(() => {
        feedback.className = 'opacity-0';
    }, 1500);
}

function updateUI() {
    const stats = getCurrentStats();
    document.getElementById('current-score').textContent = stats.scores[1] || 0;
    if(currentStage <= 3 ) {
        document.getElementById('progress').textContent = `${currentStage}/3`;
    }
}