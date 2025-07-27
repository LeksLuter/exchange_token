// js/ui.js

// Функция инициализации страницы кошелька
function initWalletPage() {
    const walletInfo = document.getElementById('walletInfo');
    const walletStatus = document.getElementById('walletStatus');
    const walletAddress = document.getElementById('walletAddress');
    const walletBalance = document.getElementById('walletBalance');
    const actionBtn = document.getElementById('actionBtn');
    const walletMessageContainer = document.getElementById('walletMessageContainer');

    if (!walletInfo) return; // Если элемента нет, значит страница не активна

    // Функция для отображения сообщений на странице кошелька
    function showWalletMessage(message, isError = false) {
        walletMessageContainer.innerHTML = `<p class="${isError ? 'error' : 'success'}">${message}</p>`;
        setTimeout(() => { walletMessageContainer.innerHTML = ''; }, 5000);
    }

    // Функция для обновления UI кошелька
    function updateWalletUI(account = null, balance = null) {
        if (account) {
            walletStatus.textContent = 'Кошелек подключен';
            walletAddress.textContent = `Адрес: ${account}`;
            walletAddress.style.display = 'block';
            if (balance !== null) {
                walletBalance.textContent = `Баланс: ${ethers.utils.formatEther(balance)} ETH`;
                walletBalance.style.display = 'block';
            } else {
                walletBalance.style.display = 'none';
            }
            actionBtn.textContent = 'Отключить кошелек';
            actionBtn.classList.remove('connect');
            actionBtn.classList.add('disconnect');
        } else {
            walletStatus.textContent = 'Кошелек не подключен';
            walletAddress.style.display = 'none';
            walletBalance.style.display = 'none';
            actionBtn.textContent = 'Подключить кошелек';
            actionBtn.classList.remove('disconnect');
            actionBtn.classList.add('connect');
        }
    }

    // Проверка состояния кошелька при загрузке страницы
    if (typeof window.walletProvider !== 'undefined' && window.walletProvider.selectedAddress) {
        updateWalletUI(window.walletProvider.selectedAddress, window.currentBalance);
    } else {
        updateWalletUI();
    }

    // Обработчик кнопки подключения/отключения
    if (actionBtn) {
        actionBtn.addEventListener('click', async () => {
            if (actionBtn.classList.contains('connect')) {
                try {
                    await connectWallet();
                    showWalletMessage("Кошелек успешно подключен!");
                } catch (error) {
                    console.error("Ошибка подключения кошелька:", error);
                    showWalletMessage(`Ошибка подключения: ${error.message}`, true);
                }
            } else {
                try {
                    await disconnectWallet();
                    showWalletMessage("Кошелек отключен.");
                } catch (error) {
                    console.error("Ошибка отключения кошелька:", error);
                    showWalletMessage(`Ошибка отключения: ${error.message}`, true);
                }
            }
        });
    }

    // Прослушиватели событий из wallet.js
    if (typeof window.walletProvider !== 'undefined') {
        window.walletProvider.on("accountsChanged", (accounts) => {
            console.log("Accounts changed (UI Listener):", accounts);
            if (accounts.length > 0) {
                window.currentAccount = accounts[0];
                // Получаем баланс при смене аккаунта
                updateAccountBalance(window.currentAccount).then(() => {
                    updateWalletUI(window.currentAccount, window.currentBalance);
                    updateProfileUI(window.currentAccount, window.currentBalance); // Обновляем и профиль
                });
            } else {
                window.currentAccount = null;
                window.currentBalance = null;
                updateWalletUI();
                updateProfileUI(); // Обновляем и профиль
            }
        });

        window.walletProvider.on("chainChanged", (chainId) => {
            console.log("Chain changed (UI Listener):", chainId);
            window.currentChainId = chainId;
            // При смене сети переподключаемся
            connectWallet().catch(err => {
                console.error("Ошибка переподключения при смене сети:", err);
                showWalletMessage(`Ошибка сети: ${err.message}`, true);
            });
        });
    }
}

// Функция инициализации страницы профиля
function initProfilePage() {
    const profileConnectionStatus = document.getElementById('profileConnectionStatus');
    const profileWalletAddress = document.getElementById('profileWalletAddress');
    const profileEthBalance = document.getElementById('profileEthBalance');
    const disconnectBtn = document.getElementById('disconnectWalletBtnProfile');
    const refreshBtn = document.getElementById('refreshProfileBtn');

    if (!profileConnectionStatus) return; // Если элемента нет, значит страница не активна

     // Функция для обновления UI профиля
     function updateProfileUI(account = null, balance = null) {
        if (account) {
            profileConnectionStatus.textContent = 'Подключен';
            profileWalletAddress.textContent = account;
            profileEthBalance.textContent = balance !== null ? `${ethers.utils.formatEther(balance)} ETH` : '-';
        } else {
            profileConnectionStatus.textContent = 'Не подключен';
            profileWalletAddress.textContent = 'Не подключен';
            profileEthBalance.textContent = '-';
        }
    }

    // Проверка состояния при загрузке страницы
    if (typeof window.currentAccount !== 'undefined' && window.currentAccount) {
        updateProfileUI(window.currentAccount, window.currentBalance);
    } else {
        updateProfileUI();
    }

    // Обработчик кнопки отключения
    if (disconnectBtn) {
        disconnectBtn.addEventListener('click', async () => {
            try {
                await disconnectWallet();
                updateProfileUI();
            } catch (error) {
                console.error("Ошибка отключения кошелька на странице профиля:", error);
            }
        });
    }

    // Обработчик кнопки обновления
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            if (window.currentAccount) {
                try {
                    await updateAccountBalance(window.currentAccount);
                    updateProfileUI(window.currentAccount, window.currentBalance);
                } catch (error) {
                    console.error("Ошибка обновления баланса:", error);
                }
            }
        });
    }
}

// Функция инициализации страницы админки
function initAdminPage() {
    // Здесь будет логика инициализации админки, если потребуется
    // Например, обработчики для кнопок добавления токенов
    console.log("Страница админки загружена и инициализирована.");
    
    const addOldTokenBtn = document.getElementById('addOldTokenBtn');
    const addNewTokenBtn = document.getElementById('addNewTokenBtn');
    const modal = document.getElementById('addTokenModal');
    const span = document.getElementsByClassName("close")[0];
    const tokenForm = document.getElementById('tokenForm');
    const tokenMessageContainer = document.getElementById('tokenMessageContainer');

    if (!addOldTokenBtn) return; // Если элемента нет, значит страница не активна

    // Функция для отображения сообщений на модальном окне
    function showTokenMessage(message, isError = false) {
        tokenMessageContainer.innerHTML = `<p class="${isError ? 'error' : 'success'}">${message}</p>`;
        setTimeout(() => { tokenMessageContainer.innerHTML = ''; }, 5000);
    }

    // Открытие модального окна
    function openModal() {
        if (modal) modal.style.display = "block";
    }

    // Закрытие модального окна
    function closeModal() {
        if (modal) modal.style.display = "none";
        // Очистка формы при закрытии
        if (tokenForm) tokenForm.reset();
        tokenMessageContainer.innerHTML = '';
    }

    // Назначение обработчиков
    if (addOldTokenBtn) addOldTokenBtn.addEventListener('click', openModal);
    if (addNewTokenBtn) addNewTokenBtn.addEventListener('click', openModal);

    if (span) span.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            closeModal();
        }
    });

    // Обработка формы добавления токена
    if (tokenForm) {
        tokenForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const tokenAddress = document.getElementById('tokenAddress').value.trim();
            const tokenName = document.getElementById('tokenName').value.trim();
            const tokenSymbol = document.getElementById('tokenSymbol').value.trim();
            const tokenDecimals = parseInt(document.getElementById('tokenDecimals').value) || 18;
            const isOldToken = addOldTokenBtn.contains(document.activeElement) || (modal && modal.contains(document.activeElement) && document.activeElement.id === 'confirmAddTokenBtn' && addOldTokenBtn.classList.contains('last-clicked'));

            // Простая валидация адреса
            if (!ethers.utils.isAddress(tokenAddress)) {
                showTokenMessage("Некорректный адрес контракта токена.", true);
                return;
            }

            try {
                // Здесь должна быть логика добавления токена через tokenManager
                // Например:
                // await addTokenToList(tokenAddress, tokenName, tokenSymbol, tokenDecimals, isOldToken);
                // Имитация успешного добавления
                showTokenMessage(`Токен ${tokenName} (${tokenSymbol}) успешно добавлен!`);
                closeModal();
                // Здесь также можно обновить список токенов на странице
            } catch (error) {
                console.error("Ошибка добавления токена:", error);
                showTokenMessage(`Ошибка добавления токена: ${error.message}`, true);
            }
        });
    }
}

// --- Функции для работы с сообщениями в основном контейнере ---

// Функция для отображения сообщений в основном контейнере
function showMessage(message, isError = false) {
    const messageContainer = document.getElementById('messageContainer');
    if (messageContainer) {
        messageContainer.innerHTML = `<p class="${isError ? 'error' : 'success'}">${message}</p>`;
        setTimeout(() => { messageContainer.innerHTML = ''; }, 5000);
    }
}

// Функция для отображения индикатора загрузки
function showLoading(isLoading) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        if (isLoading) {
            loadingIndicator.classList.remove('hidden');
        } else {
            loadingIndicator.classList.add('hidden');
        }
    }
}