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

/* конфигурация уровня */
let currentStage = 1; // стадия игры
let currentCar = null; // текущий автомобиль для вопроса
let isProcessing = false; // флаг для предотвращения множественных нажатий

/* предзагрузка изображений */
const preloadedImages = [];
carBrands.forEach(brand => {
    const img = new Image();
    img.src = `../Assets/Images/level1-2/${brand.image}`;
    preloadedImages.push(img);
});

/* загрузка страницы и проверка наличия пользователя */
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('username')) {
        window.location.href = '../index.html'; // редирект, если нет имени пользователя
        return;
    }
    
    document.getElementById('username').textContent = localStorage.getItem('username'); // отображение имени
    loadNewQuestion(); // загрузка первого вопроса
    setupEventListeners(); // настройка обработчиков событий
    updateUI(); // обновление интерфейса
});

/* загрузка нового вопроса */
function loadNewQuestion() {
    currentCar = carBrands[Math.floor(Math.random() * carBrands.length)]; // случайный выбор машины
    document.getElementById('car-image').src = preloadedImages.find(
        img => img.src.endsWith(currentCar.image)
    ).src; // установка изображения
    document.getElementById('answer-input').value = ''; // очистка поля ввода
    document.getElementById('answer-input').focus(); // фокус на поле ввода
    isProcessing = false; // сброс флага обработки
}

/* настройка обработчиков событий */
function setupEventListeners() {
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.clear(); // очистка данных пользователя
        window.location.href = '../index.html'; // редирект на главную страницу
    });

    document.getElementById('action-btn').addEventListener('click', async () => {
        if (!isProcessing) await checkAnswer(); // проверка ответа при клике
    });

    document.getElementById('answer-input').addEventListener('keypress', async (e) => {
        if (e.key === 'Enter' && !isProcessing) await checkAnswer(); // проверка ответа при нажатии Enter
    });
}

/* проверка ответа пользователя */
async function checkAnswer() {
    isProcessing = true; // установка флага обработки
    const userAnswer = document.getElementById('answer-input').value.trim().toLowerCase(); // получение и обработка ответа
    const isCorrect = userAnswer === currentCar.answer; // сравнение с правильным ответом

    // обновление очков с защитой от отрицательных значений
    const currentScore = getCurrentStats().scores[1] || 0;
    const newScore = Math.max(currentScore + (isCorrect ? 10 : -5), 0);
    updateLevelStats(newScore - currentScore, 1);

    showFeedback(isCorrect); // отображение сообщения о результате
    await new Promise(resolve => setTimeout(resolve, 3000)); // задержка перед продолжением

    currentStage++; // увеличение стадии
    
    if (currentStage <= 3) {
        loadNewQuestion(); // загрузка нового вопроса, если не последний этап
    } else {
        completeLevel(1); // завершение уровня
        const stats = getCurrentStats();
        if (stats.completedLevels === 3) {
            updateRating(localStorage.getItem('username'), 
                Object.values(stats.scores).reduce((a, b) => a + b, 0)); // обновление рейтинга
        }
        window.location.href = 'level2.html'; // переход на следующий уровень
    }
    
    updateUI(); // обновление интерфейса
}

/* отображение сообщения о результате ответа */
function showFeedback(isCorrect) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = isCorrect 
        ? 'Правильно! +10 баллов' 
        : `Неверно! -5 баллов. Правильный ответ: ${currentCar.answer}`; // сообщение о правильности ответа
    feedback.className = `text-center px-4 py-2 rounded-lg transition-opacity ${
        isCorrect ? 'text-green-500' : 'text-red-500'
    }`; // изменение стиля текста
    setTimeout(() => {
        feedback.className = 'opacity-0'; // скрытие сообщения через 1.5 секунды
    }, 3000);
}

/* обновление пользовательского интерфейса */
function updateUI() {
    const stats = getCurrentStats();
    document.getElementById('current-score').textContent = stats.scores[1] || 0; // обновление очков
    if (currentStage <= 3) {
        document.getElementById('progress').textContent = `${currentStage}/3`; // обновление индикатора прогресса
    }
}
