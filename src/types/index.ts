// ─── DB Models ───────────────────────────────────────────────────────────────

export interface Liegenschaft {
  id: string
  name: string
  adresse: string
  emoji: string
  farbe: string
  erstellt_am?: string
}

export interface Benutzer {
  id: string
  name: string
  email: string
  rolle: 'admin' | 'user' | 'guest'
  initialen: string
  av_farbe: string
}

export interface BenutzerLie {
  benutzer_id: string
  liegenschaft_id: string
  rolle: 'admin' | 'user' | 'guest'
}

export interface Kategorie {
  id: string
  liegenschaft_id: string
  name: string
  farbe: string
  hintergrund: string
}

export interface Raum {
  id: string
  liegenschaft_id: string
  name: string
  emoji: string
  stockwerk: string
}

export interface Lagerplatz {
  id: string
  raum_id: string
  code: string
  bezeichnung: string
  regal: string
}

export interface Artikel {
  id: string
  liegenschaft_id: string
  name: string
  kategorie: string
  raum_id: string | null
  lagerplatz_id: string | null
  lagerplatz_code: string
  lagerplatz_bezeichnung: string
  bemerkung: string
  hinweise: string[]
  emoji: string
  foto_url: string | null
  erfasst_am: string
  erfasst_von: string
  aktualisiert_am?: string
}

// ─── Hints ───────────────────────────────────────────────────────────────────
export const HINTS = [
  { id: 'fire',    label: 'Brennbar',   icon: '🔥', bg: '#FAECE7', border: '#F5C4B3', text: '#7B2D00' },
  { id: 'cold',    label: 'Kühlen',     icon: '❄️', bg: '#EEF6FF', border: '#BFDBFE', text: '#1E40AF' },
  { id: 'elec',    label: 'Elektrisch', icon: '⚡', bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' },
  { id: 'toxic',   label: 'Giftig',     icon: '☠️', bg: '#ECFDF5', border: '#A7F3D0', text: '#064E3B' },
  { id: 'heavy',   label: 'Schwer',     icon: '🏋', bg: '#EDE9FE', border: '#C4B5FD', text: '#3730A3' },
  { id: 'caution', label: 'Vorsicht',   icon: '⚠️', bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' },
] as const

export type HintId = typeof HINTS[number]['id']
export const getHint = (id: string) => HINTS.find(h => h.id === id)

// ─── Permissions ──────────────────────────────────────────────────────────────
export type PermKey =
  | 'inv_view' | 'inv_create' | 'inv_edit' | 'inv_delete' | 'inv_export'
  | 'cat_view' | 'cat_create' | 'cat_edit' | 'cat_delete'
  | 'room_view' | 'room_create' | 'room_edit' | 'room_delete' | 'spot_create'
  | 'usr_view' | 'usr_invite' | 'usr_edit' | 'usr_delete' | 'role_edit'

export const PERM_GROUPS: { group: string; perms: { id: PermKey; label: string }[] }[] = [
  { group: 'Inventar', perms: [
    { id: 'inv_view', label: 'Inventar ansehen' },
    { id: 'inv_create', label: 'Artikel anlegen' },
    { id: 'inv_edit', label: 'Artikel bearbeiten' },
    { id: 'inv_delete', label: 'Artikel löschen' },
    { id: 'inv_export', label: 'Excel exportieren' },
  ]},
  { group: 'Kategorien', perms: [
    { id: 'cat_view', label: 'Kategorien ansehen' },
    { id: 'cat_create', label: 'Kategorien anlegen' },
    { id: 'cat_edit', label: 'Kategorien bearbeiten' },
    { id: 'cat_delete', label: 'Kategorien löschen' },
  ]},
  { group: 'Lagerorte', perms: [
    { id: 'room_view', label: 'Räume ansehen' },
    { id: 'room_create', label: 'Räume anlegen' },
    { id: 'room_edit', label: 'Räume bearbeiten' },
    { id: 'room_delete', label: 'Räume löschen' },
    { id: 'spot_create', label: 'Lagerplätze anlegen' },
  ]},
  { group: 'Benutzer', perms: [
    { id: 'usr_view', label: 'Benutzer ansehen' },
    { id: 'usr_invite', label: 'Benutzer einladen' },
    { id: 'usr_edit', label: 'Rollen zuweisen' },
    { id: 'usr_delete', label: 'Benutzer entfernen' },
    { id: 'role_edit', label: 'Rollen-Rechte bearbeiten' },
  ]},
]

const ALL_PERMS = PERM_GROUPS.flatMap(g => g.perms.map(p => p.id))
const makePerms = (on: PermKey[]) =>
  Object.fromEntries(ALL_PERMS.map(id => [id, on.includes(id)])) as Record<PermKey, boolean>

export const DEFAULT_PERMS: Record<string, Record<PermKey, boolean>> = {
  admin: makePerms(ALL_PERMS),
  user:  makePerms(['inv_view','inv_create','inv_edit','inv_export','cat_view','cat_create','room_view','room_create','spot_create','usr_view','usr_invite']),
  guest: makePerms(['inv_view','cat_view','room_view']),
}

// ─── Style constants ──────────────────────────────────────────────────────────
export const LIE_EMOJIS  = ['🏢','🏡','🏗️','🏭','🏪','🏬','🏠','🔑','📦','🌳']
export const ROOM_EMOJIS = ['🔧','🏠','🚗','🌿','📦','⚡','🧰','🗄️','🏭','🛠️']

export const LIE_COLORS = [
  { color: '#0284c7', bg: 'rgba(2,132,199,0.15)' },
  { color: '#059669', bg: 'rgba(5,150,105,0.15)' },
  { color: '#7c3aed', bg: 'rgba(124,58,237,0.15)' },
  { color: '#d97706', bg: 'rgba(217,119,6,0.15)'  },
  { color: '#dc2626', bg: 'rgba(220,38,38,0.15)'  },
  { color: '#0891b2', bg: 'rgba(8,145,178,0.15)'  },
  { color: '#65a30d', bg: 'rgba(101,163,13,0.15)' },
  { color: '#db2777', bg: 'rgba(219,39,119,0.15)' },
]

export const CAT_COLORS = [
  { color: '#ef4444', bg: 'rgba(239,68,68,0.15)'   },
  { color: '#0284c7', bg: 'rgba(2,132,199,0.15)'   },
  { color: '#059669', bg: 'rgba(5,150,105,0.15)'   },
  { color: '#7c3aed', bg: 'rgba(124,58,237,0.15)'  },
  { color: '#d97706', bg: 'rgba(217,119,6,0.15)'   },
  { color: '#db2777', bg: 'rgba(219,39,119,0.15)'  },
]
