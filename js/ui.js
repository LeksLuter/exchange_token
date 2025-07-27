// Используем IIFE (Immediately Invoked Function Expression) для изоляции кода
// и предотвращения конфликтов имен
(function () {
    'use strict';

    // Проверяем, существует ли уже UIManager в window
    if (window.UIManager) {
        console.warn("UIManager уже существует в window, используем существующий");
        return;
    }

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

        static showTokenMessage(message, isError = false) {
            const tokenMessageContainer = document.getElementById("tokenMessageContainer");
            if (!tokenMessageContainer) {
                console.error("Элемент tokenMessageContainer не найден");
                return;
            }

            const messageClass = isError ? "error-message" : "success-message";
            tokenMessageContainer.innerHTML = `<div class="${messageClass}">${message}</div>`;

            if (!isError) {
                setTimeout(() => {
                    tokenMessageContainer.innerHTML = "";
                }, 3000);
            }
        }

        // Обновление выпадающих списков токенов
        static updateTokenSelects() {
            console.log("Обновление выпадающих списков токенов...");
            const tokenListManager = window.tokenListManager;

            if (!tokenListManager) {
                console.error("tokenListManager не доступен в updateTokenSelects");
                return;
            }

            // Обновляем список старых токенов
            const oldTokenSelect = document.getElementById("oldTokenSelect");
            if (oldTokenSelect) {
                oldTokenSelect.innerHTML = "";
                const oldTokens = tokenListManager.getTokens('old');

                if (oldTokens && oldTokens.length > 0) {
                    oldTokens.forEach(token => {
                        const option = document.createElement("option");
                        option.value = token.contract;
                        option.textContent = `${token.name} (${token.symbol})`;
                        oldTokenSelect.appendChild(option);
                    });
                } else {
                    const option = document.createElement("option");
                    option.value = "";
                    option.textContent = "Нет доступных токенов";
                    option.disabled = true;
                    option.selected = true;
                    oldTokenSelect.appendChild(option);
                }
            }

            // Обновляем список новых токенов
            const newTokenSelect = document.getElementById("newTokenSelect");
            if (newTokenSelect) {
                newTokenSelect.innerHTML = "";
                const newTokens = tokenListManager.getTokens('new');

                if (newTokens && newTokens.length > 0) {
                    newTokens.forEach(token => {
                        const option = document.createElement("option");
                        option.value = token.contract;
                        option.textContent = `${token.name} (${token.symbol})`;
                        newTokenSelect.appendChild(option);
                    });
                } else {
                    const option = document.createElement("option");
                    option.value = "";
                    option.textContent = "Нет доступных токенов";
                    option.disabled = true;
                    option.selected = true;
                    newTokenSelect.appendChild(option);
                }
            }

            // Отправляем событие об обновлении списков токенов
            window.dispatchEvent(new CustomEvent("tokenListsUpdated"));
            console.log("Выпадающие списки токенов обновлены");
        }

        // Обновление UI элементов
        static updateWalletUI() {
            console.log("Обновление UI элементов кошелька...");
            const walletManager = window.walletManager;

            if (!walletManager) {
                console.error("walletManager не доступен в updateWalletUI");
                return;
            }

            // Обновляем статус подключения
            const walletStatus = document.getElementById("walletStatus");
            const walletInfo = document.getElementById("walletInfo");
            const walletAddress = document.getElementById("walletAddress");
            const walletBalance = document.getElementById("walletBalance");
            const actionBtn = document.getElementById("actionBtn");

            if (walletStatus && walletInfo && walletAddress && walletBalance && actionBtn) {
                if (walletManager.isConnected) {
                    walletStatus.textContent = "Кошелек подключен";
                    walletInfo.classList.add("connected");
                    walletAddress.textContent = `${walletManager.walletAddress.substring(0, 6)}...${walletManager.walletAddress.substring(38)}`;
                    walletAddress.style.display = "block";
                    walletBalance.style.display = "block";
                    actionBtn.textContent = "Отключить кошелек";
                    actionBtn.onclick = () => walletManager.disconnect();
                    actionBtn.className = "btn disconnect";
                } else {
                    walletStatus.textContent = "Кошелек не подключен";
                    walletInfo.classList.remove("connected");
                    walletAddress.style.display = "none";
                    walletBalance.style.display = "none";
                    actionBtn.textContent = "Подключить кошелек";
                    actionBtn.onclick = () => walletManager.connect();
                    actionBtn.className = "btn connect";
                }
            }

            // Обновляем списки токенов
            this.updateTokenSelects();

            // Обновляем меню
            this.updateMenu();

            console.log("UI элементы кошелька обновлены");
        }

        // Обновление меню
        static updateMenu() {
            console.log("Обновление меню...");
            const walletManager = window.walletManager;
            const profileNavItem = document.getElementById("profileNavItem");
            const adminNavItem = document.getElementById("adminNavItem");

            if (!walletManager) {
                console.error("walletManager не доступен в updateMenu");
                return;
            }

            if (walletManager.isConnected) {
                // Показываем пункт "Профиль" в меню
                if (profileNavItem) {
                    profileNavItem.style.display = "block";
                }

                // Проверяем права доступа к админке
                if (adminNavItem) {
                    if (walletManager.walletAddress &&
                        walletManager.walletAddress.toLowerCase() === walletManager.adminAddress.toLowerCase()) {
                        adminNavItem.style.display = "block";
                    } else {
                        adminNavItem.style.display = "none";
                    }
                }
            } else {
                // Скрываем пункты меню при отключении кошелька
                if (profileNavItem) {
                    profileNavItem.style.display = "none";
                }
                if (adminNavItem) {
                    adminNavItem.style.display = "none";
                }
            }

            console.log("Меню обновлено");
        }
    }

    // Делаем UIManager доступным глобально
    window.UIManager = UIManager;

    console.log("UIManager инициализирован и доступен в window.UIManager");
})();