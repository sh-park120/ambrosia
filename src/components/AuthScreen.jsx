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

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 814 1000" xmlns="http://www.w3.org/2000/svg">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-43.1-150.3-99.8C36.8 782.8 1 665.4 1 548c0-193.2 126.4-295.5 250.8-295.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" fill="currentColor"/>
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
          <button
            className="oauth-btn oauth-btn-apple"
            onClick={() => handleOAuth('apple')}
            disabled={!!oauthLoading}
          >
            <AppleIcon />
            {oauthLoading === 'apple' ? '…' : at.continueWithApple}
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
