import { Home, List, Heart, Film, Tv, Book, Gift, Coffee, ChevronDown, ChevronRight, Gamepad2 } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'


export function Sidebar() {
    const location = useLocation()
    // Sidebar logic
    const isActive = (path: string) => location.pathname === path

    const [expandedGroups, setExpandedGroups] = useState<string[]>([])
    const [isHovered, setIsHovered] = useState(false)
    const navigate = useNavigate()

    const toggleExpand = (label: string) => {
        setExpandedGroups(prev =>
            prev.includes(label)
                ? prev.filter(l => l !== label)
                : [...prev, label]
        )
    }

    useEffect(() => {
        // Auto-expand the group that contains the current active path if not already expanded
        navigationGroups.forEach(group => {
            group.items.forEach(item => {
                if ('children' in item && location.pathname.startsWith(item.path)) {
                    if (!expandedGroups.includes(item.label)) {
                        setExpandedGroups(prev => [...prev, item.label])
                    }
                }
            })
        })
    }, [location.pathname])

    useEffect(() => {
        const width = isHovered ? '256px' : '100px'
        document.documentElement.style.setProperty('--sidebar-width', width)
    }, [isHovered])

    const navigationGroups = [
        {
            title: 'EXPLORAR',
            items: [
                { path: '/', icon: Home, label: 'Início' },
                {
                    path: '/browse/movie',
                    icon: Film,
                    label: 'Filmes',
                    children: [
                        { label: 'Ação', query: 'action' },
                        { label: 'Comédia', query: 'comedy' },
                        { label: 'Drama', query: 'drama' },
                        { label: 'Ficção', query: 'scifi' },
                        { label: 'Terror', query: 'horror' },
                        { label: 'Romance', query: 'romance' }
                    ]
                },
                {
                    path: '/browse/tv',
                    icon: Tv,
                    label: 'TV & Séries',
                    children: [
                        { label: 'Drama', query: 'drama' },
                        { label: 'Comédia', query: 'comedy' },
                        { label: 'Ação', query: 'action' },
                        { label: 'Sci-Fi', query: 'scifi' }
                    ]
                },
                {
                    path: '/browse/book',
                    icon: Book,
                    label: 'Livros',
                    children: [
                        { label: 'Ficção', query: 'fiction' },
                        { label: 'Fantasia', query: 'fantasy' },
                        { label: 'Romance', query: 'romance' },
                        { label: 'História', query: 'history' }
                    ]
                },
                {
                    path: '/browse/game',
                    icon: Gamepad2,
                    label: 'Games',
                    children: [
                        { label: 'Ação', query: 'action' },
                        { label: 'Aventura', query: 'adventure' },
                        { label: 'RPG', query: 'rpg' },
                        { label: 'Estratégia', query: 'strategy' }
                    ]
                }
            ]
        },
        {
            title: 'ESTILO DE VIDA',
            items: [
                { path: '/browse/gifts', icon: Gift, label: 'Presentes', soon: true },
                { path: '/browse/lifestyle', icon: Coffee, label: 'Lifestyle', soon: true }
            ]
        },
        {
            title: 'PESSOAL',
            items: [
                { path: '/favorites', icon: Heart, label: 'Favoritos' },
                { path: '/wishlist', icon: List, label: 'Lista' }
            ]
        }
    ]

    return (
        <aside
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false)
            }}
            style={{ '--sidebar-width': isHovered ? '256px' : '100px' } as any}
            className={`hidden md:flex flex-col h-screen fixed left-0 top-0 backdrop-blur-3xl border-r transition-all duration-300 ease-in-out group z-[60] ${isHovered
                ? 'bg-black/40 border-white/10 shadow-[4px_0_24px_rgba(0,0,0,0.5)] w-64'
                : 'bg-[#050505]/95 border-white/5 w-[100px]'
                }`}
        >
            {/* Logo Area */}
            <div className="h-28 flex items-center justify-center p-2 transition-all duration-300">
                <Link to="/" className="flex items-center justify-center w-full group/logo">
                    <img
                        src="/src/assets/logo.png"
                        alt="Suggesto Logo"
                        className={`object-contain shrink-0 transition-all duration-500 ease-out ${isHovered ? 'h-24' : 'h-[82px]'} group-hover/logo:scale-110`}
                    />
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto no-scrollbar">
                {navigationGroups.map((group) => (
                    <div key={group.title} className="space-y-1">
                        <h4 className={`text-[10px] font-bold text-slate-500 px-4 mb-2 tracking-[0.2em] transition-opacity duration-300 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                            {group.title}
                        </h4>

                        {group.items.map((item) => {
                            const active = isActive(item.path) || location.pathname.startsWith(item.path + '/')
                            const Icon = item.icon
                            const isExpanded = expandedGroups.includes(item.label)
                            const hasChildren = 'children' in item
                            const isSoon = (item as any).soon

                            return (
                                <div key={item.path} className="mb-1">
                                    <div
                                        onClick={(e) => {
                                            if (isSoon) return
                                            if (hasChildren && isHovered) {
                                                e.preventDefault()
                                                toggleExpand(item.label)
                                                if (item.path !== location.pathname) navigate(item.path)
                                            }
                                        }}
                                        title={isSoon ? "Em breve" : ""}
                                        className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group/item relative ${isSoon ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${active
                                            ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                                            : isSoon ? 'text-slate-600' : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <Link
                                            to={isSoon ? '#' : item.path}
                                            onClick={(e) => isSoon && e.preventDefault()}
                                            className="flex items-center gap-3 flex-1 overflow-hidden"
                                        >
                                            <Icon
                                                size={20}
                                                className={`shrink-0 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover/item:scale-110'}`}
                                            />
                                            <span className={`font-medium text-sm transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                                                {item.label}
                                            </span>
                                        </Link>

                                        {hasChildren && isHovered && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    toggleExpand(item.label)
                                                }}
                                                className="p-1 hover:bg-white/10 rounded-full shrink-0"
                                            >
                                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                            </button>
                                        )}

                                        {active && !isHovered && (
                                            <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-full" />
                                        )}
                                    </div>

                                    {/* Submenu */}
                                    {hasChildren && isExpanded && isHovered && (
                                        <div className="ml-9 mt-1 space-y-1 border-l border-white/5 pl-3 animate-in fade-in slide-in-from-left-2 duration-200">
                                            {(item as any).children.map((child: any) => (
                                                <Link
                                                    key={child.label}
                                                    to={`${item.path}?genre=${child.query}`}
                                                    className={`block px-3 py-2 text-xs rounded-lg transition-colors whitespace-nowrap ${location.search.includes(`genre=${child.query}`)
                                                        ? 'text-white bg-white/10 font-bold'
                                                        : 'text-slate-500 hover:text-slate-300'
                                                        }`}
                                                >
                                                    {child.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ))}
            </nav>
        </aside>
    )
}
