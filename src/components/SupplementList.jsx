import { useState } from 'react'
import { useLang } from '../lib/LangContext'
import ScaleToggle from './ScaleToggle'
import { scaleAmount, scaleDV, formatAmount } from '../lib/scaleAmount'
import SupplIcon from './SupplIcon'

export default function SupplementList({ supplements, user, onEdit, onRemoveFromList, onDeleteFromCatalog, onBrowseCatalog }) {
  const { lang, t } = useLang()
  const ct = t.catalog
  const [expanded, setExpanded] = useState(null)
  const [scaleMap, setScaleMap] = useState({})

  function getScale(id) { return scaleMap[id] ?? 'day' }
  function setScale(id, s) { setScaleMap(prev => ({ ...prev, [id]: s })) }

  return (
    <div>
      <div className="section-toolbar" style={{ marginBottom: '1.25rem' }}>
        <span />
        <button className="btn btn-ghost" onClick={onBrowseCatalog}>
          {ct.browse}
        </button>
      </div>

      {supplements.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">💊</span>
          <h2>{t.today.noSupplements}</h2>
        </div>
      ) : (
        <div className="supplement-grid">
          {supplements.map(s => {
            const sns = s.supplement_nutrients ?? []
            const scale = getScale(s.id)
            const isCreator = s.created_by === user.id
            return (
              <article className="card" key={s.userSupplementId}>
                <div className="card-top">
                  <SupplIcon emoji={s.emoji} imageUrl={s.image_url} size={38} />
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
                {isCreator && (
                  <span className="creator-tag creator-tag-card">{ct.createdByYou}</span>
                )}

                {sns.length > 0 && (
                  <>
                    <button className="btn-expand" onClick={() => setExpanded(expanded === s.userSupplementId ? null : s.userSupplementId)}>
                      {expanded === s.userSupplementId
                        ? (lang === 'ko' ? '▲ 영양소 숨기기' : '▲ Hide nutrients')
                        : (lang === 'ko' ? `▼ 영양소 ${sns.length}개 보기` : `▼ ${sns.length} nutrient${sns.length > 1 ? 's' : ''}`)}
                    </button>
                    {expanded === s.userSupplementId && (
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
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => onRemoveFromList(s.userSupplementId)}
                  >
                    {ct.removeFromList}
                  </button>
                  {isCreator && (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => onDeleteFromCatalog(s.supplement_id, s.userSupplementId)}
                    >
                      {ct.deleteFromCatalog}
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
