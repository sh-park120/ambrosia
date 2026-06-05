import { useState } from 'react'
import { useLang } from '../lib/LangContext'
import ScaleToggle from './ScaleToggle'
import { scaleAmount, scaleDV, formatAmount } from '../lib/scaleAmount'

export default function SupplementList({ supplements, onEdit, onDelete }) {
  const { lang, t } = useLang()
  const [expanded, setExpanded] = useState(null)
  const [scaleMap, setScaleMap] = useState({}) // supplementId → scale

  function getScale(id) { return scaleMap[id] ?? 'day' }
  function setScale(id, s) { setScaleMap(prev => ({ ...prev, [id]: s })) }

  if (supplements.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">💊</span>
        <h2>{t.today.noSupplements}</h2>
      </div>
    )
  }

  return (
    <div className="supplement-grid">
      {supplements.map(s => {
        const sns = s.supplement_nutrients ?? []
        const scale = getScale(s.id)
        return (
          <article className="card" key={s.id}>
            <div className="card-top">
              <h3 className="card-name">{s.name}</h3>
              <span className="badge">{t.freq[s.frequency] ?? s.frequency}</span>
            </div>
            {s.manufacturer && <p className="card-manufacturer">{s.manufacturer}</p>}
            {(s.pills_per_dose || s.doses_per_day) && (
              <p className="card-dosage">
                {s.pills_per_dose ?? 1} {lang === 'ko' ? '알' : (s.pills_per_dose === 1 ? 'pill' : 'pills')} × {s.doses_per_day ?? 1}{lang === 'ko' ? '회/일' : '/day'}
                <span className="dosage-total-inline"> = {(s.pills_per_dose ?? 1) * (s.doses_per_day ?? 1)} {lang === 'ko' ? '알/일' : 'pills/day'}</span>
              </p>
            )}
            {s.notes && <p className="card-notes">{s.notes}</p>}
            {s.reminder_times?.length > 0 && (
              <p className="card-reminders">🔔 {s.reminder_times.join(' · ')}</p>
            )}

            {sns.length > 0 && (
              <>
                <button className="btn-expand" onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                  {expanded === s.id
                    ? (lang === 'ko' ? '▲ 영양소 숨기기' : '▲ Hide nutrients')
                    : (lang === 'ko' ? `▼ 영양소 ${sns.length}개 보기` : `▼ ${sns.length} nutrient${sns.length > 1 ? 's' : ''}`)}
                </button>
                {expanded === s.id && (
                  <>
                    <ScaleToggle value={scale} onChange={v => setScale(s.id, v)} />
                    <ul className="nutrient-list" style={{ marginTop: '0.5rem' }}>
                      {sns.map((sn, i) => {
                        const n = sn.nutrients
                        if (!n) return null
                        const scaled = scaleAmount(sn.amount_per_serving, scale, s.pills_per_dose, s.doses_per_day)
                        const dv = scaleDV(sn.amount_per_serving, n.recommended_daily, scale, s.pills_per_dose, s.doses_per_day)
                        return (
                          <li key={i} className="nutrient-item">
                            <div className="nutrient-item-row">
                              <span className="nutrient-name">{lang === 'ko' ? n.name_ko : n.name_en}</span>
                              <span className="nutrient-amount">{formatAmount(scaled)} {n.unit}</span>
                            </div>
                            {dv !== null && (
                              <div className="dv-bar-wrap">
                                <div className="dv-bar" style={{ width: `${Math.min(dv, 100)}%` }} />
                                <span className="dv-pct">{dv}% DV</span>
                              </div>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </>
                )}
              </>
            )}

            <div className="card-actions">
              <button className="btn btn-sm" onClick={() => onEdit(s)}>{t.edit}</button>
              <button className="btn btn-sm btn-danger" onClick={() => onDelete(s.id)}>{t.delete}</button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
