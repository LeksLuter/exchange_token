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
      this.updateTokenBalances();
    });
  }

  // Обработчик изменения выбора старого токена
  async handleOldTokenChange(tokenAddress) {
    console.log("Выбран старый токен:", tokenAddress);

    // Получаем информацию о выбранном токене
    if (window.tokenListManager && typeof window.tokenListManager.getTokens === 'function') {
      const oldTokens = window.tokenListManager.getTokens('old');
      this.currentOldToken = oldTokens.find(token => token.contract === tokenAddress) || null;
    } else {
      this.currentOldToken = null;
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
      this.currentNewToken = newTokens.find(token => token.contract === tokenAddress) || null;
    } else {
      this.currentNewToken = null;
    }

    // Обновляем баланс нового токена
    await this.updateNewTokenBalance();

    // Обновляем состояние кнопки обмена
    this.updateExchangeButtonState();
  }

  // Обновление балансов токенов
  async updateTokenBalances() {
    await this.updateOldTokenBalance();
    await this.updateNewTokenBalance();
  }

  // Обновление баланса старого токена
  async updateOldTokenBalance() {
    const oldBalanceElement = document.getElementById("oldBalance");
    const oldTokenBalanceElement = document.getElementById("oldTokenBalance");

    if (!oldBalanceElement || !oldTokenBalanceElement) return;

    // Если токен не выбран, показываем значение по умолчанию
    if (!this.currentOldToken) {
      oldBalanceElement.textContent = `${this.oldBalance} OLD`;
      oldTokenBalanceElement.textContent = "0 OLD";
      return;
    }

    // Получаем реальный баланс токена из кошелька
    let balance = 0;
    if (window.walletManager && window.walletManager.isConnected && window.walletManager.provider) {
      try {
        // Создаем контракт токена
        const tokenContract = new ethers.Contract(
          this.currentOldToken.contract,
          [
            "function balanceOf(address owner) view returns (uint256)"
          ],
          window.walletManager.provider
        );

        // Получаем баланс
        const balanceBigNumber = await tokenContract.balanceOf(window.walletManager.walletAddress);
        const decimals = this.currentOldToken.decimals || 18;
        balance = parseFloat(ethers.utils.formatUnits(balanceBigNumber, decimals));
      } catch (error) {
        console.error("Ошибка получения баланса старого токена:", error);
        balance = 0;
      }
    }

    // Обновляем отображение
    oldBalanceElement.textContent = `${balance} ${this.currentOldToken.symbol}`;
    oldTokenBalanceElement.textContent = `${balance} ${this.currentOldToken.symbol}`;
  }

  // Обновление баланса нового токена
  async updateNewTokenBalance() {
    const newBalanceElement = document.getElementById("newBalance");
    const newTokenBalanceElement = document.getElementById("newTokenBalance");

    if (!newBalanceElement || !newTokenBalanceElement) return;

    // Если токен не выбран, показываем значение по умолчанию
    if (!this.currentNewToken) {
      newBalanceElement.textContent = `${this.newBalance} NEW`;
      newTokenBalanceElement.textContent = "0 NEW";
      return;
    }

    // Получаем реальный баланс токена из кошелька
    let balance = 0;
    if (window.walletManager && window.walletManager.isConnected && window.walletManager.provider) {
      try {
        // Создаем контракт токена
        const tokenContract = new ethers.Contract(
          this.currentNewToken.contract,
          [
            "function balanceOf(address owner) view returns (uint256)"
          ],
          window.walletManager.provider
        );

        // Получаем баланс
        const balanceBigNumber = await tokenContract.balanceOf(window.walletManager.walletAddress);
        const decimals = this.currentNewToken.decimals || 18;
        balance = parseFloat(ethers.utils.formatUnits(balanceBigNumber, decimals));
      } catch (error) {
        console.error("Ошибка получения баланса нового токена:", error);
        balance = 0;
      }
    }

    // Обновляем отображение
    newBalanceElement.textContent = `${balance} ${this.currentNewToken.symbol}`;
    newTokenBalanceElement.textContent = `${balance} ${this.currentNewToken.symbol}`;
  }

  // Обработчик клика по кнопке обмена
  handleExchangeButtonClick() {
    const walletManager = window.walletManager;

    // Проверяем подключение кошелька
    if (!walletManager || !walletManager.isConnected) {
      // Если кошелек не подключен, инициируем подключение
      if (typeof walletManager.connect === 'function') {
        walletManager.connect();
      } else {
        console.error("Функция подключения кошелька недоступна");
      }
      return;
    }

    // Если кошелек подключен, выполняем обмен
    this.exchangeTokens();
  }

  // Обновление состояния кнопки обмена
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

    // Проверяем выбраны ли токены
    if (!this.currentOldToken || !this.currentNewToken) {
      exchangeBtn.disabled = true;
      exchangeBtn.textContent = "Выберите токены";
      exchangeMessage.textContent = "Выберите токены для обмена";
      exchangeMessage.style.color = "#aaa";
      return;
    }

    // Проверяем введено ли количество
    const amountInput = document.getElementById("exchangeAmount");
    const amount = amountInput ? parseFloat(amountInput.value) : 0;

    if (!amount || amount <= 0) {
      exchangeBtn.disabled = true;
      exchangeBtn.textContent = "Введите количество";
      exchangeMessage.textContent = "Укажите количество токенов для обмена";
      exchangeMessage.style.color = "#aaa";
      return;
    }

    // Проверяем достаточно ли токенов
    const oldBalanceElement = document.getElementById("oldBalance");
    if (oldBalanceElement) {
      const balanceText = oldBalanceElement.textContent;
      const balanceParts = balanceText.split(' ');
      const currentBalance = parseFloat(balanceParts[0]) || 0;

      if (amount > currentBalance) {
        exchangeBtn.disabled = true;
        exchangeBtn.textContent = "Недостаточно токенов";
        exchangeMessage.textContent = "У вас недостаточно токенов для обмена";
        exchangeMessage.style.color = "#ff416c";
        return;
      }
    }

    // Все проверки пройдены
    exchangeBtn.disabled = false;
    exchangeBtn.textContent = "Обменять Токены";
    exchangeBtn.onclick = () => this.handleExchangeButtonClick(); // Назначаем обработчик
    exchangeMessage.textContent = "";
  }

  // Обмен токенов
  async exchangeTokens() {
    const walletManager = window.walletManager;
    const UIManager = window.UIManager || {
      showErrorMessage: console.error,
      showSuccessMessage: console.log
    };

    // Проверяем наличие менеджера кошелька
    if (!walletManager) {
      console.error("walletManager не доступен при обмене токенов");
      if (UIManager.showErrorMessage) {
        UIManager.showErrorMessage("Ошибка: Менеджер кошелька не инициализирован.");
      } else {
        alert("Ошибка: Менеджер кошелька не инициализирован.");
      }
      return;
    }

    // Проверяем подключение кошелька
    if (!walletManager.isConnected) {
      if (UIManager.showErrorMessage) {
        UIManager.showErrorMessage("Пожалуйста, подключите кошелек для обмена");
      } else {
        alert("Пожалуйста, подключите кошелек для обмена");
      }
      return;
    }

    // Проверяем выбраны ли токены
    if (!this.currentOldToken || !this.currentNewToken) {
      if (UIManager.showErrorMessage) {
        UIManager.showErrorMessage("Пожалуйста, выберите токены для обмена");
      } else {
        alert("Пожалуйста, выберите токены для обмена");
      }
      return;
    }

    const amountInput = document.getElementById("exchangeAmount");
    const amount = parseFloat(amountInput ? amountInput.value : '0');

    // Проверяем корректность суммы
    if (!amount || amount <= 0) {
      if (UIManager.showErrorMessage) {
        UIManager.showErrorMessage("Пожалуйста, введите корректную сумму");
      } else {
        alert("Пожалуйста, введите корректную сумму");
      }
      return;
    }

    // Проверяем баланс
    const oldBalanceElement = document.getElementById("oldBalance");
    if (oldBalanceElement) {
      const balanceText = oldBalanceElement.textContent;
      const balanceParts = balanceText.split(' ');
      const currentBalance = parseFloat(balanceParts[0]) || 0;

      if (amount > currentBalance) {
        if (UIManager.showErrorMessage) {
          UIManager.showErrorMessage("Недостаточно токенов для обмена");
        } else {
          alert("Недостаточно токенов для обмена");
        }
        return;
      }
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
        this.addTransaction(amount, "mint");

        if (amountInput) amountInput.value = "";
        if (exchangeBtn) {
          exchangeBtn.disabled = false;
          exchangeBtn.textContent = "Обменять Токены";
          // Восстанавливаем обработчик после обмена
          exchangeBtn.onclick = () => this.handleExchangeButtonClick();
        }

        if (UIManager.showSuccessMessage) {
          UIManager.showSuccessMessage(`Успешно обменяно ${amount} ${this.currentOldToken.symbol} на ${amount} ${this.currentNewToken.symbol}!`);
        } else {
          alert(`Успешно обменяно ${amount} ${this.currentOldToken.symbol} на ${amount} ${this.currentNewToken.symbol}!`);
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

// Добавляем обновление балансов при обновлении UI
document.addEventListener("DOMContentLoaded", function () {
  // Обновляем балансы при обновлении списков токенов
  if (window.UIManager && typeof window.UIManager.updateTokenSelects === 'function') {
    const originalUpdateTokenSelects = window.UIManager.updateTokenSelects;
    window.UIManager.updateTokenSelects = function () {
      originalUpdateTokenSelects.call(this);
      // После обновления списков токенов обновляем балансы
      if (window.exchangeManager) {
        window.exchangeManager.updateTokenBalances();
      }
    };
  }
});