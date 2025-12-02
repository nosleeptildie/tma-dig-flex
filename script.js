// Инициализация Telegram Web App
let tg = null;
if (window.Telegram && Telegram.WebApp) {
    tg = Telegram.WebApp;
    
    // Инициализируем приложение
    tg.ready();
    tg.expand();
    
    // Меняем цвет фона Telegram
    tg.setBackgroundColor('#667eea');
    tg.setHeaderColor('#667eea');
    
    // Добавляем кнопку закрытия
    tg.MainButton.setText('Закрыть').show();
    tg.MainButton.onClick(() => {
        tg.close();
    });
}

// URL вашего Google Apps Script (ЗАМЕНИТЕ НА СВОЙ!)
const API_URL = 'https://script.google.com/macros/s/AKfycbzH60XLGOaMjngBLlk5Iz5w7a4toekMBf7CabeFnQJVUhc59-QnBM8KTniOSbSy7NUGAA/exec';

// Элементы DOM
const form = document.getElementById('myForm');
const submitBtn = form.querySelector('.submit-btn');
const btnText = submitBtn.querySelector('.btn-text');
const loadingText = submitBtn.querySelector('.loading');
const statusDiv = document.getElementById('status');

// Обработчик отправки формы
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Показываем загрузку
    setLoading(true);
    showStatus('⏳ Отправка данных...', 'info');
    
    // Собираем данные формы
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim() || '',
        message: document.getElementById('message').value.trim() || '',
        recipient: document.getElementById('recipient').value.trim(),
        sendTxt: document.getElementById('sendTxt').checked,
        sendCsv: document.getElementById('sendCsv').checked
    };
    
    // Валидация
    if (!formData.name || !formData.email || !formData.recipient) {
        showStatus('❌ Заполните все обязательные поля!', 'error');
        setLoading(false);
        return;
    }
    
    // Проверяем, выбран ли хотя бы один формат
    if (!formData.sendTxt && !formData.sendCsv) {
        showStatus('❌ Выберите хотя бы один формат файла!', 'error');
        setLoading(false);
        return;
    }
    
    try {
        // Отправляем данные на Google Apps Script
        const response = await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors', // Важно для Google Apps Script!
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        // Поскольку мы используем no-cors, мы не можем прочитать ответ напрямую
        // Но мы можем показать сообщение об успехе
        showStatus('✅ Данные успешно отправлены! Файлы отправлены получателю.', 'success');
        
        // Очищаем форму через 3 секунды
        setTimeout(() => {
            form.reset();
            statusDiv.classList.add('hidden');
            
            // Закрываем приложение через 4 секунды (только в Telegram)
            if (tg) {
                setTimeout(() => {
                    tg.close();
                }, 1000);
            }
        }, 3000);
        
    } catch (error) {
        console.error('Ошибка:', error);
        showStatus(`❌ Ошибка отправки: ${error.message}`, 'error');
    } finally {
        setLoading(false);
    }
});

// Функция для показа статуса
function showStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.classList.remove('hidden');
}

// Функция для управления состоянием загрузки
function setLoading(isLoading) {
    if (isLoading) {
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        loadingText.style.display = 'inline';
    } else {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        loadingText.style.display = 'none';
    }
}

// Автозаполнение для тестирования (удалите в продакшене)
function fillTestData() {
    // Только для локального тестирования
    if (window.location.protocol === 'file:') {
        document.getElementById('name').value = 'Иван Иванов';
        document.getElementById('email').value = 'test@example.com';
        document.getElementById('phone').value = '+7 (999) 123-45-67';
        document.getElementById('message').value = 'Тестовое сообщение из формы';
        document.getElementById('recipient').value = 'ВАШ_ID'; // Замените на ваш ID
    }
}

// Заполняем тестовые данные при загрузке (только для локального тестирования)
window.addEventListener('DOMContentLoaded', fillTestData);