import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useLang } from '../lib/LangContext'

export default function AuthScreen() {
  const { lang, t, setLang } = useLang()
  const at = t.auth
  const [tab, setTab] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (tab === 'signin') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) setError(err.message)
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password })
        if (err) {
          setError(err.message)
        } else {
          setSuccess(at.checkEmail)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="app-title">Ambrosia</h1>
          <p className="auth-tagline">{at.tagline}</p>
        </div>

        <div className="auth-lang-toggle">
          <div className="lang-toggle">
            <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>ENG</button>
            <button className={lang === 'ko' ? 'active' : ''} onClick={() => setLang('ko')}>KOR</button>
          </div>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab-btn ${tab === 'signin' ? 'active' : ''}`}
            onClick={() => { setTab('signin'); setError(''); setSuccess('') }}
          >
            {at.signIn}
          </button>
          <button
            className={`auth-tab-btn ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); setError(''); setSuccess('') }}
          >
            {at.signUp}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>{at.email}</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={at.emailPlaceholder}
              required
              autoFocus
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label>{at.password}</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={at.passwordPlaceholder}
              required
              minLength={6}
              autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading
              ? (tab === 'signin' ? at.signingIn : at.signingUp)
              : (tab === 'signin' ? at.signIn : at.signUp)
            }
          </button>
        </form>
      </div>
    </div>
  )
}
