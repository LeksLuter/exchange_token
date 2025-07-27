// js/navigation.js
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const pageSections = document.querySelectorAll('.page-section');

    // Функция для загрузки содержимого страницы
    async function loadPageContent(pageId) {
        const pageSection = document.getElementById(`${pageId}-page`);
        if (!pageSection) return;

        // Показать индикатор загрузки
        document.getElementById('loadingIndicator').classList.remove('hidden');

        try {
            const response = await fetch(`pages/${pageId}.html`);
            if (!response.ok) {
                throw new Error(`Ошибка загрузки страницы: ${response.status}`);
            }
            const htmlContent = await response.text();
            pageSection.innerHTML = htmlContent;

            // После загрузки контента, инициализируем скрипты для конкретной страницы
            initializePageScripts(pageId);

        } catch (error) {
            console.error('Ошибка при загрузке страницы:', error);
            pageSection.innerHTML = `<div class="page-content"><p>Не удалось загрузить страницу. Попробуйте позже.</p><p>Ошибка: ${error.message}</p></div>`;
        } finally {
            // Скрыть индикатор загрузки
            document.getElementById('loadingIndicator').classList.add('hidden');
        }
    }

    // Функция для инициализации скриптов конкретной страницы
    function initializePageScripts(pageId) {
        switch (pageId) {
            case 'home':
                // Скрипты для главной страницы (если есть)
                break;
            case 'exchange':
                // Инициализация скриптов обмена, если они не глобальные
                // Например, если бы у exchange.js была функция init()
                // window.initExchangePage && window.initExchangePage();
                break;
            case 'voting':
                // Инициализация скриптов голосования
                break;
            case 'wallet':
                // Инициализация скриптов кошелька
                initWalletPage();
                break;
            case 'profile':
                // Инициализация скриптов профиля
                initProfilePage();
                break;
            case 'admin':
                // Инициализация скриптов админки
                initAdminPage();
                break;
            default:
                console.warn(`Нет скриптов для инициализации страницы: ${pageId}`);
        }
    }


    // Функция для переключения активной страницы
    function switchPage(pageId) {
        // Убрать класс 'active' у всех секций
        pageSections.forEach(section => section.classList.remove('active'));

        // Добавить класс 'active' к выбранной секции
        const activeSection = document.getElementById(`${pageId}-page`);
        if (activeSection) {
            activeSection.classList.add('active');
        }

        // Обновить активную ссылку в навигации
        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Загрузить содержимое страницы, если оно еще не загружено или если нужно перезагрузить
        // Для простоты, мы будем перезагружать содержимое каждый раз при переходе
        // В реальном приложении можно добавить кэширование
        loadPageContent(pageId);
    }

    // Назначить обработчики кликов на ссылки навигации
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = e.target.getAttribute('data-page');
            if (pageId) {
                switchPage(pageId);
            }
        });
    });

    // Инициализация: загрузить содержимое активной (домашней) страницы
    const initialPage = document.querySelector('.nav-link.active')?.getAttribute('data-page') || 'home';
    loadPageContent(initialPage);
});