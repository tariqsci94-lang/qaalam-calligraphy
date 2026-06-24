/**
 * Qaalam Calligraphy — Firebase Firestore Data Store
 * ─────────────────────────────────────────────────────────────
 * All products, orders, and settings are stored in Cloud Firestore.
 * Cart is kept in localStorage (no need to cloud-sync the cart).
 *
 * Firestore collections:
 *   /products/{id}      — product catalogue
 *   /orders/{id}        — customer orders (real-time)
 *   /config/settings    — store settings + admin password
 *
 * Public API is intentionally synchronous for reads (served from
 * in-memory cache) and async for writes. Real-time onSnapshot
 * listeners keep the cache fresh automatically.
 * ─────────────────────────────────────────────────────────────
 */

const Store = (() => {

  /* ── Islamic Duas ──────────────────────────────────────────── */
  const DUAS = [
    { id:'d1',  name:'Ayat ul Kursi',           arabic:'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ' },
    { id:'d2',  name:'Bismillah',                arabic:'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
    { id:'d3',  name:'Al-Fatiha (Opening)',      arabic:'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
    { id:'d4',  name:'Al-Ikhlas',                arabic:'قُلْ هُوَ اللَّهُ أَحَدٌ ۞ اللَّهُ الصَّمَدُ' },
    { id:'d5',  name:'Rabbana Atina',            arabic:'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ' },
    { id:'d6',  name:'Mashallah Tabarakallah',   arabic:'مَا شَاءَ اللَّهُ لَا قُوَّةَ إِلَّا بِاللَّهِ' },
    { id:'d7',  name:'Alhamdulillah',            arabic:'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
    { id:'d8',  name:'SubhanAllah',              arabic:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ' },
    { id:'d9',  name:'La Ilaha Illallah',        arabic:'لَا إِلَٰهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ' },
    { id:'d10', name:'Allahu Akbar',             arabic:'اللَّهُ أَكْبَرُ كَبِيرًا وَالْحَمْدُ لِلَّهِ كَثِيرًا' },
    { id:'d11', name:'Dua for Home',             arabic:'بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا' },
    { id:'d12', name:'Dua for Protection',       arabic:'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ' },
    { id:'d13', name:'Astaghfirullah',           arabic:'أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ' },
    { id:'d14', name:'Ya Rahman Ya Rahim',       arabic:'يَا رَحْمَٰنُ يَا رَحِيمُ' },
    { id:'d15', name:'Custom Text (type below)', arabic:'' },
  ];

  /* ── Categories ────────────────────────────────────────────── */
  const CATEGORIES = [
    { id:'all',           label:'All Products',  emoji:'✨' },
    { id:'wall-frames',   label:'Wall Frames',   emoji:'🖼️' },
    { id:'stickers',      label:'Dua Stickers',  emoji:'🏷️' },
    { id:'fridge-frames', label:'Fridge Frames', emoji:'📸' },
    { id:'key-chains',    label:'Key Chains',    emoji:'🔑' },
    { id:'light-lamps',   label:'Light Lamps',   emoji:'💡' },
  ];

  /* ── Default Seed Products ─────────────────────────────────── */
  const SEED = [
    {
      id:'prod_001', name:'A4 Islamic Calligraphy Wall Frame', category:'wall-frames',
      description:'Elegant A4 digital Islamic calligraphy frames for your home walls. Choose your favourite dua, frame colour, and optionally add a personal photo. Printed in glorious 300 DPI resolution.',
      price:799, comparePrice:1099, stock:100, active:true, featured:true, badge:'Bestseller',
      specs:['Size: A4 (210 × 297 mm)','Frame: Premium acrylic or wood','Print: 300 DPI UV print','Finish: Matte or Glossy','Delivery: 5–7 business days'],
      variants:{ frameColor:['Black','White','Gold','Rosewood'], finish:['Matte','Glossy'] },
      customisations:['photo_upload','dua_selection','frame_color','finish','custom_text'],
      emoji:'🖼️', image:null, createdAt:new Date().toISOString()
    },
    {
      id:'prod_002', name:'Customisable Dua Stickers', category:'stickers',
      description:'Beautiful Islamic dua stickers for laptops, journals, water bottles and phone cases. Premium waterproof vinyl. Choose your dua, pick a size, add custom text.',
      price:249, comparePrice:399, stock:200, active:true, featured:true, badge:'Popular',
      specs:['Material: Waterproof Vinyl','UV-resistant colour-fast print','Easy peel & repositionable','3 sizes available','Sold in packs'],
      variants:{ size:['Small (5 cm)','Medium (8 cm)','Large (12 cm)'], pack:['Pack of 5','Pack of 10','Pack of 20'] },
      customisations:['dua_selection','size','pack','custom_text'],
      emoji:'🏷️', image:null, createdAt:new Date().toISOString()
    },
    {
      id:'prod_003', name:'Polaroid Acrylic Fridge Frame', category:'fridge-frames',
      description:'Premium Polaroid-style acrylic fridge photo frames with magnetic backing. Upload your favourite photo with Islamic calligraphy. Available with desk stand or as magnetic fridge frame.',
      price:999, comparePrice:1399, stock:75, active:true, featured:true, badge:'Gift Favourite',
      specs:['Material: Premium Clear Acrylic 5mm','Size: Polaroid 6 × 4 inch','Magnetic fridge back (without stand)','Double-sided photo (without stand only)','Delivery: 5–7 business days'],
      variants:{ stand:['With Desk Stand','Without Stand (Magnetic Fridge)'], calligraphyOption:['With Islamic Calligraphy','Photo Only'] },
      customisations:['photo_upload','stand_option','double_side','dua_selection'],
      emoji:'📸', image:null, createdAt:new Date().toISOString()
    },
    {
      id:'prod_004', name:'Acrylic Photo Key Chain', category:'key-chains',
      description:'Personalised acrylic key chains with your photo or an Islamic dua. Perfect everyday-carry gift. Choose your shape, upload a photo, pair it with a meaningful dua.',
      price:449, comparePrice:649, stock:150, active:true, featured:false, badge:'New',
      specs:['Material: Premium Clear Acrylic 3mm','Keyring: Polished stainless steel','Shapes: Round, Square, Heart, Rectangle','Photo or Dua on both sides','Delivery: 5–7 business days'],
      variants:{ shape:['Round','Square','Heart','Rectangle'], content:['Photo Only','Islamic Dua Only','Photo + Dua'] },
      customisations:['photo_upload','shape','content','dua_selection','custom_text'],
      emoji:'🔑', image:null, createdAt:new Date().toISOString()
    },
    {
      id:'prod_005', name:'Acrylic Custom Light Lamp', category:'light-lamps',
      description:'Stunning acrylic LED light lamps laser-engraved with your custom photo and Islamic dua. USB-powered with multiple colour options. A cherished night lamp and memorable gift.',
      price:1499, comparePrice:1999, stock:40, active:true, featured:true, badge:'Premium',
      specs:['Material: Premium Acrylic','LED: RGB or Warm White','Power: USB (1m cable included)','Sizes: 10 cm, 15 cm, 20 cm','Photo + dua laser engraved'],
      variants:{ size:['Small (10 cm)','Medium (15 cm)','Large (20 cm)'], lightColor:['Warm White','RGB Colour-Changing','Cool White'] },
      customisations:['photo_upload','size','light_color','dua_selection','custom_text'],
      emoji:'💡', image:null, createdAt:new Date().toISOString()
    },
  ];

  /* ── Default Settings ──────────────────────────────────────── */
  const DEFAULT_SETTINGS = {
    storeName:      'Qaalam Calligraphy',
    currency:       '₹',
    razorpayKey:    '',
    whatsapp:       '+919876543210',
    email:          'hello@qaalamcalligraphy.com',
    shippingCost:   99,
    freeShippingAt: 999,
    adminPass:      'qaalam2024',
  };

  /* ── In-Memory Cache ───────────────────────────────────────── */
  let _db       = null;
  let _products = [];
  let _orders   = [];
  let _settings = { ...DEFAULT_SETTINGS };
  let _cart     = [];

  /* ── Ready Promise ─────────────────────────────────────────── */
  let _resolveReady, _rejectReady;
  const _ready = new Promise((res, rej) => { _resolveReady = res; _rejectReady = rej; });

  /* ── Update Callbacks (real-time) ──────────────────────────── */
  const _cbs = { products: [], orders: [] };
  function _notify(type) {
    (_cbs[type] || []).forEach(cb => { try { cb(); } catch(e) { console.error(e); } });
  }

  /* ── Cart Helpers (localStorage) ──────────────────────────── */
  function _saveCart()  { try { localStorage.setItem('qc_cart', JSON.stringify(_cart)); } catch(e) {} }
  function _loadCart()  { try { _cart = JSON.parse(localStorage.getItem('qc_cart') || '[]'); } catch(e) { _cart = []; } }

  /* ── Validate Firebase Config ──────────────────────────────── */
  function _isConfigured() {
    const cfg = window.QAALAM_FIREBASE_CONFIG;
    return cfg && cfg.projectId && !cfg.projectId.includes('PASTE_');
  }

  /* ═══════════════════════════════════════════════════════════
     INIT — async, sets up Firestore and real-time listeners
  ═══════════════════════════════════════════════════════════ */
  async function init() {

    // ── Config check ────────────────────────────────────────
    if (!window.firebase) {
      _rejectReady(new Error('Firebase SDK not loaded'));
      throw new Error('Firebase SDK not loaded. Check your internet connection.');
    }
    if (!_isConfigured()) {
      _rejectReady(new Error('Firebase not configured'));
      throw new Error('FIREBASE_NOT_CONFIGURED');
    }

    // ── Initialize Firebase App ──────────────────────────────
    if (!firebase.apps.length) {
      firebase.initializeApp(window.QAALAM_FIREBASE_CONFIG);
    }
    _db = firebase.firestore();

    // ── Enable offline persistence (works offline too!) ──────
    try {
      await _db.enablePersistence({ synchronizeTabs: true });
    } catch(e) { /* persistence may already be enabled or not supported */ }

    // ── Load Settings ────────────────────────────────────────
    try {
      const snap = await _db.doc('config/settings').get();
      if (snap.exists) {
        _settings = { ...DEFAULT_SETTINGS, ...snap.data() };
      } else {
        _settings = { ...DEFAULT_SETTINGS };
        await _db.doc('config/settings').set(_settings);
      }
    } catch(e) {
      console.warn('Settings load failed, using defaults:', e.message);
      _settings = { ...DEFAULT_SETTINGS };
    }

    // ── Load Products ────────────────────────────────────────
    try {
      const snap = await _db.collection('products').get();
      _products = snap.docs.map(d => ({ ...d.data(), id: d.id }));

      // First-time setup: seed the product catalogue
      if (_products.length === 0) {
        const batch = _db.batch();
        SEED.forEach(p => batch.set(_db.collection('products').doc(p.id), p));
        await batch.commit();
        _products = [...SEED];
      }
    } catch(e) {
      console.warn('Products load failed, using seed:', e.message);
      _products = [...SEED];
    }

    // ── Load Orders (initial snapshot) ──────────────────────
    try {
      const snap = await _db.collection('orders').get();
      _orders = snap.docs
        .map(d => ({ ...d.data(), id: d.id }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch(e) {
      console.warn('Orders load failed:', e.message);
      _orders = [];
    }

    // ── Load Cart from localStorage ──────────────────────────
    _loadCart();

    // ── Real-time Listeners ──────────────────────────────────
    // Products: update cache + notify UI on any change
    _db.collection('products').onSnapshot(
      snap => {
        _products = snap.docs.map(d => ({ ...d.data(), id: d.id }));
        _notify('products');
      },
      err => console.error('Products listener error:', err)
    );

    // Orders: update cache + notify UI on any new order
    _db.collection('orders').onSnapshot(
      snap => {
        _orders = snap.docs
          .map(d => ({ ...d.data(), id: d.id }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        _notify('orders');
      },
      err => console.error('Orders listener error:', err)
    );

    _resolveReady();
    return _ready;
  }

  /* ═══════════════════════════════════════════════════════════
     PRODUCTS
  ═══════════════════════════════════════════════════════════ */
  const getProducts    = ()   => _products;
  const getProductById = id  => _products.find(p => p.id === id) || null;

  async function addProduct(data) {
    const ref = _db.collection('products').doc();
    const p   = { ...data, id: ref.id, createdAt: new Date().toISOString() };
    await ref.set(p);
    return p; // cache updated by listener
  }

  async function updateProduct(id, data) {
    await _db.collection('products').doc(id).update({
      ...data, updatedAt: new Date().toISOString(),
    });
  }

  async function deleteProduct(id) {
    await _db.collection('products').doc(id).delete();
  }

  /* ═══════════════════════════════════════════════════════════
     ORDERS
  ═══════════════════════════════════════════════════════════ */
  const getOrders = () => _orders;

  async function addOrder(data) {
    const ref   = _db.collection('orders').doc();
    const order = { ...data, id: ref.id, status: 'Pending', createdAt: new Date().toISOString() };
    await ref.set(order);
    // NOTE: clearCart() is NOT called here — frontend does it after capturing data
    return order;
  }

  async function updateOrderStatus(id, status) {
    await _db.collection('orders').doc(id).update({
      status, updatedAt: new Date().toISOString(),
    });
  }

  /* ═══════════════════════════════════════════════════════════
     CART (localStorage only — no cloud sync needed for cart)
  ═══════════════════════════════════════════════════════════ */
  const getCart      = ()            => _cart;
  const getCartTotal = ()            => _cart.reduce((s, i) => s + i.price * i.qty, 0);
  const getCartCount = ()            => _cart.reduce((s, i) => s + i.qty, 0);

  function addToCart(item) {
    _cart.push({ ...item, cartId: 'ci_' + Date.now() });
    _saveCart(); return _cart;
  }
  function removeFromCart(cartId) {
    _cart = _cart.filter(i => i.cartId !== cartId);
    _saveCart(); return _cart;
  }
  function updateCartQty(cartId, qty) {
    _cart = _cart.map(i => i.cartId === cartId ? { ...i, qty } : i);
    _saveCart(); return _cart;
  }
  function clearCart() { _cart = []; _saveCart(); }

  /* ═══════════════════════════════════════════════════════════
     SETTINGS
  ═══════════════════════════════════════════════════════════ */
  const getSettings = () => _settings;

  async function saveSettings(obj) {
    _settings = { ..._settings, ...obj };
    await _db.doc('config/settings').set(_settings);
    return _settings;
  }

  /* ═══════════════════════════════════════════════════════════
     AUTH (password stored in settings)
  ═══════════════════════════════════════════════════════════ */
  const checkAdminPass = pass => _settings.adminPass === pass;
  const setAdminPass   = pass => saveSettings({ adminPass: pass });

  /* ═══════════════════════════════════════════════════════════
     REAL-TIME CALLBACKS
     Usage: Store.onUpdate('orders', () => renderOrders())
  ═══════════════════════════════════════════════════════════ */
  function onUpdate(type, cb) {
    _cbs[type] = _cbs[type] || [];
    _cbs[type].push(cb);
  }

  /* ── Public API ────────────────────────────────────────────── */
  return {
    ready: _ready,
    init,
    getDuas:       () => DUAS,
    getCategories: () => CATEGORIES,
    getProducts, getProductById, addProduct, updateProduct, deleteProduct,
    getOrders, addOrder, updateOrderStatus,
    getCart, addToCart, removeFromCart, updateCartQty, clearCart, getCartTotal, getCartCount,
    getSettings, saveSettings,
    checkAdminPass, setAdminPass,
    onUpdate,
  };

})();
