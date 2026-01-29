import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import { Navbar } from '../../components/Navbar'
import { Star, Calendar, Film, Book } from 'lucide-react'

interface HistoryItem {
    id: string
    title: string
    media_type: 'movie' | 'book'
    rating: number
    created_at: string
    poster_path: string | null
    genre: string
}

export function History() {
    const { user } = useAuth()
    const [items, setItems] = useState<HistoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        total: 0,
        movies: 0,
        books: 0,
        favGenre: '-'
    })

    useEffect(() => {
        async function loadHistory() {
            if (!user) return
            try {
                const { data } = await (supabase as any)
                    .from('user_ratings')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })

                const historyItems = data || []
                setItems(historyItems)
                calculateStats(historyItems)
            } catch (err) {
                console.error("Error loading history:", err)
            } finally {
                setLoading(false)
            }
        }
        loadHistory()
    }, [user])

    function calculateStats(history: HistoryItem[]) {
        if (!history.length) return

        const movies = history.filter(i => i.media_type === 'movie').length
        const books = history.filter(i => i.media_type === 'book').length

        // Genre Mode
        const genres = history.map(i => i.genre).filter(Boolean)
        const counts: Record<string, number> = {}
        let maxCount = 0
        let favGenre = '-'

        for (const g of genres) {
            counts[g] = (counts[g] || 0) + 1
            if (counts[g] > maxCount) {
                maxCount = counts[g]
                favGenre = g
            }
        }

        setStats({
            total: history.length,
            movies,
            books,
            favGenre
        })
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-24 px-4 pt-6">
            <h1 className="text-2xl font-bold mb-6">Histórico</h1>

            {/* Stats Card */}
            {!loading && items.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-8 p-4 bg-gradient-to-br from-indigo-900/50 to-slate-900 rounded-2xl border border-indigo-500/20">
                    <div className="flex flex-col items-center justify-center p-2">
                        <span className="text-2xl font-black text-white">{stats.total}</span>
                        <span className="text-[10px] uppercase tracking-wide text-indigo-300 font-medium text-center">Itens Avaliados</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 border-l border-white/5">
                        <span className="text-xl font-bold text-white flex items-center gap-1">
                            <Film size={14} className="text-blue-400" /> {stats.movies}
                        </span>
                        <span className="text-[10px] uppercase tracking-wide text-indigo-300 font-medium mt-1">Filmes</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 border-l border-white/5">
                        <span className="text-sm font-bold text-white text-center line-clamp-2 leading-tight min-h-[1.5rem] flex items-center">
                            {stats.favGenre}
                        </span>
                        <span className="text-[10px] uppercase tracking-wide text-indigo-300 font-medium mt-1 text-center">Gênero Favorito</span>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center py-10 opacity-50">Carregando...</div>
            ) : items.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                    Nenhum item avaliado ainda.
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map(item => (
                        <div key={item.id} className="flex bg-slate-900 rounded-xl overflow-hidden border border-slate-800 p-3 gap-3">
                            <div className="w-16 h-24 bg-slate-800 rounded flex-shrink-0 overflow-hidden">
                                {item.poster_path ? (
                                    <img src={item.poster_path} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full w-full text-slate-500">
                                        {item.media_type === 'movie' ? <Film size={20} /> : <Book size={20} />}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-white">{item.title}</h3>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="flex items-center text-yellow-400 text-sm font-bold">
                                        {item.rating} <Star size={12} fill="currentColor" className="ml-0.5" />
                                    </span>
                                    <span className="text-slate-500 text-xs">•</span>
                                    <span className="text-slate-400 text-xs capitalize">{item.media_type === 'movie' ? 'Filme' : 'Livro'}</span>
                                    <span className="text-slate-500 text-xs">•</span>
                                    <span className="text-slate-400 text-xs">{item.genre}</span>
                                </div>
                                <div className="flex items-center text-slate-500 text-xs mt-2">
                                    <Calendar size={12} className="mr-1" />
                                    {new Date(item.created_at).toLocaleDateString('pt-BR')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Navbar />
        </div>
    )
}
