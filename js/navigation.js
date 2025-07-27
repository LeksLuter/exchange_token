// Обработчики навигации
document.addEventListener("DOMContentLoaded", function () {
    // Получаем все ссылки навигации
    const navLinks = document.querySelectorAll(".nav-link[data-page]");

    // Добавляем обработчики кликов
    navLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();

            // Получаем целевую страницу
            const targetPage = this.getAttribute("data-page");

            // Переключаем активный класс
            navLinks.forEach(navLink => {
                navLink.classList.remove("active");
            });
            this.classList.add("active");

            // Показываем целевую страницу
            showPage(targetPage);
        });
    });

    // Проверяем кошелек при загрузке, если открыта страница кошелька
    const walletPage = document.getElementById("wallet-page");
    if (walletPage) {
        setTimeout(() => {
            if (window.walletManager && typeof window.walletManager.checkWallet === 'function') {
                window.walletManager.checkWallet();
            }
        }, 100);
    }

    // Добавляем обработчик события изменения состояния кошелька
    window.addEventListener("walletStateChanged", function () {
        // Обновляем отображение пунктов меню при изменении состояния кошелька
        checkAdminAccess();
    });
});

// Функция показа страницы
function showPage(pageId) {
    // Скрываем все страницы
    const pages = document.querySelectorAll(".page-section");
    pages.forEach(page => {
        page.classList.remove("active");
    });

    // Показываем целевую страницу
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) {
        targetPage.classList.add("active");

        // Если это страница кошелька, проверяем состояние
        if (pageId === "wallet") {
            setTimeout(() => {
                if (window.walletManager && typeof window.walletManager.checkWallet === 'function') {
                    window.walletManager.checkWallet();
                }
            }, 100);
        }

        // Если это страница админки, проверяем права доступа
        if (pageId === "admin") {
            checkAdminAccess();
        }
    }
}

// Функция проверки прав доступа к админке
function checkAdminAccess() {
    const adminAddress = "0x40A7e95F9DaEcDeEA9Ae823aC234af2C616C2D10";
    const adminNavItem = document.getElementById("adminNavItem");

    // Если walletManager не доступен, скрываем админку
    if (!window.walletManager) {
        if (adminNavItem) {
            adminNavItem.style.display = "none";
        }
        return;
    }

    // Проверяем, является ли пользователь админом
    if (window.walletManager.isConnected &&
        window.walletManager.walletAddress &&
        window.walletManager.walletAddress.toLowerCase() === adminAddress.toLowerCase()) {
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
}