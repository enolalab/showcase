/* ============================================================
   UniConvert — Application Logic
   ============================================================ */

// ========== MEASUREMENT DATA ==========
const UNITS = {
  length: {
    title: '📏 Chiều dài',
    units: {
      mm: { name: 'Milimet (mm)', factor: 0.001 },
      cm: { name: 'Centimet (cm)', factor: 0.01 },
      m: { name: 'Mét (m)', factor: 1 },
      km: { name: 'Kilomet (km)', factor: 1000 },
      in: { name: 'Inch (in)', factor: 0.0254 },
      ft: { name: 'Feet (ft)', factor: 0.3048 },
      yd: { name: 'Yard (yd)', factor: 0.9144 },
      mi: { name: 'Mile (mi)', factor: 1609.344 },
      nm: { name: 'Hải lý (nm)', factor: 1852 },
    },
    base: 'm',
  },
  mass: {
    title: '⚖️ Khối lượng',
    units: {
      mg: { name: 'Miligam (mg)', factor: 0.000001 },
      g: { name: 'Gram (g)', factor: 0.001 },
      kg: { name: 'Kilogram (kg)', factor: 1 },
      ton: { name: 'Tấn', factor: 1000 },
      oz: { name: 'Ounce (oz)', factor: 0.0283495 },
      lb: { name: 'Pound (lb)', factor: 0.453592 },
      ct: { name: 'Carat (ct)', factor: 0.0002 },
      luong: { name: 'Lượng (VN)', factor: 0.0375 },
    },
    base: 'kg',
  },
  temperature: {
    title: '🌡️ Nhiệt độ',
    units: {
      C: { name: 'Celsius (°C)', factor: null },
      F: { name: 'Fahrenheit (°F)', factor: null },
      K: { name: 'Kelvin (K)', factor: null },
    },
    base: 'C',
    custom: true,
  },
  area: {
    title: '📐 Diện tích',
    units: {
      mm2: { name: 'mm²', factor: 0.000001 },
      cm2: { name: 'cm²', factor: 0.0001 },
      m2: { name: 'm²', factor: 1 },
      ha: { name: 'Hecta (ha)', factor: 10000 },
      km2: { name: 'km²', factor: 1000000 },
      in2: { name: 'in²', factor: 0.00064516 },
      ft2: { name: 'ft²', factor: 0.092903 },
      ac: { name: 'Mẫu Anh (acre)', factor: 4046.86 },
      sao: { name: 'Sào (VN-Bắc)', factor: 360 },
    },
    base: 'm2',
  },
  volume: {
    title: '🧪 Thể tích',
    units: {
      ml: { name: 'Mililit (ml)', factor: 0.001 },
      l: { name: 'Lít (l)', factor: 1 },
      m3: { name: 'm³', factor: 1000 },
      gal: { name: 'Gallon (US)', factor: 3.78541 },
      qt: { name: 'Quart (US)', factor: 0.946353 },
      pt: { name: 'Pint (US)', factor: 0.473176 },
      cup: { name: 'Cup (US)', factor: 0.236588 },
      floz: { name: 'Fl. oz (US)', factor: 0.0295735 },
      tbsp: { name: 'Muỗng canh', factor: 0.0147868 },
      tsp: { name: 'Muỗng cà phê', factor: 0.00492892 },
    },
    base: 'l',
  },
  speed: {
    title: '⚡ Tốc độ',
    units: {
      'ms': { name: 'm/s', factor: 1 },
      'kmh': { name: 'km/h', factor: 0.277778 },
      'mph': { name: 'mph', factor: 0.44704 },
      'kn': { name: 'Knot (hải lý/h)', factor: 0.514444 },
      'mach': { name: 'Mach', factor: 343 },
      'c': { name: 'Tốc độ ánh sáng', factor: 299792458 },
    },
    base: 'ms',
  },
  data: {
    title: '💾 Dữ liệu',
    units: {
      b: { name: 'Byte (B)', factor: 1 },
      kb: { name: 'Kilobyte (KB)', factor: 1024 },
      mb: { name: 'Megabyte (MB)', factor: 1048576 },
      gb: { name: 'Gigabyte (GB)', factor: 1073741824 },
      tb: { name: 'Terabyte (TB)', factor: 1099511627776 },
      pb: { name: 'Petabyte (PB)', factor: 1125899906842624 },
      bit: { name: 'Bit', factor: 0.125 },
      kbit: { name: 'Kilobit', factor: 128 },
      mbit: { name: 'Megabit', factor: 131072 },
    },
    base: 'b',
  },
  time: {
    title: '⏱️ Thời gian',
    units: {
      ms_t: { name: 'Mili giây (ms)', factor: 0.001 },
      s: { name: 'Giây (s)', factor: 1 },
      min: { name: 'Phút', factor: 60 },
      h: { name: 'Giờ', factor: 3600 },
      day: { name: 'Ngày', factor: 86400 },
      week: { name: 'Tuần', factor: 604800 },
      month: { name: 'Tháng (30 ngày)', factor: 2592000 },
      year: { name: 'Năm (365 ngày)', factor: 31536000 },
    },
    base: 's',
  },
};

// ========== CURRENCY DATA ==========
const CURRENCIES = {
  usd: { name: 'Đô la Mỹ', flag: '🇺🇸', symbol: '$' },
  eur: { name: 'Euro', flag: '🇪🇺', symbol: '€' },
  gbp: { name: 'Bảng Anh', flag: '🇬🇧', symbol: '£' },
  jpy: { name: 'Yên Nhật', flag: '🇯🇵', symbol: '¥' },
  vnd: { name: 'Đồng Việt Nam', flag: '🇻🇳', symbol: '₫' },
  cny: { name: 'Nhân dân tệ', flag: '🇨🇳', symbol: '¥' },
  krw: { name: 'Won Hàn Quốc', flag: '🇰🇷', symbol: '₩' },
  thb: { name: 'Baht Thái', flag: '🇹🇭', symbol: '฿' },
  sgd: { name: 'Đô la Singapore', flag: '🇸🇬', symbol: 'S$' },
  aud: { name: 'Đô la Úc', flag: '🇦🇺', symbol: 'A$' },
  cad: { name: 'Đô la Canada', flag: '🇨🇦', symbol: 'C$' },
  chf: { name: 'Franc Thụy Sĩ', flag: '🇨🇭', symbol: 'CHF' },
  hkd: { name: 'Đô la Hồng Kông', flag: '🇭🇰', symbol: 'HK$' },
  twd: { name: 'Đô la Đài Loan', flag: '🇹🇼', symbol: 'NT$' },
  inr: { name: 'Rupee Ấn Độ', flag: '🇮🇳', symbol: '₹' },
  myr: { name: 'Ringgit Malaysia', flag: '🇲🇾', symbol: 'RM' },
  php: { name: 'Peso Philippines', flag: '🇵🇭', symbol: '₱' },
  idr: { name: 'Rupiah Indonesia', flag: '🇮🇩', symbol: 'Rp' },
  btc: { name: 'Bitcoin', flag: '₿', symbol: '₿' },
};

const POPULAR_PAIRS = [
  ['usd', 'vnd'],
  ['eur', 'vnd'],
  ['gbp', 'vnd'],
  ['jpy', 'vnd'],
  ['usd', 'eur'],
  ['usd', 'jpy'],
  ['usd', 'cny'],
  ['usd', 'krw'],
];

// ========== STATE ==========
let currentCategory = 'length';
let exchangeRates = null;
let ratesFetchTime = null;

// ========== DOM HELPERS ==========
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ========== TEMPERATURE CONVERSION ==========
function convertTemperature(value, from, to) {
  if (from === to) return value;

  // Convert to Celsius first
  let celsius;
  switch (from) {
    case 'C': celsius = value; break;
    case 'F': celsius = (value - 32) * 5 / 9; break;
    case 'K': celsius = value - 273.15; break;
    default: return NaN;
  }

  // Convert from Celsius to target
  switch (to) {
    case 'C': return celsius;
    case 'F': return celsius * 9 / 5 + 32;
    case 'K': return celsius + 273.15;
    default: return NaN;
  }
}

function getTemperatureFormula(from, to) {
  const formulas = {
    'C_F': '°F = °C × 9/5 + 32',
    'C_K': 'K = °C + 273.15',
    'F_C': '°C = (°F − 32) × 5/9',
    'F_K': 'K = (°F − 32) × 5/9 + 273.15',
    'K_C': '°C = K − 273.15',
    'K_F': '°F = (K − 273.15) × 9/5 + 32',
  };
  if (from === to) return '1 = 1';
  return formulas[`${from}_${to}`] || '—';
}

// ========== MEASUREMENT CONVERSION ==========
function convertMeasurement(value, from, to, category) {
  const cat = UNITS[category];
  if (!cat) return NaN;

  if (cat.custom && category === 'temperature') {
    return convertTemperature(value, from, to);
  }

  const fromUnit = cat.units[from];
  const toUnit = cat.units[to];
  if (!fromUnit || !toUnit) return NaN;

  // Convert via base unit
  const baseValue = value * fromUnit.factor;
  return baseValue / toUnit.factor;
}

function formatNumber(num) {
  if (isNaN(num) || !isFinite(num)) return '—';
  
  // For very large or very small numbers, use scientific notation
  if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) {
    return num.toExponential(6);
  }
  
  // Smart rounding
  if (Number.isInteger(num)) return num.toLocaleString('vi-VN');
  
  const str = num.toPrecision(10);
  const parsed = parseFloat(str);
  return parsed.toLocaleString('vi-VN', { maximumFractionDigits: 8 });
}

// ========== POPULATE UNITS ==========
function populateUnits(category) {
  const cat = UNITS[category];
  if (!cat) return;

  const fromSelect = $('#from-unit');
  const toSelect = $('#to-unit');
  const entries = Object.entries(cat.units);

  const buildOptions = (select, defaultIndex) => {
    select.innerHTML = entries.map(([key, unit], idx) =>
      `<option value="${key}" ${idx === defaultIndex ? 'selected' : ''}>${key.toUpperCase()} — ${unit.name}</option>`
    ).join('');
  };

  buildOptions(fromSelect, 0);
  buildOptions(toSelect, entries.length > 1 ? 1 : 0);

  $('#converter-title').textContent = cat.title;
}

// ========== PERFORM CONVERSION ==========
function doConvert() {
  const value = parseFloat($('#from-value').value);
  const from = $('#from-unit').value;
  const to = $('#to-unit').value;
  const result = convertMeasurement(value, from, to, currentCategory);
  
  const resultEl = $('#to-value');
  resultEl.value = isNaN(value) ? '—' : formatNumber(result);
  
  // Flash animation
  resultEl.classList.remove('flash');
  void resultEl.offsetWidth;
  resultEl.classList.add('flash');

  // Formula
  updateFormula(value, from, to, result);
  
  // Reference table
  updateRefTable(value, from);
}

function updateFormula(value, from, to, result) {
  const formulaEl = $('#formula-text');
  const cat = UNITS[currentCategory];

  if (cat.custom && currentCategory === 'temperature') {
    formulaEl.textContent = getTemperatureFormula(from, to);
  } else if (!isNaN(value) && isFinite(result)) {
    formulaEl.textContent = `${formatNumber(value)} ${from.toUpperCase()} = ${formatNumber(result)} ${to.toUpperCase()}`;
  } else {
    formulaEl.textContent = '—';
  }
}

function updateRefTable(value, from) {
  const tbody = $('#ref-tbody');
  const cat = UNITS[currentCategory];
  if (!cat || !tbody) return;

  const val = isNaN(value) ? 1 : value;

  tbody.innerHTML = Object.entries(cat.units).map(([key, unit]) => {
    const converted = convertMeasurement(val, from, key, currentCategory);
    return `<tr>
      <td>${unit.name}</td>
      <td class="ref-val">${formatNumber(converted)} ${key.toUpperCase()}</td>
    </tr>`;
  }).join('');
}

// ========== CURRENCY FUNCTIONS ==========
async function fetchExchangeRates(base = 'usd') {
  const statusEl = $('#currency-status');
  const statusText = statusEl?.querySelector('.status-text');
  
  try {
    // Using the free exchange rate API
    const res = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base}.json`);
    
    if (!res.ok) throw new Error('API Error');
    
    const data = await res.json();
    exchangeRates = data[base];
    ratesFetchTime = new Date();
    
    if (statusEl) {
      statusEl.className = 'currency-status online';
      if (statusText) statusText.textContent = `Cập nhật: ${ratesFetchTime.toLocaleTimeString('vi-VN')}`;
    }
    
    return exchangeRates;
  } catch (err) {
    console.error('Failed to fetch rates:', err);
    
    // Fallback rates (approximate)
    exchangeRates = {
      usd: 1, eur: 0.92, gbp: 0.79, jpy: 154.5, vnd: 25435,
      cny: 7.24, krw: 1365, thb: 35.8, sgd: 1.35, aud: 1.55,
      cad: 1.37, chf: 0.88, hkd: 7.82, twd: 32.3, inr: 83.5,
      myr: 4.72, php: 56.8, idr: 15900, btc: 0.0000148,
    };
    
    if (statusEl) {
      statusEl.className = 'currency-status error';
      if (statusText) statusText.textContent = 'Offline (tỉ giá tham khảo)';
    }
    
    return exchangeRates;
  }
}

function populateCurrencySelects() {
  const fromSelect = $('#cur-from-unit');
  const toSelect = $('#cur-to-unit');

  const options = Object.entries(CURRENCIES).map(([code, cur]) =>
    `<option value="${code}">${cur.flag} ${code.toUpperCase()}</option>`
  ).join('');

  fromSelect.innerHTML = options;
  toSelect.innerHTML = options;

  // Default: USD → VND
  fromSelect.value = 'usd';
  toSelect.value = 'vnd';
}

async function doCurrencyConvert() {
  if (!exchangeRates) await fetchExchangeRates();
  
  const value = parseFloat($('#cur-from-value').value);
  const from = $('#cur-from-unit').value;
  const to = $('#cur-to-unit').value;

  // Update names
  updateCurrencyNames(from, to);

  if (isNaN(value) || !exchangeRates) {
    $('#cur-to-value').value = '—';
    $('#cur-rate-text').textContent = '—';
    return;
  }

  // Convert: value in 'from' → USD → 'to'
  const fromRate = exchangeRates[from] || 1;
  const toRate = exchangeRates[to] || 1;
  const result = value * (toRate / fromRate);
  
  const resultEl = $('#cur-to-value');
  resultEl.value = formatCurrency(result, to);
  
  resultEl.classList.remove('flash');
  void resultEl.offsetWidth;
  resultEl.classList.add('flash');

  // Rate info
  const rate = toRate / fromRate;
  $('#cur-rate-text').textContent = 
    `1 ${from.toUpperCase()} = ${formatCurrency(rate, to)} ${to.toUpperCase()}`;
}

function formatCurrency(num, code) {
  if (isNaN(num) || !isFinite(num)) return '—';
  
  if (code === 'btc') {
    return num.toFixed(8);
  }
  
  // For currencies with large denominations (VND, KRW, IDR)
  if (['vnd', 'krw', 'idr'].includes(code)) {
    return Math.round(num).toLocaleString('vi-VN');
  }
  
  if (Math.abs(num) < 0.01 && num !== 0) {
    return num.toExponential(4);
  }
  
  return num.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

function updateCurrencyNames(from, to) {
  const fromCur = CURRENCIES[from];
  const toCur = CURRENCIES[to];
  
  $('#cur-from-name').textContent = fromCur 
    ? `${fromCur.flag} ${fromCur.name} (${fromCur.symbol})` : '—';
  $('#cur-to-name').textContent = toCur 
    ? `${toCur.flag} ${toCur.name} (${toCur.symbol})` : '—';
}

async function renderPopularRates() {
  if (!exchangeRates) await fetchExchangeRates();
  
  const grid = $('#rates-grid');
  if (!grid || !exchangeRates) return;

  grid.innerHTML = POPULAR_PAIRS.map(([from, to]) => {
    const fromCur = CURRENCIES[from];
    const toCur = CURRENCIES[to];
    const fromRate = exchangeRates[from] || 1;
    const toRate = exchangeRates[to] || 1;
    const rate = toRate / fromRate;

    return `
      <div class="rate-item">
        <div class="rate-item__pair">
          <span class="rate-item__flag">${fromCur?.flag || ''}</span>
          <span class="rate-item__code">${from.toUpperCase()}</span>
          <span class="rate-item__arrow">→</span>
          <span class="rate-item__flag">${toCur?.flag || ''}</span>
          <span class="rate-item__code">${to.toUpperCase()}</span>
        </div>
        <span class="rate-item__value">${formatCurrency(rate, to)}</span>
      </div>
    `;
  }).join('');
}

// ========== THEME ==========
function initTheme() {
  const saved = localStorage.getItem('uniconvert-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('uniconvert-theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const btn = $('#btn-swap-theme');
  if (!btn) return;
  
  btn.innerHTML = theme === 'dark'
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
       </svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
       </svg>`;
}

// ========== TOGGLE COLLAPSE ==========
function initCollapse(toggleId, bodyId) {
  const toggle = $(`#${toggleId}`);
  const body = $(`#${bodyId}`);
  if (!toggle || !body) return;

  const header = toggle.closest('.ref-card__header');
  const clickTarget = header || toggle;

  clickTarget.addEventListener('click', () => {
    body.classList.toggle('collapsed');
    toggle.classList.toggle('collapsed');
  });
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  
  // --- Measurement Tab ---
  populateUnits(currentCategory);
  doConvert();

  // Category buttons
  $('#category-bar').addEventListener('click', (e) => {
    const btn = e.target.closest('.cat-btn');
    if (!btn) return;
    
    $$('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    currentCategory = btn.dataset.cat;
    populateUnits(currentCategory);
    
    // Reset value
    $('#from-value').value = '1';
    doConvert();
  });

  // Input events
  $('#from-value').addEventListener('input', doConvert);
  $('#from-unit').addEventListener('change', doConvert);
  $('#to-unit').addEventListener('change', doConvert);

  // Swap units
  $('#btn-swap').addEventListener('click', () => {
    const fromUnit = $('#from-unit');
    const toUnit = $('#to-unit');
    const fromVal = $('#from-value');
    const toVal = $('#to-value');
    
    const tmpUnit = fromUnit.value;
    fromUnit.value = toUnit.value;
    toUnit.value = tmpUnit;
    
    // Also swap the value
    const resultVal = parseFloat(toVal.value.replace(/\./g, '').replace(',', '.'));
    if (!isNaN(resultVal)) {
      fromVal.value = resultVal;
    }
    
    doConvert();
  });

  // --- Currency Tab ---
  populateCurrencySelects();
  
  // Tab switching
  $$('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const tabName = tab.dataset.tab;
      $$('.panel').forEach(p => p.classList.remove('active'));
      $(`#panel-${tabName}`).classList.add('active');
      
      // Lazy load currency data
      if (tabName === 'currency' && !exchangeRates) {
        fetchExchangeRates().then(() => {
          doCurrencyConvert();
          renderPopularRates();
        });
      }
    });
  });

  // Currency input events
  $('#cur-from-value').addEventListener('input', doCurrencyConvert);
  $('#cur-from-unit').addEventListener('change', () => {
    // Refetch rates when base changes
    fetchExchangeRates().then(() => {
      doCurrencyConvert();
      renderPopularRates();
    });
  });
  $('#cur-to-unit').addEventListener('change', doCurrencyConvert);

  // Currency swap
  $('#btn-cur-swap').addEventListener('click', () => {
    const fromUnit = $('#cur-from-unit');
    const toUnit = $('#cur-to-unit');
    const fromVal = $('#cur-from-value');
    const toVal = $('#cur-to-value');
    
    const tmpUnit = fromUnit.value;
    fromUnit.value = toUnit.value;
    toUnit.value = tmpUnit;
    
    const resultStr = toVal.value.replace(/\./g, '').replace(',', '.');
    const resultVal = parseFloat(resultStr);
    if (!isNaN(resultVal)) {
      fromVal.value = resultVal;
    }
    
    fetchExchangeRates().then(() => {
      doCurrencyConvert();
      renderPopularRates();
    });
  });

  // Theme toggle
  $('#btn-swap-theme').addEventListener('click', toggleTheme);

  // Collapse toggles
  initCollapse('ref-toggle', 'ref-body');
  initCollapse('rates-toggle', 'rates-body');

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Tab key switches panels
    if (e.key === '1' && e.altKey) {
      e.preventDefault();
      $$('.tab')[0].click();
    }
    if (e.key === '2' && e.altKey) {
      e.preventDefault();
      $$('.tab')[1].click();
    }
  });
});
