import React, { useState, useEffect, useRef, useCallback } from 'react'
import { X, ChevronLeft, Search } from 'lucide-react'
import { HINTS, LIE_COLORS, CAT_COLORS, ROOM_EMOJIS, LIE_EMOJIS } from '../types'

// ─── Sheet ────────────────────────────────────────────────────────────────────
export function Sheet({
  open, onClose, title, children, tall = false,
}: { open: boolean; onClose: () => void; title?: string; children: React.ReactNode; tall?: boolean }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ touchAction: 'none' }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full bg-surface-800 rounded-t-3xl border-t border-surface-700 animate-slide-up flex flex-col ${tall ? 'max-h-[92vh]' : 'max-h-[88vh]'}`}>
        <div className="flex-shrink-0 flex justify-center pt-2.5 pb-1">
          <div className="w-9 h-1 rounded-full bg-surface-600" />
        </div>
        {title && (
          <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-surface-700">
            <span className="text-base font-semibold text-white">{title}</span>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-surface-700 text-surface-400">
              <X size={14} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto scroll-area">{children}</div>
      </div>
    </div>
  )
}

// ─── Page (full-screen sub-page) ─────────────────────────────────────────────
export function Page({
  open, onBack, title, backLabel = 'Zurück', right, children,
}: { open: boolean; onBack: () => void; title: string; backLabel?: string; right?: React.ReactNode; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 bg-surface-900 flex flex-col animate-slide-up">
      <div className="flex-shrink-0 border-b border-surface-800" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center gap-1 px-3 py-3">
          <button onClick={onBack} className="flex items-center gap-0.5 text-brand-400 text-sm font-medium min-w-[64px]">
            <ChevronLeft size={20} />{backLabel}
          </button>
          <h1 className="flex-1 text-center text-[15px] font-semibold text-white truncate px-1">{title}</h1>
          <div className="min-w-[64px] flex justify-end">{right}</div>
        </div>
      </div>
      <div className="flex-1 scroll-area">{children}</div>
    </div>
  )
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────
export function Confirm({
  open, title, body, confirmLabel = 'Löschen', danger = true, onConfirm, onCancel,
}: { open: boolean; title: string; body: string; confirmLabel?: string; danger?: boolean; onConfirm: () => void; onCancel: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-surface-800 rounded-3xl border border-surface-700 p-6 animate-fade-in">
        <p className="text-lg font-bold text-white mb-2">{title}</p>
        <p className="text-surface-400 text-sm mb-6 leading-relaxed">{body}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-2xl bg-surface-700 text-white font-semibold text-sm">Abbrechen</button>
          <button onClick={onConfirm} className={`flex-1 py-3 rounded-2xl text-white font-semibold text-sm ${danger ? 'bg-red-600' : 'bg-brand-600'}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
export function Toggle({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!on)}
      className={`relative w-[46px] h-7 rounded-full transition-colors ${on ? 'bg-green-500' : 'bg-surface-600'} ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className={`absolute top-[3px] left-[3px] w-[21px] h-[21px] bg-white rounded-full shadow transition-transform ${on ? 'translate-x-[19px]' : ''}`} />
    </button>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AV = ['#0284c7','#059669','#7c3aed','#d97706','#dc2626','#0891b2','#65a30d','#db2777']
export function Avatar({ initials, color, size = 'md', active }: { initials: string; color?: string; size?: 'sm'|'md'|'lg'; active?: boolean }) {
  const bg = color || AV[initials.charCodeAt(0) % AV.length]
  const cls = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-14 h-14 text-lg' : 'w-10 h-10 text-sm'
  return (
    <div className="relative inline-flex flex-shrink-0">
      <div className={`${cls} rounded-full flex items-center justify-center font-bold text-white`} style={{ backgroundColor: bg }}>{initials.slice(0,2).toUpperCase()}</div>
      {active && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-900" />}
    </div>
  )
}

// ─── RoleBadge ────────────────────────────────────────────────────────────────
export function RoleBadge({ role }: { role: string }) {
  const m = role === 'admin' ? 'bg-red-900/50 text-red-300 border-red-800'
    : role === 'user' ? 'bg-brand-900/50 text-brand-300 border-brand-800'
    : 'bg-surface-700 text-surface-400 border-surface-600'
  const l = role === 'admin' ? 'Admin' : role === 'user' ? 'User' : 'Gast'
  return <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${m}`}>{l}</span>
}

// ─── HintIcons / HintBadges ──────────────────────────────────────────────────
export function HintIcons({ hints }: { hints: string[] }) {
  return <div className="flex gap-0.5">{hints.map(id => { const h = HINTS.find(x => x.id === id); return h ? <span key={id} className="text-sm leading-none" title={h.label}>{h.icon}</span> : null })}</div>
}
export function HintBadges({ hints }: { hints: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {hints.map(id => { const h = HINTS.find(x => x.id === id); return h ? (
        <span key={id} className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-xl"
          style={{ background: h.bg, color: h.text, border: `1px solid ${h.border}` }}>{h.icon} {h.label}</span>
      ) : null })}
    </div>
  )
}

// ─── HintChips (selectable) ───────────────────────────────────────────────────
export function HintChips({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter(x => x !== id) : [...value, id])
  return (
    <div className="flex flex-wrap gap-2">
      {HINTS.map(h => {
        const sel = value.includes(h.id)
        return (
          <button key={h.id} type="button" onClick={() => toggle(h.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition-all"
            style={sel ? { background: h.bg, color: h.text, borderColor: h.border } : { background: 'transparent', color: '#64748b', borderColor: '#334155' }}>
            {h.icon} {h.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────
export function SL({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold text-surface-500 uppercase tracking-widest px-5 pt-5 pb-2">{children}</p>
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-4 bg-surface-800 rounded-3xl border border-surface-700 overflow-hidden ${className}`}>{children}</div>
}

// ─── CardRow ──────────────────────────────────────────────────────────────────
export function CardRow({ onClick, children, className = '' }: { onClick?: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-surface-700/60 last:border-0 text-left active:bg-surface-700/50 transition-colors ${className}`}>
      {children}
    </button>
  )
}

// ─── Btn ──────────────────────────────────────────────────────────────────────
export function Btn({
  variant = 'primary', children, className = '', ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'danger'|'ghost' }) {
  const v = variant === 'primary' ? 'bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white'
    : variant === 'secondary' ? 'bg-surface-700 hover:bg-surface-600 text-white'
    : variant === 'danger' ? 'bg-red-700 hover:bg-red-600 text-white'
    : 'bg-transparent text-brand-400 hover:bg-surface-800'
  return (
    <button type="button" {...props}
      className={`w-full py-3.5 rounded-2xl font-semibold text-[15px] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${v} ${className}`}>
      {children}
    </button>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div className="mb-3">
      {label && <label className="block text-[11px] font-semibold text-surface-400 uppercase tracking-widest mb-1.5">{label}</label>}
      <input {...props}
        className={`w-full bg-surface-900 border border-surface-700 text-white rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 placeholder:text-surface-600 ${className}`} />
    </div>
  )
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
export function Textarea({ label, className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <div className="mb-3">
      {label && <label className="block text-[11px] font-semibold text-surface-400 uppercase tracking-widest mb-1.5">{label}</label>}
      <textarea {...props}
        className={`w-full bg-surface-900 border border-surface-700 text-white rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 placeholder:text-surface-600 resize-none ${className}`} />
    </div>
  )
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ label, children, className = '', ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <div className="mb-3">
      {label && <label className="block text-[11px] font-semibold text-surface-400 uppercase tracking-widest mb-1.5">{label}</label>}
      <select {...props}
        className={`w-full bg-surface-900 border border-surface-700 text-white rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 appearance-none ${className}`}>
        {children}
      </select>
    </div>
  )
}

// ─── SearchBar ────────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Suchen…' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative mx-4 my-2">
      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none" />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-surface-800 border border-surface-700 text-white rounded-2xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 placeholder:text-surface-600" />
    </div>
  )
}

// ─── EmojiGrid ───────────────────────────────────────────────────────────────
export function EmojiGrid({ options, value, onChange }: { options: string[]; value: string; onChange: (e: string) => void }) {
  return (
    <div className="grid grid-cols-5 gap-2 mb-4">
      {options.map(e => (
        <button key={e} type="button" onClick={() => onChange(e)}
          className={`h-11 rounded-2xl text-xl flex items-center justify-center border transition-all ${value === e ? 'bg-brand-900/60 border-brand-500' : 'bg-surface-900 border-surface-700'}`}>
          {e}
        </button>
      ))}
    </div>
  )
}

// ─── ColorGrid ────────────────────────────────────────────────────────────────
export function ColorGrid({ options, value, onChange }: { options: { color: string; bg: string }[]; value: string; onChange: (opt: { color: string; bg: string }) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {options.map(opt => (
        <button key={opt.color} type="button" onClick={() => onChange(opt)}
          className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-transform ${value === opt.color ? 'border-white scale-110' : 'border-transparent'}`}
          style={{ backgroundColor: opt.bg }}>
          <div className="w-5 h-5 rounded-full" style={{ backgroundColor: opt.color }} />
        </button>
      ))}
    </div>
  )
}

// ─── LoadingSpinner ───────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-48">
      <div className="w-9 h-9 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
export function Empty({ icon, title, sub, action }: { icon: string; title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="text-5xl mb-4 opacity-30">{icon}</div>
      <p className="text-white font-semibold text-base mb-1">{title}</p>
      {sub && <p className="text-surface-500 text-sm mb-4">{sub}</p>}
      {action}
    </div>
  )
}

// ─── Toast system ─────────────────────────────────────────────────────────────
type ToastT = { msg: string; type?: 'ok'|'err'|'info' }
let _push: ((t: ToastT) => void) | null = null
export const toast = (msg: string, type: ToastT['type'] = 'ok') => _push?.({ msg, type })

export function ToastHost() {
  const [t, setT] = useState<ToastT | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  _push = useCallback((x: ToastT) => {
    setT(x)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setT(null), 2800)
  }, [])
  if (!t) return null
  const bg = t.type === 'err' ? 'bg-red-900 border-red-700' : t.type === 'info' ? 'bg-brand-900 border-brand-700' : 'bg-green-900 border-green-700'
  return (
    <div className={`fixed bottom-28 left-4 right-4 z-[100] ${bg} border text-white px-4 py-3.5 rounded-2xl text-sm font-medium shadow-glass animate-slide-up`} style={{ maxWidth: 400, margin: '0 auto' }}>
      {t.msg}
    </div>
  )
}

// ─── FAB ─────────────────────────────────────────────────────────────────────
export function FAB({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className="fixed bottom-24 right-4 z-30 bg-brand-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-glow active:scale-95 transition-transform">
      {children}
    </button>
  )
}

// ─── Re-export constants for convenience ──────────────────────────────────────
export { LIE_COLORS, CAT_COLORS, ROOM_EMOJIS, LIE_EMOJIS }
