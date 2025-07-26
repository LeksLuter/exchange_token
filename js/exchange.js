// js/exchange.js
class ExchangeManager {
  constructor() {
    this.oldBalance = 1000;
    this.newBalance = 0;
    this.tokenOwner = "";
    this.transactionHistory = [];
  }

  updateBalances() {
    const oldBalanceElement = document.getElementById("oldBalance");
    const newBalanceElement = document.getElementById("newBalance");
    if (oldBalanceElement) {
      oldBalanceElement.textContent = `${this.oldBalance} OLD`;
    }
    if (newBalanceElement) {
      newBalanceElement.textContent = `${this.newBalance} NEW`;
    }
  }

  addTransaction(amount, type) {
    const now = new Date();
    const timeString = `${now.getHours()}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    const transaction = {
      amount: amount,
      type: type,
      time: timeString,
    };
    this.transactionHistory.unshift(transaction);
    const transactionList = document.getElementById("transactionList");
    if (!transactionList) {
      console.warn("Элемент transactionList не найден");
      return;
    }
    const transactionElement = document.createElement("div");
    transactionElement.className = "transaction-item fade-in";
    let transactionText = "";
    let amountText = "";
    if (type === "exchange") {
      transactionText = `Обмен ${amount} OLD на NEW`;
      amountText = `-${amount} OLD`;
    } else if (type === "mint") {
      transactionText = `Создание ${amount} NEW токенов`;
      amountText = `+${amount} NEW`;
    }
    transactionElement.innerHTML = `
        <div class="transaction-details">
          <div>${transactionText}</div>
          <div>${timeString}</div>
        </div>
        <div class="transaction-amount">${amountText}</div>
      `;
    if (transactionList.firstChild) {
      transactionList.insertBefore(
        transactionElement,
        transactionList.firstChild.nextSibling
      );
    } else {
      transactionList.appendChild(transactionElement);
    }
    if (transactionList.children.length > 6) {
      transactionList.removeChild(transactionList.lastChild);
    }
  }

  async exchangeTokens() {
    const walletManager = window.walletManager;
    const UIManager = window.UIManager || { showErrorMessage: console.error, showSuccessMessage: console.log };

    if (!walletManager) {
      console.error("walletManager не доступен при обмене токенов");
      if (UIManager.showErrorMessage) {
        UIManager.showErrorMessage("Ошибка: Менеджер кошелька не инициализирован.");
      } else {
        alert("Ошибка: Менеджер кошелька не инициализирован.");
      }
      return;
    }

    if (!walletManager.isConnected) {
      if (UIManager.showErrorMessage) {
        UIManager.showErrorMessage("Пожалуйста, подключите кошелек для обмена");
      } else {
        alert("Пожалуйста, подключите кошелек для обмена");
      }
      return;
    }

    const amountInput = document.getElementById("exchangeAmount");
    const amount = parseInt(amountInput ? amountInput.value : '', 10);
    if (!amount || amount <= 0) {
      if (UIManager.showErrorMessage) {
        UIManager.showErrorMessage("Пожалуйста, введите корректную сумму");
      } else {
        alert("Пожалуйста, введите корректную сумму");
      }
      return;
    }

    if (amount > this.oldBalance) {
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
      setTimeout(() => {
        this.oldBalance -= amount;
        this.newBalance += amount;
        this.tokenOwner = walletManager.walletAddress;
        this.updateBalances();

        if (window.updateWalletUI) {
          window.updateWalletUI();
        }

        this.addTransaction(amount, "exchange");
        this.addTransaction(amount, "mint");

        if (amountInput) amountInput.value = "";
        if (exchangeBtn) {
          exchangeBtn.disabled = false;
          exchangeBtn.textContent = "Обменять Токены";
        }

        if (UIManager.showSuccessMessage) {
          UIManager.showSuccessMessage(`Успешно обменяно ${amount} OLD на ${amount} NEW!`);
        } else {
          alert(`Успешно обменяно ${amount} OLD на ${amount} NEW!`);
        }
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
      }
    }
  }
}

// Создаем экземпляр и делаем его доступным глобально
const exchangeManager = new ExchangeManager();
window.exchangeManager = exchangeManager;