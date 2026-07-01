import React, { useState } from 'react'
import { ChevronRight, Lock, Plus, Trash2, Users, Tag, Warehouse, Shield } from 'lucide-react'
import { useApp } from '../lib/AppContext'
import { PERM_GROUPS } from '../types'
import type { PermKey } from '../types'
import {
  Page, Sheet, Btn, Input, Select, SL, Card, CardRow,
  Avatar, RoleBadge, Toggle, EmojiGrid, ColorGrid, Confirm,
  Spinner, Empty, toast, CAT_COLORS, ROOM_EMOJIS,
} from '../components/UI'

// ─── Lagerorte ────────────────────────────────────────────────────────────────
function LagerorteSeite({ open, onBack }: { open: boolean; onBack: () => void }) {
  const { lieRaeume, lieLagerplaetze, lieArtikel, activeLieId, createRaum, deleteRaum, createLagerplatz } = useApp()
  const [selRaumId, setSelRaumId]         = useState<string | null>(null)
  const [showAddRoom, setShowAddRoom]     = useState(false)
  const [showAddSpot, setShowAddSpot]     = useState(false)
  const [confirmDel, setConfirmDel]       = useState<string | null>(null)
  const [rName, setRName]   = useState('')
  const [rEmoji, setREmoji] = useState('🔧')
  const [rFloor, setRFloor] = useState('EG')
  const [sCode, setSCode]   = useState('')
  const [sLabel, setSLabel] = useState('')
  const [sRegal, setSRegal] = useState('')
  const [saving, setSaving] = useState(false)

  const selectedRaum = lieRaeume.find(r => r.id === selRaumId)
  const raumSpots    = lieLagerplaetze.filter(s => s.raum_id === selRaumId)

  const handleAddRoom = async () => {
    if (!rName.trim()) { toast('Bitte einen Namen eingeben', 'err'); return }
    if (!activeLieId)  { toast('Keine Liegenschaft aktiv', 'err'); return }
    setSaving(true)
    const res = await createRaum({ liegenschaft_id: activeLieId, name: rName.trim(), emoji: rEmoji, stockwerk: rFloor })
    setSaving(false)
    if (res) {
      toast(`Raum "${res.name}" hinzugefügt`)
      setShowAddRoom(false); setRName(''); setREmoji('🔧'); setRFloor('EG')
    } else toast('Fehler beim Anlegen — Supabase-Verbindung prüfen', 'err')
  }

  const handleAddSpot = async () => {
    if (!sCode.trim())  { toast('Bitte einen Code eingeben', 'err'); return }
    if (!selRaumId)     return
    setSaving(true)
    const res = await createLagerplatz({ raum_id: selRaumId, code: sCode.trim().toUpperCase(), bezeichnung: sLabel.trim(), regal: sRegal.trim() })
    setSaving(false)
    if (res) {
      toast(`Lagerplatz "${res.code}" hinzugefügt`)
      setShowAddSpot(false); setSCode(''); setSLabel(''); setSRegal('')
    } else toast('Fehler beim Anlegen', 'err')
  }

  const handleDelRoom = async (id: string) => {
    const cnt = lieArtikel.filter(a => a.raum_id === id).length
    if (cnt > 0) { toast(`Raum hat noch ${cnt} Artikel`, 'err'); setConfirmDel(null); return }
    await deleteRaum(id)
    if (selRaumId === id) setSelRaumId(null)
    toast('Raum gelöscht'); setConfirmDel(null)
  }

  if (!open) return null

  // Raum-Detail-Ansicht
  if (selRaumId && selectedRaum) {
    return (
      <Page open title={selectedRaum.name} onBack={() => setSelRaumId(null)} backLabel="Lagerorte"
        right={<button type="button" className="text-red-400 text-sm font-medium" onClick={() => setConfirmDel(selRaumId)}>Löschen</button>}>

        <SL>Info</SL>
        <Card>
          <div className="px-4 py-3.5 flex gap-4">
            <span className="text-surface-500 text-[10px] uppercase tracking-widest font-semibold w-24 pt-0.5">Stockwerk</span>
            <span className="text-white text-sm">{selectedRaum.stockwerk}</span>
          </div>
          <div className="border-t border-surface-700/60 px-4 py-3.5 flex gap-4">
            <span className="text-surface-500 text-[10px] uppercase tracking-widest font-semibold w-24 pt-0.5">Artikel</span>
            <span className="text-white text-sm">{lieArtikel.filter(a => a.raum_id === selRaumId).length}</span>
          </div>
        </Card>

        <SL>Lagerplätze</SL>
        <Card>
          {raumSpots.length === 0 && (
            <div className="px-4 py-4 text-center text-surface-500 text-sm">Noch keine Lagerplätze</div>
          )}
          {raumSpots.map((s, i) => (
            <div key={s.id} className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? 'border-t border-surface-700/60' : ''}`}>
              <span className="font-bold text-sm px-2.5 py-1 rounded-xl bg-surface-700 text-brand-300 flex-shrink-0">{s.code}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm">{s.bezeichnung}</p>
                {s.regal && <p className="text-surface-500 text-xs">{s.regal}</p>}
              </div>
              <span className="text-surface-500 text-xs flex-shrink-0">{lieArtikel.filter(a => a.lagerplatz_id === s.id).length} Artikel</span>
            </div>
          ))}
          <button type="button" onClick={() => setShowAddSpot(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-t border-surface-700/60">
            <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0"><Plus size={15} className="text-white" /></div>
            <span className="text-brand-400 text-sm font-medium">Lagerplatz hinzufügen</span>
          </button>
        </Card>

        <Confirm open={!!confirmDel} title="Raum löschen?"
          body="Alle Lagerplätze dieses Raums werden gelöscht."
          onConfirm={() => handleDelRoom(confirmDel!)}
          onCancel={() => setConfirmDel(null)} />

        <Sheet open={showAddSpot} onClose={() => setShowAddSpot(false)} title="Neuer Lagerplatz">
          <div className="p-5">
            <Input label="Barcode-Code" placeholder="z. B. A-12" value={sCode} onChange={e => setSCode(e.target.value)} />
            <p className="text-surface-600 text-xs mb-3 -mt-2">Wird auf Etikette gedruckt und gescannt.</p>
            <Input label="Bezeichnung" placeholder="z. B. Box A-12" value={sLabel} onChange={e => setSLabel(e.target.value)} />
            <Input label="Regal (optional)" placeholder="z. B. Regal A" value={sRegal} onChange={e => setSRegal(e.target.value)} />
            <Btn onClick={handleAddSpot} disabled={saving || !sCode.trim()}>{saving ? 'Speichere…' : 'Hinzufügen'}</Btn>
            <Btn variant="secondary" className="mt-2" onClick={() => setShowAddSpot(false)}>Abbrechen</Btn>
          </div>
        </Sheet>
      </Page>
    )
  }

  // Raumliste
  return (
    <Page open title="Lagerorte" onBack={onBack}>
      <SL>Räume</SL>
      <Card>
        {lieRaeume.length === 0 && <Empty icon="🏗️" title="Keine Räume" sub="Ersten Raum anlegen" />}
        {lieRaeume.map((r, i) => {
          const cnt = lieArtikel.filter(a => a.raum_id === r.id).length
          const sc  = lieLagerplaetze.filter(s => s.raum_id === r.id).length
          return (
            <CardRow key={r.id} onClick={() => setSelRaumId(r.id)} className={i > 0 ? 'border-t border-surface-700/60' : ''}>
              <span className="text-2xl flex-shrink-0">{r.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{r.name}</p>
                <p className="text-surface-500 text-xs">{sc} Lagerplätze · {cnt} Artikel · {r.stockwerk}</p>
              </div>
              <ChevronRight size={16} className="text-surface-600 flex-shrink-0" />
            </CardRow>
          )
        })}
        <button type="button" onClick={() => setShowAddRoom(true)}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-t border-surface-700/60 last:border-0">
          <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0"><Plus size={15} className="text-white" /></div>
          <span className="text-brand-400 text-sm font-medium">Raum hinzufügen</span>
        </button>
      </Card>
      <div className="h-10" />

      <Sheet open={showAddRoom} onClose={() => setShowAddRoom(false)} title="Neuer Raum" tall>
        <div className="p-5">
          <Input label="Name" placeholder="z. B. Werkstatt" value={rName} onChange={e => setRName(e.target.value)} />
          <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-widest mb-2">Symbol</p>
          <EmojiGrid options={ROOM_EMOJIS} value={rEmoji} onChange={setREmoji} />
          <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-widest mb-2">Stockwerk</p>
          <div className="flex gap-2 mb-4">
            {['UG', 'EG', 'OG'].map(f => (
              <button key={f} type="button" onClick={() => setRFloor(f)}
                className={`flex-1 py-2.5 rounded-2xl text-sm font-semibold border transition-all ${rFloor === f ? 'border-brand-500 bg-brand-900/40 text-brand-300' : 'border-surface-700 bg-surface-900 text-surface-400'}`}>
                {f}
              </button>
            ))}
          </div>
          <Btn onClick={handleAddRoom} disabled={saving || !rName.trim()}>{saving ? 'Speichere…' : 'Hinzufügen'}</Btn>
          <Btn variant="secondary" className="mt-2" onClick={() => setShowAddRoom(false)}>Abbrechen</Btn>
        </div>
      </Sheet>
    </Page>
  )
}

// ─── Kategorien ───────────────────────────────────────────────────────────────
function KategorienSeite({ open, onBack }: { open: boolean; onBack: () => void }) {
  const { lieKategorien, lieArtikel, activeLieId, createKategorie, deleteKategorie } = useApp()
  const [showAdd, setShowAdd]   = useState(false)
  const [name, setName]         = useState('')
  const [colorOpt, setColorOpt] = useState(CAT_COLORS[0])
  const [confirmDel, setConfirmDel] = useState<string | null>(null)
  const [saving, setSaving]     = useState(false)

  const handleAdd = async () => {
    if (!name.trim()) { toast('Bitte einen Namen eingeben', 'err'); return }
    if (!activeLieId) { toast('Keine Liegenschaft aktiv', 'err'); return }
    setSaving(true)
    const res = await createKategorie({ liegenschaft_id: activeLieId, name: name.trim(), farbe: colorOpt.color, hintergrund: colorOpt.bg })
    setSaving(false)
    if (res) {
      toast(`Kategorie "${res.name}" hinzugefügt`)
      setShowAdd(false); setName(''); setColorOpt(CAT_COLORS[0])
    } else toast('Fehler beim Anlegen — Supabase-Verbindung prüfen', 'err')
  }

  const handleDel = async (id: string) => {
    const kat = lieKategorien.find(k => k.id === id)
    const cnt = kat ? lieArtikel.filter(a => a.kategorie === kat.name).length : 0
    if (cnt > 0) { toast(`Kategorie hat noch ${cnt} Artikel`, 'err'); setConfirmDel(null); return }
    await deleteKategorie(id); toast('Kategorie gelöscht'); setConfirmDel(null)
  }

  if (!open) return null
  return (
    <Page open title="Kategorien" onBack={onBack}>
      <SL>Kategorien</SL>
      <Card>
        {lieKategorien.length === 0 && <Empty icon="🏷️" title="Keine Kategorien" sub="Erste Kategorie anlegen" />}
        {lieKategorien.map((k, i) => {
          const cnt = lieArtikel.filter(a => a.kategorie === k.name).length
          return (
            <div key={k.id} className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? 'border-t border-surface-700/60' : ''}`}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: k.hintergrund, color: k.farbe }}>{k.name.slice(0,2).toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{k.name}</p>
                <p className="text-surface-500 text-xs">{cnt} Artikel</p>
              </div>
              <button type="button" onClick={() => setConfirmDel(k.id)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-surface-500 hover:text-red-400">
                <Trash2 size={15} />
              </button>
            </div>
          )
        })}
        <button type="button" onClick={() => setShowAdd(true)}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-t border-surface-700/60 last:border-0">
          <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0"><Plus size={15} className="text-white" /></div>
          <span className="text-brand-400 text-sm font-medium">Kategorie hinzufügen</span>
        </button>
      </Card>
      <div className="h-10" />

      <Confirm open={!!confirmDel} title="Kategorie löschen?" body="Die Kategorie wird entfernt."
        onConfirm={() => handleDel(confirmDel!)} onCancel={() => setConfirmDel(null)} />

      <Sheet open={showAdd} onClose={() => setShowAdd(false)} title="Neue Kategorie">
        <div className="p-5">
          <Input label="Name" placeholder="z. B. Handwerkzeug" value={name} onChange={e => setName(e.target.value)} />
          <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-widest mb-2">Farbe</p>
          <ColorGrid options={CAT_COLORS} value={colorOpt.color} onChange={setColorOpt} />
          <Btn onClick={handleAdd} disabled={saving || !name.trim()}>{saving ? 'Speichere…' : 'Hinzufügen'}</Btn>
          <Btn variant="secondary" className="mt-2" onClick={() => setShowAdd(false)}>Abbrechen</Btn>
        </div>
      </Sheet>
    </Page>
  )
}

// ─── Benutzer ─────────────────────────────────────────────────────────────────
function BenutzerSeite({ open, onBack }: { open: boolean; onBack: () => void }) {
  const { benutzer, activeLieId, liegenschaften, activeUserId, switchUser,
          perms, getLieRole, createBenutzer, deleteBenutzer, setBenutzerRolle,
          setLieAccess, setPerm } = useApp()

  const [selUid, setSelUid]           = useState<string | null>(null)
  const [showInvite, setShowInvite]   = useState(false)
  const [showRoleEd, setShowRoleEd]   = useState<string | null>(null)
  const [confirmDel, setConfirmDel]   = useState<string | null>(null)
  const [iName, setIName]             = useState('')
  const [iEmail, setIEmail]           = useState('')
  const [iRolle, setIRolle]           = useState<'admin'|'user'|'guest'>('user')
  const [iLieRolle, setILieRolle]     = useState<'admin'|'user'|'guest'>('user')
  const [saving, setSaving]           = useState(false)

  const sel = benutzer.find(b => b.id === selUid)

  const handleInvite = async () => {
    if (!iName.trim() || !iEmail.trim()) { toast('Name und E-Mail erforderlich', 'err'); return }
    if (!iEmail.includes('@'))           { toast('Ungültige E-Mail-Adresse', 'err'); return }
    if (!activeLieId)                    { toast('Keine Liegenschaft aktiv', 'err'); return }
    setSaving(true)
    const initials  = iName.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)
    const colors    = ['#0284c7','#059669','#7c3aed','#d97706','#dc2626']
    const av_farbe  = colors[benutzer.length % colors.length]
    const res = await createBenutzer(
      { name: iName.trim(), email: iEmail.trim().toLowerCase(), rolle: iRolle, initialen: initials, av_farbe },
      activeLieId, iLieRolle
    )
    setSaving(false)
    if (res) {
      toast(`${res.name} eingeladen`)
      setShowInvite(false); setIName(''); setIEmail(''); setIRolle('user'); setILieRolle('user')
    } else toast('Fehler — E-Mail evtl. bereits vorhanden', 'err')
  }

  const handleDel = async (id: string) => {
    if (id === activeUserId) { toast('Du kannst dich nicht selbst löschen', 'err'); return }
    await deleteBenutzer(id); toast('Benutzer entfernt'); setConfirmDel(null); setSelUid(null)
  }

  if (!open) return null

  // Rollen-Editor
  if (showRoleEd) {
    const roleLabel = showRoleEd === 'admin' ? 'Administrator' : showRoleEd === 'user' ? 'Benutzer' : 'Gast'
    return (
      <Page open title={roleLabel} onBack={() => setShowRoleEd(null)} backLabel="Benutzer">
        {showRoleEd === 'admin' && (
          <div className="mx-4 mt-4 p-3.5 rounded-2xl border border-orange-800/40 flex gap-2.5" style={{ background: 'rgba(124,45,18,0.2)' }}>
            <Lock size={14} className="text-orange-400 flex-shrink-0 mt-0.5" />
            <p className="text-orange-300 text-xs leading-relaxed">Gesperrte Rechte können für Administratoren nicht deaktiviert werden.</p>
          </div>
        )}
        {PERM_GROUPS.map(g => (
          <div key={g.group}>
            <SL>{g.group}</SL>
            <Card>
              {g.perms.map((p, i) => {
                const on     = perms[showRoleEd]?.[p.id] ?? false
                const locked = showRoleEd === 'admin' && ['inv_view','usr_view','role_edit'].includes(p.id)
                return (
                  <div key={p.id} className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? 'border-t border-surface-700/60' : ''}`}>
                    <div className="flex-1"><p className="text-white text-sm">{p.label}</p></div>
                    {locked
                      ? <Lock size={16} className="text-surface-600" />
                      : <Toggle on={on} onChange={v => { setPerm(showRoleEd, p.id as PermKey, v); toast('Berechtigung ' + (v ? 'aktiviert' : 'deaktiviert')) }} />
                    }
                  </div>
                )
              })}
            </Card>
          </div>
        ))}
        <div className="h-10" />
      </Page>
    )
  }

  // Benutzer-Detail
  if (selUid && sel) {
    return (
      <Page open title={sel.name} onBack={() => setSelUid(null)} backLabel="Benutzer">
        <div className="flex flex-col items-center pt-6 pb-4">
          <Avatar initials={sel.initialen} color={sel.av_farbe} size="lg" active={sel.id === activeUserId} />
          <p className="text-white font-bold text-lg mt-3">{sel.name}</p>
          <p className="text-surface-500 text-sm">{sel.email}</p>
        </div>

        <SL>Als aktiver Benutzer anmelden</SL>
        <Card>
          <CardRow onClick={() => { switchUser(sel.id); toast(`${sel.name} ist jetzt aktiv`) }}>
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(2,132,199,0.15)' }}>
              <Users size={18} className="text-brand-400" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Als aktiven Benutzer einsetzen</p>
              <p className="text-surface-500 text-xs">Wechselt den aktiven Account</p>
            </div>
          </CardRow>
        </Card>

        <SL>Globale Rolle</SL>
        <Card>
          {(['admin','user','guest'] as const).map((r, i) => (
            <CardRow key={r} onClick={() => { setBenutzerRolle(sel.id, r); toast('Rolle aktualisiert') }}
              className={i > 0 ? 'border-t border-surface-700/60' : ''}>
              <RoleBadge role={r} />
              <div className="flex-1"><p className="text-white text-sm">{r === 'admin' ? 'Administrator' : r === 'user' ? 'Benutzer' : 'Gast'}</p></div>
              {sel.rolle === r && <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-white text-[10px]">✓</div>}
            </CardRow>
          ))}
        </Card>

        <SL>Zugriffsrechte je Liegenschaft</SL>
        <Card>
          {liegenschaften.map((l, i) => {
            const cur = getLieRole(sel.id, l.id)
            return (
              <div key={l.id} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-surface-700/60' : ''}`}>
                <span className="text-lg flex-shrink-0">{l.emoji}</span>
                <p className="text-white text-sm flex-1">{l.name}</p>
                <select value={cur}
                  onChange={e => { setLieAccess(sel.id, l.id, e.target.value as 'admin'|'user'|'guest'); toast('Zugriff aktualisiert') }}
                  className="bg-surface-700 border border-surface-600 text-white rounded-xl px-2 py-1.5 text-xs focus:outline-none">
                  <option value="admin">Admin</option>
                  <option value="user">Benutzer</option>
                  <option value="guest">Gast</option>
                </select>
              </div>
            )
          })}
        </Card>

        <div className="px-4 pt-4 pb-10">
          <Btn variant="danger" onClick={() => setConfirmDel(sel.id)} disabled={sel.id === activeUserId}>
            <span className="flex items-center justify-center gap-2"><Trash2 size={15} /> Benutzer entfernen</span>
          </Btn>
        </div>

        <Confirm open={!!confirmDel} title="Benutzer entfernen?"
          body={`"${sel.name}" wird unwiderruflich entfernt.`}
          onConfirm={() => handleDel(confirmDel!)} onCancel={() => setConfirmDel(null)} />
      </Page>
    )
  }

  // Benutzerliste
  return (
    <Page open title="Benutzer" onBack={onBack}
      right={<button type="button" onClick={() => setShowInvite(true)} className="text-brand-400 text-sm font-semibold flex items-center gap-1"><Plus size={16} />Einladen</button>}>

      <SL>Rollen verwalten</SL>
      <Card>
        {(['admin','user','guest'] as const).map((r, i) => (
          <CardRow key={r} onClick={() => setShowRoleEd(r)} className={i > 0 ? 'border-t border-surface-700/60' : ''}>
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: r==='admin'?'rgba(220,38,38,0.15)':r==='user'?'rgba(2,132,199,0.15)':'rgba(100,116,139,0.2)' }}>
              <Shield size={18} className={r==='admin'?'text-red-400':r==='user'?'text-brand-400':'text-surface-400'} />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">{r==='admin'?'Administrator':r==='user'?'Benutzer':'Gast'}</p>
              <p className="text-surface-500 text-xs">{benutzer.filter(b => b.rolle === r).length} Benutzer</p>
            </div>
            <RoleBadge role={r} />
            <ChevronRight size={16} className="text-surface-600" />
          </CardRow>
        ))}
      </Card>

      <SL>Alle Benutzer</SL>
      <Card>
        {benutzer.map((b, i) => {
          const lieRole = activeLieId ? getLieRole(b.id, activeLieId) : b.rolle
          return (
            <CardRow key={b.id} onClick={() => setSelUid(b.id)} className={i > 0 ? 'border-t border-surface-700/60' : ''}>
              <Avatar initials={b.initialen} color={b.av_farbe} size="sm" active={b.id === activeUserId} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{b.name}</p>
                <p className="text-surface-500 text-xs truncate">{b.email}</p>
              </div>
              <RoleBadge role={lieRole} />
              <ChevronRight size={15} className="text-surface-600 flex-shrink-0" />
            </CardRow>
          )
        })}
        <button type="button" onClick={() => setShowInvite(true)}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-t border-surface-700/60">
          <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0"><Plus size={15} className="text-white" /></div>
          <span className="text-brand-400 text-sm font-medium">Benutzer einladen</span>
        </button>
      </Card>
      <div className="h-10" />

      <Sheet open={showInvite} onClose={() => setShowInvite(false)} title="Benutzer einladen" tall>
        <div className="p-5">
          <Input label="Name" placeholder="Vor- und Nachname" value={iName} onChange={e => setIName(e.target.value)} />
          <Input label="E-Mail" placeholder="name@beispiel.ch" type="email" value={iEmail} onChange={e => setIEmail(e.target.value)} />
          <Select label="Globale Rolle" value={iRolle} onChange={e => setIRolle(e.target.value as 'admin'|'user'|'guest')}>
            <option value="user">Benutzer</option>
            <option value="admin">Administrator</option>
            <option value="guest">Gast</option>
          </Select>
          <Select label="Recht in dieser Liegenschaft" value={iLieRolle} onChange={e => setILieRolle(e.target.value as 'admin'|'user'|'guest')}>
            <option value="user">Benutzer</option>
            <option value="admin">Administrator</option>
            <option value="guest">Gast</option>
          </Select>
          <div className="bg-brand-900/30 border border-brand-800/40 rounded-2xl p-3.5 mb-4 text-brand-300 text-xs leading-relaxed">
            Die Person kann sich danach mit dieser E-Mail-Adresse in der App anmelden.
          </div>
          <Btn onClick={handleInvite} disabled={saving || !iName.trim() || !iEmail.trim()}>
            {saving ? 'Speichere…' : 'Benutzer hinzufügen'}
          </Btn>
          <Btn variant="secondary" className="mt-2" onClick={() => setShowInvite(false)}>Abbrechen</Btn>
        </div>
      </Sheet>
    </Page>
  )
}

// ─── Main VerwaltungTab ───────────────────────────────────────────────────────
export function VerwaltungTab() {
  const { activeLie, lieRaeume, lieArtikel, lieKategorien, benutzer, loading } = useApp()
  const [page, setPage] = useState<'main'|'lagerorte'|'kategorien'|'benutzer'>('main')

  if (loading) return <Spinner />

  return (
    <>
      <div className="flex flex-col min-h-full page-header">
        <div className="bg-surface-900/95 backdrop-blur border-b border-surface-800 px-5 pt-4 pb-4 flex-shrink-0">
          <h1 className="text-[26px] font-bold text-white">Verwaltung</h1>
          {activeLie && <p className="text-brand-400 text-sm mt-0.5">{activeLie.name}</p>}
        </div>

        <div className="flex-1 scroll-area pb-tabbar">
          <SL>Liegenschaft einrichten</SL>
          <Card>
            <CardRow onClick={() => setPage('lagerorte')}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(5,150,105,0.15)' }}>
                <Warehouse size={20} className="text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">Lagerorte</p>
                <p className="text-surface-500 text-xs">{lieRaeume.length} Räume · {lieArtikel.length} Artikel</p>
              </div>
              <ChevronRight size={16} className="text-surface-600" />
            </CardRow>
            <CardRow onClick={() => setPage('kategorien')} className="border-t border-surface-700/60">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(217,119,6,0.15)' }}>
                <Tag size={20} className="text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">Kategorien</p>
                <p className="text-surface-500 text-xs">{lieKategorien.length} Kategorien</p>
              </div>
              <ChevronRight size={16} className="text-surface-600" />
            </CardRow>
            <CardRow onClick={() => setPage('benutzer')} className="border-t border-surface-700/60">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(124,58,237,0.15)' }}>
                <Users size={20} className="text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">Benutzer &amp; Rollen</p>
                <p className="text-surface-500 text-xs">{benutzer.length} Benutzer</p>
              </div>
              <ChevronRight size={16} className="text-surface-600" />
            </CardRow>
          </Card>

          <SL>Export</SL>
          <Card>
            <CardRow onClick={() => toast('Excel-Export wird vorbereitet…', 'info')}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(5,150,105,0.15)' }}>
                <span className="text-xl">📊</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">Excel exportieren</p>
                <p className="text-surface-500 text-xs">Alle {lieArtikel.length} Artikel als .xlsx</p>
              </div>
              <ChevronRight size={16} className="text-surface-600" />
            </CardRow>
          </Card>
        </div>
      </div>

      <LagerorteSeite  open={page === 'lagerorte'}  onBack={() => setPage('main')} />
      <KategorienSeite open={page === 'kategorien'} onBack={() => setPage('main')} />
      <BenutzerSeite   open={page === 'benutzer'}   onBack={() => setPage('main')} />
    </>
  )
}
