// Инициализация Telegram Web App
let tg = null;
let userData = null;

// База данных дизайнеров
const designers = [
    { id: '791492230', name: 'Терентьева Ольга' },
    { id: '413467082', name: 'Единаров Ярослав' },
    { id: '1816427861', name: 'Матвеев Кирилл' },
    { id: '5087715870', name: 'Хомук Руслан' },
    { id: '661613105', name: 'Шумбасова Анна' },
    { id: '366712040', name: 'Шишкин Николай' },
    { id: '248499588', name: 'Баринова Екатерина' },
    { id: '320990168', name: 'Терёшкина Лариса' },
    { id: '723455002', name: 'Газиева Яна' },
    { id: '6310697497', name: 'Харченко Ксения' },
    { id: '1632767010', name: 'Яценко Евгений' },
    { id: '857533822', name: 'Безрукова Алина' },
    { id: '1864384994', name: 'Копытина Мария' },
    { id: '514603293', name: 'Носкова Дарья' },
    { id: '5863381965', name: 'Марина Грачева' },
    { id: '883530646', name: 'Ольга Васильева' },
    { id: '1651346316', name: 'Науменко Дарья' },
    { id: '1476981358', name: 'Корягов Никита' },
    { id: '5552272589', name: 'Шишкин Артем' },
    { id: '724459109', name: 'Гаврилова Арина' },
    { id: '7607076011', name: 'Куимов Антон' },
    { id: '861844930', name: 'Берсенева Дарья' },
    { id: '5262339639', name: 'Смолова Анастасия' },
    { id: '776183124', name: 'Клочкова Анастасия' },
    { id: '5035848386', name: 'Боронников Игорь' },
    { id: '2103182079', name: 'Тест' }
];

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
        }
    }
}

// URL вашего Google Apps Script (ЗАМЕНИТЕ НА СВОЙ!)
const API_URL = 'https://script.google.com/macros/s/AKfycbwn3BReNyhQvlCf_qq0CRKfgfvPF33RyuHKsJMEKJ4mbeWZfTXls9zO0CZSpXEhVZ_KTw/exec';

// Элементы формы
const orderForm = document.getElementById('orderForm');
const statusDiv = document.getElementById('status');

// Элементы для лаков
const varnishSelect = document.getElementById('varnish');
const varnishTypeField = document.getElementById('varnishType');
const additionalVarnishSelect = document.getElementById('additionalVarnish');
const additionalVarnishTypeField = document.getElementById('additionalVarnishType');

// Элемент для выбора дизайнера
const designerSelect = document.getElementById('designerSelect');
const designerChatIdField = document.getElementById('designerChatId');

// Новые элементы (селекторы намотки)
const windingSchemeFaceSelect = document.getElementById('windingSchemeFace');
const windingSchemeBackSelect = document.getElementById('windingSchemeBack');

// Зависимые поля (остальные без изменений)
const embossingField = document.getElementById('embossing');
const embossingWidthField = document.getElementById('embossingWidth');
const laminationField = document.getElementById('lamination');
const laminationWidthField = document.getElementById('laminationWidth');
const newStampCheckbox = document.getElementById('newStamp');
const newStampFields = document.getElementById('newStampFields');
const stampNumberField = document.getElementById('stampNumber');
const stampGroovesField = document.getElementById('stampGrooves');

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Заполняем список дизайнеров
    populateDesignerList();
    
    // Инициализируем логику лаков
    initVarnishLogic();
    
    // Инициализируем маски телефонов
    initPhoneMasks();
    
    // Инициализируем остальную логику
    initDependentFields();
    
    // Добавляем класс для Telegram
    if (tg) {
        document.body.classList.add('tg-mode');
    }
    
    // Фокус на первое поле
    document.getElementById('taskNumber').focus();
});

// Заполнение списка дизайнеров
function populateDesignerList() {
    designers.forEach(designer => {
        const option = document.createElement('option');
        option.value = designer.id;
        option.textContent = designer.name;
        designerSelect.appendChild(option);
    });
    
    // Обработчик выбора дизайнера
    designerSelect.addEventListener('change', function() {
        designerChatIdField.value = this.value;
    });
}

// Логика для лаков
function initVarnishLogic() {
    // Лак
    varnishSelect.addEventListener('change', function() {
        if (this.value && this.value !== 'Нет') {
            varnishTypeField.disabled = false;
            varnishTypeField.placeholder = 'Введите вид лака...';
        } else {
            varnishTypeField.disabled = true;
            varnishTypeField.value = '';
            varnishTypeField.placeholder = 'Глянцевый, матовый, тактильный...';
        }
    });
    
    // Доп. лак
    additionalVarnishSelect.addEventListener('change', function() {
        if (this.value && this.value !== 'Нет') {
            additionalVarnishTypeField.disabled = false;
            additionalVarnishTypeField.placeholder = 'Введите вид доп. лака...';
        } else {
            additionalVarnishTypeField.disabled = true;
            additionalVarnishTypeField.value = '';
            additionalVarnishTypeField.placeholder = 'Глянцевый, матовый, тактильный...';
        }
    });
}

// Инициализация масок телефонов
function initPhoneMasks() {
    const phoneInputs = document.querySelectorAll('.phone-input');
    
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 0) {
                if (value.length === 1 && value[0] === '7') {
                    e.target.value = '+7';
                } else if (value.length === 1 && value[0] !== '7') {
                    e.target.value = '+7 (' + value;
                } else if (value.length <= 4) {
                    e.target.value = '+7 (' + value.substring(1, 4);
                } else if (value.length <= 7) {
                    e.target.value = '+7 (' + value.substring(1, 4) + ') ' + value.substring(4, 7);
                } else if (value.length <= 9) {
                    e.target.value = '+7 (' + value.substring(1, 4) + ') ' + value.substring(4, 7) + '-' + value.substring(7, 9);
                } else {
                    e.target.value = '+7 (' + value.substring(1, 4) + ') ' + value.substring(4, 7) + '-' + value.substring(7, 9) + '-' + value.substring(9, 11);
                }
            }
        });
        
        input.addEventListener('focus', function(e) {
            if (!e.target.value) {
                e.target.value = '+7 (';
            }
        });
        
        input.addEventListener('blur', function(e) {
            if (e.target.value === '+7 (') {
                e.target.value = '';
            }
            
            // Валидация формата
            const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
            if (e.target.value && !phoneRegex.test(e.target.value)) {
                e.target.classList.add('error');
            } else {
                e.target.classList.remove('error');
            }
        });
    });
}

// Инициализация зависимых полей
function initDependentFields() {
    // Тиснение
    embossingField.addEventListener('input', function() {
        embossingWidthField.disabled = !this.value.trim();
        embossingWidthField.placeholder = this.value.trim() ? 'Введите ширину тиснения' : 'Автоматически';
    });
    
    // Ламинация
    laminationField.addEventListener('input', function() {
        laminationWidthField.disabled = !this.value.trim();
        laminationWidthField.placeholder = this.value.trim() ? 'Ширина ламинации' : 'Ширина';
    });
    
    // Новый штамп
    newStampCheckbox.addEventListener('change', function() {
        const isChecked = this.checked;
        stampNumberField.disabled = isChecked;
        stampGroovesField.disabled = isChecked;
        newStampFields.style.display = isChecked ? 'flex' : 'none';
        
        if (isChecked) {
            stampNumberField.value = '';
            stampGroovesField.value = '';
        }
    });
}

// Обработка отправки формы
orderForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Показываем статус загрузки
    showStatus('📤 Отправка задания...', 'info');
    
    // Собираем данные формы (ОБНОВЛЕНО)
    const formData = {
        // Основная информация
        taskNumber: document.getElementById('taskNumber').value.trim(),
        customer: document.getElementById('customer').value.trim(),
        labelType: document.getElementById('labelType').value.trim(),
        
        // Основной материал
        material: document.getElementById('material').value.trim(),
        materialWidth: document.getElementById('materialWidth').value,
        
        // Дополнительные материалы
        embossing: embossingField.value.trim(),
        embossingWidth: embossingWidthField.value || '',
        lamination: laminationField.value.trim(),
        laminationWidth: laminationWidthField.value || '',
        
        // Лак (ОБНОВЛЕНО)
        varnish: varnishSelect.value,
        varnishType: varnishTypeField.value.trim(),
        additionalVarnish: additionalVarnishSelect.value,
        additionalVarnishType: additionalVarnishTypeField.value.trim(),
        
        // Штамп
        stampNumber: document.getElementById('stampNumber').value.trim(),
        stampGrooves: document.getElementById('stampGrooves').value || '',
        isNewStamp: newStampCheckbox.checked,
        stampWidth: document.getElementById('stampWidth').value,
        stampLength: document.getElementById('stampLength').value,
        stampGroovesNew: document.getElementById('stampGroovesNew').value,
        stampShaft: document.getElementById('stampShaft').value.trim(),
        stampMounting: document.getElementById('stampMounting').value.trim(),
        
        // Намотка (ОБНОВЛЕНО)
        windingSchemeFace: windingSchemeFaceSelect.value,
        windingSchemeBack: windingSchemeBackSelect.value,
        sleeve: document.getElementById('sleeve').value,
        winding: document.getElementById('winding').value.trim(),
        
        // Тираж и упаковка (ОБНОВЛЕНО)
        circulation: document.getElementById('circulation').value,
        packaging: document.getElementById('packaging').value,
        labeling: document.querySelector('input[name="labeling"]:checked').value,
        tag: document.querySelector('input[name="tag"]:checked').value,
        packagingCirculation: document.querySelector('input[name="packagingCirculation"]:checked').value,
        pallet: document.getElementById('pallet').value,
        
        // Технологические особенности (ОБНОВЛЕНО: добавлен Конгрев)
        congreve: document.querySelector('input[name="congreve"]:checked').value,
        primeMaterial: document.querySelector('input[name="primeMaterial"]:checked').value,
        dmsFinish: document.querySelector('input[name="dmsFinish"]:checked').value,
        assemblyInfo: document.getElementById('assemblyInfo').value.trim(),
        glueLayerPrint: document.querySelector('input[name="glueLayerPrint"]:checked').value,
        honestSignPrint: document.querySelector('input[name="honestSignPrint"]:checked').value,
        
        // Поля технолога
        printingMachine: document.getElementById('printingMachine').value || '',
        formMaterial: document.getElementById('formMaterial').value.trim() || '',
        tapeType: document.getElementById('tapeType').value.trim() || '',
        
        // Ответственные лица (ОБНОВЛЕНО)
        manager: document.getElementById('manager').value.trim(),
        managerPhone: document.getElementById('managerPhone').value.trim(),
        manager2: document.getElementById('manager2').value.trim(),
        manager2Phone: document.getElementById('manager2Phone').value.trim(),
        designerName: designerSelect.options[designerSelect.selectedIndex]?.textContent || '',
        designerChatId: designerChatIdField.value,
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
        {field: 'designerChatId', name: 'Дизайнер'},
        {field: 'circulation', name: 'Тираж'}
    ];
    
    for (const req of requiredFields) {
        if (!formData[req.field]) {
            showStatus(`❌ Заполните поле: ${req.name}`, 'error');
            document.getElementById(req.field === 'designerChatId' ? 'designerSelect' : req.field).focus();
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
    
    // Валидация телефонов
    const phoneFields = [
        {id: 'managerPhone', name: 'Телефон менеджера'},
        {id: 'manager2Phone', name: 'Телефон второго менеджера'},
        {id: 'designerPhone', name: 'Телефон дизайнера'}
    ];
    
    const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    for (const phoneField of phoneFields) {
        const value = document.getElementById(phoneField.id).value.trim();
        if (value && !phoneRegex.test(value)) {
            showStatus(`❌ Неверный формат телефона: ${phoneField.name}. Используйте формат +7 (XXX) XXX-XX-XX`, 'error');
            document.getElementById(phoneField.id).focus();
            return;
        }
    }
    
    try {
        // Отправляем данные на Google Apps Script
        const response = await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        // Показываем успех
        showStatus('✅ Задание успешно отправлено дизайнеру! Файлы созданы и отправлены.', 'success');
        
        // Очищаем форму через 3 секунды
        setTimeout(() => {
            orderForm.reset();
            statusDiv.classList.add('hidden');
            
            // Сбрасываем зависимые поля
            varnishTypeField.disabled = true;
            additionalVarnishTypeField.disabled = true;
            embossingWidthField.disabled = true;
            laminationWidthField.disabled = true;
            newStampCheckbox.checked = false;
            newStampFields.style.display = 'none';
            stampNumberField.disabled = false;
            stampGroovesField.disabled = false;
            
            // Заполняем менеджера снова
            if (userData) {
                const managerName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
                if (managerName) {
                    document.getElementById('manager').value = managerName;
                }
            }
            
            // Закрываем приложение через 4 секунды
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

// Функция заполнения тестовых данных (ОБНОВЛЕНО)
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
    
    // Лак (ОБНОВЛЕНО)
    varnishSelect.value = 'UV лак';
    varnishSelect.dispatchEvent(new Event('change'));
    document.getElementById('varnishType').value = 'Глянцевый';
    
    additionalVarnishSelect.value = 'Ламинация';
    additionalVarnishSelect.dispatchEvent(new Event('change'));
    document.getElementById('additionalVarnishType').value = 'Матовый';
    
    // Штамп
    document.getElementById('stampNumber').value = 'ST-4521';
    document.getElementById('stampGrooves').value = '8';
    
    // Намотка (ОБНОВЛЕНО)
    windingSchemeFaceSelect.value = 'Лицом внутрь';
    windingSchemeBackSelect.value = 'Оборотной стороной наружу';
    document.getElementById('sleeve').value = '46 мм';
    document.getElementById('winding').value = '2000 метров';
    
    // Тираж и упаковка (ОБНОВЛЕНО)
    document.getElementById('circulation').value = '50000';
    document.getElementById('packaging').value = 'Коробка 500 шт.';
    document.querySelector('input[name="labeling"][value="Автоматическая"]').checked = true;
    document.querySelector('input[name="tag"][value="Гамма (наш)"]').checked = true;
    document.querySelector('input[name="packagingCirculation"][value="Строго по заявленному кол-ву"]').checked = true;
    document.getElementById('pallet').value = '2';
    
    // Технологические особенности (ОБНОВЛЕНО)
    document.querySelector('input[name="congreve"][value="Да"]').checked = true;
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
    
    // Выбираем дизайнера
    designerSelect.value = '661613105'; // ID Шумбасовой Анны
    designerSelect.dispatchEvent(new Event('change'));
    
    document.getElementById('designerPhone').value = '+7 (999) 555-44-33';
    
    showStatus('📝 Тестовые данные загружены. Проверьте и отправьте форму.', 'warning');
}

// Горячие клавиши
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
        orderForm.requestSubmit();
    }
    if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        fillTestData();
    }
});
