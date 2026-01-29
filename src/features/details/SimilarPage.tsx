import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MediaItem } from '../../types/media'
import { getRecommendations as getTmdbRecommendations, getMovieDetails, getTvDetails } from '../../services/tmdb'
import { getRecommendations as getBookRecommendations, getBookDetails } from '../../services/books'
import { ArrowLeft, Star } from 'lucide-react'

export function SimilarPage() {
    const { type, id } = useParams<{ type: string; id: string }>()
    const navigate = useNavigate()

    const [sourceTitle, setSourceTitle] = useState<string>('')
    const [items, setItems] = useState<MediaItem[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)

    // Load initial source info and first page
    useEffect(() => {
        async function loadSourceAndInitial() {
            if (!type || !id) return
            setLoading(true)
            try {
                // 1. Get Source Info (just for title)
                let title = ''
                const rawId = id.split('-')[1] || id // Handle both full id and raw id if mixed

                if (type === 'movie') {
                    const d = await getMovieDetails(rawId)
                    title = d.title
                } else if (type === 'tv') {
                    const d = await getTvDetails(rawId)
                    title = d.title
                } else if (type === 'book') {
                    const d = await getBookDetails(rawId)
                    title = d.title
                }
                setSourceTitle(title)

                // 2. Get Recommendations Page 1
                await loadRecommendations(1, true)

            } catch (error) {
                console.error("Failed to load similar page", error)
            } finally {
                setLoading(false)
            }
        }
        loadSourceAndInitial()
    }, [type, id])

    async function loadRecommendations(pageNum: number, reset = false) {
        if (!type || !id) return
        if (!reset) setLoadingMore(true)

        try {
            let res

            if (type === 'movie' || type === 'tv') {
                res = await getTmdbRecommendations(type, id, pageNum)
            } else {
                res = await getBookRecommendations(id, pageNum)
            }

            if (reset) {
                setItems(res.results)
            } else {
                setItems(prev => [...prev, ...res.results])
            }

            setHasMore(pageNum < res.totalPages)
            setPage(pageNum)

        } catch (error) {
            console.error("Failed to load recs", error)
        } finally {
            setLoadingMore(false)
        }
    }

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            loadRecommendations(page + 1)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 pb-24 md:p-12">

            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 group"
                >
                    <div className="p-2 rounded-full bg-slate-900 group-hover:bg-slate-800">
                        <ArrowLeft size={20} />
                    </div>
                    <span className="font-medium">Voltar</span>
                </button>

                <h1 className="text-2xl md:text-3xl font-bold">
                    Semelhantes a <span className="text-blue-500">{sourceTitle}</span>
                </h1>
                <p className="text-slate-500 mt-2">Explorar títulos relacionados baseados em gênero e tema.</p>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {items.map((item, idx) => (
                        <div
                            key={`${item.id}-${idx}`}
                            onClick={() => {
                                navigate(`/details/${item.type}/${item.apiId}`)
                                window.scrollTo(0, 0)
                            }}
                            className="cursor-pointer group"
                        >
                            <div className="aspect-[2/3] bg-slate-800 rounded-xl overflow-hidden shadow-lg mb-3 border border-slate-800 group-hover:border-blue-500/50 transition-all relative">
                                {item.posterPath ? (
                                    <img src={item.posterPath} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-600">Sem Imagem</div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h3 className="font-bold text-slate-200 line-clamp-1 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                <span>{item.releaseDate?.substring(0, 4)}</span>
                                {item.voteAverage && (
                                    <span className="flex items-center gap-1 text-yellow-500/80">
                                        <Star size={10} fill="currentColor" /> {item.voteAverage.toFixed(1)}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {hasMore && (
                    <div className="mt-12 flex justify-center">
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loadingMore ? 'Carregando...' : 'Carregar Mais'}
                        </button>
                    </div>
                )}

                {!hasMore && items.length > 0 && (
                    <p className="text-center text-slate-500 mt-12 mb-8">Você chegou ao fim da lista.</p>
                )}
            </div>
        </div>
    )
}
