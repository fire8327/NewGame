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


/* функция предзагрузки изображений автомобилей */
const initializePreload = async () => {
    try { // асинхронно загружает изображения. 
        preloadedImages = await Promise.all(
            carBrands.map(async brand => {
                const img = new Image();
                img.src = `../Assets/Images/level1-2/${brand.image}`;
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve; // при ошибке загрузки продолжаем
                });
                return { ...brand, element: img };
            })
        );
    } catch (error) { // в случае ошибки использует заглушку
        console.error('Ошибка предзагрузки:', error);
        preloadedImages = carBrands.map(brand => ({
            ...brand,
            element: { src: `https://via.placeholder.com/200/374151/fff?text=${brand.answer.toUpperCase()}` }
        }));
    }
};

/* запуск игры после загрузки страницы */
document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('username')) { // проверяет, авторизован ли пользователь
        window.location.href = '../index.html';
        return;
    }

    try { 
        // инициализирует загрузку изображений
        await initializePreload();
        document.getElementById('username').textContent = localStorage.getItem('username');
        //Запускает новый этап и таймер
        await startNewStage();
        startTimer();
        updateUI();
    } catch (error) {
        console.error('Ошибка инициализации:', error);
        alert('Ошибка загрузки уровня!');
    }
});

/* начало нового этапа */
async function startNewStage() {
    const randomBrand = carBrands[Math.floor(Math.random() * carBrands.length)]; // выбирает случайную марку, которую нужно найти
    targetBrand = randomBrand.answer;
    document.getElementById('target-brand').textContent = targetBrand;
    
    const cars = generateCarSet(); // генерирует набор машин для выбора и отображает их на экране
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
        .slice(0, 7); // включает 1 правильный вариант и 7 случайных неправильных

    return [...wrongCars, correctCar].sort(() => Math.random() - 0.5); // перемешивает массив перед отображением
}

/* отображение машин на экране */
async function renderCars(cars) {
    const grid = document.getElementById('cars-grid');
    grid.innerHTML = '';
    correctCarId = null;

    cars.forEach((car, index) => {
        if (car.answer === targetBrand) correctCarId = index;

        // создает карточки с изображениями автомобилей

        const card = document.createElement('div');
        card.className = 'relative group rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105';
        
        const img = document.createElement('img');
        img.className = 'w-full object-cover rounded-xl aspect-video opacity-80';
        img.src = car.element.src;
        img.alt = car.answer;
        
        img.onerror = () => {
            img.src = `https://via.placeholder.com/200/374151/fff?text=${car.answer.toUpperCase()}`;
        };

        card.appendChild(img);
        card.addEventListener('click', () => handleCarClick(card, index)); // добавляет обработчик клика
        grid.appendChild(card);
    });

    isProcessing = false;
}

/* проверка ответа */
function handleCarClick(card, index) {
    if(isProcessing || !secondsLeft) return;
    isProcessing = true;

    const isCorrect = index === correctCarId;
    const stats = getCurrentStats();
    const newScore = Math.max(stats.scores[2] + (isCorrect ? 15 : -10), 0); // если ответ правильный, начисляются баллы
    updateLevelStats(newScore - stats.scores[2], 2);

    showFeedback(card, isCorrect);
    currentStage++;

    setTimeout(() => {
        if(currentStage <= 3 && secondsLeft > 0) {
            startNewStage();
        } else {
            finishLevel(); // после 3 этапов уровень завершается
        }
        updateUI();
        isProcessing = false;
    }, 1500);
}

/* функция фидбека */
function showFeedback(card, isCorrect) {
    // удаляем предыдущие стили, если они были добавлены ранее
    card.classList.remove('border-green-500', 'border-red-500', 'border-2');
    
    // добавляем рамку соответствующего цвета в зависимости от правильности ответа
    card.classList.add('border-2', isCorrect ? 'border-green-500' : 'border-red-500');
    
    // создаем элемент для отображения числового значения очков
    const feedback = document.createElement('div');
    feedback.className = 'absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm font-semibold ' + 
                        (isCorrect ? 'text-green-500' : 'text-red-500');
    
    // отображаем +15 очков за правильный ответ и -10 за ошибку
    feedback.textContent = isCorrect ? '+15' : '-10';
    
    // добавляем созданный элемент внутрь карточки
    card.appendChild(feedback);
    
    // через 1.5 секунды удаляем обратную связь и сбрасываем стили
    setTimeout(() => {
        feedback.remove(); // удаляем текстовый элемент с очками
        card.classList.remove('border-2', 'border-green-500', 'border-red-500'); // сбрасываем стили рамки
    }, 1500);
}

/* запуск таймера */
function startTimer() {
    // запускаем таймер, который каждую секунду уменьшает количество оставшегося времени
    timerInterval = setInterval(() => {
        secondsLeft--; // уменьшаем оставшиеся секунды
        document.getElementById('timer').textContent = secondsLeft; // обновляем UI таймера
        
        // если время закончилось, останавливаем таймер и завершаем уровень
        if(secondsLeft <= 0) {
            clearInterval(timerInterval);
            finishLevel(true); // передаем параметр true, чтобы обозначить окончание из-за таймера
        }
    }, 1000);
}

/* обновление интерфейса */
function updateUI() {
    // получаем текущую статистику игрока
    const stats = getCurrentStats();
    
    // обновляем текущий счет в интерфейсе
    document.getElementById('current-score').textContent = stats.scores[2];
    
    // если уровень еще идет, обновляем прогресс
    if(currentStage <= 3 ) {
        document.getElementById('progress').textContent = `${currentStage}/3`;
    }
}


/* окончание уровня */
function finishLevel(timeout = false) {
    // останавливаем таймер, так как уровень завершается
    clearInterval(timerInterval);
    
    // отмечаем уровень как завершенный
    completeLevel(2);
    
    if(timeout) {
        // если уровень завершился из-за истечения времени, уведомляем игрока и возвращаем в меню
        alert('Время вышло! Возвращаемся в меню');
        window.location.href = '../index.html';
    } else {
        // получаем обновленную статистику после завершения уровня
        const stats = getCurrentStats();
        
        // если игрок прошел три уровня, отправляем его в меню, иначе на следующий уровень
        const nextLevel = stats.completedLevels >= 3 ? '../index.html' : 'level3.html';
        window.location.href = nextLevel;
    }
}

/* обработчик выхода из аккаунта */
document.getElementById('logout-btn').addEventListener('click', () => {
    clearInterval(timerInterval); // останавливаем таймер при выходе
    localStorage.removeItem('username'); // удаляем имя пользователя из локального хранилища
    window.location.href = '../index.html'; // перенаправляем на главную страницу
});
