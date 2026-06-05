import { useState } from 'react'

const FREQ = { daily: 'Daily', twice_daily: 'Twice Daily', weekly: 'Weekly', as_needed: 'As Needed' }

function NutritionPanel({ s }) {
  const hasMacros = s.calories || s.protein_g || s.carbs_g || s.fat_g
  const hasNutrients = s.nutrients?.length > 0
  if (!hasMacros && !hasNutrients) return null

  return (
    <div className="nutrition-panel">
      {hasMacros && (
        <div className="macro-row">
          {[['Cal', s.calories, 'kcal'], ['Protein', s.protein_g, 'g'], ['Carbs', s.carbs_g, 'g'], ['Fat', s.fat_g, 'g']]
            .filter(([, v]) => v != null)
            .map(([label, val, unit]) => (
              <div className="macro-chip" key={label}>
                <span className="macro-val">{val}{unit}</span>
                <span className="macro-label">{label}</span>
              </div>
            ))}
        </div>
      )}
      {hasNutrients && (
        <ul className="nutrient-list">
          {s.nutrients.map((n, i) => (
            <li key={i} className="nutrient-item">
              <span>{n.name} — {n.amount}{n.unit}</span>
              {n.daily_value_pct ? (
                <div className="dv-bar-wrap">
                  <div className="dv-bar" style={{ width: `${Math.min(n.daily_value_pct, 100)}%` }} />
                  <span className="dv-pct">{n.daily_value_pct}% DV</span>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function SupplementList({ supplements, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(null)

  if (supplements.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">💊</span>
        <h2>No supplements yet</h2>
        <p>Click "+ Add Supplement" to get started.</p>
      </div>
    )
  }

  return (
    <div className="supplement-grid">
      {supplements.map(s => {
        const hasNutrition = s.calories || s.protein_g || s.nutrients?.length > 0
        return (
          <article className="card" key={s.id}>
            <div className="card-top">
              <h3 className="card-name">{s.name}</h3>
              <span className="badge">{FREQ[s.frequency] ?? s.frequency}</span>
            </div>
            {s.dosage && <p className="card-dosage">{s.dosage}</p>}
            {s.notes && <p className="card-notes">{s.notes}</p>}
            {s.reminder_times?.length > 0 && (
              <p className="card-reminders">🔔 {s.reminder_times.join(' · ')}</p>
            )}
            {hasNutrition && (
              <button className="btn-expand" onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                {expanded === s.id ? '▲ Hide nutrition' : '▼ Show nutrition'}
              </button>
            )}
            {expanded === s.id && <NutritionPanel s={s} />}
            <div className="card-actions">
              <button className="btn btn-sm" onClick={() => onEdit(s)}>Edit</button>
              <button className="btn btn-sm btn-danger" onClick={() => onDelete(s.id)}>Delete</button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
