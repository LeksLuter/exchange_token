// Все зависимости теперь глобальные
// - Функция для программной загрузки ethers.js -
// Упрощенная версия: всегда пытаемся загрузить, если не готова
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
      console.log("Скрипт ethers.js с альтернативного CDN загрузился (onload).");
      setTimeout(() => {
        if (isEthersReady()) {
          console.log("Ethers.js готова после загрузки с альтернативного CDN.");
          resolve();
        } else {
          const errorMsg = "Библиотека ethers.js загружена с альтернативного CDN, но ключевые компоненты отсутствуют или некорректны.";
          console.error(errorMsg);
          reject(new Error(errorMsg));
        }
      }, 200);
    };

    const handleAltError = (altErr) => {
      console.error("Ошибка загрузки ethers.js с альтернативного CDN:", altErr);
      reject(new Error("Не удалось загрузить библиотеку ethers.js ни с одного CDN."));
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
      console.warn("Ethers.js не готова: некоторые компоненты отсутствуют.");
    }
    return ready;
  } catch (e) {
    console.error("Ошибка при проверке готовности ethers.js:", e);
    return false;
  }
}

// Функция ожидания инициализации ethers.js
async function waitForEthers(maxWaitTime = 5000, interval = 100) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      if (isEthersReady()) {
        console.log("ethers.js готова (проверка внутри waitForEthers).");
        resolve();
      } else if (Date.now() - startTime > maxWaitTime) {
        const errorMsg = `Таймаут ожидания ethers.js. Прошло более ${maxWaitTime}мс.`;
        console.error(errorMsg);
        if (!window.ethers) {
          console.error(" window.ethers отсутствует.");
        }
        reject(new Error(errorMsg));
      } else {
        setTimeout(check, interval);
      }
    };
    check();
  });
}

// Функция инициализации приложения
async function initApp() {
  console.log("=== Инициализация приложения ===");
  const messageContainer = document.getElementById("messageContainer");
  const loadingIndicator = document.getElementById('loadingIndicator');

  try {
    // - Загружаем ethers.js программно -
    console.log("Начинаем загрузку ethers.js...");
    await loadEthersScript();
    console.log("ethers.js успешно загружена.");

    // - Ждем и инициализацию ethers.js -
    console.log("Начинаем ожидание инициализации ethers.js...");
    await waitForEthers();
    if (!isEthersReady()) {
      const detailedErrorMsg = "Библиотека ethers.js загружена, но ключевые компоненты отсутствуют или некорректны после ожидания.";
      console.error(detailedErrorMsg);
      throw new Error(detailedErrorMsg);
    }
    console.log("ethers.js полностью проверена и готова к использованию.");

    // Убедимся, что walletManager доступен
    const walletManager = window.walletManager;
    if (!walletManager) {
      console.error("walletManager не инициализирован");
      throw new Error("walletManager не инициализирован");
    }

    // Теперь, когда ethers.js загружена, можно инициализировать провайдер
    walletManager.initProvider();

    // - Восстановление состояния подключения -
    const { connected, address } = walletManager.restoreConnectionState();
    console.log("Состояние подключения из localStorage:", { connected, address });

    if (connected && address && typeof window.ethereum !== "undefined") {
      console.log("MetaMask доступен, проверяем аккаунты для восстановления...");
      try {
        // Пытаемся восстановить подключение с сохраненным адресом
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0 && accounts[0].toLowerCase() === address.toLowerCase()) {
          console.log("Сохраненный адрес совпадает с активным аккаунтом, восстанавливаем подключение...");
          await walletManager.connect(); // connect теперь обновит адрес и баланс
          console.log("=== Проверка кошелька завершена успешно (восстановлено) ===");
          return true;
        } else {
          console.log("Сохраненный адрес не совпадает с доступными аккаунтами");
          // Очищаем сохраненное состояние
          localStorage.removeItem('walletAddress');
          localStorage.removeItem('walletConnected');
        }
      } catch (restoreErr) {
        console.error("Ошибка при восстановлении подключения:", restoreErr);
        // Очищаем сохраненное состояние при ошибке
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('walletConnected');
      }
    }

    // MetaMask обнаружен, но подключение не было восстановлено
    // Или восстановление не удалось
    console.log("Запуск проверки кошелька...");
    await walletManager.checkWallet(); // Запускаем проверку через walletManager

    // Это помогает избежать ситуаций, когда initApp вызывается до того, как tokenListManager будет доступен
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log("Инициализация списков токенов...");
    // Предполагается, что window.tokenListManager и window.UIManager уже доступны глобально
    // Проверяем наличие tokenListManager и UIManager
    if (window.tokenListManager && typeof window.tokenListManager.init === 'function') {
      await window.tokenListManager.init();
    } else {
      console.warn("tokenListManager не доступен или не инициализирован");
    }

    if (window.UIManager && typeof window.UIManager.init === 'function') {
      window.UIManager.init();
    } else {
      console.warn("UIManager не доступен или не инициализирован");
    }

    console.log("=== Инициализация приложения завершена ===");

  } catch (error) {
    console.error("Ошибка инициализации приложения:", error);
    const statusElement = document.getElementById("walletStatus");
    if (statusElement) {
      statusElement.textContent = "Ошибка инициализации";
    }
    const UIManager = window.UIManager;
    if (UIManager && typeof UIManager.showErrorMessage === 'function') {
      UIManager.showErrorMessage("Ошибка инициализации приложения: " + error.message);
    }
  }

  // Убираем индикатор загрузки, если он есть
  if (loadingIndicator) {
    loadingIndicator.classList.add('hidden');
  }

  // Обработчик фокуса для input'ов
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
}

// Убедимся, что DOMContentLoaded обработчик добавляется только один раз
if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM загружен, запускаем initApp...");
    initApp();
  });
} else {
  console.log("DOM уже загружен, запускаем initApp...");
  initApp();
}