import { useState } from 'react'
import { useLang } from '../lib/LangContext'
import { supabase, getDeviceId } from '../lib/supabase'
import NutrientForm from './NutrientForm'

const deviceId = getDeviceId()
const CATEGORIES = ['Vitamin', 'Mineral', 'Fatty Acid', 'Amino Acid', 'Probiotic', 'Herb', 'Other']

export default function NutrientsTab({ nutrients, onRefresh }) {
  const { lang, t } = useLang()
  const nt = t.nutrientsTab
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [filterCat, setFilterCat] = useState('All')

  async function handleSave(fields) {
    if (editTarget) {
      await supabase.from('nutrients').update(fields).eq('id', editTarget.id)
    } else {
      await supabase.from('nutrients').insert({ ...fields, device_id: deviceId })
    }
    onRefresh()
    setShowForm(false)
    setEditTarget(null)
  }

  async function handleDelete(id) {
    if (!window.confirm(lang === 'ko' ? '정말 삭제하시겠습니까?' : 'Delete this nutrient?')) return
    await supabase.from('nutrients').delete().eq('id', id)
    onRefresh()
  }

  const filtered = filterCat === 'All' ? nutrients : nutrients.filter(n => n.category === filterCat)

  return (
    <div>
      <div className="section-toolbar">
        <h2 className="section-title">{nt.title}</h2>
        <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowForm(true) }}>
          {nt.addBtn}
        </button>
      </div>

      <div className="cat-filter">
        <button className={`cat-btn ${filterCat === 'All' ? 'active' : ''}`} onClick={() => setFilterCat('All')}>
          {nt.all}
        </button>
        {CATEGORIES.map(c => (
          <button key={c} className={`cat-btn ${filterCat === c ? 'active' : ''}`} onClick={() => setFilterCat(c)}>
            {t.categories[c] || c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🧪</span>
          <h2>{nt.emptyState}</h2>
        </div>
      ) : (
        <div className="nutrient-cards">
          {filtered.map(n => {
            const primaryName = lang === 'ko' ? n.name_ko : n.name_en
            const secondaryName = lang === 'ko' ? n.name_en : n.name_ko
            const desc = lang === 'ko' ? n.description_ko : n.description_en
            return (
              <div className="nutrient-card" key={n.id}>
                <div className="card-top">
                  <div>
                    <h3 className="nutrient-card-name">{primaryName}</h3>
                    <p className="nutrient-card-alt">{secondaryName}</p>
                  </div>
                  <span className="badge">{t.categories[n.category] || n.category}</span>
                </div>
                {desc && <p className="nutrient-desc">{desc}</p>}
                <p className="nutrient-rec">
                  {nt.recDaily}: <strong>{n.recommended_daily ?? '—'} {n.unit}</strong>
                </p>
                {!n.device_id && <span className="builtin-tag">{nt.builtIn}</span>}
                <div className="card-actions">
                  <button className="btn btn-sm" onClick={() => { setEditTarget(n); setShowForm(true) }}>{t.edit}</button>
                  {n.device_id && (
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(n.id)}>{t.delete}</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <NutrientForm
          initial={editTarget}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditTarget(null) }}
        />
      )}
    </div>
  )
}
