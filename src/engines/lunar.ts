// @ts-nocheck
/**
 * 农历转换引擎 (Chinese Lunar Calendar)
 * 公历 ↔ 农历 互转，覆盖 1900-2100
 *
 * 编码方案：每个农历年用 5 字节十六进制编码
 * 格式: 0x[leapMonth][leapDays][month12..month1]
 * 每字节 4 位: 0=29天, 非0=30天
 * leapMonth: 0=无闰月, 1-12=闰月位置
 * leapDays: 闰月天数 (0=29, 1=30), 无闰月时为0
 *
 * 春节日期单独存储为 (month, day)
 */

// 1900-2100 农历年数据 [yearInfo, chunjieMonth, chunjieDay]
const LUNAR_YEARS = [
  0x04bd8,1,31, 0x04ae0,2,19, 0x0a570,2,8,  0x054d5,1,29, 0x0d260,2,16, 0x0d950,2,5,  // 1900-1905
  0x16554,1,25, 0x056a0,2,13, 0x09ad0,2,2,  0x055d2,1,22, 0x04ae0,2,10, 0x0a5b6,1,30, // 1906-1911
  0x0a4d0,2,18, 0x0d250,2,6,  0x1d255,1,26, 0x0b540,2,14, 0x0d6a0,2,3,  0x0ada2,1,23, // 1912-1917
  0x095b0,2,11, 0x14977,2,1,  0x04970,2,20, 0x0a4b0,2,8,  0x0b4b5,1,28, 0x06a50,2,16, // 1918-1923
  0x06d40,2,5,  0x1ab54,1,24, 0x02b60,2,13, 0x09570,2,2,  0x052f2,1,22, 0x04970,2,10, // 1924-1929
  0x06566,1,30, 0x0d4a0,2,17, 0x0ea50,2,6,  0x06e95,1,26, 0x05ad0,2,14, 0x02b60,2,4,  // 1930-1935
  0x186e3,1,24, 0x092e0,2,11, 0x1c8d7,1,31, 0x0c950,2,19, 0x0d4a0,2,8,  0x1d8a6,1,27, // 1936-1941
  0x0b550,2,15, 0x056a0,2,5,  0x1a5b4,1,25, 0x025d0,2,13, 0x092d0,2,2,  0x0d2b2,1,22, // 1942-1947
  0x0a950,2,10, 0x0b557,1,29, 0x06ca0,2,17, 0x0b550,2,6,  0x15355,1,27, 0x04da0,2,14, // 1948-1953
  0x0a5b0,2,3,  0x14573,1,24, 0x052b0,2,12, 0x0a9a8,1,31, 0x0e950,2,18, 0x06aa0,2,8,  // 1954-1959
  0x0aea6,1,28, 0x0ab50,2,15, 0x04b60,2,5,  0x0aae4,1,25, 0x0a570,2,13, 0x05260,2,2,  // 1960-1965
  0x0f263,1,21, 0x0d950,2,9,  0x05b57,1,30, 0x056a0,2,17, 0x096d0,2,6,  0x04dd5,1,27, // 1966-1971
  0x04ad0,2,15, 0x0a4d0,2,3,  0x0d4d4,1,23, 0x0d250,2,11, 0x0d558,1,31, 0x0b540,2,18, // 1972-1977
  0x0b6a0,2,7,  0x195a6,1,28, 0x095b0,2,16, 0x049b0,2,5,  0x0a974,1,25, 0x0a4b0,2,13, // 1978-1983
  0x0b27a,2,2,  0x06a50,1,21, 0x06d40,2,9,  0x0af46,1,29, 0x0ab60,2,17, 0x09570,2,6,  // 1984-1989
  0x04af5,1,27, 0x04970,2,15, 0x064b0,2,4,  0x074a3,1,23, 0x0ea50,2,10, 0x06b58,1,31, // 1990-1995
  0x05ac0,2,19, 0x0ab60,2,7,  0x096d5,1,28, 0x092e0,2,16, 0x0c960,2,5,  0x0d954,1,25, // 1996-2001
  0x0d4a0,2,12, 0x0da50,2,1,  0x07552,1,22, 0x056a0,2,9,  0x0abb7,1,29, 0x025d0,2,18, // 2002-2007
  0x092d0,2,7,  0x0cab5,1,26, 0x0a950,2,14, 0x0b4a0,2,3,  0x0baa4,1,23, 0x0ad50,2,10, // 2008-2013
  0x055d9,1,31, 0x04ba0,2,19, 0x0a5b0,2,8,  0x15176,1,28, 0x052b0,2,16, 0x0a930,2,5,  // 2014-2019
  0x07954,1,25, 0x06aa0,2,12, 0x0ad50,2,1,  0x05b52,1,22, 0x04b60,2,10, 0x0a6e6,1,29, // 2020-2025
  0x0a4e0,2,17, 0x0d260,2,6,  0x0ea65,1,26, 0x0d530,2,13, 0x05aa0,2,3,  0x076a3,1,23, // 2026-2031
  0x096d0,2,11, 0x04afb,1,31, 0x04ad0,2,19, 0x0a4d0,2,8,  0x1d0b6,1,28, 0x0d250,2,15, // 2032-2037
  0x0d520,2,4,  0x0dd45,1,24, 0x0b5a0,2,12, 0x056d0,2,1,  0x055b2,1,22, 0x049b0,2,9,  // 2038-2043
  0x0a577,1,30, 0x0a4b0,2,17, 0x0aa50,2,6,  0x1b255,1,26, 0x06d20,2,14, 0x0ada0,2,3,  // 2044-2049
  0x14b63,1,23, 0x09370,2,11, 0x049f8,1,31, 0x04970,2,19, 0x064b0,2,8,  0x168a6,1,28, // 2050-2055
  0x0ea50,2,15, 0x06aa0,2,5,  0x1b2a4,1,24, 0x0aae0,2,12, 0x092e0,2,1,  0x0d2e3,1,21, // 2056-2061
  0x0c960,2,9,  0x0d557,1,29, 0x0d4a0,2,17, 0x0da50,2,5,  0x05d55,1,26, 0x056a0,2,14, // 2062-2067
  0x0a6d0,2,3,  0x055d4,1,23, 0x052d0,2,10, 0x0a9b8,1,31, 0x0a950,2,18, 0x0b4a0,2,7,  // 2068-2073
  0x0b6a6,1,28, 0x0ad50,2,16, 0x055a0,2,5,  0x0aba4,1,24, 0x0a5b0,2,12, 0x052b0,2,2,  // 2074-2079
  0x0b273,1,22, 0x06930,2,10, 0x07337,1,29, 0x06aa0,2,18, 0x0ad50,2,7,  0x14b55,1,27, // 2080-2085
  0x04b60,2,14, 0x0a570,2,3,  0x054e4,1,24, 0x0d160,2,12, 0x0e968,1,31, 0x0d520,2,18, // 2086-2091
  0x0daa0,2,7,  0x16aa6,1,28, 0x056d0,2,16, 0x04ae0,2,4,  0x0a9d4,1,24, 0x0a4d0,2,13, // 2092-2097
  0x0d150,2,2,  0x0f252,1,21, 0x0d520,2,9,                                    // 2098-2100
];

// 天干地支
const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

// 农历月份中文
const LUNAR_MONTHS = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];
const LUNAR_DAYS = [
  '初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
  '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
  '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'
];

/**
 * 公历转农历
 * @returns {{ year, month, day, isLeap, yearStem, yearBranch, monthName, dayName }}
 */
export function solarToLunar(year, month, day) {
  const offset = daysFromBase(year, month, day);

  // Find the lunar year
  let lunarYear, lunarYearIdx;
  for (lunarYearIdx = 0; lunarYearIdx < LUNAR_YEARS.length; lunarYearIdx += 3) {
    const cjMonth = LUNAR_YEARS[lunarYearIdx + 1];
    const cjDay = LUNAR_YEARS[lunarYearIdx + 2];
    lunarYear = 1900 + Math.floor(lunarYearIdx / 3);
    const chunjieOffset = daysFromBase(lunarYear, cjMonth, cjDay);
    if (offset < chunjieOffset) {
      // Belongs to previous lunar year
      lunarYear--;
      lunarYearIdx -= 3;
      break;
    }
    // Check if into next lunar year
    const nextIdx = lunarYearIdx + 3;
    if (nextIdx < LUNAR_YEARS.length) {
      const nextCjMonth = LUNAR_YEARS[nextIdx + 1];
      const nextCjDay = LUNAR_YEARS[nextIdx + 2];
      const nextChunjieOffset = daysFromBase(lunarYear + 1, nextCjMonth, nextCjDay);
      if (offset < nextChunjieOffset) break;
    } else {
      break;
    }
  }

  // Now compute which lunar month and day within this lunar year
  const cjMonth = LUNAR_YEARS[lunarYearIdx + 1];
  const cjDay = LUNAR_YEARS[lunarYearIdx + 2];
  const chunjieOffset = daysFromBase(lunarYear, cjMonth, cjDay);
  let daysSinceCJ = offset - chunjieOffset;

  const yearInfo = LUNAR_YEARS[lunarYearIdx];
  let isLeap = false;
  let lunarMonth = 1;
  let lunarDay = 1;

  for (let m = 1; m <= 12; m++) {
    const monthDays = getLunarMonthDays(yearInfo, m, false);
    if (daysSinceCJ < monthDays) {
      lunarMonth = m;
      lunarDay = daysSinceCJ + 1;
      isLeap = false;
      break;
    }
    daysSinceCJ -= monthDays;

    // Check leap month
    const leapMonth = (yearInfo >> 16) & 0xf;
    if (leapMonth === m) {
      const leapDays = getLunarMonthDays(yearInfo, m, true);
      if (daysSinceCJ < leapDays) {
        lunarMonth = m;
        lunarDay = daysSinceCJ + 1;
        isLeap = true;
        break;
      }
      daysSinceCJ -= leapDays;
    }
  }

  // Year stem/branch
  const yearSexagenary = (lunarYear - 4) % 60;
  const yearStem = STEMS[yearSexagenary % 10];
  const yearBranch = BRANCHES[yearSexagenary % 12];

  return {
    year: lunarYear,
    month: lunarMonth,
    day: lunarDay,
    isLeap,
    yearStem,
    yearBranch,
    yearStemIdx: yearSexagenary % 10,
    yearBranchIdx: yearSexagenary % 12,
    monthName: (isLeap ? '闰' : '') + LUNAR_MONTHS[lunarMonth - 1] + '月',
    dayName: LUNAR_DAYS[lunarDay - 1],
  };
}

/**
 * 获取农历月天数
 */
function getLunarMonthDays(yearInfo, month, isLeap) {
  if (isLeap) {
    return ((yearInfo >> 16) & 0xf) === month ? (((yearInfo >> 20) & 0x1) ? 30 : 29) : 29;
  }
  return (yearInfo & (1 << (month - 1))) ? 30 : 29;
}

/**
 * 计算两个日期之间的天数 (从 1900-01-01 起算)
 */
function daysFromBase(year, month, day) {
  let days = (year - 1900) * 365;
  // Add leap days
  for (let y = 1900; y < year; y++) {
    if (isLeapYear(y)) days++;
  }
  // Add month days
  const monthDays = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (isLeapYear(year)) monthDays[2] = 29;
  for (let m = 1; m < month; m++) days += monthDays[m];
  days += day - 1;
  return days;
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * 农历转公历 (近似)
 */
export function lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeap = false) {
  const yearIdx = (lunarYear - 1900) * 3;
  if (yearIdx < 0 || yearIdx >= LUNAR_YEARS.length - 2) return null;

  const cjMonth = LUNAR_YEARS[yearIdx + 1];
  const cjDay = LUNAR_YEARS[yearIdx + 2];
  const baseOffset = daysFromBase(lunarYear, cjMonth, cjDay);

  const yearInfo = LUNAR_YEARS[yearIdx];
  let daysOffset = 0;

  for (let m = 1; m < lunarMonth; m++) {
    daysOffset += getLunarMonthDays(yearInfo, m, false);
    const leapMonth = (yearInfo >> 16) & 0xf;
    if (leapMonth === m) {
      daysOffset += getLunarMonthDays(yearInfo, m, true);
    }
  }

  // If target month is leap, add regular month days first
  if (isLeap) {
    daysOffset += getLunarMonthDays(yearInfo, lunarMonth, false);
  }

  daysOffset += lunarDay - 1;

  const totalDays = baseOffset + daysOffset;

  // Convert days back to Gregorian
  let y = 1900;
  let remaining = totalDays;
  while (true) {
    const yearDays = isLeapYear(y) ? 366 : 365;
    if (remaining < yearDays) break;
    remaining -= yearDays;
    y++;
  }

  const monthDaysArr = [0, 31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let m = 1;
  while (m <= 12 && remaining >= monthDaysArr[m]) {
    remaining -= monthDaysArr[m];
    m++;
  }

  return { year: y, month: m, day: remaining + 1 };
}
