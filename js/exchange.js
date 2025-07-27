// Менеджер обмена токенов
class ExchangeManager {
  constructor() {
    this.oldBalance = 1000;
    this.newBalance = 0;
    this.tokenOwner = "";
    this.currentOldToken = null;
    this.currentNewToken = null;
    this.tokenBalances = {}; // Храним балансы токенов
    this.init();
  }

  init() {
    // Инициализация при загрузке страницы
    document.addEventListener("DOMContentLoaded", () => {
      this.updateBalances();
      this.updateExchangeButtonState();

      // Добавляем обработчики для выбора токенов
      const oldTokenSelect = document.getElementById("oldTokenSelect");
      const newTokenSelect = document.getElementById("newTokenSelect");

      if (oldTokenSelect) {
        oldTokenSelect.addEventListener("change", (e) => {
          this.handleOldTokenChange(e.target.value);
        });
      }
      if (newTokenSelect) {
        newTokenSelect.addEventListener("change", (e) => {
          this.handleNewTokenChange(e.target.value);
        });
      }

      // Добавляем обработчик для кнопки обмена
      const exchangeBtn = document.getElementById("exchangeBtn");
      if (exchangeBtn) {
        exchangeBtn.onclick = () => this.handleExchangeButtonClick();
      }

      // Добавляем обработчик для изменения значения в поле ввода
      const exchangeAmount = document.getElementById("exchangeAmount");
      if (exchangeAmount) {
        exchangeAmount.addEventListener("input", () => {
          this.updateExchangeButtonState();
        });
      }
    });

    // Обновляем состояние кнопки при изменении состояния кошелька
    window.addEventListener("walletStateChanged", () => {
      this.updateExchangeButtonState();
    });

    // Обновляем балансы при обновлении списков токенов
    window.addEventListener("tokenListsUpdated", () => {
      this.updateTokenSelects();
      this.updateBalances();
      this.updateExchangeButtonState();
    });
  }

  // Обработчик изменения выбора старого токена
  async handleOldTokenChange(tokenAddress) {
    console.log("Выбран старый токен:", tokenAddress);
    // Получаем информацию о выбранном токене
    if (window.tokenListManager && typeof window.tokenListManager.getTokens === 'function') {
      const oldTokens = window.tokenListManager.getTokens('old');
      // Найти токен по адресу
      this.currentOldToken = oldTokens.find(token => token.contract === tokenAddress) || null;
      console.log("Установлен currentOldToken:", this.currentOldToken);
    } else {
      this.currentOldToken = null;
      console.warn("tokenListManager.getTokens('old') не доступен");
    }
    // Обновляем баланс старого токена
    await this.updateOldTokenBalance();
    // Обновляем состояние кнопки обмена
    this.updateExchangeButtonState();
  }

  // Обработчик изменения выбора нового токена
  async handleNewTokenChange(tokenAddress) {
    console.log("Выбран новый токен:", tokenAddress);
    // Получаем информацию о выбранном токене
    if (window.tokenListManager && typeof window.tokenListManager.getTokens === 'function') {
      const newTokens = window.tokenListManager.getTokens('new');
      // Найти токен по адресу
      this.currentNewToken = newTokens.find(token => token.contract === tokenAddress) || null;
      console.log("Установлен currentNewToken:", this.currentNewToken);
      // Если новый токен нужен только для отображения баланса на главной странице обмена,
      // но не для активации кнопки, можно не обновлять его баланс здесь.
      // Однако, если он нужен, раскомментируйте строку ниже:
      // await this.updateNewTokenBalance();
    } else {
      this.currentNewToken = null;
      console.warn("tokenListManager.getTokens('new') не доступен");
    }
    // Обновляем состояние кнопки обмена (теперь проверка не зависит от нового токена)
    this.updateExchangeButtonState();
  }

  // Обновление балансов токенов
  async updateTokenBalances() {
    await this.updateOldTokenBalance();
    // await this.updateNewTokenBalance(); // Не обновляем баланс нового токена для обмена
    this.updateExchangeButtonState();
  }

  // Обновление баланса старого токена
  async updateOldTokenBalance() {
    const oldBalanceElement = document.getElementById("oldBalance");
    const oldTokenBalanceElement = document.getElementById("oldTokenBalance"); // Элемент на странице обмена
    if (!oldBalanceElement && !oldTokenBalanceElement) return;

    // Если токен не выбран, показываем значение по умолчанию
    if (!this.currentOldToken) {
      if (oldBalanceElement) oldBalanceElement.textContent = "0 OLD";
      if (oldTokenBalanceElement) oldTokenBalanceElement.textContent = "0 OLD";
      return;
    }

    // Если кошелек не подключен, показываем 0
    if (!window.walletManager || !window.walletManager.isConnected || !window.walletManager.provider) {
      const balanceText = `0 ${this.currentOldToken.symbol || 'OLD'}`;
      if (oldBalanceElement) oldBalanceElement.textContent = balanceText;
      if (oldTokenBalanceElement) oldTokenBalanceElement.textContent = balanceText;
      return;
    }

    let balance = 0;
    try {
      // Создаем контракт токена
      const tokenContract = new ethers.Contract(
        this.currentOldToken.contract,
        ["function balanceOf(address owner) view returns (uint256)"],
        window.walletManager.provider
      );

      // Получаем баланс
      const balanceBigNumber = await tokenContract.balanceOf(window.walletManager.walletAddress);

      // Преобразуем decimals в число, если это строка
      const decimalsValue = this.currentOldToken.decimals !== undefined ?
        (typeof this.currentOldToken.decimals === 'string' ?
          parseInt(this.currentOldToken.decimals, 10) :
          this.currentOldToken.decimals) :
        18; // По умолчанию 18

      // Проверяем, что decimalsValue является числом
      if (isNaN(decimalsValue)) {
        throw new Error(`Некорректное значение decimals для токена ${this.currentOldToken.symbol}: ${this.currentOldToken.decimals}`);
      }

      // Форматируем баланс
      balance = parseFloat(ethers.utils.formatUnits(balanceBigNumber, decimalsValue));
    } catch (error) {
      console.error("Ошибка получения баланса старого токена:", error);
      // В случае ошибки показываем 0
      balance = 0;
    }

    // Обновляем отображение
    const balanceText = `${balance} ${this.currentOldToken.symbol}`;
    if (oldBalanceElement) oldBalanceElement.textContent = balanceText;
    if (oldTokenBalanceElement) oldTokenBalanceElement.textContent = balanceText;
  }


  // Обновление баланса нового токена
  async updateNewTokenBalance() {
    const newBalanceElement = document.getElementById("newBalance");
    const newTokenBalanceElement = document.getElementById("newTokenBalance"); // Элемент на странице обмена
    if (!newBalanceElement && !newTokenBalanceElement) return;

    // Если токен не выбран, показываем значение по умолчанию
    if (!this.currentNewToken) {
      if (newBalanceElement) newBalanceElement.textContent = "0 NEW";
      if (newTokenBalanceElement) newTokenBalanceElement.textContent = "0 NEW";
      return;
    }

    // Если кошелек не подключен, показываем 0
    if (!window.walletManager || !window.walletManager.isConnected || !window.walletManager.provider) {
      const balanceText = `0 ${this.currentNewToken.symbol || 'NEW'}`;
      if (newBalanceElement) newBalanceElement.textContent = balanceText;
      if (newTokenBalanceElement) newTokenBalanceElement.textContent = balanceText;
      return;
    }

    let balance = 0;
    try {
      // Создаем контракт токена
      const tokenContract = new ethers.Contract(
        this.currentNewToken.contract,
        ["function balanceOf(address owner) view returns (uint256)"],
        window.walletManager.provider
      );

      // Получаем баланс
      const balanceBigNumber = await tokenContract.balanceOf(window.walletManager.walletAddress);

      // Преобразуем decimals в число, если это строка
      const decimalsValue = this.currentNewToken.decimals !== undefined ?
        (typeof this.currentNewToken.decimals === 'string' ?
          parseInt(this.currentNewToken.decimals, 10) :
          this.currentNewToken.decimals) :
        18; // По умолчанию 18

      // Проверяем, что decimalsValue является числом
      if (isNaN(decimalsValue)) {
        throw new Error(`Некорректное значение decimals для токена ${this.currentNewToken.symbol}: ${this.currentNewToken.decimals}`);
      }

      // Форматируем баланс
      balance = parseFloat(ethers.utils.formatUnits(balanceBigNumber, decimalsValue));
    } catch (error) {
      console.error("Ошибка получения баланса нового токена:", error);
      // В случае ошибки показываем 0
      balance = 0;
    }

    // Обновляем отображение
    const balanceText = `${balance} ${this.currentNewToken.symbol}`;
    if (newBalanceElement) newBalanceElement.textContent = balanceText;
    if (newTokenBalanceElement) newTokenBalanceElement.textContent = balanceText;
  }

  // Обновление балансов (старый метод для совместимости)
  updateBalances() {
    this.updateTokenBalances();
  }

  // Обновление выпадающих списков токенов
  updateTokenSelects() {
    const oldTokenSelect = document.getElementById("oldTokenSelect");
    const newTokenSelect = document.getElementById("newTokenSelect");

    if (oldTokenSelect && window.tokenListManager) {
      const oldTokens = window.tokenListManager.getTokens('old');
      oldTokenSelect.innerHTML = '<option value="">-- Выберите токен --</option>';
      oldTokens.forEach(token => {
        const option = document.createElement("option");
        option.value = token.contract;
        option.textContent = `${token.name} (${token.symbol})`;
        oldTokenSelect.appendChild(option);
      });
    }

    if (newTokenSelect && window.tokenListManager) {
      const newTokens = window.tokenListManager.getTokens('new');
      newTokenSelect.innerHTML = '<option value="">-- Выберите токен --</option>';
      newTokens.forEach(token => {
        const option = document.createElement("option");
        option.value = token.contract;
        option.textContent = `${token.name} (${token.symbol})`;
        newTokenSelect.appendChild(option);
      });
    }
  }

  // Обновление состояния кнопки обмена (ИСПРАВЛЕНО)
  updateExchangeButtonState() {
    const exchangeBtn = document.getElementById("exchangeBtn");
    const exchangeMessage = document.getElementById("exchangeMessage");
    const walletManager = window.walletManager;

    if (!exchangeBtn || !exchangeMessage) return;

    // Проверяем состояние кошелька
    if (!walletManager || !walletManager.isConnected) {
      exchangeBtn.disabled = false; // Кнопка активна для возможности подключения
      exchangeBtn.textContent = "Подключить кошелек";
      exchangeBtn.onclick = () => this.handleExchangeButtonClick(); // Назначаем обработчик
      exchangeMessage.textContent = "Для обмена токенов необходимо подключить кошелек";
      exchangeMessage.style.color = "#ffcc00";
      return;
    }

    // Проверяем выбран ли СТАРЫЙ токен (новый токен больше не обязателен для активации кнопки)
    if (!this.currentOldToken) {
      exchangeBtn.disabled = true;
      exchangeBtn.textContent = "Выберите токен для обмена";
      exchangeMessage.textContent = "Пожалуйста, выберите старый токен для обмена.";
      exchangeMessage.style.color = "#ffcc00";
      return;
    }

    const amountInput = document.getElementById("exchangeAmount");
    const amount = amountInput ? parseFloat(amountInput.value) : 0;

    // Проверяем корректность введенной суммы
    if (isNaN(amount) || amount <= 0) {
      exchangeBtn.disabled = true;
      exchangeBtn.textContent = "Введите сумму";
      exchangeMessage.textContent = "Пожалуйста, введите корректную сумму для обмена.";
      exchangeMessage.style.color = "#ffcc00";
      return;
    }

    // Проверяем достаточно ли токенов У СТАРОГО ТОКЕНА
    const oldBalanceElement = document.getElementById("oldBalance");
    let currentBalance = 0;
    if (oldBalanceElement) {
      const balanceText = oldBalanceElement.textContent;
      // Извлекаем числовую часть, учитывая возможное наличие символа токена
      const balanceMatch = balanceText.match(/^([\d.]+)/);
      if (balanceMatch && balanceMatch[1]) {
        currentBalance = parseFloat(balanceMatch[1]) || 0;
      }
    }

    if (amount > currentBalance) {
      exchangeBtn.disabled = true;
      exchangeBtn.textContent = "Недостаточно токенов";
      exchangeMessage.textContent = "У вас недостаточно токенов для обмена";
      exchangeMessage.style.color = "#ff416c";
      return;
    }

    // Все проверки пройдены (новый токен не требуется для активации)
    exchangeBtn.disabled = false;
    exchangeBtn.textContent = "Обменять Токены";
    exchangeMessage.textContent = ""; // Очищаем сообщение об ошибке
    exchangeMessage.style.color = ""; // Сбрасываем цвет
  }

  // Обработчик клика по кнопке обмена
  async handleExchangeButtonClick() {
    const walletManager = window.walletManager;
    const UIManager = window.UIManager;

    // Проверяем подключение кошелька
    if (!walletManager || !walletManager.isConnected) {
      if (window.connectWallet) {
        window.connectWallet();
      } else {
        console.error("Функция подключения кошелька не найдена");
      }
      return;
    }

    // Проверяем выбран ли старый токен (новый токен больше не обязателен)
    if (!this.currentOldToken) {
      if (UIManager.showErrorMessage) {
        UIManager.showErrorMessage("Пожалуйста, выберите старый токен для обмена");
      } else {
        alert("Пожалуйста, выберите старый токен для обмена");
      }
      return;
    }

    const amountInput = document.getElementById("exchangeAmount");
    const amount = parseFloat(amountInput ? amountInput.value : "0");

    if (isNaN(amount) || amount <= 0) {
      if (UIManager.showErrorMessage) {
        UIManager.showErrorMessage("Пожалуйста, введите корректную сумму для обмена");
      } else {
        alert("Пожалуйста, введите корректную сумму для обмена");
      }
      return;
    }

    // Проверяем баланс
    const oldBalanceElement = document.getElementById("oldBalance");
    let currentBalance = 0;
    if (oldBalanceElement) {
      const balanceText = oldBalanceElement.textContent;
      // Извлекаем числовую часть, учитывая возможное наличие символа токена
      const balanceMatch = balanceText.match(/^([\d.]+)/);
      if (balanceMatch && balanceMatch[1]) {
        currentBalance = parseFloat(balanceMatch[1]) || 0;
      }
    }

    if (amount > currentBalance) {
      if (UIManager.showErrorMessage) {
        UIManager.showErrorMessage("Недостаточно токенов для обмена");
      } else {
        alert("Недостаточно токенов для обмена");
      }
      return;
    }

    const exchangeBtn = document.getElementById("exchangeBtn");
    if (exchangeBtn) {
      exchangeBtn.disabled = true;
      exchangeBtn.textContent = "Обмен...";
    }

    try {
      if (typeof window.ethereum === "undefined") {
        throw new Error("Web3 провайдер не обнаружен");
      }

      // Проверяем баланс кошелька (для демонстрации)
      const balance = await walletManager.provider.getBalance(walletManager.walletAddress);
      console.log("Баланс кошелька:", window.ethers.utils.formatEther(balance));

      // Симуляция асинхронной операции
      setTimeout(async () => {
        // После обмена обновляем балансы
        await this.updateTokenBalances();
        this.tokenOwner = walletManager.walletAddress;

        if (window.updateWalletUI) {
          window.updateWalletUI();
        }

        this.addTransaction(amount, "exchange");
        // В будущем будет добавляться транзакция mint
        // this.addTransaction(amount, "mint");

        if (amountInput) amountInput.value = "";
        if (exchangeBtn) {
          exchangeBtn.disabled = false;
          exchangeBtn.textContent = "Обменять Токены";
          // Восстанавливаем обработчик после обмена
          exchangeBtn.onclick = () => this.handleExchangeButtonClick();
        }

        if (UIManager.showSuccessMessage) {
          UIManager.showSuccessMessage(`Успешно обменяно ${amount} ${this.currentOldToken.symbol}!`);
        } else {
          alert(`Успешно обменяно ${amount} ${this.currentOldToken.symbol}!`);
        }

        // Обновляем состояние кнопки после обмена
        this.updateExchangeButtonState();
      }, 2000);

    } catch (error) {
      console.error("Ошибка обмена:", error);
      if (UIManager.showErrorMessage) {
        UIManager.showErrorMessage("Ошибка при выполнении обмена: " + error.message);
      } else {
        alert("Ошибка при выполнении обмена: " + error.message);
      }

      if (exchangeBtn) {
        exchangeBtn.disabled = false;
        exchangeBtn.textContent = "Обменять Токены";
        // Восстанавливаем обработчик в случае ошибки
        exchangeBtn.onclick = () => this.handleExchangeButtonClick();
      }
    }
  }

  // Добавление транзакции в историю
  addTransaction(amount, type) {
    const transactionList = document.getElementById("transactionList");
    if (!transactionList) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString();

    const transactionItem = document.createElement("div");
    transactionItem.className = "transaction-item";

    let actionText, amountText, amountColor;

    if (type === "exchange") {
      const symbol = this.currentOldToken ? this.currentOldToken.symbol : "OLD";
      actionText = `Обмен ${symbol} на новые токены`;
      amountText = `-${amount} ${symbol}`;
      amountColor = "#ff416c";
    } else {
      const symbol = this.currentNewToken ? this.currentNewToken.symbol : "NEW";
      actionText = `Получение ${symbol} токенов`;
      amountText = `+${amount} ${symbol}`;
      amountColor = "#92fe9d";
    }

    transactionItem.innerHTML = `
            <div class="transaction-details">
                <div>${actionText}</div>
                <div>${timeString}</div>
            </div>
            <div class="transaction-amount" style="color: ${amountColor}">${amountText}</div>
        `;

    // Добавляем новую транзакцию в начало списка
    transactionList.insertBefore(transactionItem, transactionList.firstChild);
  }
}

// Создаем экземпляр и делаем его доступным глобально
const exchangeManager = new ExchangeManager();
window.exchangeManager = exchangeManager;