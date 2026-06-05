import { useState } from 'react'
import { useLang } from '../lib/LangContext'

const FREQUENCIES = ['daily', 'twice_daily', 'weekly', 'as_needed']

export default function SupplementForm({ initial, nutrients, onSave, onCancel }) {
  const { lang, t } = useLang()
  const sf = t.suppForm

  const [name, setName] = useState(initial?.name ?? '')
  const [dosage, setDosage] = useState(initial?.dosage ?? '')
  const [frequency, setFrequency] = useState(initial?.frequency ?? 'daily')
  const [reminderTimes, setReminderTimes] = useState(initial?.reminder_times ?? [])
  const [newTime, setNewTime] = useState('')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [selectedNutrients, setSelectedNutrients] = useState(
    initial?.supplement_nutrients?.map(sn => ({
      nutrient_id: sn.nutrient_id,
      amount_per_serving: String(sn.amount_per_serving),
      nutrient: sn.nutrients,
    })) ?? []
  )

  function addTime() {
    if (newTime && !reminderTimes.includes(newTime)) {
      setReminderTimes(prev => [...prev, newTime].sort())
      setNewTime('')
    }
  }

  function addNutrientRow() {
    setSelectedNutrients(prev => [...prev, { nutrient_id: '', amount_per_serving: '', nutrient: null }])
  }

  function updateRow(i, field, value) {
    setSelectedNutrients(prev => prev.map((sn, idx) => {
      if (idx !== i) return sn
      if (field === 'nutrient_id') {
        return { ...sn, nutrient_id: value, nutrient: nutrients.find(n => n.id === value) ?? null }
      }
      return { ...sn, [field]: value }
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({
      name: name.trim(), dosage: dosage.trim(), frequency,
      reminder_times: reminderTimes, notes: notes.trim(),
      supplement_nutrients: selectedNutrients.filter(sn => sn.nutrient_id && sn.amount_per_serving !== ''),
    })
  }

  // Group nutrients by category for the select dropdown
  const grouped = {}
  nutrients.forEach(n => {
    if (!grouped[n.category]) grouped[n.category] = []
    grouped[n.category].push(n)
  })

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal">
        <h2 className="modal-title">{initial ? sf.editTitle : sf.addTitle}</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>{sf.name}</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder={sf.namePlaceholder} required autoFocus />
          </div>
          <div className="two-col">
            <div className="field">
              <label>{sf.dosage}</label>
              <input value={dosage} onChange={e => setDosage(e.target.value)} placeholder={sf.dosagePlaceholder} />
            </div>
            <div className="field">
              <label>{sf.frequency}</label>
              <select value={frequency} onChange={e => setFrequency(e.target.value)}>
                {FREQUENCIES.map(f => <option key={f} value={f}>{t.freq[f]}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label>{sf.reminderTimes}</label>
            <div className="time-row">
              <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} />
              <button type="button" className="btn btn-ghost btn-sm" onClick={addTime}>+</button>
            </div>
            {reminderTimes.length > 0 && (
              <div className="time-tags">
                {reminderTimes.map(tm => (
                  <span className="tag" key={tm}>
                    {tm}
                    <button type="button" className="tag-remove" onClick={() => setReminderTimes(p => p.filter(x => x !== tm))}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="field">
            <label>{sf.notes}</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={sf.notesPlaceholder} rows={2} />
          </div>

          <div className="field">
            <label>{sf.nutrientsSection}</label>
            {selectedNutrients.length > 0 && (
              <div className="sn-header">
                <span>{lang === 'ko' ? '영양소' : 'Nutrient'}</span>
                <span>{sf.amountLabel}</span>
                <span>DV%</span>
                <span />
              </div>
            )}
            {selectedNutrients.map((sn, i) => {
              const dvPct = sn.nutrient?.recommended_daily && sn.amount_per_serving
                ? Math.round((Number(sn.amount_per_serving) / sn.nutrient.recommended_daily) * 100)
                : null
              return (
                <div className="sn-row" key={i}>
                  <select value={sn.nutrient_id} onChange={e => updateRow(i, 'nutrient_id', e.target.value)}>
                    <option value="">{sf.selectNutrient}</option>
                    {Object.entries(grouped).map(([cat, items]) => (
                      <optgroup key={cat} label={t.categories[cat] || cat}>
                        {items.map(n => (
                          <option key={n.id} value={n.id}>
                            {lang === 'ko' ? n.name_ko : n.name_en}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <div className="sn-amount">
                    <input
                      type="number" min="0" step="any"
                      placeholder="0"
                      value={sn.amount_per_serving}
                      onChange={e => updateRow(i, 'amount_per_serving', e.target.value)}
                    />
                    {sn.nutrient && <span className="sn-unit">{sn.nutrient.unit}</span>}
                  </div>
                  <span className="sn-dv">{dvPct !== null ? `${dvPct}%` : '—'}</span>
                  <button type="button" className="tag-remove" onClick={() => setSelectedNutrients(p => p.filter((_, idx) => idx !== i))}>×</button>
                </div>
              )
            })}
            <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: '0.5rem' }} onClick={addNutrientRow}>
              {sf.addNutrient}
            </button>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>{t.cancel}</button>
            <button type="submit" className="btn btn-primary">{t.save}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
