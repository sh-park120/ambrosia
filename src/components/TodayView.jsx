import { useLang } from '../lib/LangContext'

const DAY_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const DAY_KO = ['일요일','월요일','화요일','수요일','목요일','금요일','토요일']
const MONTH_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTH_KO = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

export default function TodayView({ supplements, intakeLogs, today, onToggle }) {
  const { lang, t } = useLang()  // lang used for dosage labels
  const tt = t.today

  const takenIds = new Set(intakeLogs.filter(l => l.taken_date === today).map(l => l.supplement_id))
  const takenSupps = supplements.filter(s => takenIds.has(s.id))

  const d = new Date()
  const dateLabel = lang === 'ko'
    ? `${DAY_KO[d.getDay()]} ${d.getFullYear()}년 ${MONTH_KO[d.getMonth()]} ${d.getDate()}일`
    : `${DAY_EN[d.getDay()]}, ${MONTH_EN[d.getMonth()]} ${d.getDate()}`

  // Aggregate nutrients from taken supplements
  const nutrientMap = {}
  takenSupps.forEach(s => {
    ;(s.supplement_nutrients || []).forEach(sn => {
      const n = sn.nutrients
      if (!n) return
      if (!nutrientMap[n.id]) {
        nutrientMap[n.id] = { name_en: n.name_en, name_ko: n.name_ko, unit: n.unit, amount: 0, recommended_daily: n.recommended_daily }
      }
      nutrientMap[n.id].amount += Number(sn.amount_per_serving) || 0
    })
  })
  const aggNutrients = Object.values(nutrientMap)

  if (supplements.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">☀️</span>
        <h2>{tt.noSupplements}</h2>
        <p>{tt.goAdd}</p>
      </div>
    )
  }

  return (
    <div className="today-wrap">
      <div className="today-header">
        <h2 className="today-date">{dateLabel}</h2>
        <span className="today-count">{takenIds.size} / {supplements.length} {lang === 'ko' ? '섭취 완료' : 'taken'}</span>
      </div>

      <div className="checklist">
        {supplements.map(s => {
          const taken = takenIds.has(s.id)
          return (
            <button key={s.id} className={`checklist-item ${taken ? 'taken' : ''}`} onClick={() => onToggle(s.id)}>
              <span className="check-circle">{taken ? '✓' : ''}</span>
              <div className="check-info">
                <span className="check-name">{s.name}</span>
                {s.manufacturer && <span className="check-manufacturer">{s.manufacturer}</span>}
                {(s.pills_per_dose || s.doses_per_day) && (
                  <span className="check-dosage">
                    {s.pills_per_dose ?? 1} {lang === 'ko' ? '알' : 'pill(s)'} × {s.doses_per_day ?? 1}{lang === 'ko' ? '회/일' : '/day'}
                  </span>
                )}
              </div>
              {taken && <span className="taken-badge">{tt.done}</span>}
            </button>
          )
        })}
      </div>

      {takenSupps.length > 0 && aggNutrients.length > 0 && (
        <div className="today-nutrition">
          <h3 className="section-title">{tt.nutritionTitle}</h3>
          <ul className="nutrient-list">
            {aggNutrients.map((n, i) => {
              const dvPct = n.recommended_daily
                ? Math.round((n.amount / n.recommended_daily) * 100)
                : null
              return (
                <li key={i} className="nutrient-item">
                  <div className="nutrient-item-row">
                    <span className="nutrient-name">{lang === 'ko' ? n.name_ko : n.name_en}</span>
                    <span className="nutrient-amount">{Math.round(n.amount * 10) / 10} {n.unit}</span>
                  </div>
                  {dvPct !== null && (
                    <div className="dv-bar-wrap">
                      <div className="dv-bar" style={{ width: `${Math.min(dvPct, 100)}%`, background: dvPct >= 100 ? '#10b981' : dvPct >= 50 ? '#f59e0b' : '#94a3b8' }} />
                      <span className="dv-pct">{dvPct}% {tt.dvLabel}</span>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
