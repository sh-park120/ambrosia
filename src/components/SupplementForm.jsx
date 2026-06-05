import { useState } from 'react'
import { useLang } from '../lib/LangContext'

const FREQUENCIES = ['daily', 'twice_daily', 'weekly', 'as_needed']

export default function SupplementForm({ initial, nutrients, user, onSave, onCancel }) {
  const { lang, t } = useLang()
  const sf = t.suppForm
  const ct = t.catalog

  const isCreator = !initial || initial.created_by === user.id

  // Catalog fields (editable only if creator or new)
  const [name, setName] = useState(initial?.name ?? '')
  const [manufacturer, setManufacturer] = useState(initial?.manufacturer ?? '')
  const [pillsPerDose, setPillsPerDose] = useState(initial?.pills_per_dose ?? 1)
  const [dosesPerDay, setDosesPerDay] = useState(initial?.doses_per_day ?? 1)
  const [selectedNutrients, setSelectedNutrients] = useState(
    initial?.supplement_nutrients?.map(sn => ({
      nutrient_id: sn.nutrient_id,
      amount_per_serving: String(sn.amount_per_serving),
      nutrient: sn.nutrients,
    })) ?? []
  )

  // Personal fields (always editable)
  const [frequency, setFrequency] = useState(initial?.frequency ?? 'daily')
  const [reminderTimes, setReminderTimes] = useState(initial?.reminder_times ?? [])
  const [newTime, setNewTime] = useState('')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const totalPerDay = (Number(pillsPerDose) || 0) * (Number(dosesPerDay) || 0)
  const pillWord = totalPerDay === 1 ? sf.pill : sf.pills

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
      name: name.trim(),
      manufacturer: manufacturer.trim() || null,
      pills_per_dose: Number(pillsPerDose) || 1,
      doses_per_day: Number(dosesPerDay) || 1,
      frequency,
      reminder_times: reminderTimes,
      notes: notes.trim(),
      supplement_nutrients: selectedNutrients.filter(sn => sn.nutrient_id && sn.amount_per_serving !== ''),
    })
  }

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

          {/* ── Section 1: Supplement Info (catalog) ── */}
          <div className="form-section-label">{ct.supplementInfo}</div>

          <div className="field">
            <label>{sf.name}</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={sf.namePlaceholder}
              required
              autoFocus
              disabled={!isCreator}
            />
          </div>

          <div className="field">
            <label>{sf.manufacturer}</label>
            <input
              value={manufacturer}
              onChange={e => setManufacturer(e.target.value)}
              placeholder={sf.manufacturerPlaceholder}
              disabled={!isCreator}
            />
          </div>

          <div className="dosage-grid">
            <div className="field">
              <label>{sf.pillsPerDose}</label>
              <input
                type="number" min="0.5" step="0.5"
                value={pillsPerDose}
                onChange={e => setPillsPerDose(e.target.value)}
                disabled={!isCreator}
              />
            </div>
            <div className="field">
              <label>{sf.dosesPerDay}</label>
              <input
                type="number" min="1" step="1"
                value={dosesPerDay}
                onChange={e => setDosesPerDay(e.target.value)}
                disabled={!isCreator}
              />
            </div>
            <div className="dosage-total">
              <span className="dosage-total-num">{totalPerDay}</span>
              <span className="dosage-total-label">{pillWord} {sf.totalPerDay}</span>
            </div>
          </div>

          <div className="field">
            <label>{sf.nutrientsSection}</label>
            {!isCreator && (
              <p className="form-readonly-note">
                {lang === 'ko' ? '다른 사용자가 등록한 영양제입니다.' : 'Nutrients are managed by the creator of this supplement.'}
              </p>
            )}
            {isCreator && (
              <>
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
                              <option key={n.id} value={n.id}>{lang === 'ko' ? n.name_ko : n.name_en}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      <div className="sn-amount">
                        <input
                          type="number" min="0" step="any" placeholder="0"
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
              </>
            )}
          </div>

          {/* ── Section 2: My Settings (personal) ── */}
          <div className="form-section-label" style={{ marginTop: '1rem' }}>{ct.mySettings}</div>

          <div className="field">
            <label>{sf.frequency}</label>
            <select value={frequency} onChange={e => setFrequency(e.target.value)}>
              {FREQUENCIES.map(f => <option key={f} value={f}>{t.freq[f]}</option>)}
            </select>
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

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>{t.cancel}</button>
            <button type="submit" className="btn btn-primary">{t.save}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
