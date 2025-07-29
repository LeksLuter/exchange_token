// js/ui.js - Менеджер пользовательского интерфейса
(function () {
    'use strict';

    if (window.UIManager) {
        console.warn("UIManager уже существует в window, используем существующий");
        return;
    }

    class UIManager {
        // - Методы отображения сообщений -
        static showSuccessMessage(message) {
            const messageContainer = document.getElementById("messageContainer");
            if (!messageContainer) return;

            messageContainer.innerHTML = '';
            const successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.textContent = message;
            messageContainer.appendChild(successDiv);

            messageContainer.style.display = 'block';

            setTimeout(() => {
                if (successDiv.parentNode === messageContainer) {
                    messageContainer.removeChild(successDiv);
                    if (messageContainer.children.length === 0) {
                        messageContainer.style.display = 'none';
                    }
                }
            }, 5000);
        }

        static showErrorMessage(message) {
            const messageContainer = document.getElementById("messageContainer");
            if (!messageContainer) return;

            messageContainer.innerHTML = '';
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            messageContainer.appendChild(errorDiv);

            messageContainer.style.display = 'block';

            setTimeout(() => {
                if (errorDiv.parentNode === messageContainer) {
                    messageContainer.removeChild(errorDiv);
                    if (messageContainer.children.length === 0) {
                        messageContainer.style.display = 'none';
                    }
                }
            }, 7000);
        }

        static showTokenMessage(message, isError = false) {
            const tokenMessageContainer = document.getElementById("tokenMessageContainer");
            if (!tokenMessageContainer) return;

            tokenMessageContainer.innerHTML = '';
            const messageDiv = document.createElement('div');
            messageDiv.className = isError ? 'error-message' : 'success-message';
            messageDiv.textContent = message;
            tokenMessageContainer.appendChild(messageDiv);

            tokenMessageContainer.style.display = 'block';

            const hideTimeout = isError ? 7000 : 5000;
            setTimeout(() => {
                if (messageDiv.parentNode === tokenMessageContainer) {
                    tokenMessageContainer.removeChild(messageDiv);
                    if (tokenMessageContainer.children.length === 0) {
                        tokenMessageContainer.style.display = 'none';
                    }
                }
            }, hideTimeout);
        }

        static showInstallationInstructions() {
            const modal = document.getElementById("installModal");
            if (modal) {
                modal.style.display = "block";
            }
        }

        // - Методы обновления UI -
        static updateWalletUI() {
            console.log("=== Обновление UI кошелька (UIManager.updateWalletUI) ===");
            
            // Получаем все необходимые элементы
            const statusElement = document.getElementById("walletStatus");
            const actionBtn = document.getElementById("actionBtn");
            const walletInfo = document.getElementById("walletInfo");
            const walletAddressElement = document.getElementById("walletAddress");
            const walletBalanceElement = document.getElementById("walletBalance");

            // Проверка наличия критически важных элементов
            if (!statusElement || !actionBtn || !walletInfo) {
                 console.log("Критические UI элементы кошелька (#walletStatus, #actionBtn, #walletInfo) не найдены на текущей странице. Пропускаем обновление UI.");
                 // Даже если критические элементы отсутствуют, мы все равно пытаемся обновить видимость пункта "Профиль"
                 // в зависимости от глобального состояния подключения
                 const walletManager = window.walletManager;
                 if (walletManager) {
                     const { connected } = walletManager.restoreConnectionState();
                     const profileNavItem = document.querySelector('a[href="#profile"]')?.parentElement;
                     if (connected && profileNavItem) {
                         profileNavItem.style.display = "block";
                         console.log("Кошелек подключен (глобально), показываем пункт 'Профиль' (элементы UI кошелька отсутствуют на странице).");
                     } else if (!connected && profileNavItem) {
                         profileNavItem.style.display = "none";
                         console.log("Кошелек не подключен (глобально), скрываем пункт 'Профиль' (элементы UI кошелька отсутствуют на странице).");
                     }
                 }
                 return; 
            }

            const walletManager = window.walletManager;
            if (!walletManager) {
                console.warn("walletManager не доступен для обновления UI");
                // Отображаем состояние "кошелек не обнаружен", если менеджер отсутствует
                statusElement.textContent = "Кошелек не обнаружен";
                actionBtn.textContent = "Установить MetaMask";
                actionBtn.onclick = () => this.installWallet ? this.installWallet() : () => { if (typeof window !== 'undefined') { window.open("https://metamask.io/download/", "_blank"); } };
                actionBtn.className = "btn install";
                // --- ГАРАНТИЯ: Кнопка активна ---
                actionBtn.disabled = false;
                console.log("Установлено actionBtn.disabled = false (walletManager отсутствует)");
                // --- Конец гарантии ---
                walletInfo.style.display = "none";
                return;
            }

            // Используем restoreConnectionState для получения состояния
            const { connected, address } = walletManager.restoreConnectionState();
            console.log("Состояние подключения из restoreConnectionState:", { connected, address });

            if (connected && address) {
                console.log("Кошелек подключен, обновляем UI");
                statusElement.textContent = "Подключен";
                actionBtn.textContent = "Отключить кошелек";
                // Привязываем обработчик к экземпляру walletManager
                actionBtn.onclick = () => {
                    console.log("Нажата кнопка 'Отключить кошелек'");
                    walletManager.disconnect();
                };
                // --- ИСПРАВЛЕНИЕ: Убедимся, что кнопка активна ---
                actionBtn.disabled = false;
                actionBtn.className = "btn disconnect";
                console.log("Установлено actionBtn.disabled = false (кошелек подключен)");
                // --- Конец исправления ---
                
                walletAddressElement.textContent = address;
                walletBalanceElement.textContent = "Загрузка..."; // Или начальное значение

                walletInfo.style.display = "block";
                walletInfo.classList.add("connected"); // Добавляем класс для стилизации

                // Показываем пункт "Профиль" в навигации
                const profileNavItem = document.querySelector('a[href="#profile"]')?.parentElement;
                if (profileNavItem) {
                    console.log("Отображаем пункт меню 'Профиль'");
                    profileNavItem.style.display = "block";
                } else {
                    console.log("Пункт меню 'Профиль' не найден в DOM при подключении");
                }
            } else {
                // --- КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Логика для состояния "не подключен" ---
                console.log("Кошелек не подключен, обновляем UI");
                // Определяем, обнаружен ли MetaMask/ethereum провайдер
                const isWalletDetected = typeof window.ethereum !== 'undefined';

                if (isWalletDetected) {
                    console.log("MetaMask/ethereum провайдер обнаружен.");
                    statusElement.textContent = "Кошелек обнаружен";
                    actionBtn.textContent = "Подключить кошелек";
                    actionBtn.onclick = () => {
                        console.log("Нажата кнопка 'Подключить кошелек'");
                        walletManager.connect();
                    };
                    actionBtn.className = "btn connect";
                } else {
                    console.log("MetaMask/ethereum провайдер НЕ обнаружен.");
                    statusElement.textContent = "Кошелек не обнаружен";
                    actionBtn.textContent = "Установить MetaMask";
                    actionBtn.onclick = () => this.installWallet ? this.installWallet() : () => { if (typeof window !== 'undefined') { window.open("https://metamask.io/download/", "_blank"); } };
                    actionBtn.className = "btn install";
                }
                
                // --- ГАРАНТИЯ: Кнопка всегда активна в состоянии "не подключен" ---
                actionBtn.disabled = false;
                console.log("Установлено actionBtn.disabled = false (кошелек не подключен)");
                // --- Конец гарантии ---
                
                walletInfo.style.display = "block"; // Показываем контейнер, но внутри будет информация о неподключенном состоянии
                walletInfo.classList.remove("connected"); // Убираем класс подключенного состояния

                walletAddressElement.textContent = "Не подключен";
                walletBalanceElement.textContent = "-";
                
                // Скрываем пункт "Профиль" в навигации, если кошелек не подключен
                const profileNavItem = document.querySelector('a[href="#profile"]')?.parentElement;
                if (profileNavItem) {
                    console.log("Скрываем пункт меню 'Профиль' (кошелек не подключен)");
                    profileNavItem.style.display = "none";
                }
                // --- Конец критического исправления ---
            }
            
            console.log("=== Обновление UI кошелька завершено ===");
        }

        static installWallet() {
             console.log("Попытка открыть страницу установки MetaMask...");
             const installUrl = "https://metamask.io/download/";
             if (typeof window !== 'undefined' && window.open) {
                 window.open(installUrl, "_blank");
             } else {
                 console.warn("Невозможно открыть новое окно. Перейдите по ссылке вручную:", installUrl);
             }
        }

        // Инициализация UIManager
        static init() {
            console.log("Инициализация UIManager...");

            const installModal = document.getElementById('installModal');
            const installCloseBtn = installModal ? installModal.querySelector('.close') : null;
            if (installCloseBtn) {
                installCloseBtn.onclick = function () {
                    if (installModal) installModal.style.display = 'none';
                };
            }

            if (installModal) {
                window.onclick = function (event) {
                    if (event.target == installModal) {
                        installModal.style.display = 'none';
                    }
                };
            }

            const inputs = document.querySelectorAll("input");
            if (inputs) {
                inputs.forEach((input) => {
                    if (input && typeof input.addEventListener === 'function') {
                        input.addEventListener("focus", function () {
                            this.select();
                        });
                    }
                });
            }

            console.log("UIManager инициализирован");
        }

        // Инициализация всего приложения (вызывается из main.js)
        static async initApp() {
            console.log("=== Инициализация UI приложения (UIManager.initApp) ===");
            
            try {
                this.init();
                
                // Проверяем tokenListManager
                if (window.tokenListManager && typeof window.tokenListManager.init === 'function') {
                    await window.tokenListManager.init();
                } else {
                    console.warn("tokenListManager не доступен или не инициализирован");
                }
                
                // Обновляем UI кошелька после инициализации менеджеров
                // Это важно для начального отображения состояния
                this.updateWalletUI();
                
                console.log("=== Инициализация UI приложения завершена ===");
            } catch (error) {
                console.error("Ошибка инициализации UI приложения:", error);
                this.showErrorMessage("Ошибка инициализации UI: " + error.message);
            }
        }
    }

    window.UIManager = UIManager;

    // Добавляем обработчики для модальных окон и input'ов при загрузке DOM
    document.addEventListener('DOMContentLoaded', function () {
        const modal = document.getElementById('installModal');
        const closeBtn = modal ? modal.querySelector('.close') : null;
        
        if (closeBtn) {
            closeBtn.onclick = function () {
                if (modal) modal.style.display = 'none';
            };
        }

        if (modal) {
            window.onclick = function (event) {
                if (event.target == modal) {
                    modal.style.display = 'none';
                }
            };
        }

        const inputs = document.querySelectorAll("input");
        if (inputs) {
            inputs.forEach((input) => {
                if (input && typeof input.addEventListener === 'function') {
                    input.addEventListener("focus", function () {
                        this.select();
                    });
                }
            });
        }
        
        // Пытаемся обновить UI кошелька один раз при загрузке DOM
        // Это может помочь, если страница была загружена позже или 
        // если предыдущие вызовы updateWalletUI не сработали
        setTimeout(() => {
            if (window.UIManager && typeof window.UIManager.updateWalletUI === 'function') {
                 console.log("Повторный вызов updateWalletUI при DOMContentLoaded (таймаут 300мс)");
                 window.UIManager.updateWalletUI();
            } else {
                console.log("UIManager.updateWalletUI недоступен при DOMContentLoaded (таймаут 300мс)");
            }
        }, 300); // Небольшая задержка
        
    });

})();