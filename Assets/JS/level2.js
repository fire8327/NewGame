import { getCurrentStats, updateLevelStats, completeLevel, updateRating } from './stats.js';

const carBrands = [
    { image: 'audi.jpg', answer: 'audi' },
    { image: 'bmw.jpg', answer: 'bmw' },
    { image: 'mercedes.jpg', answer: 'mercedes' },
    { image: 'toyota.jpg', answer: 'toyota' }
];

let currentStage = 1;
let targetBrand = '';
let isProcessing = false;
let correctCarId = null;
let secondsLeft = 40;
let timerInterval = null;
let preloadedImages = [];

const initializePreload = async () => {
    try {
        preloadedImages = await Promise.all(
            carBrands.map(async brand => {
                const img = new Image();
                img.src = `../Assets/Images/level2/${brand.image}`;
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve; // Продолжаем даже при ошибке
                });
                return { ...brand, element: img };
            })
        );
    } catch (error) {
        console.error('Ошибка предзагрузки:', error);
        preloadedImages = carBrands.map(brand => ({
            ...brand,
            element: { src: `https://via.placeholder.com/200/374151/fff?text=${brand.answer.toUpperCase()}` }
        }));
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('username')) {
        window.location.href = '../index.html';
        return;
    }

    try {
        await initializePreload();
        document.getElementById('username').textContent = localStorage.getItem('username');
        await startNewStage();
        startTimer();
        updateUI();
    } catch (error) {
        console.error('Ошибка инициализации:', error);
        alert('Ошибка загрузки уровня!');
    }
});

async function startNewStage() {
    const randomBrand = carBrands[Math.floor(Math.random() * carBrands.length)];
    targetBrand = randomBrand.answer;
    document.getElementById('target-brand').textContent = targetBrand;
    
    const cars = generateCarSet();
    if (cars.length === 4) {
        await renderCars(cars);
    } else {
        alert('Ошибка генерации автомобилей!');
    }
}

function generateCarSet() {
    const correctCar = preloadedImages.find(img => img.answer === targetBrand);
    if (!correctCar) return [];

    const wrongCars = preloadedImages
        .filter(img => img.answer !== targetBrand)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

    return [...wrongCars, correctCar].sort(() => Math.random() - 0.5);
}

async function renderCars(cars) {
    const grid = document.getElementById('cars-grid');
    grid.innerHTML = '';
    correctCarId = null;

    cars.forEach((car, index) => {
        if (car.answer === targetBrand) correctCarId = index;

        const card = document.createElement('div');
        card.className = 'relative group rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105';
        
        const img = document.createElement('img');
        img.className = 'w-full object-cover rounded-xl aspect-video opacity-80';
        img.src = car.element.src;
        img.alt = car.answer;
        
        // Обработчик ошибок изображения
        img.onerror = () => {
            img.src = `https://via.placeholder.com/200/374151/fff?text=${car.answer.toUpperCase()}`;
        };

        card.appendChild(img);
        card.addEventListener('click', () => handleCarClick(card, index));
        grid.appendChild(card);
    });

    isProcessing = false;
}

function handleCarClick(card, index) {
    if(isProcessing || !secondsLeft) return;
    isProcessing = true;

    const isCorrect = index === correctCarId;
    const stats = getCurrentStats();
    const newScore = Math.max(stats.scores[2] + (isCorrect ? 15 : -10), 0);
    updateLevelStats(newScore - stats.scores[2], 2);

    showFeedback(card, isCorrect);
    currentStage++;

    setTimeout(() => {
        if(currentStage <= 3 && secondsLeft > 0) {
            startNewStage();
        } else {
            finishLevel();
        }
        updateUI();
        isProcessing = false;
    }, 1500);
}

function showFeedback(card, isCorrect) {
    // Удаляем предыдущие стили
    card.classList.remove('border-green-500', 'border-red-500', 'border-2');
    
    // Добавляем новые стили правильно
    card.classList.add('border-2', isCorrect ? 'border-green-500' : 'border-red-500');
    
    // Создаем элемент обратной связи
    const feedback = document.createElement('div');
    feedback.className = 'absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm font-semibold ' + 
                        (isCorrect ? 'text-green-500' : 'text-red-500');
    feedback.textContent = isCorrect ? '+15' : '-7';
    
    card.appendChild(feedback);
    
    // Удаляем feedback через 1.5 секунды
    setTimeout(() => {
        feedback.remove();
        card.classList.remove('border-2', 'border-green-500', 'border-red-500');
    }, 1500);
}

function startTimer() {
    timerInterval = setInterval(() => {
        secondsLeft--;
        document.getElementById('timer').textContent = secondsLeft;
        
        if(secondsLeft <= 0) {
            clearInterval(timerInterval);
            finishLevel(true);
        }
    }, 1000);
}

function updateUI() {
    const stats = getCurrentStats();
    document.getElementById('current-score').textContent = stats.scores[2];
    if(currentStage <= 3 ) {
        document.getElementById('progress').textContent = `${currentStage}/3`;
    }
}

function finishLevel(timeout = false) {
    clearInterval(timerInterval);
    completeLevel(2);

    if(timeout) {
        alert('Время вышло! Возвращаемся в меню');
        window.location.href = '../index.html';
    } else {
        const stats = getCurrentStats();
        const nextLevel = stats.completedLevels >= 3 ? '../index.html' : 'level3.html';
        window.location.href = nextLevel;
    }
}

document.getElementById('logout-btn').addEventListener('click', () => {
    clearInterval(timerInterval);
    localStorage.removeItem('username');
    window.location.href = '../index.html';
});