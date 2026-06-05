import { useState } from 'react'

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'twice_daily', label: 'Twice Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'as_needed', label: 'As Needed' },
]

function emptyNutrient() {
  return { name: '', amount: '', unit: '', daily_value_pct: '' }
}

export default function SupplementForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [dosage, setDosage] = useState(initial?.dosage ?? '')
  const [frequency, setFrequency] = useState(initial?.frequency ?? 'daily')
  const [reminderTimes, setReminderTimes] = useState(initial?.reminder_times ?? [])
  const [newTime, setNewTime] = useState('')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const [calories, setCalories] = useState(initial?.calories ?? '')
  const [proteinG, setProteinG] = useState(initial?.protein_g ?? '')
  const [carbsG, setCarbsG] = useState(initial?.carbs_g ?? '')
  const [fatG, setFatG] = useState(initial?.fat_g ?? '')
  const [nutrients, setNutrients] = useState(initial?.nutrients ?? [])

  function addTime() {
    if (newTime && !reminderTimes.includes(newTime)) {
      setReminderTimes(prev => [...prev, newTime].sort())
      setNewTime('')
    }
  }

  function updateNutrient(i, field, value) {
    setNutrients(prev => prev.map((n, idx) => idx === i ? { ...n, [field]: value } : n))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      dosage: dosage.trim(),
      frequency,
      reminder_times: reminderTimes,
      notes: notes.trim(),
      calories: calories === '' ? null : Number(calories),
      protein_g: proteinG === '' ? null : Number(proteinG),
      carbs_g: carbsG === '' ? null : Number(carbsG),
      fat_g: fatG === '' ? null : Number(fatG),
      nutrients: nutrients.filter(n => n.name.trim()),
    })
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal">
        <h2 className="modal-title">{initial ? 'Edit Supplement' : 'Add Supplement'}</h2>
        <form onSubmit={handleSubmit}>

          <div className="field">
            <label>Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Vitamin D3" required autoFocus />
          </div>
          <div className="field">
            <label>Dosage</label>
            <input value={dosage} onChange={e => setDosage(e.target.value)} placeholder="e.g. 2000 IU, 1 capsule" />
          </div>
          <div className="field">
            <label>Frequency</label>
            <select value={frequency} onChange={e => setFrequency(e.target.value)}>
              {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Reminder Times</label>
            <div className="time-row">
              <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} />
              <button type="button" className="btn btn-ghost" onClick={addTime}>Add</button>
            </div>
            {reminderTimes.length > 0 && (
              <div className="time-tags">
                {reminderTimes.map(t => (
                  <span className="tag" key={t}>
                    {t}
                    <button type="button" className="tag-remove" onClick={() => setReminderTimes(p => p.filter(x => x !== t))}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="field">
            <label>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Take with food" rows={2} />
          </div>

          <details className="nutrition-details">
            <summary className="nutrition-summary">Nutrition Info <span className="optional">(optional)</span></summary>

            <p className="section-label">Macros per serving</p>
            <div className="macro-grid">
              {[['Calories', 'kcal', calories, setCalories],
                ['Protein', 'g', proteinG, setProteinG],
                ['Carbs', 'g', carbsG, setCarbsG],
                ['Fat', 'g', fatG, setFatG]].map(([label, unit, val, set]) => (
                <div className="field" key={label}>
                  <label>{label} <span className="unit-hint">({unit})</span></label>
                  <input type="number" min="0" step="any" value={val} onChange={e => set(e.target.value)} placeholder="0" />
                </div>
              ))}
            </div>

            <p className="section-label">Nutrients / Vitamins</p>
            {nutrients.map((n, i) => (
              <div className="nutrient-row" key={i}>
                <input placeholder="Name (e.g. Zinc)" value={n.name} onChange={e => updateNutrient(i, 'name', e.target.value)} />
                <input type="number" placeholder="Amount" min="0" step="any" value={n.amount} onChange={e => updateNutrient(i, 'amount', e.target.value)} />
                <input placeholder="Unit" value={n.unit} onChange={e => updateNutrient(i, 'unit', e.target.value)} />
                <input type="number" placeholder="DV%" min="0" max="9999" value={n.daily_value_pct} onChange={e => updateNutrient(i, 'daily_value_pct', e.target.value)} />
                <button type="button" className="tag-remove" onClick={() => setNutrients(p => p.filter((_, idx) => idx !== i))}>×</button>
              </div>
            ))}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setNutrients(p => [...p, emptyNutrient()])}>
              + Add Nutrient
            </button>
          </details>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}
