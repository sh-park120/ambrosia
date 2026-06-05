import { useState, useEffect, useCallback } from 'react'
import { supabase, getDeviceId } from './lib/supabase'
import { LangProvider, useLang } from './lib/LangContext'
import SupplementList from './components/SupplementList'
import SupplementForm from './components/SupplementForm'
import NutrientsTab from './components/NutrientsTab'
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

function AppInner() {
  const { lang, t, setLang } = useLang()
  const [tab, setTab] = useState('today')
  const [supplements, setSupplements] = useState([])
  const [nutrients, setNutrients] = useState([])
  const [intakeLogs, setIntakeLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSuppForm, setShowSuppForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [notifPermission, setNotifPermission] = useState(Notification.permission)

  const today = new Date().toISOString().split('T')[0]

  const fetchAll = useCallback(async () => {
    const since = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
    const [{ data: supps }, { data: nuts }, { data: logs }] = await Promise.all([
      supabase.from('supplements').select(`
        *, supplement_nutrients(id, amount_per_serving, nutrient_id, nutrients(*))
      `).eq('device_id', deviceId).order('created_at'),
      supabase.from('nutrients').select('*').order('category').order('name_en'),
      supabase.from('intake_logs').select('*').eq('device_id', deviceId).gte('taken_date', since),
    ])
    if (supps) setSupplements(supps)
    if (nuts) setNutrients(nuts)
    if (logs) setIntakeLogs(logs)
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])
  useEffect(() => { scheduleReminders(supplements) }, [supplements])

  async function toggleIntake(supplementId) {
    const existing = intakeLogs.find(l => l.supplement_id === supplementId && l.taken_date === today)
    if (existing) {
      await supabase.from('intake_logs').delete().eq('id', existing.id)
      setIntakeLogs(prev => prev.filter(l => l.id !== existing.id))
    } else {
      const { data } = await supabase.from('intake_logs')
        .insert({ device_id: deviceId, supplement_id: supplementId, taken_date: today })
        .select().single()
      if (data) setIntakeLogs(prev => [...prev, data])
    }
  }

  async function requestPermission() {
    const perm = await Notification.requestPermission()
    setNotifPermission(perm)
    if (perm === 'granted') scheduleReminders(supplements)
  }

  async function handleSaveSupplement(fields) {
    const { supplement_nutrients: snData, ...suppFields } = fields
    if (editTarget) {
      await supabase.from('supplements').update(suppFields).eq('id', editTarget.id)
      await supabase.from('supplement_nutrients').delete().eq('supplement_id', editTarget.id)
      if (snData.length > 0) {
        await supabase.from('supplement_nutrients').insert(
          snData.map(sn => ({ supplement_id: editTarget.id, nutrient_id: sn.nutrient_id, amount_per_serving: Number(sn.amount_per_serving) }))
        )
      }
    } else {
      const { data: created } = await supabase.from('supplements')
        .insert({ ...suppFields, device_id: deviceId }).select().single()
      if (created && snData.length > 0) {
        await supabase.from('supplement_nutrients').insert(
          snData.map(sn => ({ supplement_id: created.id, nutrient_id: sn.nutrient_id, amount_per_serving: Number(sn.amount_per_serving) }))
        )
      }
    }
    await fetchAll()
    setShowSuppForm(false)
    setEditTarget(null)
  }

  async function handleDeleteSupplement(id) {
    await supabase.from('supplements').delete().eq('id', id)
    setSupplements(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1 className="app-title">Ambrosia</h1>
          <p className="app-subtitle">{t.subtitle}</p>
        </div>
        <div className="header-actions">
          <div className="lang-toggle">
            <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>ENG</button>
            <button className={lang === 'ko' ? 'active' : ''} onClick={() => setLang('ko')}>KOR</button>
          </div>
          {notifPermission !== 'granted' && (
            <button className="btn btn-ghost" onClick={requestPermission}>{t.enableReminders}</button>
          )}
          <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowSuppForm(true) }}>
            {t.addSupplement}
          </button>
        </div>
      </header>

      <nav className="tab-nav">
        {Object.entries(t.tabs).map(([key, label]) => (
          <button key={key} className={`tab-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {loading ? <p className="loading">Loading…</p>
          : tab === 'today' ? <TodayView supplements={supplements} intakeLogs={intakeLogs} today={today} onToggle={toggleIntake} />
          : tab === 'supplements' ? <SupplementList supplements={supplements} onEdit={s => { setEditTarget(s); setShowSuppForm(true) }} onDelete={handleDeleteSupplement} />
          : tab === 'nutrients' ? <NutrientsTab nutrients={nutrients} onRefresh={fetchAll} />
          : <StatsView supplements={supplements} intakeLogs={intakeLogs} today={today} />
        }
      </main>

      {showSuppForm && (
        <SupplementForm
          initial={editTarget}
          nutrients={nutrients}
          onSave={handleSaveSupplement}
          onCancel={() => { setShowSuppForm(false); setEditTarget(null) }}
        />
      )}
    </div>
  )
}

export default function App() {
  return <LangProvider><AppInner /></LangProvider>
}
