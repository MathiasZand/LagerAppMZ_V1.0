# LagerApp — PWA Lagerverwaltung

Professionelle Lagerverwaltung für mehrere Liegenschaften. React + Vite + Tailwind CSS + Supabase.

## Features

- **Mehrere Liegenschaften** — eigenes Inventar pro Liegenschaft
- **Benutzer & Rollen** — Admin / Benutzer / Gast, Rechte je Liegenschaft
- **Inventar** — Artikel erfassen, bearbeiten, suchen, filtern
- **Lagerorte** — Räume & Lagerplätze verwalten
- **Kategorien** — eigene Kategorien pro Liegenschaft
- **Lagercode scannen** — Fach-Inhalt per Barcode-Code anzeigen
- **Lagerplatz ermitteln** — KI-Kamera erkennt Artikel automatisch
- **Sicherheitshinweise** — Brennbar, Elektrisch, Giftig, etc.
- **Excel-Export** — Inventarliste als .xlsx
- **PWA** — Vollbild-App auf iPhone & Android, offline-fähig

## Setup

### 1. Supabase Datenbank

SQL-Schema im Supabase SQL Editor ausführen (aus `src/lib/supabase.ts` kopieren):

```sql
-- Vollständiges Schema im Kommentar in src/lib/supabase.ts
```

### 2. Installation

```bash
npm install
npm run dev
```

### 3. Build & Deploy

```bash
npm run build
# Ordner "dist/" auf beliebigen Static-Hoster deployen
# z. B. Vercel, Netlify, Cloudflare Pages
```

## PWA auf iPhone installieren

1. App in Safari öffnen
2. Teilen-Button → "Zum Home-Bildschirm"
3. App startet im Vollbild ohne Browser-UI

## PWA auf Android installieren

1. App in Chrome öffnen
2. Menü → "App installieren" oder Banner antippen

## Projekt-Struktur

```
src/
  lib/
    supabase.ts       # Supabase Client + SQL Schema
    AppContext.tsx    # Globaler State (Supabase CRUD + Realtime)
  types/
    index.ts          # TypeScript Types, Hints, Permissions
  components/
    UI.tsx            # Sheet, Page, Toggle, Toast, Avatar, ...
    TabBar.tsx        # 4-Tab Navigation
  pages/
    LiegenschaftenTab.tsx  # Liegenschafts-Auswahl & -Verwaltung
    HomeTab.tsx            # Dashboard + KI-Lagerplatz-Erkennung
    InventarTab.tsx        # Inventarliste + Scan + Detail + Add/Edit
    VerwaltungTab.tsx      # Lagerorte, Kategorien, Benutzer, Rollen
  App.tsx             # Root mit Tab-Routing
  main.tsx            # Entry point
  index.css           # Tailwind + iOS safe-area utilities
```

## Supabase Tabellen

| Tabelle | Beschreibung |
|---------|-------------|
| `liegenschaften` | Immobilien / Inventare |
| `benutzer` | Benutzerkonten |
| `benutzer_liegenschaft` | Zugriffsrechte je Liegenschaft |
| `raeume` | Räume pro Liegenschaft |
| `lagerplaetze` | Lagerplätze / Fächer pro Raum |
| `kategorien` | Kategorien pro Liegenschaft |
| `artikel` | Inventarartikel |
| `rollen_berechtigungen` | Rechte-Matrix (Admin/User/Gast) |

## Technologie

- **React 18** + **TypeScript**
- **Vite 6** mit `vite-plugin-pwa`
- **Tailwind CSS 3** (dunkles Design)
- **@supabase/supabase-js** (Realtime-Sync)
- **Workbox** (Service Worker, Offline-Cache)
- **lucide-react** (Icons)
