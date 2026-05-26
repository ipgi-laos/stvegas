let translationsConfig = null;
let currentLanguageIndex = 0;
let currentLanguage = {
  code: 'EN',
  brandChip: 'WEEKLY HYDRA PROMOTION',
  topPlayers: 'TOP 15 PLAYERS',
  dailyUpdateLabel: 'Daily Update:',
  lastUpdatedLabel: 'Last Updated:',
  rankHeader: 'Rank',
  membershipHeader: 'Membership Number',
  tierStatusHeader: 'Tier / Status',
  resetTitle: 'Reset Schedule',
  resetInfo: 'Rankings reset every Friday at 16:00H'
};

const TIER_IMAGE_MAP = {
  'Bronze I': 'images/tiers/bronze1.webp',
  'Bronze II': 'images/tiers/bronze2.webp',
  'Bronze III': 'images/tiers/bronze3.webp',
  'Bronze IV': 'images/tiers/bronze4.webp',
  'Bronze V': 'images/tiers/bronze5.webp',
  'Silver I': 'images/tiers/silver1.webp',
  'Silver II': 'images/tiers/silver2.webp',
  'Silver III': 'images/tiers/silver3.webp',
  'Silver IV': 'images/tiers/silver4.webp',
  'Silver V': 'images/tiers/silver5.webp',
  'Gold I': 'images/tiers/gold1.webp',
  'Gold II': 'images/tiers/gold2.webp',
  'Gold III': 'images/tiers/gold3.webp',
  'Gold IV': 'images/tiers/gold4.webp',
  'Gold V': 'images/tiers/gold5.webp',
  Platinum: 'images/tiers/platinum.webp'
};

const STATUS_IMAGE_MAP = {
  top8: 'images/status/top8.webp',
  qualified: 'images/status/qualified.webp',
  rising: 'images/status/rising.webp',
  promoted: 'images/status/promoted.webp'
};

const setText = (id, value) => {
  const el = document.getElementById(id);
  if (el && value) el.textContent = value;
};

const normalizeKey = (value = '') => String(value).trim().toLowerCase().replace(/\s+/g, '');

function normalizeAssetPath(path = '') {
  const clean = String(path || '').trim().replace(/^\\+/, '').replace(/\\/g, '/');
  if (!clean) return '';
  if (/^(https?:)?\/\//i.test(clean) || clean.startsWith('data:')) return clean;
  return clean.startsWith('./') ? clean : `./${clean}`;
}

function withTierFallback(img) {
  const src = img.getAttribute('src') || '';
  const tried = img.dataset.fallbackTried || '';

  if (!tried && src.includes('/tiers/')) {
    img.dataset.fallbackTried = 'tier';
    img.src = src.replace('/tiers/', '/tier/');
    return;
  }

  if (!tried && src.includes('/tier/')) {
    img.dataset.fallbackTried = 'tiers';
    img.src = src.replace('/tier/', '/tiers/');
    return;
  }

  img.style.display = 'none';
}

function withStatusFallback(img) {
  const src = img.getAttribute('src') || '';
  const tried = img.dataset.fallbackTried || '';

  if (!tried && src.includes('/status/')) {
    img.dataset.fallbackTried = 'tiers';
    img.src = src.replace('/status/', '/tiers/');
    return;
  }

  img.style.display = 'none';
}

function getTierImage(row) {
  if (row.tierImage) return normalizeAssetPath(row.tierImage);
  if (row.tier && TIER_IMAGE_MAP[row.tier]) return TIER_IMAGE_MAP[row.tier];
  const key = normalizeKey(row.tier);
  const fromKey = Object.entries(TIER_IMAGE_MAP).find(([label]) => normalizeKey(label) === key);
  return normalizeAssetPath(fromKey ? fromKey[1] : 'images/tiers/bronze1.webp');
}

function getStatusImage(row, index) {
  if (row.statusImage) return normalizeAssetPath(row.statusImage);
  const statusKey = normalizeKey(row.status || (index < 8 ? 'top8' : 'rising'));
  if (statusKey.includes('top8')) return normalizeAssetPath(STATUS_IMAGE_MAP.top8);
  if (statusKey.includes('qual')) return normalizeAssetPath(STATUS_IMAGE_MAP.qualified);
  if (statusKey.includes('promoted') || statusKey.includes('almost')) return normalizeAssetPath(STATUS_IMAGE_MAP.promoted);
  return normalizeAssetPath(STATUS_IMAGE_MAP.rising);
}

function getStatusAlt(row, index) {
  if (row.status) return row.status;
  return index < 8 ? 'Top 8' : 'Rising';
}

function applyTranslation(lang, smooth = true) {
  if (!lang) return;
  currentLanguage = { ...currentLanguage, ...lang };

  const targets = [
    'brandChip',
    'topPlayersLabel',
    'dailyUpdateLabel',
    'lastUpdatedLabel',
    'rankHeader',
    'membershipHeader',
    'tierStatusHeader',
    'resetTitle',
    'resetInfo'
  ].map((id) => document.getElementById(id)).filter(Boolean);

  if (smooth) {
    targets.forEach((el) => el.classList.add('translation-fade-out'));
  }

  window.setTimeout(() => {
    setText('brandChip', currentLanguage.brandChip);
    setText('topPlayersLabel', currentLanguage.topPlayers);
    setText('dailyUpdateLabel', currentLanguage.dailyUpdateLabel);
    setText('lastUpdatedLabel', currentLanguage.lastUpdatedLabel);
    setText('rankHeader', currentLanguage.rankHeader);
    setText('membershipHeader', currentLanguage.membershipHeader);
    setText('tierStatusHeader', currentLanguage.tierStatusHeader);
    setText('resetTitle', currentLanguage.resetTitle);
    setText('resetInfo', currentLanguage.resetInfo);

    targets.forEach((el) => {
      el.classList.remove('translation-fade-out');
      el.classList.add('translation-fade-in');
      window.setTimeout(() => el.classList.remove('translation-fade-in'), 550);
    });

    document.documentElement.lang = currentLanguage.code === 'KR' ? 'ko' : currentLanguage.code === 'CN' ? 'zh' : currentLanguage.code === 'TH' ? 'th' : 'en';
  }, smooth ? 260 : 0);
}

async function loadTranslations() {
  try {
    const response = await fetch(`translation.json?v=${Date.now()}`);
    translationsConfig = await response.json();

    if (translationsConfig?.languages?.length) {
      currentLanguageIndex = 0;
      applyTranslation(translationsConfig.languages[currentLanguageIndex], false);

      const cycleMs = Number(translationsConfig.cycleSeconds || 15) * 1000;
      window.setInterval(() => {
        currentLanguageIndex = (currentLanguageIndex + 1) % translationsConfig.languages.length;
        applyTranslation(translationsConfig.languages[currentLanguageIndex], true);
      }, cycleMs);
    }
  } catch (error) {
    console.error('Unable to load translation.json', error);
  }
}

function initSparkles() {
  const layer = document.getElementById('sparkleLayer');
  if (!layer || layer.dataset.ready === '1') return;

  const sparkleCount = 28;

  for (let i = 0; i < sparkleCount; i += 1) {
    const spark = document.createElement('span');
    spark.className = 'sparkle';

    const size = (Math.random() * 10 + 7).toFixed(2);
    const left = (Math.random() * 33 + 2).toFixed(2);
    const top = (Math.random() * 78 + 8).toFixed(2);
    const duration = (Math.random() * 3.5 + 3.2).toFixed(2);
    const delay = (Math.random() * 5).toFixed(2);

    spark.style.width = `${size}px`;
    spark.style.height = `${size}px`;
    spark.style.left = `${left}%`;
    spark.style.top = `${top}%`;
    spark.style.animationDuration = `${duration}s`;
    spark.style.animationDelay = `${delay}s`;

    layer.appendChild(spark);
  }

  layer.dataset.ready = '1';
}

async function loadLeaderboard() {
  try {
    const response = await fetch(`leaderboard.json?v=${Date.now()}`);
    const data = await response.json();

    const titleLogo = document.getElementById('titleLogo');
    if (titleLogo) {
      titleLogo.alt = data.title || 'Hydra Ladder Leaderboard';
    }
    document.getElementById('dailyUpdate').textContent = data.dailyUpdate || '08:00 AM';
    document.getElementById('lastUpdated').textContent = data.lastUpdated || '--';

    const body = document.getElementById('leaderboardBody');
    body.innerHTML = '';

    const rows = (data.rows || []).slice(0, 15);
    rows.forEach((row, index) => {
      const tr = document.createElement('tr');
      const classes = [];
      if (index < 8) classes.push('candidate', 'top-eight-row');
      tr.className = classes.join(' ');

      const rankValue = row.rank || index + 1;
      const tierImage = getTierImage(row);
      const statusImage = getStatusImage(row, index);
      const tierAlt = row.tier || 'Tier';
      const statusAlt = getStatusAlt(row, index);

      tr.innerHTML = `
        <td><div class="rank-wrap rank-only"><span class="rank-number">${rankValue}</span></div></td>
        <td>${row.membership || ''}</td>
        <td>
          <div class="tier-status-wrap">
            <img class="tier-badge-img" src="${tierImage}" alt="" title="${tierAlt}" loading="eager" onerror="withTierFallback(this)" />
            <img class="status-badge-img" src="${statusImage}" alt="" title="${statusAlt}" loading="eager" onerror="withStatusFallback(this)" />
          </div>
        </td>
      `;
      body.appendChild(tr);
    });
  } catch (error) {
    console.error('Unable to load leaderboard.json', error);
  }
}

initSparkles();
loadTranslations();
loadLeaderboard();
setInterval(loadLeaderboard, 60000);
