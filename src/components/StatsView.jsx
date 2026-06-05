import { useState } from 'react'
import { useLang } from '../lib/LangContext'
import { calcCoverage, calcPurposeScores } from '../lib/purposeMap'

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

function dvColor(pct) {
  if (pct === null) return '#94a3b8'
  if (pct >= 100) return '#10b981'
  if (pct >= 50) return '#f59e0b'
  return '#ef4444'
}

function PurposeRing({ score, icon, size = 72 }) {
  const pct = score ?? 0
  const color = dvColor(score)
  const deg = Math.min(pct, 100) * 3.6
  return (
    <div className="purpose-ring-wrap" style={{ width: size, height: size }}>
      <div className="purpose-ring" style={{
        background: `conic-gradient(${color} ${deg}deg, #e2e8f0 ${deg}deg)`,
        width: size, height: size,
      }}>
        <div className="purpose-ring-inner" style={{ width: size * 0.68, height: size * 0.68, fontSize: size * 0.36 }}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function StatsView({ supplements, intakeLogs, today }) {
  const { lang, t } = useLang()
  const st = t.stats
  const [analysisMode, setAnalysisMode] = useState('today')

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

  const coverageList = calcCoverage(supplements, takenToday, analysisMode)
  const purposeScores = calcPurposeScores(coverageList)

  const modeLabel = { today: st.modeToday, full: st.modeFull }

  return (
    <div className="stats-wrap">

      {/* ── Adherence section ── */}
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

      {/* ── Analysis mode toggle ── */}
      {coverageList.length > 0 && (
        <>
          <div className="analysis-header">
            <h2 className="section-title">{st.analysisTitle}</h2>
            <div className="mode-toggle">
              {['today', 'full'].map(m => (
                <button key={m}
                  className={`mode-btn ${analysisMode === m ? 'active' : ''}`}
                  onClick={() => setAnalysisMode(m)}>
                  {modeLabel[m]}
                </button>
              ))}
            </div>
          </div>

          {/* ── Section 1: Nutrient coverage bars ── */}
          <div className="coverage-panel">
            <h3 className="coverage-title">
              {st.coverageTitle}
              <span className="coverage-subtitle"> {st.coverageSub}</span>
            </h3>
            <ul className="coverage-list">
              {coverageList.map(n => {
                const name = lang === 'ko' ? n.name_ko : n.name_en
                const color = dvColor(n.pct)
                return (
                  <li key={n.id} className="coverage-row">
                    <div className="coverage-row-top">
                      <span className="coverage-name">{name}</span>
                      <span className="coverage-pct" style={{ color }}>
                        {n.pct !== null ? `${n.pct}%` : '—'}
                      </span>
                    </div>
                    {n.pct !== null && (
                      <div className="coverage-bar-track">
                        <div className="coverage-bar-fill"
                          style={{ width: `${Math.min(n.pct, 100)}%`, background: color }} />
                        {n.pct > 100 && (
                          <div className="coverage-bar-over"
                            style={{ width: `${Math.min(n.pct - 100, 100) * 0.3}%` }} />
                        )}
                      </div>
                    )}
                    <div className="coverage-amount">
                      {n.amount.toFixed(n.amount < 1 ? 2 : 0)} {n.unit}
                      {n.recommended && (
                        <span className="coverage-rec"> / {n.recommended} {n.unit}</span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* ── Section 2: Health purpose scores ── */}
          {purposeScores.length > 0 && (
            <div className="purpose-panel">
              <h3 className="coverage-title">{st.purposeTitle}</h3>
              <div className="purpose-grid">
                {purposeScores.map(p => {
                  const label = lang === 'ko' ? p.ko : p.en
                  const color = dvColor(p.score)
                  return (
                    <div className="purpose-card" key={p.key}>
                      <PurposeRing score={p.score} icon={p.icon} />
                      <span className="purpose-label">{label}</span>
                      <span className="purpose-score" style={{ color }}>
                        {p.score !== null ? `${p.score}%` : '?'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
