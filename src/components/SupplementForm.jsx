import { useState } from 'react'

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'twice_daily', label: 'Twice Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'as_needed', label: 'As Needed' },
]

export default function SupplementForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [dosage, setDosage] = useState(initial?.dosage ?? '')
  const [frequency, setFrequency] = useState(initial?.frequency ?? 'daily')
  const [reminderTimes, setReminderTimes] = useState(initial?.reminder_times ?? [])
  const [newTime, setNewTime] = useState('')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  function addTime() {
    if (newTime && !reminderTimes.includes(newTime)) {
      setReminderTimes(prev => [...prev, newTime].sort())
      setNewTime('')
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), dosage: dosage.trim(), frequency, reminder_times: reminderTimes, notes: notes.trim() })
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onCancel()
  }

  return (
    <div className="overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <h2 className="modal-title">{initial ? 'Edit Supplement' : 'Add Supplement'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Vitamin D3"
              required
              autoFocus
            />
          </div>
          <div className="field">
            <label>Dosage</label>
            <input
              value={dosage}
              onChange={e => setDosage(e.target.value)}
              placeholder="e.g. 2000 IU, 1 capsule"
            />
          </div>
          <div className="field">
            <label>Frequency</label>
            <select value={frequency} onChange={e => setFrequency(e.target.value)}>
              {FREQUENCIES.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
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
                    <button type="button" className="tag-remove" onClick={() => setReminderTimes(prev => prev.filter(x => x !== t))}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="field">
            <label>Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Take with food"
              rows={3}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}
