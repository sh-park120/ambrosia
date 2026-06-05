import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useLang } from '../lib/LangContext'

export default function CatalogBrowser({ catalogSupplements, user, onAdded, onClose }) {
  const { t } = useLang()
  const ct = t.catalog
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(null)

  const filtered = catalogSupplements.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.manufacturer || '').toLowerCase().includes(search.toLowerCase())
  )

  async function handleAdd(supplement) {
    setAdding(supplement.id)
    try {
      await supabase.from('user_supplements').insert({
        user_id: user.id,
        supplement_id: supplement.id,
        frequency: 'daily',
        reminder_times: [],
        notes: '',
      })
      onAdded(supplement.id)
    } finally {
      setAdding(null)
    }
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal catalog-modal">
        <div className="catalog-modal-header">
          <h2 className="modal-title" style={{ marginBottom: 0 }}>{ct.catalogTitle}</h2>
          <button className="tag-remove" style={{ fontSize: '1.5rem' }} onClick={onClose}>×</button>
        </div>

        <div className="field" style={{ marginTop: '1rem' }}>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={ct.searchPlaceholder}
            autoFocus
          />
        </div>

        {filtered.length === 0 ? (
          <p className="catalog-empty">{ct.noResults}</p>
        ) : (
          <div className="catalog-list">
            {filtered.map(s => {
              const nutrientCount = s.supplement_nutrients?.length ?? 0
              const isCreator = s.created_by === user.id
              return (
                <div className="catalog-row" key={s.id}>
                  <div className="catalog-row-info">
                    <span className="catalog-row-name">{s.name}</span>
                    {s.manufacturer && (
                      <span className="catalog-row-mfr">{s.manufacturer}</span>
                    )}
                    <div className="catalog-row-meta">
                      {nutrientCount > 0 && (
                        <span className="catalog-nutrient-count">
                          {nutrientCount} {ct.nutrients}
                        </span>
                      )}
                      {isCreator && (
                        <span className="creator-tag">{ct.createdByYou}</span>
                      )}
                    </div>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={adding === s.id}
                    onClick={() => handleAdd(s)}
                  >
                    {adding === s.id ? '…' : ct.addToMyList}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
