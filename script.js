const formatPoints = (value) => Number(value || 0).toLocaleString('en-US');

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
  pointsHeader: 'Hydra Points',
  resetTitle: 'Reset Schedule',
  resetInfo: 'Rankings reset every Friday at 16:00H',
  top8Badge: '★ TOP 8'
};

const setText = (id, value) => {
  const el = document.getElementById(id);
  if (el && value) el.textContent = value;
};

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
    'pointsHeader',
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
    setText('pointsHeader', currentLanguage.pointsHeader);
    setText('resetTitle', currentLanguage.resetTitle);
    setText('resetInfo', currentLanguage.resetInfo);

    document.querySelectorAll('.top8-badge').forEach((badge) => {
      badge.textContent = currentLanguage.top8Badge;
    });

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

    // Keep sparkles mostly on the left/promotional area so they don't disturb the table.
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
    const response = await fetch(`data.json?v=${Date.now()}`);
    const data = await response.json();

    const titleLogo = document.getElementById('titleLogo');
    if (titleLogo) {
      titleLogo.alt = data.title || 'Hydra Points Leaderboard';
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
      const rankCell = `<div class="rank-wrap rank-only"><span class="rank-number">${rankValue}</span></div>`;
      const pointsCell = index < 8
        ? `<div class="points-wrap"><span class="top8-badge top8-badge-inline" style="animation-delay:${(index * 0.18).toFixed(2)}s">${currentLanguage.top8Badge}</span><span class="points-number">${formatPoints(row.points)}</span></div>`
        : `<div class="points-wrap"><span class="points-number">${formatPoints(row.points)}</span></div>`;

      tr.innerHTML = `
        <td>${rankCell}</td>
        <td>${row.membership || ''}</td>
        <td>${pointsCell}</td>
      `;
      body.appendChild(tr);
    });
  } catch (error) {
    console.error('Unable to load data.json', error);
  }
}

initSparkles();
loadTranslations();
loadLeaderboard();
setInterval(loadLeaderboard, 60000);
