import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from './supabase'
import { DEFAULT_PERMS } from '../types'
import type {
  Liegenschaft, Benutzer, BenutzerLie, Artikel,
  Raum, Lagerplatz, Kategorie, PermKey,
} from '../types'

// ─── State shape ──────────────────────────────────────────────────────────────
interface AppCtxType {
  // Data
  liegenschaften: Liegenschaft[]
  benutzer: Benutzer[]
  artikel: Artikel[]
  raeume: Raum[]
  lagerplaetze: Lagerplatz[]
  kategorien: Kategorie[]
  perms: Record<string, Record<PermKey, boolean>>
  lieAccess: Record<string, Record<string, 'admin' | 'user' | 'guest'>>
  // Active
  activeLieId: string | null
  activeUserId: string | null
  loading: boolean
  // Derived
  activeLie: Liegenschaft | null
  activeUser: Benutzer | null
  lieArtikel: Artikel[]
  lieRaeume: Raum[]
  lieKategorien: Kategorie[]
  lieLagerplaetze: Lagerplatz[]
  // Actions
  switchLie: (id: string) => void
  switchUser: (id: string) => void
  can: (p: PermKey) => boolean
  getLieRole: (uid: string, lid: string) => 'admin' | 'user' | 'guest'
  reload: () => Promise<void>
  // CRUD
  createLiegenschaft: (d: Omit<Liegenschaft, 'id' | 'erstellt_am'>) => Promise<Liegenschaft | null>
  createRaum: (d: Omit<Raum, 'id'>) => Promise<Raum | null>
  deleteRaum: (id: string) => Promise<void>
  createLagerplatz: (d: Omit<Lagerplatz, 'id'>) => Promise<Lagerplatz | null>
  createKategorie: (d: Omit<Kategorie, 'id'>) => Promise<Kategorie | null>
  deleteKategorie: (id: string) => Promise<void>
  createArtikel: (d: Omit<Artikel, 'id' | 'erfasst_am' | 'aktualisiert_am'>) => Promise<Artikel | null>
  updateArtikel: (id: string, d: Partial<Artikel>) => Promise<void>
  deleteArtikel: (id: string) => Promise<void>
  createBenutzer: (d: Omit<Benutzer, 'id'>, lieId: string, lieRolle: 'admin' | 'user' | 'guest') => Promise<Benutzer | null>
  deleteBenutzer: (id: string) => Promise<void>
  setBenutzerRolle: (uid: string, rolle: 'admin' | 'user' | 'guest') => Promise<void>
  setLieAccess: (uid: string, lid: string, rolle: 'admin' | 'user' | 'guest') => Promise<void>
  setPerm: (rolle: string, perm: PermKey, val: boolean) => Promise<void>
}

const Ctx = createContext<AppCtxType | null>(null)
export const useApp = () => { const c = useContext(Ctx); if (!c) throw new Error('no ctx'); return c }

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [liegenschaften, setL]    = useState<Liegenschaft[]>([])
  const [benutzer, setB]          = useState<Benutzer[]>([])
  const [artikel, setA]           = useState<Artikel[]>([])
  const [raeume, setR]            = useState<Raum[]>([])
  const [lagerplaetze, setSp]     = useState<Lagerplatz[]>([])
  const [kategorien, setK]        = useState<Kategorie[]>([])
  const [perms, setPerms]         = useState<Record<string, Record<PermKey, boolean>>>(DEFAULT_PERMS)
  const [lieAccess, setLieAccess] = useState<Record<string, Record<string, 'admin' | 'user' | 'guest'>>>({})
  const [activeLieId, setActiveLieId] = useState<string | null>(null)
  const [activeUserId, setActiveUserId] = useState<string | null>(null)
  const [loading, setLoading]     = useState(true)
  const initRef = useRef(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [l, b, a, r, sp, k, p, bl] = await Promise.all([
        supabase.from('liegenschaften').select('*').order('name'),
        supabase.from('benutzer').select('*').order('name'),
        supabase.from('artikel').select('*').order('erfasst_am', { ascending: false }),
        supabase.from('raeume').select('*').order('name'),
        supabase.from('lagerplaetze').select('*').order('code'),
        supabase.from('kategorien').select('*').order('name'),
        supabase.from('rollen_berechtigungen').select('*'),
        supabase.from('benutzer_liegenschaft').select('*'),
      ])
      if (l.data)  setL(l.data)
      if (b.data)  setB(b.data)
      if (a.data)  setA(a.data)
      if (r.data)  setR(r.data)
      if (sp.data) setSp(sp.data)
      if (k.data)  setK(k.data)
      // perms
      if (p.data?.length) {
        const m = { ...DEFAULT_PERMS }
        p.data.forEach((x: { rolle: string; berechtigung: PermKey; aktiv: boolean }) => {
          if (!m[x.rolle]) m[x.rolle] = { ...DEFAULT_PERMS.guest }
          m[x.rolle][x.berechtigung] = x.aktiv
        })
        setPerms(m)
      }
      // lieAccess
      if (bl.data) {
        const m: Record<string, Record<string, 'admin' | 'user' | 'guest'>> = {}
        bl.data.forEach((x: BenutzerLie) => {
          if (!m[x.benutzer_id]) m[x.benutzer_id] = {}
          m[x.benutzer_id][x.liegenschaft_id] = x.rolle
        })
        setLieAccess(m)
      }
      if (!initRef.current) {
        if (l.data?.length)  setActiveLieId(l.data[0].id)
        if (b.data?.length)  setActiveUserId(b.data[0].id)
        initRef.current = true
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Realtime
  useEffect(() => {
    const ch = supabase.channel('rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'artikel' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'raeume' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lagerplaetze' }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [load])

  // Derived
  const activeLie  = liegenschaften.find(x => x.id === activeLieId) ?? null
  const activeUser = benutzer.find(x => x.id === activeUserId) ?? null
  const lieArtikel    = artikel.filter(x => x.liegenschaft_id === activeLieId)
  const lieRaeume     = raeume.filter(x => x.liegenschaft_id === activeLieId)
  const lieKategorien = kategorien.filter(x => x.liegenschaft_id === activeLieId)
  const lieLagerplaetze = lagerplaetze.filter(sp => lieRaeume.some(r => r.id === sp.raum_id))

  const getLieRole = (uid: string, lid: string): 'admin' | 'user' | 'guest' =>
    lieAccess[uid]?.[lid] ?? 'guest'

  const can = (p: PermKey): boolean => {
    if (!activeUser) return false
    const role = activeLieId ? getLieRole(activeUser.id, activeLieId) : activeUser.rolle
    return perms[role]?.[p] ?? false
  }

  // CRUD helpers
  const createLiegenschaft = async (d: Omit<Liegenschaft, 'id' | 'erstellt_am'>) => {
    const { data, error } = await supabase.from('liegenschaften').insert(d).select().single()
    if (error || !data) return null
    setL(prev => [...prev, data])
    if (activeUserId) {
      await supabase.from('benutzer_liegenschaft')
        .insert({ benutzer_id: activeUserId, liegenschaft_id: data.id, rolle: 'admin' })
      setLieAccess(prev => ({ ...prev, [activeUserId]: { ...(prev[activeUserId] || {}), [data.id]: 'admin' } }))
    }
    setActiveLieId(data.id)
    return data
  }

  const createRaum = async (d: Omit<Raum, 'id'>) => {
    const { data, error } = await supabase.from('raeume').insert(d).select().single()
    if (error || !data) return null
    setR(prev => [...prev, data])
    return data
  }

  const deleteRaum = async (id: string) => {
    await supabase.from('raeume').delete().eq('id', id)
    setR(prev => prev.filter(x => x.id !== id))
    setSp(prev => prev.filter(x => x.raum_id !== id))
  }

  const createLagerplatz = async (d: Omit<Lagerplatz, 'id'>) => {
    const { data, error } = await supabase.from('lagerplaetze').insert(d).select().single()
    if (error || !data) return null
    setSp(prev => [...prev, data])
    return data
  }

  const createKategorie = async (d: Omit<Kategorie, 'id'>) => {
    const { data, error } = await supabase.from('kategorien').insert(d).select().single()
    if (error || !data) return null
    setK(prev => [...prev, data])
    return data
  }

  const deleteKategorie = async (id: string) => {
    await supabase.from('kategorien').delete().eq('id', id)
    setK(prev => prev.filter(x => x.id !== id))
  }

  const createArtikel = async (d: Omit<Artikel, 'id' | 'erfasst_am' | 'aktualisiert_am'>) => {
    const { data, error } = await supabase.from('artikel').insert(d).select().single()
    if (error || !data) return null
    setA(prev => [data, ...prev])
    return data
  }

  const updateArtikel = async (id: string, d: Partial<Artikel>) => {
    await supabase.from('artikel').update({ ...d, aktualisiert_am: new Date().toISOString() }).eq('id', id)
    setA(prev => prev.map(x => x.id === id ? { ...x, ...d } : x))
  }

  const deleteArtikel = async (id: string) => {
    await supabase.from('artikel').delete().eq('id', id)
    setA(prev => prev.filter(x => x.id !== id))
  }

  const createBenutzer = async (d: Omit<Benutzer, 'id'>, lieId: string, lieRolle: 'admin' | 'user' | 'guest') => {
    const { data, error } = await supabase.from('benutzer').insert(d).select().single()
    if (error || !data) return null
    await supabase.from('benutzer_liegenschaft').insert({ benutzer_id: data.id, liegenschaft_id: lieId, rolle: lieRolle })
    setB(prev => [...prev, data])
    setLieAccess(prev => ({ ...prev, [data.id]: { [lieId]: lieRolle } }))
    return data
  }

  const deleteBenutzer = async (id: string) => {
    await supabase.from('benutzer').delete().eq('id', id)
    setB(prev => prev.filter(x => x.id !== id))
  }

  const setBenutzerRolle = async (uid: string, rolle: 'admin' | 'user' | 'guest') => {
    await supabase.from('benutzer').update({ rolle }).eq('id', uid)
    setB(prev => prev.map(x => x.id === uid ? { ...x, rolle } : x))
  }

  const setLieAccessFn = async (uid: string, lid: string, rolle: 'admin' | 'user' | 'guest') => {
    await supabase.from('benutzer_liegenschaft')
      .upsert({ benutzer_id: uid, liegenschaft_id: lid, rolle })
    setLieAccess(prev => ({ ...prev, [uid]: { ...(prev[uid] || {}), [lid]: rolle } }))
  }

  const setPerm = async (rolle: string, perm: PermKey, val: boolean) => {
    await supabase.from('rollen_berechtigungen')
      .upsert({ rolle, berechtigung: perm, aktiv: val })
    setPerms(prev => ({ ...prev, [rolle]: { ...prev[rolle], [perm]: val } }))
  }

  return (
    <Ctx.Provider value={{
      liegenschaften, benutzer, artikel, raeume, lagerplaetze, kategorien, perms, lieAccess,
      activeLieId, activeUserId, loading,
      activeLie, activeUser, lieArtikel, lieRaeume, lieKategorien, lieLagerplaetze,
      switchLie: setActiveLieId, switchUser: setActiveUserId,
      can, getLieRole, reload: load,
      createLiegenschaft, createRaum, deleteRaum, createLagerplatz,
      createKategorie, deleteKategorie,
      createArtikel, updateArtikel, deleteArtikel,
      createBenutzer, deleteBenutzer, setBenutzerRolle,
      setLieAccess: setLieAccessFn, setPerm,
    }}>
      {children}
    </Ctx.Provider>
  )
}
