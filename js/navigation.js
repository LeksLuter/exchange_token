// js/navigation.js
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const pageContentContainer = document.getElementById('page-content-container');
    let isAppInitialized = false; // Флаг для однократной инициализации приложения

    // Функция для загрузки содержимого страницы
    async function loadPageContent(pageId) {
        console.log(`Загрузка содержимого для страницы: ${pageId}`);
        // Показать индикатор загрузки
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.classList.remove('hidden');
        }

        try {
            const response = await fetch(`pages/${pageId}.html`);
            if (!response.ok) {
                // Если файл не найден, загружаем специальную страницу ошибки
                if (response.status === 404) {
                    console.warn(`Страница ${pageId}.html не найдена.`);
                    pageContentContainer.innerHTML = `<div class="page-content"><h2>Страница не найдена</h2><p>Запрашиваемая страница "${pageId}" не найдена.</p></div>`;
                    return;
                } else {
                    throw new Error(`Ошибка загрузки страницы (${response.status}): ${response.statusText}`);
                }
            }
            const htmlContent = await response.text();
            pageContentContainer.innerHTML = htmlContent;
            console.log(`Содержимое страницы ${pageId} успешно загружено.`);
            
            // После загрузки контента, инициализируем скрипты для конкретной страницы
            initializePageScripts(pageId);
            
        } catch (error) {
            console.error('Ошибка при загрузке страницы:', error);
            pageContentContainer.innerHTML = `<div class="page-content"><h2>Ошибка загрузки</h2><p>Не удалось загрузить страницу "${pageId}". Попробуйте позже.</p><p>Ошибка: ${error.message}</p></div>`;
        } finally {
            // Скрыть индикатор загрузки
            if (loadingIndicator) {
                loadingIndicator.classList.add('hidden');
            }
        }
    }

    // Функция для инициализации скриптов конкретной страницы
    function initializePageScripts(pageId) {
        console.log(`Инициализация скриптов для страницы: ${pageId}`);
        
        // --- ИСПРАВЛЕНИЕ: Обновляем UI кошелька после загрузки страницы ---
        // Это необходимо, потому что элементы #walletStatus, #actionBtn и т.д. 
        // появляются только после загрузки содержимого страницы.
        try {
            if (window.UIManager && typeof window.UIManager.updateWalletUI === 'function') {
                console.log("Вызов UIManager.updateWalletUI() после загрузки страницы");
                window.UIManager.updateWalletUI();
            } else {
                console.warn("UIManager.updateWalletUI не доступен после загрузки страницы", pageId);
            }
        } catch (uiUpdateError) {
            console.error("Ошибка при вызове UIManager.updateWalletUI() после загрузки страницы:", pageId, uiUpdateError);
        }
        // --- Конец исправления ---
    }

    // Функция для переключения активной страницы
    function switchPage(pageId) {
        console.log(`Переключение на страницу: ${pageId}`);
        // Обновить активную ссылку в навигации
        navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${pageId}`) {
                link.parentElement.classList.add('active');
            } else {
                link.parentElement.classList.remove('active');
            }
        });
        // Загрузить содержимое новой страницы
        loadPageContent(pageId);
    }

    // Назначить обработчики кликов на ссылки навигации
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('href').substring(1);
            switchPage(pageId);
        });
    });

    // Загрузить домашнюю страницу по умолчанию
    switchPage('home');
});