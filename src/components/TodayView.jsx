const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function TodayView({ supplements, intakeLogs, today, onToggle }) {
  const takenIds = new Set(intakeLogs.filter(l => l.taken_date === today).map(l => l.supplement_id))
  const takenSupps = supplements.filter(s => takenIds.has(s.id))

  const d = new Date()
  const dateLabel = `${DAY[d.getDay()]}, ${MONTH[d.getMonth()]} ${d.getDate()}`

  // Aggregate nutrients from taken supplements
  const totals = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  const nutrientMap = {}
  takenSupps.forEach(s => {
    if (s.calories) totals.calories += Number(s.calories)
    if (s.protein_g) totals.protein_g += Number(s.protein_g)
    if (s.carbs_g) totals.carbs_g += Number(s.carbs_g)
    if (s.fat_g) totals.fat_g += Number(s.fat_g)
    ;(s.nutrients || []).forEach(n => {
      const key = `${n.name}__${n.unit}`
      if (!nutrientMap[key]) nutrientMap[key] = { name: n.name, unit: n.unit, amount: 0, daily_value_pct: n.daily_value_pct }
      nutrientMap[key].amount += Number(n.amount) || 0
    })
  })
  const hasMacros = totals.calories || totals.protein_g || totals.carbs_g || totals.fat_g
  const aggregatedNutrients = Object.values(nutrientMap)

  if (supplements.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">☀️</span>
        <h2>No supplements added yet</h2>
        <p>Go to "My Supplements" and add your first one.</p>
      </div>
    )
  }

  return (
    <div className="today-wrap">
      <div className="today-header">
        <h2 className="today-date">{dateLabel}</h2>
        <span className="today-count">{takenIds.size} / {supplements.length} taken</span>
      </div>

      <div className="checklist">
        {supplements.map(s => {
          const taken = takenIds.has(s.id)
          return (
            <button key={s.id} className={`checklist-item ${taken ? 'taken' : ''}`} onClick={() => onToggle(s.id)}>
              <span className="check-circle">{taken ? '✓' : ''}</span>
              <div className="check-info">
                <span className="check-name">{s.name}</span>
                {s.dosage && <span className="check-dosage">{s.dosage}</span>}
              </div>
              {taken && <span className="taken-badge">Done</span>}
            </button>
          )
        })}
      </div>

      {takenSupps.length > 0 && (
        <div className="today-nutrition">
          <h3 className="section-title">Today's Nutrition from Supplements</h3>

          {hasMacros && (
            <div className="macro-summary">
              {[['Calories', totals.calories, 'kcal'],
                ['Protein', totals.protein_g, 'g'],
                ['Carbs', totals.carbs_g, 'g'],
                ['Fat', totals.fat_g, 'g']].filter(([, v]) => v > 0).map(([label, val, unit]) => (
                <div className="macro-chip large" key={label}>
                  <span className="macro-val">{Math.round(val * 10) / 10}{unit}</span>
                  <span className="macro-label">{label}</span>
                </div>
              ))}
            </div>
          )}

          {aggregatedNutrients.length > 0 && (
            <ul className="nutrient-list">
              {aggregatedNutrients.map((n, i) => (
                <li key={i} className="nutrient-item">
                  <span>{n.name} — {Math.round(n.amount * 10) / 10}{n.unit}</span>
                  {n.daily_value_pct && (
                    <div className="dv-bar-wrap">
                      <div className="dv-bar" style={{ width: `${Math.min(n.daily_value_pct, 100)}%` }} />
                      <span className="dv-pct">{n.daily_value_pct}% DV</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
