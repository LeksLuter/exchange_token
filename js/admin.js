(function () {
    'use strict';

    class AdminManager {
        constructor() {
            this.isAdmin = false;
            this.adminAddress = "";
            // Инициализация UI админки будет происходить после проверки статуса
        }

        // Проверка, является ли текущий адрес администратором
        async checkAdminStatus(address) {
            console.log("Проверка статуса администратора для адреса:", address);
            try {
                // Проверяем, загружен ли tokenListManager
                if (!window.tokenListManager) {
                    console.error("tokenListManager не доступен для проверки администратора");
                    this.updateAdminUI(); // Обновляем UI, показывая, что не админ
                    return;
                }

                // Получаем список админов из tokenListManager
                const adminAddresses = window.tokenListManager.admins || [];

                // Проверяем, находится ли адрес в списке админов
                this.isAdmin = adminAddresses.includes(address);
                this.adminAddress = address;

                console.log("Статус администратора:", this.isAdmin);

                // Обновляем UI админки
                this.updateAdminUI();
            } catch (error) {
                console.error("Ошибка при проверке статуса администратора:", error);
                this.isAdmin = false;
                this.adminAddress = "";
                this.updateAdminUI(); // Обновляем UI, показывая, что не админ
            }
        }

        // Обновление UI админки в зависимости от статуса
        updateAdminUI() {
            const adminPage = document.querySelector('.admin-page');
            const adminAccessDenied = document.getElementById('adminAccessDenied');
            const adminPanel = document.getElementById('adminPanel');

            if (this.isAdmin) {
                // Показываем панель администратора
                if (adminAccessDenied) adminAccessDenied.style.display = 'none';
                if (adminPanel) adminPanel.style.display = 'block';
                if (adminPage) adminPage.classList.remove('hidden');
                console.log("Доступ к панели администратора предоставлен.");
            } else {
                // Скрываем панель администратора и показываем сообщение
                if (adminPanel) adminPanel.style.display = 'none';
                if (adminAccessDenied) adminAccessDenied.style.display = 'block';
                if (adminPage) adminPage.classList.add('hidden');
                console.log("Доступ к панели администратора запрещён.");
            }
        }

        // Инициализация AdminManager
        init() {
            console.log("Инициализация AdminManager...");
            // Проверяем, доступен ли walletManager
            // Используем более безопасный способ проверки существования объекта и метода
            if (window.walletManager && typeof window.walletManager.restoreConnectionState === 'function') {
                // Предполагаем, что walletManager имеет событие или callback
                // Это место может потребовать адаптации в зависимости от реализации walletManager
                const state = window.walletManager.restoreConnectionState();
                // Проверяем, что restoreConnectionState вернул объект
                if (state && typeof state === 'object') {
                    const { connected, address } = state; // Деструктуризация после проверки
                    if (connected && address) {
                        this.checkAdminStatus(address);
                    } else {
                        // Кошелек не подключен, скрываем админку
                        this.updateAdminUI();
                    }
                } else {
                    console.warn("walletManager.restoreConnectionState() не вернул ожидаемый объект. Состояние администратора не может быть проверено автоматически.");
                    // Скрываем админку по умолчанию
                    this.updateAdminUI();
                }
            } else {
                console.warn("walletManager не доступен или не содержит restoreConnectionState для AdminManager. Состояние администратора не может быть проверено автоматически.");
                // Скрываем админку по умолчанию
                this.updateAdminUI();
            }
        }
    }

    // Инициализация AdminManager и добавление его в глобальный объект window
    document.addEventListener("DOMContentLoaded", function () {
        window.adminManager = new AdminManager();
        // Попробуем инициализировать, если walletManager уже готов
        // Повторяем проверку внутри DOMContentLoaded
        if (window.walletManager && typeof window.walletManager.restoreConnectionState === 'function') {
            const state = window.walletManager.restoreConnectionState();
            // Проверяем, что restoreConnectionState вернул объект
            if (state && typeof state === 'object') {
                const { connected, address } = state; // Деструктуризация после проверки
                if (connected && address) {
                    window.adminManager.checkAdminStatus(address);
                }
            }
        }
        console.log("AdminManager инициализирован и доступен как window.adminManager");
    });

})();