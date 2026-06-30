import React, { useState } from 'react'
import { Plus, CheckCircle2, ChevronRight } from 'lucide-react'
import { useApp } from '../lib/AppContext'
import {
  Sheet, Btn, Input, SL, Card, CardRow, Avatar, RoleBadge,
  EmojiGrid, ColorGrid, toast, Spinner, LIE_COLORS, LIE_EMOJIS,
} from '../components/UI'

export function LiegenschaftenTab() {
  const { liegenschaften, activeLieId, switchLie, activeUser, benutzer,
          activeUserId, switchUser, getLieRole, loading, createLiegenschaft } = useApp()

  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [adresse, setAdresse] = useState('')
  const [emoji, setEmoji] = useState('🏢')
  const [colorOpt, setColorOpt] = useState(LIE_COLORS[0])
  const [saving, setSaving] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) { toast('Bitte einen Namen eingeben', 'err'); return }
    setSaving(true)
    const res = await createLiegenschaft({ name: name.trim(), adresse: adresse.trim(), emoji, farbe: colorOpt.color })
    setSaving(false)
    if (res) {
      toast(`Liegenschaft "${res.name}" erstellt`)
      setShowAdd(false); setName(''); setAdresse(''); setEmoji('🏢'); setColorOpt(LIE_COLORS[0])
    } else toast('Fehler beim Erstellen', 'err')
  }

  if (loading) return <Spinner />

  return (
    <div className="flex flex-col min-h-full" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div className="bg-surface-900/95 backdrop-blur border-b border-surface-800 px-5 pt-4 pb-4 flex-shrink-0">
        <h1 className="text-[26px] font-bold text-white leading-tight">Liegenschaften</h1>
        {activeUser && <p className="text-surface-500 text-[13px] mt-0.5">{activeUser.name} · {activeUser.rolle === 'admin' ? 'Administrator' : activeUser.rolle === 'user' ? 'Benutzer' : 'Gast'}</p>}
      </div>

      <div className="flex-1 scroll-area pb-28">
        <SL>Meine Liegenschaften</SL>

        {liegenschaften.length === 0 ? (
          <div className="mx-4 mt-2 bg-surface-800 rounded-3xl p-8 text-center border border-surface-700">
            <div className="text-5xl mb-3">🏢</div>
            <p className="text-white font-semibold mb-1">Keine Liegenschaften</p>
            <p className="text-surface-500 text-sm mb-5">Erstelle deine erste Liegenschaft</p>
            <Btn onClick={() => setShowAdd(true)}>Erstellen</Btn>
          </div>
        ) : (
          <div className="px-4 flex flex-col gap-3 pt-1">
            {liegenschaften.map(l => {
              const isActive = l.id === activeLieId
              const role = activeUser ? getLieRole(activeUser.id, l.id) : 'guest'
              return (
                <button key={l.id} type="button" onClick={() => { switchLie(l.id) }}
                  className="w-full flex items-center gap-3.5 p-4 rounded-3xl border transition-all text-left active:scale-[0.98]"
                  style={{ background: isActive ? colorOpt.bg : 'rgba(30,41,59,1)', borderColor: isActive ? l.farbe : 'rgba(51,65,85,1)' }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[28px] flex-shrink-0"
                    style={{ backgroundColor: `${l.farbe}22` }}>
                    {l.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-[15px] truncate">{l.name}</span>
                      {isActive && <CheckCircle2 size={15} style={{ color: l.farbe }} className="flex-shrink-0" />}
                    </div>
                    {l.adresse && <p className="text-surface-500 text-xs mt-0.5 truncate">{l.adresse}</p>}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <RoleBadge role={role} />
                      {isActive && <span className="text-[11px] font-semibold text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />Aktiv</span>}
                    </div>
                  </div>
                  <ChevronRight size={17} className="text-surface-600 flex-shrink-0" />
                </button>
              )
            })}
          </div>
        )}

        {/* Add button */}
        {(!activeUser || activeUser.rolle === 'admin') && (
          <div className="px-4 pt-3">
            <button type="button" onClick={() => setShowAdd(true)}
              className="w-full flex items-center gap-3 p-4 rounded-3xl border-2 border-dashed border-surface-700 text-surface-500 hover:border-brand-700 hover:text-brand-400 transition-colors">
              <div className="w-11 h-11 rounded-2xl bg-surface-800 flex items-center justify-center flex-shrink-0"><Plus size={22} /></div>
              <div className="text-left"><p className="font-semibold text-sm">Liegenschaft hinzufügen</p><p className="text-xs text-surface-600 mt-0.5">Neues Inventar anlegen</p></div>
            </button>
          </div>
        )}

        {/* Benutzer wechseln */}
        {benutzer.length > 0 && (
          <>
            <SL>Benutzer wechseln</SL>
            <Card>
              {benutzer.map((b, i) => (
                <CardRow key={b.id} onClick={() => switchUser(b.id)} className={i > 0 ? '' : ''}>
                  <Avatar initials={b.initialen} color={b.av_farbe} size="sm" active={b.id === activeUserId} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{b.name}</p>
                    <p className="text-surface-500 text-[11px]">{b.email}</p>
                  </div>
                  <RoleBadge role={b.rolle} />
                  {b.id === activeUserId && <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />}
                </CardRow>
              ))}
            </Card>
          </>
        )}
      </div>

      {/* Add Sheet */}
      <Sheet open={showAdd} onClose={() => setShowAdd(false)} title="Neue Liegenschaft" tall>
        <div className="p-5">
          <Input label="Bezeichnung" placeholder="z. B. Stollberg 39" value={name} onChange={e => setName(e.target.value)} />
          <Input label="Adresse (optional)" placeholder="z. B. Zürich, 8001" value={adresse} onChange={e => setAdresse(e.target.value)} />
          <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-widest mb-2">Symbol</p>
          <EmojiGrid options={LIE_EMOJIS} value={emoji} onChange={setEmoji} />
          <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-widest mb-2">Farbe</p>
          <ColorGrid options={LIE_COLORS} value={colorOpt.color} onChange={setColorOpt} />
          <Btn onClick={handleCreate} disabled={saving || !name.trim()}>{saving ? 'Erstelle…' : 'Liegenschaft erstellen'}</Btn>
          <Btn variant="secondary" className="mt-2" onClick={() => setShowAdd(false)}>Abbrechen</Btn>
        </div>
      </Sheet>
    </div>
  )
}
