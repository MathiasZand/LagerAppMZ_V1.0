import React, { useState, useMemo, useCallback } from 'react'
import { Plus, ScanLine, ChevronRight, ZoomIn, Pencil, Trash2, X, Mic } from 'lucide-react'
import { useApp } from '../lib/AppContext'
import {
import type { Artikel } from '../types'
  Page, Sheet, Btn, Input, Textarea, Select, SearchBar,
  SL, Card, CardRow, HintIcons, HintBadges, HintChips,
  Confirm, Spinner, Empty, toast, Avatar,
} from '../components/UI'

// ── AddArtikelSheet ──────────────────────────────────────────────────────────
function AddSheet({ open, onClose, edit }: { open: boolean; onClose: () => void; edit?: Artikel | null }) {
  const { lieKategorien, lieRaeume, lieLagerplaetze, activeLieId, activeUser, createArtikel, updateArtikel } = useApp()
  const isEdit = !!edit

  const [step, setStep] = useState(1)
  const [name, setName] = useState(edit?.name ?? '')
  const [kat, setKat] = useState(edit?.kategorie ?? '')
  const [raumId, setRaumId] = useState(edit?.raum_id ?? '')
  const [spotId, setSpotId] = useState(edit?.lagerplatz_id ?? '')
  const [bem, setBem] = useState(edit?.bemerkung ?? '')
  const [hints, setHints] = useState<string[]>(edit?.hinweise ?? [])
  const [emoji, setEmoji] = useState(edit?.emoji ?? '📦')
  const [photo, setPhoto] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  const STEPS = isEdit
    ? ['Name', 'Kategorie', 'Bemerkung', 'Hinweise', 'Lagerort']
    : ['Foto', 'Name', 'Kategorie', 'Bemerkung', 'Hinweise', 'Lagerort']
  const total = STEPS.length
  const stepName = STEPS[step - 1]

  const raumSpots = lieLagerplaetze.filter(s => s.raum_id === raumId)

  const EMOJIS = ['📦','🔨','🪛','⚙️','🔌','🌿','⛑️','🔧','🪚','🧰','🔩','💡','🗂️','📏','🪣']

  const canNext = () => {
    if (stepName === 'Foto') return photo
    if (stepName === 'Name') return name.trim().length > 0
    if (stepName === 'Lagerort') return !!raumId && !!spotId
    return true
  }

  const reset = () => { setStep(1); setName(''); setKat(''); setRaumId(''); setSpotId(''); setBem(''); setHints([]); setEmoji('📦'); setPhoto(false) }

  const handleSave = useCallback(async () => {
    if (!name.trim() || !raumId || !spotId) { toast('Bitte alle Pflichtfelder ausfüllen', 'err'); return }
    setSaving(true)
    const spot = lieLagerplaetze.find(s => s.id === spotId)
    const payload = {
      name: name.trim(), kategorie: kat, raum_id: raumId,
      lagerplatz_id: spotId, lagerplatz_code: spot?.code ?? '',
      lagerplatz_bezeichnung: spot?.bezeichnung ?? '',
      bemerkung: bem, hinweise: hints, emoji, foto_url: null,
      liegenschaft_id: activeLieId ?? '', erfasst_von: activeUser?.name ?? '',
    }
    if (isEdit && edit) {
      await updateArtikel(edit.id, payload)
      toast('Artikel aktualisiert')
    } else {
      await createArtikel(payload)
      toast('Artikel gespeichert')
    }
    setSaving(false); onClose(); if (!isEdit) reset()
  }, [name, kat, raumId, spotId, bem, hints, emoji, activeLieId, activeUser, edit, isEdit, lieLagerplaetze, createArtikel, updateArtikel, onClose])

  const handleNext = () => { if (step < total) setStep(s => s + 1); else handleSave() }

  if (!open) return null

  return (
    <Sheet open={open} onClose={() => { onClose(); if (!isEdit) reset() }} title={isEdit ? 'Artikel bearbeiten' : 'Artikel erfassen'} tall>
      {/* Progress dots */}
      {!isEdit && (
        <div className="flex justify-center gap-2 py-3 px-5 border-b border-surface-700">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i+1===step ? 'w-6 bg-brand-400' : i+1<step ? 'w-1.5 bg-green-500' : 'w-1.5 bg-surface-700'}`} />
          ))}
        </div>
      )}

      <div className="p-5 flex flex-col gap-2">
        {/* FOTO */}
        {stepName === 'Foto' && (
          <>
            <button type="button" onClick={() => setPhoto(true)}
              className={`w-full h-48 rounded-3xl flex flex-col items-center justify-center gap-3 border-2 transition-all ${photo ? 'border-green-600 bg-surface-900' : 'border-dashed border-surface-600 bg-surface-900'}`}>
              {photo ? <><span className="text-6xl">{emoji}</span><p className="text-green-400 text-sm font-semibold">Foto aufgenommen ✓</p></> : <><span className="text-5xl opacity-20">📷</span><p className="text-surface-500 text-sm">Tippen zum Fotografieren</p></>}
            </button>
            {photo && (
              <div className="mt-2">
                <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-widest mb-2">Symbol</p>
                <div className="flex flex-wrap gap-2">{EMOJIS.map(e => <button key={e} type="button" onClick={() => setEmoji(e)} className={`w-11 h-11 rounded-2xl text-xl flex items-center justify-center border transition-all ${emoji===e ? 'border-brand-500 bg-brand-900/40' : 'border-surface-700 bg-surface-900'}`}>{e}</button>)}</div>
              </div>
            )}
          </>
        )}

        {/* NAME */}
        {stepName === 'Name' && (
          <>
            <Input label="Bezeichnung" placeholder="z. B. Hammer" value={name} onChange={e => setName(e.target.value)} />
            <p className="text-surface-600 text-xs">Tipp: Mikrofon-Taste auf der iPhone-Tastatur für Spracheingabe.</p>
          </>
        )}

        {/* KATEGORIE */}
        {stepName === 'Kategorie' && (
          <div>
            <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-widest mb-3">Kategorie</p>
            {lieKategorien.length === 0
              ? <p className="text-surface-500 text-sm text-center py-8">Keine Kategorien — bitte zuerst in Verwaltung anlegen.</p>
              : <div className="flex flex-col gap-2">{lieKategorien.map(k => (
                  <button key={k.id} type="button" onClick={() => setKat(k.name)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${kat===k.name ? 'border-brand-500 bg-brand-900/30' : 'border-surface-700 bg-surface-900'}`}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: k.hintergrund, color: k.farbe }}>{k.name.slice(0,2).toUpperCase()}</div>
                    <span className="text-white font-medium text-sm">{k.name}</span>
                    {kat===k.name && <div className="ml-auto w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-white text-[10px]">✓</div>}
                  </button>
                ))}</div>
            }
          </div>
        )}

        {/* BEMERKUNG */}
        {stepName === 'Bemerkung' && <Textarea label="Bemerkung (optional)" placeholder="z. B. Schutzbrille tragen, Ablauf 12/2026…" value={bem} onChange={e => setBem(e.target.value)} rows={4} />}

        {/* HINWEISE */}
        {stepName === 'Hinweise' && (
          <div>
            <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-widest mb-3">Sicherheitshinweise (optional)</p>
            <HintChips value={hints} onChange={setHints} />
          </div>
        )}

        {/* LAGERORT */}
        {stepName === 'Lagerort' && (
          <div>
            <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-widest mb-3">Raum</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {lieRaeume.map(r => (
                <button key={r.id} type="button" onClick={() => { setRaumId(r.id); setSpotId('') }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-2xl border text-sm font-semibold transition-all ${raumId===r.id ? 'border-brand-500 bg-brand-900/40 text-brand-300' : 'border-surface-700 bg-surface-900 text-surface-300'}`}>
                  {r.emoji} {r.name}
                </button>
              ))}
            </div>
            {raumId && raumSpots.length > 0 && (
              <>
                <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-widest mb-3">Lagerplatz</p>
                <div className="bg-surface-900 rounded-2xl border border-surface-700 overflow-hidden">
                  {raumSpots.map((s, i) => (
                    <button key={s.id} type="button" onClick={() => setSpotId(s.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left ${i>0?'border-t border-surface-800':''} ${spotId===s.id?'bg-brand-900/20':''}`}>
                      <span className={`font-bold text-sm px-2.5 py-1 rounded-xl ${spotId===s.id ? 'bg-brand-600 text-white' : 'bg-surface-800 text-brand-300'}`}>{s.code}</span>
                      <span className="text-white text-sm">{s.bezeichnung}</span>
                      {spotId===s.id && <div className="ml-auto w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-white text-[10px]">✓</div>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="p-5 pt-0 flex gap-3">
        {step > 1 && !isEdit && <Btn variant="secondary" className="flex-1" onClick={() => setStep(s => s-1)}>Zurück</Btn>}
        <Btn className="flex-1" onClick={handleNext} disabled={!canNext() || saving}>
          {step === total ? (saving ? 'Speichern…' : 'Speichern ✓') : 'Weiter'}
        </Btn>
      </div>
    </Sheet>
  )
}

// ── ScanSheet ────────────────────────────────────────────────────────────────
function ScanSheet({ open, onClose, onDetail }: { open: boolean; onClose: () => void; onDetail: (id: string) => void }) {
  const { lieArtikel } = useApp()
  const [code, setCode] = useState('')
  const results = useMemo(() => {
    const q = code.trim().toUpperCase()
    return q ? lieArtikel.filter(a => a.lagerplatz_code.toUpperCase() === q) : []
  }, [code, lieArtikel])
  const demos = [...new Set(lieArtikel.map(a => a.lagerplatz_code))].slice(0, 3)

  return (
    <Sheet open={open} onClose={onClose} title="Lagercode scannen" tall>
      {/* Scan animation */}
      <div className="mx-4 mt-2 h-36 rounded-3xl overflow-hidden relative flex items-center justify-center" style={{ background: '#030810' }}>
        <div className="scan-line" />
        {[[12,12,'tl'],[12,'auto','tr'],['auto',12,'bl'],['auto','auto','br']].map(([t,b,n]) => (
          <div key={String(n)} className="absolute w-5 h-5 border-brand-400"
            style={{ top: t===12?12:undefined, bottom: typeof b==='number'?b:undefined, left: n==='tl'||n==='bl'?16:undefined, right: n==='tr'||n==='br'?16:undefined,
              borderTopWidth: n==='tl'||n==='tr'?2:0, borderBottomWidth: n==='bl'||n==='br'?2:0,
              borderLeftWidth: n==='tl'||n==='bl'?2:0, borderRightWidth: n==='tr'||n==='br'?2:0,
              borderTopLeftRadius: n==='tl'?4:0, borderTopRightRadius: n==='tr'?4:0,
              borderBottomLeftRadius: n==='bl'?4:0, borderBottomRightRadius: n==='br'?4:0 }} />
        ))}
        <p className="absolute bottom-2.5 left-0 right-0 text-center text-surface-500 text-xs">Barcode auf Lagerfach richten</p>
      </div>

      <div className="p-4">
        <div className="flex gap-2 mb-3">
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="Code eingeben…"
            className="flex-1 bg-surface-900 border border-surface-700 text-white rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 placeholder:text-surface-600 uppercase" />
        </div>
        {demos.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            <span className="text-xs text-surface-600 self-center">Demo:</span>
            {demos.map(c => <button key={c} type="button" onClick={() => setCode(c)}
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-brand-900/50 text-brand-300 border border-brand-800/70 flex items-center gap-1">
              <ScanLine size={11} /> {c}</button>)}
          </div>
        )}
        {code && results.length === 0 && <p className="text-center text-surface-500 text-sm py-6">Kein Fach für Code „{code.toUpperCase()}" gefunden.</p>}
        {results.length > 0 && (
          <div className="bg-surface-900 rounded-2xl border border-surface-700 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-surface-700 flex items-center gap-2">
              <span className="text-brand-300 font-bold text-sm px-2.5 py-1 bg-brand-900/50 rounded-full border border-brand-800/70">{code.toUpperCase()}</span>
              <span className="text-surface-400 text-xs">{results.length} Artikel</span>
            </div>
            {results.map((a, i) => (
              <button key={a.id} type="button" onClick={() => { onDetail(a.id); onClose() }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left active:bg-surface-800/50 ${i>0?'border-t border-surface-800':''}`}>
                <span className="text-2xl">{a.emoji}</span>
                <div className="flex-1 min-w-0"><p className="text-white text-sm font-medium truncate">{a.name}</p><p className="text-surface-500 text-xs">{a.kategorie}</p></div>
                {a.hinweise?.length > 0 && <HintIcons hints={a.hinweise} />}
                <ChevronRight size={15} className="text-surface-600 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </Sheet>
  )
}

// ── Detail Page ──────────────────────────────────────────────────────────────
function DetailPage({ open, onBack, id, onEdit, onDeleted }: {
  open: boolean; onBack: () => void; id: string | null;
  onEdit: (a: Artikel) => void; onDeleted: () => void
}) {
  const { lieArtikel, lieRaeume, deleteArtikel } = useApp()
  const [zoom, setZoom] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const a = lieArtikel.find(x => x.id === id)
  const raum = lieRaeume.find(r => r.id === a?.raum_id)

  if (!open || !a) return null

  return (
    <Page open title={a.name} onBack={onBack} backLabel="Inventar"
      right={<button type="button" onClick={() => onEdit(a)} className="text-brand-400 text-sm font-semibold">Bearbeiten</button>}>
      {/* Photo */}
      <div onClick={() => setZoom(true)} className="relative mx-4 mt-4 h-52 bg-surface-800 rounded-3xl flex items-center justify-center border border-surface-700 cursor-pointer">
        <span className="text-8xl">{a.emoji}</span>
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/50 text-white text-xs px-2.5 py-1.5 rounded-full">
          <ZoomIn size={12} /> Zoomen
        </div>
      </div>
      {zoom && (
        <div className="fixed inset-0 z-50 bg-black/96 flex flex-col items-center justify-center" onClick={() => setZoom(false)}>
          <span className="text-[120px] select-none">{a.emoji}</span>
          <p className="text-white/30 text-xs mt-6">Tippen zum Schliessen</p>
        </div>
      )}

      <div className="px-5 pt-4">
        <h1 className="text-[22px] font-bold text-white">{a.name}</h1>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {a.kategorie && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-700 text-surface-300">{a.kategorie}</span>}
          {a.hinweise?.length > 0 && <HintBadges hints={a.hinweise} />}
        </div>
      </div>

      {a.hinweise?.length > 0 && (
        <div className="mx-4 mt-3 p-3.5 rounded-2xl border border-orange-900/40" style={{ background: 'rgba(124,45,18,0.15)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2 text-orange-300">Sicherheitshinweise</p>
          <HintBadges hints={a.hinweise} />
        </div>
      )}

      <div className="mx-4 mt-4 bg-surface-800 rounded-3xl border border-surface-700 overflow-hidden">
        {[
          { l: 'Raum', v: raum ? `${raum.emoji} ${raum.name}` : '—' },
          { l: 'Lagerplatz', v: `${a.lagerplatz_bezeichnung} (${a.lagerplatz_code})`, hi: true },
          { l: 'Kategorie', v: a.kategorie || '—' },
          { l: 'Bemerkung', v: a.bemerkung || '—', warn: !!a.bemerkung },
          { l: 'Erfasst am', v: new Date(a.erfasst_am).toLocaleDateString('de-CH') },
          { l: 'Gescannt von', v: a.erfasst_von || '—' },
        ].map(({ l, v, hi, warn }, i) => (
          <div key={l} className={`flex gap-4 px-4 py-3.5 ${i>0?'border-t border-surface-700/60':''}`}>
            <span className="text-surface-500 text-[10px] uppercase tracking-widest font-semibold w-24 flex-shrink-0 pt-0.5">{l}</span>
            <span className={`text-sm font-medium flex-1 ${hi ? 'text-brand-400' : warn ? 'text-amber-400' : 'text-white'}`}>{v}</span>
          </div>
        ))}
      </div>

      <div className="px-4 pt-4 pb-10 flex gap-3">
        <Btn variant="secondary" className="flex-1" onClick={() => onEdit(a)}>
          <span className="flex items-center justify-center gap-2"><Pencil size={15} /> Bearbeiten</span>
        </Btn>
        <Btn variant="danger" className="flex-1" onClick={() => setConfirmDel(true)}>
          <span className="flex items-center justify-center gap-2"><Trash2 size={15} /> Löschen</span>
        </Btn>
      </div>

      <Confirm open={confirmDel} title="Artikel löschen?"
        body={`"${a.name}" wird unwiderruflich gelöscht.`}
        onConfirm={async () => { await deleteArtikel(a.id); setConfirmDel(false); onDeleted(); toast('Artikel gelöscht') }}
        onCancel={() => setConfirmDel(false)} />
    </Page>
  )
}

// ── Main InventarTab ──────────────────────────────────────────────────────────
export function InventarTab({ addOpen, onAddClose, initialDetailId, onDetailClose }: {
  addOpen: boolean; onAddClose: () => void
  initialDetailId?: string | null; onDetailClose?: () => void
}) {
  const { lieArtikel, lieKategorien, can, loading } = useApp()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('Alle')
  const [detailId, setDetailId] = useState<string | null>(initialDetailId ?? null)

  React.useEffect(() => {
    if (initialDetailId) setDetailId(initialDetailId)
  }, [initialDetailId])
  const [editItem, setEditItem] = useState<Artikel | null>(null)
  const [showScan, setShowScan] = useState(false)
  const [showLocalAdd, setShowLocalAdd] = useState(false)

  const filtered = useMemo(() => {
    const sq = q.toLowerCase()
    return lieArtikel.filter(a =>
      (cat === 'Alle' || a.kategorie === cat) &&
      (!sq || a.name.toLowerCase().includes(sq) || a.kategorie?.toLowerCase().includes(sq) || a.lagerplatz_code.toLowerCase().includes(sq))
    )
  }, [lieArtikel, q, cat])

  const grouped = useMemo(() => {
    const g: Record<string, typeof filtered> = {}
    filtered.forEach(a => { const k = a.kategorie || 'Sonstige'; if (!g[k]) g[k] = []; g[k].push(a) })
    return g
  }, [filtered])

  if (loading) return <Spinner />

  return (
    <div className="flex flex-col min-h-full" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="bg-surface-900/95 backdrop-blur border-b border-surface-800 flex-shrink-0">
        <div className="flex items-center gap-2 px-4 py-3">
          <h1 className="text-xl font-bold text-white flex-1">Inventar</h1>
          <button type="button" onClick={() => setShowScan(true)} className="w-9 h-9 rounded-2xl bg-surface-800 border border-surface-700 flex items-center justify-center">
            <ScanLine size={17} className="text-brand-400" />
          </button>
          {can('inv_create') && (
            <button type="button" onClick={() => setShowLocalAdd(true)} className="w-9 h-9 rounded-2xl bg-brand-600 flex items-center justify-center">
              <Plus size={18} className="text-white" />
            </button>
          )}
        </div>
        <SearchBar value={q} onChange={setQ} placeholder="Name, Kategorie oder Code…" />
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          {['Alle', ...lieKategorien.map(k => k.name)].map(c => (
            <button key={c} type="button" onClick={() => setCat(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${cat===c ? 'bg-brand-600 text-white border-brand-600' : 'bg-surface-800 text-surface-400 border-surface-700'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 px-5 py-3 border-b border-surface-800 flex-shrink-0">
        {[
          { v: filtered.length, l: 'Artikel' },
          { v: filtered.filter(a => a.hinweise?.length > 0).length, l: 'Mit Hinweis' },
          { v: new Set(filtered.map(a => a.lagerplatz_code)).size, l: 'Fächer' },
        ].map((s, i) => (
          <React.Fragment key={s.l}>
            {i > 0 && <div className="w-px bg-surface-800" />}
            <div className="flex-1 text-center">
              <p className="text-lg font-bold text-white">{s.v}</p>
              <p className="text-[10px] text-surface-500">{s.l}</p>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="flex-1 scroll-area pb-28">
        {filtered.length === 0
          ? <Empty icon="📦" title="Keine Artikel" sub={q ? 'Suchbegriff anpassen' : 'Ersten Artikel erfassen'} />
          : Object.entries(grouped).map(([grp, items]) => (
            <div key={grp}>
              <SL>{grp}</SL>
              <div className="mx-4 bg-surface-800 rounded-3xl border border-surface-700 overflow-hidden mb-1">
                {items.map((a, i) => (
                  <button key={a.id} type="button" onClick={() => setDetailId(a.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-surface-700/50 ${i>0?'border-t border-surface-700/60':''}`}>
                    <span className="text-2xl flex-shrink-0 w-9 text-center">{a.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{a.name}</p>
                      <p className="text-surface-500 text-xs truncate">{a.lagerplatz_bezeichnung || a.lagerplatz_code}</p>
                    </div>
                    {a.hinweise?.length > 0 && <HintIcons hints={a.hinweise} />}
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-brand-900/50 text-brand-300 border border-brand-800/70 flex-shrink-0">{a.lagerplatz_code}</span>
                    <ChevronRight size={15} className="text-surface-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ))
        }

        {can('inv_export') && filtered.length > 0 && (
          <button type="button" onClick={() => toast('Excel-Export wird vorbereitet…', 'info')}
            className="mx-4 mt-2 mb-4 w-[calc(100%-32px)] flex items-center gap-3 p-4 rounded-3xl border border-green-800/40"
            style={{ background: 'rgba(5,46,22,0.3)' }}>
            <span className="text-2xl">📊</span>
            <div className="flex-1 text-left">
              <p className="text-green-300 font-semibold text-sm">Als Excel exportieren</p>
              <p className="text-green-700 text-xs">{filtered.length} Artikel · 3 Sheets</p>
            </div>
            <ChevronRight size={15} className="text-green-700" />
          </button>
        )}
      </div>

      {/* Sheets */}
      <AddSheet open={addOpen || showLocalAdd} onClose={() => { onAddClose(); setShowLocalAdd(false) }} />
      <AddSheet open={!!editItem} onClose={() => setEditItem(null)} edit={editItem} />
      <ScanSheet open={showScan} onClose={() => setShowScan(false)} onDetail={id => { setDetailId(id); setShowScan(false) }} />
      <DetailPage open={!!detailId} onBack={() => { setDetailId(null); onDetailClose?.() }} id={detailId}
        onEdit={a => { setDetailId(null); setEditItem(a) }}
        onDeleted={() => { setDetailId(null); onDetailClose?.() }} />
    </div>
  )
}
