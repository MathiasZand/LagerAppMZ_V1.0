import React, { useState, useRef } from 'react'
import { Camera, Scan, Cpu, ChevronRight, X } from 'lucide-react'
import { useApp } from '../lib/AppContext'
import { Avatar, HintIcons, Spinner } from '../components/UI'
import type { Tab } from '../components/TabBar'

export function HomeTab({ onNav, onAdd, onDetail }: {
  onNav: (t: Tab) => void
  onAdd: () => void
  onDetail: (id: string) => void
}) {
  const { activeLie, activeUser, lieArtikel, lieRaeume, lieKategorien, loading } = useApp()
  const [showFind, setShowFind] = useState(false)
  const [aiState, setAiState]   = useState<'idle'|'scan'|'found'|'none'>('idle')
  const [found, setFound]       = useState<typeof lieArtikel[0] | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  const simAI = (id: string) => {
    setAiState('scan'); setFound(null); clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      const it = lieArtikel.find(a => a.id === id)
      if (it) { setFound(it); setAiState('found') } else setAiState('none')
    }, 1800)
  }
  const resetFind = () => { setAiState('idle'); setFound(null) }

  if (loading) return <Spinner />

  const h = new Date().getHours()
  const greet = h < 12 ? 'Guten Morgen' : h < 17 ? 'Guten Tag' : 'Guten Abend'

  return (
    <div className="flex flex-col min-h-full page-header">
      <div className="bg-surface-900/95 backdrop-blur border-b border-surface-800 px-5 pt-4 pb-4 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-surface-500 text-[13px]">{greet}</p>
            <h1 className="text-[24px] font-bold text-white leading-tight">{activeLie?.name ?? '—'}</h1>
          </div>
          <button type="button" onClick={() => onNav('verwaltung')} className="mt-1">
            {activeUser && <Avatar initials={activeUser.initialen} color={activeUser.av_farbe} active />}
          </button>
        </div>
      </div>

      <div className="flex-1 scroll-area pb-tabbar">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 p-4 pb-2">
          {[
            { label: 'Gegenstände', val: lieArtikel.length,    icon: '📦', tab: 'inventar' as Tab },
            { label: 'Lagerorte',   val: lieRaeume.length,     icon: '🏗️', tab: 'verwaltung' as Tab },
            { label: 'Kategorien',  val: lieKategorien.length, icon: '🏷️', tab: 'verwaltung' as Tab },
            { label: 'Mit Hinweis', val: lieArtikel.filter(a => a.hinweise?.length > 0).length, icon: '⚠️', tab: 'inventar' as Tab },
          ].map(s => (
            <button key={s.label} type="button" onClick={() => onNav(s.tab)}
              className="bg-surface-800 border border-surface-700 rounded-3xl p-4 text-left active:scale-[0.97] transition-transform">
              <span className="text-2xl block mb-2">{s.icon}</span>
              <span className="text-2xl font-bold text-white block">{s.val}</span>
              <span className="text-xs text-surface-500">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="px-4 pt-2 flex flex-col gap-3">
          <button type="button" onClick={onAdd}
            className="flex items-center gap-4 p-4 rounded-3xl bg-surface-800 border border-surface-700 active:scale-[0.98] transition-transform text-left">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(2,132,199,0.15)' }}>
              <Camera size={24} className="text-brand-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-[15px]">Neuen Artikel erfassen</p>
              <p className="text-surface-500 text-xs mt-0.5">Foto, Name, Lagerort speichern</p>
            </div>
            <ChevronRight size={17} className="text-surface-600" />
          </button>

          <button type="button" onClick={() => onNav('inventar')}
            className="flex items-center gap-4 p-4 rounded-3xl bg-brand-700 active:scale-[0.98] transition-transform text-left">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Scan size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-[15px]">Lagercode scannen</p>
              <p className="text-white/60 text-xs mt-0.5">Inhalt eines Lagerfachs anzeigen</p>
            </div>
            <ChevronRight size={17} className="text-white/40" />
          </button>

          <button type="button" onClick={() => { setShowFind(true); resetFind() }}
            className="flex items-center gap-4 p-4 rounded-3xl border border-green-800/40 active:scale-[0.98] transition-transform text-left"
            style={{ background: '#050f08' }}>
            <div className="w-12 h-12 rounded-2xl border border-green-700/30 flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(52,199,89,0.08)' }}>
              <Cpu size={24} className="text-green-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-[15px]">Lagerplatz ermitteln</p>
              <p className="text-surface-500 text-xs mt-0.5">KI erkennt Artikel automatisch</p>
            </div>
            <ChevronRight size={17} className="text-surface-600" />
          </button>
        </div>

        {/* Recent */}
        {lieArtikel.length > 0 && (
          <div className="px-4 pt-4">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] font-semibold text-surface-500 uppercase tracking-widest">Zuletzt erfasst</p>
              <button type="button" onClick={() => onNav('inventar')} className="text-brand-400 text-xs font-semibold">Alle</button>
            </div>
            <div className="bg-surface-800 rounded-3xl border border-surface-700 overflow-hidden">
              {lieArtikel.slice(0, 3).map((a, i) => (
                <button key={a.id} type="button" onClick={() => onDetail(a.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-surface-700/50 ${i > 0 ? 'border-t border-surface-700/60' : ''}`}>
                  <span className="text-2xl w-9 text-center flex-shrink-0">{a.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{a.name}</p>
                    <p className="text-surface-500 text-xs truncate">{a.lagerplatz_bezeichnung || a.lagerplatz_code}</p>
                  </div>
                  {a.hinweise?.length > 0 && <HintIcons hints={a.hinweise} />}
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-brand-900/50 text-brand-300 border border-brand-800/70 flex-shrink-0">{a.lagerplatz_code}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lagerplatz ermitteln Overlay */}
      {showFind && (
        <div className="fixed inset-0 z-40 bg-surface-900 flex flex-col page-header">
          <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-surface-800">
            <h2 className="text-[17px] font-bold text-white">Lagerplatz ermitteln</h2>
            <button type="button" onClick={() => { setShowFind(false); resetFind() }}
              className="w-9 h-9 rounded-full bg-surface-800 flex items-center justify-center">
              <X size={18} className="text-surface-400" />
            </button>
          </div>
          <div className="flex-1 scroll-area">
            <div className="mx-4 mt-4 h-48 rounded-3xl overflow-hidden relative flex items-center justify-center" style={{ background: '#030d06' }}>
              <div className="ai-ring" style={{ width: 120, height: 120 }} />
              <div className="ai-ring" style={{ width: 80, height: 80, animationDelay: '0.6s' }} />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 absolute" style={{ animation: 'aiPulse 1.2s ease-in-out infinite' }} />
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-green-400"
                style={{ background: 'rgba(52,199,89,0.12)', border: '0.5px solid rgba(52,199,89,0.35)' }}>
                <Cpu size={11} /> KI-Erkennung aktiv
              </div>
              <div className="absolute bottom-3 left-0 right-0 text-center">
                <p className="text-white/50 text-xs">
                  {aiState === 'idle' && 'Kamera auf Gegenstand richten'}
                  {aiState === 'scan' && 'Analysiere…'}
                  {aiState === 'found' && `Erkannt: ${found?.name}`}
                  {aiState === 'none'  && 'Nicht erkannt'}
                </p>
              </div>
            </div>

            <p className="text-center text-surface-500 text-xs px-6 mt-3">Halte die Kamera auf einen Gegenstand.</p>

            {lieArtikel.length > 0 && (
              <div className="px-4 mt-3">
                <p className="text-xs text-surface-600 text-center mb-2">Demo: Gegenstand tippen</p>
                <div className="flex gap-2 flex-wrap justify-center">
                  {lieArtikel.slice(0, 3).map(a => (
                    <button key={a.id} type="button" onClick={() => simAI(a.id)}
                      className="px-4 py-2 rounded-full text-sm font-semibold border border-green-800/40 text-green-400 active:scale-95 transition-transform"
                      style={{ background: 'rgba(52,199,89,0.07)' }}>
                      {a.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {aiState === 'found' && found && (
              <div className="mx-4 mt-4 rounded-3xl overflow-hidden animate-fade-in border border-green-800/40" style={{ background: 'rgba(5,46,22,0.6)' }}>
                <div className="p-4 flex items-center gap-3 border-b border-green-900/50">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">✓</div>
                  <p className="text-green-300 font-bold text-sm">Artikel erkannt</p>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{found.emoji}</span>
                    <div><p className="text-white font-bold">{found.name}</p><p className="text-surface-400 text-xs">{found.kategorie}</p></div>
                  </div>
                  <div className="bg-surface-900/80 rounded-2xl p-3 mb-3">
                    <p className="text-[10px] text-surface-500 uppercase font-semibold tracking-widest mb-2">Zugewiesener Lagerplatz</p>
                    <div className="flex items-center gap-3">
                      <span className="text-brand-300 font-bold text-base px-3 py-1.5 rounded-xl border border-brand-800/70"
                        style={{ background: 'rgba(12,74,110,0.4)' }}>{found.lagerplatz_code}</span>
                      <p className="text-white font-semibold text-sm">{found.lagerplatz_bezeichnung}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { onDetail(found.id); setShowFind(false) }}
                      className="flex-1 py-2.5 bg-brand-600 text-white rounded-2xl text-sm font-semibold">Inventarblatt</button>
                    <button type="button" onClick={resetFind}
                      className="flex-1 py-2.5 bg-surface-800 text-white rounded-2xl text-sm font-semibold border border-surface-700">Neu scannen</button>
                  </div>
                </div>
              </div>
            )}
            <div className="h-8" />
          </div>
        </div>
      )}
    </div>
  )
}
