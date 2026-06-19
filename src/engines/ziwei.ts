// @ts-nocheck
/**
 * 紫微斗数排盘引擎 (Zi Wei Dou Shu)
 *
 * 命宫定位 → 十二宫 → 星曜安放 → 四化
 */

// ---- Constants ----
const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const PALACE_NAMES = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '交友', '官禄', '田宅', '福德', '父母'];

// 五行局: 水2, 木3, 金4, 土5, 火6
const NA_YIN_ELEMENTS = [
  '金', '金', '火', '火', '木', '木', '土', '土', '金', '金', // 0-9
  '水', '水', '火', '火', '木', '木', '土', '土', '金', '金', // 10-19
  '水', '水', '火', '火', '木', '木', '水', '水', '土', '土', // 20-29
  '金', '金', '水', '水', '火', '火', '木', '木', '木', '木', // 30-39 (34起)
];

// Actually need proper mapping from sexagenary index to 五行局 element
const GAN_ZHI_NAYIN = [
  { element: '金', bureau: 4 }, // 甲子 0
  { element: '金', bureau: 4 }, // 乙丑 1
  { element: '火', bureau: 6 }, // 丙寅 2
  { element: '火', bureau: 6 }, // 丁卯 3
  { element: '木', bureau: 3 }, // 戊辰 4
  { element: '木', bureau: 3 }, // 己巳 5
  { element: '土', bureau: 5 }, // 庚午 6
  { element: '土', bureau: 5 }, // 辛未 7
  { element: '金', bureau: 4 }, // 壬申 8
  { element: '金', bureau: 4 }, // 癸酉 9
  { element: '火', bureau: 6 }, // 甲戌 10
  { element: '火', bureau: 6 }, // 乙亥 11
  { element: '水', bureau: 2 }, // 丙子 12
  { element: '水', bureau: 2 }, // 丁丑 13
  { element: '土', bureau: 5 }, // 戊寅 14
  { element: '土', bureau: 5 }, // 己卯 15
  { element: '金', bureau: 4 }, // 庚辰 16
  { element: '金', bureau: 4 }, // 辛巳 17
  { element: '水', bureau: 2 }, // 壬午 18
  { element: '水', bureau: 2 }, // 癸未 19
  { element: '木', bureau: 3 }, // 甲申 20
  { element: '木', bureau: 3 }, // 乙酉 21
  { element: '土', bureau: 5 }, // 丙戌 22
  { element: '土', bureau: 5 }, // 丁亥 23
  { element: '火', bureau: 6 }, // 戊子 24
  { element: '火', bureau: 6 }, // 己丑 25
  { element: '木', bureau: 3 }, // 庚寅 26
  { element: '木', bureau: 3 }, // 辛卯 27
  { element: '水', bureau: 2 }, // 壬辰 28
  { element: '水', bureau: 2 }, // 癸巳 29
  { element: '金', bureau: 4 }, // 甲午 30
  { element: '金', bureau: 4 }, // 乙未 31
  { element: '火', bureau: 6 }, // 丙申 32
  { element: '火', bureau: 6 }, // 丁酉 33
  { element: '木', bureau: 3 }, // 戊戌 34
  { element: '木', bureau: 3 }, // 己亥 35
  { element: '土', bureau: 5 }, // 庚子 36
  { element: '土', bureau: 5 }, // 辛丑 37
  { element: '金', bureau: 4 }, // 壬寅 38
  { element: '金', bureau: 4 }, // 癸卯 39
  { element: '水', bureau: 2 }, // 甲辰 40
  { element: '水', bureau: 2 }, // 乙巳 41
  { element: '火', bureau: 6 }, // 丙午 42
  { element: '火', bureau: 6 }, // 丁未 43
  { element: '木', bureau: 3 }, // 戊申 44
  { element: '木', bureau: 3 }, // 己酉 45
  { element: '土', bureau: 5 }, // 庚戌 46
  { element: '土', bureau: 5 }, // 辛亥 47
  { element: '金', bureau: 4 }, // 壬子 48
  { element: '金', bureau: 4 }, // 癸丑 49
  { element: '木', bureau: 3 }, // 甲寅 50
  { element: '木', bureau: 3 }, // 乙卯 51
  { element: '水', bureau: 2 }, // 丙辰 52
  { element: '水', bureau: 2 }, // 丁巳 53
  { element: '火', bureau: 6 }, // 戊午 54
  { element: '火', bureau: 6 }, // 己未 55
  { element: '木', bureau: 3 }, // 庚申 56
  { element: '木', bureau: 3 }, // 辛酉 57
  { element: '水', bureau: 2 }, // 壬戌 58
  { element: '水', bureau: 2 }, // 癸亥 59
];

// 紫微星 positioning table: bureau → [day quotient → branch offset from 寅]
// Standard lookup tables for Zi Wei star position
const ZIWEI_TABLE = {
  2: [ // 水二局
    null, 0, 0,   // day 1,2
    2, 2, 3, 3,   // day 3-6
    4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, // day 7-20
    0, 0, 1, 1, 2, 2, 3, 3, 4, 4, // day 21-30
  ],
  3: [ // 木三局
    null, 0, 1, 2, // day 1-4
    2, 3, 4, 5, 6, 7, // day 5-10
    8, 9, 10, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0, 1, 2, 3, 4, 5, // day 11-30
  ],
  4: [ // 金四局
    null, 0, 1, 2, 3, // day 1-5
    4, 5, 6, 7, 8, 9, 10, 0, // day 6-13
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0, 1, 2, 3, 4, 5, 6, // day 14-30
  ],
  5: [ // 土五局
    null, 0, 1, 2, 3, 4, // day 1-6
    5, 6, 7, 8, 9, 10, 0, 1, 2, 3, 4, // day 7-17
    5, 6, 7, 8, 9, 10, 0, 1, 2, 3, 4, 5, 6, // day 18-30
  ],
  6: [ // 火六局
    null, 0, 1, 2, 3, 4, 5, // day 1-7
    6, 7, 8, 9, 10, 0, 1, 2, 3, 4, 5, 6, 7, 8, // day 8-21
    9, 10, 0, 1, 2, 3, 4, 5, 6, // day 22-30
  ],
};

// 四化表 (based on 生年天干)
const SIHUA_TABLE = {
  '甲': { 化禄: '廉贞', 化权: '破军', 化科: '武曲', 化忌: '太阳' },
  '乙': { 化禄: '天机', 化权: '天梁', 化科: '紫微', 化忌: '太阴' },
  '丙': { 化禄: '天同', 化权: '天机', 化科: '文昌', 化忌: '廉贞' },
  '丁': { 化禄: '太阴', 化权: '天同', 化科: '天机', 化忌: '巨门' },
  '戊': { 化禄: '贪狼', 化权: '太阴', 化科: '右弼', 化忌: '天机' },
  '己': { 化禄: '武曲', 化权: '贪狼', 化科: '天梁', 化忌: '文曲' },
  '庚': { 化禄: '太阳', 化权: '武曲', 化科: '太阴', 化忌: '天同' },
  '辛': { 化禄: '巨门', 化权: '太阳', 化科: '文曲', 化忌: '文昌' },
  '壬': { 化禄: '天梁', 化权: '紫微', 化科: '左辅', 化忌: '武曲' },
  '癸': { 化禄: '破军', 化权: '巨门', 化科: '太阴', 化忌: '贪狼' },
};

// Star brightness lookup (庙旺利陷) - simplified
const STAR_BRIGHTNESS = {
  '紫微': { '子': '庙', '丑': '庙', '寅': '旺', '卯': '旺', '辰': '得', '巳': '旺', '午': '庙', '未': '庙', '申': '旺', '酉': '旺', '戌': '得', '亥': '旺' },
  '天机': { '子': '庙', '丑': '陷', '寅': '得', '卯': '旺', '辰': '利', '巳': '陷', '午': '庙', '未': '陷', '申': '利', '酉': '旺', '戌': '陷', '亥': '利' },
  '太阳': { '子': '陷', '丑': '陷', '寅': '旺', '卯': '庙', '辰': '旺', '巳': '旺', '午': '庙', '未': '得', '申': '得', '酉': '陷', '戌': '陷', '亥': '陷' },
  '武曲': { '子': '旺', '丑': '庙', '寅': '得', '卯': '利', '辰': '庙', '巳': '旺', '午': '旺', '未': '庙', '申': '得', '酉': '庙', '戌': '旺', '亥': '利' },
  '天同': { '子': '旺', '丑': '陷', '寅': '利', '卯': '旺', '辰': '陷', '巳': '庙', '午': '陷', '未': '陷', '申': '旺', '酉': '陷', '戌': '得', '亥': '庙' },
  '廉贞': { '子': '陷', '丑': '利', '寅': '庙', '卯': '陷', '辰': '陷', '巳': '陷', '午': '旺', '未': '庙', '申': '利', '酉': '陷', '戌': '陷', '亥': '陷' },
  '天府': { '子': '庙', '丑': '庙', '寅': '庙', '卯': '陷', '辰': '庙', '巳': '得', '午': '旺', '未': '庙', '申': '利', '酉': '旺', '戌': '庙', '亥': '庙' },
  '太阴': { '子': '庙', '丑': '陷', '寅': '陷', '卯': '陷', '辰': '陷', '巳': '陷', '午': '陷', '未': '陷', '申': '旺', '酉': '庙', '戌': '庙', '亥': '旺' },
  '贪狼': { '子': '旺', '丑': '庙', '寅': '利', '卯': '庙', '辰': '陷', '巳': '陷', '午': '旺', '未': '庙', '申': '利', '酉': '陷', '戌': '庙', '亥': '陷' },
  '巨门': { '子': '旺', '丑': '陷', '寅': '庙', '卯': '庙', '辰': '陷', '巳': '旺', '午': '旺', '未': '陷', '申': '旺', '酉': '庙', '戌': '陷', '亥': '旺' },
  '天相': { '子': '庙', '丑': '庙', '寅': '庙', '卯': '陷', '辰': '得', '巳': '陷', '午': '庙', '未': '陷', '申': '得', '酉': '陷', '戌': '得', '亥': '得' },
  '天梁': { '子': '庙', '丑': '旺', '寅': '庙', '卯': '旺', '辰': '庙', '巳': '陷', '午': '庙', '未': '旺', '申': '利', '酉': '陷', '戌': '庙', '亥': '陷' },
  '七杀': { '子': '旺', '丑': '庙', '寅': '庙', '卯': '旺', '辰': '陷', '巳': '陷', '午': '旺', '未': '庙', '申': '陷', '酉': '庙', '戌': '陷', '亥': '陷' },
  '破军': { '子': '庙', '丑': '旺', '寅': '得', '卯': '陷', '辰': '旺', '巳': '陷', '午': '庙', '未': '旺', '申': '陷', '酉': '陷', '戌': '陷', '亥': '得' },
};

// ---- Core Calculation ----

export function calculateZiwei(yearStemIdx, yearBranchIdx, lunarMonth, lunarDay, hourBranchIdx, gender = 'male') {
  // yearStemIdx and yearBranchIdx are 0-based (甲=0, 子=0)

  // 1. 命宫 (Destiny Palace) positioning
  // 从寅(2)起正月(1), 顺数至生月, 再从生月逆数至生时
  const monthBranchIdx = (2 + lunarMonth - 1) % 12; // 正月→寅(2), 二月→卯(3), etc.
  const minggongBranchIdx = (monthBranchIdx - hourBranchIdx + 12) % 12;

  // 2. 命宫天干 (using 五虎遁 based on year stem)
  const minggongStemIdx = getPalaceStem(yearStemIdx, minggongBranchIdx);

  // 3. 十二宫 layout (counter-clockwise from 命宫)
  const palaces = [];
  for (let i = 0; i < 12; i++) {
    const branchIdx = (minggongBranchIdx - i + 12) % 12;
    const stemIdx = getPalaceStem(yearStemIdx, branchIdx);
    palaces.push({
      name: PALACE_NAMES[i],
      branch: BRANCHES[branchIdx],
      stem: STEMS[stemIdx],
      branchIdx,
      stemIdx,
      majorStars: [],
      minorStars: [],
      sihua: null,
    });
  }

  // 4. 五行局 (from 命宫 干支)
  const mgSexagenary = minggongStemIdx * 12 + minggongBranchIdx;
  const bureau = GAN_ZHI_NAYIN[mgSexagenary]?.bureau || 2;
  const bureauElement = GAN_ZHI_NAYIN[mgSexagenary]?.element || '水';

  // 5. 紫微星 position
  const ziweiBranchOffset = getZiweiPosition(bureau, lunarDay);
  const ziweiPalaceIdx = findPalaceByBranchOffset(palaces, ziweiBranchOffset);

  // 6. 安紫微系六星
  placeZiweiSeries(palaces, ziweiPalaceIdx);

  // 7. 安天府星 + 天府系八星
  placeTianfuSeries(palaces, ziweiPalaceIdx);

  // 8. 月系星 (左辅, 右弼, 文昌, 文曲, 地劫, 地空)
  placeMonthStars(palaces, lunarMonth, hourBranchIdx);

  // 9. 时系星 (火星, 铃星)
  placeHourStars(palaces, hourBranchIdx, yearBranchIdx);

  // 10. 年系星 (禄存, 擎羊, 陀罗, 天魁, 天钺)
  placeYearStars(palaces, yearStemIdx);

  // 11. 四化
  const sihuaStars = SIHUA_TABLE[STEMS[yearStemIdx]] || {};
  applySihua(palaces, sihuaStars);

  // 12. Add brightness info
  palaces.forEach(p => {
    p.majorStars = p.majorStars.map(s => ({
      name: s,
      brightness: STAR_BRIGHTNESS[s]?.[p.branch] || '得',
      sihua: p.sihua === s ? Object.keys(sihuaStars).find(k => sihuaStars[k] === s) : null,
    }));
  });

  return {
    palaces,
    minggong: palaces[0],
    bureau,
    bureauElement,
    yearStem: STEMS[yearStemIdx],
    yearBranch: BRANCHES[yearBranchIdx],
    ziweiPalaceIdx,
  };
}

// ---- Helper Functions ----

function getPalaceStem(yearStemIdx, branchIdx) {
  // 五虎遁: year stem → 寅的天干
  const yinStems = [2, 4, 6, 8, 0]; // 甲己→丙(2), 乙庚→戊(4), 丙辛→庚(6), 丁壬→壬(8), 戊癸→甲(0)
  const group = Math.floor(yearStemIdx / 2) % 5;
  return (yinStems[group] + (branchIdx - 2 + 12) % 12) % 10;
}

function getZiweiPosition(bureau, day) {
  // Use the lookup table
  const table = ZIWEI_TABLE[bureau];
  if (!table) return 0;
  if (day <= 0 || day >= table.length) return 0;
  return table[day];
}

function findPalaceByBranchOffset(palaces, branchOffset) {
  // branchOffset is relative to 寅 (index 2)
  const targetBranchIdx = (2 + branchOffset) % 12;
  for (let i = 0; i < palaces.length; i++) {
    if (palaces[i].branchIdx === targetBranchIdx) return i;
  }
  return 0;
}

function findPalaceByBranch(palaces, branchIdx) {
  for (let i = 0; i < palaces.length; i++) {
    if (palaces[i].branchIdx === branchIdx) return i;
  }
  return 0;
}

function placeZiweiSeries(palaces, ziweiIdx) {
  // 紫微系: 紫微, 天机(隔一), (空), 太阳(隔三), 武曲(隔四), 天同(隔五), 廉贞(隔七)
  const stars = ['紫微', null, '天机', null, '太阳', '武曲', '天同', null, null, '廉贞'];
  // Actually the pattern is: 紫微 at ziweiIdx, then:
  // 紫微(0) → 天机(-1) → 空 → 太阳(-3) → 武曲(-4) → 天同(-5) → 廉贞(对面, -6)
  const offsets = {
    '紫微': 0,
    '天机': -1,
    '太阳': -3,
    '武曲': -4,
    '天同': -5,
    '廉贞': -6,
  };

  for (const [name, offset] of Object.entries(offsets)) {
    const idx = (ziweiIdx + offset + 12) % 12;
    palaces[idx].majorStars.push(name);
  }
}

function placeTianfuSeries(palaces, ziweiIdx) {
  // 天府 = 紫微 + 4 (or 紫微 - 8, opposite + 4)
  // 天府系: 天府, 太阴(前1), 贪狼(前2), 巨门(前3), 天相(前4), 天梁(前5), 七杀(前6), 破军(前10)
  const tianfuIdx = (ziweiIdx + 4) % 12;
  palaces[tianfuIdx].majorStars.push('天府');

  const tianfuSeries = {
    '太阴': 1,
    '贪狼': 2,
    '巨门': 3,
    '天相': 4,
    '天梁': 5,
    '七杀': 6,
    '破军': 10,
  };

  for (const [name, offset] of Object.entries(tianfuSeries)) {
    const idx = (tianfuIdx + offset) % 12;
    palaces[idx].majorStars.push(name);
  }
}

function placeMonthStars(palaces, lunarMonth, hourBranchIdx) {
  // 左辅: 辰起正月, 顺数至生月
  const zuofuIdx = findPalaceByBranch(palaces, (2 + lunarMonth - 1 + 2) % 12); // 辰=4, 正月→辰
  palaces[zuofuIdx].minorStars.push('左辅');

  // 右弼: 戌起正月, 逆数至生月
  const youbiIdx = findPalaceByBranch(palaces, (10 - lunarMonth + 1 + 12) % 12); // 戌=10
  palaces[youbiIdx].minorStars.push('右弼');

  // 文昌: 戌起子时, 逆数至生时
  const wenchangIdx = findPalaceByBranch(palaces, (10 - hourBranchIdx + 12) % 12);
  palaces[wenchangIdx].minorStars.push('文昌');

  // 文曲: 辰起子时, 顺数至生时
  const wenquIdx = findPalaceByBranch(palaces, (4 + hourBranchIdx) % 12); // 辰=4
  palaces[wenquIdx].minorStars.push('文曲');

  // 地劫: 亥起子时, 顺数至生时
  const dijieIdx = findPalaceByBranch(palaces, (11 + hourBranchIdx) % 12); // 亥=11
  palaces[dijieIdx].minorStars.push('地劫');

  // 地空: 亥起子时, 逆数至生时
  const dikongIdx = findPalaceByBranch(palaces, (11 - hourBranchIdx + 12) % 12);
  palaces[dikongIdx].minorStars.push('地空');
}

function placeHourStars(palaces, hourBranchIdx, yearBranchIdx) {
  // 火星: 基于年支和时支
  const huoTable = {
    '寅午戌': [1, 3, 5, 7, 9, 11, 1, 3, 5, 7, 9, 11],
    '申子辰': [1, 3, 5, 7, 9, 11, 1, 3, 5, 7, 9, 11],
    '巳酉丑': [7, 9, 11, 1, 3, 5, 7, 9, 11, 1, 3, 5],
    '亥卯未': [7, 9, 11, 1, 3, 5, 7, 9, 11, 1, 3, 5],
  };
  const triads = ['寅午戌', '申子辰', '巳酉丑', '亥卯未'];
  let triadGroup = triads.find(t => t.includes(BRANCHES[yearBranchIdx])) || '寅午戌';
  const huoBranchIdx = huoTable[triadGroup]?.[hourBranchIdx] || 1;
  const huoIdx = findPalaceByBranch(palaces, (huoBranchIdx - 1 + 12) % 12);
  palaces[huoIdx].minorStars.push('火星');

  // 铃星: similar pattern
  const lingTable = {
    '寅午戌': [11, 1, 3, 5, 7, 9, 11, 1, 3, 5, 7, 9],
    '申子辰': [11, 1, 3, 5, 7, 9, 11, 1, 3, 5, 7, 9],
    '巳酉丑': [5, 7, 9, 11, 1, 3, 5, 7, 9, 11, 1, 3],
    '亥卯未': [5, 7, 9, 11, 1, 3, 5, 7, 9, 11, 1, 3],
  };
  const lingBranchIdx = lingTable[triadGroup]?.[hourBranchIdx] || 11;
  const lingIdx = findPalaceByBranch(palaces, (lingBranchIdx - 1 + 12) % 12);
  palaces[lingIdx].minorStars.push('铃星');
}

function placeYearStars(palaces, yearStemIdx) {
  // 禄存: based on year stem 甲→寅, 乙→卯, ..., 癸→亥 (but skipping 辰戌丑未)
  const lucunMap = {
    '甲': 2, '乙': 3, '丙': 5, '丁': 6, '戊': 5, '己': 6,
    '庚': 8, '辛': 9, '壬': 11, '癸': 0,
  };
  const lucunBranchIdx = lucunMap[STEMS[yearStemIdx]];
  if (lucunBranchIdx !== undefined) {
    const luIdx = findPalaceByBranch(palaces, lucunBranchIdx);
    palaces[luIdx].minorStars.push('禄存');

    // 擎羊: 禄存前一位
    const qyIdx = findPalaceByBranch(palaces, (lucunBranchIdx + 1) % 12);
    palaces[qyIdx].minorStars.push('擎羊');

    // 陀罗: 禄存后一位
    const tlIdx = findPalaceByBranch(palaces, (lucunBranchIdx - 1 + 12) % 12);
    palaces[tlIdx].minorStars.push('陀罗');
  }

  // 天魁天钺: based on year stem
  const tianguiMap = { '甲': 1, '乙': 0, '丙': 11, '丁': 10, '戊': 1, '己': 0, '庚': 11, '辛': 6, '壬': 3, '癸': 3 };
  const tiangyueMap = { '甲': 7, '乙': 8, '丙': 10, '丁': 11, '戊': 7, '己': 8, '庚': 10, '辛': 5, '壬': 3, '癸': 3 };

  const tgIdx = findPalaceByBranch(palaces, tianguiMap[STEMS[yearStemIdx]]);
  palaces[tgIdx].minorStars.push('天魁');

  const tyIdx = findPalaceByBranch(palaces, tiangyueMap[STEMS[yearStemIdx]]);
  palaces[tyIdx].minorStars.push('天钺');
}

function applySihua(palaces, sihuaStars) {
  for (const [change, starName] of Object.entries(sihuaStars)) {
    for (const p of palaces) {
      if (p.majorStars.includes(starName)) {
        p.sihua = starName;
        p.sihuaType = change; // 化禄, 化权, 化科, 化忌
      }
    }
  }
}

// ---- public helpers ----

export function getPalaceName(index) {
  return PALACE_NAMES[index];
}

export function getBranchName(index) {
  return BRANCHES[((index % 12) + 12) % 12];
}
