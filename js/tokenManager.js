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
}

// Создаем экземпляр и делаем его доступным глобально
const tokenListManager = new TokenListManager();
window.tokenListManager = tokenListManager;