import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useLang } from '../lib/LangContext'

const REDIRECT_URL = window.location.origin + import.meta.env.BASE_URL

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}


export default function AuthScreen() {
  const { lang, t, setLang } = useLang()
  const at = t.auth
  const [tab, setTab] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(null)
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

  async function handleOAuth(provider) {
    setError('')
    setOauthLoading(provider)
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: REDIRECT_URL },
    })
    if (err) {
      setError(err.message)
      setOauthLoading(null)
    }
    // on success, browser redirects — no need to clear loading
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

        <div className="oauth-btns">
          <button
            className="oauth-btn oauth-btn-google"
            onClick={() => handleOAuth('google')}
            disabled={!!oauthLoading}
          >
            <GoogleIcon />
            {oauthLoading === 'google' ? '…' : at.continueWithGoogle}
          </button>

        </div>

        <div className="auth-divider">
          <span>{at.orContinueWith}</span>
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
