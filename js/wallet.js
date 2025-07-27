// Объект для управления кошельком
const walletManager = {
  isConnected: false,
  walletAddress: "",
  adminAddress: "0x40A7e95F9DaEcDeEA9Ae823aC234af2C616C2D10", // Адрес администратора
  provider: null, // Добавляем провайдер для получения баланса
  signer: null, // Добавляем signer для транзакций

  // Проверка состояния кошелька
  async checkWallet() {
    console.log("=== Начало проверки кошелька ===");
    const statusElement = document.getElementById("walletStatus");
    const actionBtn = document.getElementById("actionBtn");
    const walletInfo = document.getElementById("walletInfo");
    const walletAddressElement = document.getElementById("walletAddress");
    const walletBalanceElement = document.getElementById("walletBalance");
    const profileNavItem = document.getElementById("profileNavItem");
    const adminNavItem = document.getElementById("adminNavItem");

    if (!statusElement || !actionBtn || !walletInfo) {
      console.error("Один или несколько UI элементов не найдены в checkWallet");
      return false;
    }

    // Проверяем, установлен ли MetaMask
    if (typeof window.ethereum === "undefined") {
      console.log("MetaMask не обнаружен");
      statusElement.textContent = "MetaMask не установлен";
      actionBtn.textContent = "Установить MetaMask";
      actionBtn.onclick = () => this.installWallet();
      actionBtn.className = "btn install";
      actionBtn.disabled = false;

      // Обновляем UI
      walletInfo.classList.remove("connected");
      if (walletAddressElement) walletAddressElement.style.display = "none";
      if (walletBalanceElement) walletBalanceElement.style.display = "none";
      if (profileNavItem) profileNavItem.style.display = "none";
      if (adminNavItem) adminNavItem.style.display = "none";

      // Отправляем событие об изменении состояния кошелька
      window.dispatchEvent(new CustomEvent("walletStateChanged"));

      console.log("=== Проверка кошелька завершена (MetaMask не установлен) ===");
      return false;
    } else {
      console.log("MetaMask обнаружен, запрашиваем аккаунты...");
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        console.log("Текущие аккаунты:", accounts);

        // Проверяем сохраненное состояние подключения
        const savedAddress = localStorage.getItem('walletAddress');
        console.log("Сохраненный адрес:", savedAddress);

        if (savedAddress && accounts && accounts.length > 0) {
          // Приводим адреса к нижнему регистру для сравнения
          const normalizedSavedAddress = savedAddress.toLowerCase();
          const normalizedAccounts = accounts.map(acc => acc.toLowerCase());

          if (normalizedAccounts.includes(normalizedSavedAddress)) {
            // Восстанавливаем подключение
            console.log("Восстановление подключения для адреса:", savedAddress);
            this.isConnected = true;
            this.walletAddress = savedAddress;
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();

            // Получаем баланс
            await this.updateBalance();

            // Обновляем UI
            statusElement.textContent = "Кошелек подключен";
            walletInfo.classList.add("connected");
            if (walletAddressElement) {
              walletAddressElement.textContent = `${this.walletAddress.substring(0, 6)}...${this.walletAddress.substring(38)}`;
              walletAddressElement.style.display = "block";
            }
            if (walletBalanceElement) walletBalanceElement.style.display = "block";

            actionBtn.textContent = "Отключить кошелек";
            actionBtn.onclick = () => this.disconnect();
            actionBtn.className = "btn disconnect";
            actionBtn.disabled = false;

            // Показываем пункт "Профиль" в меню
            if (profileNavItem) {
              profileNavItem.style.display = "block";
            }

            // Проверяем права доступа к админке
            this.checkAdminAccess();

            // Обновляем страницу профиля
            this.updateProfilePage();

            // Отправляем событие об изменении состояния кошелька
            window.dispatchEvent(new CustomEvent("walletStateChanged"));

            // Вызываем глобальную функцию обновления UI если она доступна
            if (typeof window.updateWalletUI === 'function') {
              window.updateWalletUI();
            }

            console.log("=== Проверка кошелька завершена успешно (восстановлено) ===");
            return true;
          } else {
            console.log("Сохраненный адрес не совпадает с доступными аккаунтами");
            // Очищаем сохраненное состояние
            localStorage.removeItem('walletAddress');
            localStorage.removeItem('walletConnected');
          }
        }

        // MetaMask обнаружен, но подключение не было восстановлено
        statusElement.textContent = "Кошелек обнаружен";
        actionBtn.textContent = "Подключить кошелек";
        actionBtn.onclick = () => this.connect();
        actionBtn.className = "btn connect";
        actionBtn.disabled = false;

        // Обновляем UI
        walletInfo.classList.remove("connected");
        if (walletAddressElement) walletAddressElement.style.display = "none";
        if (walletBalanceElement) walletBalanceElement.style.display = "none";
        if (profileNavItem) profileNavItem.style.display = "none";
        if (adminNavItem) adminNavItem.style.display = "none";

        // Отправляем событие об изменении состояния кошелька
        window.dispatchEvent(new CustomEvent("walletStateChanged"));

        console.log("=== Проверка кошелька завершена успешно (кошелек готов) ===");
        return true;
      } catch (err) {
        console.error("Ошибка при проверке аккаунтов:", err);
        statusElement.textContent = "Ошибка при проверке кошелька";

        const UIManager = window.UIManager;
        if (UIManager && typeof UIManager.showErrorMessage === 'function') {
          UIManager.showErrorMessage("Не удалось проверить кошелек: " + err.message);
        }

        // Обновляем UI
        walletInfo.classList.remove("connected");
        if (walletAddressElement) walletAddressElement.style.display = "none";
        if (walletBalanceElement) walletBalanceElement.style.display = "none";
        if (profileNavItem) profileNavItem.style.display = "none";
        if (adminNavItem) adminNavItem.style.display = "none";

        // Отправляем событие об изменении состояния кошелька
        window.dispatchEvent(new CustomEvent("walletStateChanged"));

        console.log("=== Проверка кошелька завершена с ошибкой (MetaMask ошибка) ===");
        return false;
      }
    }
  },

  // Подключение кошелька
  async connect() {
    console.log("Попытка подключения кошелька...");
    const statusElement = document.getElementById("walletStatus");
    const actionBtn = document.getElementById("actionBtn");
    const walletInfo = document.getElementById("walletInfo");
    const walletAddressElement = document.getElementById("walletAddress");
    const walletBalanceElement = document.getElementById("walletBalance");
    const walletMessageContainer = document.getElementById("walletMessageContainer");
    const profileNavItem = document.getElementById("profileNavItem");
    const adminNavItem = document.getElementById("adminNavItem");

    if (!statusElement || !actionBtn || !walletInfo) {
      console.error("Один или несколько UI элементов не найдены в connect");
      return;
    }

    try {
      // Проверяем, установлен ли MetaMask
      if (typeof window.ethereum === "undefined") {
        console.log("MetaMask не обнаружен, предлагаем установить...");
        this.installWallet();
        return;
      }

      // Запрашиваем аккаунты
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });

      if (accounts && accounts.length > 0) {
        this.isConnected = true;
        this.walletAddress = accounts[0];
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        this.signer = this.provider.getSigner();
        this.saveConnectionState();

        // Получаем баланс
        await this.updateBalance();

        // Обновляем UI
        statusElement.textContent = "Кошелек подключен";
        walletInfo.classList.add("connected");
        if (walletAddressElement) {
          walletAddressElement.textContent = `${this.walletAddress.substring(0, 6)}...${this.walletAddress.substring(38)}`;
          walletAddressElement.style.display = "block";
        }
        if (walletBalanceElement) walletBalanceElement.style.display = "block";

        actionBtn.textContent = "Отключить кошелек";
        actionBtn.onclick = () => this.disconnect();
        actionBtn.className = "btn disconnect";
        actionBtn.disabled = false;

        // Очищаем сообщения
        if (walletMessageContainer) {
          walletMessageContainer.innerHTML = "";
        }

        // Показываем пункт "Профиль" в меню
        if (profileNavItem) {
          profileNavItem.style.display = "block";
        }

        // Проверяем права доступа к админке
        this.checkAdminAccess();

        // Обновляем страницу профиля
        this.updateProfilePage();

        // Отправляем событие об изменении состояния кошелька
        window.dispatchEvent(new CustomEvent("walletStateChanged"));

        // Вызываем глобальную функцию обновления UI если она доступна
        if (typeof window.updateWalletUI === 'function') {
          window.updateWalletUI();
        }

        console.log("Кошелек успешно подключен:", this.walletAddress);

        // Вызываем обновление UI на других страницах
        if (typeof window.updateWalletUI === 'function') {
          window.updateWalletUI();
        }
      } else {
        throw new Error("Не удалось получить аккаунты");
      }
    } catch (err) {
      console.error("Ошибка подключения:", err);
      statusElement.textContent = "Ошибка подключения";

      const UIManager = window.UIManager;
      if (UIManager && typeof UIManager.showErrorMessage === 'function') {
        UIManager.showErrorMessage("Ошибка подключения: " + err.message);
      }

      // Обновляем UI
      walletInfo.classList.remove("connected");
      if (walletAddressElement) walletAddressElement.style.display = "none";
      if (walletBalanceElement) walletBalanceElement.style.display = "none";
      if (profileNavItem) profileNavItem.style.display = "none";
      if (adminNavItem) adminNavItem.style.display = "none";

      // Отправляем событие об изменении состояния кошелька
      window.dispatchEvent(new CustomEvent("walletStateChanged"));

      actionBtn.textContent = "Подключить кошелек";
      actionBtn.onclick = () => this.connect();
      actionBtn.className = "btn connect";
      actionBtn.disabled = false;
    }
  },

  // Отключение кошелька
  disconnect() {
    console.log("Отключение кошелька...");
    this.isConnected = false;
    this.walletAddress = "";
    this.provider = null;
    this.signer = null;
    this.saveConnectionState();

    // Обновляем UI на странице кошелька
    const statusElement = document.getElementById("walletStatus");
    const actionBtn = document.getElementById("actionBtn");
    const walletInfo = document.getElementById("walletInfo");
    const walletAddressElement = document.getElementById("walletAddress");
    const walletBalanceElement = document.getElementById("walletBalance");
    const profileNavItem = document.getElementById("profileNavItem");
    const adminNavItem = document.getElementById("adminNavItem");

    if (statusElement) statusElement.textContent = "Кошелек не подключен";
    if (walletInfo) walletInfo.classList.remove("connected");
    if (walletAddressElement) walletAddressElement.style.display = "none";
    if (walletBalanceElement) walletBalanceElement.style.display = "none";

    if (actionBtn) {
      actionBtn.textContent = "Подключить кошелек";
      actionBtn.onclick = () => this.connect();
      actionBtn.className = "btn connect";
      actionBtn.disabled = false;
    }

    // Скрываем пункт "Профиль" в меню
    if (profileNavItem) {
      profileNavItem.style.display = "none";
    }

    // Скрываем пункт "Админка" в меню
    if (adminNavItem) {
      adminNavItem.style.display = "none";
    }

    // Обновляем страницу профиля
    this.updateProfilePage();

    // Отправляем событие об изменении состояния кошелька
    window.dispatchEvent(new CustomEvent("walletStateChanged"));

    console.log("Кошелек отключен");

    // Вызываем обновление UI на других страницах
    if (typeof window.updateWalletUI === 'function') {
      window.updateWalletUI();
    }
  },

  // Сохранение состояния подключения
  saveConnectionState() {
    if (this.isConnected && this.walletAddress) {
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletAddress', this.walletAddress);
    } else {
      localStorage.removeItem('walletConnected');
      localStorage.removeItem('walletAddress');
    }
  },

  // Получение баланса
  async updateBalance() {
    if (!this.isConnected || !this.walletAddress || !this.provider) return;

    try {
      const balance = await this.provider.getBalance(this.walletAddress);

      // Конвертируем из wei в ETH
      const balanceInEth = parseFloat(ethers.utils.formatEther(balance)).toFixed(4);

      // Обновляем UI с балансом
      const walletBalanceElement = document.getElementById("walletBalance");
      if (walletBalanceElement) {
        walletBalanceElement.textContent = `Баланс: ${balanceInEth} ETH`;
      }
    } catch (err) {
      console.error("Ошибка получения баланса:", err);
    }
  },

  // Установка кошелька
  installWallet() {
    console.log("Открываем страницу установки MetaMask...");
    const installUrl = "https://metamask.io/download/";
    window.open(installUrl, "_blank");
  },

  // Проверка прав доступа к админке
  checkAdminAccess() {
    const adminNavItem = document.getElementById("adminNavItem");

    if (!this.isConnected || !this.walletAddress) {
      if (adminNavItem) {
        adminNavItem.style.display = "none";
      }
      return;
    }

    // Проверяем, является ли пользователь админом
    if (this.walletAddress.toLowerCase() === this.adminAddress.toLowerCase()) {
      // Показываем пункт админки
      if (adminNavItem) {
        adminNavItem.style.display = "block";
      }
    } else {
      // Скрываем пункт админки
      if (adminNavItem) {
        adminNavItem.style.display = "none";
      }
    }
  },

  // Обновление данных на странице профиля
  async updateProfilePage() {
    const profileWalletAddress = document.getElementById("profileWalletAddress");
    const profileEthBalance = document.getElementById("profileEthBalance");
    const profileConnectionStatus = document.getElementById("profileConnectionStatus");

    if (!profileWalletAddress || !profileEthBalance || !profileConnectionStatus) {
      console.warn("Элементы страницы профиля не найдены в updateProfilePage");
      return;
    }

    if (this.isConnected && this.walletAddress) {
      profileWalletAddress.textContent = this.walletAddress;
      profileConnectionStatus.textContent = "Подключен";
      profileConnectionStatus.style.color = "#92fe9d"; // Зеленый цвет для подключенного состояния

      // Получаем баланс ETH
      if (this.provider) {
        try {
          const balance = await this.provider.getBalance(this.walletAddress);
          const balanceInEth = parseFloat(ethers.utils.formatEther(balance)).toFixed(4);
          profileEthBalance.textContent = `${balanceInEth} ETH`;
        } catch (err) {
          console.error("Ошибка получения баланса для профиля:", err);
          profileEthBalance.textContent = "Ошибка получения баланса";
        }
      } else {
        profileEthBalance.textContent = "0 ETH";
      }
    } else {
      profileWalletAddress.textContent = "Не подключен";
      profileEthBalance.textContent = "0 ETH";
      profileConnectionStatus.textContent = "Не подключен";
      profileConnectionStatus.style.color = "#ff416c"; // Красный цвет для отключенного состояния
    }
  }
};

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", function () {
  // Проверяем кошелек при загрузке страницы
  walletManager.checkWallet();

  // Добавляем обработчик для кнопки действия
  const actionBtn = document.getElementById("actionBtn");
  if (actionBtn) {
    actionBtn.onclick = function () {
      if (walletManager.isConnected) {
        walletManager.disconnect();
      } else {
        walletManager.connect();
      }
    };
  }

  // Добавляем обработчики для кнопок на странице профиля
  const disconnectWalletBtnProfile = document.getElementById("disconnectWalletBtnProfile");
  const refreshProfileBtn = document.getElementById("refreshProfileBtn");

  if (disconnectWalletBtnProfile) {
    disconnectWalletBtnProfile.onclick = () => {
      walletManager.disconnect();
    };
  }

  if (refreshProfileBtn) {
    refreshProfileBtn.onclick = () => {
      if (walletManager.isConnected) {
        walletManager.updateBalance();
        walletManager.updateProfilePage();
      }
    };
  }

  // Обработчик для переключения страниц
  const navLinks = document.querySelectorAll(".nav-link[data-page]");
  navLinks.forEach(link => {
    link.addEventListener("click", function () {
      // При переходе на страницу профиля обновляем её данные
      const targetPage = this.getAttribute("data-page");
      if (targetPage === "profile") {
        setTimeout(() => {
          walletManager.updateProfilePage();
        }, 100);
      }
    });
  });
});

// Делаем walletManager доступным глобально
window.walletManager = walletManager;

// Проверяем кошелек при загрузке страницы
window.addEventListener("load", function () {
  walletManager.checkWallet();
});

// Добавляем обработчик события изменения состояния кошелька
window.addEventListener("walletStateChanged", function () {
  // Обновляем отображение пунктов меню при изменении состояния кошелька
  const profileNavItem = document.getElementById("profileNavItem");
  const adminNavItem = document.getElementById("adminNavItem");

  if (walletManager.isConnected) {
    // Показываем пункт "Профиль" в меню
    if (profileNavItem) {
      profileNavItem.style.display = "block";
    }

    // Проверяем права доступа к админке
    walletManager.checkAdminAccess();
  } else {
    // Скрываем пункты меню при отключении кошелька
    if (profileNavItem) {
      profileNavItem.style.display = "none";
    }
    if (adminNavItem) {
      adminNavItem.style.display = "none";
    }
  }
});