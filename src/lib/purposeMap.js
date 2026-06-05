// Matches keyword at a word boundary (won't match 'B1' inside 'B12')
function matchKeyword(nameEn, keyword) {
  const escaped = keyword.replace(/[-.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(?:^|[^a-zA-Z0-9])${escaped}(?:[^a-zA-Z0-9]|$)`, 'i').test(nameEn)
}

export const PURPOSES = [
  {
    key: 'eye', icon: '👁️', en: 'Eye Health', ko: '눈 건강',
    keywords: ['Vitamin A', 'Lutein', 'Zeaxanthin', 'Vitamin C', 'Vitamin E', 'Zinc', 'Omega-3'],
  },
  {
    key: 'heart', icon: '❤️', en: 'Heart', ko: '심장',
    keywords: ['Omega-3', 'Coenzyme Q10', 'Magnesium', 'Vitamin K2', 'Vitamin D3', 'Vitamin D2', 'Vitamin B6', 'Vitamin B12', 'Folate', 'Potassium'],
  },
  {
    key: 'blood', icon: '🩸', en: 'Blood', ko: '혈액',
    keywords: ['Iron', 'Vitamin B12', 'Folate', 'Vitamin B9', 'Vitamin C', 'Vitamin K1', 'Copper'],
  },
  {
    key: 'bone', icon: '🦴', en: 'Bone', ko: '뼈',
    keywords: ['Calcium', 'Vitamin D3', 'Vitamin D2', 'Vitamin K2', 'Vitamin K1', 'Magnesium', 'Zinc', 'Copper', 'Phosphorus'],
  },
  {
    key: 'brain', icon: '🧠', en: 'Brain', ko: '뇌·인지',
    keywords: ['Omega-3', 'Vitamin D3', 'Vitamin D2', 'Magnesium', 'Vitamin B12', 'Folate', 'Vitamin B9', 'Vitamin B6', 'Iodine'],
  },
  {
    key: 'immune', icon: '🛡️', en: 'Immune', ko: '면역',
    keywords: ['Vitamin C', 'Vitamin D3', 'Vitamin D2', 'Zinc', 'Selenium', 'Vitamin A', 'Vitamin E', 'Probiotic'],
  },
  {
    key: 'energy', icon: '⚡', en: 'Energy', ko: '에너지',
    keywords: ['Thiamine', 'Vitamin B1 ', 'Riboflavin', 'Vitamin B2 ', 'Niacin', 'Pantothenic', 'Vitamin B6', 'Vitamin B12', 'Iron', 'Magnesium', 'Coenzyme Q10', 'Iodine'],
  },
  {
    key: 'muscle', icon: '💪', en: 'Muscle', ko: '근육',
    keywords: ['Magnesium', 'Vitamin D3', 'Vitamin D2', 'Zinc', 'Calcium', 'Potassium', 'Creatine'],
  },
  {
    key: 'skin', icon: '✨', en: 'Skin', ko: '피부',
    keywords: ['Vitamin C', 'Vitamin E', 'Biotin', 'Vitamin B7', 'Zinc', 'Omega-3', 'Selenium', 'Collagen'],
  },
  {
    key: 'liver', icon: '🍃', en: 'Liver', ko: '간',
    keywords: ['Vitamin E', 'Selenium', 'Zinc', 'Vitamin C', 'Copper', 'Choline', 'NAC', 'Alpha-Lipoic', 'Milk Thistle'],
  },
]

export function calcCoverage(supplements, takenIds, mode) {
  const list = mode === 'today'
    ? supplements.filter(s => takenIds.has(s.id))
    : supplements

  const map = {}
  list.forEach(s => {
    ;(s.supplement_nutrients || []).forEach(sn => {
      const n = sn.nutrients
      if (!n) return
      if (!map[n.id]) {
        map[n.id] = { id: n.id, name_en: n.name_en, name_ko: n.name_ko, unit: n.unit, amount: 0, recommended: n.recommended_daily }
      }
      map[n.id].amount += Number(sn.amount_per_serving)
    })
  })

  return Object.values(map).map(n => ({
    ...n,
    pct: n.recommended ? Math.round((n.amount / n.recommended) * 100) : null,
  })).sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1))
}

export function calcPurposeScores(coverageList) {
  return PURPOSES.map(p => {
    const matched = coverageList.filter(n =>
      p.keywords.some(k => matchKeyword(n.name_en, k))
    )
    if (matched.length === 0) return null
    const withDV = matched.filter(n => n.pct !== null)
    const score = withDV.length > 0
      ? Math.round(withDV.reduce((s, n) => s + Math.min(n.pct, 100), 0) / withDV.length)
      : null
    return { ...p, matchCount: matched.length, score }
  }).filter(Boolean)
}
