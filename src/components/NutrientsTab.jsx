import { useState } from 'react'
import { useLang } from '../lib/LangContext'
import { supabase } from '../lib/supabase'
import NutrientForm from './NutrientForm'

const CATEGORIES = ['Vitamin', 'Mineral', 'Fatty Acid', 'Amino Acid', 'Probiotic', 'Herb', 'Other']

const CAT_ICONS = {
  Vitamin:      '🌟',
  Mineral:      '💎',
  'Fatty Acid': '🐟',
  'Amino Acid': '🔬',
  Probiotic:    '🦠',
  Herb:         '🌿',
  Other:        '🧪',
}

function CategoryDetailModal({ category, nutrients, user, lang, t, onEdit, onDelete, onClose }) {
  const nt = t.nutrientsTab
  const items = nutrients.filter(n => n.category === category)
  const catLabel = t.categories[category] || category

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-wide">
        <div className="modal-header">
          <div className="modal-header-left">
            <span className="cat-modal-icon">{CAT_ICONS[category]}</span>
            <h2 className="modal-title" style={{ margin: 0 }}>{catLabel}</h2>
            <span className="cat-count-badge">{items.length}</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="cat-nutrient-list">
          {items.map(n => {
            const primaryName = lang === 'ko' ? n.name_ko : n.name_en
            const secondaryName = lang === 'ko' ? n.name_en : n.name_ko
            const desc = lang === 'ko' ? n.description_ko : n.description_en
            const isCreator = n.created_by === user?.id
            const isBuiltIn = !n.created_by
            return (
              <div className="cat-nutrient-row" key={n.id}>
                <div className="cat-nutrient-info">
                  <div className="cat-nutrient-names">
                    <span className="cat-nutrient-primary">{primaryName}</span>
                    <span className="cat-nutrient-secondary">{secondaryName}</span>
                  </div>
                  {desc && <p className="cat-nutrient-desc">{desc}</p>}
                  <div className="cat-nutrient-meta">
                    <span className="cat-nutrient-rec">
                      {nt.recDaily}: <strong>{n.recommended_daily ?? '—'} {n.unit}</strong>
                    </span>
                    {isBuiltIn && <span className="builtin-tag">{nt.builtIn}</span>}
                  </div>
                </div>
                <div className="cat-nutrient-actions">
                  <button className="btn btn-sm" onClick={() => onEdit(n)}>{t.edit}</button>
                  {isCreator && (
                    <button className="btn btn-sm btn-danger" onClick={() => onDelete(n.id)}>{t.delete}</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function NutrientsTab({ nutrients, user, onRefresh }) {
  const { lang, t } = useLang()
  const nt = t.nutrientsTab
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [openCategory, setOpenCategory] = useState(null)

  async function handleSave(fields) {
    if (editTarget) {
      await supabase.from('nutrients').update(fields).eq('id', editTarget.id)
    } else {
      await supabase.from('nutrients').insert({ ...fields, created_by: user?.id ?? null })
    }
    onRefresh()
    setShowForm(false)
    setEditTarget(null)
  }

  async function handleDelete(id) {
    if (!window.confirm(lang === 'ko' ? '정말 삭제하시겠습니까?' : 'Delete this nutrient?')) return
    await supabase.from('nutrients').delete().eq('id', id)
    onRefresh()
    if (openCategory) {
      const remaining = nutrients.filter(n => n.id !== id && n.category === openCategory)
      if (remaining.length === 0) setOpenCategory(null)
    }
  }

  function openEdit(n) {
    setEditTarget(n)
    setShowForm(true)
    setOpenCategory(null)
  }

  // Group nutrients by category
  const grouped = {}
  CATEGORIES.forEach(c => { grouped[c] = [] })
  nutrients.forEach(n => {
    if (grouped[n.category]) grouped[n.category].push(n)
    else grouped['Other']?.push(n)
  })

  return (
    <div>
      <div className="section-toolbar">
        <h2 className="section-title">{nt.title}</h2>
        <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowForm(true) }}>
          {nt.addBtn}
        </button>
      </div>

      <div className="cat-blocks">
        {CATEGORIES.map(c => {
          const items = grouped[c] || []
          const label = t.categories[c] || c
          return (
            <button
              key={c}
              className={`cat-block ${items.length === 0 ? 'cat-block-empty' : ''}`}
              onClick={() => items.length > 0 && setOpenCategory(c)}
              disabled={items.length === 0}
            >
              <span className="cat-block-icon">{CAT_ICONS[c]}</span>
              <span className="cat-block-name">{label}</span>
              <span className="cat-block-count">{items.length}</span>
            </button>
          )
        })}
      </div>

      {openCategory && (
        <CategoryDetailModal
          category={openCategory}
          nutrients={nutrients}
          user={user}
          lang={lang}
          t={t}
          onEdit={openEdit}
          onDelete={handleDelete}
          onClose={() => setOpenCategory(null)}
        />
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
