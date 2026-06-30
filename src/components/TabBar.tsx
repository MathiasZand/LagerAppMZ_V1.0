import React from 'react'
import { Building2, Home, List, Settings, type LucideProps } from 'lucide-react'

export type Tab = 'liegenschaften' | 'home' | 'inventar' | 'verwaltung'

type LucideIcon = React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>

const TABS: { id: Tab; label: string; Icon: LucideIcon }[] = [
  { id: 'liegenschaften', label: 'Liegenschaft', Icon: Building2 },
  { id: 'home',           label: 'Home',         Icon: Home },
  { id: 'inventar',       label: 'Inventar',     Icon: List },
  { id: 'verwaltung',     label: 'Verwaltung',   Icon: Settings },
]

export function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 flex bg-surface-900/95 backdrop-blur-md border-t border-surface-800"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const on = active === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors ${
              on ? 'text-brand-400' : 'text-surface-500'
            }`}
          >
            <Icon size={22} strokeWidth={on ? 2 : 1.5} />
            <span className="text-[9.5px] font-medium leading-none">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
