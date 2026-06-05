import { useState, useEffect, useCallback } from 'react'
import { supabase, getDeviceId } from './lib/supabase'
import SupplementList from './components/SupplementList'
import SupplementForm from './components/SupplementForm'
import TodayView from './components/TodayView'
import StatsView from './components/StatsView'

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
  const [tab, setTab] = useState('today')
  const [supplements, setSupplements] = useState([])
  const [intakeLogs, setIntakeLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [notifPermission, setNotifPermission] = useState(Notification.permission)

  const today = new Date().toISOString().split('T')[0]

  const fetchAll = useCallback(async () => {
    const [{ data: supps }, { data: logs }] = await Promise.all([
      supabase.from('supplements').select('*').eq('device_id', deviceId).order('created_at'),
      supabase.from('intake_logs').select('*').eq('device_id', deviceId)
        .gte('taken_date', new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]),
    ])
    if (supps) setSupplements(supps)
    if (logs) setIntakeLogs(logs)
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])
  useEffect(() => { scheduleReminders(supplements) }, [supplements])

  async function toggleIntake(supplementId) {
    const existing = intakeLogs.find(
      l => l.supplement_id === supplementId && l.taken_date === today
    )
    if (existing) {
      const { error } = await supabase.from('intake_logs').delete().eq('id', existing.id)
      if (!error) setIntakeLogs(prev => prev.filter(l => l.id !== existing.id))
    } else {
      const { data, error } = await supabase
        .from('intake_logs')
        .insert({ device_id: deviceId, supplement_id: supplementId, taken_date: today })
        .select().single()
      if (!error) setIntakeLogs(prev => [...prev, data])
    }
  }

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
        .from('supplements').insert({ ...fields, device_id: deviceId }).select().single()
      if (!error) setSupplements(prev => [...prev, data])
    }
    setShowForm(false)
    setEditTarget(null)
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('supplements').delete().eq('id', id)
    if (!error) setSupplements(prev => prev.filter(s => s.id !== id))
  }

  function openEdit(supp) { setEditTarget(supp); setShowForm(true) }
  function openAdd() { setEditTarget(null); setShowForm(true) }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1 className="app-title">Ambrosia</h1>
          <p className="app-subtitle">Supplement Tracker</p>
        </div>
        <div className="header-actions">
          {notifPermission !== 'granted' && (
            <button className="btn btn-ghost" onClick={requestPermission}>🔔 Enable Reminders</button>
          )}
          <button className="btn btn-primary" onClick={openAdd}>+ Add Supplement</button>
        </div>
      </header>

      <nav className="tab-nav">
        {[['today', 'Today'], ['supplements', 'My Supplements'], ['stats', 'Stats']].map(([key, label]) => (
          <button key={key} className={`tab-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {loading ? (
          <p className="loading">Loading…</p>
        ) : tab === 'today' ? (
          <TodayView supplements={supplements} intakeLogs={intakeLogs} today={today} onToggle={toggleIntake} />
        ) : tab === 'supplements' ? (
          <SupplementList supplements={supplements} onEdit={openEdit} onDelete={handleDelete} />
        ) : (
          <StatsView supplements={supplements} intakeLogs={intakeLogs} today={today} />
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
