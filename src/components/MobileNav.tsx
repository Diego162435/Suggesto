import { Home, List, History, Heart } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export function MobileNav() {
    const location = useLocation()
    const isActive = (path: string) => location.pathname === path

    const navItems = [
        { path: '/', icon: Home, label: 'Início' },
        { path: '/favorites', icon: Heart, label: 'Favoritos' },
        { path: '/wishlist', icon: List, label: 'Lista' },
        { path: '/history', icon: History, label: 'Histórico' },
        // { path: '/profile', icon: User, label: 'Perfil' }, // Future use
    ]

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800/50" />

            <div className="relative flex justify-around items-center h-16 px-2">
                {navItems.map((item) => {
                    const active = isActive(item.path)
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300 ${active ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {/* Active Indicator (Glow) */}
                            {active && (
                                <div className="absolute -top-[1px] w-12 h-[2px] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] rounded-full mb-auto" />
                            )}

                            <Icon
                                size={active ? 24 : 22}
                                strokeWidth={active ? 2.5 : 2}
                                className={`transition-all duration-300 transform ${active ? '-translate-y-0.5' : ''}`}
                            />
                            <span className={`text-[10px] font-medium transition-all duration-300 ${active ? 'opacity-100' : 'opacity-70'}`}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
