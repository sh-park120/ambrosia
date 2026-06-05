const FREQ = {
  daily: 'Daily',
  twice_daily: 'Twice Daily',
  weekly: 'Weekly',
  as_needed: 'As Needed',
}

export default function SupplementList({ supplements, onEdit, onDelete }) {
  if (supplements.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">💊</span>
        <h2>No supplements yet</h2>
        <p>Click "Add Supplement" to get started.</p>
      </div>
    )
  }

  return (
    <div className="supplement-grid">
      {supplements.map(s => (
        <article className="card" key={s.id}>
          <div className="card-top">
            <h3 className="card-name">{s.name}</h3>
            <span className="badge">{FREQ[s.frequency] ?? s.frequency}</span>
          </div>
          {s.dosage && <p className="card-dosage">{s.dosage}</p>}
          {s.notes && <p className="card-notes">{s.notes}</p>}
          {s.reminder_times?.length > 0 && (
            <p className="card-reminders">🔔 {s.reminder_times.join(' · ')}</p>
          )}
          <div className="card-actions">
            <button className="btn btn-sm" onClick={() => onEdit(s)}>Edit</button>
            <button className="btn btn-sm btn-danger" onClick={() => onDelete(s.id)}>Delete</button>
          </div>
        </article>
      ))}
    </div>
  )
}
