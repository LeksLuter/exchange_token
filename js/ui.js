/* js/ui.js */
// js/ui.js
// Используем глобальный walletManager. tokenListManager будет доступен из window позже.
const walletManager = window.walletManager;

class UIManager {
    static showSuccessMessage(message) {
        const messageContainer = document.getElementById("messageContainer");
        if (!messageContainer) {
            console.error("Элемент messageContainer не найден для showSuccessMessage");
            return;
        }
        
        messageContainer.innerHTML = `<div class="success-message">${message}</div>`;
        setTimeout(() => {
            messageContainer.innerHTML = "";
        }, 5000);
    }
    
    static showErrorMessage(message) {
        const messageContainer = document.getElementById("messageContainer");
        if (!messageContainer) {
            console.error("Элемент messageContainer не найден для showErrorMessage");
            return;
        }
        
        messageContainer.innerHTML = `<div class="error-message">${message}</div>`;
        setTimeout(() => {
            messageContainer.innerHTML = "";
        }, 5000);
    }
    
    static showWarningMessage(message) {
        const messageContainer = document.getElementById("messageContainer");
        if (!messageContainer) {
            console.error("Элемент messageContainer не найден для showWarningMessage");
            return;
        }
        
        messageContainer.innerHTML = `<div class="warning-message">${message}</div>`;
        setTimeout(() => {
            messageContainer.innerHTML = "";
        }, 5000);
    }
    
    static showInstallationInstructions() {
        const messageContainer = document.getElementById("messageContainer");
        if (!messageContainer) {
            console.error("Элемент messageContainer не найден для showInstallationInstructions");
            return;
        }
        
        const instructions = document.createElement("div");
        instructions.className = "instructions";
        instructions.innerHTML = `
            <h4>Инструкция по установке MetaMask:</h4>
            <ol>
                <li>Нажмите кнопку "Установить MetaMask" ниже</li>
                <li>Перейдите в магазин расширений вашего браузера</li>
                <li>Установите расширение MetaMask</li>
                <li>Перезагрузите браузер</li>
                <li>Обновите эту страницу</li>
            </ol>
        `;
        messageContainer.appendChild(instructions);
    }
    
    // Новый метод для обновления выпадающих списков токенов
    static updateTokenSelects() {
        console.log("=== Обновление выпадающих списков токенов ===");
        
        // Получаем элементы для старых токенов
        const oldTokenSelect = document.getElementById('oldTokenSelect');
        const adminOldTokenSelect = document.getElementById('adminOldTokenSelect');
        const oldTokenList = document.getElementById('oldTokenList');
        
        // Получаем элементы для новых токенов
        const newTokenSelect = document.getElementById('newTokenSelect');
        const adminNewTokenSelect = document.getElementById('adminNewTokenSelect');
        const newTokenList = document.getElementById('newTokenList');
        
        // Очищаем все списки
        if (oldTokenSelect) oldTokenSelect.innerHTML = '';
        if (adminOldTokenSelect) adminOldTokenSelect.innerHTML = '';
        if (oldTokenList) oldTokenList.innerHTML = '';
        
        if (newTokenSelect) newTokenSelect.innerHTML = '';
        if (adminNewTokenSelect) adminNewTokenSelect.innerHTML = '';
        if (newTokenList) newTokenList.innerHTML = '';
        
        // Заполняем опции для старых токенов
        if (window.tokenListManager && typeof window.tokenListManager.getTokens === 'function') {
            console.log("Заполняем опции для старых токенов...");
            const oldTokens = window.tokenListManager.getTokens('old');
            
            oldTokens.forEach((token, index) => {
                // Создаем опцию для выпадающего списка на странице обмена
                if (oldTokenSelect) {
                    const option = document.createElement('option');
                    option.value = token.contract;
                    option.textContent = `${token.name} (${token.symbol})`;
                    option.dataset.name = token.name;
                    option.dataset.symbol = token.symbol;
                    oldTokenSelect.appendChild(option);
                }
                
                // Создаем опцию для выпадающего списка на странице админки
                if (adminOldTokenSelect) {
                    const option = document.createElement('option');
                    option.value = token.contract;
                    option.textContent = `${token.name} (${token.symbol})`;
                    option.dataset.name = token.name;
                    option.dataset.symbol = token.symbol;
                    adminOldTokenSelect.appendChild(option);
                }
                
                // Создаем элемент для списка токенов на странице админки
                if (oldTokenList) {
                    const tokenItem = document.createElement('div');
                    tokenItem.className = 'token-list-item';
                    tokenItem.innerHTML = `
                        <div class="token-info">
                            <div class="token-name">${token.name}</div>
                            <div class="token-address">${token.contract.substring(0,6)}...${token.contract.substring(38)}</div>
                        </div>
                        <div class="token-symbol">${token.symbol}</div>
                    `;
                    oldTokenList.appendChild(tokenItem);
                }
            });
        } else {
            console.error("window.tokenListManager или его метод getTokens недоступен для старых токенов");
        }
        
        // Заполняем опции для новых токенов
        if (window.tokenListManager && typeof window.tokenListManager.getTokens === 'function') {
            console.log("Заполняем опции для новых токенов...");
            const newTokens = window.tokenListManager.getTokens('new');
            
            newTokens.forEach((token, index) => {
                // Создаем опцию для выпадающего списка на странице обмена
                if (newTokenSelect) {
                    const option = document.createElement('option');
                    option.value = token.contract;
                    option.textContent = `${token.name} (${token.symbol})`;
                    option.dataset.name = token.name;
                    option.dataset.symbol = token.symbol;
                    newTokenSelect.appendChild(option);
                }
                
                // Создаем опцию для выпадающего списка на странице админки
                if (adminNewTokenSelect) {
                    const option = document.createElement('option');
                    option.value = token.contract;
                    option.textContent = `${token.name} (${token.symbol})`;
                    option.dataset.name = token.name;
                    option.dataset.symbol = token.symbol;
                    adminNewTokenSelect.appendChild(option);
                }
                
                // Создаем элемент для списка токенов на странице админки
                if (newTokenList) {
                    const tokenItem = document.createElement('div');
                    tokenItem.className = 'token-list-item';
                    tokenItem.innerHTML = `
                        <div class="token-info">
                            <div class="token-name">${token.name}</div>
                            <div class="token-address">${token.contract.substring(0,6)}...${token.contract.substring(38)}</div>
                        </div>
                        <div class="token-symbol">${token.symbol}</div>
                    `;
                    newTokenList.appendChild(tokenItem);
                }
            });
        } else {
            console.error("window.tokenListManager или его метод getTokens недоступен для новых токенов");
        }
        
        console.log("Выпадающие списки токенов обновлены");
    }
    
    // Новый метод для открытия модального окна добавления токена
    static openAddTokenModal(targetType) {
        console.log(`Открытие модального окна добавления токена для типа: ${targetType}`);
        
        const modal = document.getElementById('addTokenModal');
        const confirmBtn = document.getElementById('confirmAddTokenBtn');
        const tokenMessageContainer = document.getElementById('tokenMessageContainer');
        const tokenAddressInput = document.getElementById('tokenAddress');
        const tokenNameInput = document.getElementById('tokenName');
        const tokenSymbolInput = document.getElementById('tokenSymbol');
        const tokenDecimalsInput = document.getElementById('tokenDecimals');
        
        if (!modal || !confirmBtn) {
            console.error("Элементы модального окна не найдены");
            return;
        }
        
        // Очищаем поля и сообщения
        if (tokenMessageContainer) tokenMessageContainer.innerHTML = '';
        if (tokenAddressInput) tokenAddressInput.value = '';
        if (tokenNameInput) tokenNameInput.value = '';
        if (tokenSymbolInput) tokenSymbolInput.value = '';
        if (tokenDecimalsInput) tokenDecimalsInput.value = '18';
        
        // Устанавливаем цель добавления (старый или новый токен)
        modal.dataset.targetType = targetType;
        
        // Показываем модальное окно
        modal.style.display = 'block';
        console.log(`Модальное окно добавления токена открыто для типа: ${targetType}`);
        
        // - Добавляем обработчик blur для автозаполнения -
        if (tokenAddressInput) {
            const autoFillHandler = async function() {
                const address = this.value.trim();
                if (!address) return;
                
                try {
                    // Проверяем, что ethers.js доступен
                    if (typeof window.ethers === 'undefined' || typeof window.ethers.utils === 'undefined' || !window.ethers.utils.isAddress) {
                        console.error("ethers.js не загружена или не содержит utils.isAddress");
                        if(tokenMessageContainer) UIManager.showTokenMessage("Ошибка проверки адреса контракта.", true);
                        return;
                    }
                    
                    // Проверяем валидность адреса
                    if (!window.ethers.utils.isAddress(address)) {
                        if(tokenMessageContainer) UIManager.showTokenMessage("Введенный адрес контракта недействителен.", true);
                        return;
                    }
                    
                    // Очищаем предыдущие сообщения
                    if(tokenMessageContainer) tokenMessageContainer.innerHTML = '';
                    
                    // Получаем провайдер из MetaMask
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    
                    // Создаем ABI для ERC20 токена
                    const erc20Abi = [
                        "function name() view returns (string)",
                        "function symbol() view returns (string)",
                        "function decimals() view returns (uint8)"
                    ];
                    
                    // Создаем контракт
                    const contract = new ethers.Contract(address, erc20Abi, provider);
                    
                    // Получаем имя, символ и десятичные знаки параллельно
                    const [nameResult, symbolResult, decimalsResult] = await Promise.allSettled([
                        contract.name(),
                        contract.symbol(),
                        contract.decimals()
                    ]);
                    
                    let name = "";
                    let symbol = "";
                    let decimals = "18";
                    let hasError = false;
                    
                    // Обрабатываем результаты
                    if (nameResult.status === 'fulfilled') {
                        name = nameResult.value;
                    } else {
                        console.warn("Ошибка получения имени токена:", nameResult.reason);
                        hasError = true;
                    }
                    
                    if (symbolResult.status === 'fulfilled') {
                        symbol = symbolResult.value;
                    } else {
                        console.warn("Ошибка получения символа токена:", symbolResult.reason);
                        hasError = true;
                    }
                    
                    if (decimalsResult.status === 'fulfilled') {
                        decimals = decimalsResult.value.toString();
                    } else {
                        console.warn("Ошибка получения десятичных знаков токена:", decimalsResult.reason);
                        // Не считаем это критической ошибкой, используем значение по умолчанию
                    }
                    
                    // Заполняем поля
                    if (tokenNameInput) tokenNameInput.value = name;
                    if (tokenSymbolInput) tokenSymbolInput.value = symbol;
                    if (tokenDecimalsInput) tokenDecimalsInput.value = decimals;
                    
                    if (hasError) {
                        if(tokenMessageContainer) UIManager.showTokenMessage("Некоторые данные токена получить не удалось. Проверьте адрес.", true);
                    } else {
                        if(tokenMessageContainer) tokenMessageContainer.innerHTML = ''; // Очищаем сообщение об успехе
                    }
                } catch (err) {
                    console.error("Ошибка при автозаполнении токена:", err);
                    if(tokenMessageContainer) UIManager.showTokenMessage("Ошибка при получении данных токена. Проверьте адрес контракта.", true);
                }
            };
            
            // Сохраняем ссылку на обработчик и добавляем его
            tokenAddressInput._autoFillHandler = autoFillHandler;
            tokenAddressInput.addEventListener('blur', autoFillHandler);
        }
        // - Конец обработчика автозаполнения -
    }
    
    // Новый метод для закрытия модального окна добавления токена
    static closeAddTokenModal() {
        console.log("Закрытие модального окна добавления токена");
        
        const modal = document.getElementById('addTokenModal');
        if (modal) {
            modal.style.display = 'none';
            console.log("Модальное окно добавления токена закрыто");
            
            // Удаляем обработчик blur при закрытии модального окна
            const tokenAddressInput = document.getElementById('tokenAddress');
            if (tokenAddressInput && tokenAddressInput._autoFillHandler) {
                tokenAddressInput.removeEventListener('blur', tokenAddressInput._autoFillHandler);
                tokenAddressInput._autoFillHandler = null;
            }
        }
    }
    
    // Новый метод для отображения сообщений в модальном окне
    static showTokenMessage(message, isError = false) {
        const tokenMessageContainer = document.getElementById('tokenMessageContainer');
        if (tokenMessageContainer) {
            if (isError) {
                tokenMessageContainer.innerHTML = `<div class="error-message">${message}</div>`;
            } else {
                tokenMessageContainer.innerHTML = `<div class="success-message">${message}</div>`;
            }
        }
    }
    
    // Метод для инициализации UI приложения
    static initApp() {
        console.log("=== Инициализация UI приложения ===");
        
        try {
            // Проверяем наличие tokenListManager и UIManager
            if (window.tokenListManager && window.UIManager) {
                // Проверяем наличие метода updateTokenSelects
                if (typeof window.UIManager.updateTokenSelects === 'function') {
                    // Обновляем выпадающие списки токенов
                    window.UIManager.updateTokenSelects();
                    console.log("Списки токенов инициализированы и UI обновлен.");
                } else {
                    console.warn("Метод window.UIManager.updateTokenSelects не найден.");
                }
                
                // Добавляем обработчики для кнопок "Добавить токен"
                const addOldTokenBtn = document.getElementById('addOldTokenBtn');
                const addNewTokenBtn = document.getElementById('addNewTokenBtn');
                
                if (addOldTokenBtn) {
                    // Проверяем, есть ли уже обработчик, чтобы не добавлять дубликаты
                    if (!addOldTokenBtn.dataset.handlerAttached) {
                        addOldTokenBtn.onclick = () => {
                            console.log("Нажата кнопка 'Добавить токен' для старых токенов");
                            if (typeof window.UIManager.openAddTokenModal === 'function') {
                                window.UIManager.openAddTokenModal('old');
                            } else {
                                console.error("Метод window.UIManager.openAddTokenModal не найден.");
                            }
                        };
                        addOldTokenBtn.dataset.handlerAttached = 'true'; // Отмечаем, что обработчик прикреплен
                    }
                } else {
                    console.warn("Кнопка 'Добавить токен' для старых токенов не найдена.");
                }
                
                if (addNewTokenBtn) {
                    if (!addNewTokenBtn.dataset.handlerAttached) {
                        addNewTokenBtn.onclick = () => {
                            console.log("Нажата кнопка 'Добавить токен' для новых токенов");
                            if (typeof window.UIManager.openAddTokenModal === 'function') {
                                window.UIManager.openAddTokenModal('new');
                            } else {
                                console.error("Метод window.UIManager.openAddTokenModal не найден.");
                            }
                        };
                        addNewTokenBtn.dataset.handlerAttached = 'true';
                    }
                } else {
                    console.warn("Кнопка 'Добавить токен' для новых токенов не найдена.");
                }
            } else {
                console.warn("window.tokenListManager или window.UIManager не доступны для инициализации токенов. Возможно, скрипты еще не загрузились.");
                // Можно попробовать снова через небольшую задержку, если критично
                // setTimeout(initApp, 500); // Но это рискованно, лучше убедиться в правильном порядке загрузки скриптов
            }
            
            if (window.exchangeManager && typeof window.exchangeManager.updateBalances === 'function') {
                window.exchangeManager.updateBalances();
            } else {
                console.warn("exchangeManager не доступен или updateBalances не функция");
            }
            
            console.log("=== Инициализация приложения завершена ===");
        } catch (error) {
            console.error("Ошибка инициализации приложения:", error);
        }
    }
}

// Делаем UIManager доступным глобально
window.UIManager = UIManager;

// Добавляем обработчик для закрытия модального окна
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('addTokenModal');
    const closeBtn = modal ? modal.querySelector('.close') : null;
    
    if (closeBtn) {
        closeBtn.onclick = function() {
            if (typeof window.UIManager.closeAddTokenModal === 'function') {
                window.UIManager.closeAddTokenModal();
            } else {
                console.error("Метод window.UIManager.closeAddTokenModal не найден.");
            }
        };
    }
    
    // Закрытие модального окна при клике вне его области
    window.onclick = function(event) {
        if (event.target === modal) {
            if (typeof window.UIManager.closeAddTokenModal === 'function') {
                window.UIManager.closeAddTokenModal();
            } else {
                console.error("Метод window.UIManager.closeAddTokenModal не найден.");
            }
        }
    };
    
    // Обработчик формы добавления токена
    const tokenForm = document.getElementById('tokenForm');
    if (tokenForm) {
        tokenForm.onsubmit = function(e) {
            e.preventDefault();
            
            const tokenAddressInput = document.getElementById('tokenAddress');
            const tokenNameInput = document.getElementById('tokenName');
            const tokenSymbolInput = document.getElementById('tokenSymbol');
            const tokenDecimalsInput = document.getElementById('tokenDecimals');
            const tokenMessageContainer = document.getElementById('tokenMessageContainer');
            
            if (!tokenAddressInput || !tokenNameInput || !tokenSymbolInput || !tokenDecimalsInput) {
                console.error("Не все поля формы найдены");
                return;
            }
            
            const address = tokenAddressInput.value.trim();
            const name = tokenNameInput.value.trim();
            const symbol = tokenSymbolInput.value.trim();
            const decimals = tokenDecimalsInput.value.trim();
            
            // Валидация
            if (!address || !name || !symbol) {
                if(tokenMessageContainer) UIManager.showTokenMessage("Пожалуйста, заполните все обязательные поля.", true);
                return;
            }
            
            // Проверяем, что ethers.js доступен
            if (typeof window.ethers === 'undefined' || typeof window.ethers.utils === 'undefined' || !window.ethers.utils.isAddress) {
                console.error("ethers.js не загружена или не содержит utils.isAddress");
                if(tokenMessageContainer) UIManager.showTokenMessage("Ошибка проверки адреса контракта.", true);
                return;
            }
            
            // Проверяем валидность адреса
            if (!window.ethers.utils.isAddress(address)) {
                if(tokenMessageContainer) UIManager.showTokenMessage("Введенный адрес контракта недействителен.", true);
                return;
            }
            
            // Получаем тип токена из data атрибута модального окна
            const modal = document.getElementById('addTokenModal'); // Получаем модальное окно снова
            const targetType = modal ? modal.dataset.targetType : null; // Получаем тип из data атрибута
            
            if (!targetType) {
                console.error("Не удалось определить тип токена для добавления");
                if(tokenMessageContainer) UIManager.showTokenMessage("Ошибка определения типа токена.", true);
                return;
            }
            
            // Определяем тип токена для tokenListManager
            const tokenType = targetType === 'old' ? 'old' : 'new';
            
            try {
                // Создаем объект нового токена
                const newToken = {
                    contract: address,
                    name: name,
                    symbol: symbol,
                    decimals: decimals ? parseInt(decimals, 10) : 18
                };
                
                // Добавляем токен через tokenListManager
                window.tokenListManager.addToken(tokenType, newToken);
                
                if(tokenMessageContainer) UIManager.showTokenMessage(`Токен ${name} (${symbol}) успешно добавлен!`);
                
                // Обновляем UI с новым списком токенов
                if (typeof window.UIManager.updateTokenSelects === 'function') {
                    window.UIManager.updateTokenSelects();
                }
                
                // Очищаем поля после успешного добавления
                tokenAddressInput.value = '';
                tokenNameInput.value = '';
                tokenSymbolInput.value = '';
                tokenDecimalsInput.value = '18';
                
                // Закрываем модальное окно через короткую задержку, чтобы пользователь увидел сообщение
                setTimeout(() => {
                    if (typeof window.UIManager.closeAddTokenModal === 'function') {
                        window.UIManager.closeAddTokenModal();
                    } else {
                        console.error("Метод window.UIManager.closeAddTokenModal не найден.");
                    }
                }, 1500);
            } catch (e) {
                if(tokenMessageContainer) UIManager.showTokenMessage(e.message, true);
            }
        };
    }
});