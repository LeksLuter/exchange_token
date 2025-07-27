class TokenListManager {
  constructor() {
    // Инициализируем списки токенов из localStorage или пустыми массивами
    this.oldTokens = JSON.parse(localStorage.getItem('oldTokens')) || [];
    this.newTokens = JSON.parse(localStorage.getItem('newTokens')) || [];
    // Добавим начальные токены, если списки пусты
    if (this.oldTokens.length === 0) {
      this.oldTokens.push({
        name: "Старый Токен",
        symbol: "OLD",
        contract: "0x5a3C52E378737C7836A31252C9B2EE9847A3143A" // Пример адреса
      });
      this.saveTokens('old');
    }

    if (this.newTokens.length === 0) {
      this.newTokens.push({
        name: "Новый Токен",
        symbol: "NEW",
        contract: "0x7f57A3C52E378737C836A31252C9B2EE9847A314" // Пример адреса
      });
      this.saveTokens('new');
    }
  }

  // Сохраняем токены в localStorage
  saveTokens(type) {
    if (type === 'old') {
      localStorage.setItem('oldTokens', JSON.stringify(this.oldTokens));
    } else if (type === 'new') {
      localStorage.setItem('newTokens', JSON.stringify(this.newTokens));
    }
  }

  // Получаем список токенов по типу
  getTokens(type) {
    return type === 'old' ? this.oldTokens : this.newTokens;
  }

  // Добавляем токен в список
  addToken(type, tokenData) {
    const tokens = type === 'old' ? this.oldTokens : this.newTokens;
    // Проверка на дубликаты по адресу контракта
    const isDuplicate = tokens.some(token => token.contract.toLowerCase() === tokenData.contract.toLowerCase());
    if (isDuplicate) {
      throw new Error(`Токен с адресом ${tokenData.contract} уже существует в списке ${type === 'old' ? 'старых' : 'новых'} токенов.`);
    }
    tokens.push(tokenData);
    this.saveTokens(type);
  }

  // Удаляем токен из списка по адресу контракта
  removeToken(type, contractAddress) {
    if (type === 'old') {
      this.oldTokens = this.oldTokens.filter(token => token.contract !== contractAddress);
      this.saveTokens('old');
    } else if (type === 'new') {
      this.newTokens = this.newTokens.filter(token => token.contract !== contractAddress);
      this.saveTokens('new');
    }
  }
}

// Создаем экземпляр и делаем его доступным глобально
const tokenListManager = new TokenListManager();
window.tokenListManager = tokenListManager;

class UIManager {
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

        // Инициализируем обработчики кнопок "Добавить токен"
        UIManager.initAddTokenButtons();

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

  // Инициализация обработчиков для кнопок "Добавить токен"
  static initAddTokenButtons() {
    const addOldTokenBtn = document.getElementById('addOldTokenBtn');
    const addNewTokenBtn = document.getElementById('addNewTokenBtn');

    // Удаляем существующие обработчики, если они были (например, при повторной инициализации)
    if (addOldTokenBtn) {
      addOldTokenBtn.removeEventListener('click', UIManager.handleAddOldTokenClick);
      addOldTokenBtn.addEventListener('click', UIManager.handleAddOldTokenClick);
      console.log("Обработчик для кнопки 'Добавить старый токен' прикреплен.");
    } else {
      console.warn("Кнопка 'Добавить токен' для старых токенов не найдена.");
    }

    if (addNewTokenBtn) {
      addNewTokenBtn.removeEventListener('click', UIManager.handleAddNewTokenClick);
      addNewTokenBtn.addEventListener('click', UIManager.handleAddNewTokenClick);
      console.log("Обработчик для кнопки 'Добавить новый токен' прикреплен.");
    } else {
      console.warn("Кнопка 'Добавить токен' для новых токенов не найдена.");
    }
  }

  // Именованный обработчик для кнопки "Добавить старый токен"
  static handleAddOldTokenClick() {
    console.log("Нажата кнопка 'Добавить токен' для старых токенов");
    if (typeof window.UIManager.openAddTokenModal === 'function') {
      window.UIManager.openAddTokenModal('old');
    } else {
      console.error("Метод window.UIManager.openAddTokenModal не найден.");
    }
  }

  // Именованный обработчик для кнопки "Добавить новый токен"
  static handleAddNewTokenClick() {
    console.log("Нажата кнопка 'Добавить токен' для новых токенов");
    if (typeof window.UIManager.openAddTokenModal === 'function') {
      window.UIManager.openAddTokenModal('new');
    } else {
      console.error("Метод window.UIManager.openAddTokenModal не найден.");
    }
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
                            <div class="token-address">${token.contract.substring(0, 6)}...${token.contract.substring(38)}</div>
                        </div>
                        <div class="token-symbol">${token.symbol}</div>
                        <button class="btn delete-token-btn" data-type="old" data-contract="${token.contract}">Удалить</button>
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
                            <div class="token-address">${token.contract.substring(0, 6)}...${token.contract.substring(38)}</div>
                        </div>
                        <div class="token-symbol">${token.symbol}</div>
                        <button class="btn delete-token-btn" data-type="new" data-contract="${token.contract}">Удалить</button>
                    `;
          newTokenList.appendChild(tokenItem);
        }
      });
    } else {
      console.error("window.tokenListManager или его метод getTokens недоступен для новых токенов");
    }

    // Добавляем обработчики событий для кнопок удаления
    UIManager.initDeleteTokenButtons();

    console.log("Выпадающие списки токенов обновлены");
  }

  // Инициализация обработчиков для кнопок удаления токенов
  static initDeleteTokenButtons() {
    const deleteButtons = document.querySelectorAll('.delete-token-btn');
    deleteButtons.forEach(button => {
      button.addEventListener('click', function () {
        const tokenType = this.dataset.type;
        const contractAddress = this.dataset.contract;
        UIManager.deleteToken(tokenType, contractAddress);
      });
    });
  }

  // Функция удаления токена
  static deleteToken(tokenType, contractAddress) {
    if (confirm(`Вы уверены, что хотите удалить этот токен?`)) {
      try {
        // Удаляем токен через tokenListManager
        if (window.tokenListManager && typeof window.tokenListManager.removeToken === 'function') {
          window.tokenListManager.removeToken(tokenType, contractAddress);
          console.log(`Токен успешно удален из списка ${tokenType}.`);

          // Обновляем UI
          if (typeof window.UIManager.updateTokenSelects === 'function') {
            window.UIManager.updateTokenSelects();
          }
        } else {
          throw new Error("tokenListManager.removeToken недоступен");
        }
      } catch (error) {
        console.error("Ошибка при удалении токена:", error);
        alert("Ошибка при удалении токена: " + error.message);
      }
    }
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
      // Удаляем старый обработчик, если он был
      if (tokenAddressInput._autoFillHandler) {
        tokenAddressInput.removeEventListener('blur', tokenAddressInput._autoFillHandler);
      }
      const autoFillHandler = async function () {
        const address = this.value.trim();
        if (!address) return;

        try {
          // Проверяем, что ethers.js доступен
          if (typeof window.ethers === 'undefined' || typeof window.ethers.utils === 'undefined' || !window.ethers.utils.isAddress) {
            console.error("ethers.js не загружен или недоступен");
            if (tokenMessageContainer) UIManager.showTokenMessage("Ошибка: библиотека ethers.js не загружена.", true);
            return;
          }

          // Проверяем валидность адреса
          if (!window.ethers.utils.isAddress(address)) {
            if (tokenMessageContainer) UIManager.showTokenMessage("Неверный адрес контракта токена.", true);
            return;
          }

          let hasError = false;
          let name = "Неизвестный токен";
          let symbol = "???";
          let decimals = "18";

          try {
            // Получаем ABI ERC20 (минимальный для name, symbol, decimals)
            // В реальном приложении лучше использовать ABI из файла или константы
            const erc20Abi = [
              "function name() view returns (string)",
              "function symbol() view returns (string)",
              "function decimals() view returns (uint8)"
            ];

            // Получаем провайдер из MetaMask (window.ethereum)
            const provider = new window.ethers.providers.Web3Provider(window.ethereum);
            // Создаем контракт
            const contract = new window.ethers.Contract(address, erc20Abi, provider);

            // Получаем данные токена
            try {
              name = await contract.name();
            } catch (nameErr) {
              console.warn("Не удалось получить имя токена:", nameErr);
              hasError = true;
            }
            try {
              symbol = await contract.symbol();
            } catch (symbolErr) {
              console.warn("Не удалось получить символ токена:", symbolErr);
              hasError = true;
            }
            try {
              const decimalsBigNumber = await contract.decimals();
              decimals = decimalsBigNumber.toString();
            } catch (decimalsErr) {
              console.warn("Не удалось получить decimals токена:", decimalsErr);
              hasError = true;
            }

            // Заполняем поля формы
            if (tokenNameInput) tokenNameInput.value = name;
            if (tokenSymbolInput) tokenSymbolInput.value = symbol;
            if (tokenDecimalsInput) tokenDecimalsInput.value = decimals;

            if (hasError) {
              if (tokenMessageContainer) UIManager.showTokenMessage("Некоторые данные токена получить не удалось. Проверьте адрес.", true);
            } else {
              if (tokenMessageContainer) tokenMessageContainer.innerHTML = ''; // Очищаем сообщение об успехе
            }
          } catch (err) {
            console.error("Ошибка при автозаполнении токена:", err);
            if (tokenMessageContainer) UIManager.showTokenMessage("Ошибка при получении данных токена. Проверьте адрес контракта.", true);
          }
        } catch (err) {
          console.error("Ошибка при проверке адреса или автозаполнении:", err);
          if (tokenMessageContainer) UIManager.showTokenMessage("Ошибка при проверке адреса токена.", true);
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

  static showInstallationInstructions() {
    const messageContainer = document.getElementById("wallet-message");
    if (messageContainer) {
      messageContainer.innerHTML = `
                <h4>Инструкция по установке MetaMask:</h4>
                <ol>
                    <li>Нажмите кнопку "Установить MetaMask" ниже</li>
                    <li>Перейдите в магазин расширений вашего браузера</li>
                    <li>Установите расширение MetaMask</li>
                    <li>Перезагрузите браузер</li>
                    <li>Обновите эту страницу</li>
                </ol>
            `;
    }
  }
}

// Делаем UIManager доступным глобально
window.UIManager = UIManager;

// Добавляем обработчик для закрытия модального окна
document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('addTokenModal');
  const closeBtn = modal ? modal.querySelector('.close') : null;
  if (closeBtn) {
    closeBtn.onclick = function () {
      if (typeof window.UIManager.closeAddTokenModal === 'function') {
        window.UIManager.closeAddTokenModal();
      } else {
        console.error("Метод window.UIManager.closeAddTokenModal не найден.");
        if (modal) modal.style.display = 'none'; // Fallback
      }
    };
  }

  // Закрытие модального окна при клике вне его
  if (modal) {
    window.onclick = function (event) {
      if (event.target == modal) {
        if (typeof window.UIManager.closeAddTokenModal === 'function') {
          window.UIManager.closeAddTokenModal();
        } else {
          console.error("Метод window.UIManager.closeAddTokenModal не найден.");
          modal.style.display = 'none'; // Fallback
        }
      }
    };
  }

  // Обработчик формы добавления токена
  const tokenForm = document.getElementById('tokenForm');
  if (tokenForm) {
    tokenForm.onsubmit = function (e) {
      e.preventDefault();
      const modal = document.getElementById('addTokenModal'); // Получаем модальное окно снова
      const confirmBtn = document.getElementById('confirmAddTokenBtn');
      const tokenAddressInput = document.getElementById('tokenAddress');
      const tokenNameInput = document.getElementById('tokenName');
      const tokenSymbolInput = document.getElementById('tokenSymbol');
      const tokenDecimalsInput = document.getElementById('tokenDecimals');
      const tokenMessageContainer = document.getElementById('tokenMessageContainer');

      if (!modal || !confirmBtn) {
        console.error("Элементы модального окна не найдены");
        return;
      }

      // Получаем тип токена из data атрибута модального окна
      const targetType = modal ? modal.dataset.targetType : null; // Получаем тип из data атрибута
      if (!targetType) {
        console.error("Не удалось определить тип токена для добавления");
        if (tokenMessageContainer) UIManager.showTokenMessage("Ошибка определения типа токена.", true);
        return;
      }

      // Определяем тип токена для tokenListManager
      const tokenType = targetType === 'old' ? 'old' : 'new';

      // Получаем значения из формы
      const address = tokenAddressInput ? tokenAddressInput.value.trim() : '';
      const name = tokenNameInput ? tokenNameInput.value.trim() : '';
      const symbol = tokenSymbolInput ? tokenSymbolInput.value.trim() : '';
      const decimals = tokenDecimalsInput ? parseInt(tokenDecimalsInput.value.trim(), 10) : 18;

      // Валидация
      if (!address || !name || !symbol || isNaN(decimals) || decimals < 0 || decimals > 77) {
        if (tokenMessageContainer) UIManager.showTokenMessage("Пожалуйста, заполните все обязательные поля корректно.", true);
        return;
      }

      if (typeof window.ethers === 'undefined' || typeof window.ethers.utils === 'undefined' || !window.ethers.utils.isAddress) {
        console.error("ethers.js не загружен или недоступен");
        if (tokenMessageContainer) UIManager.showTokenMessage("Ошибка: библиотека ethers.js не загружена.", true);
        return;
      }

      if (!window.ethers.utils.isAddress(address)) {
        if (tokenMessageContainer) UIManager.showTokenMessage("Неверный адрес контракта токена.", true);
        return;
      }

      // Блокируем кнопку на время обработки
      confirmBtn.disabled = true;
      confirmBtn.textContent = "Добавление...";

      try {
        // Создаем объект нового токена
        const newToken = {
          contract: address,
          name: name,
          symbol: symbol,
          decimals: decimals // Добавляем decimals
        };

        // Добавляем токен через tokenListManager
        if (window.tokenListManager && typeof window.tokenListManager.addToken === 'function') {
          window.tokenListManager.addToken(tokenType, newToken);
          console.log(`Токен ${name} (${symbol}) успешно добавлен в список ${tokenType}.`);
          if (tokenMessageContainer) UIManager.showTokenMessage(`Токен ${name} (${symbol}) успешно добавлен!`, false);

          // Обновляем выпадающие списки
          if (typeof window.UIManager.updateTokenSelects === 'function') {
            window.UIManager.updateTokenSelects();
          } else {
            console.warn("Метод window.UIManager.updateTokenSelects не найден при обновлении после добавления токена.");
          }

          // Очищаем форму после успешного добавления (но не закрываем модалку сразу, чтобы пользователь видел сообщение)
          // Через 1.5 секунды очищаем форму и закрываем модалку
          setTimeout(() => {
            if (tokenAddressInput) tokenAddressInput.value = '';
            if (tokenNameInput) tokenNameInput.value = '';
            if (tokenSymbolInput) tokenSymbolInput.value = '';
            if (tokenDecimalsInput) tokenDecimalsInput.value = '18';
            if (tokenMessageContainer) tokenMessageContainer.innerHTML = '';
            if (typeof window.UIManager.closeAddTokenModal === 'function') {
              window.UIManager.closeAddTokenModal();
            } else {
              console.error("Метод window.UIManager.closeAddTokenModal не найден.");
              if (modal) modal.style.display = 'none'; // Fallback
            }
          }, 1500);

        } else {
          throw new Error("tokenListManager.addToken недоступен");
        }
      } catch (error) {
        console.error("Ошибка при добавлении токена:", error);
        if (tokenMessageContainer) UIManager.showTokenMessage(error.message || "Ошибка при добавлении токена.", true);
      } finally {
        // Разблокируем кнопку
        confirmBtn.disabled = false;
        confirmBtn.textContent = "Добавить токен";
      }
    };
  }
});

// Инициализация приложения после загрузки DOM
document.addEventListener("DOMContentLoaded", async function () {
  // Проверяем готовность ethers.js
  if (typeof window.ethers === 'undefined') {
    console.log("ethers.js не найдена, ожидаем загрузки...");
    // Здесь можно добавить логику ожидания или повторной попытки
    // Пока просто продолжаем, надеясь, что тег script в HTML сработает
  } else {
    console.log("ethers.js уже загружена.");
  }

  // Имитируем небольшую задержку, чтобы убедиться, что все скрипты загрузились
  // Это помогает избежать ситуаций, когда initApp вызывается до того, как tokenListManager будет доступен
  await new Promise(resolve => setTimeout(resolve, 100));
  console.log("Запуск проверки кошелька...");
  // const result = await checkWallet(); // Предполагается, что checkWallet определен в wallet.js
  // console.log("Результат проверки кошелька:", result);

  // - Инициализация списков токенов и UI -
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

    // Инициализируем обработчики для кнопок "Добавить токен"
    UIManager.initAddTokenButtons();

  } else {
    console.warn("window.tokenListManager или window.UIManager не доступны для инициализации токенов. Возможно, скрипты еще не загрузились.");
    // Можно попробовать снова через небольшую задержку, если критично
    // setTimeout(() => UIManager.initApp(), 500); // Но это рискованно, лучше убедиться в правильном порядке загрузки скриптов
  }

  // Проверяем наличие exchangeManager и обновляем балансы
  if (window.exchangeManager && typeof window.exchangeManager.updateBalances === 'function') {
    window.exchangeManager.updateBalances();
  } else {
    console.warn("exchangeManager не доступен или updateBalances не функция");
  }

  console.log("=== Инициализация приложения завершена ===");
});