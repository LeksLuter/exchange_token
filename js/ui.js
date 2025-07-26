// js/ui.js
// Используем глобальный walletManager
const walletManager = window.walletManager;

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
      updateWalletUI();
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

// Экспорт функций для использования в других модулях
window.UIManager = UIManager;
window.updateWalletUI = updateWalletUI;
window.handleAction = handleAction;
window.installWallet = installWallet;