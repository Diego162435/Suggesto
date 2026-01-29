import { User, MoreVertical, LogOut, Settings, Film, Tv, Book, Gamepad2, Gift, Coffee, Heart, List, Sparkles, Bell } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { notificationService, AppNotification } from '../services/notificationService'
import { supabase } from '../services/supabase'
import { useParentalControl } from '../context/ParentalControlContext'
import { PinModal } from './PinModal'

function timeAgo(date: string) {
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now.getTime() - past.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 1) return 'agora mesmo';
    if (diffInMins < 60) return `${diffInMins}m atrás`;
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    return `${diffInDays}d atrás`;
}

export function TopNavbar() {
    const { user, signOut } = useAuth()
    const { isKidsMode, exitKidsMode, verifyPin } = useParentalControl()
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [showPinModal, setShowPinModal] = useState(false)
    const { filter } = useParams<{ filter: string }>()
    const location = useLocation()
    const [profile, setProfile] = useState<{ full_name: string, avatar_url: string } | null>(null)

    const getPageDetails = () => {
        if (location.pathname === '/') return { title: 'Suggesto', icon: Sparkles, color: 'text-blue-400' }
        if (location.pathname === '/favorites') return { title: 'Favoritos', icon: Heart, color: 'text-rose-400' }
        if (location.pathname === '/wishlist') return { title: 'Lista', icon: List, color: 'text-emerald-400' }

        switch (filter) {
            case 'movie': return { title: 'Filmes', icon: Film, color: 'text-blue-400' }
            case 'tv': return { title: 'Séries', icon: Tv, color: 'text-purple-400' }
            case 'book': return { title: 'Livros', icon: Book, color: 'text-emerald-400' }
            case 'game': return { title: 'Games', icon: Gamepad2, color: 'text-indigo-400' }
            case 'gifts': return { title: 'Presentes', icon: Gift, color: 'text-pink-400' }
            case 'lifestyle': return { title: 'Lifestyle', icon: Coffee, color: 'text-amber-400' }
            case 'library': return { title: 'Minha Biblioteca', icon: List, color: 'text-slate-400' }
            default: return { title: 'Para Você', icon: Sparkles, color: 'text-blue-400' }
        }
    }

    const [showNotifications, setShowNotifications] = useState(false)
    const [notifications, setNotifications] = useState<AppNotification[]>([])
    const navigate = useNavigate()
    const notificationsRef = useRef<HTMLDivElement>(null)
    const profileRef = useRef<HTMLDivElement>(null)

    const unreadCount = notifications.filter(n => !n.is_read).length

    const fetchProfile = async () => {
        if (user?.id) {
            const { data } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', user.id)
                .single()
            if (data) setProfile(data)
        }
    }

    const fetchNotifications = async () => {
        if (user?.id) {
            const data = await notificationService.getNotifications(user.id)
            setNotifications(data)
        }
    }

    useEffect(() => {
        if (user?.id) {
            fetchNotifications()
            fetchProfile()
            const subscription = notificationService.subscribeToNotifications(user.id, fetchNotifications)

            // Subscribe to profile changes
            const profileSubscription = supabase
                .channel('profile_changes')
                .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, fetchProfile)
                .subscribe()

            return () => {
                subscription.unsubscribe()
                profileSubscription.unsubscribe()
            }
        }
    }, [user?.id])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setShowNotifications(false)
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleMarkAllAsRead = async () => {
        if (user?.id) {
            try {
                await notificationService.markAllAsRead(user.id)
                fetchNotifications()
            } catch (err) {
                console.error('Failed to mark all as read')
            }
        }
    }

    const handleNotificationClick = async (notif: AppNotification) => {
        if (!notif.is_read) {
            await notificationService.markAsRead(notif.id)
            fetchNotifications()
        }
        if (notif.link) {
            navigate(notif.link)
        }
        setShowNotifications(false)
    }

    const { title, icon: Icon, color } = getPageDetails()

    return (
        <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-3xl flex items-center justify-between px-6 sticky top-0 z-50">
            {/* dynamic Title & Icon */}
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${color}`}>
                    <Icon size={20} />
                </div>
                <h1 className="text-lg font-bold text-white tracking-tight">
                    {title}
                </h1>
            </div>

            {/* Kids Mode Banner */}
            {
                isKidsMode && (
                    <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full animate-pulse-slow">
                        <span className="text-xs font-black text-green-400 uppercase tracking-widest">Modo Kids Ativo</span>
                    </div>
                )
            }

            <div className="flex items-center gap-2">
                {/* Notification Center Trigger */}
                <div className="relative" ref={notificationsRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`p-2 rounded-full transition-all group relative ${showNotifications ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        title="Central de Notificações"
                    >
                        <Bell size={20} className={unreadCount > 0 ? 'animate-swing' : ''} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-slate-900 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className="absolute top-full right-0 mt-2 w-96 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold text-white">Notificações</h3>
                                    {unreadCount > 0 && (
                                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">
                                            {unreadCount} novas
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-400 font-bold uppercase tracking-wider">
                                    Beta
                                </span>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400">
                                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Bell size={20} className="text-slate-600" />
                                        </div>
                                        <p className="text-sm text-white font-medium mb-1">Nada por aqui ainda</p>
                                        <p className="text-xs text-slate-500">
                                            Fique de olho! Novas recomendações e avisos aparecerão aqui.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/5">
                                        {notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                onClick={() => handleNotificationClick(notif)}
                                                className={`p-4 hover:bg-white/5 transition-colors cursor-pointer group relative ${!notif.is_read ? 'bg-blue-600/5' : ''}`}
                                            >
                                                {!notif.is_read && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                                                )}
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={`text-sm font-bold truncate pr-6 ${!notif.is_read ? 'text-white' : 'text-slate-300'}`}>
                                                        {notif.title}
                                                    </h4>
                                                    <span className="text-[10px] text-slate-500 whitespace-nowrap pt-1">
                                                        {timeAgo(notif.created_at)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                                    {notif.message}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {notifications.length > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="w-full p-3 text-center text-xs text-blue-400 hover:bg-white/5 border-t border-white/5 transition-colors font-medium"
                                >
                                    Marcar todas como lidas
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="relative" ref={profileRef}>
                    {/* Profile Trigger */}
                    <div
                        className="flex items-center gap-3 p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer group border border-transparent hover:border-white/10"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 overflow-hidden">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={16} className="text-slate-400 group-hover:text-white transition-colors" />
                            )}
                        </div>
                        <div className="hidden sm:block text-right">
                            <p className="text-xs font-medium text-white truncate max-w-[120px]">
                                {profile?.full_name || user?.email?.split('@')[0] || 'Usuário'}
                            </p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                                Grátis
                            </p>
                        </div>
                        <MoreVertical size={14} className="text-slate-500 group-hover:text-white transition-colors" />
                    </div>

                    {/* Dropdown Menu */}
                    {showProfileMenu && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                            <div className="p-3 border-b border-white/5 bg-white/5">
                                <p className="text-xs font-semibold text-white truncate">
                                    {user?.email}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                    Configurações de conta
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    navigate('/settings')
                                    setShowProfileMenu(false)
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-colors text-left"
                            >
                                <Settings size={14} />
                                <span>Alterar Dados</span>
                            </button>

                            <button
                                onClick={() => {
                                    signOut()
                                    setShowProfileMenu(false)
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-colors text-left"
                            >
                                <LogOut size={14} />
                                <span>Sair da Conta</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <PinModal
                isOpen={showPinModal}
                onClose={() => setShowPinModal(false)}
                onSuccess={async (pin) => {
                    const isValid = await verifyPin(pin)
                    if (isValid) {
                        await exitKidsMode()
                        setShowPinModal(false)
                        // Force refresh or navigation if needed, but context should handle it
                    } else {
                        // Let modal handle error via its own logic if we passed validator? 
                        // Actually PinModal has simple validation if provided correctPin, but here we async verify.
                        // We will just alert for now or need to enhance PinModal to accept async validator?
                        // For simplicity in this step: we just alert. 
                        alert('PIN Incorreto')
                    }
                }}
                title="Sair do Modo Kids"
                description="Digite o PIN para voltar ao modo normal."
            />
        </header >
    )
}
