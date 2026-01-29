import { LucideIcon, Check } from 'lucide-react'

interface GenreCardProps {
    id: string
    label: string
    icon?: LucideIcon
    image?: string
    selected: boolean
    onClick: () => void
}

export function GenreCard({ label, icon: Icon, image, selected, onClick }: GenreCardProps) {
    return (
        <div
            onClick={onClick}
            className={`
                relative group cursor-pointer overflow-hidden rounded-2xl transition-all duration-300
                ${selected
                    ? 'ring-4 ring-blue-500 scale-[1.02] shadow-[0_0_20px_rgba(59,130,246,0.5)]'
                    : 'hover:scale-[1.02] hover:shadow-xl border border-white/10'
                }
            `}
        >
            {/* Background */}
            <div className="absolute inset-0 bg-slate-900">
                {image ? (
                    <img
                        src={image}
                        alt={label}
                        className={`
                            w-full h-full object-cover transition-transform duration-700
                            ${selected ? 'scale-110 opacity-40' : 'group-hover:scale-110 opacity-60'}
                        `}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
                )}

                {/* Gradient Overlay */}
                <div className={`
                    absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent
                    ${selected ? 'opacity-90' : 'opacity-80'}
                `} />
            </div>

            {/* Content */}
            <div className="relative p-6 h-32 flex flex-col justify-end">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div className={`
                                p-2 rounded-lg backdrop-blur-md transition-colors
                                ${selected ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/80 group-hover:bg-white/20'}
                            `}>
                                <Icon size={20} />
                            </div>
                        )}
                        <span className={`
                            font-bold text-lg transition-colors
                            ${selected ? 'text-white' : 'text-slate-200 group-hover:text-white'}
                        `}>
                            {label}
                        </span>
                    </div>

                    {/* Checkmark Indicator */}
                    <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center transition-all bg-blue-500 text-white
                        ${selected ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
                    `}>
                        <Check size={14} strokeWidth={4} />
                    </div>
                </div>
            </div>
        </div>
    )
}
