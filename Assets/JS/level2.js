import { getCurrentStats, updateLevelStats, completeLevel, updateRating } from './stats.js';

/* создание массива машин и правильных ответов */
const carBrands = [
    { image: 'audi.jpg', answer: 'audi' },
    { image: 'bmw.jpg', answer: 'bmw' },
    { image: 'mercedes.jpg', answer: 'mercedes' },
    { image: 'toyota.jpg', answer: 'toyota' },
    { image: 'tesla.jpg', answer: 'tesla' },
    { image: 'opel.jpg', answer: 'opel' },
    { image: 'honda.jpg', answer: 'honda' },
    { image: 'nissan.jpg', answer: 'nissan' }
];

/* конфигурация уровня: */
let currentStage = 1; // текущий этап (всего 3 этапа)
let targetBrand = ''; // правильный ответ (марка автомобиля, которую нужно найти)
let isProcessing = false; // блокировка ввода во время проверки ответа
let correctCarId = null; // индекс правильного автомобиля среди предложенных
let secondsLeft = 40; // оставшееся время на уровень
let timerInterval = null; // идентификатор интервала таймера
let preloadedImages = []; // массив предзагруженных изображений автомобилей
let shuffleInterval = null; // интервал для перемешивания карточек
let visibilityInterval = null; // интервал для скрытия/показа карточек

/* функция предзагрузки изображений автомобилей */
const initializePreload = async () => {
    try {
        preloadedImages = await Promise.all(
            carBrands.map(async brand => {
                const img = new Image();
                img.src = `../Assets/Images/level1-2/${brand.image}`;
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve;
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

/* запуск игры после загрузки страницы */
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
        shuffleInterval = setInterval(shuffleCars, 3000); // Перемешивание каждые 3 секунды
        visibilityInterval = setInterval(toggleVisibility, 3000); // Скрытие/показ каждые 3 секунды
        updateUI();
    } catch (error) {
        console.error('Ошибка инициализации:', error);
        alert('Ошибка загрузки уровня!');
    }

    // Обработчик для кнопки добавления 10 секунд
    document.getElementById('add-time-btn').addEventListener('click', () => {
        secondsLeft += 10;
        document.getElementById('timer').textContent = secondsLeft;
    });
});

/* начало нового этапа */
async function startNewStage() {
    const randomBrand = carBrands[Math.floor(Math.random() * carBrands.length)];
    targetBrand = randomBrand.answer;
    document.getElementById('target-brand').textContent = targetBrand;
    
    const cars = generateCarSet();
    if (cars.length === 8) {
        await renderCars(cars);
    } else {
        alert('Ошибка генерации автомобилей!');
    }
}

/* генерация набора машин для выбора */
function generateCarSet() {
    const correctCar = preloadedImages.find(img => img.answer === targetBrand);
    if (!correctCar) return [];

    const wrongCars = preloadedImages
        .filter(img => img.answer !== targetBrand)
        .sort(() => Math.random() - 0.5)
        .slice(0, 7);

    return [...wrongCars, correctCar].sort(() => Math.random() - 0.5);
}

/* отображение машин на экране */
async function renderCars(cars) {
    const grid = document.getElementById('cars-grid');
    grid.innerHTML = '';
    correctCarId = null;

    cars.forEach((car, index) => {
        if (car.answer === targetBrand) correctCarId = index;

        const card = document.createElement('div');
        card.className = 'relative group rounded-xl overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-xl hover:scale-105 duration-500';
        
        const img = document.createElement('img');
        img.className = 'w-full object-cover rounded-xl aspect-video opacity-80';
        img.src = car.element.src;
        img.alt = car.answer;
        
        img.onerror = () => {
            img.src = `https://via.placeholder.com/200/374151/fff?text=${car.answer.toUpperCase()}`;
        };

        card.appendChild(img);
        card.addEventListener('click', () => handleCarClick(card, index));
        grid.appendChild(card);
    });

    isProcessing = false;
}

/* проверка ответа */
function handleCarClick(card, index) {
    if (isProcessing || !secondsLeft) return;
    isProcessing = true;

    const isCorrect = index === correctCarId;
    const stats = getCurrentStats();
    const newScore = Math.max(stats.scores[2] + (isCorrect ? 15 : -10), 0);
    updateLevelStats(newScore - stats.scores[2], 2);

    showFeedback(card, isCorrect);
    currentStage++;

    setTimeout(() => {
        if (currentStage <= 3 && secondsLeft > 0) {
            startNewStage();
        } else {
            finishLevel();
        }
        updateUI();
        isProcessing = false;
    }, 1500);
}

/* функция фидбека */
function showFeedback(card, isCorrect) {
    card.classList.remove('border-green-500', 'border-red-500', 'border-2');
    card.classList.add('border-2', isCorrect ? 'border-green-500' : 'border-red-500');
    
    const feedback = document.createElement('div');
    feedback.className = 'absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm font-semibold ' + 
                        (isCorrect ? 'text-green-500' : 'text-red-500');
    feedback.textContent = isCorrect ? '+15' : '-10';
    
    card.appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
        card.classList.remove('border-2', 'border-green-500', 'border-red-500');
    }, 1500);
}

/* запуск таймера */
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

/* обновление интерфейса */
function updateUI() {
    const stats = getCurrentStats();
    document.getElementById('current-score').textContent = stats.scores[2];
    if (currentStage <= 3) {
        document.getElementById('progress').textContent = `${currentStage}/3`;
    }
}

/* окончание уровня */
function finishLevel(timeout = false) {
    clearInterval(timerInterval);
    clearInterval(shuffleInterval);
    clearInterval(visibilityInterval);
    
    completeLevel(2);
    
    if (timeout) {
        alert('Время вышло! Возвращаемся в меню');
        window.location.href = '../index.html';
    } else {
        window.location.href = 'level3.html';
    }
}

/* обработчик выхода из аккаунта */
document.getElementById('logout-btn').addEventListener('click', () => {
    clearInterval(timerInterval);
    clearInterval(shuffleInterval);
    clearInterval(visibilityInterval);
    localStorage.removeItem('username');
    window.location.href = '../index.html';
});

/* перемешивание карточек */
function shuffleCars() {
    const grid = document.getElementById('cars-grid');
    const cards = Array.from(grid.children);
    cards.sort(() => Math.random() - 0.5);
    grid.innerHTML = '';
    cards.forEach(card => grid.appendChild(card));
}

/* скрытие и показ карточек с плавностью */
function toggleVisibility() {
    const grid = document.getElementById('cars-grid');
    const cards = Array.from(grid.children);
    
    // Очищаем предыдущие классы opacity-0, чтобы избежать накопления
    cards.forEach(card => card.classList.remove('opacity-0'));

    // Выбираем две случайные карточки для скрытия
    const indicesToHide = [];
    while (indicesToHide.length < 2) {
        const randomIndex = Math.floor(Math.random() * cards.length);
        if (!indicesToHide.includes(randomIndex)) indicesToHide.push(randomIndex);
    }
    
    // Скрываем выбранные карточки
    indicesToHide.forEach(index => {
        cards[index].classList.add('opacity-0');
    });
    
    // Показываем их обратно через 1.5 секунды
    setTimeout(() => {
        indicesToHide.forEach(index => {
            cards[index].classList.remove('opacity-0');
        });
    }, 1500);
}