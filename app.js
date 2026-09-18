// G Mart - JavaScript Logic & Admin Engine

// 🔑 ADMIN PASSWORD CONSTANT
const ADMIN_PASSWORD_KEY = "ceogmartzicksiikandreach@2026";

// INITIAL DATA
const DEFAULT_ACCOUNTS = [
    {
        id: 'acc-1',
        game: 'Free Fire',
        title: 'FREE FIRE ACCOUNT #001',
        game_id: 'FF-88492',
        level: '75',
        skins: '120+',
        characters: '35',
        rank: 'Heroic',
        price: 25.00,
        images: [
            'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'
        ],
        description: 'Account ល្អខ្លាំង រូបរាងស្អាត មាន Skin កម្រច្រើន ធានាសុវត្ថិភាព 100%។',
        status: 'AVAILABLE'
    },
    {
        id: 'acc-2',
        game: 'Mobile Legends',
        title: 'MOBILE LEGENDS VIP #002',
        game_id: 'ML-99210',
        level: '80',
        skins: '250+',
        characters: '110',
        rank: 'Glory Mythic',
        price: 45.00,
        images: [
            'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'
        ],
        description: 'Full Emblem, Skin Collector & Epic ច្រើន គណនីស្អាត។',
        status: 'AVAILABLE'
    }
];

const DEFAULT_CATEGORIES = [
    { name: 'Free Fire', icon: '🔥', image: '' },
    { name: 'Mobile Legends', icon: '⚔️', image: '' },
    { name: 'PUBG Mobile', icon: '🪂', image: '' },
    { name: 'Valorant', icon: '🎯', image: '' }
];

const DEFAULT_SETTINGS = {
    siteName: 'G MART',
    siteLogo: '',
    heroBanner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    telegram: 'https://t.me/gmart_admin',
    messenger: 'https://m.me/gmart_official',
    khqrImage: 'https://via.placeholder.com/300x400?text=Scan+KHQR+To+Pay'
};

// STATE MANAGEMENT
let accounts = JSON.parse(localStorage.getItem('gmart_accounts')) || DEFAULT_ACCOUNTS;
let categories = JSON.parse(localStorage.getItem('gmart_categories')) || DEFAULT_CATEGORIES;
let settings = JSON.parse(localStorage.getItem('gmart_settings')) || DEFAULT_SETTINGS;
let orders = JSON.parse(localStorage.getItem('gmart_orders')) || [];
let currentBuyAccount = null;

// BROADCAST CHANNEL FOR REAL-TIME UPDATE ACROSS TABS
const updateChannel = new BroadcastChannel('gmart_realtime_updates');
updateChannel.onmessage = (event) => {
    if (event.data === 'sync_data') {
        loadDataFromStorage();
        applyAllUpdates();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    applyAllUpdates();
});

function loadDataFromStorage() {
    accounts = JSON.parse(localStorage.getItem('gmart_accounts')) || DEFAULT_ACCOUNTS;
    categories = JSON.parse(localStorage.getItem('gmart_categories')) || DEFAULT_CATEGORIES;
    settings = JSON.parse(localStorage.getItem('gmart_settings')) || DEFAULT_SETTINGS;
    orders = JSON.parse(localStorage.getItem('gmart_orders')) || [];
}

function saveDataAndSync() {
    localStorage.setItem('gmart_accounts', JSON.stringify(accounts));
    localStorage.setItem('gmart_categories', JSON.stringify(categories));
    localStorage.setItem('gmart_settings', JSON.stringify(settings));
    localStorage.setItem('gmart_orders', JSON.stringify(orders));
    updateChannel.postMessage('sync_data');
    applyAllUpdates();
}

function applyAllUpdates() {
    renderSiteSettings();
    renderCategories();
    renderAccountsGrid(accounts);
    renderGameFilterOptions();
    if (sessionStorage.getItem('gmart_admin_logged_in') === 'true') {
        renderAdminTables();
    }
}

// ---------------- UI & NAVIGATION ----------------
function showSection(sectionId) {
    if (sectionId === 'admin' && sessionStorage.getItem('gmart_admin_logged_in') !== 'true') {
        openAdminLoginModal();
        return;
    }
    const sections = ['home', 'games', 'accounts', 'account-detail', 'my-orders', 'admin'];
    sections.forEach(id => {
        const el = document.getElementById(`section-${id}`);
        if (el) el.classList.add('hidden');
    });
    const target = document.getElementById(`section-${sectionId}`);
    if (target) target.classList.remove('hidden');
}

function renderSiteSettings() {
    // Site Name & Logo
    const nameEl = document.getElementById('site-name-text');
    if (nameEl) nameEl.textContent = settings.siteName || 'G MART';

    const logoContainer = document.getElementById('site-logo-container');
    if (logoContainer) {
        if (settings.siteLogo) {
            logoContainer.innerHTML = `<img src="${settings.siteLogo}" class="w-full h-full object-cover">`;
        } else {
            logoContainer.innerHTML = `<span id="site-logo-text">${(settings.siteName || 'G').charAt(0)}</span>`;
        }
    }

    // Hero Banner
    const banner = document.getElementById('home-hero-banner');
    if (banner && settings.heroBanner) banner.src = settings.heroBanner;

    // Contact Links
    const tg = document.getElementById('footer-telegram');
    const ms = document.getElementById('footer-messenger');
    if (tg) tg.href = settings.telegram || '#';
    if (ms) ms.href = settings.messenger || '#';

    // Settings Input Fields (Admin)
    if (document.getElementById('setting-site-name')) {
        document.getElementById('setting-site-name').value = settings.siteName || '';
        document.getElementById('setting-site-logo').value = settings.siteLogo || '';
        document.getElementById('setting-hero-banner').value = settings.heroBanner || '';
        document.getElementById('setting-telegram').value = settings.telegram || '';
        document.getElementById('setting-messenger').value = settings.messenger || '';
        document.getElementById('setting-khqr').value = settings.khqrImage || '';
    }
}

// ---------------- CATEGORIES ----------------
function renderCategories() {
    const homeContainer = document.getElementById('home-categories-grid');
    const fullContainer = document.getElementById('full-games-grid');

    const html = categories.map(cat => {
        const count = accounts.filter(a => a.game === cat.name && a.status === 'AVAILABLE').length;
        const bgImg = cat.image ? `background-image: linear-gradient(to top, rgba(0,0,0,0.8), transparent), url('${cat.image}'); background-size: cover;` : '';
        return `
            <div onclick="filterByGameCategory('${cat.name}')" style="${bgImg}" class="cursor-pointer glass-card p-5 rounded-2xl hover:scale-105 transition-all border border-gray-800 flex flex-col justify-between min-h-[110px]">
                <div class="text-3xl">${cat.icon || '🎮'}</div>
                <div>
                    <h3 class="font-gaming font-bold text-lg text-white">${cat.name}</h3>
                    <p class="text-xs text-indigo-400 mt-1 font-semibold">${count} Accounts Available</p>
                </div>
            </div>
        `;
    }).join('');

    if (homeContainer) homeContainer.innerHTML = html;
    if (fullContainer) fullContainer.innerHTML = html;
}

function renderGameFilterOptions() {
    const select = document.getElementById('filter-game');
    if (!select) return;
    const currentVal = select.value;
    select.innerHTML = `<option value="ALL">All Games</option>` + categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    select.value = currentVal;
}

function filterByGameCategory(gameName) {
    showSection('accounts');
    const filter = document.getElementById('filter-game');
    if (filter) {
        filter.value = gameName;
        applyAccountFilters();
    }
}

// ---------------- ACCOUNTS DISPLAY ----------------
function renderAccountsGrid(items) {
    const container = document.getElementById('accounts-grid');
    const featured = document.getElementById('home-featured-grid');
    if (!container) return;

    const availableItems = items.filter(a => a.status === 'AVAILABLE');

    const cardsHtml = availableItems.map(acc => {
        const img = (acc.images && acc.images.length > 0) ? acc.images[0] : 'https://via.placeholder.com/400x250';
        return `
            <div class="glass-card rounded-2xl overflow-hidden border border-gray-800 p-4 space-y-3 flex flex-col justify-between hover:border-indigo-500/50 transition">
                <div class="space-y-3">
                    <div class="relative">
                        <img src="${img}" class="w-full h-44 object-cover rounded-xl">
                        ${acc.images.length > 1 ? `<span class="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-md"><i class="fa-solid fa-images"></i> ${acc.images.length}</span>` : ''}
                    </div>
                    <h3 class="font-gaming font-bold text-base text-white line-clamp-1">${acc.title}</h3>
                    <div class="text-xs text-gray-400 space-y-1">
                        <div>🎮 ID: <span class="text-gray-200">${acc.game_id}</span></div>
                        <div>🏆 Rank: <span class="text-indigo-400">${acc.rank || 'N/A'}</span></div>
                    </div>
                </div>
                <div class="pt-2 border-t border-gray-800 flex justify-between items-center">
                    <span class="text-lg font-bold text-emerald-400">$${parseFloat(acc.price).toFixed(2)}</span>
                    <button onclick="viewAccountDetail('${acc.id}')" class="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white text-xs font-semibold transition">មើលលម្អិត</button>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = cardsHtml || `<p class="text-gray-500 text-sm">ពុំទាន់មាន Account ក្នុងផ្នែកនេះនៅឡើយទេ។</p>`;
    if (featured) featured.innerHTML = cardsHtml;
}

function applyAccountFilters() {
    const search = document.getElementById('filter-search').value.toLowerCase();
    const game = document.getElementById('filter-game').value;
    const sort = document.getElementById('filter-sort').value;

    let filtered = accounts.filter(a => {
        const matchSearch = a.title.toLowerCase().includes(search) || a.game_id.toLowerCase().includes(search);
        const matchGame = game === 'ALL' || a.game === game;
        return matchSearch && matchGame;
    });

    if (sort === 'price-low') filtered.sort((a, b) => a.price - b.price);
    if (sort === 'price-high') filtered.sort((a, b) => b.price - a.price);

    renderAccountsGrid(filtered);
}

function viewAccountDetail(id) {
    const acc = accounts.find(a => a.id === id);
    if (!acc) return;
    currentBuyAccount = acc;

    const detailContainer = document.getElementById('account-detail-content');
    const imagesHtml = acc.images.map(img => `<img src="${img}" class="w-full h-64 object-cover rounded-xl border border-gray-800">`).join('');

    detailContainer.innerHTML = `
        <div class="lg:col-span-7 space-y-4">
            <div class="grid grid-cols-1 gap-4">${imagesHtml}</div>
        </div>
        <div class="lg:col-span-5 space-y-6 glass-card p-6 rounded-2xl border border-gray-800 h-fit">
            <h2 class="text-2xl font-bold font-gaming text-white">${acc.title}</h2>
            <div class="text-3xl font-bold text-emerald-400">$${parseFloat(acc.price).toFixed(2)}</div>
            <div class="space-y-2 text-sm text-gray-300">
                <p>🎮 ហ្គេម: <span class="text-indigo-400 font-semibold">${acc.game}</span></p>
                <p>🆔 Game ID: <span class="text-white">${acc.game_id}</span></p>
                <p>⭐ Level: <span class="text-white">${acc.level || 'N/A'}</span></p>
                <p>🏆 Rank: <span class="text-white">${acc.rank || 'N/A'}</span></p>
                <p>👕 Skins: <span class="text-white">${acc.skins || 'N/A'}</span></p>
            </div>
            <p class="text-xs text-gray-400 border-t border-gray-800 pt-3">${acc.description || 'គ្មានព័ត៌មានបន្ថែម'}</p>
            <button onclick="openBuyModal()" class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-600/30">🛒 ទិញឥឡូវនេះ (Buy Now)</button>
        </div>
    `;

    showSection('account-detail');
}

// ---------------- BUY & ORDERS ----------------
function openBuyModal() {
    if (!currentBuyAccount) return;
    document.getElementById('buy-account-title').textContent = currentBuyAccount.title;
    document.getElementById('buy-account-price').textContent = `$${parseFloat(currentBuyAccount.price).toFixed(2)}`;
    document.getElementById('buy-khqr-img').src = settings.khqrImage || 'https://via.placeholder.com/250x300?text=KHQR+Payment';
    document.getElementById('modal-buy').classList.remove('hidden');
}

function closeBuyModal() {
    document.getElementById('modal-buy').classList.add('hidden');
}

function confirmPurchase() {
    if (!currentBuyAccount) return;

    const newOrder = {
        id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        accountId: currentBuyAccount.id,
        accountTitle: currentBuyAccount.title,
        price: currentBuyAccount.price,
        date: new Date().toLocaleDateString('km-KH'),
        status: 'PENDING'
    };

    orders.push(newOrder);

    // Update account status
    const accIndex = accounts.findIndex(a => a.id === currentBuyAccount.id);
    if (accIndex !== -1) {
        accounts[accIndex].status = 'PENDING';
    }

    saveDataAndSync();
    closeBuyModal();
    alert('✅ ការផ្ញើការទិញបានជោគជ័យ! សូមរង់ចាំ Admin ពិនិត្យទូទាត់។');
    renderMyOrders();
    showSection('my-orders');
}

function renderMyOrders() {
    const container = document.getElementById('my-orders-list');
    if (!container) return;
    const badge = document.getElementById('order-badge');
    if (badge) {
        badge.textContent = orders.length;
        badge.classList.toggle('hidden', orders.length === 0);
    }

    if (orders.length === 0) {
        container.innerHTML = `<p class="text-gray-500 text-sm">អ្នកមិនទាន់មានការទិញនៅឡើយទេ។</p>`;
        return;
    }

    container.innerHTML = orders.map(ord => `
        <div class="glass-card p-4 rounded-xl border border-gray-800 flex justify-between items-center">
            <div>
                <span class="text-xs text-indigo-400 font-bold">${ord.id}</span>
                <h4 class="text-white font-bold text-sm">${ord.accountTitle}</h4>
                <p class="text-xs text-gray-400">កាលបរិច្ឆេទ: ${ord.date}</p>
            </div>
            <div class="text-right">
                <div class="text-emerald-400 font-bold text-sm">$${parseFloat(ord.price).toFixed(2)}</div>
                <span class="text-[10px] px-2 py-0.5 rounded ${ord.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}">${ord.status}</span>
            </div>
        </div>
    `).join('');
}

// ---------------- ADMIN SYSTEM ----------------
function openAdminLoginModal() {
    document.getElementById('modal-admin-login').classList.remove('hidden');
}

function closeAdminLoginModal() {
    document.getElementById('modal-admin-login').classList.add('hidden');
    document.getElementById('admin-error-msg').classList.add('hidden');
}

function handleAdminLogin(e) {
    e.preventDefault();
    const pass = document.getElementById('admin-pass-input').value;
    if (pass === ADMIN_PASSWORD_KEY) {
        sessionStorage.setItem('gmart_admin_logged_in', 'true');
        closeAdminLoginModal();
        showSection('admin');
        renderAdminTables();
    } else {
        document.getElementById('admin-error-msg').classList.remove('hidden');
    }
}

function adminLogout() {
    sessionStorage.removeItem('gmart_admin_logged_in');
    showSection('home');
}

function switchAdminTab(tabName) {
    document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active', 'border-b-2', 'border-indigo-500', 'text-indigo-400'));
    document.querySelectorAll('.admin-panel-content').forEach(panel => panel.classList.add('hidden'));

    document.getElementById(`tab-btn-${tabName}`).classList.add('active', 'border-b-2', 'border-indigo-500', 'text-indigo-400');
    document.getElementById(`admin-panel-${tabName}`).classList.remove('hidden');
}

function renderAdminTables() {
    // Stats
    const totalSales = orders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + parseFloat(o.price), 0);
    const pendingCount = orders.filter(o => o.status === 'PENDING').length;
    document.getElementById('admin-stat-sales').textContent = `$${totalSales.toFixed(2)}`;
    document.getElementById('admin-stat-accounts').textContent = accounts.length;
    document.getElementById('admin-stat-pending').textContent = pendingCount;
    document.getElementById('admin-stat-users').textContent = orders.length;

    // Accounts Table
    const accTbody = document.getElementById('admin-accounts-table');
    if (accTbody) {
        accTbody.innerHTML = accounts.map(acc => {
            const img = acc.images && acc.images.length > 0 ? acc.images[0] : '';
            return `
                <tr>
                    <td class="p-4"><img src="${img}" class="w-12 h-12 object-cover rounded-lg"></td>
                    <td class="p-4 font-bold text-white">${acc.title}</td>
                    <td class="p-4">${acc.game_id}</td>
                    <td class="p-4 text-emerald-400 font-bold">$${parseFloat(acc.price).toFixed(2)}</td>
                    <td class="p-4"><span class="px-2 py-1 rounded text-xs ${acc.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}">${acc.status}</span></td>
                    <td class="p-4 text-right space-x-2">
                        <button onclick="editAccount('${acc.id}')" class="px-2 py-1 bg-indigo-600/30 text-indigo-400 rounded hover:bg-indigo-600 hover:text-white">✏️ កែប្រែ</button>
                        <button onclick="deleteAccount('${acc.id}')" class="px-2 py-1 bg-red-600/30 text-red-400 rounded hover:bg-red-600 hover:text-white">🗑️ លុប</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Orders Table
    const ordTbody = document.getElementById('admin-orders-table');
    if (ordTbody) {
        ordTbody.innerHTML = orders.map(ord => `
            <tr>
                <td class="p-4 text-indigo-400 font-bold">${ord.id}</td>
                <td class="p-4 text-white">${ord.accountTitle}</td>
                <td class="p-4">${ord.date}</td>
                <td class="p-4 text-emerald-400 font-bold">$${parseFloat(ord.price).toFixed(2)}</td>
                <td class="p-4"><span class="px-2 py-1 rounded text-xs ${ord.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}">${ord.status}</span></td>
                <td class="p-4 text-right space-x-2">
                    ${ord.status === 'PENDING' ? `<button onclick="approveOrder('${ord.id}')" class="px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-500">✅ ទទួលស្គាល់</button>` : '<span class="text-xs text-gray-500">រួចរាល់</span>'}
                </td>
            </tr>
        `).join('');
    }

    // Categories Table
    const catTbody = document.getElementById('admin-categories-table');
    if (catTbody) {
        catTbody.innerHTML = categories.map((cat, idx) => `
            <tr>
                <td class="p-4 text-xl">${cat.icon || '🎮'}</td>
                <td class="p-4 font-bold text-white">${cat.name}</td>
                <td class="p-4">${cat.image ? `<img src="${cat.image}" class="w-10 h-10 object-cover rounded">` : 'គ្មាន'}</td>
                <td class="p-4 text-right space-x-2">
                    <button onclick="editCategory(${idx})" class="px-2 py-1 bg-indigo-600/30 text-indigo-400 rounded hover:bg-indigo-600 hover:text-white">✏️ កែប្រែ</button>
                    <button onclick="deleteCategory(${idx})" class="px-2 py-1 bg-red-600/30 text-red-400 rounded hover:bg-red-600 hover:text-white">🗑️ លុប</button>
                </td>
            </tr>
        `).join('');
    }
}

// ---------------- ADMIN ACTIONS ----------------
function openAddAccountModal() {
    document.getElementById('acc-edit-id').value = '';
    document.getElementById('acc-title').value = '';
    document.getElementById('acc-game-id').value = '';
    document.getElementById('acc-price').value = '';
    document.getElementById('acc-level').value = '';
    document.getElementById('acc-rank').value = '';
    document.getElementById('acc-images').value = '';
    document.getElementById('acc-desc').value = '';

    const select = document.getElementById('acc-game');
    select.innerHTML = categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');

    document.getElementById('modal-account-title').textContent = '➕ បន្ថែម Account ថ្មី';
    document.getElementById('modal-account').classList.remove('hidden');
}

function closeAccountModal() {
    document.getElementById('modal-account').classList.add('hidden');
}

function handleSaveAccount(e) {
    e.preventDefault();
    const editId = document.getElementById('acc-edit-id').value;
    const imgsRaw = document.getElementById('acc-images').value;
    const imageArray = imgsRaw.split(',').map(s => s.trim()).filter(s => s.length > 0);

    const newAcc = {
        id: editId || 'acc-' + Date.now(),
        title: document.getElementById('acc-title').value,
        game: document.getElementById('acc-game').value,
        game_id: document.getElementById('acc-game-id').value,
        price: parseFloat(document.getElementById('acc-price').value),
        level: document.getElementById('acc-level').value,
        rank: document.getElementById('acc-rank').value,
        images: imageArray,
        description: document.getElementById('acc-desc').value,
        status: 'AVAILABLE'
    };

    if (editId) {
        const idx = accounts.findIndex(a => a.id === editId);
        if (idx !== -1) accounts[idx] = newAcc;
    } else {
        accounts.unshift(newAcc);
    }

    saveDataAndSync();
    closeAccountModal();
}

function editAccount(id) {
    const acc = accounts.find(a => a.id === id);
    if (!acc) return;
    openAddAccountModal();

    document.getElementById('acc-edit-id').value = acc.id;
    document.getElementById('acc-title').value = acc.title;
    document.getElementById('acc-game').value = acc.game;
    document.getElementById('acc-game-id').value = acc.game_id;
    document.getElementById('acc-price').value = acc.price;
    document.getElementById('acc-level').value = acc.level || '';
    document.getElementById('acc-rank').value = acc.rank || '';
    document.getElementById('acc-images').value = (acc.images || []).join(', ');
    document.getElementById('acc-desc').value = acc.description || '';
    document.getElementById('modal-account-title').textContent = '✏️ កែប្រែព័ត៌មាន Account';
}

function deleteAccount(id) {
    if (confirm('តើអ្នកប្រាកដថាចង់លុប Account នេះមែនទេ?')) {
        accounts = accounts.filter(a => a.id !== id);
        saveDataAndSync();
    }
}

function approveOrder(ordId) {
    const ordIdx = orders.findIndex(o => o.id === ordId);
    if (ordIdx !== -1) {
        orders[ordIdx].status = 'COMPLETED';
        const accIdx = accounts.findIndex(a => a.id === orders[ordIdx].accountId);
        if (accIdx !== -1) accounts[accIdx].status = 'SOLD';
        saveDataAndSync();
    }
}

function handleSaveCategory(e) {
    e.preventDefault();
    const idx = parseInt(document.getElementById('cat-edit-index').value);
    const newCat = {
        name: document.getElementById('cat-name').value,
        icon: document.getElementById('cat-icon').value,
        image: document.getElementById('cat-image').value
    };

    if (idx >= 0) {
        categories[idx] = newCat;
    } else {
        categories.push(newCat);
    }

    document.getElementById('cat-edit-index').value = "-1";
    document.getElementById('cat-name').value = "";
    document.getElementById('cat-icon').value = "";
    document.getElementById('cat-image').value = "";

    saveDataAndSync();
}

function editCategory(idx) {
    const cat = categories[idx];
    if (!cat) return;
    document.getElementById('cat-edit-index').value = idx;
    document.getElementById('cat-name').value = cat.name;
    document.getElementById('cat-icon').value = cat.icon;
    document.getElementById('cat-image').value = cat.image || '';
}

function deleteCategory(idx) {
    if (confirm('តើអ្នកប្រាកដថាចង់លុប Category នេះមែនទេ?')) {
        categories.splice(idx, 1);
        saveDataAndSync();
    }
}

function handleSaveSettings(e) {
    e.preventDefault();
    settings = {
        siteName: document.getElementById('setting-site-name').value,
        siteLogo: document.getElementById('setting-site-logo').value,
        heroBanner: document.getElementById('setting-hero-banner').value,
        telegram: document.getElementById('setting-telegram').value,
        messenger: document.getElementById('setting-messenger').value,
        khqrImage: document.getElementById('setting-khqr').value
    };
    saveDataAndSync();
    alert('✅ បានរក្សាទុក និងធ្វើបច្ចុប្បន្នភាពទិន្នន័យ Website រួចរាល់!');
}
