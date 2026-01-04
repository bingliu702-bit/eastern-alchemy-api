function pickElementByMonth(month) {
  // 极简半动态：先用月份映射（后面 Day4/Day5 再升级成完整算法）
  // 1-2: WATER, 3-4: WOOD, 5-6: FIRE, 7-8: EARTH, 9-10: METAL, 11-12: WATER
  if (month === 1 || month === 2) return "WATER";
  if (month === 3 || month === 4) return "WOOD";
  if (month === 5 || month === 6) return "FIRE";
  if (month === 7 || month === 8) return "EARTH";
  if (month === 9 || month === 10) return "METAL";
  return "WATER";
}

function weakElementFor(dominant) {
  // 先按克制关系给一个“弱项”，用于内容生成更像真的
  const map = {
    WOOD: "METAL",
    FIRE: "WATER",
    EARTH: "WOOD",
    METAL: "FIRE",
    WATER: "EARTH",
  };
  return map[dominant] || "EARTH";
}

export function generateStructure(order) {
  const birth = new Date(order.birth_date);
  const month = birth.getUTCMonth() + 1;

  const dominant_element = pickElementByMonth(month);
  const weak_element = weakElementFor(dominant_element);

  // 你先跑通闭环，后面我们再把这里升级成真正五行强弱计算
  return {
    dominant_element,
    weak_element,
    balance_score: 58 + (month % 20), // 半动态分数
    life_theme: `Learning to harmonize ${dominant_element} drive with ${weak_element} lessons`,
    element_advice: {
      WOOD: "Direction, gentle expansion, and consistent growth.",
      FIRE: "Warmth, visibility, and emotional expression with boundaries.",
      EARTH: "Stability, nourishment, and steady routines.",
      METAL: "Clarity, refinement, and healthy standards without harshness.",
      WATER: "Rest, intuition, and strategic pacing.",
    },
  };
}
