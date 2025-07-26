// js/wallet.js
class WalletManager {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.walletAddress = "";
    this.isConnected = false;
  }

  // Сохранение состояния подключения
  saveConnectionState() {
    if (this.isConnected && this.walletAddress) {
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletAddress', this.walletAddress);
    } else {
      localStorage.removeItem('walletConnected');
      localStorage.removeItem('walletAddress');
    }
  }

  // Восстановление состояния подключения
  restoreConnectionState() {
    const connected = localStorage.getItem('walletConnected') === 'true';
    const address = localStorage.getItem('walletAddress');
    return { connected, address };
  }

  // Подключение к кошельку
  async connect() {
    try {
      // Используем window.ethereum и window.ethers напрямую
      if (typeof window.ethereum === "undefined") {
        throw new Error("Web3 провайдер (window.ethereum) не обнаружен.");
      }
      if (!window.ethers || !window.ethers.providers) {
        throw new Error("Библиотека ethers.js не загружена корректно.");
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("Не удалось получить доступ к аккаунтам.");
      }

      // Используем window.ethers.providers
      this.provider = new window.ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
      this.walletAddress = await this.signer.getAddress();
      this.isConnected = true;
      this.saveConnectionState();

      // Устанавливаем обработчики событий
      if (window.ethereum.on) {
        const handleAccountsChanged = (newAccounts) => {
          console.log("Событие accountsChanged:", newAccounts);
          if (newAccounts.length === 0) {
            console.log("Аккаунты отключены, вызываем disconnect...");
            this.disconnect();
            if (typeof window.updateWalletUI === 'function') {
              window.updateWalletUI();
            }
          } else {
            console.log("Аккаунт изменен на:", newAccounts[0]);
            this.walletAddress = newAccounts[0];
            this.saveConnectionState();
            window.location.reload();
          }
        };

        const handleChainChanged = (_chainId) => {
          console.log("Сеть изменена на chainId:", _chainId);
          window.location.reload();
        };

        window.ethereum.on("accountsChanged", handleAccountsChanged);
        window.ethereum.on("chainChanged", handleChainChanged);

        // Сохраняем ссылки на обработчики для удаления
        this._handleAccountsChanged = handleAccountsChanged;
        this._handleChainChanged = handleChainChanged;
      }

      console.log("Кошелек успешно подключен.");
      return true;
    } catch (error) {
      console.error("Ошибка подключения:", error);
      this.isConnected = false;
      // Не сохраняем состояние при ошибке подключения
      throw error;
    }
  }

  // Отключение кошелька
  disconnect() {
    console.log("Отключение кошелька...");
    this.isConnected = false;
    this.walletAddress = "";
    this.saveConnectionState();

    // Удаляем обработчики событий
    if (window.ethereum?.removeListener && this._handleAccountsChanged && this._handleChainChanged) {
      window.ethereum.removeListener("accountsChanged", this._handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", this._handleChainChanged);
      this._handleAccountsChanged = undefined;
      this._handleChainChanged = undefined;
    }
  }

  // Восстановление подключения после перезагрузки страницы
  async restoreConnection(address) {
    try {
      console.log("Попытка восстановления подключения для адреса:", address);

      if (typeof window.ethereum === "undefined") {
        throw new Error("Web3 провайдер (window.ethereum) не обнаружен при восстановлении.");
      }
      if (!window.ethers || !window.ethers.providers) {
        throw new Error("Библиотека ethers.js не загружена корректно при восстановлении.");
      }

      // Используем window.ethers.providers
      this.provider = new window.ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
      this.walletAddress = address;
      this.isConnected = true;

      // Устанавливаем обработчики событий при восстановлении
      if (window.ethereum.on) {
        const handleAccountsChanged = (newAccounts) => {
          console.log("AccountsChanged при восстановлении:", newAccounts);
          if (newAccounts.length === 0) {
            this.disconnect();
            if (typeof window.updateWalletUI === 'function') {
              window.updateWalletUI();
            }
          } else {
            this.walletAddress = newAccounts[0];
            this.saveConnectionState();
            window.location.reload();
          }
        };

        const handleChainChanged = (_chainId) => {
          console.log("ChainChanged при восстановлении:", _chainId);
          window.location.reload();
        };

        window.ethereum.on("accountsChanged", handleAccountsChanged);
        window.ethereum.on("chainChanged", handleChainChanged);

        this._handleAccountsChanged = handleAccountsChanged;
        this._handleChainChanged = handleChainChanged;
      }

      console.log("Подключение успешно восстановлено для адреса:", address);
      return true;
    } catch (error) {
      console.error("Ошибка восстановления подключения:", error);
      this.isConnected = false;
      this.walletAddress = "";
      return false;
    }
  }
}

// Создаем экземпляр и делаем его доступным глобально
const walletManagerInstance = new WalletManager();
window.walletManager = walletManagerInstance;