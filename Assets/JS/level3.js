// Определяем список брендов (4 бренда сверху)
const brands = [
    { name: 'Audi', key: 'audi', image: 'audi.jpg' },
    { name: 'BMW', key: 'bmw', image: 'bmw.jpg' },
    { name: 'Mercedes', key: 'mercedes', image: 'mercedes.jpg' },
    { name: 'Toyota', key: 'toyota', image: 'toyota.jpg' }
];

// Ложное изображение для запутывания
const falseBrand = { name: 'Tesla', key: 'tesla', image: 'tesla.jpg' };

// Переменные для игры
let timerInterval = null;
let secondsLeft = 30;
let score = 0;
let correctMatches = 0;
let draggedItem = null;

// Запуск игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('username')) {
        window.location.href = '../index.html';
        return;
    }

    document.getElementById('username').textContent = localStorage.getItem('username');
    initGame();
    startTimer();

    // Кнопка добавления времени
    document.getElementById('add-time-btn').addEventListener('click', () => {
        secondsLeft += 10;
        document.getElementById('timer').textContent = secondsLeft;
    });

    // Запуск перемешивания и скрытия изображений каждые 3 секунды
    setInterval(shuffleAndHideCars, 3000);
});

// Инициализация игры
function initGame() {
    const brandsContainer = document.getElementById('brands-container');
    brands.forEach(brand => {
        const card = document.createElement('div');
        card.className = 'brand-card rounded-xl p-4 text-center border-2 border-dashed border-gray-600';
        card.dataset.brand = brand.key;

        const title = document.createElement('div');
        title.className = 'text-xl font-bold text-[#4D6BFE] mb-2';
        title.textContent = brand.name;

        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone h-32 flex items-center justify-center';

        card.appendChild(title);
        card.appendChild(dropZone);
        brandsContainer.appendChild(card);
    });

    const carsContainer = document.getElementById('cars-container');
    const allCars = [...brands, falseBrand]; // 5 автомобилей (4 бренда + 1 ложный)
    allCars.sort(() => Math.random() - 0.5).forEach(brand => {
        const item = document.createElement('div');
        item.className = 'drag-item rounded-xl cursor-move overflow-hidden hover:shadow-xl transition-all duration-500';
        item.draggable = true;
        item.dataset.brand = brand.key;

        const img = document.createElement('img');
        img.className = 'w-full aspect-video object-cover pointer-events-none';
        img.src = `../Assets/Images/level3/${brand.image}`;
        img.alt = brand.name;

        img.onerror = () => {
            img.src = `https://via.placeholder.com/150/374151/fff?text=${brand.name.toUpperCase()}`;
        };

        item.appendChild(img);
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        carsContainer.appendChild(item);
    });

    document.querySelectorAll('.brand-card').forEach(card => {
        card.addEventListener('dragover', handleDragOver);
        card.addEventListener('dragleave', handleDragLeave);
        card.addEventListener('drop', handleDrop);
    });

    // Вращение случайного изображения каждые 5 секунд
    setInterval(rotateRandomCar, 5000);
}

// Обработчики перетаскивания
function handleDragStart(e) {
    if (secondsLeft <= 0) return;
    draggedItem = e.target.closest('.drag-item');
    draggedItem.classList.add('opacity-50', 'scale-90');
}

function handleDragEnd(e) {
    if (!draggedItem) return;
    draggedItem.classList.remove('opacity-50', 'scale-90');
    draggedItem = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('border-[#4D6BFE]');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('border-[#4D6BFE]');
}

function handleDrop(e) {
    e.preventDefault();
    const brandCard = e.currentTarget;
    brandCard.classList.remove('border-[#4D6BFE]');

    if (!draggedItem || secondsLeft <= 0) return;

    const carBrand = draggedItem.dataset.brand;
    const targetBrand = brandCard.dataset.brand;

    if (!carBrand || !targetBrand) {
        console.error('Ошибка данных:', { carBrand, targetBrand });
        return;
    }

    const isCorrect = carBrand === targetBrand;

    if (isCorrect) {
        score += 20;
        correctMatches++;
        const dropZone = brandCard.querySelector('.drop-zone');
        dropZone.innerHTML = '';
        dropZone.appendChild(draggedItem);
        draggedItem.classList.add('animate-match');
        draggedItem.draggable = false;
        showFeedback(brandCard, 'Правильно! +20', 'green');
    } else {
        score = Math.max(score - 15, 0);
        showFeedback(brandCard, 'Неверно! -15', 'red');
        setTimeout(() => {
            const carsContainer = document.getElementById('cars-container');
            carsContainer.appendChild(draggedItem);
        }, 500);
    }

    updateLevelStats(score - getCurrentStats().scores[3], 3);
    document.getElementById('current-score').textContent = score;

    if (correctMatches === brands.length) finishLevel();
}

// Обратная связь
function showFeedback(element, message, color) {
    const feedback = document.createElement('div');
    feedback.className = `absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-${color}-500`;
    feedback.textContent = message;

    element.appendChild(feedback);
    setTimeout(() => feedback.remove(), 1500);
}

// Таймер
function startTimer() {
    timerInterval = setInterval(() => {
        secondsLeft--;
        document.getElementById('timer').textContent = secondsLeft;

        if (secondsLeft <= 0) {
            clearInterval(timerInterval);
            finishLevel(true);
        }
    }, 1000);
}

// Завершение уровня
function finishLevel(timeout = false) {
    clearInterval(timerInterval);
    completeLevel(3);

    if (timeout) {
        showFeedback(document.body, 'Время вышло!', 'red');
    }

    const stats = getCurrentStats();
    if (correctMatches === brands.length) {
        updateRating(localStorage.getItem('username'), 
            stats.scores[1] + stats.scores[2] + stats.scores[3]);
    }

    document.getElementById('show-results').disabled = false;
}

// Обработчики кнопок
document.getElementById('show-results').addEventListener('click', () => {
    window.location.href = 'rating.html';
});

document.getElementById('logout-btn').addEventListener('click', () => {
    clearInterval(timerInterval);
    localStorage.removeItem('username');
    window.location.href = '../index.html';
});

// Обновление счета при загрузке
document.addEventListener('DOMContentLoaded', () => {
    const stats = getCurrentStats();
    document.getElementById('current-score').textContent = stats.scores[3];
});

// Вращение случайного изображения
function rotateRandomCar() {
    const carsContainer = document.getElementById('cars-container');
    const items = Array.from(carsContainer.children);
    const randomIndex = Math.floor(Math.random() * items.length);
    const randomItem = items[randomIndex];

    randomItem.classList.add('animate-spin');
    setTimeout(() => randomItem.classList.remove('animate-spin'), 2000);
}

// Перемешивание и скрытие изображений
function shuffleAndHideCars() {
    const carsContainer = document.getElementById('cars-container');
    const items = Array.from(carsContainer.children);

    // Перемешивание
    items.sort(() => Math.random() - 0.5);
    carsContainer.innerHTML = '';
    items.forEach(item => carsContainer.appendChild(item));

    // Скрытие случайного изображения
    const randomIndex = Math.floor(Math.random() * items.length);
    const randomItem = items[randomIndex];
    randomItem.classList.add('opacity-0');
    setTimeout(() => randomItem.classList.remove('opacity-0'), 1500);
}