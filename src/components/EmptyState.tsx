import { LucideIcon, SearchX } from 'lucide-react'

interface EmptyStateProps {
    title: string
    description: string
    icon?: LucideIcon
    action?: {
        label: string
        onClick: () => void
    }
}

export function EmptyState({ title, description, icon: Icon = SearchX, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 border border-white/5 shadow-2xl">
                <Icon size={32} className="text-slate-500" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed mb-8">
                {description}
            </p>

            {action && (
                <button
                    onClick={action.onClick}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                    {action.label}
                </button>
            )}
        </div>
    )
}
