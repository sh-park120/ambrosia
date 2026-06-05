import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { seedNutrientsIfEmpty } from './lib/seedNutrients'
import { LangProvider, useLang } from './lib/LangContext'
import SupplementList from './components/SupplementList'
import SupplementForm from './components/SupplementForm'
import NutrientsTab from './components/NutrientsTab'
import TodayView from './components/TodayView'
import StatsView from './components/StatsView'
import AuthScreen from './components/AuthScreen'
import CatalogBrowser from './components/CatalogBrowser'

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

function normalizeUserSupplements(userSupps) {
  return userSupps.map(us => ({
    userSupplementId: us.id,
    id: us.supplement_id,
    supplement_id: us.supplement_id,
    name: us.supplement.name,
    manufacturer: us.supplement.manufacturer,
    pills_per_dose: us.supplement.pills_per_dose,
    doses_per_day: us.supplement.doses_per_day,
    created_by: us.supplement.created_by,
    supplement_nutrients: us.supplement.supplement_nutrients,
    frequency: us.frequency,
    reminder_times: us.reminder_times,
    notes: us.notes,
  }))
}

function AppInner({ user }) {
  const { lang, t, setLang } = useLang()
  const [tab, setTab] = useState('today')
  const [supplements, setSupplements] = useState([])
  const [nutrients, setNutrients] = useState([])
  const [intakeLogs, setIntakeLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSuppForm, setShowSuppForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [notifPermission, setNotifPermission] = useState(Notification.permission)
  const [showCatalog, setShowCatalog] = useState(false)
  const [catalogSupplements, setCatalogSupplements] = useState([])

  const today = new Date().toISOString().split('T')[0]

  const fetchAll = useCallback(async () => {
    await seedNutrientsIfEmpty()
    const since = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
    const [{ data: userSupps }, { data: nuts }, { data: logs }] = await Promise.all([
      supabase.from('user_supplements').select(`
        id, user_id, supplement_id, frequency, reminder_times, notes,
        supplement:supplements(
          id, name, manufacturer, pills_per_dose, doses_per_day, created_by,
          supplement_nutrients(id, amount_per_serving, nutrient_id, nutrients(*))
        )
      `).eq('user_id', user.id).order('created_at'),
      supabase.from('nutrients').select('*').order('category').order('name_en'),
      supabase.from('intake_logs').select('*').eq('user_id', user.id).gte('taken_date', since),
    ])
    if (userSupps) setSupplements(normalizeUserSupplements(userSupps))
    if (nuts) setNutrients(nuts)
    if (logs) setIntakeLogs(logs)
    setLoading(false)
  }, [user.id])

  const fetchCatalog = useCallback(async () => {
    const mySupplementIds = supplements.map(s => s.supplement_id)
    const { data: allSupps } = await supabase.from('supplements').select(`
      id, name, manufacturer, created_by,
      supplement_nutrients(id)
    `).order('name')
    if (allSupps) {
      const notInMyList = allSupps.filter(s => !mySupplementIds.includes(s.id))
      setCatalogSupplements(notInMyList)
    }
  }, [supplements])

  useEffect(() => { fetchAll() }, [fetchAll])
  useEffect(() => { scheduleReminders(supplements) }, [supplements])

  async function openCatalog() {
    await fetchCatalog()
    setShowCatalog(true)
  }

  async function handleCatalogAdded(supplementId) {
    await fetchAll()
    setCatalogSupplements(prev => prev.filter(s => s.id !== supplementId))
  }

  async function toggleIntake(supplementId) {
    const existing = intakeLogs.find(l => l.supplement_id === supplementId && l.taken_date === today)
    if (existing) {
      await supabase.from('intake_logs').delete().eq('id', existing.id)
      setIntakeLogs(prev => prev.filter(l => l.id !== existing.id))
    } else {
      const { data } = await supabase.from('intake_logs')
        .insert({ user_id: user.id, supplement_id: supplementId, taken_date: today })
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
    const { supplement_nutrients: snData, frequency, reminder_times, notes, ...catalogFields } = fields

    if (editTarget) {
      // Update catalog fields only if user is the creator
      if (editTarget.created_by === user.id) {
        await supabase.from('supplements').update(catalogFields).eq('id', editTarget.supplement_id)
        await supabase.from('supplement_nutrients').delete().eq('supplement_id', editTarget.supplement_id)
        if (snData.length > 0) {
          await supabase.from('supplement_nutrients').insert(
            snData.map(sn => ({
              supplement_id: editTarget.supplement_id,
              nutrient_id: sn.nutrient_id,
              amount_per_serving: Number(sn.amount_per_serving),
            }))
          )
        }
      }
      // Always update personal settings
      await supabase.from('user_supplements').update({ frequency, reminder_times, notes })
        .eq('id', editTarget.userSupplementId)
    } else {
      // Create new supplement in catalog
      const { data: created } = await supabase.from('supplements')
        .insert({ ...catalogFields, created_by: user.id })
        .select().single()
      if (created) {
        if (snData.length > 0) {
          await supabase.from('supplement_nutrients').insert(
            snData.map(sn => ({
              supplement_id: created.id,
              nutrient_id: sn.nutrient_id,
              amount_per_serving: Number(sn.amount_per_serving),
            }))
          )
        }
        // Add to user's personal list
        await supabase.from('user_supplements').insert({
          user_id: user.id,
          supplement_id: created.id,
          frequency,
          reminder_times,
          notes,
        })
      }
    }
    await fetchAll()
    setShowSuppForm(false)
    setEditTarget(null)
  }

  async function handleRemoveFromList(userSupplementId) {
    await supabase.from('user_supplements').delete().eq('id', userSupplementId)
    setSupplements(prev => prev.filter(s => s.userSupplementId !== userSupplementId))
  }

  async function handleDeleteFromCatalog(supplementId, userSupplementId) {
    // Check if any other users have this supplement
    const { data: others } = await supabase.from('user_supplements')
      .select('id').eq('supplement_id', supplementId).neq('user_id', user.id)
    if (others && others.length > 0) {
      // Other users have it — just remove from own list
      await handleRemoveFromList(userSupplementId)
    } else {
      // Safe to delete from catalog (cascades to user_supplements + supplement_nutrients)
      await supabase.from('supplements').delete().eq('id', supplementId)
      setSupplements(prev => prev.filter(s => s.userSupplementId !== userSupplementId))
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
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
          <button className="btn btn-ghost" onClick={handleSignOut}>{t.auth.signOut}</button>
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
          : tab === 'supplements' ? (
            <SupplementList
              supplements={supplements}
              user={user}
              onEdit={s => { setEditTarget(s); setShowSuppForm(true) }}
              onRemoveFromList={handleRemoveFromList}
              onDeleteFromCatalog={handleDeleteFromCatalog}
              onBrowseCatalog={openCatalog}
            />
          )
          : tab === 'nutrients' ? <NutrientsTab nutrients={nutrients} user={user} onRefresh={fetchAll} />
          : <StatsView supplements={supplements} intakeLogs={intakeLogs} today={today} />
        }
      </main>

      {showSuppForm && (
        <SupplementForm
          initial={editTarget}
          nutrients={nutrients}
          user={user}
          onSave={handleSaveSupplement}
          onCancel={() => { setShowSuppForm(false); setEditTarget(null) }}
        />
      )}

      {showCatalog && (
        <CatalogBrowser
          catalogSupplements={catalogSupplements}
          user={user}
          onAdded={handleCatalogAdded}
          onClose={() => setShowCatalog(false)}
        />
      )}
    </div>
  )
}

function AuthGate() {
  const [user, setUser] = useState(undefined) // undefined = loading, null = no session

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (user === undefined) return <p className="loading" style={{ padding: '4rem', textAlign: 'center' }}>Loading…</p>
  if (!user) return <AuthScreen />
  return <AppInner user={user} />
}

export default function App() {
  return <LangProvider><AuthGate /></LangProvider>
}
