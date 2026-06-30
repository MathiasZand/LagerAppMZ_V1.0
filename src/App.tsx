import { useState } from 'react'
import { AppProvider } from './lib/AppContext'
import { TabBar, type Tab } from './components/TabBar'
import { ToastHost } from './components/UI'
import { LiegenschaftenTab } from './pages/LiegenschaftenTab'
import { HomeTab } from './pages/HomeTab'
import { InventarTab } from './pages/InventarTab'
import { VerwaltungTab } from './pages/VerwaltungTab'

export default function App() {
  const [tab, setTab] = useState<Tab>('liegenschaften')
  const [addOpen, setAddOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)

  return (
    <AppProvider>
      <div className="fixed inset-0 bg-surface-900 flex flex-col overflow-hidden">

        {/* Tab content */}
        <div className="flex-1 overflow-hidden relative">
          <div className={tab === 'liegenschaften' ? 'block h-full' : 'hidden'}>
            <LiegenschaftenTab />
          </div>
          <div className={tab === 'home' ? 'block h-full' : 'hidden'}>
            <HomeTab
              onNav={(t) => setTab(t)}
              onAdd={() => { setTab('inventar'); setAddOpen(true) }}
              onDetail={(id) => { setTab('inventar'); setDetailId(id) }}
            />
          </div>
          <div className={tab === 'inventar' ? 'block h-full' : 'hidden'}>
            <InventarTab
              addOpen={addOpen}
              onAddClose={() => setAddOpen(false)}
              initialDetailId={detailId}
              onDetailClose={() => setDetailId(null)}
            />
          </div>
          <div className={tab === 'verwaltung' ? 'block h-full' : 'hidden'}>
            <VerwaltungTab />
          </div>
        </div>

        {/* Tab bar */}
        <TabBar active={tab} onChange={(t) => { setTab(t); setAddOpen(false) }} />

        {/* Global toast */}
        <ToastHost />
      </div>
    </AppProvider>
  )
}
