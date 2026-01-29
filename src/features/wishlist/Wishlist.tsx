import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import { SearchBox } from '../search/SearchBox'
import { RatingModal } from '../rating/RatingModal'
import { MediaItem } from '../../types/media'
import { Navbar } from '../../components/Navbar'
import { Check, Trash2 } from 'lucide-react'
import { MediaImage } from '../../components/MediaImage'

interface WishlistItem {
    id: string
    media_id: string
    media_type: 'movie' | 'book'
    title: string
    poster_path: string | null
    status: 'want_to_consume' | 'consumed'
}

export function Wishlist() {
    const { user } = useAuth()
    const [items, setItems] = useState<WishlistItem[]>([])
    const [loading, setLoading] = useState(true)
    const [ratingItem, setRatingItem] = useState<MediaItem | null>(null)
    const [isRatingOpen, setIsRatingOpen] = useState(false)
    const [filter, setFilter] = useState<'all' | 'movie' | 'book'>('all')

    useEffect(() => {
        loadItems()
    }, [user])

    const loadItems = async () => {
        if (!user) return
        const { data } = await (supabase as any)
            .from('wishlist')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'want_to_consume')
            .order('created_at', { ascending: false })

        setItems(data || [])
        setLoading(false)
    }

    const filteredItems = items.filter(item =>
        filter === 'all' || item.media_type === filter
    )

    const addItem = async (item: MediaItem) => {
        if (!user) return
        const { error } = await (supabase as any)
            .from('wishlist')
            .insert({
                user_id: user.id,
                media_id: item.apiId,
                media_type: item.type,
                title: item.title,
                poster_path: item.posterPath,
                status: 'want_to_consume'
            })

        if (!error) loadItems()
    }

    const removeItem = async (id: string) => {
        const { error } = await (supabase as any).from('wishlist').delete().eq('id', id)
        if (!error) setItems(prev => prev.filter(i => i.id !== id))
    }

    const markAsConsumed = async (wishlistItem: WishlistItem) => {
        // Prepare media item for rating modal
        setRatingItem({
            id: wishlistItem.media_id, // simple ID mapping, potentially buggy if type prefix needed, but API ID is stored
            apiId: wishlistItem.media_id,
            type: wishlistItem.media_type,
            title: wishlistItem.title,
            posterPath: wishlistItem.poster_path,
            overview: '', // Not stored in wishlist, fine for rating context
            voteAverage: 0
        })
        setIsRatingOpen(true)

        // Optimistically remove from wishlist logic or update status
        // DB update will happen after rating success in onSuccess handler below? 
        // No, the prompt says "Already consumed" directs to evaluation.
        // It should also remove from "Want to consume" list or change status.
    }

    const handleRatingSuccess = async () => {
        // Update wishlist status to consumed or delete
        if (!user || !ratingItem) return

        // We find the wishlist item matching this media
        await (supabase as any)
            .from('wishlist')
            .update({ status: 'consumed' })
            .eq('user_id', user.id)
            .eq('media_id', ratingItem.apiId)

        loadItems()
        setIsRatingOpen(false)
        setRatingItem(null)
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-24 px-4 pt-6">
            <h1 className="text-2xl font-bold mb-6">Minha Lista</h1>

            <div className="mb-8 space-y-4">
                <SearchBox onSelect={addItem} />

                <div className="flex gap-2">
                    {[
                        { id: 'all', label: 'Todos' },
                        { id: 'movie', label: 'Filmes' },
                        { id: 'book', label: 'Livros' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === tab.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10 opacity-50">Carregando...</div>
            ) : filteredItems.length === 0 ? (
                <div className="text-center py-10 text-slate-500 border border-slate-800 rounded-xl border-dashed">
                    Nenhum item encontrado
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredItems.map(item => (
                        <div key={item.id} className="flex bg-slate-900 rounded-xl overflow-hidden border border-slate-800 p-3 gap-3">
                            <div className="w-16 h-24 bg-slate-800 rounded flex-shrink-0 overflow-hidden">
                                <MediaImage
                                    src={item.poster_path}
                                    alt={item.title}
                                    type={item.media_type}
                                    className="w-full h-full"
                                />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <h3 className="font-semibold text-white truncate">{item.title}</h3>
                                <p className="text-xs text-slate-400 capitalize mb-3">
                                    {item.media_type === 'movie' ? 'Filme' : 'Livro'}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => markAsConsumed(item)}
                                        className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 text-xs font-medium py-1.5 rounded flex items-center justify-center gap-1 transition-colors"
                                    >
                                        <Check size={14} /> Já consumi
                                    </button>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 rounded transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {ratingItem && (
                <RatingModal
                    item={ratingItem}
                    isOpen={isRatingOpen}
                    onClose={() => setIsRatingOpen(false)}
                    onSuccess={handleRatingSuccess}
                />
            )}
            <Navbar />
        </div>
    )
}
