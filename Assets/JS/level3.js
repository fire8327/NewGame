import { getCurrentStats, updateLevelStats, completeLevel, updateRating } from './stats.js';

/* определяем список брендов с их названиями, ключами и изображениями */
const brands = [
    { name: 'Audi', key: 'audi', image: 'audi.jpg' },
    { name: 'BMW', key: 'bmw', image: 'bmw.jpg' },
    { name: 'Mercedes', key: 'mercedes', image: 'mercedes.jpg' },
    { name: 'Toyota', key: 'toyota', image: 'toyota.jpg' }
];

/* объявляем переменные для таймера, очков, количества правильных совпадений и текущего перетаскиваемого элемента */
let timerInterval = null;
let secondsLeft = 30;
let score = 0;
let correctMatches = 0;
let draggedItem = null;

/* запускаем игру при загрузке страницы */
document.addEventListener('DOMContentLoaded', () => {
    // если пользователя нет в localStorage, перенаправляем на главную страницу
    if (!localStorage.getItem('username')) {
        window.location.href = '../index.html';
        return;
    }

    // устанавливаем имя пользователя и запускаем игру
    document.getElementById('username').textContent = localStorage.getItem('username');
    initGame();
    startTimer();
});

/* функция для инициализации игры */
function initGame() {
    // создаем карточки брендов
    const brandsContainer = document.getElementById('brands-container');
    brands.forEach(brand => {
        const card = document.createElement('div');
        card.className = 'brand-card rounded-xl p-4 text-center border-2 border-dashed border-gray-600';
        card.dataset.brand = brand.key;
        
        const title = document.createElement('div');
        title.className = 'text-xl font-bold text-blue-400 mb-2';
        title.textContent = brand.name;
        
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone h-32 flex items-center justify-center';
        
        card.appendChild(title);
        card.appendChild(dropZone);
        brandsContainer.appendChild(card);
    });

    // создаем перетаскиваемые изображения автомобилей
    const carsContainer = document.getElementById('cars-container');
    brands.sort(() => Math.random() - 0.5).forEach(brand => {
        const item = document.createElement('div');
        item.className = 'drag-item rounded-xl cursor-move overflow-hidden hover:shadow-xl';
        item.draggable = true;
        item.dataset.brand = brand.key; // Привязываем ключ бренда
        
        const img = document.createElement('img');
        img.className = 'w-full aspect-video object-cover pointer-events-none';
        img.src = `../Assets/Images/level3/${brand.image}`;
        img.alt = brand.name;
        
        // обработчик ошибки загрузки изображения (замена на заглушку)
        img.onerror = () => {
            img.src = `https://via.placeholder.com/150/374151/fff?text=${brand.name.toUpperCase()}`;
        };
    
        item.appendChild(img);
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        carsContainer.appendChild(item);
    });

    // назначаем обработчики событий на карточки брендов
    document.querySelectorAll('.brand-card').forEach(card => {
        card.addEventListener('dragover', handleDragOver);
        card.addEventListener('dragleave', handleDragLeave);
        card.addEventListener('drop', handleDrop);
    });
}

/* обработчик начала перетаскивания */
function handleDragStart(e) {
    if(secondsLeft <= 0) return;
    draggedItem = e.target.closest('.drag-item'); // Находим ближайший родительский элемент
    draggedItem.classList.add('opacity-50', 'scale-90'); // Добавляем эффекты
}

/* обработчик завершения перетаскивания */
function handleDragEnd(e) {
    if(!draggedItem) return;
    draggedItem.classList.remove('opacity-50', 'scale-90');
    draggedItem = null;
}

/* обработчик наведения на зону сброса */
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500');
}

/* обработчик ухода из зоны сброса */
function handleDragLeave(e) {
    e.currentTarget.classList.remove('border-blue-500');
}

/* обработчик сброса элемента в зону бренда */
function handleDrop(e) {
    e.preventDefault();
    const brandCard = e.currentTarget;
    brandCard.classList.remove('border-blue-500');
    
    if(!draggedItem || secondsLeft <= 0) return;
    
    const carBrand = draggedItem.dataset.brand;
    const targetBrand = brandCard.dataset.brand;

    if(!carBrand || !targetBrand) {
        console.error('Ошибка данных:', {carBrand, targetBrand});
        return;
    }

    // проверяем, правильно ли размещен автомобиль
    const isCorrect = carBrand === targetBrand;
    
    if(isCorrect) {
        score += 20;
        correctMatches++;
        const dropZone = brandCard.querySelector('.drop-zone');
        dropZone.innerHTML = ''; // Очищаем зону
        dropZone.appendChild(draggedItem);
        draggedItem.classList.add('animate-match');
        draggedItem.draggable = false;
        showFeedback(brandCard, 'Правильно! +20', 'green');
    } else {
        score = Math.max(score - 15, 0);
        showFeedback(brandCard, 'Неверно! -15', 'red');
        // возвращаем элемент на место
        setTimeout(() => {
            const carsContainer = document.getElementById('cars-container');
            carsContainer.appendChild(draggedItem);
        }, 500);
    }

    updateLevelStats(score - getCurrentStats().scores[3], 3);
    document.getElementById('current-score').textContent = score;

    // если все бренды размещены правильно, завершаем уровень
    if(correctMatches === brands.length) finishLevel();
}

/* функция отображения сообщений обратной связи */
function showFeedback(element, message, color) {
    const feedback = document.createElement('div');
    feedback.className = `absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-${color}-500`;
    feedback.textContent = message;
    
    element.appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
    }, 1500);
}

/* запуск таймера */
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

/* завершение уровня */
function finishLevel(timeout = false) {
    clearInterval(timerInterval);
    completeLevel(3);

    if(timeout) {
        showFeedback(document.body, 'Время вышло!', 'red');
    }
    
    // обновляем рейтинг игрока
    const stats = getCurrentStats();
    if(correctMatches === brands.length) {
        updateRating(localStorage.getItem('username'), 
            stats.scores[1] + stats.scores[2] + stats.scores[3]);
    }
    
    document.getElementById('show-results').disabled = false;
}

/* обработчик кнопки "Показать результаты" */
document.getElementById('show-results').addEventListener('click', () => {
    window.location.href = 'rating.html';
});

/* обработчик выхода из игры */
document.getElementById('logout-btn').addEventListener('click', () => {
    clearInterval(timerInterval);
    localStorage.removeItem('username');
    window.location.href = '../index.html';
});

/* обновление текущего счета при загрузке страницы */
document.addEventListener("DOMContentLoaded", () => {
    const stats = getCurrentStats();
    document.getElementById('current-score').textContent = stats.scores[3];
});
