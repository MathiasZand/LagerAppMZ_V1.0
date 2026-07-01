import React, { useState, useEffect } from 'react'
import { AppProvider } from './lib/AppContext'
import { TabBar, type Tab } from './components/TabBar'
import { ToastHost } from './components/UI'
import { LoginPage } from './pages/LoginPage'
import { LiegenschaftenTab } from './pages/LiegenschaftenTab'
import { HomeTab } from './pages/HomeTab'
import { InventarTab } from './pages/InventarTab'
import { VerwaltungTab } from './pages/VerwaltungTab'

function AppInner({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab]         = useState<Tab>('liegenschaften')
  const [addOpen, setAddOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)

  return (
    <div className="fixed inset-0 bg-surface-900 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-hidden relative">
        <div className={tab === 'liegenschaften' ? 'block h-full' : 'hidden'}>
          <LiegenschaftenTab />
        </div>
        <div className={tab === 'home' ? 'block h-full' : 'hidden'}>
          <HomeTab
            onNav={t => setTab(t)}
            onAdd={() => { setTab('inventar'); setAddOpen(true) }}
            onDetail={id => { setTab('inventar'); setDetailId(id) }}
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
      <TabBar active={tab} onChange={t => { setTab(t); setAddOpen(false) }} />
      <ToastHost />
    </div>
  )
}

export default function App() {
  const [status, setStatus] = useState<'checking' | 'login' | 'app'>('checking')

  useEffect(() => {
    const id = localStorage.getItem('lagerapp_user_id')
    setStatus(id ? 'app' : 'login')
  }, [])

  const handleLogin = () => setStatus('app')
  const handleLogout = () => setStatus('login')

  if (status === 'checking') {
    return (
      <div className="fixed inset-0 bg-surface-900 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (status === 'login') {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <AppProvider onLogout={handleLogout}>
      <AppInner onLogout={handleLogout} />
    </AppProvider>
  )
}
