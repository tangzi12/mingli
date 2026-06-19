// @ts-nocheck
/**
 * 八字排盘引擎 (BaZi / Four Pillars of Destiny)
 *
 * 天干 Heavenly Stems: 甲乙丙丁戊己庚辛壬癸
 * 地支 Earthly Branches: 子丑寅卯辰巳午未申酉戌亥
 * 60甲子 Sexagenary Cycle
 */

// ---- Constants ----

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const FIVE_ELEMENTS_STEM = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];
const FIVE_ELEMENTS_BRANCH = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'];
const YIN_YANG_STEM = ['阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴'];

// 地支藏干 (Hidden Stems in Branches)
const HIDDEN_STEMS = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲'],
};

// 纳音五行 (Na Yin Five Elements)
const NA_YIN = [
  '海中金', '炉中火', '大林木', '路旁土', '剑锋金', '山头火',
  '涧下水', '城头土', '白蜡金', '杨柳木', '泉中水', '屋上土',
  '霹雳火', '松柏木', '流年水', '沙中金', '山下火', '平地木',
  '壁上土', '金箔金', '覆灯火', '天河水', '大驿土', '钗钏金',
  '桑柘木', '柘榴木', '大海水', '石榴木', '山下火', '沙中土', // 26=「柘榴木」实际应为「大溪水」，常用「大海水」指27
];

// 六十甲子表 (stem + branch pairs 0-59)
function getSexagenary(n) {
  return STEMS[n % 10] + BRANCHES[n % 12];
}

// ---- Solar Terms (节气) ----

// Approximate solar term dates (month, day) for a typical year
// Index 0 = 立春 (Start of Spring, month pillar 1)
const SOLAR_TERMS = [
  { name: '立春', m: 2, d: 4 },   // index 0 - year changes here
  { name: '惊蛰', m: 3, d: 6 },   // index 1
  { name: '清明', m: 4, d: 5 },   // index 2
  { name: '立夏', m: 5, d: 6 },   // index 3
  { name: '芒种', m: 6, d: 6 },   // index 4
  { name: '小暑', m: 7, d: 7 },   // index 5
  { name: '立秋', m: 8, d: 8 },   // index 6
  { name: '白露', m: 9, d: 8 },   // index 7
  { name: '寒露', m: 10, d: 8 },  // index 8
  { name: '立冬', m: 11, d: 8 },  // index 9
  { name: '大雪', m: 12, d: 7 },  // index 10
  { name: '小寒', m: 1, d: 6 },   // index 11
];

// ---- Julian Day Number for Day Pillar ----

function julianDay(year, month, day) {
  let y = year, m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524;
}

// ---- Core Calculation ----

export function calculateBazi(year, month, day, hour = 0) {
  // 1. Year Pillar (年柱) - changes at 立春
  const solarYear = getSolarTermYear(year, month, day);
  const yearStemIndex = (solarYear - 4) % 10;
  // Year Stem: (year - 4) % 10
  // Year Branch: (year - 4) % 12
  const yearPillar = getSexagenary((solarYear - 4) % 60);

  // 2. Month Pillar (月柱) - based on solar term
  const monthIndex = getMonthPillarIndex(year, month, day);
  const monthStemIndex = getMonthStem(yearStemIndex, monthIndex);
  const monthBranchIndex = (monthIndex + 2) % 12; // solar term 0=立春=寅(branch 2)
  const monthPillar = STEMS[monthStemIndex] + BRANCHES[monthBranchIndex];

  // 3. Day Pillar (日柱) - based on Julian Day
  const jd = julianDay(year, month, day);
  // Reference: 1900-01-01 = JD 2415021 = 甲戌日 (sexagenary index 10)
  const daySexagenary = ((jd - 2415021) % 60 + 60) % 60; // ensure positive
  const dayPillar = getSexagenary(daySexagenary);
  const dayStemIndex = daySexagenary % 10;
  const dayBranchIndex = daySexagenary % 12;

  // 4. Hour Pillar (时柱)
  const hourBranchIndex = getHourBranch(hour);
  const hourStemIndex = getHourStem(dayStemIndex, hourBranchIndex);
  const hourPillar = STEMS[hourStemIndex] + BRANCHES[hourBranchIndex];

  // 5. Ten Gods (十神)
  const tenGods = calculateTenGods(dayStemIndex, [
    { label: '年', stemIdx: yearStemIndex },
    { label: '月', stemIdx: monthStemIndex },
    { label: '日', stemIdx: dayStemIndex },
    { label: '时', stemIdx: hourStemIndex },
  ]);

  // 6. 纳音
  const naYin = {
    year: NA_YIN[((solarYear - 4) % 60 + 60) % 60] || '',
    month: NA_YIN[(monthStemIndex * 12 + monthBranchIndex) % 60] || '',
    day: NA_YIN[daySexagenary] || '',
    hour: NA_YIN[(hourStemIndex * 12 + hourBranchIndex) % 60] || '',
  };

  // 7. 藏干
  const hiddenStems = {
    year: HIDDEN_STEMS[BRANCHES[(solarYear - 4) % 12]] || [],
    month: HIDDEN_STEMS[BRANCHES[monthBranchIndex]] || [],
    day: HIDDEN_STEMS[BRANCHES[dayBranchIndex]] || [],
    hour: HIDDEN_STEMS[BRANCHES[hourBranchIndex]] || [],
  };

  // 8. Luck Pillars (大运)
  const luckPillars = calculateLuckPillars(yearStemIndex, monthStemIndex, monthBranchIndex, year, month, day);

  // 9. Current year pillar (流年)
  const currentYear = new Date().getFullYear();
  const currentYearPillar = getSexagenary((currentYear - 4) % 60);

  return {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    dayMaster: STEMS[dayStemIndex],
    dayStemIndex,
    dayBranchIndex,
    yearStemIndex,
    tenGods,
    naYin,
    hiddenStems,
    luckPillars,
    currentYearPillar,
    fiveElements: {
      year: FIVE_ELEMENTS_STEM[yearStemIndex],
      month: FIVE_ELEMENTS_STEM[monthStemIndex],
      day: FIVE_ELEMENTS_STEM[dayStemIndex],
      hour: FIVE_ELEMENTS_STEM[hourStemIndex],
    },
    branches: {
      year: BRANCHES[(solarYear - 4) % 12],
      month: BRANCHES[monthBranchIndex],
      day: BRANCHES[dayBranchIndex],
      hour: BRANCHES[hourBranchIndex],
    },
    stems: {
      year: STEMS[yearStemIndex],
      month: STEMS[monthStemIndex],
      day: STEMS[dayStemIndex],
      hour: STEMS[hourStemIndex],
    },
    yinYang: YIN_YANG_STEM[dayStemIndex],
  };
}

// ---- Helper Functions ----

function getSolarTermYear(year, month, day) {
  // If before 立春 (approx Feb 4), year pillar belongs to previous year
  if (month < 2 || (month === 2 && day < 4)) return year - 1;
  return year;
}

function getMonthPillarIndex(year, month, day) {
  // Each month pillar covers from one solar term to the next.
  // Iterate forward, returning the last term whose date is <= the given date.
  let result = 11; // default: before 立春 → 丑月 (小寒 to 立春)

  // Special case: dates before 小寒 (Jan ~6) are in 子月 (大雪→小寒, index 10)
  if (month === 1 && day < 6) return 10;

  for (let i = 0; i < SOLAR_TERMS.length; i++) {
    const st = SOLAR_TERMS[i];
    if (month > st.m || (month === st.m && day >= st.d)) {
      result = i;
    } else {
      // For months before 立春 (month=1 or early Feb), we've already handled
      // the wrap-around above. For normal months, break once we overshoot.
      if (month >= 2) break;
    }
  }
  return result;
}

function getMonthStem(yearStemIndex, monthIndex) {
  // Month 1 stem based on year stem (五虎遁)
  // 甲己→丙, 乙庚→戊, 丙辛→庚, 丁壬→壬, 戊癸→甲
  const month1Stems = [2, 4, 6, 8, 0]; // 丙=2, 戊=4, 庚=6, 壬=8, 甲=0
  const group = yearStemIndex % 5; // 合化分组: (0,5), (1,6), (2,7), (3,8), (4,9)
  return (month1Stems[group] + monthIndex) % 10;
}

function getHourBranch(hour) {
  // 子时 23:00-00:59, 丑时 01:00-02:59, etc.
  return Math.floor((hour + 1) / 2) % 12;
}

function getHourStem(dayStemIndex, hourBranchIndex) {
  // Hour stem based on day stem (五鼠遁)
  // dayStem 甲己→甲, 乙庚→丙, 丙辛→戊, 丁壬→庚, 戊癸→壬
  const hour0Stems = [0, 2, 4, 6, 8]; // 甲=0, 丙=2, 戊=4, 庚=6, 壬=8
  const group = dayStemIndex % 5; // 合化分组
  return (hour0Stems[group] + hourBranchIndex) % 10;
}

function calculateTenGods(dayMasterIdx, pillars) {
  // 十神 based on day master
  const GOD_NAMES = [
    // Same element, same yin-yang = 比肩
    // Same element, opposite yin-yang = 劫财
    // I generate = 食神 (same yin-yang), 伤官 (opposite)
    // I overcome = 偏财 (same yin-yang), 正财 (opposite)
    // Overcomes me = 七杀 (same yin-yang), 正官 (opposite)
    // Generates me = 偏印 (same yin-yang), 正印 (opposite)
  ];

  const result = {};
  const dmElement = FIVE_ELEMENTS_STEM[dayMasterIdx];
  const dmYY = YIN_YANG_STEM[dayMasterIdx];

  const elementOrder = ['木', '火', '土', '金', '水'];
  const generateCycle = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  const overcomeCycle = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };
  const generatedBy = { '火': '木', '土': '火', '金': '土', '水': '金', '木': '水' };
  const overcomeBy = { '土': '木', '水': '土', '火': '水', '金': '火', '木': '金' };

  pillars.forEach(p => {
    const sElement = FIVE_ELEMENTS_STEM[p.stemIdx];
    const sYY = YIN_YANG_STEM[p.stemIdx];
    const sameYY = dmYY === sYY;

    let god;
    if (dmElement === sElement) {
      god = sameYY ? '比肩' : '劫财';
    } else if (generateCycle[dmElement] === sElement) {
      god = sameYY ? '食神' : '伤官';
    } else if (overcomeCycle[dmElement] === sElement) {
      god = sameYY ? '偏财' : '正财';
    } else if (overcomeBy[dmElement] === sElement) {
      god = sameYY ? '七杀' : '正官';
    } else if (generatedBy[dmElement] === sElement) {
      god = sameYY ? '偏印' : '正印';
    }
    result[p.label] = god;
  });

  return result;
}

function calculateLuckPillars(yearStemIdx, monthStemIdx, monthBranchIdx, birthYear, birthMonth, birthDay) {
  // Determine direction and starting age
  // 阳年男/阴年女 → forward (顺排); 阴年男/阳年女 → backward (逆排)
  const yy = YIN_YANG_STEM[yearStemIdx];
  const isYangYear = yy === '阳';

  // Default to male for now (user will specify gender later)
  // For simplicity, assume 顺排 for 阳年, 逆排 for 阴年
  const forward = isYangYear;

  // Calculate starting age: count days to next/prev solar term
  const startAge = calculateStartAge(birthYear, birthMonth, birthDay, forward);

  // Generate 8 luck pillars
  const luckPillars = [];
  for (let i = 0; i < 8; i++) {
    let stemIdx, branchIdx;
    if (forward) {
      stemIdx = (monthStemIdx + 1 + i) % 10;
      branchIdx = (monthBranchIdx + 1 + i) % 12;
    } else {
      stemIdx = (monthStemIdx - 1 - i + 100) % 10;
      branchIdx = (monthBranchIdx - 1 - i + 100) % 12;
    }
    luckPillars.push({
      age: startAge + i * 10,
      pillar: STEMS[stemIdx] + BRANCHES[branchIdx],
      stem: STEMS[stemIdx],
      branch: BRANCHES[branchIdx],
    });
  }

  return luckPillars;
}

function calculateStartAge(year, month, day, forward) {
  // Simplified: count days to next/prev solar term
  // For more accuracy, this should use precise solar term dates
  // Default ~3-8 years
  // Find which solar term section we're in and estimate days
  const monthIdx = getMonthPillarIndex(year, month, day);
  const currentTerm = SOLAR_TERMS[monthIdx];
  const nextTerm = SOLAR_TERMS[(monthIdx + 1) % 12];

  // Rough day-in-month calculation
  const dayOfYear = month * 30 + day; // very rough
  const termDayOfYear = currentTerm.m * 30 + currentTerm.d;

  let days;
  if (forward) {
    // Days to next solar term
    const nextDayOfYear = nextTerm.m * 30 + nextTerm.d;
    days = nextDayOfYear - dayOfYear;
    if (days <= 0) days += 365;
  } else {
    // Days from previous solar term to birth
    days = dayOfYear - termDayOfYear;
    if (days < 0) days += 365;
  }

  // Convert days to years (3 days = 1 year, 1 day = 4 months)
  const startAge = Math.round(days / 3);
  return Math.max(1, Math.min(10, startAge));
}

// ---- Public API ----

export function getCurrentYearPillar() {
  const y = new Date().getFullYear();
  return {
    pillar: getSexagenary((y - 4) % 60),
    stem: STEMS[(y - 4) % 10],
    branch: BRANCHES[(y - 4) % 12],
  };
}

export function getSexagenaryName(index) {
  return getSexagenary(((index % 60) + 60) % 60);
}
