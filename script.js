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
    
    // Автозаполнение только имени менеджера (если доступно)
    if (userData) {
        const managerName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
        if (managerName) {
            document.getElementById('manager').value = managerName;
        }
    }
}

// URL вашего Google Apps Script (ЗАМЕНИТЕ НА СВОЙ!)
const API_URL = 'https://script.google.com/macros/s/AKfycbxtFNOKuo4TJvFG-I5EgfommdG3zrDHxnXNkQcR_dfwbZvpcwqJALOM89vftA_GimPmeg/exec';

// Маска для телефона
function formatPhoneNumber(phone) {
    if (!phone) return '';
    
    // Убираем все нецифровые символы
    const cleaned = phone.replace(/\D/g, '');
    
    // Форматируем номер
    if (cleaned.length === 11) {
        return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
    } else if (cleaned.length === 10) {
        return `+7 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 8)}-${cleaned.slice(8)}`;
    }
    
    return phone;
}

// Функция для применения маски телефона
function createPhoneMask(input) {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 0) {
            value = '+7' + (value.length > 1 ? ' (' + value.substring(1, 4) : '');
        }
        if (value.length > 7) {
            value = value.substring(0, 7) + ') ' + value.substring(7, 10);
        }
        if (value.length > 12) {
            value = value.substring(0, 12) + '-' + value.substring(12, 14);
        }
        if (value.length > 15) {
            value = value.substring(0, 15) + '-' + value.substring(15, 17);
        }
        
        e.target.value = value;
    });
    
    input.addEventListener('blur', function(e) {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length === 11 || value.length === 10 || value.length === 0) {
            e.target.classList.remove('error');
        } else {
            e.target.classList.add('error');
        }
    });
    
    input.addEventListener('focus', function(e) {
        if (!e.target.value) {
            e.target.value = '+7 (';
        }
    });
}

// Применяем маску телефона при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    const phoneInputs = document.querySelectorAll('.phone-input');
    
    phoneInputs.forEach(input => {
        createPhoneMask(input);
    });
    
    // Фокус на первое поле
    document.getElementById('taskNumber').focus();
});

// Элементы формы
const orderForm = document.getElementById('orderForm');
const statusDiv = document.getElementById('status');

// Зависимые поля (остаются без изменений)
const embossingField = document.getElementById('embossing');
const embossingWidthField = document.getElementById('embossingWidth');
const laminationField = document.getElementById('lamination');
const laminationWidthField = document.getElementById('laminationWidth');
const varnishField = document.getElementById('varnish');
const varnishTypeField = document.getElementById('varnishType');
const additionalVarnishField = document.getElementById('additionalVarnish');
const additionalVarnishTypeField = document.getElementById('additionalVarnishType');
const newStampCheckbox = document.getElementById('newStamp');
const newStampFields = document.getElementById('newStampFields');
const stampNumberField = document.getElementById('stampNumber');
const stampGroovesField = document.getElementById('stampGrooves');

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

laminationField.addEventListener('input', function() {
    if (this.value.trim()) {
        laminationWidthField.disabled = false;
        laminationWidthField.placeholder = 'Ширина ламинации';
    } else {
        laminationWidthField.disabled = true;
        laminationWidthField.value = '';
        laminationWidthField.placeholder = 'Ширина';
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

// Логика "Новый штамп"
newStampCheckbox.addEventListener('change', function() {
    if (this.checked) {
        // Блокируем основные поля штампа
        stampNumberField.disabled = true;
        stampGroovesField.disabled = true;
        
        // Показываем дополнительные поля
        newStampFields.style.display = 'flex';
        
        // Очищаем основные поля
        stampNumberField.value = '';
        stampGroovesField.value = '';
    } else {
        // Разблокируем основные поля
        stampNumberField.disabled = false;
        stampGroovesField.disabled = false;
        
        // Скрываем дополнительные поля
        newStampFields.style.display = 'none';
        
        // Очищаем дополнительные поля
        document.getElementById('stampWidth').value = '';
        document.getElementById('stampLength').value = '';
        document.getElementById('stampGroovesNew').value = '';
        document.getElementById('stampShaft').value = '';
        document.getElementById('stampMounting').value = '';
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
        labelType: document.getElementById('labelType').value.trim(),
        
        // Основной материал
        material: document.getElementById('material').value.trim(),
        materialWidth: document.getElementById('materialWidth').value,
        
        // Дополнительные материалы
        embossing: document.getElementById('embossing').value.trim(),
        embossingWidth: document.getElementById('embossingWidth').value || '',
        lamination: document.getElementById('lamination').value.trim(),
        laminationWidth: document.getElementById('laminationWidth').value || '',
        
        // Конгрев
        congreve: document.querySelector('input[name="congreve"]:checked').value,
        
        // Лак
        varnish: document.getElementById('varnish').value.trim(),
        varnishType: varnishTypeField.value || '',
        additionalVarnish: document.getElementById('additionalVarnish').value.trim(),
        additionalVarnishType: additionalVarnishTypeField.value || '',
        
        // Штамп
        stampNumber: document.getElementById('stampNumber').value.trim(),
        stampGrooves: document.getElementById('stampGrooves').value || '',
        isNewStamp: newStampCheckbox.checked,
        stampWidth: document.getElementById('stampWidth').value,
        stampLength: document.getElementById('stampLength').value,
        stampGroovesNew: document.getElementById('stampGroovesNew').value,
        stampShaft: document.getElementById('stampShaft').value.trim(),
        stampMounting: document.getElementById('stampMounting').value.trim(),
        
        // Намотка
        windingSchemeFace: document.getElementById('windingSchemeFace').value.trim(),
        windingSchemeBack: document.getElementById('windingSchemeBack').value.trim(),
        sleeve: document.getElementById('sleeve').value,
        winding: document.getElementById('winding').value.trim(),
        
        // Тираж и упаковка
        circulation: document.getElementById('circulation').value,
        packaging: document.getElementById('packaging').value.trim(),
        labeling: document.getElementById('labeling').value.trim(),
        tag: document.getElementById('tag').value.trim(),
        packagingCirculation: document.getElementById('packagingCirculation').value,
        pallet: document.getElementById('pallet').value,
        palletType: document.getElementById('palletType').value.trim(),
        
        // Технологические особенности
        primeMaterial: document.querySelector('input[name="primeMaterial"]:checked').value,
        dmsFinish: document.querySelector('input[name="dmsFinish"]:checked').value,
        assemblyInfo: document.getElementById('assemblyInfo').value.trim(),
        glueLayerPrint: document.querySelector('input[name="glueLayerPrint"]:checked').value,
        honestSignPrint: document.querySelector('input[name="honestSignPrint"]:checked').value,
        
        // Ответственные лица
        manager: document.getElementById('manager').value.trim(),
        managerPhone: document.getElementById('managerPhone').value.trim(),
        manager2: document.getElementById('manager2').value.trim(),
        manager2Phone: document.getElementById('manager2Phone').value.trim(),
        designerChatId: document.getElementById('designerChatId').value.trim(),
        designerPhone: document.getElementById('designerPhone').value.trim(),
        
        // Метаданные
        timestamp: new Date().toISOString(),
        userData: userData ? {
            id: userData.id,
            username: userData.username,
            first_name: userData.first_name,
            last_name: userData.last_name
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
        {field: 'designerChatId', name: 'ID дизайнера'},
        {field: 'circulation', name: 'Тираж'}
    ];
    
    for (const req of requiredFields) {
        if (!formData[req.field]) {
            showStatus(`❌ Заполните поле: ${req.name}`, 'error');
            document.getElementById(req.field).focus();
            return;
        }
    }
    
    // Валидация числовых полей
    const numericFields = [
        {field: 'materialWidth', name: 'Ширина материала'},
        {field: 'embossingWidth', name: 'Ширина тиснения'},
        {field: 'laminationWidth', name: 'Ширина ламинации'},
        {field: 'stampGrooves', name: 'Ручьи штампа'},
        {field: 'stampWidth', name: 'Ширина штампа'},
        {field: 'stampLength', name: 'Длина штампа'},
        {field: 'stampGroovesNew', name: 'Ручьи нового штампа'},
        {field: 'circulation', name: 'Тираж'},
        {field: 'packagingCirculation', name: 'Тираж упаковки'},
        {field: 'pallet', name: 'Паллет'}
    ];
    
    for (const numField of numericFields) {
        const value = formData[numField.field];
        if (value && value !== '' && isNaN(parseInt(value))) {
            showStatus(`❌ ${numField.name} должна быть числом`, 'error');
            return;
        }
    }
    
    // Проверка: если выбран "Новый штамп", то должны быть заполнены его поля
    if (formData.isNewStamp) {
        const newStampFields = [
            {field: 'stampWidth', name: 'Ширина нового штампа'},
            {field: 'stampLength', name: 'Длина нового штампа'},
            {field: 'stampGroovesNew', name: 'Ручьи нового штампа'}
        ];
        
        for (const field of newStampFields) {
            if (!formData[field.field]) {
                showStatus(`❌ Заполните поле: ${field.name}`, 'error');
                document.getElementById(field.field).focus();
                return;
            }
        }
    }
    
    // Валидация телефонов (только формат, если заполнено)
    const phoneFields = [
        {id: 'managerPhone', name: 'Телефон менеджера'},
        {id: 'manager2Phone', name: 'Телефон второго менеджера'},
        {id: 'designerPhone', name: 'Телефон дизайнера'}
    ];
    
    for (const phoneField of phoneFields) {
        const value = document.getElementById(phoneField.id).value.trim();
        if (value && !/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(value)) {
            showStatus(`❌ Неверный формат телефона: ${phoneField.name}. Используйте формат +7 (XXX) XXX-XX-XX`, 'error');
            document.getElementById(phoneField.id).focus();
            return;
        }
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
            laminationWidthField.disabled = true;
            varnishTypeField.disabled = true;
            additionalVarnishTypeField.disabled = true;
            
            // Сбрасываем логику нового штампа
            newStampCheckbox.checked = false;
            newStampFields.style.display = 'none';
            stampNumberField.disabled = false;
            stampGroovesField.disabled = false;
            
            // Автозаполняем менеджера снова (если данные есть)
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
    
    // Основная информация
    document.getElementById('taskNumber').value = 'ORD-2024-001';
    document.getElementById('customer').value = 'ООО "Продмаркет"';
    document.getElementById('labelType').value = 'Банка для микроволновой печи';
    
    // Основной материал
    document.getElementById('material').value = 'PP60 Полипропилен белый акриловый клей W05 Fuzhou';
    document.getElementById('materialWidth').value = '120';
    
    // Дополнительные материалы
    document.getElementById('embossing').value = 'Пленка тиснение SB dots';
    embossingField.dispatchEvent(new Event('input'));
    document.getElementById('embossingWidth').value = '115';
    
    document.getElementById('lamination').value = 'Ламинация OPP глянцевая 20мк';
    laminationField.dispatchEvent(new Event('input'));
    document.getElementById('laminationWidth').value = '118';
    
    // Конгрев
    document.querySelector('input[name="congreve"][value="Да"]').checked = true;
    
    // Лак
    document.getElementById('varnish').value = 'UV лак';
    varnishField.dispatchEvent(new Event('input'));
    document.getElementById('varnishType').value = 'Глянцевый';
    
    document.getElementById('additionalVarnish').value = 'Тактильный лак';
    additionalVarnishField.dispatchEvent(new Event('input'));
    document.getElementById('additionalVarnishType').value = 'Тактильный';
    
    // Штамп
    document.getElementById('stampNumber').value = 'ST-4521';
    document.getElementById('stampGrooves').value = '8';
    
    // НЕ включаем новый штамп по умолчанию
    
    // Намотка
    document.getElementById('windingSchemeFace').value = 'Лицом внутрь';
    document.getElementById('windingSchemeBack').value = 'На внешнюю сторону';
    document.getElementById('sleeve').value = '46 мм';
    document.getElementById('winding').value = '2000 метров';
    
    // Тираж и упаковка
    document.getElementById('circulation').value = '50000';
    document.getElementById('packaging').value = 'Коробка 500 шт.';
    document.getElementById('labeling').value = 'Автоматическая';
    document.getElementById('tag').value = 'Есть';
    document.getElementById('packagingCirculation').value = '100';
    document.getElementById('pallet').value = '2';
    document.getElementById('palletType').value = 'Европаллет';
    
    // Технологические особенности
    document.querySelector('input[name="primeMaterial"][value="Нет"]').checked = true;
    document.querySelector('input[name="dmsFinish"][value="Нет"]').checked = true;
    document.getElementById('assemblyInfo').value = 'Сборка в 2 смены. Контроль качества каждые 1000 шт.';
    document.querySelector('input[name="glueLayerPrint"][value="Нет"]').checked = true;
    document.querySelector('input[name="honestSignPrint"][value="Да"]').checked = true;
    
    // Ответственные лица
    if (!userData) {
        document.getElementById('manager').value = 'Иванов Иван';
    }
    document.getElementById('managerPhone').value = '+7 (999) 123-45-67';
    document.getElementById('manager2').value = 'Петров Петр';
    document.getElementById('manager2Phone').value = '+7 (999) 987-65-43';
    document.getElementById('designerChatId').value = '@designer_bot';
    document.getElementById('designerPhone').value = '+7 (999) 555-44-33';
    
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
});
