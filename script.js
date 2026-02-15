/* --- Audio System --- */
const audioSys = {
    ctx: new (window.AudioContext || window.webkitAudioContext)(),
    playTone: (freq, type, duration) => {
        const osc = audioSys.ctx.createOscillator();
        const gain = audioSys.ctx.createGain();
        osc.type = type; osc.frequency.value = freq;
        osc.connect(gain); gain.connect(audioSys.ctx.destination);
        osc.start(); gain.gain.exponentialRampToValueAtTime(0.00001, audioSys.ctx.currentTime + duration);
        osc.stop(audioSys.ctx.currentTime + duration);
    },
    success: () => { audioSys.playTone(600, 'sine', 0.1); setTimeout(() => audioSys.playTone(800, 'sine', 0.2), 100); },
    error: () => { audioSys.playTone(300, 'sawtooth', 0.2); },
    coin: () => { audioSys.playTone(1200, 'sine', 0.1); }
};

/* --- RPG Database --- */
const rpgItemsDB = {
    'wood': { name: 'چوب', type: 'material', icon: 'tree' },
    'stone': { name: 'سنگ', type: 'material', icon: 'cube' },
    'iron': { name: 'آهن', type: 'material', icon: 'cubes' },
    'diamond': { name: 'الماس', type: 'material', icon: 'gem', rarity: 'cyan' },
    'sword_wood': { name: 'شمشیر چوبی', type: 'weapon', bonus: 2, icon: 'khanda', rarity: '#fff' },
    'sword_iron': { name: 'شمشیر آهنی', type: 'weapon', bonus: 5, icon: 'khanda', rarity: '#3498db' },
    'sword_gold': { name: 'شمشیر طلایی', type: 'weapon', bonus: 15, icon: 'khanda', rarity: 'gold' },
    'pickaxe': { name: 'کلنگ', type: 'tool', bonus: 0, icon: 'hammer', rarity: '#fff' },
    'armor_leather': { name: 'زره چرمی', type: 'armor', bonus: 10, icon: 'shield-alt', rarity: '#fff' }, 
    'armor_iron': { name: 'زره آهنی', type: 'armor', bonus: 30, icon: 'shield-alt', rarity: '#3498db' }
};

const craftingRecipes = [
    { id: 'sword_wood', req: { 'wood': 5 }, cost: 100 },
    { id: 'sword_iron', req: { 'wood': 2, 'iron': 3 }, cost: 500 },
    { id: 'armor_leather', req: { 'wood': 10 }, cost: 200 },
    { id: 'pickaxe', req: { 'wood': 3, 'stone': 2 }, cost: 150 }
];

/* --- Real Estate Database --- */
const realEstateItems = [
    { id: 'tent', name: "چادر مسافرتی", price: 1000, income: 10, icon: "campground" },
    { id: 'house', name: "خانه کوچک", price: 10000, income: 50, icon: "home" },
    { id: 'mansion', name: "قصر مجلل", price: 100000, income: 300, icon: "hotel" },
    { id: 'island', name: "جزیره اختصاصی", price: 1000000, income: 2000, icon: "umbrella-beach" }
];

/* --- Data & State --- */
const defaultUser = {
    name: "", coins: 0, xp: 0, level: 1, prestige: 0,
    inventory: [], miners: {}, activeAvatar: "user", activeTheme: "default", activePet: null, activeFrame: null,
    bank: 0, lastBankInterest: Date.now(),
    dailyStreak: 0, lastDaily: 0,
    activeEffects: {}, // { name: endTime }
    lastSpin: 0, lastSave: Date.now(),
    skills: { click: 0, xp: 0 },
    marketInventory: { btc: 0, eth: 0, sol: 0, doge: 0, usdt: 0 },
    stats: { totalClicks: 0, totalEarned: 0 },
    achievements: [],
    clan: null, ownedTags: [], activeTag: null, ownedFonts: ['default'], activeFont: 'default',
    quests: {
        q1: { id: 'q1', desc: 'کسب ۵۰۰ امتیاز', target: 500, current: 0, reward: 100, done: false },
        q2: { id: 'q2', desc: '۱۰ بار کلیک در بازی', target: 10, current: 0, reward: 50, done: false }
    },
    petLevels: {}, redeemedCodes: [],
    rpgInventory: {}, 
    equipment: { weapon: null, armor: null },
    realEstate: {},
    // V5 New Data
    village: { th: 1, walls: 0, cannons: 0, shield: 0 },
    army: { soldier: 0, giant: 0 }
};

let user = JSON.parse(JSON.stringify(defaultUser));

const shopItems = {
    music: [
        { id: 'm1', name: "موزیک ۱(", price: 100, file: 'music1.mp3' },
        { id: 'm2', name: "موزیک ۲(", price: 300, file: 'music2.mp3' },
        { id: 'm3', name: "موزیک ۳", price: 600, file: 'music3.mp3' },
        { id: 'm4', name: "موزیک ۴(", price: 1000, file: 'music4.mp3' },
        { id: 'm5', name: "موزیک ۵", price: 2000, file: 'music5.mp3' },
        { id: 'm6', name: "موزیک ۶ ", price: 2500, file: 'music6.mp3' },
        { id: 'm7', name: "موزیک ۷ ", price: 3000, file: 'music7.mp3' },
        { id: 'm8', name: "موزیک ۸ ", price: 3500, file: 'music8.mp3' },
        { id: 'm9', name: "موزیک ۹ ", price: 4000, file: 'music9.mp3' },
        { id: 'm10', name: "موزیک ۱۰ ", price: 5000, file: 'music10.mp3' }
    ],
    avatars: [
        { id: 'a1', name: "نینجا", price: 500, icon: "user-ninja" },
        { id: 'a2', name: "فضانورد", price: 800, icon: "user-astronaut" },
        { id: 'a3', name: "جاسوس", price: 1200, icon: "user-secret" },
        { id: 'a4', name: "تاج‌دار", price: 2000, icon: "crown" }
    ],
    frames: [
        { id: 'f_fire', name: "قاب آتشین", price: 5000, class: 'frame-fire' },
        { id: 'f_gold', name: "قاب طلایی", price: 10000, class: 'frame-gold' },
        { id: 'f_diamond', name: "قاب الماسی", price: 20000, class: 'frame-diamond' }
    ],
    tags: [
        { id: 't_legend', name: "تگ Legend", price: 5000, class: 'tag-legend', text: 'LEGEND' },
        { id: 't_rich', name: "تگ Rich", price: 10000, class: 'tag-rich', text: '$$$' },
        { id: 't_warrior', name: "تگ Warrior", price: 2000, class: 'tag-warrior', text: '⚔️' }
    ],
    fonts: [
        { id: 'font_neon', name: "فونت نئونی", price: 3000, class: 'font-neon' },
        { id: 'font_pixel', name: "فونت پیکسلی", price: 2000, class: 'font-pixel' }
    ],
    consumables: [
        { id: 'c_luck', name: "معجون شانس (5 دقیقه)", price: 500, duration: 300000, icon: 'flask' },
        { id: 'c_double', name: "سکه دوبرابر (10 دقیقه)", price: 1000, duration: 600000, icon: 'coins' }
    ],
    pets: [
        { id: 'p1', name: "گربه", price: 2000, icon: "cat" },
        { id: 'p2', name: "اژدها", price: 5000, icon: "dragon" },
        { id: 'p3', name: "ربات", price: 8000, icon: "robot" }
    ],
    miners: [
        { id: 'min1', name: "ماینر مبتدی", price: 1000, rate: 1, icon: 'microchip' },
        { id: 'min2', name: "ماینر پیشرفته", price: 5000, rate: 6, icon: 'server' }, 
        { id: 'min3', name: "مزرعه ماینینگ", price: 20000, rate: 30, icon: 'building' }
    ],
    themes: [
        { id: 'th_red', name: "قرمز آتشین", price: 500, colors: {'--primary': '#c0392b', '--primary-dark': '#a93226', '--bg-dark': '#1a0b0b'} },
        { id: 'th_blue', name: "آبی یخی", price: 500, colors: {'--primary': '#3498db', '--primary-dark': '#2980b9', '--bg-dark': '#0b101a'} },
        { id: 'th_green', name: "طبیعت", price: 500, colors: {'--primary': '#27ae60', '--primary-dark': '#219150', '--bg-dark': '#0b1a0e'} }
    ]
};

const achievementsList = [
    { id: 'ach1', name: "پولدار", desc: "کسب ۱۰۰۰ سکه", req: (u) => u.stats.totalEarned >= 1000, icon: "money-bill-wave" },
    { id: 'ach2', name: "کلیکر", desc: "۱۰۰ کلیک", req: (u) => u.stats.totalClicks >= 100, icon: "mouse" },
    { id: 'ach3', name: "تاجر", desc: "خرید ۱ بیت‌کوین", req: (u) => u.marketInventory.btc >= 1, icon: "chart-line" }
];

/* --- Logic --- */
const app = {
    init: () => {
        // Mouse Follower
        const cursor = document.getElementById('custom-cursor');
        document.addEventListener('mousemove', e => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        document.addEventListener('mousedown', () => cursor.classList.add('click'));
        document.addEventListener('mouseup', () => cursor.classList.remove('click'));

        const saved = localStorage.getItem('amirs_empire_ultra');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                user = { ...defaultUser, ...parsed };
                // Fix for old saves
                if(!user.marketInventory.sol) user.marketInventory.sol = 0;
                if(!user.marketInventory.doge) user.marketInventory.doge = 0;
                if(!user.marketInventory.usdt) user.marketInventory.usdt = 0;
                if(!user.ownedTags) user.ownedTags = [];
                if(!user.ownedFonts) user.ownedFonts = ['default'];
                if(!user.petLevels) user.petLevels = {}; 
                if(!user.redeemedCodes) user.redeemedCodes = [];
                if(!user.rpgInventory) user.rpgInventory = {};
                if(!user.equipment) user.equipment = { weapon: null, armor: null };
                if(!user.realEstate) user.realEstate = {};
                if(!user.village) user.village = { th: 1, walls: 0, cannons: 0, shield: 0 };
                if(!user.army) user.army = { soldier: 0, giant: 0 };
                
                app.calcOffline();
            } catch(e) { console.error("Data error"); }
            app.showMain();
        }
        
        app.checkHappyHour();
        
        setInterval(social.addBotMessage, 15000);
        setInterval(app.miningTick, 60000);
        setInterval(app.bankInterestTick, 60000);
        setInterval(market.update, 5000); 
        setInterval(market.newsTick, 30000); // News
        setInterval(boss.trySpawn, 60000);
        setInterval(app.randomEvent, 120000);
        setInterval(app.checkHappyHour, 60000);
        setInterval(expansion.weatherTick, 45000);
        setInterval(village.checkShield, 60000); // Shield tick

        app.checkDaily();
        app.initWheelCanvas(); 
    },
    
    checkHappyHour: () => {
        const h = new Date().getHours();
        if(h === 21) {
            if(!user.activeEffects['happy_hour']) {
                app.toast("ساعت طلایی شروع شد! سکه دو برابر!", "success");
                document.getElementById('happy-hour-banner').classList.remove('hidden');
            }
            user.activeEffects['happy_hour'] = Date.now() + 3600000;
        } else {
            document.getElementById('happy-hour-banner').classList.add('hidden');
            delete user.activeEffects['happy_hour'];
        }
    },

    calcOffline: () => {
        const now = Date.now();
        const diffMins = Math.floor((now - user.lastSave) / 60000);
        if(diffMins > 0) {
            let rate = 0;
            shopItems.miners.forEach(m => { if(user.miners[m.id]) rate += m.rate * user.miners[m.id]; });
            realEstateItems.forEach(r => { if(user.realEstate[r.id]) rate += r.income * user.realEstate[r.id]; });

            const multiplier = 1 + (user.prestige * 1); 
            
            if(rate > 0) {
                const earned = Math.floor(rate * diffMins * multiplier);
                app.addCoins(earned);
                setTimeout(() => app.toast(`در نبود شما ${earned} سکه استخراج شد!`, "success"), 1000);
            }
            const bankCycles = Math.floor(diffMins); 
            if(user.bank > 0 && bankCycles > 0) {
                 for(let i=0; i<bankCycles; i++) user.bank = Math.floor(user.bank * 1.001); 
            }
        }
        app.applyTheme(user.activeTheme);
    },

    miningTick: () => {
        let rate = 0;
        shopItems.miners.forEach(m => { if(user.miners[m.id]) rate += m.rate * user.miners[m.id]; });
        realEstateItems.forEach(r => { if(user.realEstate[r.id]) rate += r.income * user.realEstate[r.id]; });

        const multiplier = 1 + (user.prestige * 1);
        if(expansion.currentWeather === 'rain') rate *= 0.5;
        if(expansion.currentWeather === 'sun') rate *= 1.2;

        if(rate > 0) { app.addCoins(rate * multiplier); app.save(); }
    },

    bankInterestTick: () => {
        if(user.bank > 0) {
            const interest = Math.ceil(user.bank * 0.05); 
            user.bank += interest;
            app.toast(`سود بانکی: +${interest} سکه`, "success");
            app.save();
            app.updateUI();
        }
    },

    randomEvent: () => {
        if(Math.random() > 0.3) return; 
        const count = 10;
        app.toast("بارش سکه! کلیک کن!", "success");
        for(let i=0; i<count; i++) {
            const c = document.createElement('div');
            c.className = 'coin-rain';
            c.innerHTML = '<i class="fas fa-coins"></i>';
            c.style.left = Math.random() * window.innerWidth + 'px';
            c.style.animationDuration = (2 + Math.random() * 2) + 's';
            c.onclick = function() {
                this.remove();
                app.addCoins(50);
                audioSys.coin();
            };
            document.body.appendChild(c);
            setTimeout(()=>c.remove(), 4000);
        }
    },

    checkDaily: () => {
        const now = Date.now();
        const oneDay = 86400000;
        if(now - user.lastDaily > oneDay) {
            if(now - user.lastDaily > oneDay * 2) user.dailyStreak = 0;
            user.dailyStreak++;
            const reward = user.dailyStreak * 100;
            document.getElementById('daily-streak').textContent = user.dailyStreak;
            document.getElementById('daily-reward-amt').textContent = `+${reward} سکه`;
            document.getElementById('daily-modal').classList.remove('hidden');
            document.getElementById('daily-modal').style.display = 'flex';
        }
    },
    claimDaily: () => {
        const reward = user.dailyStreak * 100;
        app.addCoins(reward);
        user.lastDaily = Date.now();
        app.save();
        document.getElementById('daily-modal').classList.add('hidden');
        document.getElementById('daily-modal').style.display = 'none';
        app.toast("پاداش روزانه دریافت شد!", "success");
    },

    addCoins: (amount) => {
        if(user.activeEffects['c_double'] > Date.now() || user.activeEffects['happy_hour']) {
            amount *= 2;
        }
        user.coins += amount;
        if(amount > 0) user.stats.totalEarned += amount;
        app.checkAchievements();
        app.updateUI();
    },

    checkAchievements: () => {
        achievementsList.forEach(ach => {
            if(!user.achievements.includes(ach.id) && ach.req(user)) {
                user.achievements.push(ach.id);
                app.toast(`دستاورد باز شد: ${ach.name}`, "success");
                audioSys.success();
                app.particleEffect(window.innerWidth/2, window.innerHeight/2);
            }
        });
    },

    particleEffect: (x, y) => {
        const p = document.createElement('div');
        p.className = 'particle';
        p.textContent = `+Level UP!`;
        p.style.left = x + 'px'; p.style.top = y + 'px';
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1000);
    },
    
    clickParticle: (e, text) => {
        const p = document.createElement('div');
        p.className = 'particle';
        p.textContent = text;
        p.style.left = e.clientX + 'px'; p.style.top = e.clientY + 'px';
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1000);
    },

    login: () => {
        const name = document.getElementById('username').value.trim();
        if(!name) return app.toast("لطفا نامی وارد کنید", "error");
        user.name = name;
        user.lastSave = Date.now();
        app.save();
        app.showMain();
        audioSys.success();
    },

    showMain: () => {
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('app').classList.remove('hidden');
        app.updateUI();
        social.renderLeaderboard();
        social.loadChat();
        app.applyTheme(user.activeTheme);
        market.update();
        skills.render();
        expansion.updatePetUI(); 
        rpg.renderInventory();
        rpg.renderCrafting();
        village.render();
        
        VanillaTilt.init(document.querySelectorAll(".card"), {
            max: 10, speed: 400, glare: true, "max-glare": 0.3, scale: 1.02
        });
    },save: () => {
        user.lastSave = Date.now();
        // ذخیره در حافظه مرورگر (مثل قبل)
        localStorage.setItem('amirs_empire_ultra', JSON.stringify(user));
        
        // ذخیره در دیتابیس آنلاین (بخش جدید)
        if (typeof onlineGame !== 'undefined') {
            onlineGame.saveToCloud();
        }

        app.updateUI();
    },
    exportSave: () => {
        const data = btoa(JSON.stringify(user));
        navigator.clipboard.writeText(data);
        app.toast("سیو کپی شد! در جای امن نگهداری کنید.", "success");
    },
    importSave: () => {
        const data = prompt("کد سیو را اینجا وارد کنید:");
        if(data) {
            try {
                const parsed = JSON.parse(atob(data));
                user = parsed;
                app.save();
                location.reload();
            } catch(e) {
                app.toast("کد سیو نامعتبر است!", "error");
            }
        }
    },

    resetData: () => {
        if(confirm("آیا مطمئن هستید؟ همه چیز پاک می‌شود!")) {
            localStorage.removeItem('amirs_empire_ultra');
            location.reload();
        }
    },

    doPrestige: () => {
        if(user.level < 50) return app.toast("باید حداقل سطح 50 باشید!", "error");
        if(confirm("آیا مطمئنید؟ لول و سکه‌ها ریست می‌شوند اما درآمد ۲ برابر می‌شود!")) {
            user.prestige++;
            user.coins = 0;
            user.xp = 0;
            user.level = 1;
            user.miners = {}; 
            user.realEstate = {};
            user.village = { th: 1, walls: 0, cannons: 0, shield: 0 };
            user.army = { soldier: 0, giant: 0 };
            app.save();
            app.toast("پرستیژ انجام شد! قدرت دوبرابر!", "success");
            location.reload();
        }
    },

    updateUI: () => {
        document.getElementById('header-name').textContent = user.name;
        document.getElementById('header-coins').textContent = Math.floor(user.coins);
        document.getElementById('header-prestige').textContent = user.prestige;
        document.getElementById('bank-balance').textContent = user.bank;
        
        let title = "تازه وارد";
        if(user.level >= 10) title = "شوالیه سکه";
        if(user.level >= 30) title = "فرمانده";
        if(user.level >= 50) title = "اشراف‌زاده";
        if(user.level >= 100) title = "امپراتور";
        document.getElementById('title-display').textContent = title;

        const nameContainer = document.getElementById('header-name-container');
        if(user.activeTag) {
            const tagInfo = shopItems.tags.find(t=>t.id===user.activeTag);
            if(tagInfo) document.getElementById('active-tag-display').innerHTML = `<span class="user-tag ${tagInfo.class}">${tagInfo.text}</span>`;
        }
        
        const clanEl = document.getElementById('clan-display');
        if(user.clan) {
            clanEl.textContent = "CLAN: " + user.clan;
            clanEl.classList.remove('hidden');
        }

        document.body.className = '';
        if(user.activeFont !== 'default') {
            const fontInfo = shopItems.fonts.find(f=>f.id===user.activeFont);
            if(fontInfo) document.body.classList.add(fontInfo.class);
        }

        const nextLevelXp = user.level * 100;
        const progress = (user.xp / nextLevelXp) * 100;
        
        if(user.xp >= nextLevelXp) {
            user.level++;
            user.xp = 0;
            app.toast(`تبریک! به سطح ${user.level} رسیدی!`, "success");
            audioSys.success();
            app.particleEffect(window.innerWidth/2, window.innerHeight/2);
        }

        document.getElementById('header-level').textContent = `Lvl ${user.level}`;
        document.getElementById('header-xp').style.width = `${progress}%`;
        
        const currentAvatarIcon = user.activeAvatar === 'user' ? 'user' : shopItems.avatars.find(a=>a.id===user.activeAvatar).icon;
        document.getElementById('avatar-display').innerHTML = `<i class="fas fa-${currentAvatarIcon}"></i>`;
        
        const frameEl = document.getElementById('avatar-frame-el');
        frameEl.className = 'avatar-frame'; 
        if(user.activeFrame) {
            const f = shopItems.frames.find(x => x.id === user.activeFrame);
            if(f) frameEl.classList.add(f.class);
        }

        const effContainer = document.getElementById('active-effects');
        effContainer.innerHTML = '';
        for(let [k, v] of Object.entries(user.activeEffects)) {
            if(v > Date.now() || k === 'happy_hour') {
                let name = k;
                if(k === 'happy_hour') name = "Happy Hour";
                else {
                    const item = shopItems.consumables.find(x=>x.id===k);
                    if(item) name = item.name;
                }
                effContainer.innerHTML += `<div class="effect-badge"><i class="fas fa-magic"></i> ${name}</div>`;
            }
        }

        if(user.activePet) {
            const p = shopItems.pets.find(x=>x.id===user.activePet);
            const lvl = user.petLevels[p.id] || 1;
            document.getElementById('pet-display').innerHTML = `<i class="fas fa-${p.icon} animate__animated animate__bounce animate__infinite" style="animation-duration: 2s; color: ${lvl>5?'gold':'white'};"></i>`;
        }
        
        document.getElementById('equip-weapon').textContent = user.equipment.weapon ? rpgItemsDB[user.equipment.weapon].name : "خالی";
        document.getElementById('equip-armor').textContent = user.equipment.armor ? rpgItemsDB[user.equipment.armor].name : "خالی";

        app.renderShop();
        app.renderQuests();
        app.renderAchievements();
    },

    bankDeposit: () => {
        const val = parseInt(document.getElementById('bank-input').value);
        if(!val || val <= 0) return;
        if(user.coins >= val) {
            user.coins -= val;
            user.bank += val;
            app.toast("واریز شد", "success");
            app.save();
        } else app.toast("پول نداری", "error");
    },
    bankWithdraw: () => {
        const val = parseInt(document.getElementById('bank-input').value);
        if(!val || val <= 0) return;
        if(user.bank >= val) {
            user.bank -= val;
            user.coins += val;
            app.toast("برداشت شد", "success");
            app.save();
        } else app.toast("موجودی بانک کافی نیست", "error");
    },

    switchTab: (tabId) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        event.target.closest('button').classList.add('active');
        ['games', 'shop', 'quests', 'social', 'market', 'academy', 'darkzone', 'inventory', 'arena', 'village'].forEach(t => {
            const el = document.getElementById(`tab-${t}`);
            if(el) el.classList.add('hidden');
        });
        document.getElementById(`tab-${tabId}`).classList.remove('hidden');
        
        if(tabId === 'inventory') { rpg.renderInventory(); rpg.renderCrafting(); }
        if(tabId === 'village') village.render();
        if(tabId === 'shop') app.renderShop();
        if(tabId === 'games') VanillaTilt.init(document.querySelectorAll("#tab-games .card"));
    },

    toast: (msg, type = "info") => {
        const c = document.getElementById('toast-container');
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        t.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i> ${msg}`;
        c.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    },

    wheelRewards: [
        { text: '100 سکه', val: 100, color: '#e74c3c' },
        { text: 'XP دوبرابر', val: 'xp', color: '#8e44ad' },
        { text: '500 سکه', val: 500, color: '#3498db' },
        { text: 'پوچ', val: 0, color: '#95a5a6' },
        { text: 'جادو', val: 'item', color: '#2ecc71' },
        { text: 'الماس', val: 'gem', color: '#f1c40f' },
        { text: '200 سکه', val: 200, color: '#e67e22' },
        { text: 'JACKPOT', val: 5000, color: '#c0392b' }
    ],
    
    initWheelCanvas: () => {
        const canvas = document.getElementById('wheel-canvas');
        const ctx = canvas.getContext('2d');
        const arc = Math.PI / (app.wheelRewards.length / 2);
        
        for(let i=0; i<app.wheelRewards.length; i++) {
            ctx.fillStyle = app.wheelRewards[i].color;
            ctx.beginPath();
            ctx.moveTo(150, 150);
            ctx.arc(150, 150, 145, i*arc, (i+1)*arc);
            ctx.fill();
            ctx.save();
            ctx.fillStyle = "white";
            ctx.translate(150, 150);
            ctx.rotate(i*arc + arc/2);
            ctx.font = "bold 14px Arial";
            ctx.fillText(app.wheelRewards[i].text, 60, 5);
            ctx.restore();
        }
    },

    openWheel: () => document.getElementById('wheel-modal').style.display = 'flex',
    closeWheel: () => document.getElementById('wheel-modal').style.display = 'none',
    spinWheel: () => {
        const now = Date.now();
        if (now - user.lastSpin < 86400000) { }

        const canvas = document.getElementById('wheel-canvas');
        let deg = Math.floor(3000 + Math.random() * 3000);
        canvas.style.transform = `rotate(${deg}deg)`;
        
        audioSys.playTone(200, 'triangle', 0.5);

        setTimeout(() => {
            const actualDeg = deg % 360;
            const segmentSize = 360 / app.wheelRewards.length;
            const index = Math.floor((360 - actualDeg) / segmentSize) % app.wheelRewards.length;
            const res = app.wheelRewards[index];
            
            let txt = "";
            if(res.val === 'xp') { user.xp += 500; txt = "+500 XP"; }
            else if(res.val === 'item') { user.activeEffects['c_luck'] = Date.now()+60000; txt="جادوی شانس"; }
            else if(res.val === 'gem') { user.prestige++; txt="الماس (Prestige Point)"; } 
            else { app.addCoins(res.val); txt = `+${res.val} سکه`; }

            user.lastSpin = now;
            app.save();
            document.getElementById('wheel-result').textContent = `نتیجه: ${txt}`;
            if(res.val !== 0) { app.toast(txt, "success"); audioSys.success(); }
            else app.toast("پوچ!", "error");
        }, 4000);
    },

    // --- Radio Lo-Fi ---
    toggleRadio: () => {
        const player = document.getElementById('radio-stream');
        const icon = document.getElementById('radio-icon');
        const viz = document.getElementById('viz');
        if(player.paused) {
            player.play();
            icon.className = "fas fa-stop";
            document.getElementById('track-name').textContent = "در حال پخش: Lo-Fi Beats";
            document.getElementById('track-name').style.color = "var(--success)";
            viz.classList.remove('hidden');
        } else {
            player.pause();
            icon.className = "fas fa-play";
            document.getElementById('track-name').textContent = "رادیو متوقف شد";
            document.getElementById('track-name').style.color = "white";
            viz.classList.add('hidden');
        }
    },

    // --- Theme & Music ---
    applyTheme: (themeId) => {
        if(themeId === 'default') {
            document.documentElement.style.setProperty('--primary', '#8e44ad');
            document.documentElement.style.setProperty('--primary-dark', '#6c3483');
            document.documentElement.style.setProperty('--bg-dark', '#0b0c10');
        } else {
            const theme = shopItems.themes.find(t => t.id === themeId);
            if(theme) for (const [key, value] of Object.entries(theme.colors)) document.documentElement.style.setProperty(key, value);
        }
    },
    playMusic: (file, name) => {
        const player = document.getElementById('audio-player');
        player.src = file;
        player.play().catch(e => app.toast("خطا در پخش. فایل موجود نیست.", "error"));
        document.getElementById('mini-player').classList.remove('hidden'); 
    },
    toggleMusic: () => {
        const player = document.getElementById('audio-player');
        if(player.paused) player.play(); else player.pause();
    },
    stopMusic: () => {
        const player = document.getElementById('audio-player');
        player.pause(); player.currentTime = 0;
    },

    // --- Shop & Renderers ---
    renderShop: () => {
        const cList = document.getElementById('shop-consumable-list'); cList.innerHTML = "";
        shopItems.consumables.forEach(item => {
            cList.innerHTML += `<div class="card"><i class="fas fa-${item.icon} fa-2x" style="color:#ff7675"></i><h4>${item.name}</h4><button class="btn btn-accent" onclick="app.buyConsumable('${item.id}')">${item.price} سکه</button></div>`;
        });
        
        const rList = document.getElementById('shop-realestate-list'); rList.innerHTML = "";
        realEstateItems.forEach(item => {
            const count = user.realEstate[item.id] || 0;
            rList.innerHTML += `<div class="card real-estate-card"><i class="fas fa-${item.icon} fa-2x"></i><h4>${item.name}</h4><p>درآمد: ${item.income}/min</p><p>دارایی: ${count}</p><button class="btn btn-primary" onclick="app.buy('${item.id}', 'realestate', ${item.price})">${item.price}</button></div>`;
        });

        const tagList = document.getElementById('shop-tag-list'); tagList.innerHTML = "";
        shopItems.tags.forEach(item => {
            const owned = user.ownedTags && user.ownedTags.includes(item.id);
            tagList.innerHTML += `<div class="card"><span class="user-tag ${item.class}">${item.text}</span><h4>${item.name}</h4>${owned ? (user.activeTag===item.id ? '<span style="color:green">فعال</span>' : `<button class="btn" onclick="app.equipTag('${item.id}')">انتخاب</button>`) : `<button class="btn btn-accent" onclick="app.buy('${item.id}', 'tag', ${item.price})">${item.price}</button>`}</div>`;
        });

        const fontList = document.getElementById('shop-font-list'); fontList.innerHTML = "";
        shopItems.fonts.forEach(item => {
            const owned = user.ownedFonts && user.ownedFonts.includes(item.id);
            fontList.innerHTML += `<div class="card"><h4 class="${item.class}">${item.name}</h4>${owned ? (user.activeFont===item.id ? '<span style="color:green">فعال</span>' : `<button class="btn" onclick="app.equipFont('${item.id}')">انتخاب</button>`) : `<button class="btn btn-accent" onclick="app.buy('${item.id}', 'font', ${item.price})">${item.price}</button>`}</div>`;
        });

        const fList = document.getElementById('shop-frame-list'); fList.innerHTML = "";
        shopItems.frames.forEach(item => {
            const owned = user.inventory.includes(item.id);
            fList.innerHTML += `<div class="card"><div class="avatar-frame ${item.class}" style="width:40px;height:40px;border-radius:50%;margin:0 auto;background:#333"></div><h4>${item.name}</h4>${owned ? (user.activeFrame===item.id ? '<span style="color:green">فعال</span>' : `<button class="btn" onclick="app.equipFrame('${item.id}')">انتخاب</button>`) : `<button class="btn btn-accent" onclick="app.buy('${item.id}', 'frame', ${item.price})">${item.price}</button>`}</div>`;
        });

        let totalRate = 0;
        const minerList = document.getElementById('shop-miner-list');
        minerList.innerHTML = "";
        shopItems.miners.forEach(item => {
            const count = user.miners[item.id] || 0;
            totalRate += count * item.rate;
            minerList.innerHTML += `<div class="card"><i class="fas fa-${item.icon} fa-2x" style="color:var(--success)"></i><h4>${item.name}</h4><p style="font-size:0.8rem;">+${item.rate}/min</p><p>دارایی: ${count}</p><button class="btn btn-accent" onclick="app.buy('${item.id}', 'miner', ${item.price})">${item.price}</button></div>`;
        });
        
        const mult = 1 + (user.prestige * 1);
        document.getElementById('mining-stats').innerHTML = `درآمد پایه: ${totalRate}/min <br> <span style="color:var(--gold)">ضریب پرستیژ: x${mult}</span>`;

        const pList = document.getElementById('shop-pet-list');
        pList.innerHTML = "";
        shopItems.pets.forEach(item => {
            const owned = user.inventory.includes(item.id);
            const isActive = user.activePet === item.id;
            const lvl = user.petLevels[item.id] || 1;
            const upgradeCost = lvl * 500;
            
            let upgradeBtn = owned ? `
                <button class="btn btn-primary btn-sm" onclick="expansion.upgradePet('${item.id}', ${upgradeCost})" style="margin-top:5px; font-size:0.7rem">ارتقا (Lvl ${lvl}) - ${upgradeCost}</button>
                <button class="btn btn-warning btn-sm" onclick="expansion.evolvePet('${item.id}')" style="margin-top:5px; font-size:0.7rem">تکامل (نیاز 2x)</button>` : '';

            pList.innerHTML += `<div class="card"><i class="fas fa-${item.icon} fa-2x"></i><h4>${item.name}</h4>${owned ? (isActive ? '<span style="color:green">همراه</span>' : `<button class="btn" onclick="app.equipPet('${item.id}')">انتخاب</button>`) : `<button class="btn btn-accent" onclick="app.buy('${item.id}', 'pet', ${item.price})">${item.price}</button>`} ${upgradeBtn}</div>`;
        });

        const tList = document.getElementById('shop-theme-list');
        tList.innerHTML = `<div class="card"><h4>پیش‌فرض</h4>${user.activeTheme === 'default' ? '<span style="color:green">فعال</span>' : '<button class="btn" onclick="app.equipTheme(\'default\')">انتخاب</button>'}</div>`;
        shopItems.themes.forEach(item => {
            const owned = user.inventory.includes(item.id);
            tList.innerHTML += `<div class="card"><div style="width:20px;height:20px;background:${item.colors['--primary']};border-radius:50%;margin:0 auto;"></div><h4>${item.name}</h4>${owned ? (user.activeTheme === item.id ? '<span style="color:green">فعال</span>' : `<button class="btn" onclick="app.equipTheme('${item.id}')">انتخاب</button>`) : `<button class="btn btn-accent" onclick="app.buy('${item.id}', 'theme', ${item.price})">${item.price}</button>`}</div>`;
        });

        const aList = document.getElementById('shop-avatar-list'); aList.innerHTML = "";
        shopItems.avatars.forEach(item => {
            const owned = user.inventory.includes(item.id);
            aList.innerHTML += `<div class="card"><i class="fas fa-${item.icon} fa-2x"></i>${owned ? (user.activeAvatar===item.id?'<span>فعال</span>':`<button class="btn" onclick="app.equip('${item.id}')">انتخاب</button>`) : `<button class="btn btn-accent" onclick="app.buy('${item.id}', 'avatar', ${item.price})">${item.price}</button>`}</div>`;
        });
        
        const mList = document.getElementById('shop-music-list'); mList.innerHTML = "";
        shopItems.music.forEach(item => {
            const owned = user.inventory.includes(item.id);
            mList.innerHTML += `<div class="card"><h4>${item.name}</h4>${owned ? `<button class="btn btn-success" onclick="app.playMusic('${item.file}', '${item.name}')">پخش</button>` : `<button class="btn btn-accent" onclick="app.buy('${item.id}', 'music', ${item.price})">${item.price}</button>`}</div>`;
        });
        
        VanillaTilt.init(document.querySelectorAll(".card"));
    },

    renderAchievements: () => {
        const list = document.getElementById('achievements-list');
        list.innerHTML = "";
        achievementsList.forEach(ach => {
            const unlocked = user.achievements.includes(ach.id);
            list.innerHTML += `<div class="card" style="opacity:${unlocked?1:0.5}; padding:10px; text-align:center;"><i class="fas fa-${ach.icon} fa-2x" style="color:${unlocked?'var(--gold)':'#555'}"></i><div style="font-size:0.8rem; margin-top:5px;">${ach.name}</div></div>`;
        });
    },

    buy: (id, type, price) => {
        if(user.coins >= price) {
            user.coins -= price;
            if(type === 'miner') {
                if(!user.miners[id]) user.miners[id] = 0;
                user.miners[id]++;
            } else if (type === 'realestate') {
                if(!user.realEstate[id]) user.realEstate[id] = 0;
                user.realEstate[id]++;
            } else if (type === 'pet') {
                user.inventory.push(id);
                user.activePet = id;
                user.petLevels[id] = 1;
            } else if (type === 'frame') {
                user.inventory.push(id);
                user.activeFrame = id;
            } else if (type === 'tag') {
                if(!user.ownedTags) user.ownedTags = [];
                user.ownedTags.push(id);
                user.activeTag = id;
            } else if (type === 'font') {
                if(!user.ownedFonts) user.ownedFonts = [];
                user.ownedFonts.push(id);
                user.activeFont = id;
            } else {
                user.inventory.push(id);
            }
            app.save();
            app.toast("خرید موفق!", "success");
            audioSys.coin();
        } else {
            app.toast("سکه کافی نداری!", "error");
            audioSys.error();
        }
    },
    
    buyConsumable: (id) => {
        const item = shopItems.consumables.find(x => x.id === id);
        if(user.coins >= item.price) {
            user.coins -= item.price;
            user.activeEffects[id] = Date.now() + item.duration;
            app.save();
            app.toast(`${item.name} فعال شد!`, "success");
        } else app.toast("سکه کافی نیست", "error");
    },

    equip: (id) => { user.activeAvatar = id; app.save(); app.toast("پروفایل آپدیت شد", "success"); },
    equipFrame: (id) => { user.activeFrame = id; app.save(); app.toast("قاب تنظیم شد", "success"); },
    equipTheme: (id) => { user.activeTheme = id; app.applyTheme(id); app.save(); app.toast("تم اعمال شد", "success"); },
    equipPet: (id) => { user.activePet = id; app.save(); app.toast("پت همراه شد", "success"); },
    equipTag: (id) => { user.activeTag = id; app.save(); app.toast("تگ انتخاب شد", "success"); },
    equipFont: (id) => { user.activeFont = id; app.save(); app.toast("فونت اعمال شد", "success"); },

    renderQuests: () => {
        const list = document.getElementById('quest-list'); list.innerHTML = "";
        Object.values(user.quests).forEach(q => {
            const pct = Math.min(100, (q.current / q.target) * 100);
            list.innerHTML += `<div class="card" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;"><div style="flex:1"><h4>${q.desc}</h4><div class="xp-container"><div class="xp-bar" style="width:${pct}%"></div></div><small>${q.current} / ${q.target}</small></div><div>${q.done ? '<i class="fas fa-check" style="color:green"></i>' : (q.current >= q.target ? `<button class="btn btn-success" onclick="app.claimQuest('${q.id}')">دریافت</button>` : `<span>+${q.reward}</span>`) }</div></div>`;
        });
    },
    updateQuest: (type, amount) => {
        if(type === 'score') user.quests.q1.current += amount;
        if(type === 'click') user.quests.q2.current += amount;
        app.save();
    },
    claimQuest: (qid) => {
        const q = user.quests[qid];
        if(q && !q.done && q.current >= q.target) {
            q.done = true; app.addCoins(q.reward); user.xp += 50; app.save(); app.toast("جایزه دریافت شد!", "success"); audioSys.success();
        }
    }
};

/* --- RPG System Logic --- */
const rpg = {
    addItem: (id, count=1) => {
        if(!user.rpgInventory[id]) user.rpgInventory[id] = 0;
        user.rpgInventory[id] += count;
        app.save();
    },
    renderInventory: () => {
        const list = document.getElementById('inventory-list');
        list.innerHTML = "";
        if(Object.keys(user.rpgInventory).length === 0) list.innerHTML = "<p style='text-align:center'>کوله پشتی خالی است</p>";
        
        for(let [id, count] of Object.entries(user.rpgInventory)) {
            if(count <= 0) continue;
            const item = rpgItemsDB[id];
            let actionBtn = "";
            if(item.type === 'weapon' || item.type === 'armor') {
                actionBtn = `<button class="btn btn-sm" onclick="rpg.equip('${id}')">تجهیز</button>`;
            }
            list.innerHTML += `
            <div class="item-slot">
                <div class="item-icon" style="color:${item.rarity || 'white'}"><i class="fas fa-${item.icon}"></i></div>
                <div style="flex:1">
                    <h4>${item.name}</h4>
                    <small style="color:#aaa">${item.type}</small>
                </div>
                <div style="font-weight:bold">x${count}</div>
                ${actionBtn}
            </div>`;
        }
    },
    renderCrafting: () => {
        const list = document.getElementById('crafting-list');
        list.innerHTML = "";
        craftingRecipes.forEach(r => {
            const item = rpgItemsDB[r.id];
            let reqText = "";
            let canCraft = true;
            for(let [mid, mcount] of Object.entries(r.req)) {
                const has = user.rpgInventory[mid] || 0;
                const color = has >= mcount ? 'green' : 'red';
                if(has < mcount) canCraft = false;
                reqText += `<span style="color:${color}">${rpgItemsDB[mid].name}: ${has}/${mcount}</span> `;
            }
            
            list.innerHTML += `
            <div class="card" style="margin-bottom:10px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <i class="fas fa-${item.icon} fa-2x" style="color:${item.rarity}"></i>
                    <div>
                        <h4>${item.name}</h4>
                        <small>${reqText}</small>
                    </div>
                </div>
                <button class="btn btn-${canCraft ? 'success' : 'secondary'}" style="width:100%; margin-top:10px;" onclick="rpg.craft('${r.id}')" ${!canCraft?'disabled':''}>ساخت (${r.cost} سکه)</button>
            </div>`;
        });
    },
    craft: (id) => {
        const recipe = craftingRecipes.find(x => x.id === id);
        if(user.coins < recipe.cost) return app.toast("سکه کافی نیست", "error");
        for(let [mid, mcount] of Object.entries(recipe.req)) {
            user.rpgInventory[mid] -= mcount;
        }
        user.coins -= recipe.cost;
        rpg.addItem(id, 1);
        app.toast(`${rpgItemsDB[id].name} ساخته شد!`, "success");
        audioSys.success();
        app.showMain();
    },
    equip: (id) => {
        const item = rpgItemsDB[id];
        if(item.type === 'weapon') user.equipment.weapon = id;
        if(item.type === 'armor') user.equipment.armor = id;
        app.save();
        app.showMain();
        app.toast("تجهیز شد!", "success");
    },
    mineResource: () => {
        // Minecraft style manual mining
        const resources = ['stone', 'stone', 'wood', 'wood', 'iron'];
        if(Math.random() > 0.9) resources.push('diamond');
        
        const res = resources[Math.floor(Math.random()*resources.length)];
        rpg.addItem(res, 1);
        app.toast(`+1 ${rpgItemsDB[res].name}`, "success");
        
        // Durability check (if we had pickaxe logic, here it would go)
    }
};

/* --- Village System (Clash of Clans) --- */
const village = {
    buildings: [
        { id: 'th', name: 'تالار شهر', cost: 1000, icon: 'landmark' },
        { id: 'walls', name: 'دیوار دفاعی', cost: 500, icon: 'border-all' },
        { id: 'cannons', name: 'توپ جنگی', cost: 2000, icon: 'bomb' }
    ],
    render: () => {
        const container = document.getElementById('village-buildings');
        container.innerHTML = "";
        
        village.buildings.forEach(b => {
            const lvl = user.village[b.id] || 0;
            const cost = b.cost * (lvl + 1);
            container.innerHTML += `
            <div class="building-card">
                <span class="building-lvl">Lvl ${lvl}</span>
                <i class="fas fa-${b.icon} fa-3x" style="color:var(--accent)"></i>
                <h4>${b.name}</h4>
                <button class="btn btn-sm btn-success" onclick="village.upgrade('${b.id}', ${cost})" style="margin-top:5px;">ارتقا (${cost})</button>
            </div>`;
        });
        
        document.getElementById('army-soldier').textContent = user.army.soldier;
        document.getElementById('army-giant').textContent = user.army.giant;
        
        // Check Shield
        const shieldStatus = document.getElementById('village-shield-status');
        if(user.village.shield > Date.now()) {
            const minLeft = Math.ceil((user.village.shield - Date.now()) / 60000);
            shieldStatus.innerHTML = `<span style="color:cyan">🛡️ فعال (${minLeft} دقیقه)</span>`;
        } else {
            shieldStatus.innerHTML = `🛡️ غیرفعال`;
        }
    },
    upgrade: (id, cost) => {
        if(user.coins >= cost) {
            user.coins -= cost;
            user.village[id]++;
            app.save();
            village.render();
            app.toast("ساختمان ارتقا یافت!", "success");
            audioSys.success();
        } else app.toast("سکه کافی نیست!", "error");
    },
    train: (unit) => {
        const costs = { soldier: 50, giant: 200 };
        if(user.coins >= costs[unit]) {
            user.coins -= costs[unit];
            user.army[unit]++;
            app.save();
            village.render();
            app.toast("نیرو آموزش دید!", "success");
        } else app.toast("سکه کافی نیست!", "error");
    },
    findMatch: () => {
        if(user.army.soldier === 0 && user.army.giant === 0) return app.toast("ارتش شما خالی است!", "error");
        
        app.toast("در حال جستجوی دهکده...", "info");
        setTimeout(() => {
            // Simulation
            const enemyDef = Math.floor(Math.random() * 50); // Defense power
            const myAtk = (user.army.soldier * 5) + (user.army.giant * 20);
            
            if(myAtk > enemyDef) {
                const loot = Math.floor(Math.random() * 5000) + 1000;
                app.addCoins(loot);
                app.toast(`پیروزی! ${loot} سکه غارت کردید!`, "success");
                audioSys.success();
                // Lose some troops
                user.army.soldier = Math.floor(user.army.soldier * 0.8);
                user.army.giant = Math.floor(user.army.giant * 0.9);
            } else {
                app.toast("شما شکست خوردید و ارتش نابود شد...", "error");
                user.army.soldier = 0;
                user.army.giant = 0;
            }
            app.save();
            village.render();
        }, 2000);
    },
    checkShield: () => {
        // Random attack event
        if(user.village.shield < Date.now() && Math.random() > 0.95) {
            const def = (user.village.walls * 10) + (user.village.cannons * 50);
            const atk = Math.random() * 500;
            if(atk > def) {
                const lost = Math.floor(user.coins * 0.1);
                user.coins -= lost;
                app.toast(`به دهکده شما حمله شد! ${lost} سکه از دست رفت.`, "error");
                user.village.shield = Date.now() + 3600000; // 1 hour shield
                app.save();
            }
        }
    }
};

/* --- Arena Logic --- */
const arena = {
    enemy: null, playerHp: 100,
    startBattle: () => {
        if(user.coins < 200) return app.toast("نیاز به 200 سکه", "error");
        user.coins -= 200;
        
        const mobs = [
            { name: "گوبلین", hp: 50, atk: 5, xp: 50, drop: 'wood' },
            { name: "اورک", hp: 100, atk: 10, xp: 120, drop: 'iron' },
            { name: "شوالیه تاریک", hp: 200, atk: 20, xp: 300, drop: 'sword_iron' }
        ];
        
        const lvlIdx = Math.min(mobs.length-1, Math.floor(user.level / 5));
        arena.enemy = JSON.parse(JSON.stringify(mobs[Math.floor(Math.random() * (lvlIdx+1))]));
        
        let bonusHp = 0;
        if(user.equipment.armor) bonusHp += rpgItemsDB[user.equipment.armor].bonus;
        arena.playerHp = 100 + (user.level * 10) + bonusHp;
        arena.maxPlayerHp = arena.playerHp;

        document.getElementById('arena-status').classList.add('hidden');
        document.getElementById('battle-ui').classList.remove('hidden');
        arena.log(`مبارزه با ${arena.enemy.name} شروع شد!`, 'w');
        arena.updateUI();
    },
    updateUI: () => {
        const pPct = (arena.playerHp / arena.maxPlayerHp) * 100;
        const ePct = (arena.enemy.hp / 100) * 100; 
        document.getElementById('player-hp-bar').style.width = pPct + "%";
        document.getElementById('player-hp-text').textContent = arena.playerHp;
        document.getElementById('enemy-hp-bar').style.width = ePct + "%";
        document.getElementById('enemy-hp-text').textContent = arena.enemy.hp;
    },
    log: (msg, type='w') => {
        const b = document.getElementById('battle-log');
        b.innerHTML += `<div class="log-${type}">> ${msg}</div>`;
        b.scrollTop = b.scrollHeight;
    },
    attack: () => {
        if(!arena.enemy) return;
        
        let dmg = 5 + (user.skills.click * 2);
        if(user.equipment.weapon) dmg += rpgItemsDB[user.equipment.weapon].bonus;
        dmg = Math.floor(dmg * (0.9 + Math.random()*0.2)); 
        
        arena.enemy.hp -= dmg;
        arena.log(`شما ${dmg} ضربه زدید!`, 'p');
        audioSys.playTone(150, 'square', 0.1);
        
        if(arena.enemy.hp <= 0) {
            arena.win();
        } else {
            setTimeout(arena.enemyTurn, 500);
        }
        arena.updateUI();
    },
    enemyTurn: () => {
        if(!arena.enemy) return;
        const dmg = arena.enemy.atk;
        arena.playerHp -= dmg;
        arena.log(`${arena.enemy.name} به شما ${dmg} آسیب زد!`, 'e');
        if(arena.playerHp <= 0) {
            arena.lose();
        }
        arena.updateUI();
    },
    heal: () => {
        if(arena.playerHp > 0) {
            const heal = 30;
            arena.playerHp += heal;
            if(arena.playerHp > arena.maxPlayerHp) arena.playerHp = arena.maxPlayerHp;
            arena.log("شما درمان شدید!", 'p');
            setTimeout(arena.enemyTurn, 500);
            arena.updateUI();
        }
    },
    run: () => {
        arena.log("فرار کردید!", 'w');
        setTimeout(arena.reset, 1000);
    },
    win: () => {
        arena.log("پیروز شدید!", 'w');
        app.addCoins(arena.enemy.xp); 
        user.xp += arena.enemy.xp;
        
        if(Math.random() > 0.5 && arena.enemy.drop) {
            rpg.addItem(arena.enemy.drop, 1);
            arena.log(`غنیمت یافت شد: ${rpgItemsDB[arena.enemy.drop].name}`, 'w');
        }
        
        audioSys.success();
        setTimeout(arena.reset, 2000);
    },
    lose: () => {
        arena.log("شما شکست خوردید...", 'e');
        setTimeout(arena.reset, 2000);
    },
    reset: () => {
        arena.enemy = null;
        document.getElementById('arena-status').classList.remove('hidden');
        document.getElementById('battle-ui').classList.add('hidden');
        document.getElementById('battle-log').innerHTML = "";
        app.save();
        app.showMain();
    }
};

/* --- Advanced Market System --- */
const market = {
    data: [
        { id: 'btc', name: 'Bitcoin', price: 65000, color: 'orange' },
        { id: 'eth', name: 'Ethereum', price: 3500, color: 'cyan' },
        { id: 'sol', name: 'Solana', price: 140, color: '#9b59b6' },
        { id: 'doge', name: 'Dogecoin', price: 0.15, color: 'gold' },
        { id: 'usdt', name: 'Tether', price: 1, color: '#2ecc71' }
    ],
    update: () => {
        const container = document.getElementById('crypto-list-container');
        if(!container) return;
        
        container.innerHTML = "";
        
        market.data.forEach(coin => {
            let volatility = Math.random() * 0.1 - 0.05; 
            if(coin.id === 'usdt') volatility = Math.random() * 0.002 - 0.001; 
            
            coin.price += coin.price * volatility;
            if(coin.price < 0.01) coin.price = 0.01;
            
            const changePct = (volatility * 100).toFixed(2);
            const changeClass = volatility >= 0 ? 'price-up' : 'price-down';
            const sign = volatility >= 0 ? '+' : '';
            
            const userHoldings = user.marketInventory[coin.id] || 0;

            container.innerHTML += `
            <div class="crypto-row">
                <div style="display:flex; align-items:center;">
                    <div class="crypto-icon" style="background:${coin.color}">${coin.id[0].toUpperCase()}</div>
                    <div style="margin-left:10px;">
                        <div style="font-weight:bold;">${coin.name}</div>
                        <div style="font-size:0.8rem; color:#aaa;">دارایی: ${userHoldings.toFixed(2)}</div>
                    </div>
                </div>
                <div style="text-align:left;">
                    <div>$${coin.price.toFixed(coin.id==='doge'||coin.id==='usdt'?2:0)}</div>
                    <div class="${changeClass}" style="font-size:0.8rem;">${sign}${changePct}%</div>
                </div>
                <div style="display:flex; gap:5px; flex-direction:column;">
                    <button class="btn btn-success" style="padding:2px 8px; font-size:0.8rem;" onclick="market.trade('${coin.id}', 'buy', ${coin.price})">خرید</button>
                    <button class="btn btn-danger" style="padding:2px 8px; font-size:0.8rem;" onclick="market.trade('${coin.id}', 'sell', ${coin.price})">فروش</button>
                </div>
            </div>`;
        });
    },
    trade: (id, action, price) => {
        if(action === 'buy') {
            if(user.coins >= price) {
                user.coins -= price;
                user.marketInventory[id] = (user.marketInventory[id] || 0) + 1;
                app.toast(`خرید موفق ${id}`, "success");
            } else app.toast("سکه کافی نیست", "error");
        } else {
            if(user.marketInventory[id] >= 1) {
                user.marketInventory[id]--;
                app.addCoins(price);
                app.toast(`فروش موفق ${id}`, "success");
            } else app.toast("موجودی نداری", "error");
        }
        app.save();
        market.update();
    },
    newsTick: () => {
        const headlines = [
            "ایلان ماسک توییت کرد!", "بیت‌کوین سقوط کرد!", "اتریوم آپدیت شد!",
            "نهنگ‌ها در حال خرید هستند", "قوانین جدید مالیاتی آمد"
        ];
        const news = headlines[Math.floor(Math.random() * headlines.length)];
        document.getElementById('market-news').textContent = `خبر فوری: ${news}`;
        
        // Market Impact
        market.data.forEach(c => {
            if(Math.random() > 0.5) c.price *= (0.8 + Math.random() * 0.4); // +/- impact
        });
    },
    tradeLeverage: (coinId) => {
        if(user.coins < 1000) return app.toast("حداقل 1000 سکه لازم است", "error");
        if(!confirm("خرید اهرمی ریسک بالایی دارد (5x). آیا مطمئن هستید؟")) return;
        
        user.coins -= 1000;
        setTimeout(() => {
            const outcome = Math.random();
            if(outcome > 0.6) {
                app.addCoins(5000);
                app.toast("سود عالی! 5000 سکه بردید!", "success");
            } else {
                app.toast("لیکوئید شدید! پولتان رفت.", "error");
            }
        }, 2000);
    }
};

/* --- Skills System --- */
const skills = {
    costs: { click: 100, xp: 150 },
    render: () => {
        document.getElementById('skill-click-lvl').textContent = "Lvl: " + user.skills.click;
        document.getElementById('skill-click-cost').textContent = skills.costs.click * (user.skills.click + 1);
        document.getElementById('skill-xp-lvl').textContent = "Lvl: " + user.skills.xp;
        document.getElementById('skill-xp-cost').textContent = skills.costs.xp * (user.skills.xp + 1);
    },
    upgrade: (type) => {
        const cost = skills.costs[type] * (user.skills[type] + 1);
        if(user.coins >= cost) {
            user.coins -= cost;
            user.skills[type]++;
            app.save();
            app.showMain(); 
            app.toast("مهارت ارتقا یافت!", "success");
        } else app.toast("سکه کافی نیست", "error");
    }
};

/* --- Boss Battle --- */
const boss = {
    hp: 0, maxHp: 0, active: false, timer: 0,
    trySpawn: () => {
        if(!boss.active && Math.random() > 0.7) boss.start(); 
    },
    start: () => {
        boss.active = true;
        boss.maxHp = 50 + (user.level * 10);
        boss.hp = boss.maxHp;
        boss.timer = 10;
        
        const el = document.getElementById('boss-overlay');
        el.style.display = 'flex';
        app.toast("هشدار! حمله اژدها!", "error");
        
        const interval = setInterval(() => {
            if(!boss.active) { clearInterval(interval); return; }
            boss.timer--;
            document.getElementById('boss-timer').textContent = boss.timer + "s";
            if(boss.timer <= 0) {
                clearInterval(interval);
                boss.end(false);
            }
        }, 1000);
    },
    hit: () => {
        if(!boss.active) return;
        
        let dmg = 1 + user.skills.click;
        if(user.equipment.weapon) dmg += rpgItemsDB[user.equipment.weapon].bonus;

        boss.hp -= dmg;
        const pct = (boss.hp / boss.maxHp) * 100;
        document.getElementById('boss-hp').style.width = pct + "%";
        document.getElementById('boss-btn').classList.add('shake');
        setTimeout(()=>document.getElementById('boss-btn').classList.remove('shake'), 100);
        audioSys.playTone(100, 'square', 0.05);

        if(boss.hp <= 0) boss.end(true);
    },
    end: (win) => {
        boss.active = false;
        document.getElementById('boss-overlay').style.display = 'none';
        if(win) {
            const reward = 500 * user.level;
            app.addCoins(reward);
            if(Math.random() > 0.8) {
                rpg.addItem('stone', 2);
                app.toast("سنگ پیدا کردید!", "info");
            }
            app.toast(`اژدها نابود شد! +${reward} سکه`, "success");
            audioSys.success();
        } else {
            app.toast("اژدها فرار کرد...", "error");
        }
    }
};

/* --- Game Engines --- */
let gameInterval;
let gameTimeout; 
const game = {
    start: (id) => {
        clearInterval(gameInterval);
        clearTimeout(gameTimeout);
        
        document.getElementById('game-modal').classList.remove('hidden');
        document.getElementById('game-modal').style.display = 'flex';
        const area = document.getElementById('game-area');
        area.innerHTML = '';
        document.getElementById('game-status').textContent = "آماده؟";
        
        if(id === 1) game.clicker(area);
        if(id === 2) game.math(area);
        if(id === 3) game.reflex(area);
        if(id === 4) game.guess(area);
        if(id === 5) game.typing(area);
        if(id === 6) game.memory(area);
        if(id === 7) game.coinflip(area);
        if(id === 8) game.rps(area);
        if(id === 9) game.slots(area);
        if(id === 10) game.whack(area);
        if(id === 11) game.hangman(area);
        if(id === 12) game.simon(area);
        if(id === 13) game.snake(area);
        if(id === 14) game.ttt(area);
        if(id === 15) game.reaction(area);
    },
    close: () => {
        document.getElementById('game-modal').classList.add('hidden');
        document.getElementById('game-modal').style.display = 'none';
        clearInterval(gameInterval);
        clearTimeout(gameTimeout);
        app.updateUI();
    },
    reward: (amount) => {
        let finalAmount = amount;
        const prestigeMult = 1 + (user.prestige * 1);
        
        if(amount > 0) finalAmount += (user.skills.click * 2); 
        finalAmount = Math.floor(finalAmount * prestigeMult); 

        let xpAmount = Math.ceil(finalAmount / 2);
        xpAmount += (user.skills.xp * 5); 

        app.addCoins(finalAmount);
        if(finalAmount > 0) user.xp += xpAmount;
        app.updateQuest('score', Math.abs(finalAmount));
        
        document.getElementById('game-status').textContent = finalAmount > 0 ? `+${finalAmount} سکه و ${xpAmount} XP!` : "باختی!";
        if(finalAmount > 0) audioSys.coin();
        app.save();
    },

    startRaid: (difficulty) => {
        const cost = difficulty === 'easy' ? 100 : 500;
        if(user.coins < cost) return app.toast("سکه کافی نیست!", "error");
        
        user.coins -= cost;
        app.save();
        
        game.start(99); 
        document.getElementById('game-title').textContent = "حمله به قلعه";
        const area = document.getElementById('game-area');
        area.innerHTML = '<div style="font-size:3rem" class="animate__animated animate__shakeX">⚔️</div><p>نبرد در حال انجام است...</p>';
        
        setTimeout(() => {
            const winChance = difficulty === 'easy' ? 0.7 : 0.4;
            const chance = user.activeEffects['c_luck'] > Date.now() ? winChance + 0.2 : winChance;
            
            if(Math.random() < chance) {
                const win = difficulty === 'easy' ? 250 : 1500;
                area.innerHTML = `<div style="font-size:3rem; color:green">🏆</div>`;
                game.reward(win);
                if(difficulty==='hard') rpg.addItem('iron', 2);
            } else {
                area.innerHTML = `<div style="font-size:3rem; color:red">☠️</div>`;
                game.reward(0);
            }
        }, 2000);
    },
    
    clicker: (area) => {
        document.getElementById('game-title').textContent = "کلیک مستر";
        let clicks = 0; let active = false;
        area.innerHTML = `<h1 id="c-count" style="font-size:3rem">0</h1><button id="c-btn" class="btn btn-primary" style="padding:20px; font-size:1.5rem">شروع</button>`;
        document.getElementById('c-btn').onclick = (e) => {
            if(!active) {
                active = true; let time = 10;
                e.target.textContent = "بزن!!!!";
                app.updateQuest('click', 1);
                gameInterval = setInterval(() => {
                    time--; 
                    if(!document.getElementById('game-modal').style.display || document.getElementById('game-modal').style.display === 'none') {
                        clearInterval(gameInterval); return;
                    }
                    document.getElementById('game-status').textContent = time;
                    if(time<=0) { clearInterval(gameInterval); active=false; e.target.disabled=true; game.reward(clicks); }
                }, 1000);
            } else {
                let clickP = 1 + user.skills.click;
                if(user.equipment.weapon) clickP += rpgItemsDB[user.equipment.weapon].bonus;

                clicks += clickP;
                document.getElementById('c-count').textContent = clicks;
                app.clickParticle(e, `+${clickP}`);
                app.updateQuest('click', 1);
                if(user.stats) user.stats.totalClicks++;
            }
        }
    },
    math: (area) => {
        let n1=Math.floor(Math.random()*10), n2=Math.floor(Math.random()*10);
        game.currentMathAns = n1 + n2;
        area.innerHTML = `<h2>${n1} + ${n2} = ?</h2><input type="number" id="m-ans" class="login-input" style="width:100px"><button class="btn btn-success" id="math-submit">ثبت</button>`;
        document.getElementById('m-ans').focus();
        document.getElementById('math-submit').onclick = () => {
            const ans = parseInt(document.getElementById('m-ans').value);
            if(ans === game.currentMathAns) { game.reward(15); setTimeout(() => game.math(area), 500); } 
            else { app.toast("غلط بود!", "error"); audioSys.error(); }
        };
    },
    reflex: (area) => {
        document.getElementById('game-title').textContent = "رفلکس";
        area.innerHTML = `<div id="r-box" style="width:100px;height:100px;background:red;border-radius:50%;cursor:none;"></div>`;
        const box = document.getElementById('r-box');
        let waiting = true;
        box.onclick = () => { if(waiting) { clearTimeout(gameTimeout); app.toast("خیلی زود زدی!", "error"); setTimeout(() => game.reflex(area), 500); } };
        gameTimeout = setTimeout(() => {
            if(!document.getElementById('game-modal').offsetParent) return;
            waiting = false; box.style.background = "#2ecc71";
            box.onclick = () => { box.onclick = null; game.reward(50); game.reflex(area); };
        }, 2000 + Math.random() * 2000);
    },
    guess: (area) => {
        document.getElementById('game-title').textContent = "شکار عدد (1-100)";
        let t = Math.floor(Math.random()*100)+1; let ch = 5;
        area.innerHTML = `<input id="g-in" type="number" class="login-input"><button class="btn" onclick="game.checkGuess(${t})">بررسی</button>`;
        game.checkGuess = (target) => {
            let v = parseInt(document.getElementById('g-in').value); ch--;
            if(v===target) { game.reward(100); setTimeout(game.close, 1000); }
            else if(ch<=0) { app.toast(`باختی! عدد ${target} بود`, "error"); setTimeout(game.close, 1000); }
            else { document.getElementById('game-status').textContent = v<target?"بیشتر (فرصت: "+ch+")":"کمتر (فرصت: "+ch+")"; }
        }
    },
    typing: (area) => {
        let words = ['Code','Web','Amir','Ali','Star','Food','Web','Radio','Game','Win','Gold','Coin','Telephone','Television','Boss'];
        let w = words[Math.floor(Math.random()*words.length)];
        document.getElementById('game-title').textContent = "تایپ: "+w;
        area.innerHTML = `<input id="t-in" class="login-input" oninput="game.checkType('${w}')">`;
        game.checkType = (word) => { 
            if(document.getElementById('t-in').value.toLowerCase() === word.toLowerCase()) { game.reward(20); game.typing(area); } 
        }
    },
    memory: (area) => {
        const icons = ['ghost', 'dragon', 'gamepad', 'headset', 'rocket', 'heart', 'star', 'bolt'];
        let cards = [...icons, ...icons].sort(() => Math.random() - 0.5);
        let html = `<div class="memory-grid">`;
        cards.forEach((icon, i) => html += `<div class="memory-card" id="mc-${i}" onclick="game.flipM(${i}, '${icon}')"><i class="fas fa-${icon}" style="opacity:0"></i></div>`);
        area.innerHTML = html + `</div>`;
        game.mState = { f: [], m: 0 };
    },
    flipM: (i, icon) => {
        let el = document.getElementById(`mc-${i}`);
        if(game.mState.f.length>=2 || el.classList.contains('flipped')) return;
        el.classList.add('flipped'); el.querySelector('i').style.opacity=1;
        game.mState.f.push({i, icon});
        if(game.mState.f.length===2) {
            if(game.mState.f[0].icon === game.mState.f[1].icon) {
                game.mState.m+=2; game.mState.f=[]; audioSys.success();
                if(game.mState.m===16) { game.reward(200); setTimeout(game.close, 1000); }
            } else {
                setTimeout(() => {
                    game.mState.f.forEach(c => {
                        let x = document.getElementById(`mc-${c.i}`); x.classList.remove('flipped'); x.querySelector('i').style.opacity=0;
                    });
                    game.mState.f=[];
                }, 800);
            }
        }
    },
    coinflip: (area) => {
        document.getElementById('game-title').textContent = "شیر یا خط";
        area.innerHTML = `<input id="cf-bet" type="number" class="login-input" value="50"><button class="btn btn-primary" onclick="game.doFlip()">چرخش</button><div id="cf-coin" style="width:50px;height:50px;background:gold;border-radius:50%;margin:20px auto;border:2px dashed #f1c40f"></div>`;
    },
    doFlip: () => {
        let bet = parseInt(document.getElementById('cf-bet').value);
        if(isNaN(bet) || bet <= 0) return app.toast("مبلغ نامعتبر", "error");
        if(bet > user.coins) return app.toast("پول نداری", "error");
        const coinEl = document.getElementById('cf-coin');
        coinEl.className = ''; coinEl.style.background = 'gold'; void coinEl.offsetWidth; 
        coinEl.className = 'animate__animated animate__flip';
        setTimeout(() => {
            coinEl.className = '';
            let winChance = 0.5;
            if(user.activeEffects['c_luck'] > Date.now()) winChance = 0.7;

            if(Math.random() < winChance) { 
                game.reward(bet); app.toast("برد!", "success"); coinEl.style.background = "var(--success)"; app.updateUI(); 
            } else { 
                user.coins -= bet; app.save(); app.toast("باخت!", "error"); coinEl.style.background = "var(--danger)"; app.updateUI(); 
            }
        }, 1000);
    },
    rps: (area) => {
        document.getElementById('game-title').textContent = "سنگ کاغذ قیچی";
        area.innerHTML = `<div style="font-size:3rem; margin-bottom:20px" id="rps-res">🤖</div><div style="display:flex; gap:10px;"><button class="btn btn-primary" onclick="game.playRps('rock')"><i class="fas fa-hand-rock"></i></button><button class="btn btn-primary" onclick="game.playRps('paper')"><i class="fas fa-hand-paper"></i></button><button class="btn btn-primary" onclick="game.playRps('scissors')"><i class="fas fa-hand-scissors"></i></button></div>`;
    },
    playRps: (choice) => {
        const opts = ['rock', 'paper', 'scissors'];
        const bot = opts[Math.floor(Math.random() * 3)];
        const icons = { rock: 'hand-rock', paper: 'hand-paper', scissors: 'hand-scissors' };
        document.getElementById('rps-res').innerHTML = `<i class="fas fa-${icons[bot]}"></i>`;
        if(choice === bot) app.toast("مساوی!", "info");
        else if ((choice === 'rock' && bot === 'scissors') || (choice === 'paper' && bot === 'rock') || (choice === 'scissors' && bot === 'paper')) { game.reward(50); app.toast("بردی!", "success"); }
        else app.toast("باختی!", "error");
    },
    slots: (area) => {
        document.getElementById('game-title').textContent = "کازینو اسلات";
        area.innerHTML = `<div style="display:flex; gap:10px; font-size:3rem; background:#000; padding:10px; border-radius:10px; margin-bottom:20px;"><div id="slot1">🍒</div><div id="slot2">🍒</div><div id="slot3">🍒</div></div><button class="btn btn-accent" onclick="game.spinSlots()">چرخش (20 سکه)</button>`;
    },
    spinSlots: () => {
        if(user.coins < 20) return app.toast("سکه کافی نیست!", "error");
        user.coins -= 20; app.save(); document.getElementById('header-coins').textContent = Math.floor(user.coins);
        const items = ['🍒', '🍋', '🍇', '💎', '7️⃣']; let spins = 0;
        gameInterval = setInterval(() => {
            spins++;
            document.getElementById('slot1').textContent = items[Math.floor(Math.random()*items.length)];
            document.getElementById('slot2').textContent = items[Math.floor(Math.random()*items.length)];
            document.getElementById('slot3').textContent = items[Math.floor(Math.random()*items.length)];
            if(spins > 10) {
                clearInterval(gameInterval);
                const s1 = document.getElementById('slot1').textContent; const s2 = document.getElementById('slot2').textContent; const s3 = document.getElementById('slot3').textContent;
                if(s1 === s2 && s2 === s3) { let win = s1 === '💎' ? 500 : (s1 === '7️⃣' ? 300 : 100); game.reward(win); app.toast(`جک‌پات! +${win}`, "success"); } 
                else if (s1 === s2 || s2 === s3 || s1 === s3) { game.reward(30); app.toast("دوتا جور شد!", "success"); } 
                else app.toast("پوچ!", "error");
            }
        }, 100);
    },
    whack: (area) => {
        document.getElementById('game-title').textContent = "موش‌کوب (امتیاز بگیر)";
        let score = 0; let html = '<div class="mole-grid">'; for(let i=0; i<9; i++) html += `<div class="mole-hole" id="hole-${i}"><div class="mole" id="mole-${i}" onclick="game.hitMole(${i})"><i class="fas fa-meh"></i></div></div>`; html += '</div>'; area.innerHTML = html;
        game.moleScore = 0; let timeLeft = 15;
        gameInterval = setInterval(() => {
            timeLeft--; document.getElementById('game-status').textContent = `زمان: ${timeLeft} | امتیاز: ${game.moleScore}`;
            let r = Math.floor(Math.random()*9); let m = document.getElementById(`mole-${r}`); m.classList.add('up'); setTimeout(() => m.classList.remove('up'), 700);
            if(timeLeft <= 0) { clearInterval(gameInterval); if(game.moleScore > 0) game.reward(game.moleScore * 10); else app.toast("هیچی نزدی!", "error"); }
        }, 800);
        game.hitMole = (i) => { let m = document.getElementById(`mole-${i}`); if(m.classList.contains('up')) { m.classList.remove('up'); game.moleScore++; audioSys.playTone(400, 'square', 0.1); document.getElementById('game-status').textContent = `زمان: ${timeLeft} | امتیاز: ${game.moleScore}`; } }
    },
    hangman: (area) => {
        document.getElementById('game-title').textContent = "حدس کلمه فارسی";
        const words = ["امپراتور", "سکه", "گیمر", "اژدها", "برنده", "ایران", "کدنویسی"];
        let word = words[Math.floor(Math.random()*words.length)]; let guessed = []; let lives = 6;
        const updateDisplay = () => {
            let disp = word.split('').map(char => guessed.includes(char) ? char : "_").join(" ");
            document.getElementById('hm-word').textContent = disp; document.getElementById('hm-lives').textContent = "❤️".repeat(lives);
            if(!disp.includes("_")) { game.reward(150); setTimeout(game.close, 1000); }
            if(lives === 0) { app.toast(`باختی! کلمه: ${word}`, "error"); setTimeout(game.close, 2000); }
        };
        area.innerHTML = `<h2 id="hm-word" style="letter-spacing:5px; margin-bottom:20px;"></h2><div id="hm-lives"></div><div id="hm-keys" style="margin-top:20px; display:flex; flex-wrap:wrap; gap:5px; justify-content:center; max-width:300px"></div>`;
        const alpha = "ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی"; const keysDiv = document.getElementById('hm-keys');
        alpha.split('').forEach(char => {
            let b = document.createElement('button'); b.className = "btn"; b.style.padding = "5px 10px"; b.textContent = char;
            b.onclick = () => { b.disabled = true; if(word.includes(char)) { guessed.push(char); b.style.background = "var(--success)"; } else { lives--; b.style.background = "var(--danger)"; } updateDisplay(); };
            keysDiv.appendChild(b);
        }); updateDisplay();
    },
    simon: (area) => {
        document.getElementById('game-title').textContent = "سیمون (حافظه رنگ)";
        area.innerHTML = `<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; width:200px; height:200px;"><div id="c-0" style="background:red; opacity:0.5; border-radius:10px;" onclick="game.simonClick(0)"></div><div id="c-1" style="background:blue; opacity:0.5; border-radius:10px;" onclick="game.simonClick(1)"></div><div id="c-2" style="background:green; opacity:0.5; border-radius:10px;" onclick="game.simonClick(2)"></div><div id="c-3" style="background:yellow; opacity:0.5; border-radius:10px;" onclick="game.simonClick(3)"></div></div>`;
        game.seq = []; game.usrSeq = []; game.simonRound = 0;
        game.playSeq = () => {
            game.usrSeq = []; let i = 0; document.getElementById('game-status').textContent = "نگاه کن...";
            gameInterval = setInterval(() => {
                if(i >= game.seq.length) { clearInterval(gameInterval); document.getElementById('game-status').textContent = "نوبت تو!"; return; }
                game.flash(game.seq[i]); i++;
            }, 800);
        };
        game.flash = (id) => { let el = document.getElementById(`c-${id}`); el.style.opacity = 1; audioSys.playTone(200 + (id*100), 'sine', 0.2); setTimeout(() => el.style.opacity = 0.5, 400); };
        game.simonClick = (id) => {
            if(document.getElementById('game-status').textContent !== "نوبت تو!") return;
            game.flash(id); game.usrSeq.push(id);
            if(game.usrSeq[game.usrSeq.length-1] !== game.seq[game.usrSeq.length-1]) { app.toast("اشتباه!", "error"); setTimeout(game.close, 1000); return; }
            if(game.usrSeq.length === game.seq.length) { game.simonRound++; game.reward(20); setTimeout(game.nextRound, 1000); }
        };
        game.nextRound = () => { game.seq.push(Math.floor(Math.random()*4)); game.playSeq(); }; game.nextRound();
    },
    snake: (area) => {
        document.getElementById('game-title').textContent = "مار بازی کلاسیک";
        area.innerHTML = '<canvas id="snakeCanvas" width="300" height="300" class="snake-canvas"></canvas><div style="margin-top:10px; display:flex; gap:10px;"><button class="btn" onclick="game.sDir={x:0,y:-1}">⬆️</button><button class="btn" onclick="game.sDir={x:0,y:1}">⬇️</button><button class="btn" onclick="game.sDir={x:-1,y:0}">⬅️</button><button class="btn" onclick="game.sDir={x:1,y:0}">➡️</button></div>';
        const canvas = document.getElementById('snakeCanvas'); const ctx = canvas.getContext('2d');
        const gridSize = 15; const tileCount = 20; let snake = [{x: 10, y: 10}]; let food = {x: 15, y: 15}; game.sDir = {x: 0, y: 0}; let score = 0;
        gameInterval = setInterval(() => {
            if(!document.getElementById('snakeCanvas')) { clearInterval(gameInterval); return; }
            if(game.sDir.x === 0 && game.sDir.y === 0) { ctx.fillStyle = 'black'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.fillStyle = 'white'; ctx.fillText("حرکت کن!", 120, 150); return; }
            let head = {x: snake[0].x + game.sDir.x, y: snake[0].y + game.sDir.y};
            if(head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || snake.some(s => s.x === head.x && s.y === head.y)) { clearInterval(gameInterval); if(score > 0) game.reward(score * 5); else app.toast("باختی!", "error"); return; }
            snake.unshift(head);
            if(head.x === food.x && head.y === food.y) { score++; audioSys.playTone(600, 'square', 0.05); food = {x: Math.floor(Math.random()*tileCount), y: Math.floor(Math.random()*tileCount)}; } else { snake.pop(); }
            ctx.fillStyle = 'black'; ctx.fillRect(0,0,canvas.width,canvas.height);
            ctx.fillStyle = 'lime'; snake.forEach(s => ctx.fillRect(s.x*gridSize, s.y*gridSize, gridSize-2, gridSize-2));
            ctx.fillStyle = 'red'; ctx.fillRect(food.x*gridSize, food.y*gridSize, gridSize-2, gridSize-2);
            document.getElementById('game-status').textContent = `امتیاز: ${score}`;
        }, 150);
    },
    ttt: (area) => {
        document.getElementById('game-title').textContent = "دوز (X/O)";
        area.innerHTML = `<div id="ttt-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:5px; width:200px;"></div>`;
        const grid = document.getElementById('ttt-grid'); let board = Array(9).fill(null);
        const checkWin = (b) => { const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]; for(let c of wins) { if(b[c[0]] && b[c[0]] === b[c[1]] && b[c[0]] === b[c[2]]) return b[c[0]]; } return b.includes(null) ? null : 'draw'; };
        const render = () => { grid.innerHTML = ''; board.forEach((c, i) => { grid.innerHTML += `<button class="btn" style="height:60px; font-size:1.5rem; background:${c==='X'?'#e74c3c':(c==='O'?'#3498db':'#333')}" onclick="game.tttMove(${i})">${c || ''}</button>`; }); };
        game.tttMove = (i) => {
            if(board[i] || checkWin(board)) return; board[i] = 'X'; render();
            let w = checkWin(board); if(w) return endGame(w);
            setTimeout(() => { let empty = board.map((v,k)=>v===null?k:null).filter(v=>v!==null); if(empty.length > 0) { board[empty[Math.floor(Math.random()*empty.length)]] = 'O'; render(); w = checkWin(board); if(w) endGame(w); } }, 500);
        };
        const endGame = (w) => { if(w === 'X') { game.reward(100); app.toast("بردی!", "success"); } else if (w === 'O') { app.toast("باختی!", "error"); } else { app.toast("مساوی!", "info"); } setTimeout(game.close, 1500); };
        render();
    },
    reaction: (area) => {
        document.getElementById('game-title').textContent = "تست سرعت واکنش";
        area.innerHTML = `<div id="react-box" style="width:100%; height:200px; background:#e74c3c; display:flex; justify-content:center; align-items:center; border-radius:10px; font-size:1.5rem; cursor:none;">صبر کن...</div>`;
        const box = document.getElementById('react-box'); let startTime = 0; let state = 'waiting';
        let timeout = setTimeout(() => { if(!document.getElementById('game-modal').offsetParent) return; state = 'ready'; box.style.background = '#2ecc71'; box.textContent = "بزن!"; startTime = Date.now(); }, 2000 + Math.random() * 3000);
        box.onclick = () => {
            if(state === 'waiting') { clearTimeout(timeout); box.textContent = "خیلی زود زدی!"; box.style.background = "#34495e"; setTimeout(() => game.reaction(area), 1000); }
            else if (state === 'ready') { state = 'clicked'; const ms = Date.now() - startTime; box.textContent = `${ms} میلی‌ثانیه`; if(ms < 400) game.reward(100); else app.toast("کمی کند بودی (زیر ۴۰۰ خوبه)", "info"); setTimeout(game.close, 2000); }
        };
    }
};

/* --- Social --- */
const social = {
    renderLeaderboard: () => {
        const fakeUsers = [{name: "امیر", coins: 999999}, {name: user.name, coins: user.coins}].sort((a,b)=>b.coins-a.coins);
        document.getElementById('leaderboard-body').innerHTML = fakeUsers.map((u,i)=>`<tr><td>#${i+1}</td><td>${u.name}</td><td>${Math.floor(u.coins)}</td></tr>`).join('');
    },
    loadChat: () => {},
    joinClan: (clanName) => {
        user.clan = clanName;
        app.save();
        app.toast(`شما به کلن ${clanName} پیوستید!`, "success");
    },
    sendMessage: () => {
        const inp = document.getElementById('chat-input'); const msg = inp.value.trim();
        if(msg) {
            if(msg === '/money') { app.addCoins(1000); app.toast("کد تقلب فعال شد!", "success"); }
            else if(msg === '/rich') { app.addCoins(10000); app.toast("خیلی پولدار شدی!", "success"); }
            else if(msg === '/level') { user.xp += 500; app.updateUI(); app.toast("سطح افزایش یافت!", "success"); }
            else if(msg === '/godmode') { user.skills.click = 100; app.save(); app.toast("قدرت خداگونه!", "success"); }
            else if(msg === '/crypto') { user.marketInventory.btc += 1; app.save(); app.toast("بیت‌کوین هدیه!", "success"); }
            else social.appendMsg(msg, 'user');
            inp.value = "";
        }
    },
    appendMsg: (text, type) => {
        const box = document.getElementById('chat-box');
        const div = document.createElement('div'); div.className = `chat-msg ${type}`;
        const clanTag = user.clan ? `[${user.clan}] ` : '';
        div.textContent = (type === 'user' ? clanTag + user.name : 'Bot') + ": " + text;
        div.style.padding = "5px";
        div.style.marginBottom = "5px";
        div.style.borderRadius = "5px";
        div.style.background = type === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.5)';
        box.appendChild(div); box.scrollTop = box.scrollHeight;
    },
    addBotMessage: () => {
        if(Math.random()>0.7) social.appendMsg(["کسی آنلاینه؟","بیت‌کوین بخر!","اژدها اومد!"].sort(()=>Math.random()-0.5)[0], 'bot');
    }
};

/* --- Expansion Pack Logic --- */
const expansion = {
    currentWeather: 'sun',
    
    weatherTick: () => {
        if(Math.random() > 0.6) {
            expansion.currentWeather = expansion.currentWeather === 'sun' ? 'rain' : 'sun';
            const layer = document.getElementById('weather-layer');
            const banner = document.getElementById('weather-banner');
            const text = document.getElementById('weather-text');
            
            if(expansion.currentWeather === 'rain') {
                layer.style.display = 'block';
                layer.innerHTML = '';
                for(let i=0; i<50; i++) {
                    const d = document.createElement('div');
                    d.className = 'rain-drop';
                    d.style.left = Math.random() * 100 + '%';
                    d.style.animationDuration = (0.5 + Math.random() * 0.5) + 's';
                    d.style.animationDelay = Math.random() * 2 + 's';
                    layer.appendChild(d);
                }
                banner.classList.remove('hidden');
                text.textContent = "باران می‌بارد! (سرعت ماینینگ 50٪، اما XP بازی‌ها 2 برابر!)";
                app.toast("هوا بارانی شد!", "info");
            } else {
                layer.style.display = 'none';
                banner.classList.add('hidden');
                app.toast("آفتاب درآمد!", "success");
            }
        }
    },

    upgradePet: (petId, cost) => {
        if(user.coins >= cost) {
            user.coins -= cost;
            user.petLevels[petId]++;
            app.save();
            app.toast("حیوان خانگی ارتقا یافت! (سطح " + user.petLevels[petId] + ")", "success");
            app.updateUI();
        } else {
            app.toast("سکه کافی نیست!", "error");
        }
    },
    evolvePet: (petId) => {
        if(user.petLevels[petId] >= 10) {
            app.toast("حداکثر سطح!", "error");
            return;
        }
        const cost = 5000;
        if(user.coins >= cost) {
            user.coins -= cost;
            user.petLevels[petId] += 5; // Big jump
            app.save();
            app.toast("حیوان خانگی تکامل یافت!", "success");
            app.updateUI();
        } else {
            app.toast("برای تکامل 5000 سکه لازم است", "error");
        }
    },

    updatePetUI: () => { },

    redeemCode: () => {
        const input = document.getElementById('promo-code');
        const code = input.value.trim().toUpperCase();
        
        if(user.redeemedCodes.includes(code)) return app.toast("این کد قبلا استفاده شده!", "error");
        
        let valid = false;
        if(code === 'AMIR') { app.addCoins(1000); valid=true; }
        if(code === 'ULTRA') { user.xp += 1000; valid=true; }
        if(code === 'START') { app.addCoins(200); valid=true; }
        if(code === 'RPG') { rpg.addItem('wood', 10); rpg.addItem('stone', 10); valid=true; app.toast("مواد اولیه دریافت شد!", "success"); }

        if(valid) {
            user.redeemedCodes.push(code);
            app.save();
            if(!valid) app.toast("کد با موفقیت ثبت شد!", "success"); // Fixed logic
            if(code !== 'RPG') app.toast("کد با موفقیت ثبت شد!", "success");
            audioSys.success();
            input.value = "";
        } else {
            app.toast("کد نامعتبر است", "error");
            audioSys.error();
        }
    },

    playDarkGamble: (amount) => {
        if(amount === 'all') amount = user.coins;
        if(user.coins < amount || amount <= 0) return app.toast("موجودی کافی نیست!", "error");
        
        if(!confirm(`آیا مطمئنی؟ ریسک ${amount} سکه در منطقه ممنوعه؟`)) return;

        if(Math.random() > 0.5) {
            app.addCoins(amount); 
            app.toast(`بردی! ${amount} سکه سود کردی!`, "success");
            audioSys.success();
        } else {
            user.coins -= amount;
            app.save();
            app.toast("باختی... همه چیز رفت.", "error");
            audioSys.error();
        }
    },

    mixPotions: () => {
        if(user.coins < 500) return app.toast("نیاز به 500 سکه", "error");
        user.coins -= 500;
        
        const outcomes = ['c_luck', 'c_double', 'fail', 'fail'];
        const res = outcomes[Math.floor(Math.random() * outcomes.length)];
        
        if(res === 'fail') {
            app.toast("ترکیب منفجر شد! (چیزی نگرفتی)", "error");
            audioSys.error();
        } else {
            const item = shopItems.consumables.find(x => x.id === res);
            user.activeEffects[res] = Date.now() + item.duration;
            app.toast(`موفقیت! معجون ${item.name} ساخته و مصرف شد!`, "success");
            audioSys.success();
        }
        app.save();
    }
};

/* =========================================
   بخش آنلاین: اتصال به Firebase و مدیریت داده‌ها
   ========================================= */

// 1. تنظیمات اتصال (اطلاعات اختصاصی شما)
const firebaseConfig = {
    apiKey: "AIzaSyBIApAV_JGXBwOJ0JamDSPFfuxHEj69jtM",
    authDomain: "my-amir-game.firebaseapp.com",
    databaseURL: "https://my-amir-game-default-rtdb.firebaseio.com",
    projectId: "my-amir-game",
    storageBucket: "my-amir-game.firebasestorage.app",
    messagingSenderId: "426839735643",
    appId: "1:426839735643:web:7523306c434945dfa5ee7e",
    measurementId: "G-EWF2FZNF6Y"
};

// 2. راه‌اندازی فایربیس
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
let currentUserID = null;

// 3. سیستم مدیریت آنلاین بازی
const onlineGame = {
    // --- ورود و ثبت نام ---
    login: () => {
        const email = document.getElementById('email-in').value;
        const pass = document.getElementById('pass-in').value;
        if (!email || !pass) return alert("لطفا ایمیل و رمز را وارد کنید!");

        auth.signInWithEmailAndPassword(email, pass)
            .catch((error) => {
                // اگر کاربر وجود نداشت، خودکار می‌سازیم
                if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                    auth.createUserWithEmailAndPassword(email, pass)
                        .then(() => alert("حساب شما ساخته شد و وارد شدید!"))
                        .catch((e) => alert("خطا در ساخت حساب: " + e.message));
                } else {
                    alert("خطا: " + error.message);
                }
            });
    },

    logout: () => auth.signOut(),

    // --- ذخیره و بازیابی اطلاعات ---
    saveToCloud: () => {
        if (currentUserID && typeof user !== 'undefined') {
            db.ref('users/' + currentUserID).update({
                email: auth.currentUser.email,
                coins: user.coins, // مقدار سکه از متغیر بازی شما
                lastSeen: Date.now()
            });
        }
    },

    loadFromCloud: () => {
        db.ref('users/' + currentUserID).once('value', (snapshot) => {
            const data = snapshot.val();
            if (data && data.coins) {
                user.coins = data.coins; // برگرداندن سکه‌ها
                if(app.updateUI) app.updateUI(); // به‌روزرسانی ظاهر بازی
                app.toast("بازیابی اطلاعات از سرور موفق بود!", "success");
            }
        });
    },

    // --- چت ---
    sendMessage: () => {
        const text = document.getElementById('chat-input').value;
        if (!text.trim()) return;
        
        const name = auth.currentUser.email.split('@')[0];
        db.ref('chat').push({
            sender: name,
            msg: text,
            time: Date.now()
        });
        document.getElementById('chat-input').value = '';
    },

    setupListeners: () => {
        // دریافت پیام‌های چت
        db.ref('chat').limitToLast(20).on('child_added', (snap) => {
            const data = snap.val();
            const box = document.getElementById('chat-box');
            box.innerHTML += `<div class="chat-msg">
                <span class="sender-name">${data.sender}:</span> 
                <span style="color: white;">${data.msg}</span>
            </div>`;
            box.scrollTop = box.scrollHeight;
        });

        // دریافت لیست برترین‌ها
        db.ref('users').orderByChild('coins').limitToLast(10).on('value', (snap) => {
            const list = document.getElementById('leaderboard-list');
            list.innerHTML = '';
            let players = [];
            snap.forEach(child => players.push(child.val()));
            
            // مرتب‌سازی از زیاد به کم
            players.sort((a, b) => b.coins - a.coins);
            
            players.forEach((p, index) => {
                list.innerHTML += `<div class="leaderboard-item">
                    <span>${index + 1}. ${p.email.split('@')[0]}</span>
                    <span style="color: gold;">${p.coins.toLocaleString()} 💰</span>
                </div>`;
            });
        });
    }
};

// 4. گوش دادن به تغییر وضعیت کاربر (ورود/خروج)
auth.onAuthStateChanged((userParam) => {
    if (userParam) {
        // کاربر وارد شد
        currentUserID = userParam.uid;
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('profile-section').classList.remove('hidden');
        document.getElementById('player-email').innerText = userParam.email;
        
        // بارگذاری اطلاعات و فعال‌سازی چت
        onlineGame.loadFromCloud();
        onlineGame.setupListeners();
    } else {
        // کاربر خارج شد
        currentUserID = null;
        document.getElementById('auth-section').classList.remove('hidden');
        document.getElementById('profile-section').classList.add('hidden');
    }
});


window.onload = app.init;
