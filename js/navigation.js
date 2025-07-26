document.addEventListener('DOMContentLoaded', () => {
    // Получаем все ссылки навигации
    const navLinks = document.querySelectorAll('.nav-link[data-page]');
    // Получаем все секции страниц
    const pageSections = document.querySelectorAll('.page-section');

    // Функция для переключения страниц
    function switchPage(targetPageId) {
        // Скрываем все секции
        pageSections.forEach(section => {
            section.classList.remove('active');
        });

        // Показываем целевую секцию
        const targetSection = document.getElementById(`${targetPageId}-page`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Обновляем активный класс у ссылок
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === targetPageId) {
                link.classList.add('active');
            }
        });

        // Если переключаемся на страницу профиля, обновляем её данные
        if (targetPageId === 'profile') {
            if (typeof window.updateProfilePage === 'function') {
                window.updateProfilePage();
            } else {
                console.warn("Функция updateProfilePage недоступна для обновления страницы профиля");
            }
        }

        console.log(`Страница переключена на: ${targetPageId}`);
    }

    // Делаем функцию доступной глобально
    window.switchPage = switchPage;

    // Добавляем обработчики кликов на ссылки навигации
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Предотвращаем переход по ссылке
            const targetPage = link.dataset.page;
            switchPage(targetPage);
        });
    });

    // Инициализация: показываем главную страницу
    switchPage('home');

    console.log("Навигация инициализирована.");
});