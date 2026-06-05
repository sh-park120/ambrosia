import { useState } from 'react'
import { useLang } from '../lib/LangContext'
import ScaleToggle from './ScaleToggle'
import { scaleAmount, scaleDV, formatAmount } from '../lib/scaleAmount'

function calcStreak(logs, supplementId) {
  const dateSet = new Set(logs.filter(l => l.supplement_id === supplementId).map(l => l.taken_date))
  let streak = 0
  for (let i = 0; i <= 30; i++) {
    const key = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
    if (dateSet.has(key)) streak++
    else break
  }
  return streak
}

function calcAdherence(logs, supplementId) {
  const dates = new Set(logs.filter(l => l.supplement_id === supplementId).map(l => l.taken_date))
  return Math.round((dates.size / 30) * 100)
}

export default function StatsView({ supplements, intakeLogs, today }) {
  const { lang, t } = useLang()
  const st = t.stats
  const [scale, setScale] = useState('day')

  if (supplements.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">📊</span>
        <h2>{st.noData}</h2>
        <p>{st.noDataHint}</p>
      </div>
    )
  }

  const takenToday = new Set(intakeLogs.filter(l => l.taken_date === today).map(l => l.supplement_id))

  // Aggregate today's nutrients scaled by selected scale
  const nutrientMap = {}
  supplements.filter(s => takenToday.has(s.id)).forEach(s => {
    ;(s.supplement_nutrients || []).forEach(sn => {
      const n = sn.nutrients
      if (!n) return
      const scaled = scaleAmount(sn.amount_per_serving, scale, s.pills_per_dose, s.doses_per_day)
      const dv = scaleDV(sn.amount_per_serving, n.recommended_daily, scale, s.pills_per_dose, s.doses_per_day)
      if (!nutrientMap[n.id]) {
        nutrientMap[n.id] = { name_en: n.name_en, name_ko: n.name_ko, unit: n.unit, amount: 0, dv: 0, hasDV: dv !== null }
      }
      nutrientMap[n.id].amount += scaled
      if (dv !== null) nutrientMap[n.id].dv += dv
    })
  })
  const aggNutrients = Object.values(nutrientMap)

  return (
    <div className="stats-wrap">
      <h2 className="section-title">{st.title}</h2>
      <div className="stats-grid">
        {supplements.map(s => {
          const adherence = calcAdherence(intakeLogs, s.id)
          const streak = calcStreak(intakeLogs, s.id)
          const taken = takenToday.has(s.id)
          const barColor = adherence >= 80 ? 'var(--primary)' : adherence >= 50 ? '#f59e0b' : '#ef4444'
          return (
            <div className="stat-card" key={s.id}>
              <div className="stat-header">
                <h3 className="stat-name">{s.name}</h3>
                {taken && <span className="taken-badge">{st.todayCheck}</span>}
              </div>
              {s.dosage && <p className="card-dosage">{s.dosage}</p>}
              <div className="stat-row">
                <span className="stat-label">{st.adherence}</span>
                <span className="stat-value">{adherence}%</span>
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-bar" style={{ width: `${adherence}%`, background: barColor }} />
              </div>
              <div className="stat-row" style={{ marginTop: '0.75rem' }}>
                <span className="stat-label">{st.streak}</span>
                <span className="stat-value">{streak} {streak === 1 ? st.day : st.days} 🔥</span>
              </div>
            </div>
          )
        })}
      </div>

      {aggNutrients.length > 0 && (
        <div className="today-nutrition" style={{ marginTop: '2rem' }}>
          <div className="nutrition-header">
            <h3 className="section-title">{st.todayNutrients}</h3>
            <ScaleToggle value={scale} onChange={setScale} />
          </div>
          <ul className="nutrient-list" style={{ marginTop: '0.75rem' }}>
            {aggNutrients.map((n, i) => (
              <li key={i} className="nutrient-item">
                <div className="nutrient-item-row">
                  <span className="nutrient-name">{lang === 'ko' ? n.name_ko : n.name_en}</span>
                  <span className="nutrient-amount">{formatAmount(n.amount)} {n.unit}</span>
                </div>
                {n.hasDV && (
                  <div className="dv-bar-wrap">
                    <div className="dv-bar" style={{ width: `${Math.min(n.dv, 100)}%`, background: n.dv >= 100 ? 'var(--primary)' : n.dv >= 50 ? '#f59e0b' : '#94a3b8' }} />
                    <span className="dv-pct">{n.dv}% DV</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
