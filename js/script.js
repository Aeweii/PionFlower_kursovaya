// КОНСТАНТЫ
const DELIVERY_PRICES = {
    center: 200,
    west: 300,
    east: 300,
    north: 300,
    south: 300,
    urban: 350,
    dzhalil: 500
};
const FREE_DELIVERY_THRESHOLD = 3000;
const ITEMS_PER_PAGE = 8;
const ADMIN_SECRET = "Pion";



// АДМИН-ПАНЕЛЬ 
function initAdminAccess() {
    const urlParams = new URLSearchParams(window.location.search);
    const secretFromUrl = urlParams.get('admin_secret');

    if (secretFromUrl === ADMIN_SECRET) {
        localStorage.setItem('adminLoggedIn', 'true');
        if (getCurrentPage() !== 'admin') {
            window.location.href = 'admin.html?admin_secret=' + ADMIN_SECRET;
        }
        return;
    }

    if (getCurrentPage() === 'admin') {
        initAdminPage();
    }
}


// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
let favorites = [];          // Массив ID товаров, добавленных в избранное
let cart = [];               // Массив товаров в корзине 
let currentFilter = 'all';   // Текущий фильтр категории 
let currentSort = 'default'; // Текущий тип сортировки товаров
let currentPage = 1;         // Текущая страница пагинации
let currentSearchQuery = ''; // Текущий поисковый запрос
let reviews = {};            // Объект с отзывами
let currentProduct = null;   // Текущий просматриваемый товар

// Кеш для продуктов
let allProductsCache = [];


// ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    initBurgerMenu();        // Бургер-меню для мобильных устройств
    initThemeToggle();       // Переключатель светлой/темной темы
    initCartModal();         // Модальное окно корзины
    updateCartCount();       // Обновляем счетчик товаров в иконке корзины
    initGlobalModalClose();  // Закрытие модалок при клике на фон
    initAdminAccess();       // Проверка доступа к админке


    const page = getCurrentPage();

    if (page === 'index') {
        initIndexPage();
    } else if (page === 'catalog') {
        initCatalogPage();
    } else if (page === 'product-detail') {
        initProductDetailPage();
    } else if (page === 'delivery') {
        initDeliveryPage();
    } else if (page === 'contacts') {
        initContactsPage();
    } else if (page === 'admin') {
        initAdminPage();
    } else if (page === 'profile') {
        initProfilePage();
    }

    initAccordion();
});

// Глобальное закрытие модальных окон по клику на фон
function initGlobalModalClose() {
    document.addEventListener('click', function (e) {
        // Клик по фону модального окна
        if (e.target.classList && e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }

        // Клик по кнопке закрытия
        if (e.target.classList && e.target.classList.contains('modal-close')) {
            const modal = e.target.closest('.modal');
            if (modal) modal.classList.remove('active');
            e.preventDefault();
        }
    });
}
// Загрузка данных из localStorage в глобальные переменные
function loadFromStorage() {
    favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    reviews = JSON.parse(localStorage.getItem('productReviews')) || {};
}

// Определение текущей страницы по пути URL
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('index.html') || path === '/' || path === '') return 'index';
    if (path.includes('catalog.html')) return 'catalog';
    if (path.includes('product-detail.html')) return 'product-detail';
    if (path.includes('delivery.html')) return 'delivery';
    if (path.includes('contacts.html')) return 'contacts';
    if (path.includes('admin.html')) return 'admin';
    if (path.includes('profile.html')) return 'profile';
    return 'index';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Показ всплывающего уведомления
function showNotification(message, type = 'info') {
    let container = document.querySelector('.notifications-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notifications-container';
        document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    const icons = { success: '✓', error: '✗', info: 'ℹ' };

    notification.innerHTML = `
        <span class="notification-icon">${icons[type] || 'ℹ'}</span>
        <span class="notification-message">${escapeHtml(message)}</span>
        <button class="notification-close">✕</button>
    `;

    container.appendChild(notification);
    // Кнопка закрытия уведомления
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => notification.remove());
    // Автоматическое удаление через 3 секунды
    setTimeout(() => notification.remove(), 3000);
}


// КОМПОНЕНТ ПРОФИЛЯ В ШАПКЕ(-)
function initProfileHeader() {
    const profileSection = document.getElementById('profileSection');
    if (!profileSection) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser) {
        profileSection.innerHTML = `
            <div class="profile-menu" id="profileMenuBtn">
                <div class="profile-avatar-mini">
                    <i class="fas fa-user-circle"></i>
                </div>
                <span class="profile-name-mini">${escapeHtml(currentUser.name || 'Профиль')}</span>
                <i class="fas fa-chevron-down"></i>
                <div class="profile-dropdown" id="profileDropdown">
                    <a href="profile.html"><i class="fas fa-user"></i> Личный кабинет</a>
                    <button id="logoutBtnHeader"><i class="fas fa-sign-out-alt"></i> Выйти</button>
                </div>
            </div>
        `;

        const profileMenuBtn = document.getElementById('profileMenuBtn');
        const profileDropdown = document.getElementById('profileDropdown');
        const logoutBtn = document.getElementById('logoutBtnHeader');

        if (profileMenuBtn) {
            profileMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDropdown.classList.toggle('active');
            });

            document.addEventListener('click', () => {
                profileDropdown.classList.remove('active');
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('currentUser');
                location.reload();
            });
        }
    } else {
        profileSection.innerHTML = `
            <button class="login-btn" id="loginBtnHeader">
                <i class="fas fa-sign-in-alt"></i>
                <span>Войти</span>
            </button>
        `;

        const loginBtn = document.getElementById('loginBtnHeader');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => showAuthModal());
        }
    }
}


// ПОЛУЧЕНИЕ ДАННЫХ ТОВАРА
function getAllProducts() {
    const products = [];
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        products.push({
            id: parseInt(card.dataset.id),
            name: card.dataset.name,
            price: parseInt(card.dataset.price),
            category: card.dataset.category,
            image: card.dataset.image,
            badge: card.dataset.badge,
            description: card.dataset.description,
            composition: JSON.parse(card.dataset.composition || '[]')
        });
    });
    return products;
}
// Поиск товара по ID в DOM
function getProductById(id) {
    const cards = document.querySelectorAll('.product-card');
    for (let card of cards) {
        if (parseInt(card.dataset.id) === id) {
            return {
                id: parseInt(card.dataset.id),
                name: card.dataset.name,
                price: parseInt(card.dataset.price),
                category: card.dataset.category,
                image: card.dataset.image,
                badge: card.dataset.badge,
                description: card.dataset.description,
                composition: JSON.parse(card.dataset.composition || '[]')
            };
        }
    }
    return null;
}


// БУРГЕР-МЕНЮ
// Инициализация мобильного бургер-меню
function initBurgerMenu() {
    const burger = document.getElementById('burgerMenu');
    const mobileMenu = document.getElementById('mobileMenu');

    if (!burger || !mobileMenu) return;

    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            mobileMenu.classList.remove('active');
            // Блокируем прокрутку основного контента при открытом меню
            document.body.style.overflow = '';
        });
    });
}


// ТЕМНАЯ ТЕМА
// Инициализация переключателя светлой/темной темы
function initThemeToggle() {
    const toggle = document.getElementById("themeToggle");
    if (!toggle) return;

    // Восстанавливаем сохраненную тему
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-theme");
    }

    toggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-theme");
        localStorage.setItem("theme", document.body.classList.contains("dark-theme") ? "dark" : "light");
    });
}


// КОРЗИНА
// Обновление счетчика товаров в иконке корзины
function updateCartCount() {
    const cartCountElement = document.getElementById("cartCount");
    if (!cartCountElement) return;
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    cartCountElement.textContent = totalItems;
    cartCountElement.style.display = totalItems > 0 ? "flex" : "none";
}
// Добавление товара в корзину
function addToCart(product, btnElement) {
    // Проверяем, есть ли уже такой товар в корзине
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    // Сохранение обновленной корзины в localStorage
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    showNotification(`"${product.name}" добавлен в корзину`, "success");
    showCartNotification();

    // Визуальный эффект на кнопке
    if (btnElement) {
        const originalText = btnElement.innerHTML;
        btnElement.innerHTML = '<i class="fas fa-check"></i> Добавлено';
        setTimeout(() => { btnElement.innerHTML = originalText; }, 1500);
    }
}
// Показ анимации уведомления о добавлении в корзину
function showCartNotification() {
    const notification = document.getElementById("cartNotification");
    if (notification) {
        notification.classList.add("show");
        setTimeout(() => notification.classList.remove("show"), 2000);
    }
}
// Открытие модального окна корзины
function openCartModal() {
    const modal = document.getElementById("cartModal");
    if (modal) {
        displayCart(); // Отображаем актуальное содержимое корзины
        modal.classList.add("active");
    }
}
// Закрытие модального окна корзины
function closeCartModal() {
    const modal = document.getElementById("cartModal");
    if (modal) modal.classList.remove("active");
}
// Отображение товаров в корзине
function displayCart() {
    const cartItemsList = document.getElementById("cartItemsList");
    if (!cartItemsList) return;

    if (cart.length === 0) {
        // Пустая корзина
        cartItemsList.innerHTML = `<div class="empty-cart-message">
            <i class="fas fa-shopping-basket"></i>
            <p>Ваша корзина пуста</p>
            <a href="catalog.html" class="btn btn-primary" style="display: inline-block; padding: 10px 20px; border-radius: 30px; text-decoration: none;">Перейти в каталог</a>
        </div>`;
        updateCartSummary();
        return;
    }
    // Рендеринг каждого товара в корзине
    cartItemsList.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-image">
                <img src="${item.image || 'assets/media/img/default.jpg'}" alt="${item.name}" onerror="this.src='assets/media/img/default.jpg'">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${escapeHtml(item.name)}</div>
                <div class="cart-item-price">${item.price.toLocaleString()} ₽</div>
                <div class="cart-item-actions">
                    <button class="cart-quantity-btn" data-action="decr" data-id="${item.id}">−</button>
                    <span class="cart-item-quantity">${item.quantity || 1}</span>
                    <button class="cart-quantity-btn" data-action="incr" data-id="${item.id}">+</button>
                    <button class="cart-remove-btn" data-id="${item.id}" title="Удалить">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join("");

    attachCartEvents();  // Привязываем обработчики к кнопкам
    updateCartSummary(); // Обновляем итоговую сумму
}
// Привязка событий к кнопкам в корзине (удаление, изменение количества)
function attachCartEvents() {
    document.querySelectorAll(".cart-quantity-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            const item = cart.find(i => i.id === id);
            if (!item) return;
            if (btn.dataset.action === "incr") {
                item.quantity++;
            } else if (item.quantity > 1) {
                item.quantity--;
            } else {
                cart = cart.filter(i => i.id !== id);
            }
            localStorage.setItem("cart", JSON.stringify(cart));
            displayCart();      // Перерисовываем корзину
            updateCartCount();  // Обновляем счетчик в шапке
        });
    });
    // Обработчики для кнопок удаления
    document.querySelectorAll(".cart-remove-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            cart = cart.filter(i => i.id !== parseInt(btn.dataset.id));
            localStorage.setItem("cart", JSON.stringify(cart));
            displayCart();
            updateCartCount();
            showNotification("Товар удален из корзины", "info");
        });
    });
}
// Обновление итоговой суммы корзины с учетом доставки
function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const deliverySelect = document.getElementById("cartDeliveryZoneSelect");
    let deliveryPrice = deliverySelect ? DELIVERY_PRICES[deliverySelect.value] || 0 : 0;
    // Бесплатная доставка при сумме заказа >= порогового значения
    const finalDelivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : deliveryPrice;
    const total = subtotal + finalDelivery;
    const needMore = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : FREE_DELIVERY_THRESHOLD - subtotal;
    // Вспомогательная функция для установки текста
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    setText("cartSubtotal", `${subtotal.toLocaleString()} ₽`);
    setText("cartTotalItems", totalItems);
    setText("cartDelivery", `${finalDelivery.toLocaleString()} ₽`);
    setText("cartTotal", `${total.toLocaleString()} ₽`);

    const freeDeliveryNote = document.getElementById("freeDeliveryNote");
    if (freeDeliveryNote) {
        freeDeliveryNote.innerHTML = subtotal >= FREE_DELIVERY_THRESHOLD
            ? '<i class="fas fa-check-circle"></i> Бесплатная доставка!'
            : `<i class="fas fa-truck"></i> Добавьте товаров на ${needMore.toLocaleString()} ₽ для бесплатной доставки`;
    }
}
// Проверка и получение адреса доставки из формы  
function validateAndGetAddress() {
    let addressInput = document.getElementById('deliveryAddressInput');
    let address = addressInput ? addressInput.value.trim() : '';

    if (!address) {
        addressInput = document.getElementById('profileDeliveryAddress');
        address = addressInput ? addressInput.value.trim() : '';
    }

    if (!address) {
        showNotification('Пожалуйста, укажите точный адрес доставки (улица, дом, квартира/офис)', 'error');
        return null;
    }

    if (address.length < 5) {
        showNotification('Пожалуйста, укажите полный и точный адрес для доставки', 'error');
        return null;
    }

    return address;
}
// Оформление заказа
function checkout() {
    if (cart.length === 0) {
        showNotification("Корзина пуста", "error");
        return;
    }
    // Проверяем адрес доставки
    const deliveryAddress = validateAndGetAddress();
    if (!deliveryAddress) return;
    // Получаем выбранную зону доставки
    let deliverySelect = document.getElementById("cartDeliveryZoneSelect");
    let deliveryZone = deliverySelect?.options[deliverySelect.selectedIndex]?.text || "Не выбран";
    let deliveryZoneValue = deliverySelect?.value || "center";

    if (!deliverySelect) {
        deliverySelect = document.getElementById("cartDeliveryZone");
        deliveryZone = deliverySelect?.options[deliverySelect.selectedIndex]?.text || "Не выбран";
        deliveryZoneValue = deliverySelect?.value || "center";
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    let deliveryPrice = DELIVERY_PRICES[deliveryZoneValue] || 0;
    if (subtotal >= FREE_DELIVERY_THRESHOLD) deliveryPrice = 0;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    const order = {
        id: Date.now(),                  // Уникальный ID на основе времени
        date: new Date().toISOString(),  // Дата и время заказа
        items: [...cart],                // Копия массива товаров
        delivery: {
            zone: deliveryZone,
            price: deliveryPrice,
            address: deliveryAddress
        },
        subtotal: subtotal,
        total: subtotal + deliveryPrice,
        status: "новый",                  // Статус заказа
        userId: currentUser?.id || null,  // ID пользователя (если авторизован)
        userName: currentUser?.name || 'Гость',
        userPhone: currentUser?.phone || 'Не указан'
    };
    // Сохранение заказов в localStorage
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.unshift(order); // Новые заказы в начало списка
    localStorage.setItem("orders", JSON.stringify(orders));
    // Очищаем корзину
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    // Закрываем модальное окно корзины
    const cartModal = document.getElementById("cartModal");
    if (cartModal) cartModal.classList.remove("active");
    // Обновляем отображение в профиле
    if (typeof displayProfileCart === 'function') displayProfileCart();
    if (typeof displayCart === 'function') displayCart();

    showNotification(`Заказ #${order.id} оформлен! Доставка по адресу: ${deliveryAddress}`, "success");
}
// Инициализация модального окна корзины
function initCartModal() {
    const cartIcon = document.getElementById("cartIcon");
    const closeCart = document.getElementById("closeCartBtn");
    const continueBtn = document.getElementById("continueShoppingBtn");
    const checkoutBtn = document.getElementById("checkoutBtn");
    const deliverySelect = document.getElementById("cartDeliveryZoneSelect");
    const modal = document.getElementById("cartModal");
    // Открытие корзины по клику на иконку
    cartIcon?.addEventListener("click", openCartModal);
    // Закрытие по кнопке
    if (closeCart) {
        closeCart.addEventListener("click", (e) => {
            e.stopPropagation();
            closeCartModal();
        });
    }
    // Кнопка "Продолжить покупки"
    continueBtn?.addEventListener("click", closeCartModal);
    // Кнопка "Оформить заказ"
    checkoutBtn?.addEventListener("click", checkout);
    // При изменении зоны доставки пересчитываем итог
    deliverySelect?.addEventListener("change", updateCartSummary);
    // Закрытие при клике на фон
    modal?.addEventListener("click", (e) => {
        if (e.target === modal) closeCartModal();
    });
}


// СТРАНИЦА КАТАЛОГА (С ИСПРАВЛЕННОЙ ПАГИНАЦИЕЙ)

// Кеширование всех продуктов
function cacheAllProducts() {
    const cards = document.querySelectorAll('.product-card');
    allProductsCache = [];
    cards.forEach(card => {
        allProductsCache.push({
            element: card.cloneNode(true),   // Клон для повторного использования
            id: parseInt(card.dataset.id),
            name: card.dataset.name,
            price: parseInt(card.dataset.price),
            category: card.dataset.category,
            image: card.dataset.image,
            badge: card.dataset.badge,
            description: card.dataset.description,
            composition: JSON.parse(card.dataset.composition || '[]')
        });
    });
}
// Фильтрация товаров из кеша по текущим критериям
function getFilteredProductsFromCache() {
    let products = [...allProductsCache];
    // Фильтр по категории
    if (currentFilter !== 'all') {
        products = products.filter(product => product.category === currentFilter);
    }
    // Фильтр по поисковому запросу
    if (currentSearchQuery) {
        const query = currentSearchQuery.toLowerCase();
        products = products.filter(product =>
            product.name.toLowerCase().includes(query) ||
            (product.description && product.description.toLowerCase().includes(query))
        );
    }

    return products;
}
// Сортировка отфильтрованных товаров
function sortProductsFromCache(products) {
    const sorted = [...products];

    if (currentSort === 'price-asc') {
        sorted.sort((a, b) => a.price - b.price);    // По возрастанию цены
    } else if (currentSort === 'price-desc') {
        sorted.sort((a, b) => b.price - a.price);    // По убыванию цены
    } else {
        sorted.sort((a, b) => a.id - b.id);          // По умолчанию - по ID
    }

    return sorted;
}
// Основная функция обновления отображения каталога
function updateCatalogDisplay() {
    const grid = document.getElementById("catalogGrid");
    if (!grid) return;
    // Если кеш пуст - заполняем его
    if (allProductsCache.length === 0) {
        cacheAllProducts();
    }
    // Получаем отфильтрованные товары
    let filteredProducts = getFilteredProductsFromCache();
    const foundCount = filteredProducts.length;
    // Обновляем счетчик найденных товаров (если есть поиск)
    const searchFoundSpan = document.getElementById("searchFoundCount");
    if (searchFoundSpan) searchFoundSpan.textContent = foundCount;

    const searchStats = document.getElementById("searchStats");
    if (searchStats) searchStats.style.display = currentSearchQuery ? "flex" : "none";
    // Сортируем
    const sortedProducts = sortProductsFromCache(filteredProducts);
    // Пагинация
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = sortedProducts.slice(start, start + ITEMS_PER_PAGE);
    // Если товаров нет - показываем сообщение
    if (paginated.length === 0 && filteredProducts.length === 0) {
        grid.innerHTML = `<div class="no-results-message" style="grid-column:1/-1; text-align:center; padding:60px;">
            <i class="fas fa-search" style="font-size:48px; margin-bottom:16px; opacity:0.5;"></i>
            <h3>Ничего не найдено</h3>
            <p>Попробуйте изменить параметры поиска</p>
            <button class="btn-primary" onclick="window.resetFilters()">Сбросить фильтры</button>
        </div>`;
        const paginationContainer = document.getElementById("pagination");
        if (paginationContainer) paginationContainer.innerHTML = "";
        return;
    }
    // Отрисовываем карточки товаров на текущей странице
    grid.innerHTML = '';
    paginated.forEach(product => {
        const clonedCard = product.element.cloneNode(true);
        grid.appendChild(clonedCard);
    });
    // Обновляем пагинацию и привязываем события к карточкам
    updatePagination(filteredProducts.length);
    attachAllCardEvents();
}
// Обновление элементов пагинации
function updatePagination(totalItems) {
    const container = document.getElementById("pagination");
    if (!container) return;

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) {
        container.innerHTML = "";
        return;
    }

    let html = `<button class="pagination-btn pagination-prev" ${currentPage === 1 ? 'disabled' : ''}>&laquo;</button>`;
    // Генерация кнопок страниц
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="pagination-btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
        }
    } else {
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                html += `<button class="pagination-btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                html += `<span class="pagination-dots">...</span>`;
            }
        }
    }

    html += `<button class="pagination-btn pagination-next" ${currentPage === totalPages ? 'disabled' : ''}>&raquo;</button>`;

    container.innerHTML = html;
    // Обработчики для кнопок страниц
    document.querySelectorAll(".pagination-btn[data-page]").forEach(btn => {
        btn.addEventListener("click", () => {
            currentPage = parseInt(btn.dataset.page);
            updateCatalogDisplay();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    });
    // Обработчики для кнопок "Назад" и "Вперед"
    const prevBtn = container.querySelector('.pagination-prev');
    const nextBtn = container.querySelector('.pagination-next');

    if (prevBtn && !prevBtn.disabled) {
        prevBtn.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                updateCatalogDisplay();
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        });
    }

    if (nextBtn && !nextBtn.disabled) {
        nextBtn.addEventListener("click", () => {
            if (currentPage < totalPages) {
                currentPage++;
                updateCatalogDisplay();
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        });
    }
}
// Привязка всех событий к карточкам товаров
function attachAllCardEvents() {
    document.querySelectorAll(".product-card").forEach(card => {
        // Заменяем карточку на её клон, чтобы сбросить старые обработчики
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
        // Клик по карточке
        newCard.addEventListener("click", (e) => {
            if (e.target.closest(".favorite-btn") || e.target.closest(".add-to-cart")) return;
            const productId = newCard.dataset.id;
            window.location.href = `product-detail.html?id=${productId}`;
        });
        // Кнопка "Избранное"
        const favBtn = newCard.querySelector('.favorite-btn');
        if (favBtn) {
            const id = parseInt(favBtn.dataset.id);
            if (favorites.includes(id)) favBtn.classList.add("active");
            favBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const productId = parseInt(favBtn.dataset.id);
                const idx = favorites.indexOf(productId);
                if (idx === -1) {
                    favorites.push(productId);
                    favBtn.classList.add("active");
                    showNotification("Добавлено в избранное", "success");
                } else {
                    favorites.splice(idx, 1);
                    favBtn.classList.remove("active");
                    showNotification("Удалено из избранного", "info");
                }
                localStorage.setItem("favorites", JSON.stringify(favorites));
            });
        }
        // Кнопка "В корзину"
        const cartBtn = newCard.querySelector('.add-to-cart');
        if (cartBtn) {
            cartBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const product = getProductFromCard(newCard);
                addToCart(product, cartBtn);
            });
        }
    });
}
// Извлечение объекта товара из DOM-элемента карточки
function getProductFromCard(card) {
    return {
        id: parseInt(card.dataset.id),
        name: card.dataset.name,
        price: parseInt(card.dataset.price),
        category: card.dataset.category,
        image: card.dataset.image,
        badge: card.dataset.badge,
        description: card.dataset.description,
        composition: JSON.parse(card.dataset.composition || '[]')
    };
}
//  Инициализация страницы каталога
function initCatalogPage() {
    cacheAllProducts();           // Кешируем все товары
    initCatalogFilters();         // Инициализируем фильтры и сортировку
    initCatalogSearch();          // Инициализируем поиск
    attachAllCardEvents();        // Привязываем события к карточкам
    updateCatalogDisplay();       // Отображаем первую страницу каталога
}

function initCatalogFilters() {
    // Обработчики для кнопок фильтрации категорий
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter || btn.dataset.category || 'all';
                currentPage = 1;   // Сброс на первую страницу при смене фильтра
                updateCatalogDisplay();
            });
        });
    }
    // Обработчик для выпадающего списка сортировки
    const sortSelect = document.getElementById("sort");
    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            currentSort = e.target.value;
            currentPage = 1;
            updateCatalogDisplay();
        });
    }
}
// Сброс всех фильтров и поиска
function resetFilters() {
    currentFilter = 'all';
    currentSearchQuery = '';
    currentPage = 1;
    // Сбрасываем активную кнопку фильтра
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length) {
        filterBtns.forEach(btn => {
            if (btn.dataset.category === 'all' || btn.dataset.filter === 'all') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    // Очищаем поле поиска
    const searchInput = document.getElementById("catalogSearchInput");
    if (searchInput) searchInput.value = '';
    const searchClear = document.getElementById("catalogSearchClear");
    if (searchClear) searchClear.style.display = 'none';

    updateCatalogDisplay();
}
// Делаем функцию доступной глобально
window.resetFilters = resetFilters;
// Инициализация поиска на странице каталога
function initCatalogSearch() {
    const input = document.getElementById("catalogSearchInput");
    const clear = document.getElementById("catalogSearchClear");
    if (!input) return;

    const search = () => {
        currentSearchQuery = input.value.trim().toLowerCase();
        if (clear) clear.style.display = currentSearchQuery ? "flex" : "none";
        currentPage = 1;
        updateCatalogDisplay();
    };

    let timer;
    input.addEventListener("input", () => {
        clearTimeout(timer);
        timer = setTimeout(search, 300);
    });
    // Кнопка очистки поиска
    if (clear) {
        clear.addEventListener("click", () => {
            input.value = "";
            currentSearchQuery = "";
            clear.style.display = "none";
            currentPage = 1;
            updateCatalogDisplay();
            input.focus();
        });
    }
}


// СТРАНИЦА ТОВАРА
// Инициализация страницы детального просмотра товара
function initProductDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));

    if (productId) {
        currentProduct = getProductById(productId);
        if (currentProduct) {
            renderProductDetail();      // Отображаем информацию о товаре
            setupProductActions();      // Настраиваем кнопки (корзина, избранное)
            renderReviews();            // Отображаем отзывы
            setupReviewForm();          // Настраиваем форму добавления отзыва
        } else {
            showProductNotFound();      // Товар не найден
        }
    } else {
        showProductNotFound();
    }
}
// Отрисовка детальной информации о товаре
function renderProductDetail() {
    if (!currentProduct) return;

    const isFavorite = favorites.includes(currentProduct.id);
    const composition = Array.isArray(currentProduct.composition) ? currentProduct.composition : JSON.parse(currentProduct.composition || '[]');

    const html = `
        <div class="product-image">
            <img src="${currentProduct.image || 'assets/media/img/default.jpg'}" alt="${currentProduct.name}" onerror="this.src='assets/media/img/default.jpg'">
            ${currentProduct.badge ? `<span class="product-badge">${currentProduct.badge}</span>` : ''}
            <button class="favorite-corner-btn ${isFavorite ? 'active' : ''}" id="favoriteCornerBtn">
                <i class="fas fa-heart"></i>
            </button>
        </div>
        <div class="product-info">
            <h1 class="product-title">${escapeHtml(currentProduct.name)}</h1>
            <div class="product-price">${currentProduct.price.toLocaleString()} ₽</div>
            <div class="product-description">${escapeHtml(currentProduct.description)}</div>
            <div class="product-composition">
                <div class="composition-title">Состав букета:</div>
                <ul class="composition-list">
                    ${composition.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                </ul>
            </div>
            <div class="product-actions">
                <button class="btn btn-primary" id="addToCartBtn">В корзину</button>
                <button class="btn btn-outline" id="quickOrderBtn">Купить в 1 клик</button>
            </div>
        </div>
    `;

    const container = document.getElementById('productDetail');
    if (container) container.innerHTML = html;
}
// Настройка обработчиков для кнопок на странице товара
function setupProductActions() {
    const addToCartBtn = document.getElementById('addToCartBtn');
    const quickOrderBtn = document.getElementById('quickOrderBtn');
    const favoriteBtn = document.getElementById('favoriteCornerBtn');
    // Добавление в корзину
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => addToCart(currentProduct, addToCartBtn));
    }
    // Быстрый заказ
    if (quickOrderBtn) {
        quickOrderBtn.addEventListener('click', () => openQuickOrderModal());
    }
    // Избранное
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', () => {
            const index = favorites.indexOf(currentProduct.id);
            if (index === -1) {
                favorites.push(currentProduct.id);
                favoriteBtn.classList.add('active');
                showNotification('Добавлено в избранное', 'success');
            } else {
                favorites.splice(index, 1);
                favoriteBtn.classList.remove('active');
                showNotification('Удалено из избранного', 'info');
            }
            localStorage.setItem('favorites', JSON.stringify(favorites));
        });
    }
}
// Отображение списка отзывов для текущего товара
function renderReviews() {
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList || !currentProduct) return;

    const productReviews = reviews[currentProduct.id] || [];

    if (productReviews.length === 0) {
        reviewsList.innerHTML = `<div class="empty-reviews"><i class="fas fa-comment-dots"></i><p>Пока нет отзывов. Будьте первым!</p></div>`;
        return;
    }

    reviewsList.innerHTML = productReviews.map(review => `
        <div class="review-card">
            <div class="review-name">${escapeHtml(review.name)}</div>
            <div class="review-info">${formatDate(review.date)}</div>
            <div class="review-rating">${renderStars(review.rating)}</div>
            <div class="review-text">"${escapeHtml(review.text)}"</div>
        </div>
    `).join('');
}
// Генерация HTML звезд рейтинга
function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
    }
    return stars;
}
// Форматирование даты для отображения
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'сегодня';
    if (diff === 1) return 'вчера';
    if (diff < 7) return `${diff} дня назад`;
    return date.toLocaleDateString('ru-RU');
}
// Настройка формы добавления отзыва
function setupReviewForm() {
    const form = document.getElementById('reviewForm');
    if (!form) return;

    const starsContainer = document.getElementById('ratingStarsInput');
    const ratingInput = document.getElementById('reviewRating');
    // Настройка кликабельных звезд для выбора рейтинга
    if (starsContainer && ratingInput) {
        const stars = starsContainer.querySelectorAll('i');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                ratingInput.value = rating;
                stars.forEach(s => {
                    if (parseInt(s.dataset.rating) <= rating) {
                        s.classList.remove('far');
                        s.classList.add('fas');
                    } else {
                        s.classList.remove('fas');
                        s.classList.add('far');
                    }
                });
            });
        });
    }
    // Обработка отправки формы
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reviewName')?.value.trim();
        const rating = parseInt(document.getElementById('reviewRating')?.value || 5);
        const text = document.getElementById('reviewText')?.value.trim();

        if (!name || !text) {
            showNotification('Заполните имя и отзыв', 'error');
            return;
        }

        const newReview = { id: Date.now(), name, rating, text, date: new Date().toISOString() };
        // Сохраняем отзыв
        if (!reviews[currentProduct.id]) reviews[currentProduct.id] = [];
        reviews[currentProduct.id].unshift(newReview);
        localStorage.setItem('productReviews', JSON.stringify(reviews));
        // Очищаем форму
        form.reset();
        if (ratingInput) ratingInput.value = '5';
        if (starsContainer) {
            starsContainer.querySelectorAll('i').forEach(star => {
                star.classList.remove('fas');
                star.classList.add('far');
            });
        }

        renderReviews();
        showNotification('Спасибо за ваш отзыв!', 'success');
    });
}
// Открытие модального окна для быстрого заказа (1 клик)
function openQuickOrderModal() {
    let modal = document.getElementById('quickOrderModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'quickOrderModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header"><h3>Быстрый заказ</h3><button class="modal-close">&times;</button></div>
                <div class="modal-body">
                    <form id="quickOrderForm">
                        <div class="form-group"><input type="text" id="quickName" placeholder="Ваше имя" required></div>
                        <div class="form-group"><input type="tel" id="quickPhone" placeholder="Телефон" required></div>
                        <div class="form-group"><input type="text" id="quickAddress" placeholder="Адрес доставки"></div>
                        <button type="submit" class="btn btn-primary w-100">Заказать</button>
                    </form>
                    <p class="modal-hint">Мы свяжемся с вами для подтверждения</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        // Закрытие модалки
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            modal.classList.remove('active');
        });
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
        // Обработка отправки
        const form = document.getElementById('quickOrderForm');
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('quickName')?.value.trim();
            const phone = document.getElementById('quickPhone')?.value.trim();
            if (name && phone) {
                showNotification(`Спасибо, ${name}! Мы свяжемся с вами`, 'success');
                modal.classList.remove('active');
                form.reset();
            } else {
                showNotification('Заполните имя и телефон', 'error');
            }
        });
    }
    modal.classList.add('active');
}
// Отображение сообщения, что товар не найден
function showProductNotFound() {
    const container = document.getElementById('productDetail');
    if (container) {
        container.innerHTML = `<div style="text-align:center; padding:60px;"><h2>Товар не найден</h2><a href="catalog.html">Вернуться в каталог</a></div>`;
    }
}

// ГЛАВНАЯ СТРАНИЦА
function initIndexPage() {
    displayPopularProducts();   // Отображение популярных товаров
    initTeamSlider();           // Слайдер команды
    initReviewsCarousel();      // Карусель отзывов
    initContactForm();          // Форма обратной связи
    initCallbackModal();        // Модалка заказа звонка
}
// Отображение популярных товаров на главной странице
function displayPopularProducts() {
    const grid = document.getElementById("popularGrid");
    if (!grid) return;

    const cards = Array.from(document.querySelectorAll('.product-card'));
    const popularCards = cards.slice(0, 4);

    grid.innerHTML = '';
    popularCards.forEach(card => {
        const clone = card.cloneNode(true);
        grid.appendChild(clone);
    });

    attachEventsToContainer(grid);
}
// Привязка событий к контейнеру с карточками
function attachEventsToContainer(container) {
    container.querySelectorAll(".product-card").forEach(card => {
        card.addEventListener("click", (e) => {
            if (e.target.closest(".favorite-btn") || e.target.closest(".add-to-cart")) return;
            window.location.href = `product-detail.html?id=${card.dataset.id}`;
        });

        const favBtn = card.querySelector('.favorite-btn');
        if (favBtn) {
            const id = parseInt(favBtn.dataset.id);
            if (favorites.includes(id)) favBtn.classList.add("active");
            favBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const productId = parseInt(favBtn.dataset.id);
                const idx = favorites.indexOf(productId);
                if (idx === -1) {
                    favorites.push(productId);
                    favBtn.classList.add("active");
                    showNotification("Добавлено в избранное", "success");
                } else {
                    favorites.splice(idx, 1);
                    favBtn.classList.remove("active");
                    showNotification("Удалено из избранного", "info");
                }
                localStorage.setItem("favorites", JSON.stringify(favorites));
            });
        }

        const cartBtn = card.querySelector('.add-to-cart');
        if (cartBtn) {
            cartBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const product = getProductFromCard(card);
                addToCart(product, cartBtn);
            });
        }
    });
}
// Инициализация слайдера команды
function initTeamSlider() {
    const track = document.getElementById('teamSliderTrack');
    const prevBtn = document.getElementById('teamPrevBtn');
    const nextBtn = document.getElementById('teamNextBtn');
    const dotsContainer = document.getElementById('teamSliderDots');

    if (!track || !prevBtn || !nextBtn) return;

    const slides = Array.from(track.children);
    let slidesPerView = getSlidesPerView();
    let currentIndex = 0;
    let autoScrollInterval;
    // Определение количества видимых слайдов в зависимости от ширины экрана
    function getSlidesPerView() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }
    // Обновление позиции слайдера
    function updateSlider() {
        const slideWidth = slides[0].offsetWidth + 24;
        const maxIndex = Math.max(0, slides.length - slidesPerView);
        currentIndex = Math.min(currentIndex, maxIndex);
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        updateDots();
    }
    // Обновление точек-индикаторов
    function updateDots() {
        if (!dotsContainer) return;
        const maxIndex = Math.max(0, slides.length - slidesPerView);
        dotsContainer.innerHTML = '';
        for (let i = 0; i <= maxIndex; i++) {
            const dot = document.createElement('div');
            dot.classList.add('slider-dot');
            if (i === currentIndex) dot.classList.add('active');
            dot.addEventListener('click', () => { currentIndex = i; updateSlider(); resetAutoScroll(); });
            dotsContainer.appendChild(dot);
        }
    }

    function nextSlide() {
        const maxIndex = Math.max(0, slides.length - slidesPerView);
        currentIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
        updateSlider();
        resetAutoScroll();
    }

    function prevSlide() {
        const maxIndex = Math.max(0, slides.length - slidesPerView);
        currentIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex;
        updateSlider();
        resetAutoScroll();
    }

    function startAutoScroll() {
        if (autoScrollInterval) clearInterval(autoScrollInterval);
        autoScrollInterval = setInterval(() => { if (!document.hidden) nextSlide(); }, 5000);
    }

    function resetAutoScroll() {
        if (autoScrollInterval) { clearInterval(autoScrollInterval); startAutoScroll(); }
    }

    function stopAutoScroll() { if (autoScrollInterval) { clearInterval(autoScrollInterval); autoScrollInterval = null; } }

    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);
    // При изменении размера окна перезагружаем слайдер
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const newSlidesPerView = getSlidesPerView();
            if (newSlidesPerView !== slidesPerView) location.reload();
        }, 250);
    });
    // Пауза автоскролла при наведении
    const sliderContainer = document.querySelector('.team-slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopAutoScroll);
        sliderContainer.addEventListener('mouseleave', startAutoScroll);
        sliderContainer.addEventListener('touchstart', stopAutoScroll);
        sliderContainer.addEventListener('touchend', startAutoScroll);
    }

    setTimeout(() => { updateSlider(); startAutoScroll(); }, 100);
}
// Инициализация карусели отзывов
function initReviewsCarousel() {
    const carousel = document.getElementById("reviewsCarousel");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    if (!carousel || !prevBtn || !nextBtn) return;

    let scrollAmount = 0;
    const scrollStep = 280; // Шаг прокрутки в пикселях

    prevBtn.addEventListener("click", () => {
        scrollAmount = Math.max(0, scrollAmount - scrollStep);
        carousel.scrollTo({ left: scrollAmount, behavior: "smooth" });
    });

    nextBtn.addEventListener("click", () => {
        scrollAmount = Math.min(carousel.scrollWidth - carousel.clientWidth, scrollAmount + scrollStep);
        carousel.scrollTo({ left: scrollAmount, behavior: "smooth" });
    });
    // Автоматическая прокрутка каждые 4 секунды
    let autoScrollInterval;
    function startAutoScroll() {
        autoScrollInterval = setInterval(() => {
            if (document.hidden) return;
            const maxScroll = carousel.scrollWidth - carousel.clientWidth;
            if (scrollAmount >= maxScroll) { scrollAmount = 0; }
            else { scrollAmount = Math.min(maxScroll, scrollAmount + scrollStep); }
            carousel.scrollTo({ left: scrollAmount, behavior: "smooth" });
        }, 4000);
    }
    function stopAutoScroll() { clearInterval(autoScrollInterval); }

    carousel.addEventListener("mouseenter", stopAutoScroll);
    carousel.addEventListener("touchstart", stopAutoScroll);
    carousel.addEventListener("mouseleave", startAutoScroll);
    carousel.addEventListener("touchend", startAutoScroll);
    startAutoScroll();
}
// Инициализация формы обратной связи на главной странице
function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("contactName")?.value.trim();
        const email = document.getElementById("contactEmail")?.value.trim();
        const message = document.getElementById("contactMessage")?.value.trim();
        if (name && message) {
            showNotification(`Спасибо, ${name}! Мы ответим вам`, "success");
            form.reset();
            // Сохраняем сообщение в localStorage для админки
            const contacts = JSON.parse(localStorage.getItem("contacts")) || [];
            contacts.push({ id: Date.now(), name, email, message, date: new Date().toISOString() });
            localStorage.setItem("contacts", JSON.stringify(contacts));
        } else {
            showNotification("Заполните имя и сообщение", "error");
        }
    });
}
// Инициализация модального окна для заказа звонка
function initCallbackModal() {
    const callbackBtn = document.getElementById("callbackBtn");
    if (!callbackBtn) return;

    let modal = document.getElementById("quickOrderModal");
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'quickOrderModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header"><h3>Заказать звонок</h3><button class="modal-close">&times;</button></div>
                <div class="modal-body">
                    <form id="quickOrderForm">
                        <div class="form-group"><input type="text" id="quickName" placeholder="Ваше имя" required></div>
                        <div class="form-group"><input type="tel" id="quickPhone" placeholder="Телефон" required></div>
                        <button type="submit" class="btn btn-primary w-100">Перезвоните мне</button>
                    </form>
                    <p class="modal-hint">Мы свяжемся с вами в ближайшее время</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.modal-close');
        closeBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            modal.classList.remove('active');
        });
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

        const form = document.getElementById('quickOrderForm');
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('quickName')?.value.trim();
            const phone = document.getElementById('quickPhone')?.value.trim();
            if (name && phone) {
                showNotification(`Спасибо, ${name}! Мы перезвоним`, 'success');
                modal.classList.remove('active');
                form.reset();
            } else {
                showNotification('Заполните имя и телефон', 'error');
            }
        });
    }

    callbackBtn.addEventListener('click', () => modal.classList.add('active'));
}


// СТРАНИЦА ДОСТАВКИ
// Инициализация страницы доставки - калькулятор стоимости
function initDeliveryPage() {
    const form = document.getElementById('deliveryForm');
    const resultDiv = document.getElementById('calcResult');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const zone = document.getElementById('deliveryZone').value;
        const amount = parseFloat(document.getElementById('orderAmount').value);
        if (!zone) { showNotification('Выберите район доставки', 'error'); return; }

        const zoneNames = {
            center: 'Центр', west: 'Западный', east: 'Восточный',
            north: 'Северный', south: 'Южный', urban: 'Городок нефтяников', dzhalil: 'пгт Джалиль'
        };

        let price = DELIVERY_PRICES[zone];
        let isFree = amount && amount >= FREE_DELIVERY_THRESHOLD;
        if (isFree) price = 0;

        if (resultDiv) {
            resultDiv.style.display = 'block';
            if (isFree) {
                resultDiv.innerHTML = `<div>Бесплатная доставка!</div><div class="price free">0 ₽</div><div class="note">Район: ${zoneNames[zone]}</div><button onclick="closeResult()" style="margin-top:12px; background:none; border:none; cursor:pointer;">✕ Закрыть</button>`;
            } else {
                resultDiv.innerHTML = `<div>Доставка</div><div class="price">${price} ₽</div><div class="note">Район: ${zoneNames[zone]}</div><button onclick="closeResult()" style="margin-top:12px; background:none; border:none; cursor:pointer;">✕ Закрыть</button>`;
            }
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
}
// Глобальная функция для закрытия результата калькулятора
window.closeResult = function () {
    const resultDiv = document.getElementById('calcResult');
    if (resultDiv) resultDiv.style.display = 'none';
};

// СТРАНИЦА КОНТАКТОВ
// Инициализация страницы контактов
function initContactsPage() {
    // Форма обратной связи
    const form = document.getElementById('feedbackForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('feedbackName')?.value.trim();
            const phone = document.getElementById('feedbackPhone')?.value.trim();
            const message = document.getElementById('feedbackMessage')?.value.trim();
            if (!name || !phone || !message) {
                showNotification('Заполните все поля', 'error');
                return;
            }
            const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
            feedbacks.push({ id: Date.now(), name, phone, message, date: new Date().toISOString() });
            localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
            showNotification(`Спасибо, ${name}! Мы ответим вам`, 'success');
            form.reset();
        });
    }
    // Кнопка построения маршрута
    const routeBtn = document.getElementById('routeBtn');
    if (routeBtn) {
        routeBtn.addEventListener('click', () => {
            window.open('https://yandex.ru/maps/?rtext=~54.899183,52.296782&rtt=mt', '_blank');
        });
    }
}


// АДМИН-ПАНЕЛЬ
// Инициализация админ-панели
function initAdminPage() {
    const loginOverlay = document.getElementById('adminLoginOverlay');
    const adminContainer = document.getElementById('adminContainer');
    // Проверка авторизации
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        if (loginOverlay) loginOverlay.style.display = 'none';
        if (adminContainer) adminContainer.style.display = 'block';
        updateAdminStats();           // Обновляем статистику
        displayAdminOrders();         // Отображаем заказы
        displayAdminProducts();       // Отображаем товары
        displayAdminMessages();       // Отображаем сообщения
        initAdminTabs();              // Инициализируем вкладки
        initAddProductModal();        // Модалка добавления товара
        // Добавляем секретный ключ в URL, если его нет
        const url = new URL(window.location.href);
        if (!url.searchParams.has('admin_secret')) {
            url.searchParams.set('admin_secret', ADMIN_SECRET);
            window.history.replaceState({}, '', url);
        }
    } else {
        if (loginOverlay) loginOverlay.style.display = 'flex';
        if (adminContainer) adminContainer.style.display = 'none';
    }
    // Форма входа в админку
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const secret = document.getElementById('adminSecretWord').value;
            if (secret === ADMIN_SECRET) {
                localStorage.setItem('adminLoggedIn', 'true');
                const url = new URL(window.location.href);
                url.searchParams.set('admin_secret', ADMIN_SECRET);
                window.location.href = url.toString();
            } else {
                showNotification('Неверное секретное слово', 'error');
            }
        });
    }
    // Кнопка выхода из админки
    const closeBtn = document.getElementById('closeAdminBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            localStorage.removeItem('adminLoggedIn');
            window.location.href = 'index.html';
        });
    }
}
// Обновление статистики в админ-панели
function updateAdminStats() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const productsCount = document.querySelectorAll('.product-card').length;
    const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
    const messages = contacts.length + feedbacks.length;

    document.getElementById('statOrders') && (document.getElementById('statOrders').textContent = orders.length);
    document.getElementById('statProducts') && (document.getElementById('statProducts').textContent = productsCount);
    document.getElementById('statMessages') && (document.getElementById('statMessages').textContent = messages);
}
// Отображение списка заказов в админ-панели
function displayAdminOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const container = document.getElementById('ordersList');
    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = '<div class="empty-list">Заказов пока нет</div>';
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="admin-item">
            <div class="admin-item-header">
                <span class="admin-item-id">Заказ #${order.id}</span>
                <span class="admin-item-date">${new Date(order.date).toLocaleString()}</span>
            </div>
            <div class="admin-item-details">
                <div><strong>Клиент:</strong> ${escapeHtml(order.userName || 'Гость')} (${escapeHtml(order.userPhone || 'телефон не указан')})</div>
                <div><strong>Сумма:</strong> ${order.total.toLocaleString()} ₽</div>
                <div><strong>Доставка:</strong> ${order.delivery.zone} - ${order.delivery.price} ₽</div>
                <div class="order-address"><i class="fas fa-map-marker-alt"></i> <strong>Адрес доставки:</strong> ${escapeHtml(order.delivery.address)}</div>
                <div><strong>Товары:</strong> ${order.items.map(i => `${escapeHtml(i.name)} x${i.quantity}`).join(', ')}</div>
            </div>
            <div class="admin-item-actions">
                <button class="admin-edit-btn" onclick="showNotification('Функция редактирования статуса в разработке', 'info')">Изменить статус</button>
            </div>
        </div>
    `).join('');
}
// Отображение списка товаров в админ-панели
function displayAdminProducts() {
    const container = document.getElementById('productsList');
    if (!container) return;

    const products = getAllProducts();
    if (products.length === 0) {
        container.innerHTML = '<div class="empty-list">Товаров пока нет</div>';
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="admin-item" data-id="${product.id}">
            <div class="admin-item-header">
                <span class="admin-item-id">${escapeHtml(product.name)}</span>
                <span class="admin-item-price">${product.price.toLocaleString()} ₽</span>
            </div>
            <div class="admin-item-details">
                <div>Категория: ${product.category}</div>
                <div>${product.description || ''}</div>
            </div>
            <div class="admin-item-actions">
                <button class="admin-edit-btn" data-id="${product.id}">Редактировать</button>
                <button class="admin-delete-btn" data-id="${product.id}">Удалить</button>
            </div>
        </div>
    `).join('');
    // Обработчики для кнопок редактирования и удаления
    document.querySelectorAll('.admin-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editProduct(parseInt(btn.dataset.id)));
    });
    document.querySelectorAll('.admin-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteProduct(parseInt(btn.dataset.id)));
    });
}
// Отображение списка сообщений в админ-панели
function displayAdminMessages() {
    const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
    const allMessages = [...contacts, ...feedbacks].sort((a, b) => new Date(b.date) - new Date(a.date));
    const container = document.getElementById('messagesList');
    if (!container) return;

    if (allMessages.length === 0) {
        container.innerHTML = '<div class="empty-list">Сообщений пока нет</div>';
        return;
    }

    container.innerHTML = allMessages.map(msg => `
        <div class="admin-item">
            <div class="admin-item-header">
                <span class="admin-item-id">${escapeHtml(msg.name)}</span>
                <span class="admin-item-date">${new Date(msg.date).toLocaleString()}</span>
            </div>
            <div class="admin-item-details">
                <div>${msg.email ? `Email: ${escapeHtml(msg.email)}` : `Телефон: ${escapeHtml(msg.phone)}`}</div>
                <div>Сообщение: ${escapeHtml(msg.message)}</div>
            </div>
        </div>
    `).join('');
}
// Инициализация вкладок в админ-панели
function initAdminTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    const contents = document.querySelectorAll('.admin-tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`${tabId}Tab`)?.classList.add('active');
        });
    });
}
// Инициализация модального окна добавления товара
function initAddProductModal() {
    const addBtn = document.getElementById('addProductBtn');
    const modal = document.getElementById('productModal');
    const closeBtn = modal?.querySelector('.admin-modal-close');
    const form = document.getElementById('productForm');

    if (!modal || !form) return;

    addBtn?.addEventListener('click', () => {
        document.getElementById('modalTitle').textContent = 'Добавить товар';
        document.getElementById('productId').value = '';
        form.reset();
        modal.style.display = 'flex';
    });

    closeBtn?.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('В демо-версии добавление товаров отключено', 'info');
        modal.style.display = 'none';
    });
}
// Редактирование товара (демо-версия)
function editProduct(id) {
    showNotification('В демо-версии редактирование отключено', 'info');
}
// Удаление товара (демо-версия)
function deleteProduct(id) {
    showNotification('В демо-версии удаление отключено', 'info');
}


// АККОРДЕОН
function initAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const toggle = item.querySelector('.faq-toggle');
        const toggleItem = () => item.classList.toggle('active');
        question?.addEventListener('click', toggleItem);
        toggle?.addEventListener('click', (e) => { e.stopPropagation(); toggleItem(); });
    });
}


// СТРАНИЦА ПРОФИЛЯ
function initProfilePage() {
    const notLoggedDiv = document.getElementById('profileNotLogged');
    const loggedDiv = document.getElementById('profileLogged');

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser) {
        // Пользователь не авторизован
        if (notLoggedDiv) notLoggedDiv.style.display = 'flex';
        if (loggedDiv) loggedDiv.style.display = 'none';

        const goToLoginBtn = document.getElementById('goToLoginBtn');
        if (goToLoginBtn) {
            goToLoginBtn.addEventListener('click', () => {
                showAuthModal();
            });
        }
    } else {
        // Пользователь авторизован
        if (notLoggedDiv) notLoggedDiv.style.display = 'none';
        if (loggedDiv) loggedDiv.style.display = 'block';
        // Заполняем данные профиля
        document.getElementById('profileName').textContent = currentUser.name || 'Пользователь';
        document.getElementById('profilePhone').textContent = currentUser.phone || '+7 (XXX) XXX-XX-XX';
        document.getElementById('profileEmail').textContent = currentUser.email || 'email@example.com';
        // Заполняем форму настроек
        document.getElementById('settingsName').value = currentUser.name || '';
        document.getElementById('settingsPhone').value = currentUser.phone || '';
        document.getElementById('settingsEmail').value = currentUser.email || '';

        displayProfileCart();    // Отображаем корзину
        displayProfileOrders();  // Отображаем заказы
        initProfileTabs();       // Инициализируем вкладки
        initDeliveryForm();      // Форма расчета доставки
        initProfileSettings();   // Форма сохранения настроек

        const logoutBtn = document.getElementById('logoutBtnHeader');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('currentUser');
                location.reload();
            });
        }
    }
}
// Отображение корзины на странице профиля
function displayProfileCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    if (!cartItemsContainer) return;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart"><p>Корзина пуста</p><a href="catalog.html" class="btn-catalog">Перейти в каталог</a></div>';
        updateProfileCartSummary();
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-image">
                <img src="${item.image || 'assets/media/img/default.jpg'}" alt="${item.name}" onerror="this.src='assets/media/img/default.jpg'">
            </div>
            <div class="cart-item-info">
                <div class="cart-item-name">${escapeHtml(item.name)}</div>
                <div class="cart-item-price">${item.price.toLocaleString()} ₽</div>
                <div class="cart-item-actions">
                    <button class="quantity-btn" data-action="decr" data-id="${item.id}">−</button>
                    <span class="item-quantity">${item.quantity || 1}</span>
                    <button class="quantity-btn" data-action="incr" data-id="${item.id}">+</button>
                    <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        </div>
    `).join('');

    attachProfileCartEvents();
    updateProfileCartSummary();
}
// Привязка событий к кнопкам корзины в профиле
function attachProfileCartEvents() {
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const itemIndex = cart.findIndex(i => i.id === id);

            if (itemIndex !== -1) {
                if (btn.dataset.action === 'incr') {
                    cart[itemIndex].quantity = (cart[itemIndex].quantity || 1) + 1;
                } else if (cart[itemIndex].quantity > 1) {
                    cart[itemIndex].quantity--;
                } else {
                    cart.splice(itemIndex, 1);
                }
                localStorage.setItem('cart', JSON.stringify(cart));
                displayProfileCart();
                updateCartCount();
            }
        });
    });

    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            cart = cart.filter(i => i.id !== id);
            localStorage.setItem('cart', JSON.stringify(cart));
            displayProfileCart();
            updateCartCount();
            showNotification('Товар удален из корзины', 'info');
        });
    });
}
// Обновление итогов корзины на странице профиля
function updateProfileCartSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

    const deliveryZone = document.getElementById('cartDeliveryZone')?.value || 'center';
    let deliveryPrice = DELIVERY_PRICES[deliveryZone] || 200;

    if (subtotal >= FREE_DELIVERY_THRESHOLD) {
        deliveryPrice = 0;
        const freeNote = document.getElementById('freeDeliveryNote');
        const needMoreNote = document.getElementById('needMoreNote');
        if (freeNote) freeNote.style.display = 'block';
        if (needMoreNote) needMoreNote.style.display = 'none';
    } else {
        const freeNote = document.getElementById('freeDeliveryNote');
        const needMoreNote = document.getElementById('needMoreNote');
        if (freeNote) freeNote.style.display = 'none';
        if (needMoreNote) {
            needMoreNote.style.display = 'block';
            const needMore = FREE_DELIVERY_THRESHOLD - subtotal;
            document.getElementById('needMoreAmount').textContent = needMore.toLocaleString();
        }
    }

    const total = subtotal + deliveryPrice;

    document.getElementById('cartTotalItems').textContent = totalItems;
    document.getElementById('cartTotalPrice').textContent = `${subtotal.toLocaleString()} ₽`;
    document.getElementById('deliveryCostDisplay').textContent = `${deliveryPrice.toLocaleString()} ₽`;
    document.getElementById('cartTotalWithDelivery').textContent = `${total.toLocaleString()} ₽`;

    const deliverySelect = document.getElementById('cartDeliveryZone');
    if (deliverySelect && !deliverySelect.hasListener) {
        deliverySelect.hasListener = true;
        deliverySelect.addEventListener('change', updateProfileCartSummary);
    }
}
// Отображение истории заказов пользователя
function displayProfileOrders() {
    const ordersContainer = document.getElementById('ordersList');
    if (!ordersContainer) return;

    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    const userOrders = currentUser ? orders.filter(o => o.userId === currentUser.id) : [];

    if (userOrders.length === 0) {
        ordersContainer.innerHTML = '<div class="empty-orders"><div class="empty-image"></div><p>У вас пока нет заказов</p><a href="catalog.html" class="btn-catalog">Перейти в каталог</a></div>';
        return;
    }

    ordersContainer.innerHTML = userOrders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <span class="order-number">Заказ #${order.id}</span>
                <span class="order-date">${new Date(order.date).toLocaleDateString('ru-RU')}</span>
            </div>
            <div class="order-items">${order.items.map(i => `${escapeHtml(i.name)} x${i.quantity}`).join(', ')}</div>
            <div class="order-address"><i class="fas fa-map-marker-alt"></i> Адрес: ${escapeHtml(order.delivery.address)}</div>
            <div class="order-total">${order.total.toLocaleString()} ₽</div>
            <div class="order-status">Статус: ${order.status || 'новый'}</div>
        </div>
    `).join('');
}
// Инициализация вкладок в профиле пользователя
function initProfileTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`${tabId}Tab`).classList.add('active');
        });
    });
}
// Инициализация формы расчета доставки в профиле
function initDeliveryForm() {
    const form = document.getElementById('deliveryForm');
    const resultDiv = document.getElementById('calcResult');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const zone = document.getElementById('deliveryZone').value;
        const amount = parseFloat(document.getElementById('orderAmount').value);

        if (!zone) {
            showNotification('Выберите район доставки', 'error');
            return;
        }

        const zoneNames = {
            center: 'Центр', west: 'Западный', east: 'Восточный',
            north: 'Северный', south: 'Южный', urban: 'Городок нефтяников', dzhalil: 'пгт Джалиль'
        };

        let price = DELIVERY_PRICES[zone];
        let isFree = amount && amount >= FREE_DELIVERY_THRESHOLD;
        if (isFree) price = 0;

        if (resultDiv) {
            resultDiv.style.display = 'block';
            if (isFree) {
                resultDiv.innerHTML = `<div>Бесплатная доставка!</div><div class="price free">0 ₽</div><div class="note">Район: ${zoneNames[zone]}</div><button onclick="closeResult()" style="margin-top:12px; background:none; border:none; cursor:pointer;">✕ Закрыть</button>`;
            } else {
                resultDiv.innerHTML = `<div>Доставка</div><div class="price">${price} ₽</div><div class="note">Район: ${zoneNames[zone]}</div><button onclick="closeResult()" style="margin-top:12px; background:none; border:none; cursor:pointer;">✕ Закрыть</button>`;
            }
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
}
// Инициализация формы сохранения настроек профиля
function initProfileSettings() {
    const form = document.getElementById('profileSettingsForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (currentUser) {
            currentUser.name = document.getElementById('settingsName').value;
            currentUser.phone = document.getElementById('settingsPhone').value;
            currentUser.email = document.getElementById('settingsEmail').value;

            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            // Обновляем отображение в шапке профиля
            document.getElementById('profileName').textContent = currentUser.name;
            document.getElementById('profilePhone').textContent = currentUser.phone;
            document.getElementById('profileEmail').textContent = currentUser.email;

            showNotification('Данные сохранены', 'success');
        }
    });
}
// Отображение модального окна авторизации/регистрации
function showAuthModal() {
    let modal = document.getElementById('authModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'authModal';
        modal.className = 'modal auth-modal';
        modal.innerHTML = `
            <div class="modal-content auth-modal-content">
                <div class="modal-header">
                    <h3>Вход в аккаунт</h3>
                    <button class="modal-close auth-modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="auth-tabs">
                        <button class="auth-tab active" data-auth-tab="login">Вход</button>
                        <button class="auth-tab" data-auth-tab="register">Регистрация</button>
                    </div>
                    
                    <form id="loginForm" class="auth-form active">
                        <div class="form-group"><input type="tel" id="loginPhone" placeholder="Телефон" required></div>
                        <div class="form-group"><input type="password" id="loginPassword" placeholder="Пароль" required></div>
                        <button type="submit" class="btn-primary w-100 auth-submit-btn">Войти</button>
                    </form>
                    
                    <form id="registerForm" class="auth-form">
                        <div class="form-group"><input type="text" id="regName" placeholder="Ваше имя" required></div>
                        <div class="form-group"><input type="tel" id="regPhone" placeholder="Телефон" required></div>
                        <div class="form-group"><input type="email" id="regEmail" placeholder="Email (необязательно)"></div>
                        <div class="form-group"><input type="password" id="regPassword" placeholder="Пароль" required></div>
                        <button type="submit" class="btn-primary w-100 auth-submit-btn">Зарегистрироваться</button>
                    </form>
                    <p class="modal-hint auth-hint">После входа вам станут доступны корзина, избранное и история заказов</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        // Закрытие модалки
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
        // Переключение между вкладками "Вход" и "Регистрация"
        const authTabs = modal.querySelectorAll('.auth-tab');
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                authTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const tabId = tab.dataset.authTab;
                document.getElementById(`${tabId}Form`).classList.add('active');
                document.getElementById(tabId === 'login' ? 'registerForm' : 'loginForm').classList.remove('active');
            });
        });
        // Обработка входа
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const phone = document.getElementById('loginPhone').value.trim();
            const password = document.getElementById('loginPassword').value;

            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.phone === phone && u.password === password);

            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                showNotification(`Добро пожаловать, ${user.name}!`, 'success');
                modal.classList.remove('active');
                location.reload();
            } else {
                showNotification('Неверный телефон или пароль', 'error');
            }
        });
        // Обработка регистрации
        const registerForm = document.getElementById('registerForm');
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('regName').value.trim();
            const phone = document.getElementById('regPhone').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value;

            if (!name || !phone || !password) {
                showNotification('Заполните обязательные поля', 'error');
                return;
            }

            const users = JSON.parse(localStorage.getItem('users')) || [];

            if (users.find(u => u.phone === phone)) {
                showNotification('Пользователь с таким телефоном уже существует', 'error');
                return;
            }

            const newUser = {
                id: Date.now(),
                name,
                phone,
                email,
                password
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(newUser));

            showNotification(`Регистрация прошла успешно! Добро пожаловать, ${name}!`, 'success');
            modal.classList.remove('active');
            location.reload();
        });
    }

    modal.classList.add('active');
}