const nguHanh = await fetch("./data/ngu_hanh_125_full.json").then((r) =>
  r.json(),
);
import numberMeanings from "./data/number_meaning.js";
const menhPhu = await fetch("./data/menh_phu_link.json").then((r) => r.json());
// ============================================================
// PART 1 — STROKE COUNTING SYSTEM
// ============================================================

const baseStrokes = {
  C: 1,
  O: 1,
  S: 1,
  D: 2,
  I: 2,
  L: 2,
  P: 2,
  Q: 2,
  T: 2,
  U: 2,
  V: 2,
  X: 2,
  Y: 2,
  A: 3,
  B: 3,
  Đ: 3,
  G: 3,
  H: 3,
  K: 3,
  N: 3,
  R: 3,
  E: 4,
  M: 4,
  F: 3,
  J: 3,
  W: 4,
  Z: 3,
};

const diacriticStrokes = {
  "̂": 2,
  "̆": 2,
  "̛": 1,
};

const toneStrokes = {
  "̀": 1,
  "́": 1,
  "̉": 1,
  "̃": 1,
  "̣": 1,
};

function analyzeChar(char) {
  const decomposed = char.normalize("NFD");

  let total = 0;
  for (let part of decomposed) {
    if (/[A-ZĐ]/.test(part)) {
      total += baseStrokes[part] || 0;
    } else if (diacriticStrokes[part]) {
      total += diacriticStrokes[part];
    } else if (toneStrokes[part]) {
      total += toneStrokes[part];
    }
  }
  return total;
}

function countWordStrokes(word) {
  word = word.toUpperCase();
  let total = 0;

  for (let ch of word) {
    if (ch !== " ") total += analyzeChar(ch);
  }
  return total;
}

// ============================================================
// PART 2 — NAME PARSING + 5 DESTINIES
// ============================================================

const traditionalMiddle = ["VĂN", "THỊ", "THẾ", "BÁ"];

const initialClusters = ["NGH", "NG", "NH", "CH", "KH", "PH", "TH", "TR", "GI"];

function getInitialSound(name) {
  name = name.toUpperCase();
  for (let cluster of initialClusters) {
    if (name.startsWith(cluster)) return cluster;
  }
  return name[0];
}

function parseVietnameseName(fullName) {
  let parts = fullName.trim().toUpperCase().split(/\s+/);

  if (parts.length < 2) throw new Error("Tên phải có ít nhất Họ + Tên");

  let surname = parts[0];
  let middleSurname = null;
  let secondaryName = null;
  let mainName = null;

  if (parts.length === 2) {
    mainName = parts[1];
    return {
      surname,
      middleSurname: null,
      secondaryName: null,
      mainName,
      missingMiddle: true,
    };
  }

  if (parts.length === 3) {
    middleSurname = parts[1];
    mainName = parts[2];
    return {
      surname,
      middleSurname,
      secondaryName: null,
      mainName,
      missingMiddle: false,
    };
  }

  middleSurname = parts[1];
  secondaryName = parts.slice(2, -1).join(" ");
  mainName = parts[parts.length - 1];

  return {
    surname,
    middleSurname,
    secondaryName,
    mainName,
    missingMiddle: false,
  };
}

// ============================================================
// PART 3 — LUCK CLASSIFICATION + MEANING
// ============================================================

const luckGroups = {
  "Rất tốt": [1, 3, 5, 7, 13, 15, 16, 21, 24, 31, 39, 47, 48, 52, 63, 65, 81],
  Tốt: [
    6, 11, 17, 18, 22, 23, 25, 26, 32, 33, 35, 37, 38, 41, 49, 57, 61, 67, 68,
  ],
  Được: [8, 9, 19, 27, 29, 30, 36, 40, 44, 58, 66, 71, 73, 75, 77, 78],
  Xấu: [
    2, 4, 10, 12, 14, 20, 28, 34, 42, 43, 45, 46, 50, 53, 55, 56, 59, 60, 69,
    72, 74,
  ],
  "Rất xấu": [51, 54, 62, 64, 70, 76, 79, 80],
};

// Cycle reduction: >80 → wrap back
function practicalNumber(n) {
  if (n <= 80) return n;
  return ((n - 1) % 80) + 1;
}

function classifyLuck(n) {
  for (let group in luckGroups) {
    if (luckGroups[group].includes(n)) return group;
  }
  return "Không rõ";
}

function reduceTo1to10(n) {
  let r = n % 10;
  return r === 0 ? 10 : r;
}

// Determine Yin/Yang
function getAmDuong(n) {
  return n % 2 === 0 ? "Âm" : "Dương";
}

// Determine Five Elements
function getNguHanh(n) {
  if (n === 1 || n === 2) return { hanh: "Mộc", chuVe: "Nhân" };

  if (n === 3 || n === 4) return { hanh: "Hỏa", chuVe: "Lễ" };

  if (n === 5 || n === 6) return { hanh: "Thổ", chuVe: "Tín" };

  if (n === 7 || n === 8) return { hanh: "Kim", chuVe: "Nghĩa" };

  if (n === 9 || n === 10) return { hanh: "Thủy", chuVe: "Trí" };

  return { hanh: "Không rõ", chuVe: "?" };
}

// Build full detailed info from raw destiny number
function convertToAmDuongNguHanh(rawNumber) {
  let reduced = reduceTo1to10(rawNumber);

  let amduong = getAmDuong(reduced);

  let { hanh, chuVe } = getNguHanh(reduced);

  return {
    raw: rawNumber, // số vận thế gốc (ví dụ 31)
    reduced, // quy đổi về 1–10 (ví dụ 1)
    amduong, // Âm / Dương
    hanh, // Ngũ hành
    chuVe, // Nhân / Lễ / Tín / Nghĩa / Trí
  };
}

// ============================================================
// PART 4 — FINAL COMPUTE
// ============================================================

function getMenhPhuLink(menhRaw, phuRaw) {
  let menh = reduceTo1to10(menhRaw);
  let phu = reduceTo1to10(phuRaw);

  let key = `${menh}-${phu}`;

  return (
    menhPhu[key] || {
      luck: "Không rõ",
      meaning: "(Chưa có dữ liệu)",
    }
  );
}

// ================================
// SCORE SYSTEM
// ================================

// Luck → base score (0–20)
const luckScoreMap = {
  "Rất tốt": 20,
  Tốt: 16,
  Được: 12,
  Xấu: 4,
  "Rất xấu": 0,
};

// Weighted points for 5 destinies (total = 50)
const destinyWeights = {
  tongVan: 20,
  menhVan: 10,
  hoVan: 6.6,
  tenVan: 6.6,
  phuVan: 6.6,
};

// Convert luck label → weighted score
function calcLuckWeightedScore(luck, weight) {
  let base = luckScoreMap[luck] ?? 0; // 0–20
  return (base / 20) * weight;
}

export function computeDestiny(fullName) {
  let parsed = parseVietnameseName(fullName);

  let { surname, middleSurname, secondaryName, mainName, missingMiddle } =
    parsed;

  let plusOne = missingMiddle ? 1 : 0;
  let initialSound = getInitialSound(mainName);

  function strokes(text) {
    if (!text) return 0;
    return countWordStrokes(text);
  }

  // ================================
  // PART 1 — RAW VALUES
  // ================================
  let hoVan = strokes(surname) + strokes(middleSurname) + plusOne;
  let tenVan = strokes(secondaryName) + strokes(mainName);
  let menhVan = strokes(middleSurname) + plusOne + strokes(initialSound);

  let tongVan =
    strokes(surname) +
    strokes(middleSurname) +
    strokes(secondaryName) +
    strokes(mainName) +
    plusOne;

  let phuVan = tongVan - menhVan;

  // ================================
  // PART 2 — BUILD RESULT OBJECT
  // ================================
  function buildResult(value) {
    let p = practicalNumber(value);
    return {
      value: p,
      luck: classifyLuck(p),
      meaning: numberMeanings[p] || "(Chưa có mô tả)",
    };
  }

  let result = {
    hoVan: buildResult(hoVan),
    tenVan: buildResult(tenVan),
    menhVan: buildResult(menhVan),
    tongVan: buildResult(tongVan),
    phuVan: buildResult(phuVan),
  };

  // ================================
  // PART 3 — BA BIỂU THẾ (25 pts)
  // ================================
  let baBieuThe = {
    dau: convertToAmDuongNguHanh(hoVan),
    giua: convertToAmDuongNguHanh(menhVan),
    cuoi: convertToAmDuongNguHanh(tenVan),
  };

  baBieuThe.three_states_interpretation =
    baBieuThe.dau.hanh +
    " - " +
    baBieuThe.giua.hanh +
    " - " +
    baBieuThe.cuoi.hanh;

  const nguHanhObj = nguHanh[baBieuThe.three_states_interpretation];

  baBieuThe.meaning_interpretation = nguHanhObj
    ? nguHanhObj.meaning
    : "(Chưa có mô tả)";

  baBieuThe.score = nguHanhObj ? nguHanhObj.score : 0; // 0–25

  // ================================
  // PART 4 — MỆNH–PHỤ LINK (25 pts)
  // ================================
  let menhPhuLink = getMenhPhuLink(menhVan, phuVan);

  const menhPhu = {
    menh: reduceTo1to10(menhVan),
    phu: reduceTo1to10(phuVan),
    luck: menhPhuLink.luck,
    meaning: menhPhuLink.meaning,
    score: menhPhuLink.score ?? 0, // 0–25
  };

  // ================================
  // PART 5 — 5 VẬN SCORE (50 pts)
  // ================================
  let destinyScore = 0;

  for (let key in destinyWeights) {
    destinyScore += calcLuckWeightedScore(
      result[key].luck,
      destinyWeights[key]
    );
  }

  // ================================
  // PART 6 — FINAL TOTAL SCORE (100)
  // ================================
  let totalScore =
    destinyScore + baBieuThe.score + menhPhu.score;

  totalScore = Math.round(totalScore * 10) / 10; // round 1 decimal

  // ================================
  // OUTPUT
  // ================================
  return {
    input: fullName,

    result,

    baBieuThe,

    menhPhu,

    scoring: {
      destinyScore: Math.round(destinyScore * 10) / 10, // /50
      baBieuTheScore: baBieuThe.score, // /25
      menhPhuScore: menhPhu.score, // /25
      totalScore, // /100
    },

    prediction: [
      result.hoVan.meaning,
      result.tenVan.meaning,
      result.menhVan.meaning,
      result.tongVan.meaning,
      result.phuVan.meaning,
      baBieuThe.meaning_interpretation,
      menhPhu.meaning,
    ],
  };
}
