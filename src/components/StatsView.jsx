function calcStreak(logs, supplementId) {
  const dateSet = new Set(logs.filter(l => l.supplement_id === supplementId).map(l => l.taken_date))
  let streak = 0
  const d = new Date()
  for (let i = 0; i <= 30; i++) {
    const key = new Date(d.getTime() - i * 86400000).toISOString().split('T')[0]
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
  if (supplements.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">📊</span>
        <h2>No data yet</h2>
        <p>Add supplements and start logging in the Today tab.</p>
      </div>
    )
  }

  const takenToday = new Set(intakeLogs.filter(l => l.taken_date === today).map(l => l.supplement_id))

  // Aggregate today's nutrients
  const takenSupps = supplements.filter(s => takenToday.has(s.id))
  const nutrientMap = {}
  takenSupps.forEach(s => {
    ;(s.nutrients || []).forEach(n => {
      const key = `${n.name}__${n.unit}`
      if (!nutrientMap[key]) nutrientMap[key] = { name: n.name, unit: n.unit, amount: 0, dv: Number(n.daily_value_pct) || 0 }
      nutrientMap[key].amount += Number(n.amount) || 0
    })
  })
  const aggNutrients = Object.values(nutrientMap)

  return (
    <div className="stats-wrap">
      <h2 className="section-title">Last 30 Days</h2>

      <div className="stats-grid">
        {supplements.map(s => {
          const adherence = calcAdherence(intakeLogs, s.id)
          const streak = calcStreak(intakeLogs, s.id)
          const taken = takenToday.has(s.id)
          return (
            <div className="stat-card" key={s.id}>
              <div className="stat-header">
                <h3 className="stat-name">{s.name}</h3>
                {taken && <span className="taken-badge">✓ Today</span>}
              </div>
              {s.dosage && <p className="card-dosage">{s.dosage}</p>}

              <div className="stat-row">
                <span className="stat-label">Adherence</span>
                <span className="stat-value">{adherence}%</span>
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-bar" style={{ width: `${adherence}%`, background: adherence >= 80 ? 'var(--primary)' : adherence >= 50 ? '#f59e0b' : '#ef4444' }} />
              </div>

              <div className="stat-row" style={{ marginTop: '0.75rem' }}>
                <span className="stat-label">Current Streak</span>
                <span className="stat-value">{streak} {streak === 1 ? 'day' : 'days'} 🔥</span>
              </div>
            </div>
          )
        })}
      </div>

      {aggNutrients.length > 0 && (
        <div className="today-nutrition" style={{ marginTop: '2rem' }}>
          <h2 className="section-title">Today's Nutrient Totals</h2>
          <ul className="nutrient-list">
            {aggNutrients.map((n, i) => (
              <li key={i} className="nutrient-item">
                <span>{n.name} — {Math.round(n.amount * 10) / 10}{n.unit}</span>
                {n.dv > 0 && (
                  <div className="dv-bar-wrap">
                    <div className="dv-bar" style={{ width: `${Math.min(n.dv, 100)}%` }} />
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
