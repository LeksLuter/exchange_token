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
    if (walletPage && walletPage.classList.contains("active")) {
        walletManager.checkWallet();
    }
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
            walletManager.checkWallet();
        }

        // Если это страница админки, проверяем права доступа и инициализируем UI
        if (pageId === "admin") {
            checkAdminAccess();
            // Инициализируем UI админки после небольшой задержки
            setTimeout(() => {
                if (window.UIManager && typeof window.UIManager.updateTokenSelects === 'function') {
                    window.UIManager.updateTokenSelects();
                    console.log("UI админки инициализирован");
                }
            }, 100);
        }
    }
}

// Функция проверки прав доступа к админке
function checkAdminAccess() {
    const adminAddress = "0x40A7e95F9DaEcDeEA9Ae823aC234af2C616C2D10";
    const adminNavItem = document.getElementById("adminNavItem");

    // Если пользователь не подключен, скрываем админку
    if (!walletManager.isConnected) {
        if (adminNavItem) {
            adminNavItem.style.display = "none";
        }
        return;
    }

    // Проверяем, является ли пользователь админом
    if (walletManager.walletAddress &&
        walletManager.walletAddress.toLowerCase() === adminAddress.toLowerCase()) {
        // Показываем пункт админки
        if (adminNavItem) {
            adminNavItem.style.display = "block";
        }
    } else {
        // Скрываем пункт админки
        if (adminNavItem) {
            adminNavItem.style.display = "none";
        }

        // Если пользователь пытается получить доступ к админке напрямую, перенаправляем на главную
        if (window.location.hash === "#admin") {
            showPage("home");
        }
    }
}