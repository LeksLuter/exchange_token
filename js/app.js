// Все зависимости теперь глобальные

// --- Функция для программной загрузки ethers.js ---
// Упрощенная версия: всегда пытаемся загрузить, если не готова
function loadEthersScript() {
  return new Promise((resolve, reject) => {
    console.log("Начало loadEthersScript...");
    // 1. Проверяем, готова ли библиотека уже
    if (isEthersReady()) {
      console.log("ethers.js уже полностью загружена и инициализирована.");
      resolve();
      return;
    }
    // 2. Если не готова, создаем новый тег script
    console.log("ethers.js не готова, создаем новый тег script для загрузки.");
    // Проверим, может быть тег уже есть, но не сработал - удалим его для чистоты
    const existingScripts = document.querySelectorAll('script[src*="ethers"]');
    existingScripts.forEach(script => {
      if (script.parentNode) {
        console.log("Удаляем существующий (возможно, проблемный) тег script для ethers:", script.src);
        script.parentNode.removeChild(script);
      }
    });
    // Создаем новый тег script
    const script = document.createElement('script');
    script.src = 'https://cdn.ethers.io/lib/ethers-5.7.umd.min.js'; // Основной CDN
    script.type = 'application/javascript';
    script.async = true; // Асинхронная загрузка
    console.log("Создан новый тег script для ethers.js, URL:", script.src);
    const handleLoad = () => {
      console.log("Событие onload для нового ethers.js script tag сработало.");
      // Даем немного времени на инициализацию в window
      setTimeout(() => {
        console.log("Таймаут после onload нового ethers.js script tag завершен.");
        if (isEthersReady()) {
          console.log("Ethers.js готова после загрузки нового скрипта.");
          resolve();
        } else {
          console.warn("Новый скрипт загрузился, но ethers.js все еще не готова. Пробуем альтернативный CDN...");
          // Пробуем альтернативный CDN
          loadFromAlternativeCDN().then(resolve).catch(reject);
        }
      }, 200);
    };
    const handleError = (err) => {
      console.error("Ошибка загрузки ethers.js с основного CDN:", err);
      console.log("Пробуем загрузить ethers.js с альтернативного CDN...");
      loadFromAlternativeCDN().then(resolve).catch(reject);
    };
    script.onload = handleLoad;
    script.onerror = handleError;
    // Добавляем тег в <head> документа
    document.head.appendChild(script);
    console.log("Новый тег script для ethers.js добавлен в document.head.");
  });
}

// Вспомогательная функция для загрузки с альтернативного CDN
function loadFromAlternativeCDN() {
  return new Promise((resolve, reject) => {
    const altScript = document.createElement('script');
    // Используем более надежный CDN
    altScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.min.js';
    altScript.type = 'application/javascript';
    altScript.async = true;
    console.log("Создан тег script для альтернативного ethers.js CDN, URL:", altScript.src);
    altScript.onload = () => {
      console.log("Ethers.js успешно загружена с альтернативного CDN.");
      setTimeout(() => {
        if (isEthersReady()) {
          console.log("Ethers.js готова после загрузки с альтернативного CDN.");
          resolve();
        } else {
          console.error("Скрипт с альтернативного CDN загрузился, но ethers.js так и не стала готовой.");
          reject(new Error("Ethers.js загружена с альтернативного CDN, но не инициализировалась."));
        }
      }, 200);
    };
    altScript.onerror = (altErr) => {
      console.error("Ошибка загрузки ethers.js с альтернативного CDN:", altErr);
      reject(new Error("Не удалось загрузить библиотеку ethers.js ни с одного CDN."));
    };
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
      console.log("Проверка isEthersReady: TRUE");
    } else {
      console.log("Проверка isEthersReady: FALSE. Состояние window.ethers:",
        typeof window.ethers,
        ", window.ethers.providers:",
        typeof window.ethers?.providers,
        ", Web3Provider:",
        typeof window.ethers?.providers?.Web3Provider,
        ", utils:",
        typeof window.ethers?.utils
      );
    }
    return ready;
  } catch (e) {
    console.log("Ошибка при проверке готовности ethers.js в isEthersReady:", e.message);
    return false;
  }
}

// --- Переработанная функция ожидания ---
function waitForEthers(maxAttempts = 30, interval = 300) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      const isReady = isEthersReady();
      console.log(`Ожидание инициализации ethers.js... Попытка ${attempts}/${maxAttempts}`);
      console.log(`  window.ethers: ${typeof window.ethers !== 'undefined'}`);
      console.log(`  window.ethers.providers: ${typeof window.ethers !== 'undefined' && typeof window.ethers.providers !== 'undefined'}`);
      console.log(`  window.ethers.providers.Web3Provider: ${typeof window.ethers !== 'undefined' && typeof window.ethers.providers !== 'undefined' && typeof window.ethers.providers.Web3Provider !== 'undefined'}`);
      console.log(`  window.ethers.utils: ${typeof window.ethers !== 'undefined' && typeof window.ethers.utils !== 'undefined'}`);
      if (isReady) {
        console.log("Библиотека ethers.js обнаружена и готова к использованию.");
        resolve();
      } else if (attempts < maxAttempts) {
        setTimeout(check, interval);
      } else {
        const errorMsg = `Библиотека ethers.js не обнаружена или не инициализирована за отведенное время (${maxAttempts * interval}ms).`;
        console.error(errorMsg);
        console.error("Состояние при завершении ожидания:");
        console.error("  typeof window.ethers:", typeof window.ethers);
        if (window.ethers) {
          console.error("  typeof window.ethers.providers:", typeof window.ethers.providers);
          if (window.ethers.providers) {
            console.error("  typeof window.ethers.providers.Web3Provider:", typeof window.ethers.providers.Web3Provider);
          }
          console.error("  typeof window.ethers.utils:", typeof window.ethers.utils);
          try {
            console.error("  window.ethers.version (если есть):", window.ethers.version);
          } catch (e) {
            console.error("  Ошибка при попытке получить window.ethers.version:", e.message);
          }
        } else {
          console.error("  window.ethers отсутствует.");
        }
        reject(new Error(errorMsg));
      }
    };
    check();
  });
}

// Проверка наличия Web3 кошелька
async function checkWallet() {
  const statusElement = document.getElementById("walletStatus");
  const actionBtn = document.getElementById("actionBtn");
  const messageContainer = document.getElementById("messageContainer");
  if (!statusElement || !actionBtn) {
    console.error("Критичные UI элементы не найдены в checkWallet");
    return false;
  }
  messageContainer.innerHTML = "";
  console.log("=== Начало проверки кошелька ===");

  // --- Загружаем ethers.js программно ---
  try {
    console.log("Начинаем загрузку ethers.js...");
    await loadEthersScript();
    console.log("Загрузка ethers.js завершена (или она уже была загружена).");
  } catch (loadErr) {
    console.error("Критическая ошибка загрузки ethers.js:", loadErr);
    statusElement.textContent = "Критическая ошибка загрузки ethers.js";
    const UIManager = window.UIManager;
    if (UIManager && typeof UIManager.showErrorMessage === 'function') {
      UIManager.showErrorMessage("Критическая ошибка загрузки ethers.js: " + loadErr.message);
    } else {
      const errorDiv = document.createElement("div");
      errorDiv.className = "error-message";
      errorDiv.textContent = "Критическая ошибка загрузки ethers.js: " + loadErr.message;
      messageContainer.appendChild(errorDiv);
    }
    return false;
  }

  // --- Ждем инициализацию ethers.js ---
  console.log("Начинаем ожидание инициализации ethers.js...");
  try {
    await waitForEthers();
    if (!isEthersReady()) {
      const detailedErrorMsg = "Библиотека ethers.js загружена, но ключевые компоненты отсутствуют или некорректны после ожидания.";
      console.error(detailedErrorMsg);
      throw new Error(detailedErrorMsg);
    }
    console.log("ethers.js полностью проверена и готова к использованию.");
  } catch (err) {
    console.error("Ошибка ожидания и инициализации ethers.js:", err);
    statusElement.textContent = "Ошибка инициализации ethers.js";
    const UIManager = window.UIManager;
    if (UIManager && typeof UIManager.showErrorMessage === 'function') {
      UIManager.showErrorMessage("Ошибка инициализации ethers.js: " + err.message);
    } else {
      const errorDiv = document.createElement("div");
      errorDiv.className = "error-message";
      errorDiv.textContent = "Ошибка инициализации ethers.js: " + err.message;
      messageContainer.appendChild(errorDiv);
    }
    return false;
  }

  // Убедимся, что walletManager доступен
  const walletManager = window.walletManager;
  if (!walletManager) {
    console.error("walletManager не инициализирован");
    statusElement.textContent = "Ошибка: walletManager не инициализирован";
    return false;
  }

  // --- Восстановление состояния подключения ---
  const { connected, address } = walletManager.restoreConnectionState();
  console.log("Состояние подключения из localStorage:", { connected, address });
  if (connected && address && typeof window.ethereum !== "undefined") {
    console.log("MetaMask доступен, проверяем аккаунты для восстановления...");
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      console.log("Аккаунты из MetaMask:", accounts);
      // Приводим адреса к нижнему регистру для сравнения
      const normalizedAddress = address.toLowerCase();
      const normalizedAccounts = accounts.map(acc => acc.toLowerCase());
      if (accounts && normalizedAccounts.includes(normalizedAddress)) {
        console.log("Восстанавливаем подключение для адреса:", address);
        const success = await walletManager.restoreConnection(address);
        if (success) {
          console.log("Подключение успешно восстановлено");
          const UIManager = window.UIManager;
          if (UIManager && typeof UIManager.showSuccessMessage === 'function') {
            UIManager.showSuccessMessage("Подключение восстановлено!");
          }
          // Проверяем, доступна ли функция updateWalletUI в window перед вызовом
          if (typeof window.updateWalletUI === 'function') {
            window.updateWalletUI(); // Обновляем UI после восстановления
          } else {
            console.error("window.updateWalletUI не является функцией при восстановлении");
            // fallback на локальную функцию, если она доступна
            if (typeof updateWalletUI === 'function') {
              updateWalletUI();
            }
          }
          console.log("=== Проверка кошелька завершена успешно (восстановлено) ===");
          return true; // Возвращаем true, так как подключение восстановлено
        } else {
          console.log("Не удалось восстановить подключение");
          localStorage.removeItem('walletConnected');
          localStorage.removeItem('walletAddress');
        }
      } else {
        console.log("Аккаунт не найден или не совпадает, очищаем сохраненное состояние");
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletAddress');
      }
    } catch (err) {
      console.error("Ошибка при проверке аккаунтов для восстановления:", err);
      localStorage.removeItem('walletConnected');
      localStorage.removeItem('walletAddress');
    }
  }

  // --- Проверка текущего состояния MetaMask ---
  if (typeof window.ethereum !== "undefined") {
    console.log("MetaMask обнаружен, запрашиваем аккаунты...");
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      console.log("Текущие аккаунты:", accounts);
      if (accounts && accounts.length > 0) {
        // MetaMask обнаружен и есть аккаунты, но подключение не было восстановлено
        statusElement.textContent = "Кошелек обнаружен";
        actionBtn.textContent = "Подключить кошелек";
        actionBtn.onclick = () => {
          if (typeof window.connectWallet === 'function') {
            window.connectWallet();
          } else {
            console.error("Глобальная функция connectWallet не найдена");
            walletManager.connect().then(() => {
              // Проверяем, доступна ли функция updateWalletUI в window перед вызовом
              if (typeof window.updateWalletUI === 'function') {
                window.updateWalletUI();
              } else {
                console.error("window.updateWalletUI не является функцией после подключения");
                // fallback на локальную функцию, если она доступна
                if (typeof updateWalletUI === 'function') {
                  updateWalletUI();
                }
              }
            }).catch(err => {
              console.error("Ошибка подключения:", err);
              const UIManager = window.UIManager;
              if (UIManager && typeof UIManager.showErrorMessage === 'function') {
                UIManager.showErrorMessage("Ошибка подключения: " + err.message);
              }
              // Проверяем, доступна ли функция updateWalletUI в window перед вызовом
              if (typeof window.updateWalletUI === 'function') {
                window.updateWalletUI();
              } else {
                console.error("window.updateWalletUI не является функцией после ошибки подключения");
                // fallback на локальную функцию, если она доступна
                if (typeof updateWalletUI === 'function') {
                  updateWalletUI();
                }
              }
            });
          }
        };
        actionBtn.className = "btn connect";
        actionBtn.disabled = false;
        console.log("Кошелек готов к подключению");
        // Проверяем, доступна ли функция updateWalletUI в window перед вызовом
        if (typeof window.updateWalletUI === 'function') {
          window.updateWalletUI(); // Обновляем UI для отображения состояния "обнаружен"
        } else {
          console.error("window.updateWalletUI не является функцией при обнаружении");
          // fallback на локальную функцию, если она доступна
          if (typeof updateWalletUI === 'function') {
            updateWalletUI();
          }
        }
        console.log("=== Проверка кошелька завершена успешно (кошелек готов) ===");
        return true; // MetaMask обнаружен, можно подключиться
      } else {
        // MetaMask обнаружен, но аккаунты не доступны (не подключен)
        statusElement.textContent = "Кошелек не подключен";
        actionBtn.textContent = "Подключить кошелек";
        actionBtn.onclick = () => {
          if (typeof window.connectWallet === 'function') {
            window.connectWallet();
          } else {
            walletManager.connect().then(() => {
              // Проверяем, доступна ли функция updateWalletUI в window перед вызовом
              if (typeof window.updateWalletUI === 'function') {
                window.updateWalletUI();
              } else {
                console.error("window.updateWalletUI не является функцией после подключения");
                // fallback на локальную функцию, если она доступна
                if (typeof updateWalletUI === 'function') {
                  updateWalletUI();
                }
              }
            }).catch(err => {
              console.error("Ошибка подключения:", err);
              const UIManager = window.UIManager;
              if (UIManager && typeof UIManager.showErrorMessage === 'function') {
                UIManager.showErrorMessage("Ошибка подключения: " + err.message);
              }
              // Проверяем, доступна ли функция updateWalletUI в window перед вызовом
              if (typeof window.updateWalletUI === 'function') {
                window.updateWalletUI();
              } else {
                console.error("window.updateWalletUI не является функцией после ошибки подключения");
                // fallback на локальную функцию, если она доступна
                if (typeof updateWalletUI === 'function') {
                  updateWalletUI();
                }
              }
            });
          }
        };
        actionBtn.className = "btn connect";
        actionBtn.disabled = false;
        console.log("Кошелек обнаружен, но не подключен");
        // Проверяем, доступна ли функция updateWalletUI в window перед вызовом
        if (typeof window.updateWalletUI === 'function') {
          window.updateWalletUI(); // Обновляем UI для отображения состояния "не подключен"
        } else {
          console.error("window.updateWalletUI не является функцией при не подключенном состоянии");
          // fallback на локальную функцию, если она доступна
          if (typeof updateWalletUI === 'function') {
            updateWalletUI();
          }
        }
        console.log("=== Проверка кошелька завершена (обнаружен, но не подключен) ===");
        return false; // MetaMask есть, но не подключен
      }
    } catch (err) {
      console.error("Ошибка при проверке аккаунтов:", err);
      statusElement.textContent = "Ошибка при проверке кошелька";
      const UIManager = window.UIManager;
      if (UIManager && typeof UIManager.showErrorMessage === 'function') {
        UIManager.showErrorMessage("Не удалось проверить кошелек: " + err.message);
      }
      // Проверяем, доступна ли функция updateWalletUI в window перед вызовом
      if (typeof window.updateWalletUI === 'function') {
        window.updateWalletUI();
      } else {
        console.error("window.updateWalletUI не является функцией после ошибки проверки аккаунтов");
        // fallback на локальную функцию, если она доступна
        if (typeof updateWalletUI === 'function') {
          updateWalletUI();
        }
      }
      console.log("=== Проверка кошелька завершена с ошибкой (MetaMask ошибка) ===");
      return false;
    }
  } else {
    // MetaMask не обнаружен
    console.log("MetaMask не обнаружен");
    statusElement.textContent = "Web3 кошелек не обнаружен";
    actionBtn.textContent = "Установить MetaMask";
    actionBtn.onclick = () => {
      if (typeof window.installWallet === 'function') {
        window.installWallet();
      } else {
        if (typeof installWallet === 'function') {
          installWallet();
        } else {
          const UIManager = window.UIManager;
          if (UIManager && typeof UIManager.showErrorMessage === 'function') {
            UIManager.showErrorMessage("Функция установки кошелька недоступна.");
          }
        }
      }
    };
    actionBtn.className = "btn install";
    actionBtn.disabled = false;
    const messageDiv = document.createElement("div");
    messageDiv.className = "error-message";
    messageDiv.textContent = "Для работы приложения необходимо установить расширение MetaMask.";
    messageContainer.appendChild(messageDiv);
    const UIManager = window.UIManager;
    if (UIManager && typeof UIManager.showInstallationInstructions === 'function') {
      UIManager.showInstallationInstructions();
    }
    const retryBtn = document.createElement("button");
    retryBtn.className = "btn retry";
    retryBtn.textContent = "Проверить снова";
    retryBtn.onclick = () => {
      console.log("Повторная проверка кошелька...");
      checkWallet();
    };
    messageContainer.appendChild(retryBtn);
    // Проверяем, доступна ли функция updateWalletUI в window перед вызовом
    if (typeof window.updateWalletUI === 'function') {
      window.updateWalletUI();
    } else {
      console.error("window.updateWalletUI не является функцией при отсутствии MetaMask");
      // fallback на локальную функцию, если она доступна
      if (typeof updateWalletUI === 'function') {
        updateWalletUI();
      }
    }
    console.log("=== Проверка кошелька завершена (MetaMask не найден) ===");
    return false;
  }
}


// Инициализация приложения
async function initApp() {
  console.log("=== Инициализация приложения ===");
  try {
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log("Запуск проверки кошелька...");
    const result = await checkWallet();
    console.log("Результат проверки кошелька:", result);

    // --- Инициализация списков токенов и UI ---
    console.log("Инициализация списков токенов...");
    // Предполагается, что window.tokenListManager и window.UIManager уже доступны глобально

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
    const statusElement = document.getElementById("walletStatus");
    if (statusElement) {
      statusElement.textContent = "Ошибка инициализации";
    }
    const UIManager = window.UIManager;
    if (UIManager && typeof UIManager.showErrorMessage === 'function') {
      UIManager.showErrorMessage("Ошибка инициализации приложения: " + error.message);
    }
  }
  const inputs = document.querySelectorAll("input");
  if (inputs) {
    inputs.forEach((input) => {
      if (input && typeof input.addEventListener === 'function') {
        input.addEventListener("focus", function () {
          this.setAttribute("readonly", "readonly");
          setTimeout(() => {
            this.removeAttribute("readonly");
          }, 100);
        });
      }
    });
  }
}

// Делаем функции доступными глобально для HTML onclick
window.handleAction = window.handleAction || function () { console.warn("handleAction not yet defined"); };
window.exchangeTokens = window.exchangeTokens || function () {
  if (window.exchangeManager) {
    window.exchangeManager.exchangeTokens();
  } else {
    console.error("exchangeManager не доступен");
    const UIManager = window.UIManager;
    if (UIManager && typeof UIManager.showErrorMessage === 'function') {
      UIManager.showErrorMessage("Ошибка: Менеджер обмена не инициализирован.");
    } else {
      const messageContainer = document.getElementById("messageContainer");
      if (messageContainer) {
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.textContent = "Ошибка: Менеджер обмена не инициализирован.";
        messageContainer.appendChild(errorDiv);
      }
    }
  }
};

// Убедимся, что DOMContentLoaded обработчик добавляется только один раз
if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM загружен, запускаем initApp...");
    initApp();
  });
} else {
  // DOM уже загружен
  console.log("DOM уже загружен, запускаем initApp...");
  initApp();
}