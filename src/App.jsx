import { useState, useEffect, useCallback } from 'react'
import { supabase, getDeviceId } from './lib/supabase'
import SupplementList from './components/SupplementList'
import SupplementForm from './components/SupplementForm'

const deviceId = getDeviceId()

function scheduleReminders(supplements) {
  if (window._reminderTimers) window._reminderTimers.forEach(clearTimeout)
  window._reminderTimers = []
  if (Notification.permission !== 'granted') return

  const now = new Date()
  supplements.forEach(supp => {
    ;(supp.reminder_times || []).forEach(time => {
      const [h, m] = time.split(':').map(Number)
      const next = new Date()
      next.setHours(h, m, 0, 0)
      if (next <= now) next.setDate(next.getDate() + 1)
      const timer = setTimeout(() => {
        new Notification('Ambrosia Reminder', {
          body: `Time to take your ${supp.name}${supp.dosage ? ` — ${supp.dosage}` : ''}`,
        })
      }, next - now)
      window._reminderTimers.push(timer)
    })
  })
}

export default function App() {
  const [supplements, setSupplements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [notifPermission, setNotifPermission] = useState(Notification.permission)

  const fetchSupplements = useCallback(async () => {
    const { data, error } = await supabase
      .from('supplements')
      .select('*')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: true })
    if (!error) setSupplements(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchSupplements() }, [fetchSupplements])
  useEffect(() => { scheduleReminders(supplements) }, [supplements])

  async function requestPermission() {
    const perm = await Notification.requestPermission()
    setNotifPermission(perm)
    if (perm === 'granted') scheduleReminders(supplements)
  }

  async function handleSave(fields) {
    if (editTarget) {
      const { error } = await supabase.from('supplements').update(fields).eq('id', editTarget.id)
      if (!error) setSupplements(prev => prev.map(s => s.id === editTarget.id ? { ...s, ...fields } : s))
    } else {
      const { data, error } = await supabase
        .from('supplements')
        .insert({ ...fields, device_id: deviceId })
        .select()
        .single()
      if (!error) setSupplements(prev => [...prev, data])
    }
    setShowForm(false)
    setEditTarget(null)
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('supplements').delete().eq('id', id)
    if (!error) setSupplements(prev => prev.filter(s => s.id !== id))
  }

  function openEdit(supp) {
    setEditTarget(supp)
    setShowForm(true)
  }

  function openAdd() {
    setEditTarget(null)
    setShowForm(true)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1 className="app-title">Ambrosia</h1>
          <p className="app-subtitle">Supplement Tracker</p>
        </div>
        <div className="header-actions">
          {notifPermission !== 'granted' && (
            <button className="btn btn-ghost" onClick={requestPermission}>
              🔔 Enable Reminders
            </button>
          )}
          <button className="btn btn-primary" onClick={openAdd}>+ Add Supplement</button>
        </div>
      </header>

      <main className="app-main">
        {loading ? (
          <p className="loading">Loading…</p>
        ) : (
          <SupplementList supplements={supplements} onEdit={openEdit} onDelete={handleDelete} />
        )}
      </main>

      {showForm && (
        <SupplementForm
          initial={editTarget}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditTarget(null) }}
        />
      )}
    </div>
  )
}
