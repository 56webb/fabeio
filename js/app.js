document.addEventListener('DOMContentLoaded', () => {
  // ===== Google 試算表發佈網址 =====
  const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQKsRU4MxrVDOZOUosa5bUMDZG8w9kHqy_iPEKrGD6dB9Q_8SJcfPr7pT9hVLXJuUXbO6Z0o0TsX5Ns/pub?output=csv';

  // ===== 狀態管理與防錯處理 =====
  let initialNotes = JSON.parse(localStorage.getItem('franceTripNotes'));
  if (!Array.isArray(initialNotes)) initialNotes = [];

  let initialTodos = JSON.parse(localStorage.getItem('franceTripTodos'));
  if (!Array.isArray(initialTodos)) initialTodos = [];

  const state = {
    notes: initialNotes,
    todos: initialTodos
  };

  function saveTodos() {
    localStorage.setItem('franceTripTodos', JSON.stringify(state.todos));
  }

  // ===== 行程資料 (預設 Fallback 行程 - 與最新試算表對齊) =====
  let itineraryData = [
    { date: '9/15', time: '23:30', location: '桃園', type: 'transit', desc: '準備出發，飛往巴黎', detail: '記得攜帶護照、網卡、轉接頭。建議提前 3 小時抵達機場。' },
    { date: '9/16', time: '07:55', location: '戴高樂', type: 'transit', desc: '抵達戴高樂，前往購物村', detail: '辦理入境手續、領取行李，購買交通票券或加值。第一晚入住 Zenitude Hôtel-Résidences Chessy，下午逛河谷購物村 (La Vallée Village)。' },
    { date: '9/17', location: '迪士尼', type: 'disney', desc: '迪士尼雙園遊玩', detail: '入住 Zenitude Hôtel-Résidences Chessy (第 2 晚)。建議下載 Disneyland Paris App 掌握排隊時間，預約餐廳。晚上別錯過煙火與無人機燈光秀！💡可對照後半部「四、 巴黎迪士尼限定法國製紀念品」清單去精品商店尋寶！' },
    { date: '9/18', location: '迪士尼', type: 'disney', desc: '迪士尼雙園 ➔ 巴黎市區', detail: '入住 Zenitude Hôtel-Résidences Chessy (第 3 晚)。繼續攻略未完成的設施或看遊行，可到專屬商店尋找法國製聯名小物。傍晚返回巴黎市區辦理入住。' },
    { date: '9/19', location: '巴黎', type: 'paris', desc: '巴黎市區觀光 (通票Day1)', detail: '初探巴黎，博物館通票六天開通第一天！可安排羅浮宮、塞納河畔漫步或艾菲爾鐵塔。' },
    { date: '9/20', location: '巴黎', type: 'paris', desc: '巴黎深度遊 (通票Day2)', detail: '使用博物館通票。可安排奧塞美術館、蒙馬特高地、聖心堂。' },
    { date: '9/21', location: '巴黎', type: 'paris', desc: '巴黎深度遊 (通票Day3)', detail: '使用博物館通票。可安排凱旋門、香榭麗舍大道、精品購物。' },
    { date: '9/22', location: '巴黎', type: 'paris', desc: '巴黎深度遊 (通票Day4)', detail: '使用博物館通票。可安排瑪黑區特色小店、龐畢度中心。' },
    { date: '9/23', location: '巴黎', type: 'paris', desc: '巴黎 ➔ 諾曼地/凡爾賽一日遊', detail: '使用博物館通票。上：凡爾賽宮 莫內花園 盧昂 埃特爾塔 諾曼地。凡爾賽宮一日遊，感受皇家奢華。' },
    { date: '9/24', location: '巴黎', type: 'paris', desc: '巴黎 ➔ 羅亞爾河城堡一日遊', detail: '使用博物館通票。下：楓丹白露 香波爾城堡 子爵。晚上住蒙帕納斯車站附近，以利明早搭車。' },
    { date: '9/25', time: '06:48', location: '聖米歇爾', type: 'michel', desc: '前往聖米歇爾山', detail: '🚄 <strong>SNCF 跨城火車 (Paris Montparnasse ➔ Rennes)</strong><br>• 班次：✅ <strong>已訂票 06:48</strong> (訂位代碼：<strong>4WCP2R</strong>，2 人共 68.00 €，乘車人：Chang)<br>• 車程：約 1.5 - 2 小時<br><br>🚌 <strong>Keolis 接駁公車 (Rennes ➔ 聖米歇爾山)</strong><br>• 去程：08:45 / 13:00<br>• 回程：11:35 / 17:00<br>• 車程：約 1.5 小時 (來回 25€，可線上或現場購票)<br>• <a href="https://keolis-armor.com/en/5ey-Timetables-of-the-lines.html" target="_blank" style="color:var(--c-accent); text-decoration:underline;">🔗 2026 公車時刻表查詢</a><br><br><strong>🌊 今日潮汐資訊 (9/25)</strong><br>🔸 滿潮 (Pleine mer)：07:08、19:26 (大潮係數 77/82)<br>🔹 乾潮 (Basse mer)：01:34、13:54' },
    { date: '9/26', location: '聖米歇爾', type: 'michel', desc: '早上聖米歇爾，晚上雷恩', detail: '入住雷恩飯店。參觀修道院，品嚐普拉嬤嬤烘蛋。<br>💡 <em>「下山走大街，上山走城牆」</em> 聰明路線避開擁擠人潮。<br><br><strong>🌊 今日潮汐資訊 (9/26)</strong><br>🔸 滿潮 (Pleine mer)：07:45、20:02 (大潮係數 87/92 - 注意漲退潮變化)<br>🔹 乾潮 (Basse mer)：02:15、14:35' },
    { date: '9/27', location: '聖馬洛', type: 'michel', desc: '聖馬洛海盜城一日遊', detail: '可由雷恩前往海盜城聖馬洛一日遊。漫步古城牆，吹海風，品嚐蕎麥可麗餅。⚠️ 修道院門票記得先買好。<br><br><strong>🌊 今日潮汐資訊 (9/27)</strong><br>🔸 滿潮 (Pleine mer)：08:20、20:37 (大潮係數 95/97 - 超大潮，景觀壯麗)<br>🔹 乾潮 (Basse mer)：02:56、15:14' },
    { date: '9/28', location: '巴黎', type: 'paris', desc: '巴黎深度遊與慢活', detail: '漫步巴黎街頭，享受浪漫氛圍。' },
    { date: '9/29', location: '巴黎', type: 'paris', desc: '巴黎深度遊與購物', detail: '安排採購精品與伴手禮，送禮自用兩相宜。' },
    { date: '9/30', location: '巴黎', type: 'paris', desc: '巴黎慢活自由行', detail: '保留彈性的空白天，漫步巴黎街角。' },
    { date: '10/1', location: '巴黎', type: 'paris', desc: '巴黎深度遊', detail: '拉丁區、萬神殿、盧森堡公園、花神咖啡館。' },
    { date: '10/2', location: '巴黎', type: 'paris', desc: '巴黎深度遊', detail: '塞納河畔漫步、左岸咖啡、莎士比亞書店。' },
    { date: '10/3', location: '巴黎', type: 'paris', desc: '巴黎深度遊', detail: '塞納河遊船晚餐，欣賞巴黎閃耀夜景。' },
    { date: '10/4', location: '巴黎', type: 'paris', desc: '巴黎深度遊', detail: '自由活動，體驗 Picard 冷凍食品或逛當地市集。' },
    { date: '10/5', location: '巴黎', type: 'paris', desc: '巴黎最後巡禮', detail: '確認行李重量，整理退稅單據。最後的美食饗宴。' },
    { date: '10/6', time: '11:20', location: '戴高樂', type: 'transit', desc: '前往機場準備搭機', detail: '建議提前 4 小時抵達機場辦理退稅手續，排隊人潮通常很多。' },
    { date: '10/7', time: '06:40', location: '桃園', type: 'transit', desc: '平安抵達台灣', detail: '旅途結束，帶著滿滿的回憶回家！' }
  ];


  // ===== 旅遊貼士資料 (含解析資料) =====
  const tipsData = {
    '交通與通訊': [
      { icon: '🎫', title: '交通票券 (Navigo)', content: 'Navigo 周卡 (22.8歐+卡費5歐) 可無限搭乘1-5圈，需自備1吋大頭照。加值時間為周一至四，周末買青年票。另有 Navigo Easy 可用手機加值。' },
      { icon: '📱', title: '網路與導航', content: '推薦下載 Citymapper，提供詳細地鐵與公車轉乘資訊，並會顯示有無電梯，搬行李必備！' }
    ],
    '安全與須知': [
      { icon: '💰', title: '安全與防竊', content: '貴重物品不露白，包包拉鍊拉上並往前背。若有陌生人搭訕填問卷或幫忙買票，請直接無視快步走過。' },
      { icon: '🗣️', title: '禮貌用語', content: '開口前務必先說 Bonjour (您好)，服務結束後說 Merci (謝謝)，這在法國是非常重要的基本禮貌！' }
    ],
    '景點與文化': [
      { icon: '🏛️', title: '博物館免費日', content: '每月第一週日多數博物館免費 (如：奧塞、龐畢度)。羅浮宮每週二休館，每月第一週六晚上免費。請提前上官網預約。' }
    ]
  };

  // ===== 美食與景點推薦 (來自解析資料) =====
  const recommendationsData = {
    '平價美食與餐廳': [
      { icon: '🥖', title: 'Au Paradis du Gourmand', content: '冠軍長棍麵包 (1.2歐)、烤雞。地址: 156 rue Raymond Losserand' },
      { icon: '🍲', title: 'La Petite Hostellerie', content: '聖母院旁高CP值餐廳。10歐套餐 (前菜+主餐+甜點)，推洋蔥湯、紅酒燉牛肉。' },
      { icon: '🧊', title: 'Picard 冷凍食品', content: '法國到處都有，大推 Paella Valenciana 海鮮飯 (5.4歐)。' }
    ],
    '人氣海鮮與特色小吃': [
      { icon: '🦐', title: 'Pedra Alta', content: 'CP值極高的葡式海鮮盤 (約48.4歐)，適合2-3人分享，吃不完可打包。' },
      { icon: '🥙', title: 'L\'As du Fallafel', content: '瑪黑區薔薇街的猶太口袋餅，素食丸子口味 (6歐)。' },
      { icon: '🥐', title: 'Pierre Hermé', content: '推薦玫瑰可頌與馬卡龍！(限特定分店，如: 72 Rue Bonaparte)' }
    ],
    '特殊體驗': [
      { icon: '🌊', title: '聖米歇爾山潮汐', content: '已整合 2026 年潮汐表，大潮日有機會看到奇景「Mascaret (潮湧)」。' }
    ]
  };

  // ===== 資料整合紀錄 =====
  const dataRegistry = [
    { file: 'st_michel_tide_2026.pdf', url: 'data/st_michel_tide_2026.pdf', added: '2026-04-26', integrated: '2026-04-26', summary: '聖米歇爾山 2026 潮汐表與大潮資訊' },
    { file: 'rennes_st_michel_bus_2026.pdf', url: 'data/rennes_st_michel_bus_2026.pdf', added: '2026-04-26', integrated: '2026-04-26', summary: '2026 年雷恩與聖米歇爾山接駁巴士時刻表' },
    { file: 'SNCF_ticket_9_25.png', url: 'data/SNCF_ticket_9_25.png', added: '2026-04-26', integrated: '2026-04-26', summary: 'SNCF 跨城火車票訂票憑證 (巴黎 ➔ 雷恩)：06:48 出發，訂位代碼 4WCP2R' },
    { file: 'paris_safety_tips.jpg', url: 'data/paris_safety_tips.jpg', added: '2026-04-10', integrated: '2026-04-26', summary: '巴黎旅遊禮儀與安全防竊守則' },
    { file: 'paris_food_cheap.jpg', url: 'data/paris_food_cheap.jpg', added: '2026-04-10', integrated: '2026-04-26', summary: '平價美食: 冠軍麵包店、Picard、Top Sushi' },
    { file: 'paris_food_hostellerie.jpg', url: 'data/paris_food_hostellerie.jpg', added: '2026-04-10', integrated: '2026-04-26', summary: '平價餐廳: La Petite Hostellerie (聖母院旁)' },
    { file: 'paris_food_popular.jpg', url: 'data/paris_food_popular.jpg', added: '2026-04-10', integrated: '2026-04-26', summary: '人氣餐廳: OSMOZ, Leon 淡菜, Pedra Alta, 可麗餅' },
    { file: 'paris_dessert_must_eat.jpg', url: 'data/paris_dessert_must_eat.jpg', added: '2026-04-10', integrated: '2026-04-26', summary: '必吃點心: L\'As du Fallafel, Pierre Herme' },
    { file: 'paris_museum_hours.jpg', url: 'data/paris_museum_hours.jpg', added: '2026-04-10', integrated: '2026-04-26', summary: '巴黎各大博物館營業時間與免費參觀日整理' },
    { file: 'paris_navigo_pass.jpg', url: 'data/paris_navigo_pass.jpg', added: '2026-04-10', integrated: '2026-04-26', summary: '交通攻略: Navigo Pass 周卡使用規則與範圍' },
    { file: 'paris_transit_tips.jpg', url: 'data/paris_transit_tips.jpg', added: '2026-04-10', integrated: '2026-04-26', summary: '交通攻略: Navigo Easy、週末青年票、Citymapper' }
  ];

  // ===== Undo Toast 共用函式 =====
  // 傳入: label(描述文字), onCommit(時間到後正式刪除), onUndo(按復原後還原)
  function showUndoToast(label, onCommit, onUndo) {
    const DELAY = 60 * 1000; // 60 秒
    const container = document.getElementById('undoToastContainer');

    // 建立 toast 元素
    const toast = document.createElement('div');
    toast.className = 'undo-toast';
    toast.innerHTML = `
      <div class="undo-toast-msg">
        <span class="undo-toast-label">已刪除</span>
        <span class="undo-toast-title">${label}</span>
      </div>
      <span class="undo-countdown">60</span>
      <button type="button" class="undo-btn">↩ 復原</button>
      <div class="undo-toast-progress"></div>
    `;
    container.appendChild(toast);

    // 倒數顯示
    let remaining = 60;
    const countdownEl = toast.querySelector('.undo-countdown');
    const ticker = setInterval(() => {
      remaining--;
      countdownEl.textContent = remaining;
      if (remaining <= 0) clearInterval(ticker);
    }, 1000);

    // 時間到 → 正式刪除
    const commitTimer = setTimeout(() => {
      clearInterval(ticker);
      dismissToast(toast);
      onCommit();
    }, DELAY);

    // 復原按鈕
    toast.querySelector('.undo-btn').addEventListener('click', () => {
      clearTimeout(commitTimer);
      clearInterval(ticker);
      dismissToast(toast);
      onUndo();
    });

    function dismissToast(el) {
      el.classList.add('toast-hiding');
      setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 350);
    }
  }

  // ===== 訂位資料 =====
  const bookings = [
    {
      category: 'transit',
      icon: '🚄',
      status: 'confirmed',
      title: 'SNCF 跨城火車',
      subtitle: 'Paris Montparnasse → Rennes',
      date: '2026/09/25 (周五)',
      time: '06:48 出發',
      confirmCode: '4WCP2R',
      price: '68.00 €',
      passengers: '2 人 (Chang)',
      note: '請提前 30 分鐘到月台，攜帶護照備查。車程約 1.5–2 小時。'
    }
  ];

  // ===== 初始化功能 =====
  initNavbar();
  initCountdown();
  renderRecommendations();
  renderTips();
  renderBookings();
  renderRegistry();
  initNotes();
  initBackToTop();

  // 非同步載入 Google 試算表行程並動態渲染行事曆與待辦總表
  fetchAndRenderItinerary();

  // ===== 導覽列功能 =====
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const links = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      // Scroll Spy
      let current = '';
      const sections = document.querySelectorAll('.section');
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 100) {
          current = section.getAttribute('id');
        }
      });

      links.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
          link.classList.add('active');
        }
      });
    });

    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    links.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }

  // ===== 倒數計時 =====
  function initCountdown() {
    const countdownEl = document.getElementById('countdownDays');
    // 設定出發日期 2026/09/15
    const departureDate = new Date('2026-09-15T23:30:00');
    
    function updateCountdown() {
      const now = new Date();
      const diffTime = departureDate - now;
      
      if (diffTime > 0) {
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        countdownEl.textContent = diffDays;
      } else {
        countdownEl.textContent = '0';
        countdownEl.style.color = '#10b981'; // 出發啦！
      }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000 * 60 * 60); // 每小時更新
  }

  // ===== 渲染行事曆 =====
  function renderCalendar() {
    const container = document.getElementById('calendarContainer');
    container.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'calendar-grid';

    itineraryData.forEach(itemData => {
      const cell = document.createElement('div');
      cell.className = `calendar-cell has-data cal-type-${itemData.type}`;
      
      const timeHtml = itemData.time ? `<span class="calendar-time">${itemData.time}</span>` : '';
      
      // 加上表情符號圖示
      const icons = {
        transit: '✈️',
        paris: '🗼',
        disney: '🏰',
        belgium: '🍫',
        michel: '⛪'
      };
      const icon = icons[itemData.type] || '📍';

      // 計算這天有沒有未完成的待辦事項
      const uncompletedTodos = state.todos.filter(t => t.date === itemData.date && !t.completed);
      const badgeHtml = uncompletedTodos.length > 0 ? `<div class="calendar-todo-badge">${uncompletedTodos.length}</div>` : '';

      cell.innerHTML = `
        ${badgeHtml}
        <div class="calendar-date">
          <span>${itemData.date}</span>
          ${timeHtml}
        </div>
        <div class="calendar-item">
          ${icon} ${itemData.location}
        </div>
      `;

      // 點擊事件
      cell.addEventListener('click', () => openModal(itemData));
      grid.appendChild(cell);
    });

    container.appendChild(grid);
  }

  // ===== 共用渲染展開式清單函式 =====
  function renderAccordion(containerId, dataMap) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    container.className = 'accordion-container';

    Object.entries(dataMap).forEach(([category, items]) => {
      const details = document.createElement('details');
      details.className = 'accordion-item';
      
      const summary = document.createElement('summary');
      summary.className = 'accordion-header';
      summary.innerHTML = `<span class="accordion-title-text">${category}</span><span class="accordion-icon">▼</span>`;
      
      const content = document.createElement('div');
      content.className = 'accordion-content';
      
      items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'accordion-card';
        div.innerHTML = `
          <div class="acc-icon">${item.icon}</div>
          <div class="acc-text">
            <h4 class="acc-title">${item.title}</h4>
            <p class="acc-desc">${item.content}</p>
          </div>
        `;
        content.appendChild(div);
      });
      
      details.appendChild(summary);
      details.appendChild(content);
      container.appendChild(details);
    });
  }

  // ===== 渲染推薦 =====
  function renderRecommendations() {
    renderAccordion('recommendationsGrid', recommendationsData);
  }

  // ===== 渲染貼士 =====
  function renderTips() {
    renderAccordion('tipsGrid', tipsData);
  }

  // ===== 渲染訂位總覽 =====
  function renderBookings() {
    const container = document.getElementById('bookingsContainer');
    if (!container) return;
    container.innerHTML = '';

    const categoryMeta = {
      transit:    { label: '交通', color: '#0284c7', bg: '#e0f2fe' },
      hotel:      { label: '住宿', color: '#7c3aed', bg: '#ede9fe' },
      attraction: { label: '景點', color: '#d97706', bg: '#fef3c7' }
    };

    // 依分類分組
    const groups = {};
    bookings.forEach(b => {
      if (!groups[b.category]) groups[b.category] = [];
      groups[b.category].push(b);
    });

    const categoryOrder = ['transit', 'hotel', 'attraction'];
    const categoryIcons = { transit: '🚄', hotel: '🏨', attraction: '🎡' };

    categoryOrder.forEach(cat => {
      const items = groups[cat];
      if (!items) return;

      const meta = categoryMeta[cat];

      const groupEl = document.createElement('div');
      groupEl.className = 'booking-group';

      const groupHeader = document.createElement('div');
      groupHeader.className = 'booking-group-header';
      groupHeader.innerHTML = `
        <span class="booking-cat-icon">${categoryIcons[cat]}</span>
        <span class="booking-cat-label">${meta.label}</span>
        <span class="booking-cat-count">${items.length} 筆</span>
      `;
      groupEl.appendChild(groupHeader);

      const cardsWrap = document.createElement('div');
      cardsWrap.className = 'booking-cards';

      items.forEach(b => {
        const card = document.createElement('div');
        card.className = 'booking-card';

        const statusHtml = b.status === 'confirmed'
          ? '<span class="booking-status confirmed">✅ 已確認</span>'
          : '<span class="booking-status pending">⏳ 待確認</span>';

        card.innerHTML = `
          <div class="booking-left">
            <div class="booking-icon" style="background:${meta.bg}; color:${meta.color};">${b.icon}</div>
          </div>
          <div class="booking-body">
            <div class="booking-top-row">
              <div>
                <div class="booking-title">${b.title}</div>
                <div class="booking-subtitle">${b.subtitle}</div>
              </div>
              ${statusHtml}
            </div>
            <div class="booking-details">
              <div class="booking-detail-item">
                <span class="booking-detail-label">📅 日期</span>
                <span class="booking-detail-val">${b.date}</span>
              </div>
              ${b.time ? `<div class="booking-detail-item">
                <span class="booking-detail-label">🕐 時間</span>
                <span class="booking-detail-val">${b.time}</span>
              </div>` : ''}
              ${b.confirmCode ? `<div class="booking-detail-item">
                <span class="booking-detail-label">🎫 訂位代碼</span>
                <span class="booking-detail-val booking-code">${b.confirmCode}</span>
              </div>` : ''}
              ${b.price ? `<div class="booking-detail-item">
                <span class="booking-detail-label">💰 金額</span>
                <span class="booking-detail-val">${b.price}</span>
              </div>` : ''}
              ${b.passengers ? `<div class="booking-detail-item">
                <span class="booking-detail-label">👤 乘客</span>
                <span class="booking-detail-val">${b.passengers}</span>
              </div>` : ''}
            </div>
            ${b.note ? `<div class="booking-note">💡 ${b.note}</div>` : ''}
          </div>
        `;
        cardsWrap.appendChild(card);
      });

      groupEl.appendChild(cardsWrap);
      container.appendChild(groupEl);
    });

    // 若無任何訂位
    if (bookings.length === 0) {
      container.innerHTML = `
        <div class="booking-empty">
          <div style="font-size: 3rem; margin-bottom: 16px;">🎫</div>
          <p style="color: var(--c-text-muted);">還沒有任何訂位紀錄，快去搶票吧！</p>
        </div>
      `;
    }
  }

  // ===== 渲染資料整合紀錄 =====
  function renderRegistry() {
    const tbody = document.getElementById('registryTableBody');
    
    dataRegistry.forEach(row => {
      const el = document.createElement('tr');
      el.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
      
      el.innerHTML = `
        <td style="padding: 12px; font-family: monospace; font-size: 0.9rem;">
          <a href="${row.url}" target="_blank" style="color: var(--c-primary-light); text-decoration: underline;">
            ${row.file}
          </a>
        </td>
        <td style="padding: 12px; font-size: 0.9rem;">${row.added}</td>
        <td style="padding: 12px; font-size: 0.9rem; color: var(--c-primary-light);">${row.integrated}</td>
        <td style="padding: 12px; font-size: 0.95rem;">${row.summary}</td>
      `;
      tbody.appendChild(el);
    });
  }

  // ===== 備忘錄系統 =====
  function initNotes() {
    const titleInput = document.getElementById('noteTitleInput');
    const textarea = document.getElementById('noteContentInput');
    const categorySelect = document.getElementById('noteCategorySelect');
    const saveBtn = document.getElementById('noteSaveBtn');
    
    const imageInput = document.getElementById('noteImageInput');
    const imagePreviewContainer = document.getElementById('noteImagePreviewContainer');
    const imagePreview = document.getElementById('noteImagePreview');
    const removeImageBtn = document.getElementById('removeImageBtn');
    let currentImageBase64 = null;

    // 初始渲染
    renderNotes();

    // 處理圖片的共用函式
    function processImageFile(file, previewEl, containerEl, callback) {
      if (!file || !file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // 壓縮圖片避免撐爆 localStorage
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const base64 = canvas.toDataURL('image/jpeg', 0.6);
          previewEl.src = base64;
          containerEl.style.display = 'block';
          if (callback) callback(base64);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }

    // 處理圖片上傳與壓縮 (主表單 - 點擊上傳)
    if (imageInput) {
      imageInput.addEventListener('change', function(e) {
        processImageFile(e.target.files[0], imagePreview, imagePreviewContainer, (b64) => {
          currentImageBase64 = b64;
        });
      });
    }

    // 處理圖片貼上 (主表單 - Cmd+V)
    if (textarea) {
      textarea.addEventListener('paste', function(e) {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let index in items) {
          const item = items[index];
          if (item.kind === 'file' && item.type.startsWith('image/')) {
            const file = item.getAsFile();
            processImageFile(file, imagePreview, imagePreviewContainer, (b64) => {
              currentImageBase64 = b64;
            });
            // 不使用 preventDefault()，讓如果同時貼上文字與圖片時，文字依然能貼上
          }
        }
      });
    }

    if (removeImageBtn) {
      removeImageBtn.addEventListener('click', () => {
        currentImageBase64 = null;
        imageInput.value = '';
        imagePreviewContainer.style.display = 'none';
        imagePreview.src = '';
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const title = titleInput.value.trim();
        const content = textarea.value.trim();
        const category = categorySelect.options[categorySelect.selectedIndex];
        
        if (!title && !content && !currentImageBase64) {
          alert('請輸入備忘錄標題、內容或圖片！');
          return;
        }

        const newNote = {
          id: Date.now().toString(),
          title: title || '無標題備忘',
          content: content,
          categoryVal: category.value,
          categoryText: category.text,
          date: new Date().toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
          image: currentImageBase64
        };

        state.notes.unshift(newNote); // 加到最前面
        saveNotes();
        renderNotes();
        
        // 清空輸入框
        titleInput.value = '';
        textarea.value = '';
        currentImageBase64 = null;
        if (imageInput) imageInput.value = '';
        if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';
        if (imagePreview) imagePreview.src = '';
      });
    }
  }

  function renderNotes() {
    const list = document.getElementById('notesList');
    list.innerHTML = '';

    if (state.notes.length === 0) {
      list.innerHTML = `
        <div class="notes-empty" id="notesEmpty" style="display: block;">
          <div class="empty-icon">📋</div>
          <p>還沒有備忘錄</p>
          <p class="empty-sub">開始記錄你的旅遊重點吧！</p>
        </div>
      `;
      return;
    }
    
    // 類別顏色對應
    const catColors = {
      'general': 'var(--c-primary-light)',
      'todo': 'var(--c-michel)',
      'booking': 'var(--c-disney)',
      'packing': 'var(--c-belgium)',
      'emergency': 'var(--c-secondary)'
    };

    state.notes.forEach(note => {
      const el = document.createElement('div');
      el.className = 'note-item';
      el.style.borderLeftColor = catColors[note.categoryVal] || 'var(--c-primary-light)';
      
      el.innerHTML = `
        <div class="note-item-header">
          <div class="note-item-title">
            <span>${note.categoryText.split(' ')[0]}</span> ${note.title}
          </div>
          <div class="note-item-meta">${note.date}</div>
        </div>
        ${note.image ? `<img src="${note.image}" class="note-image-display" style="margin-top: 10px; margin-bottom: 10px; width: 100%; border-radius: 8px; border: 1px solid var(--c-border); max-height: 300px; object-fit: contain;">` : ''}
        <div class="note-item-content">${escapeHTML(note.content)}</div>
        <div class="note-item-actions">
          <button type="button" class="note-action-btn delete" data-id="${note.id}">刪除</button>
        </div>
      `;

      list.appendChild(el);
    });

    // 綁定刪除事件
    document.querySelectorAll('.note-action-btn.delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = e.currentTarget.dataset.id;
        // 先從 state 移除，保存備份
        const deletedNote = state.notes.find(n => n.id === id);
        const deletedIndex = state.notes.findIndex(n => n.id === id);
        if (!deletedNote) return;
        state.notes = state.notes.filter(n => n.id !== id);
        renderNotes(); // 立即更新畫面

        // 顯示 Undo Toast
        showUndoToast(
          deletedNote.title || '無標題備忘',
          () => { saveNotes(); }, // 60秒後正式儲存
          () => { // 按復原
            state.notes.splice(deletedIndex, 0, deletedNote);
            saveNotes();
            renderNotes();
          }
        );
      });
    });
  }

  function saveNotes() {
    localStorage.setItem('franceTripNotes', JSON.stringify(state.notes));
  }

  // ===== 待辦總表系統 =====
  function renderMasterTodoList() {
    const container = document.getElementById('todoMasterContainer');
    if (!container) return;
    
    container.innerHTML = '';

    if (state.todos.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding: 40px; background: rgba(255,255,255,0.05); border-radius: var(--radius-lg);">
          <h3 style="color: var(--c-text-muted); margin-bottom: 10px;">目前沒有任何待辦事項</h3>
          <p style="color: var(--c-text-muted); font-size: 0.95rem;">點擊上方「行事曆」的日期卡片，即可為每一天新增專屬待辦事項！</p>
        </div>
      `;
      return;
    }

    // 將 todo 依照日期分組
    const groupedTodos = {};
    state.todos.forEach(todo => {
      if (!groupedTodos[todo.date]) {
        groupedTodos[todo.date] = [];
      }
      groupedTodos[todo.date].push(todo);
    });

    // 取得所有有待辦的日期並排序 (依照字串簡易排序 9/15 -> 10/1 可能有問題，但此行程剛好 9 月在前 10 月在後，簡易補零排序)
    const sortedDates = Object.keys(groupedTodos).sort((a, b) => {
      const [m1, d1] = a.split('/').map(Number);
      const [m2, d2] = b.split('/').map(Number);
      if (m1 !== m2) return m1 - m2;
      return d1 - d2;
    });

    sortedDates.forEach(dateStr => {
      const todosForDate = groupedTodos[dateStr];
      // 未完成排前面
      todosForDate.sort((a, b) => a.completed - b.completed);
      
      const itemData = itineraryData.find(i => i.date === dateStr);
      const locationBadge = itemData ? `<span class="todo-date-location">${itemData.location}</span>` : '';

      const groupEl = document.createElement('div');
      groupEl.className = 'todo-date-group';
      
      let html = `
        <div class="todo-date-header">
          <span>📅 ${dateStr}</span>
          ${locationBadge}
        </div>
        <div class="todo-list-container">
      `;

      todosForDate.forEach(todo => {
        html += `
          <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <input type="checkbox" class="todo-checkbox master-checkbox" data-id="${todo.id}" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${escapeHTML(todo.text)}</span>
            <button type="button" class="todo-delete-btn master-delete-btn" data-id="${todo.id}">🗑️</button>
          </div>
        `;
      });

      html += `</div>`;
      groupEl.innerHTML = html;
      container.appendChild(groupEl);
    });

    // 綁定事件
    document.querySelectorAll('.master-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const todo = state.todos.find(t => t.id === e.target.dataset.id);
        if (todo) {
          todo.completed = e.target.checked;
          saveTodos();
          renderMasterTodoList(); // 重新渲染總表以重排
          renderCalendar(); // 更新紅點
        }
      });
    });

    document.querySelectorAll('.master-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = e.currentTarget.dataset.id;
        if (!id) return;
        // 先從 state 移除，保存備份
        const deletedTodo = state.todos.find(t => t.id === id);
        const deletedIndex = state.todos.findIndex(t => t.id === id);
        if (!deletedTodo) return;
        state.todos = state.todos.filter(t => t.id !== id);
        renderMasterTodoList();
        renderCalendar();

        // 顯示 Undo Toast
        showUndoToast(
          deletedTodo.text,
          () => { saveTodos(); }, // 60秒後正式儲存
          () => { // 按復原
            state.todos.splice(deletedIndex, 0, deletedTodo);
            saveTodos();
            renderMasterTodoList();
            renderCalendar();
          }
        );
      });
    });
  }

  // ===== Modal 互動 =====
  function openModal(itemData) {
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    
    const timeStr = itemData.time ? ` · ${itemData.time}` : '';
    
    content.innerHTML = `
      <div class="modal-header">
        <div class="modal-date">📅 ${itemData.date} ${timeStr}</div>
        <h2 class="modal-title">${itemData.location}</h2>
      </div>
      <div class="modal-body">
        <p style="font-size: 1.2rem; color: var(--c-text); margin-bottom: 20px;"><strong>📍 計畫：</strong>${itemData.desc}</p>
        <p><strong>💡 詳細資訊：</strong><br>${itemData.detail}</p>
        
        <!-- 單日待辦事項區塊 -->
        <div style="margin-top: 30px; padding: 15px; background: rgba(0,0,0,0.2); border: 1px solid var(--c-border); border-radius: var(--radius-md);">
          <h4 style="margin-bottom: 15px; color: var(--c-accent); display: flex; align-items: center; gap: 8px;">
            ☑️ 本日專屬待辦
          </h4>
          <div id="modalTodoList" class="todo-list-container">
            <!-- 動態渲染待辦 -->
          </div>
          <div class="todo-input-wrapper">
            <input type="text" id="modalTodoInput" class="todo-input" placeholder="新增待辦事項 (如：預約餐廳、買票)...">
            <button id="addModalTodoBtn" class="todo-add-btn">新增</button>
          </div>
        </div>

        <!-- 快速筆記區塊 -->
        <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: var(--radius-md);">
          <h4 style="margin-bottom: 10px;">快速筆記區</h4>
          <textarea id="quickNote" placeholder="點此輸入針對此行程的特定筆記，或直接按 Cmd+V 貼上圖片..." style="width:100%; min-height:80px; background:transparent; border:1px solid var(--c-border); color:white; padding:10px; border-radius:4px; margin-bottom:10px;"></textarea>
          
          <div class="file-upload-wrapper" style="margin-bottom: 12px;">
            <label for="quickNoteImage" class="upload-btn" style="padding: 4px 10px; font-size: 0.85rem;">📷 附加圖片 (可直接貼上)</label>
            <input type="file" id="quickNoteImage" accept="image/*" style="display: none;">
            <div id="quickNotePreviewContainer" style="display: none; margin-top: 10px; position: relative;">
              <img id="quickNotePreview" src="" style="width: 100%; border-radius: 4px; max-height: 200px; object-fit: contain; border: 1px solid var(--c-border);">
              <button type="button" id="removeQuickNoteImage" style="position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-weight: bold;">✕</button>
            </div>
          </div>

          <button id="saveQuickNoteBtn" style="padding:6px 12px; background:var(--c-primary-light); color:white; border:none; border-radius:4px; font-size:0.9rem; cursor: pointer;">儲存筆記</button>
        </div>
      </div>
    `;
    
    overlay.classList.add('active');

    // --- 待辦事項邏輯 ---
    function renderModalTodos() {
      const listContainer = document.getElementById('modalTodoList');
      listContainer.innerHTML = '';
      
      const dayTodos = state.todos.filter(t => t.date === itemData.date);
      
      // 未完成排前面，已完成排後面
      dayTodos.sort((a, b) => a.completed - b.completed);

      if (dayTodos.length === 0) {
        listContainer.innerHTML = '<p style="color: var(--c-text-muted); font-size: 0.9rem; text-align: center;">目前沒有待辦事項</p>';
      } else {
        dayTodos.forEach(todo => {
          const el = document.createElement('div');
          el.className = `todo-item ${todo.completed ? 'completed' : ''}`;
          el.innerHTML = `
            <input type="checkbox" class="todo-checkbox" data-id="${todo.id}" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${escapeHTML(todo.text)}</span>
            <button type="button" class="todo-delete-btn" data-id="${todo.id}">🗑️</button>
          `;
          listContainer.appendChild(el);
        });
      }

      // 綁定事件
      document.querySelectorAll('#modalTodoList .todo-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
          const todo = state.todos.find(t => t.id === e.target.dataset.id);
          if (todo) {
            todo.completed = e.target.checked;
            saveTodos();
            renderModalTodos();
            renderCalendar(); // 更新日曆紅點
            renderMasterTodoList(); // 更新總表
          }
        });
      });

      document.querySelectorAll('#modalTodoList .todo-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.dataset.id;
          if (!id) return;
          state.todos = state.todos.filter(t => t.id !== id);
          saveTodos();
          renderModalTodos();
          renderCalendar();
          renderMasterTodoList();
        });
      });
    }

    renderModalTodos();

    document.getElementById('addModalTodoBtn').addEventListener('click', () => {
      const input = document.getElementById('modalTodoInput');
      const text = input.value.trim();
      if (!text) return;

      state.todos.push({
        id: Date.now().toString(),
        date: itemData.date,
        text: text,
        completed: false
      });

      saveTodos();
      input.value = '';
      renderModalTodos();
      renderCalendar();
      renderMasterTodoList();
    });

    document.getElementById('modalTodoInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('addModalTodoBtn').click();
      }
    });

    // --- 快速筆記區的互動邏輯 ---
    const imageInput = document.getElementById('quickNoteImage');
    const previewContainer = document.getElementById('quickNotePreviewContainer');
    const previewImg = document.getElementById('quickNotePreview');
    const removeBtn = document.getElementById('removeQuickNoteImage');
    const quickNoteTextarea = document.getElementById('quickNote');
    let quickBase64Image = null;

    function processQuickImageFile(file) {
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          quickBase64Image = canvas.toDataURL('image/jpeg', 0.6);
          previewImg.src = quickBase64Image;
          previewContainer.style.display = 'block';
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }

    // 點擊上傳
    imageInput.addEventListener('change', function(e) {
      processQuickImageFile(e.target.files[0]);
    });

    // 貼上圖片 (Cmd+V)
    quickNoteTextarea.addEventListener('paste', function(e) {
      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      for (let index in items) {
        const item = items[index];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          processQuickImageFile(file);
        }
      }
    });

    removeBtn.addEventListener('click', () => {
      quickBase64Image = null;
      imageInput.value = '';
      previewContainer.style.display = 'none';
    });

    document.getElementById('saveQuickNoteBtn').addEventListener('click', () => {
      const content = document.getElementById('quickNote').value.trim();
      if (!content && !quickBase64Image) {
        alert('請輸入內容或上傳圖片！');
        return;
      }

      const newNote = {
        id: Date.now().toString(),
        title: `${itemData.location} (${itemData.date})`,
        content: content,
        categoryVal: 'general',
        categoryText: '📌 快速筆記',
        date: new Date().toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        image: quickBase64Image
      };

      state.notes.unshift(newNote);
      saveNotes();
      
      // 如果 renderNotes 存在 (即在有備忘錄列表的頁面)
      if (typeof renderNotes === 'function') {
        renderNotes();
      }
      
      alert('已成功儲存至底部的「旅行備忘錄」中！');
      document.getElementById('modalOverlay').classList.remove('active');
    });
  }

  document.getElementById('modalClose').addEventListener('click', () => {
    document.getElementById('modalOverlay').classList.remove('active');
  });

  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      e.currentTarget.classList.remove('active');
    }
  });

  // ===== 回到頂部 =====
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });

    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 工具函式：防止 XSS
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[tag])
    );
  }

  // ===== Google 試算表動態串接與離線快照保護系統 =====

  // 輕量級 CSV 解析器，支援引號與欄位內換行 (\n)
  function parseCSV(text) {
    const lines = [];
    let row = [""];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i+1];
      if (c === '"') {
        if (inQuotes && next === '"') {
          row[row.length - 1] += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        row.push('');
      } else if ((c === '\r' || c === '\n') && !inQuotes) {
        if (c === '\r' && next === '\n') {
          i++;
        }
        lines.push(row);
        row = [''];
      } else {
        row[row.length - 1] += c;
      }
    }
    if (row.length > 1 || row[0] !== '') {
      lines.push(row);
    }
    return lines;
  }

  // 非同步抓取、解析 Google 試算表，支援斷網離線保護
  async function fetchAndRenderItinerary() {
    const statusBadge = document.getElementById('syncStatusBadge');
    try {
      // 加上時間戳記防快取參數，確保每次重整都向 Google 伺服器要求最新版
      const response = await fetch(GOOGLE_SHEET_CSV_URL + '&t=' + Date.now());
      if (!response.ok) throw new Error('雲端回應異常');
      const csvText = await response.text();
      
      // 解析 CSV
      const parsedRows = parseCSV(csvText);
      
      // 過濾並映射有效資料行 (日期符合 M/D 格式)
      const dataRows = parsedRows.filter(row => {
        if (row.length < 4) return false;
        return /^\d{1,2}\/\d{1,2}$/.test(row[0].trim());
      });

      if (dataRows.length > 0) {
        const mappedData = dataRows.map(row => {
          const date = row[0].trim();
          const weekday = row[1] ? row[1].trim() : '';
          const time = row[2] ? row[2].trim() : '';
          const location = row[3] ? row[3].trim() : '';
          const transit = row[4] ? row[4].trim() : '';
          const hotel = row[5] ? row[5].trim() : '';
          const note = row[6] ? row[6].trim() : '';
          
          // 行程種類判定
          let type = 'paris';
          if (location.includes('桃園') || location.includes('戴高樂') || location.includes('機場') || transit.includes('機') || transit.includes('航')) {
            type = 'transit';
          } else if (location.includes('迪士尼') || hotel.includes('Zenitude') || note.includes('迪士尼')) {
            type = 'disney';
          } else if (location.includes('聖米歇爾') || hotel.includes('Relais') || location.includes('雷恩') || location.includes('聖馬洛')) {
            type = 'michel';
          } else if (location.includes('比利時') || location.includes('布魯日') || location.includes('根特')) {
            type = 'belgium';
          }

          // 動態整合詳細描述 (包含交通、住宿與詳細備註)
          let detailParts = [];
          if (transit) detailParts.push(`<strong>🚇 交通與備忘：</strong><br>${transit.replace(/\n/g, '<br>')}`);
          if (hotel) detailParts.push(`<strong>🏨 住宿預訂：</strong><br>${hotel.replace(/\n/g, '<br>')}`);
          if (note) detailParts.push(`<strong>💡 行程與備忘：</strong><br>${note.replace(/\n/g, '<br>')}`);

          let detail = detailParts.join('<br><br>');

          // 特殊景點注入精美的手工 html 攻略 (維持原 index 亮點)
          if (date === '9/25') {
            detail = `🚄 <strong>SNCF 跨城火車 (Paris Montparnasse ➔ Rennes)</strong><br>• 班次：✅ <strong>已訂票 06:48</strong> (訂位代碼：<strong>4WCP2R</strong>，2 人共 68.00 €)<br>• 車程：約 1.5 - 2 小時<br><br><strong>🌊 今日潮汐資訊 (9/25)</strong><br>🔸 滿潮 (Pleine mer)：07:08、19:26 (大潮係數 77/82)<br>🔹 乾潮 (Basse mer)：01:34、13:54<br><br>` + detail;
          } else if (date === '9/26') {
            detail = `<strong>⛰️ 聖米歇爾山探索攻略</strong><br>• 參觀修道院，品嚐普拉嬤嬤烘蛋。<br>• 💡 <em>「下山走大街，上山走城牆」</em> 聰明路線避開擁擠人潮。<br><br><strong>🌊 今日潮汐資訊 (9/26)</strong><br>🔸 滿潮 (Pleine mer)：07:45、20:02 (大潮係數 87/92 - 注意漲退潮變化)<br>🔹 乾潮 (Basse mer)：02:15、14:35<br><br>` + detail;
          } else if (date === '9/27') {
            detail = `<strong>🏰 聖馬洛 (Saint-Malo) 海盜城一日遊</strong><br>• 漫步古城牆，吹海風，品嚐蕎麥可麗餅。⚠️ 修道院門票記得先買好。<br><br><strong>🌊 今日潮汐資訊 (9/27)</strong><br>🔸 滿潮 (Pleine mer)：08:20、20:37 (大潮係數 95/97 - 超大潮，景觀壯麗)<br>🔹 乾潮 (Basse mer)：02:56、15:14<br><br>` + detail;
          }

          // 取出第一行做為卡片顯示的精簡 desc，過濾掉 html 標籤
          const rawDesc = (transit || note || hotel || `${location}探索`).split('\n')[0].replace(/<[^>]*>/g, '');
          const desc = rawDesc.length > 18 ? rawDesc.substring(0, 18) + '...' : rawDesc;

          return {
            date,
            time,
            location,
            type,
            desc: desc || '探索美麗景致',
            detail: detail || '今日暫無詳細計畫備忘。'
          };
        });

        itineraryData = mappedData;
        
        // 儲存到本地快照，防斷網
        localStorage.setItem('franceTripItinerarySnapshot', JSON.stringify(mappedData));
        localStorage.setItem('franceTripItinerarySnapshotTime', new Date().toLocaleString());
      }

      // 更新同步狀態徽章為成功
      if (statusBadge) {
        statusBadge.className = 'sync-status-badge synced';
        statusBadge.innerHTML = '🟢 試算表已同步';
        statusBadge.title = `最後同步時間：${new Date().toLocaleTimeString()}`;
      }
    } catch (error) {
      console.warn('無法從 Google 試算表同步資料，載入離線緩存：', error);
      
      const snapshot = localStorage.getItem('franceTripItinerarySnapshot');
      const snapshotTime = localStorage.getItem('franceTripItinerarySnapshotTime');
      
      if (snapshot) {
        itineraryData = JSON.parse(snapshot);
        if (statusBadge) {
          statusBadge.className = 'sync-status-badge offline';
          statusBadge.innerHTML = '🟡 離線快照模式';
          statusBadge.title = `載入離線緩存，快照時間：${snapshotTime} (錯誤原因: ${error.message})`;
        }
      } else {
        if (statusBadge) {
          statusBadge.className = 'sync-status-badge fallback';
          statusBadge.innerHTML = '🔴 斷網預設行程';
          statusBadge.title = `無本地緩存，使用網頁出廠預設行程 (錯誤原因: ${error.message})`;
        }
      }
    }

    // 重新渲染行事曆與待辦事項
    renderCalendar();
    renderMasterTodoList();
  }
});
