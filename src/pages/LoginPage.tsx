import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export function LoginPage({ onLogin }: { onLogin: (userId: string) => void }) {
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const handleLogin = async () => {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !trimmed.includes('@')) {
      setError('Bitte eine gültige E-Mail-Adresse eingeben.')
      return
    }
    setLoading(true)
    setError('')

    // Prüfe ob Benutzer in der DB existiert
    const { data: user, error: dbErr } = await supabase
      .from('benutzer')
      .select('id, name, email')
      .eq('email', trimmed)
      .single()

    setLoading(false)

    if (dbErr || !user) {
      setError('Diese E-Mail ist nicht registriert. Bitte wende dich an deinen Administrator.')
      return
    }

    // Session lokal speichern — bleibt bis zum Logout erhalten
    localStorage.setItem('lagerapp_user_id', user.id)
    localStorage.setItem('lagerapp_user_email', user.email)
    onLogin(user.id)
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-surface-900 px-6"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>

      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="w-20 h-20 rounded-3xl bg-brand-600 flex items-center justify-center mx-auto mb-5"
          style={{ boxShadow: '0 0 24px rgba(2,132,199,0.4)' }}>
          <span className="text-4xl">📦</span>
        </div>
        <h1 className="text-[28px] font-bold text-white">LagerApp</h1>
        <p className="text-surface-500 text-sm mt-1">Professionelle Lagerverwaltung</p>
      </div>

      {/* Form */}
      <div className="w-full max-w-sm">
        <div className="mb-5">
          <label className="block text-[11px] font-semibold text-surface-400 uppercase tracking-widest mb-2">
            E-Mail-Adresse
          </label>
          <input
            type="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="email"
            placeholder="deine@email.ch"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full bg-surface-800 border border-surface-700 text-white rounded-2xl px-4 py-4 focus:outline-none focus:border-brand-500 placeholder:text-surface-600"
            style={{ fontSize: '16px' }}
          />
          {error && <p className="text-red-400 text-xs mt-2 leading-relaxed">{error}</p>}
        </div>

        <button type="button" onClick={handleLogin}
          disabled={loading || !email.trim()}
          className="w-full py-4 rounded-2xl bg-brand-600 text-white font-bold text-base active:bg-brand-700 disabled:opacity-50 transition-all">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Anmelden…
            </span>
          ) : 'Anmelden'}
        </button>

        <p className="text-surface-600 text-xs text-center mt-4 leading-relaxed">
          Nur registrierte Benutzer können sich anmelden.<br />
          Wende dich an deinen Administrator für einen Zugang.
        </p>
      </div>

      <p className="absolute text-surface-700 text-xs"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
        LagerApp v1.0
      </p>
    </div>
  )
}
