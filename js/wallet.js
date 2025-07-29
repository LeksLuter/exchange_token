(function () {
    'use strict';

    // Проверяем, существует ли уже walletManager в window
    if (window.hasOwnProperty('walletManager') && window.walletManager) {
        console.warn("walletManager уже существует в window, используем существующий");
        return;
    }

    class WalletManager {
        constructor() {
            this.isConnected = false;
            this.walletAddress = "";
            this.provider = null;
            this.signer = null;
        }

        async checkWallet() {
            const statusElement = document.getElementById("walletStatus");
            const actionBtn = document.getElementById("actionBtn");
            const walletInfo = document.getElementById("walletInfo");
            const messageContainer = document.getElementById("messageContainer");

            const uiElementsMissing = !statusElement || !actionBtn || !walletInfo;
            if (uiElementsMissing) {
                console.log("UI элементы кошелька не найдены на текущей странице. Продолжаем проверку.");
                if (messageContainer) messageContainer.innerHTML = "";
            } else {
                if (messageContainer) messageContainer.innerHTML = "";
            }

            console.log("=== Начало проверки кошелька ===");

            // Проверяем, установлена ли библиотека ethers
            if (typeof window.ethers === "undefined") {
                console.error("Библиотека ethers.js не загружена.");
                this.callUpdateWalletUI("ethers не загружен");
                return false;
            }

            // Проверяем, установлен ли MetaMask (или другой EIP-1193 провайдер)
            if (typeof window.ethereum === "undefined") {
                console.log("MetaMask (или другой EIP-1193 провайдер) не обнаружен.");
                this.callUpdateWalletUI("MetaMask не обнаружен");
                return false;
            }

            // Запрашиваем список доступных аккаунтов
            let accounts;
            try {
                accounts = await window.ethereum.request({ method: "eth_accounts" });
                console.log("Получен список аккаунтов:", accounts);
            } catch (error) {
                console.error("Ошибка при запросе аккаунтов:", error);
                this.callUpdateWalletUI("ошибка запроса аккаунтов");
                return false;
            }

            // --- Основная логика проверки состояния ---
            if (accounts.length === 0) {
                console.log("MetaMask обнаружен, но аккаунты не подключены.");
                this.isConnected = false;
                this.walletAddress = "";
                this.provider = null;
                this.signer = null;
                this.saveConnectionState();
                console.log("=== Проверка кошелька завершена (обнаружен, но не подключен) ===");
            } else {
                console.log("MetaMask подключен. Доступные аккаунты:", accounts);
                this.isConnected = true;
                this.walletAddress = accounts[0];
                console.log("Подключенный адрес кошелька:", this.walletAddress);

                try {
                    this.provider = new window.ethers.providers.Web3Provider(window.ethereum);
                    this.signer = this.provider.getSigner();
                    console.log("Ethers.js провайдер и signer инициализированы.");
                } catch (providerError) {
                    console.error("Ошибка инициализации провайдера Ethers.js:", providerError);
                    this.isConnected = false;
                    this.walletAddress = "";
                    this.provider = null;
                    this.signer = null;
                    this.saveConnectionState();
                }

                this.saveConnectionState();
                console.log("Состояние подключения сохранено в localStorage.");
                console.log("=== Проверка кошелька завершена успешно (кошелек готов) ===");
            }

            // --- ВАЖНО: Всегда вызываем updateWalletUI в конце ---
            this.callUpdateWalletUI("проверка завершена");
            return this.isConnected && !!this.walletAddress;
        }

        // Вспомогательный метод для безопасного вызова UIManager.updateWalletUI
        callUpdateWalletUI(context = "") {
            console.log(`Попытка вызова UIManager.updateWalletUI (${context})...`);
            try {
                // Проверяем window, затем window.UIManager, затем метод
                if (typeof window === 'undefined') {
                    console.error("Глобальный объект window недоступен.");
                    return;
                }

                if (!window.UIManager) {
                    console.warn("window.UIManager не найден. Возможно, ui.js еще не загрузился или произошла ошибка.");
                    // Попробуем снова через небольшую задержку
                    setTimeout(() => {
                        if (window.UIManager && typeof window.UIManager.updateWalletUI === 'function') {
                            console.log("UIManager появился после задержки, вызываем updateWalletUI.");
                            window.UIManager.updateWalletUI();
                        } else {
                            console.error("UIManager так и не появился после задержки.");
                        }
                    }, 200); // 200ms задержка
                    return;
                }

                if (typeof window.UIManager !== 'object') {
                    console.warn("window.UIManager не является объектом. Тип:", typeof window.UIManager);
                    return;
                }

                if (typeof window.UIManager.updateWalletUI !== 'function') {
                    console.warn("UIManager.updateWalletUI не найден или не является функцией.");
                    console.log("Доступные свойства UIManager:", Object.getOwnPropertyNames(window.UIManager));
                    return;
                }

                console.log("UIManager.updateWalletUI найден, вызываем.");
                window.UIManager.updateWalletUI();
            } catch (uiUpdateError) {
                console.error("Ошибка при вызове UIManager.updateWalletUI:", uiUpdateError);
            }
        }


        async connect() {
            console.log("Начало подключения кошелька...");
            const statusElement = document.getElementById("walletStatus");
            const actionBtn = document.getElementById("actionBtn");
            const walletInfo = document.getElementById("walletInfo");
            const messageContainer = document.getElementById("walletMessageContainer") || document.getElementById("messageContainer");

            if (!statusElement || !actionBtn || !walletInfo) {
                console.warn("Некоторые UI элементы кошелька не найдены в connect.");
            }

            if (messageContainer) messageContainer.innerHTML = "";

            if (typeof window.ethers === "undefined") {
                console.error("Библиотека ethers.js не загружена.");
                if (messageContainer) {
                    const UIManager = window.UIManager;
                    if (UIManager && typeof UIManager.showErrorMessage === 'function') {
                        UIManager.showErrorMessage("Ошибка: Библиотека ethers.js не загружена.");
                    } else {
                        messageContainer.innerHTML = '<div class="error-message">Ошибка: Библиотека ethers.js не загружена.</div>';
                    }
                }
                return;
            }

            if (typeof window.ethereum === "undefined") {
                console.log("MetaMask (или другой EIP-1193 провайдер) не обнаружен.");
                if (messageContainer) {
                    const UIManager = window.UIManager;
                    if (UIManager && typeof UIManager.showInstallationInstructions === 'function') {
                        UIManager.showInstallationInstructions();
                    } else if (UIManager && typeof UIManager.showErrorMessage === 'function') {
                        UIManager.showErrorMessage("MetaMask не обнаружен. Пожалуйста, установите MetaMask.");
                    } else {
                        messageContainer.innerHTML = '<div class="error-message">MetaMask не обнаружен. Пожалуйста, установите MetaMask.</div>';
                    }
                }
                try {
                    if (typeof window.updateWalletUI === 'function') {
                        window.updateWalletUI();
                    } else {
                        const UIManager = window.UIManager;
                        if (UIManager && typeof UIManager.updateWalletUI === 'function') {
                            UIManager.updateWalletUI();
                        }
                    }
                } catch (uiError) {
                    console.error("Ошибка при обновлении UI после отсутствия MetaMask:", uiError);
                }
                return;
            }

            try {
                console.log("Запрашиваем разрешение на подключение аккаунтов...");
                const accounts = await window.ethereum.request({
                    method: "eth_requestAccounts"
                });
                console.log("Аккаунты успешно подключены:", accounts);

                if (accounts.length === 0) {
                    console.error("Не удалось получить аккаунты после запроса.");
                    if (messageContainer) {
                        const UIManager = window.UIManager;
                        if (UIManager && typeof UIManager.showErrorMessage === 'function') {
                            UIManager.showErrorMessage("Не удалось получить аккаунты кошелька.");
                        } else {
                            messageContainer.innerHTML = '<div class="error-message">Не удалось получить аккаунты кошелька.</div>';
                        }
                    }
                    return;
                }

                this.isConnected = true;
                this.walletAddress = accounts[0];
                console.log("Подключенный адрес кошелька:", this.walletAddress);

                this.provider = new window.ethers.providers.Web3Provider(window.ethereum);
                this.signer = this.provider.getSigner();
                console.log("Ethers.js провайдер и signer инициализированы.");

                this.saveConnectionState();
                console.log("Состояние подключения сохранено в localStorage.");

                if (messageContainer) {
                    const UIManager = window.UIManager;
                    if (UIManager && typeof UIManager.showSuccessMessage === 'function') {
                        UIManager.showSuccessMessage("Кошелек успешно подключен!");
                    } else {
                        messageContainer.innerHTML = '<div class="success-message">Кошелек успешно подключен!</div>';
                    }
                }

                try {
                    if (typeof window.updateWalletUI === 'function') {
                        window.updateWalletUI();
                    } else {
                        const UIManager = window.UIManager;
                        if (UIManager && typeof UIManager.updateWalletUI === 'function') {
                            UIManager.updateWalletUI();
                        }
                    }
                } catch (uiError) {
                    console.error("Ошибка при обновлении UI после подключения:", uiError);
                }

                console.log("Кошелек успешно подключен:", this.walletAddress);

                if (window.adminManager && typeof window.adminManager.checkAdminStatus === 'function') {
                    const currentAddress = this.walletAddress;
                    if (currentAddress) {
                        console.log(`Проверка статуса администратора для адреса: ${currentAddress}`);
                        try {
                            window.adminManager.checkAdminStatus(currentAddress);
                        } catch (adminError) {
                            console.error("Ошибка проверки админ-статуса:", adminError);
                        }
                    }
                } else {
                    console.warn("adminManager не доступен или не инициализирован");
                }

            } catch (error) {
                console.error("Ошибка при подключении кошелька:", error);
                this.isConnected = false;
                this.walletAddress = "";
                this.provider = null;
                this.signer = null;
                this.saveConnectionState();

                if (messageContainer) {
                    let errorMessage = "Неизвестная ошибка при подключении кошелька.";
                    if (error.code === 4001) {
                        errorMessage = "Подключение отменено пользователем.";
                    } else if (error.code === -32002) {
                        errorMessage = "Запрос на подключение уже отправлен. Пожалуйста, проверьте MetaMask.";
                    }
                    const UIManager = window.UIManager;
                    if (UIManager && typeof UIManager.showErrorMessage === 'function') {
                        UIManager.showErrorMessage(errorMessage);
                    } else {
                        messageContainer.innerHTML = `<div class="error-message">${errorMessage}</div>`;
                    }
                }

                try {
                    if (typeof window.updateWalletUI === 'function') {
                        window.updateWalletUI();
                    } else {
                        const UIManager = window.UIManager;
                        if (UIManager && typeof UIManager.updateWalletUI === 'function') {
                            UIManager.updateWalletUI();
                        }
                    }
                } catch (uiError) {
                    console.error("Ошибка при обновлении UI после ошибки подключения:", uiError);
                }
            }
        }

        disconnect() {
            console.log("Отключение кошелька...");
            const statusElement = document.getElementById("walletStatus");
            const actionBtn = document.getElementById("actionBtn");
            const walletInfo = document.getElementById("walletInfo");
            const messageContainer = document.getElementById("walletMessageContainer") || document.getElementById("messageContainer");

            if (!statusElement || !actionBtn || !walletInfo) {
                console.warn("Некоторые UI элементы кошелька не найдены в disconnect.");
            }

            if (messageContainer) messageContainer.innerHTML = "";

            this.isConnected = false;
            this.walletAddress = "";
            this.provider = null;
            this.signer = null;

            this.saveConnectionState();
            console.log("Состояние подключения сброшено и сохранено в localStorage.");

            if (messageContainer) {
                const UIManager = window.UIManager;
                if (UIManager && typeof UIManager.showSuccessMessage === 'function') {
                    UIManager.showSuccessMessage("Кошелек успешно отключен.");
                } else {
                    messageContainer.innerHTML = '<div class="success-message">Кошелек успешно отключен.</div>';
                }
            }

            try {
                if (typeof window.updateWalletUI === 'function') {
                    window.updateWalletUI();
                } else {
                    const UIManager = window.UIManager;
                    if (UIManager && typeof UIManager.updateWalletUI === 'function') {
                        UIManager.updateWalletUI();
                    }
                }
            } catch (uiError) {
                console.error("Ошибка при обновлении UI после отключения:", uiError);
            }

            const profileNavItem = document.querySelector('a[href="#profile"]')?.parentElement;
            if (profileNavItem) {
                console.log("Скрываем пункт меню 'Профиль' при отключении");
                profileNavItem.style.display = "none";
            }

            console.log("Кошелек успешно отключен.");
        }

        saveConnectionState() {
            const connectionState = {
                connected: this.isConnected,
                address: this.walletAddress
            };
            try {
                localStorage.setItem('walletConnectionState', JSON.stringify(connectionState));
                console.log("Состояние подключения сохранено в localStorage:", connectionState);
            } catch (error) {
                console.error("Ошибка при сохранении состояния подключения в localStorage:", error);
            }
        }

        restoreConnectionState() {
            try {
                const savedState = localStorage.getItem('walletConnectionState');
                if (savedState) {
                    const state = JSON.parse(savedState);
                    console.log("Состояние подключения восстановлено из localStorage:", state);
                    return {
                        connected: state.connected === true,
                        address: typeof state.address === 'string' ? state.address : ""
                    };
                } else {
                    console.log("Состояние подключения не найдено в localStorage.");
                }
            } catch (error) {
                console.error("Ошибка при восстановлении состояния подключения из localStorage:", error);
            }
            return {
                connected: false,
                address: ""
            };
        }

        async restoreConnection(address) {
            console.log(`Попытка восстановления подключения для адреса: ${address}`);
            if (!address) {
                console.error("Адрес для восстановления подключения не предоставлен.");
                return false;
            }

            if (typeof window.ethers === "undefined" || typeof window.ethereum === "undefined") {
                console.error("ethers.js или ethereum provider не доступны для восстановления подключения.");
                return false;
            }

            try {
                const accounts = await window.ethereum.request({ method: "eth_accounts" });
                if (accounts.includes(address)) {
                    console.log(`Адрес ${address} доступен для восстановления подключения.`);
                    this.isConnected = true;
                    this.walletAddress = address;
                    this.provider = new window.ethers.providers.Web3Provider(window.ethereum);
                    this.signer = this.provider.getSigner();
                    this.saveConnectionState();
                    console.log("Подключение успешно восстановлено.");
                    return true;
                } else {
                    console.log(`Адрес ${address} не найден в доступных аккаунтах для восстановления.`);
                    return false;
                }
            } catch (error) {
                console.error("Ошибка при попытке восстановления подключения:", error);
                return false;
            }
        }

        initProvider() {
            console.log("Инициализация провайдера...");
            if (typeof window.ethers === "undefined") {
                console.error("ethers.js не загружена, невозможно инициализировать провайдер.");
                return;
            }
            if (typeof window.ethereum === "undefined") {
                console.warn("Ethereum provider (MetaMask) не обнаружен. Провайдер будет инициализирован позже при подключении.");
                return;
            }
            console.log("Провайдер готов к инициализации при подключении.");
        }
    }

    console.log("Определение WalletManager завершено. Создание глобального экземпляра...");
    const walletManagerInstance = new WalletManager();
    window.walletManager = walletManagerInstance;
    console.log("Глобальный экземпляр WalletManager создан и доступен как window.walletManager");

})();