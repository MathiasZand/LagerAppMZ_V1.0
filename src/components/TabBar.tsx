import React from 'react'
import { Building2, Home, List, Settings, type LucideProps } from 'lucide-react'

export type Tab = 'liegenschaften' | 'home' | 'inventar' | 'verwaltung'

type LucideIcon = React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>

const TABS: { id: Tab; label: string; Icon: LucideIcon }[] = [
  { id: 'liegenschaften', label: 'Liegenschaft', Icon: Building2 },
  { id: 'home',           label: 'Home',         Icon: Home      },
  { id: 'inventar',       label: 'Inventar',     Icon: List      },
  { id: 'verwaltung',     label: 'Verwaltung',   Icon: Settings  },
]

export function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex flex-col bg-surface-900/96 backdrop-blur-xl border-t border-surface-800/80"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex">
        {TABS.map(({ id, label, Icon }) => {
          const on = active === id
          return (
            <button key={id} type="button" onClick={() => onChange(id)}
              className={`relative flex-1 flex flex-col items-center justify-center gap-1 h-14 transition-colors ${on ? 'text-brand-400' : 'text-surface-500'}`}>
              {on && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-brand-400 rounded-full" />}
              <Icon size={22} strokeWidth={on ? 2 : 1.5} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
