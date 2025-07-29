(function () {
    'use strict';

    // Функция для ожидания загрузки ethers.js
    async function waitForEthers(maxAttempts = 50, interval = 200) {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const check = () => {
                attempts++;
                // Более точная и полная проверка готовности ethers.js
                const isReady = typeof window.ethers !== 'undefined' &&
                    typeof window.ethers.providers !== 'undefined' &&
                    typeof window.ethers.providers.Web3Provider === 'function' &&
                    typeof window.ethers.utils !== 'undefined' &&
                    typeof window.ethers.utils.formatUnits === 'function' &&
                    typeof window.ethers.utils.parseUnits === 'function' &&
                    typeof window.ethers.utils.isAddress === 'function';

                if (isReady) {
                    console.log("Ethers.js готова к использованию.");
                    resolve();
                } else if (attempts >= maxAttempts) {
                    console.error("Ethers.js не загрузилась за отведённое время.");
                    reject(new Error("Ethers.js не загрузилась"));
                } else {
                    setTimeout(check, interval);
                }
            };
            check();
        });
    }

    // --- Инициализация приложения ---
    async function initApp() {
        console.log("=== Начало инициализации приложения ===");
        try {
            // 1. Проверяем и ждем ethers.js
            if (!window.ethers || !window.ethers.providers || !window.ethers.utils) {
                console.log("ethers.js не готова, начинаем ожидание...");
                await waitForEthers();
            } else {
                console.log("ethers.js уже загружена и готова.");
            }

            // 2. Даем немного времени другим скриптам инициализироваться
            // Уменьшена задержка
            await new Promise(resolve => setTimeout(resolve, 50));

            // 3. Проверяем наличие необходимых менеджеров
            // Добавлена проверка walletManager.initProvider
            if (!window.tokenListManager || !window.UIManager || !window.walletManager) {
                console.error("Критические менеджеры не инициализированы:", {
                    tokenListManager: !!window.tokenListManager,
                    UIManager: !!window.UIManager,
                    walletManager: !!(window.walletManager) // Проверяем сам объект
                });
                // Дополнительная диагностика: проверим, загружены ли скрипты
                const scripts = document.getElementsByTagName('script');
                let walletScriptFound = false;
                for (let script of scripts) {
                    if (script.src && script.src.includes('wallet.js')) {
                        walletScriptFound = true;
                        break;
                    }
                }
                console.log("Скрипт wallet.js загружен:", walletScriptFound);
                throw new Error("Критические менеджеры не инициализированы");
            }

            // Проверим, есть ли у walletManager необходимые методы
            if (typeof window.walletManager.initProvider !== 'function' ||
                typeof window.walletManager.restoreConnectionState !== 'function' ||
                typeof window.walletManager.checkWallet !== 'function') {
                console.error("walletManager не содержит необходимых методов:", {
                    initProvider: typeof window.walletManager.initProvider,
                    restoreConnectionState: typeof window.walletManager.restoreConnectionState,
                    checkWallet: typeof window.walletManager.checkWallet
                });
                throw new Error("walletManager инициализирован некорректно (отсутствуют методы)");
            }

            // 4. Инициализируем менеджеры
            // Убираем вызов window.tokenListManager.init(), так как он не существует
            // и tokenManager.js сам отвечает за свою инициализацию
            console.log("Инициализация UIManager...");
            // Предполагаем, что в ui.js определен метод initApp
            if (window.UIManager && typeof window.UIManager.initApp === 'function') {
                window.UIManager.initApp(); // Используем initApp для полной инициализации UI
            } else if (window.UIManager && typeof window.UIManager.init === 'function') {
                // fallback на init если initApp не найден
                window.UIManager.init();
            } else {
                console.warn("UIManager.initApp или UIManager.init не найдены");
            }

            // 5. Инициализация провайдера кошелька
            console.log("Инициализация провайдера кошелька...");
            window.walletManager.initProvider();

            // 6. Восстановление состояния подключения и проверка кошелька
            console.log("Запуск checkWallet для проверки состояния и обновления UI...");
            try {
                const checkResult = await window.walletManager.checkWallet();
                console.log("checkWallet завершен, результат:", checkResult);
            } catch (checkError) {
                console.error("Ошибка при выполнении checkWallet:", checkError);
                // Не прерываем инициализацию из-за ошибки checkWallet
            }

            // 7. Инициализация ExchangeManager (если он существует глобально)
            if (window.exchangeManager && typeof window.exchangeManager.init === 'function') {
                console.log("Инициализация ExchangeManager...");
                window.exchangeManager.init();
            } else {
                console.log("ExchangeManager не найден или не инициализирован.");
            }

            console.log("=== Инициализация приложения завершена ===");
        } catch (error) {
            console.error("Ошибка инициализации приложения:", error);
            const statusElement = document.getElementById("walletStatus");
            // statusElement может не существовать, если мы на не той странице, но попробуем
            if (statusElement) {
                statusElement.textContent = "Ошибка инициализации";
            }
            const UIManager = window.UIManager;
            if (UIManager && typeof UIManager.showErrorMessage === 'function') {
                try {
                    UIManager.showErrorMessage("Ошибка инициализации приложения: " + error.message);
                } catch (uiError) {
                    console.error("Ошибка при отображении сообщения об ошибке инициализации:", uiError);
                }
            }
        }
    }

    // --- Загрузка ethers.js ---
    function loadEthersScript() {
        return new Promise((resolve, reject) => {
            console.log("Начало loadEthersScript...");
            // Проверим, может быть ethers.js уже загружена
            if (isEthersReady()) {
                console.log("Ethers.js уже готова.");
                resolve();
                return;
            }

            // Пробуем основной CDN (изменили на более надежный unpkg.com)
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/ethers@5.7.2/dist/ethers.umd.min.js';
            // Убраны integrity и crossorigin для упрощения, если они мешают
            // script.integrity = 'sha512-H/xmQ2Yk8rEe8wX5i/dsDhM5aaPfY4DvEN0aSfD+JkQVkvqaE5XgqQF47k/2rC5C5rZaXq6NnXeUm9+eQfA1pQ==';
            // script.crossOrigin = 'anonymous';
            // script.referrerPolicy = 'no-referrer';
            script.async = true; // Добавлено для асинхронной загрузки

            const handleLoad = () => {
                console.log("Скрипт ethers.js загрузился (onload).");
                setTimeout(() => {
                    if (isEthersReady()) {
                        console.log("Ethers.js готова после загрузки нового скрипта.");
                        resolve();
                    } else {
                        console.warn("Новый скрипт загрузился, но ethers.js все еще не готова. Пробуем альтернативный CDN...");
                        // Пробуем альтернативный CDN
                        loadFromAlternativeCDN().then(resolve).catch(reject);
                    }
                }, 200); // Небольшая задержка для инициализации
            };

            const handleError = (err) => {
                console.error("Ошибка загрузки ethers.js с основного CDN:", err);
                console.log("Пробуем загрузить ethers.js с альтернативного CDN...");
                loadFromAlternativeCDN().then(resolve).catch(reject);
            };

            script.onload = handleLoad;
            script.onerror = handleError;

            document.head.appendChild(script);
            console.log("Тег script для ethers.js CDN добавлен в document.head.");
        });
    }

    // Функция для загрузки с альтернативного CDN (тоже изменен)
    function loadFromAlternativeCDN() {
        return new Promise((resolve, reject) => {
            const altScript = document.createElement('script');
            // Используем другой надежный CDN
            altScript.src = 'https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js';
            // altScript.integrity = 'sha384-ruh4D4i6HrUeF7Q6gF5qewC7e6m6wX4h6j5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f';
            // altScript.crossOrigin = 'anonymous';
            altScript.async = true; // Добавлено

            const handleAltLoad = () => {
                console.log("Скрипт ethers.js загрузился с альтернативного CDN (onload).");
                setTimeout(() => {
                    if (isEthersReady()) {
                        console.log("Ethers.js готова после загрузки с альтернативного CDN.");
                        resolve();
                    } else {
                        console.error("Ethers.js не готова даже после загрузки с альтернативного CDN.");
                        reject(new Error("Ethers.js не загрузилась ни с одного CDN"));
                    }
                }, 200); // Небольшая задержка для инициализации
            };

            const handleAltError = (err) => {
                console.error("Ошибка загрузки ethers.js с альтернативного CDN:", err);
                reject(new Error("Ошибка загрузки ethers.js с альтернативного CDN"));
            };

            altScript.onload = handleAltLoad;
            altScript.onerror = handleAltError;

            document.head.appendChild(altScript);
            console.log("Тег script для альтернативного ethers.js CDN добавлен в document.head.");
        });
    }

    // Вспомогательная функция для проверки готовности ethers
    function isEthersReady() {
        try {
            const ready = typeof window.ethers !== 'undefined' &&
                typeof window.ethers.providers !== 'undefined' &&
                typeof window.ethers.providers.Web3Provider === 'function' &&
                typeof window.ethers.utils !== 'undefined';
            if (ready) {
                console.log("Ethers.js готова: window.ethers, providers и utils доступны.");
            } else {
                console.log("Ethers.js ещё не готова: некоторые компоненты отсутствуют.");
            }
            return ready;
        } catch (e) {
            console.error("Ошибка при проверке готовности ethers.js:", e);
            return false;
        }
    }

    // --- Основная логика инициализации ---
    document.addEventListener("DOMContentLoaded", async function () {
        console.log("DOM загружен. Проверка готовности ethers.js...");
        if (!isEthersReady()) {
            try {
                await loadEthersScript();
                console.log("Ethers.js успешно загружена.");
            } catch (loadError) {
                console.error("Критическая ошибка загрузки ethers.js:", loadError);
                // Показать сообщение пользователю, если ethers.js не загрузилась
                const statusElement = document.getElementById("walletStatus");
                if (statusElement) {
                    statusElement.textContent = "Критическая ошибка: библиотека ethers.js не загрузилась.";
                }
                return; // Прерываем инициализацию
            }
        }

        console.log("Проверка готовности ethers.js завершена. Запуск initApp...");
        await initApp();
        console.log("Функция initApp завершена.");
    });

    // Делаем initApp доступной глобально, если нужно вызвать из другого места
    window.initApp = initApp;

})();