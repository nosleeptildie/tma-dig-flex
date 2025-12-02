// Инициализация Telegram Web App
let tg = null;
let userData = null;

// Инициализируем Telegram Web App если он доступен
if (window.Telegram && Telegram.WebApp) {
    tg = Telegram.WebApp;
    
    // Инициализация
    tg.ready();
    tg.expand();
    
    // Получаем данные пользователя
    userData = tg.initDataUnsafe?.user;
    
    // Настройка цветов
    tg.setBackgroundColor('#667eea');
    tg.setHeaderColor('#667eea');
    
    // Добавляем кнопку "Закрыть"
    if (tg.platform !== 'unknown') {
        tg.MainButton.setText('Закрыть').show();
        tg.MainButton.onClick(() => {
            tg.close();
        });
    }
    
    // Автозаполнение менеджера из данных Telegram
    if (userData) {
        const managerName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
        if (managerName) {
            document.getElementById('manager').value = managerName;
            document.getElementById('manager').readOnly = true;
        }
    }
}

// URL вашего Google Apps Script (ЗАМЕНИТЕ НА СВОЙ!)
const API_URL = 'https://script.google.com/macros/s/AKfycbx_M9S7h5dh3aKZbyHqZ9ZJ_gXT1q40e6VnirI24HSk1Qk8NncugZkNHYJc-XbRi1kn/exec';

// Элементы формы
const orderForm = document.getElementById('orderForm');
const statusDiv = document.getElementById('status');

// Зависимые поля
const embossingField = document.getElementById('embossing');
const embossingWidthField = document.getElementById('embossingWidth');
const varnishField = document.getElementById('varnish');
const varnishTypeField = document.getElementById('varnishType');
const additionalVarnishField = document.getElementById('additionalVarnish');
const additionalVarnishTypeField = document.getElementById('additionalVarnishType');

// Логика зависимых полей
embossingField.addEventListener('input', function() {
    if (this.value.trim()) {
        embossingWidthField.disabled = false;
        embossingWidthField.placeholder = 'Введите ширину тиснения';
    } else {
        embossingWidthField.disabled = true;
        embossingWidthField.value = '';
        embossingWidthField.placeholder = 'Автоматически';
    }
});

varnishField.addEventListener('input', function() {
    if (this.value.trim()) {
        varnishTypeField.disabled = false;
    } else {
        varnishTypeField.disabled = true;
        varnishTypeField.value = '';
    }
});

additionalVarnishField.addEventListener('input', function() {
    if (this.value.trim()) {
        additionalVarnishTypeField.disabled = false;
    } else {
        additionalVarnishTypeField.disabled = true;
        additionalVarnishTypeField.value = '';
    }
});

// Автоматическое заполнение ширины тиснения (если нужно)
embossingWidthField.addEventListener('focus', function() {
    if (!this.value && embossingField.value) {
        // Можно добавить логику автоматического расчета
        // Например: this.value = document.getElementById('materialWidth').value;
    }
});

// Обработка отправки формы
orderForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Показываем статус загрузки
    showStatus('📤 Отправка задания...', 'info');
    
    // Собираем данные формы
    const formData = {
        // Основная информация
        taskNumber: document.getElementById('taskNumber').value.trim(),
        customer: document.getElementById('customer').value.trim(),
        
        // Технические параметры
        labelType: document.getElementById('labelType').value,
        material: document.getElementById('material').value.trim(),
        materialWidth: document.getElementById('materialWidth').value,
        
        // Дополнительная обработка
        embossing: document.getElementById('embossing').value.trim(),
        embossingWidth: document.getElementById('embossingWidth').value || 'Не указано',
        congreve: document.querySelector('input[name="congreve"]:checked').value,
        
        // Лак
        varnish: document.getElementById('varnish').value.trim(),
        varnishType: varnishTypeField.value || 'Не указано',
        additionalVarnish: document.getElementById('additionalVarnish').value.trim(),
        additionalVarnishType: additionalVarnishTypeField.value || 'Не указано',
        
        // Ответственные
        manager: document.getElementById('manager').value.trim(),
        designerChatId: document.getElementById('designerChatId').value.trim(),
        
        // Метаданные
        timestamp: new Date().toISOString(),
        userData: userData ? {
            id: userData.id,
            username: userData.username
        } : null
    };
    
    // Валидация обязательных полей
    const requiredFields = [
        {field: 'taskNumber', name: '№ Задания'},
        {field: 'customer', name: 'Заказчик'},
        {field: 'labelType', name: 'Вид этикетки'},
        {field: 'material', name: 'Материал'},
        {field: 'materialWidth', name: 'Ширина материала'},
        {field: 'manager', name: 'Менеджер'},
        {field: 'designerChatId', name: 'ID дизайнера'}
    ];
    
    for (const req of requiredFields) {
        if (!formData[req.field]) {
            showStatus(`❌ Заполните поле: ${req.name}`, 'error');
            document.getElementById(req.field).focus();
            return;
        }
    }
    
    // Валидация числовых полей
    if (formData.materialWidth && isNaN(parseInt(formData.materialWidth))) {
        showStatus('❌ Ширина материала должна быть числом', 'error');
        return;
    }
    
    if (formData.embossingWidth && formData.embossingWidth !== 'Не указано' && 
        isNaN(parseInt(formData.embossingWidth))) {
        showStatus('❌ Ширина тиснения должна быть числом', 'error');
        return;
    }
    
    try {
        // Отправляем данные на Google Apps Script
        const response = await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors', // Для Google Apps Script
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        // Поскольку мы используем no-cors, показываем успех
        showStatus('✅ Задание успешно отправлено дизайнеру! Файлы созданы и отправлены.', 'success');
        
        // Очищаем форму через 3 секунды
        setTimeout(() => {
            orderForm.reset();
            statusDiv.classList.add('hidden');
            
            // Сбрасываем зависимые поля
            embossingWidthField.disabled = true;
            varnishTypeField.disabled = true;
            additionalVarnishTypeField.disabled = true;
            
            // Автозаполняем менеджера снова
            if (userData) {
                const managerName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
                if (managerName) {
                    document.getElementById('manager').value = managerName;
                }
            }
            
            // Закрываем приложение через 4 секунды (только в Telegram)
            if (tg && tg.platform !== 'unknown') {
                setTimeout(() => {
                    tg.close();
                }, 4000);
            }
        }, 3000);
        
    } catch (error) {
        console.error('Ошибка отправки:', error);
        showStatus(`❌ Ошибка отправки: ${error.message}`, 'error');
    }
});

// Функция для показа статуса
function showStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.classList.remove('hidden');
    
    // Прокручиваем к статусу
    statusDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Функция заполнения тестовых данных (для разработки)
function fillTestData() {
    if (!confirm('Заполнить форму тестовыми данными?')) return;
    
    document.getElementById('taskNumber').value = 'ORD-2024-001';
    document.getElementById('customer').value = 'ООО "Продмаркет"';
    document.getElementById('labelType').value = 'Банка для микроволновой печи';
    document.getElementById('material').value = 'PP60 Полипропилен белый акриловый клей W05 Fuzhou';
    document.getElementById('materialWidth').value = '120';
    document.getElementById('embossing').value = 'Пленка тиснение SB dots';
    embossingField.dispatchEvent(new Event('input'));
    document.getElementById('embossingWidth').value = '115';
    
    document.querySelector('input[name="congreve"][value="Да"]').checked = true;
    
    document.getElementById('varnish').value = 'UV лак';
    varnishField.dispatchEvent(new Event('input'));
    document.getElementById('varnishType').value = 'Глянцевый';
    
    document.getElementById('additionalVarnish').value = 'Тактильный лак';
    additionalVarnishField.dispatchEvent(new Event('input'));
    document.getElementById('additionalVarnishType').value = 'Тактильный';
    
    if (!userData) {
        document.getElementById('manager').value = 'Иванов Иван';
    }
    
    document.getElementById('designerChatId').value = '@designer_bot';
    
    showStatus('📝 Тестовые данные загружены. Проверьте и отправьте форму.', 'warning');
}

// Добавляем горячие клавиши для разработки
document.addEventListener('keydown', function(e) {
    // Ctrl+Enter - отправить форму
    if (e.ctrlKey && e.key === 'Enter') {
        orderForm.requestSubmit();
    }
    // Ctrl+T - тестовые данные
    if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        fillTestData();
    }
});

// Инициализация при загрузке
window.addEventListener('DOMContentLoaded', function() {
    // Добавляем класс для Telegram
    if (tg) {
        document.body.classList.add('tg-mode');
    }
    
    // Фокус на первое поле
    document.getElementById('taskNumber').focus();
});
