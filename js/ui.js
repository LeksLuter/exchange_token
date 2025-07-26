// js/ui.js

// Используем глобальный walletManager. tokenListManager будет доступен из window позже.
const walletManager = window.walletManager;
// Убираем повторное объявление const tokenListManager, используем window.tokenListManager напрямую

class UIManager {
  static showErrorMessage(message) {
    console.log("Показ сообщения об ошибке:", message);
    const messageContainer = document.getElementById("messageContainer");
    if (!messageContainer) {
      console.warn("Элемент messageContainer не найден для showErrorMessage");
      return;
    }
    messageContainer.innerHTML = "";
    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.textContent = message;
    messageContainer.appendChild(errorElement);
    setTimeout(() => {
      if (errorElement.parentNode) {
        errorElement.remove();
      }
    }, 5000);
  }

  static showSuccessMessage(message) {
    console.log("Показ сообщения об успехе:", message);
    const messageContainer = document.getElementById("messageContainer");
    if (!messageContainer) {
      console.warn("Элемент messageContainer не найден для showSuccessMessage");
      return;
    }
    messageContainer.innerHTML = "";
    const successElement = document.createElement("div");
    successElement.className = "success-message";
    successElement.textContent = message;
    messageContainer.appendChild(successElement);
    setTimeout(() => {
      if (successElement.parentNode) {
        successElement.remove();
      }
    }, 3000);
  }

  static showInfoMessage(message) {
    console.log("Показ информационного сообщения:", message);
    const messageContainer = document.getElementById("messageContainer");
    if (!messageContainer) {
      console.warn("Элемент messageContainer не найден для showInfoMessage");
      return;
    }
    messageContainer.innerHTML = "";
    const infoElement = document.createElement("div");
    infoElement.className = "info-message";
    infoElement.textContent = message;
    messageContainer.appendChild(infoElement);
    setTimeout(() => {
      if (infoElement.parentNode) {
        infoElement.remove();
      }
    }, 3000);
  }

  static showWarningMessage(message) {
    console.log("Показ предупреждения:", message);
    const messageContainer = document.getElementById("messageContainer");
    if (!messageContainer) {
      console.warn("Элемент messageContainer не найден для showWarningMessage");
      return;
    }
    messageContainer.innerHTML = "";
    const warningElement = document.createElement("div");
    warningElement.className = "warning-message";
    warningElement.textContent = message;
    messageContainer.appendChild(warningElement);
    setTimeout(() => {
      if (warningElement.parentNode) {
        warningElement.remove();
      }
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
    const oldTokenSelect = document.getElementById('oldTokenSelect');
    const newTokenSelect = document.getElementById('newTokenSelect');
    if (!oldTokenSelect || !newTokenSelect) {
      console.warn("Элементы oldTokenSelect или newTokenSelect не найдены для updateTokenSelects");
      return;
    }
    // Очищаем текущие опции
    oldTokenSelect.innerHTML = '';
    newTokenSelect.innerHTML = '';

    // Заполняем опции для старых токенов
    // Используем window.tokenListManager напрямую
    if (window.tokenListManager && typeof window.tokenListManager.getTokens === 'function') {
      const oldTokens = window.tokenListManager.getTokens('old');
      oldTokens.forEach((token, index) => {
        const option = document.createElement('option');
        option.value = token.contract;
        option.textContent = `${token.name} (${token.symbol})`;
        option.dataset.name = token.name;
        option.dataset.symbol = token.symbol;
        oldTokenSelect.appendChild(option);
      });
    } else {
      console.error("window.tokenListManager или его метод getTokens недоступен для старых токенов");
    }

    // Заполняем опции для новых токенов
    if (window.tokenListManager && typeof window.tokenListManager.getTokens === 'function') {
      const newTokens = window.tokenListManager.getTokens('new');
      newTokens.forEach((token, index) => {
        const option = document.createElement('option');
        option.value = token.contract;
        option.textContent = `${token.name} (${token.symbol})`;
        option.dataset.name = token.name;
        option.dataset.symbol = token.symbol;
        newTokenSelect.appendChild(option);
      });
    } else {
      console.error("window.tokenListManager или его метод getTokens недоступен для новых токенов");
    }
    console.log("Выпадающие списки токенов обновлены");
  }

  // Новый метод для открытия модального окна добавления токена
  static openAddTokenModal(targetType) {
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

    // --- Добавляем обработчик blur для автозаполнения ---
    if (tokenAddressInput) {
        // Удаляем предыдущий обработчик, если он был (чтобы не дублировались)
        if (tokenAddressInput._autoFillHandler) {
            tokenAddressInput.removeEventListener('blur', tokenAddressInput._autoFillHandler);
        }
        // Определяем новую функцию обработчика
        const autoFillHandler = async function() {
            const address = this.value.trim();
            if (!address) return;

            // Проверка валидности адреса
            if (typeof window.ethers === 'undefined' ||
                typeof window.ethers.utils === 'undefined' ||
                typeof window.ethers.utils.isAddress !== 'function') {
                console.error("ethers.js не загружена или не содержит utils.isAddress");
                if(tokenMessageContainer) UIManager.showTokenMessage("Ошибка: Библиотека ethers.js не готова.", true);
                return;
            }

            if (!window.ethers.utils.isAddress(address)) {
                // Не показываем ошибку, просто выходим, так как пользователь еще может вводить
                return;
            }

            // Проверяем, есть ли уже такой токен в соответствующем списке
            const type = modal.dataset.targetType === 'old' ? 'old' : 'new';
            if (window.tokenListManager && typeof window.tokenListManager.getTokens === 'function') {
                 const existingTokens = window.tokenListManager.getTokens(type);
                 const isDuplicate = existingTokens.some(t => t.contract.toLowerCase() === address.toLowerCase());
                 if(isDuplicate) {
                     if(tokenMessageContainer) UIManager.showTokenMessage(`Токен с адресом ${address} уже существует в этом списке.`, true);
                     return;
                 }
            }

            // Показываем сообщение о загрузке
            if(tokenMessageContainer) UIManager.showTokenMessage("Получение данных токена...");

            try {
                // Получаем провайдер из walletManager
                const provider = window.walletManager?.provider;
                if (!provider) {
                    throw new Error("Провайдер кошелька не доступен. Подключите кошелек.");
                }

                // ABI для вызова name() и symbol()
                const erc20ABI = [
                    "function name() view returns (string)",
                    "function symbol() view returns (string)"
                ];

                // Создаем контракт
                const contract = new window.ethers.Contract(address, erc20ABI, provider);

                // Выполняем вызовы
                const [nameResult, symbolResult] = await Promise.allSettled([
                    contract.name(),
                    contract.symbol()
                ]);

                let name = "";
                let symbol = "";
                let hasError = false;

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

                // Заполняем поля
                if (tokenNameInput) tokenNameInput.value = name;
                if (tokenSymbolInput) tokenSymbolInput.value = symbol;

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
    // --- Конец обработчика автозаполнения ---
  }

  // Новый метод для закрытия модального окна добавления токена
  static closeAddTokenModal() {
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
    if (!tokenMessageContainer) {
      console.warn("Элемент tokenMessageContainer не найден для showTokenMessage");
      return;
    }
    tokenMessageContainer.innerHTML = '';
    const messageElement = document.createElement("div");
    messageElement.className = isError ? "error-message" : "success-message";
    messageElement.textContent = message;
    tokenMessageContainer.appendChild(messageElement);
    if (!isError) {
      setTimeout(() => {
        if (messageElement.parentNode) {
          messageElement.remove();
        }
      }, 3000);
    }
  }
}

// Глобальная функция обновления UI кошелька
function updateWalletUI() {
  console.log("Обновление UI кошелька, isConnected:", walletManager.isConnected);
  const walletInfo = document.getElementById("walletInfo");
  const walletStatus = document.getElementById("walletStatus");
  const walletAddressElement = document.getElementById("walletAddress");
  const actionBtn = document.getElementById("actionBtn");
  const exchangeSection = document.getElementById("exchangeSection");
  const ownerInfo = document.getElementById("ownerInfo");
  if (!walletInfo || !walletStatus || !actionBtn || !exchangeSection) {
    console.error("Один или несколько UI элементов не найдены в updateWalletUI");
    return;
  }
  if (walletManager.isConnected) {
    walletInfo.classList.add("connected");
    walletStatus.textContent = "Кошелек подключен";
    if (walletAddressElement) {
      walletAddressElement.textContent = `${walletManager.walletAddress.substring(
        0,
        6
      )}...${walletManager.walletAddress.substring(38)}`;
      walletAddressElement.style.display = "block";
    }
    actionBtn.textContent = "Отключить кошелек";
    actionBtn.onclick = () => {
      console.log("Отключение кошелька...");
      walletManager.disconnect();
      updateWalletUI(); // Рекурсивный вызов внутри функции допустим
    };
    actionBtn.className = "btn disconnect";
    actionBtn.disabled = false;
    exchangeSection.classList.add("enabled");
    if (ownerInfo) ownerInfo.style.display = "block";
  } else {
    walletInfo.classList.remove("connected");
    if (typeof window.ethereum !== "undefined") {
      // MetaMask есть, но не подключен
      walletStatus.textContent = "Кошелек обнаружен, но не подключен";
      actionBtn.textContent = "Подключить кошелек";
      // Используем глобальную функцию connectWallet из window
      actionBtn.onclick = () => {
        if (typeof window.connectWallet === 'function') {
          window.connectWallet();
        } else {
          console.error("Глобальная функция connectWallet не найдена");
          // fallback на walletManager.connect
          walletManager.connect().then(() => {
            updateWalletUI();
          }).catch(err => {
            console.error("Ошибка подключения:", err);
            UIManager.showErrorMessage("Ошибка подключения: " + err.message);
            updateWalletUI();
          });
        }
      };
      actionBtn.className = "btn connect";
      actionBtn.disabled = false;
    } else {
      // MetaMask отсутствует
      walletStatus.textContent = "Web3 кошелек не обнаружен";
      actionBtn.textContent = "Установить MetaMask";
      actionBtn.onclick = () => {
        if (typeof window.installWallet === 'function') {
          window.installWallet();
        } else {
          console.error("Глобальная функция installWallet не найдена");
          // fallback на локальную функцию
          installWallet();
        }
      };
      actionBtn.className = "btn install";
      actionBtn.disabled = false;
    }
    if (walletAddressElement) walletAddressElement.style.display = "none";
    exchangeSection.classList.remove("enabled");
    if (ownerInfo) ownerInfo.style.display = "none";
  }
}

// Функция обработки действий с кошельком
function handleAction() {
  console.log("handleAction вызван, isConnected:", walletManager.isConnected);
  if (walletManager.isConnected) {
    console.log("Отключение кошелька...");
    walletManager.disconnect();
    updateWalletUI();
  } else if (typeof window.ethereum !== "undefined") {
    console.log("Попытка подключения к кошельку...");
    // Используем глобальную функцию connectWallet из window
    if (typeof window.connectWallet === 'function') {
      window.connectWallet();
    } else {
      console.error("Глобальная функция connectWallet не найдена в handleAction");
      // fallback на walletManager.connect
      walletManager.connect().then(() => {
        updateWalletUI();
      }).catch(err => {
        console.error("Ошибка подключения:", err);
        UIManager.showErrorMessage("Ошибка подключения: " + err.message);
        updateWalletUI();
      });
    }
  } else {
    console.log("MetaMask не обнаружен, предлагаем установить...");
    // Используем глобальную функцию installWallet из window
    if (typeof window.installWallet === 'function') {
      window.installWallet();
    } else {
      console.error("Глобальная функция installWallet не найдена в handleAction");
      // fallback на локальную функцию
      installWallet();
    }
  }
}

// Функция установки кошелька
function installWallet() {
  console.log("Открываем страницу установки MetaMask...");
  const installUrl = "https://metamask.io/download/";
  const newWindow = window.open(installUrl, "_blank");
  if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
    UIManager.showWarningMessage("Всплывающие окна заблокированы. Пожалуйста, разрешите всплывающие окна и попробуйте снова.");
    const messageContainer = document.getElementById("messageContainer");
    if (messageContainer) {
      const linkBtn = document.createElement("button");
      linkBtn.className = "btn external-link";
      linkBtn.textContent = "Перейти к установке MetaMask";
      linkBtn.onclick = function () {
        window.location.href = installUrl;
      };
      linkBtn.style.marginTop = "10px";
      messageContainer.appendChild(linkBtn);
    }
  }
}

// --- Обработчики событий для модального окна ---
// Закрытие модального окна по клику на крестик
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('addTokenModal');
  const span = modal ? modal.querySelector('.close') : null;
  const confirmBtn = document.getElementById('confirmAddTokenBtn');

  if (span) {
    span.onclick = function () {
      UIManager.closeAddTokenModal();
    }
  }

  // Закрытие модального окна по клику вне его
  window.onclick = function (event) {
    if (event.target == modal) {
      UIManager.closeAddTokenModal();
    }
  }

  // Обработчик кнопки подтверждения добавления токена
  if (confirmBtn) {
    confirmBtn.onclick = function () {
      const tokenAddressInput = document.getElementById('tokenAddress');
      const tokenNameInput = document.getElementById('tokenName');
      const tokenSymbolInput = document.getElementById('tokenSymbol');
      const tokenDecimalsInput = document.getElementById('tokenDecimals');
      const tokenMessageContainer = document.getElementById('tokenMessageContainer');

      if (!tokenAddressInput || !tokenNameInput || !tokenSymbolInput || !tokenDecimalsInput || !tokenMessageContainer) {
        console.error("Один или несколько элементов формы токена не найдены");
        return;
      }

      const address = tokenAddressInput.value.trim();
      const name = tokenNameInput.value.trim();
      const symbol = tokenSymbolInput.value.trim();
      const decimals = tokenDecimalsInput.value.trim();

      if (!address || !name || !symbol) {
        UIManager.showTokenMessage("Пожалуйста, заполните все обязательные поля (адрес, название, символ).", true);
        return;
      }

      if (typeof window.ethers === 'undefined' || typeof window.ethers.utils === 'undefined' || !window.ethers.utils.isAddress) {
        console.error("ethers.js не загружена или не содержит utils.isAddress");
        UIManager.showTokenMessage("Ошибка проверки адреса контракта.", true);
        return;
      }

      if (!window.ethers.utils.isAddress(address)) {
        UIManager.showTokenMessage("Введенный адрес контракта недействителен.", true);
        return;
      }

      const modal = document.getElementById('addTokenModal'); // Получаем модальное окно снова
      const targetType = modal ? modal.dataset.targetType : null; // Получаем тип из data атрибута
      const tokenType = targetType === 'old' ? 'old' : 'new';

      if (!window.tokenListManager || typeof window.tokenListManager.addToken !== 'function') {
        console.error("window.tokenListManager или его метод addToken недоступен");
        UIManager.showTokenMessage("Ошибка: Менеджер токенов не инициализирован.", true);
        return;
      }

      try {
        const newToken = {
          name: name,
          symbol: symbol,
          contract: address,
          decimals: decimals ? parseInt(decimals, 10) : 18
        };
        window.tokenListManager.addToken(tokenType, newToken);
        UIManager.showTokenMessage(`Токен ${name} (${symbol}) успешно добавлен!`);
        // Обновляем UI с новым списком токенов
        UIManager.updateTokenSelects();
        // Очищаем поля после успешного добавления
        tokenAddressInput.value = '';
        tokenNameInput.value = '';
        tokenSymbolInput.value = '';
        tokenDecimalsInput.value = '18';
        // Закрываем модальное окно через короткую задержку, чтобы пользователь увидел сообщение
        setTimeout(() => {
          UIManager.closeAddTokenModal();
        }, 1500);
      } catch (e) {
        UIManager.showTokenMessage(e.message, true);
      }
    };
  }
});
// Экспорт функций для использования в других модулях
// window.UIManager уже определен
window.UIManager = UIManager;
// window.updateWalletUI уже определена как функция
window.updateWalletUI = updateWalletUI;
window.handleAction = handleAction;
window.installWallet = installWallet;