import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getUserLikes, LikeItem } from '../../services/likes'
import { ArrowLeft, Heart, Film, Book } from 'lucide-react'
import { FavoriteButton } from '../../components/FavoriteButton'

export function FavoritesPage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [likes, setLikes] = useState<LikeItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            if (!user) return
            try {
                const data = await getUserLikes(user.id)
                setLikes(data)
            } catch (error) {
                console.error("Failed to load likes", error)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [user])

    const handleBack = () => {
        // Simple back logic
        navigate(-1)
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center gap-4">
                <button
                    onClick={handleBack}
                    className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="flex items-center gap-2">
                    <Heart className="text-rose-500 fill-rose-500" size={20} />
                    <h1 className="text-xl font-bold">Meus Favoritos</h1>
                </div>
            </div>

            <div className="p-6 max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
                    </div>
                ) : likes.length === 0 ? (
                    <div className="text-center py-20">
                        <Heart size={48} className="mx-auto text-slate-700 mb-4" />
                        <h2 className="text-lg font-bold text-slate-400 mb-2">Nada aqui ainda</h2>
                        <p className="text-slate-500 max-w-xs mx-auto">
                            Curta filmes, séries e livros para vê-los aqui e receber recomendações melhores.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {likes.map(item => (
                            <div
                                key={item.id}
                                className="group relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-rose-500/30 transition-colors"
                            >
                                <div
                                    className="aspect-[2/3] relative bg-slate-800 cursor-pointer overflow-hidden"
                                    onClick={() => navigate(`/details/${item.media_type}/${item.media_id}`)}
                                >
                                    {item.poster_path ? (
                                        <img
                                            src={item.poster_path}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                                            {item.media_type === 'movie' ? <Film /> : <Book />}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                                    {/* Like Button overlaid */}
                                    <div className="absolute top-2 right-2 z-10">
                                        <FavoriteButton
                                            item={{
                                                id: item.media_id, // Important: pass the media ID
                                                apiId: item.media_id,
                                                type: item.media_type,
                                                title: item.title,
                                                overview: "",
                                                posterPath: item.poster_path
                                            } as any}
                                            className="p-2 bg-black/40 backdrop-blur-md rounded-full hover:bg-rose-500 hover:text-white transition-colors"
                                        />
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <h3 className="font-bold text-sm text-white line-clamp-2 leading-tight">{item.title}</h3>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 mt-1 block">
                                            {item.media_type === 'movie' ? 'Filme' : item.media_type === 'tv' ? 'Série' : 'Livro'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
