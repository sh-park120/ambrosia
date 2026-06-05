// scale: 'pill' | 'dose' | 'day'
// amount is always the daily total as entered
export function scaleAmount(amount, scale, pillsPerDose, dosesPerDay) {
  const pills = Number(pillsPerDose) || 1
  const doses = Number(dosesPerDay) || 1
  if (scale === 'pill') return amount / (pills * doses)
  if (scale === 'dose') return amount / doses
  return amount // 'day'
}

export function scaleDV(amount, recommendedDaily, scale, pillsPerDose, dosesPerDay) {
  if (!recommendedDaily) return null
  return Math.round((scaleAmount(amount, scale, pillsPerDose, dosesPerDay) / recommendedDaily) * 100)
}

export function formatAmount(amount) {
  const n = Math.round(amount * 100) / 100
  return n % 1 === 0 ? String(n) : n.toFixed(2).replace(/\.?0+$/, '')
}
