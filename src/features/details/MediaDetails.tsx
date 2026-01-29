import { useState, useEffect } from 'react'
import { MediaItem } from '../../types/media'
import { getMovieDetails, getTvDetails, searchMovies, searchTv } from '../../services/tmdb'
import { getBookDetails, searchBooks } from '../../services/books'
import { getGameDetails } from '../../services/games'
import { booksApi } from '../../services/booksApi'
import { seriesApi } from '../../services/seriesApi'
import { RatingModal } from '../rating/RatingModal'
import { FavoriteButton } from '../../components/FavoriteButton'
import { Star, BookOpen, MonitorPlay, ArrowLeft, Sparkles, Layers, ShoppingCart, X, Play, Gamepad2 } from 'lucide-react'
import { LikeButton } from '../../components/LikeButton'
import { ShareButton } from '../../components/ShareButton'
import { CommentsSection } from '../../components/CommentsSection'
import { SeoHead } from '../../components/SeoHead'
import { generateAmazonLink } from '../../utils/amazon'
import { ShopTheVibe } from '../../components/ShopTheVibe'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { MediaImage } from '../../components/MediaImage'

interface MediaDetailsProps {
    type: string
    id: string
    onClose?: () => void // If provided, behaves like a modal
}

export function MediaDetails({ type, id, onClose }: MediaDetailsProps) {
    const navigate = useNavigate()
    const [item, setItem] = useState<(MediaItem & { similar: MediaItem[] }) | null>(null)
    const [adaptations, setAdaptations] = useState<MediaItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isRatingOpen, setIsRatingOpen] = useState(false)
    const [showTrailer, setShowTrailer] = useState(false)

    // Load Data
    useEffect(() => {
        async function loadDetails() {
            if (!type || !id) return
            setLoading(true)
            setAdaptations([])
            try {
                let details: (MediaItem & { similar: MediaItem[] }) | null = null;
                // For games, we pass the full ID because it can be 3 parts (rawg-game-123) and stripping blindly breaks it.
                // The games service handles the prefix parsing internally.
                const rawId = (id.includes('-') && type !== 'game') ? id.split('-')[1] : id

                if (id.startsWith('db-')) {
                    const dbId = id.replace('db-book-', '').replace('db-tv-', '').replace('db-game-', '')
                    if (type === 'book') {
                        const b: any = await booksApi.getBook(dbId)
                        details = {
                            id: `db-book-${b.id}`,
                            apiId: b.id,
                            type: 'book' as const,
                            title: b.title,
                            overview: b.overview || '',
                            posterPath: b.poster_path,
                            releaseDate: b.release_date,
                            voteAverage: b.vote_average,
                            pageCount: b.page_count,
                            author: b.author,
                            genres: b.genres,
                            similar: [],
                            status: 'Lançado'
                        }
                    } else if (type === 'tv') {
                        const s: any = await seriesApi.getSeries(dbId)
                        details = {
                            id: `db-tv-${s.id}`,
                            apiId: s.id,
                            type: 'tv' as const,
                            title: s.title,
                            overview: s.overview || '',
                            posterPath: s.poster_path,
                            releaseDate: s.release_date,
                            voteAverage: s.vote_average,
                            numberOfSeasons: s.seasons?.length || 0,
                            numberOfEpisodes: s.episodes?.length || 0,
                            genres: s.genres,
                            similar: [],
                            status: 'Lançado'
                        }
                    } else if (type === 'game') {
                        const { data } = await supabase.from('games').select('*').eq('id', dbId).single()
                        const g = data as any
                        if (g) {
                            details = {
                                id: `db-game-${g.id}`,
                                apiId: g.id,
                                type: 'game' as const,
                                title: g.title,
                                overview: g.overview || '',
                                posterPath: g.poster_path,
                                backdropPath: g.backdrop_path,
                                releaseDate: g.release_date,
                                voteAverage: g.vote_average,
                                metacritic: g.metacritic,
                                platforms: g.platforms,
                                genres: g.genres,
                                publisher: g.publisher,
                                developers: g.developers,
                                similar: [],
                                status: 'Lançado'
                            }
                        }
                    }
                } else if (type === 'movie') details = await getMovieDetails(rawId)
                else if (type === 'tv') details = await getTvDetails(rawId)
                else if (type === 'book') details = await getBookDetails(rawId)
                else if (type === 'game') details = await getGameDetails(id)

                if (details) {
                    setItem(details)

                    // Verify Adaptations
                    const query = details.title
                    if (type === 'book') {
                        const [movies, tvs] = await Promise.all([
                            searchMovies(query).catch(() => ({ results: [] })),
                            searchTv(query).catch(() => ({ results: [] }))
                        ])
                        setAdaptations([...movies.results.slice(0, 2), ...tvs.results.slice(0, 2)])
                    } else if (type === 'game') {
                        const movies = await searchMovies(query).catch(() => ({ results: [] }))
                        setAdaptations(movies.results.slice(0, 2))
                    } else {
                        const books = await searchBooks(query).catch(() => ({ results: [] }))
                        setAdaptations(books.results.slice(0, 2))
                    }
                }
            } catch (error) {
                console.error("Failed to load details", error)
            } finally {
                setLoading(false)
            }
        }
        loadDetails()
    }, [type, id])

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
        )
    }

    if (!item) return null

    const translateStatus = (status: string) => {
        const translations: Record<string, string> = {
            'Released': 'Lançado', 'Planned': 'Planejado', 'In Production': 'Em Produção',
            'Post Production': 'Pós-Produção', 'Returning Series': 'Série em Exibição',
            'Ended': 'Finalizada', 'Canceled': 'Cancelada', 'Pilot': 'Piloto'
        }
        return translations[status] || status
    }

    const amazonLink = generateAmazonLink(item.title, item.type as any, item.type === 'book' ? `${item.title} livro` : undefined);

    const handleBack = () => {
        if (onClose) {
            onClose()
        } else {
            if (window.history.length > 2) navigate(-1)
            else navigate('/')
        }
    }

    return (
        <div className={`bg-transparent text-white pb-20 ${onClose ? 'min-h-[90vh]' : 'min-h-screen'}`}>
            <SeoHead
                title={item.title}
                description={`Informações sobre ${item.title}`}
                image={item.posterPath || undefined}
                type={item.type as any}
                item={item}
            />

            {/* Backdrop & Header */}
            <div className="relative h-[55vh] w-full overflow-hidden">
                <div className="absolute inset-0 bg-slate-900">
                    {item.backdropPath ? (
                        <img src={item.backdropPath} alt={item.title} className="w-full h-full object-cover opacity-60" />
                    ) : (
                        <img src={item.posterPath || ''} alt={item.title} className="w-full h-full object-cover opacity-30 blur-md" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
                </div>

                <div className="absolute top-0 left-0 p-6 z-50 w-full flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        className="p-3 bg-black/30 backdrop-blur-md rounded-full hover:bg-black/50 transition-colors text-white"
                        aria-label="Voltar"
                    >
                        {onClose ? <X size={24} /> : <ArrowLeft size={24} />}
                    </button>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-20 flex flex-col md:flex-row gap-8 items-start md:items-end">
                    <div className="hidden md:block w-52 h-80 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 flex-shrink-0 bg-slate-800">
                        <MediaImage
                            src={item.posterPath}
                            alt={item.title}
                            type={item.type}
                            className="w-full h-full"
                        />
                    </div>

                    <div className="flex-1 min-w-0 space-y-4 mb-2">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold uppercase rounded-full border border-blue-500/30 backdrop-blur-sm">
                                {item.type === 'movie' ? 'Filme' : item.type === 'tv' ? 'Série' : item.type === 'game' ? 'Jogo' : 'Livro'}
                            </span>
                            {item.status && (
                                <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full border backdrop-blur-sm ${item.status === 'Ended' ? 'bg-red-500/20 border-red-500/30 text-red-300' : 'bg-green-500/20 border-green-500/30 text-green-300'}`}>
                                    {translateStatus(item.status)}
                                </span>
                            )}
                            {item.voteAverage && (
                                <div className="flex items-center gap-1 text-yellow-400 text-sm font-bold bg-black/20 px-2 py-1 rounded-lg backdrop-blur-sm">
                                    <Star size={14} fill="currentColor" /> {item.voteAverage.toFixed(1)}
                                </div>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight drop-shadow-lg line-clamp-2">{item.title}</h1>
                        <div className="flex flex-wrap gap-4 text-slate-300 text-sm md:text-base items-center">
                            {item.genres?.map(g => <span key={g} className="text-slate-400 font-medium">{g}</span>)}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 w-full md:w-auto flex-shrink-0">
                        <div className="flex flex-wrap gap-3">
                            {item.trailerUrl && (
                                <button
                                    onClick={() => setShowTrailer(true)}
                                    className="w-full md:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl shadow-xl backdrop-blur-md border border-white/20 transition-all transform hover:scale-105 flex items-center justify-center gap-3"
                                >
                                    <Play size={22} className="fill-white" /> Trailer
                                </button>
                            )}
                            <button onClick={() => setIsRatingOpen(true)} className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-900/30 transition-all transform hover:scale-105 flex items-center justify-center gap-3">
                                <Star size={22} className="fill-white/20" /> Avaliar
                            </button>
                            <a href={amazonLink} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto px-6 py-4 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-bold rounded-2xl shadow-xl shadow-yellow-900/30 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                                <ShoppingCart size={22} /> <span className="hidden md:inline">Ver na Amazon</span>
                            </a>
                        </div>
                        <div className="flex gap-4 justify-center md:justify-start">
                            <LikeButton item={item} className="h-full px-6 rounded-2xl bg-slate-800/80 backdrop-blur-md border border-slate-700 hover:border-blue-500 shadow-xl" />
                            <FavoriteButton item={item} className="p-4 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 hover:border-rose-500 hover:bg-slate-800 transition-all shadow-xl" iconSize={22} />
                            <ShareButton
                                title={item.title}
                                text={`Veja ${item.title} no Suggesto!`}
                                url={`${window.location.origin}/details/${item.type}/${item.apiId || id}`}
                                className="p-4 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 hover:border-green-500 hover:bg-slate-800 transition-all shadow-xl text-white"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap gap-8 md:gap-16 justify-center md:justify-start">
                    {/* Stats */}
                    {item.releaseDate && <div className="flex flex-col"><span className="text-xs text-slate-500 uppercase">Lançamento</span><span className="text-lg font-semibold">{item.releaseDate.substring(0, 4)}</span></div>}
                    {item.contentRating && (
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-500 uppercase">Classificação</span>
                            <span className={`text-lg font-black px-2 rounded w-fit ${item.contentRating === 'L' ? 'bg-green-500 text-black' :
                                    item.contentRating === '10' ? 'bg-blue-500 text-white' :
                                        item.contentRating === '12' ? 'bg-yellow-500 text-black' :
                                            item.contentRating === '14' ? 'bg-orange-500 text-white' :
                                                item.contentRating === '16' ? 'bg-red-500 text-white' :
                                                    'bg-black text-white border border-white/20'
                                }`}>
                                {item.contentRating}
                            </span>
                        </div>
                    )}
                    {item.runtime && <div className="flex flex-col"><span className="text-xs text-slate-500 uppercase">Duração</span><span className="text-lg font-semibold">{Math.floor(item.runtime / 60)}h {item.runtime % 60}m</span></div>}
                    {item.numberOfSeasons && <div className="flex flex-col"><span className="text-xs text-slate-500 uppercase">Temporadas</span><span className="text-lg font-semibold">{item.numberOfSeasons}</span></div>}
                    {item.pageCount && <div className="flex flex-col"><span className="text-xs text-slate-500 uppercase">Páginas</span><span className="text-lg font-semibold">{item.pageCount}</span></div>}
                    {item.metacritic && <div className="flex flex-col"><span className="text-xs text-slate-500 uppercase">Metacritic</span><span className="text-lg font-semibold text-green-400">{item.metacritic}</span></div>}
                    {item.platforms && item.platforms.length > 0 && (
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-500 uppercase">Plataformas</span>
                            <span className="text-sm font-semibold max-w-xs truncate">{item.platforms.join(', ')}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-12">
                {adaptations.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-4"><Sparkles size={20} className="text-yellow-500" /><h2 className="text-xl font-bold">Adaptações</h2></div>
                        <div className="flex flex-wrap gap-4">
                            {adaptations.map(adapt => (
                                <div key={adapt.id} onClick={() => navigate(`/details/${adapt.type}/${adapt.apiId}`)} className="flex gap-4 p-3 rounded-xl bg-yellow-500/10 cursor-pointer w-full md:w-auto">
                                    <div className="w-12 h-16 bg-slate-800 rounded flex-shrink-0 overflow-hidden">
                                        <MediaImage
                                            src={adapt.posterPath}
                                            alt={adapt.title}
                                            type={adapt.type}
                                            className="w-full h-full"
                                        />
                                    </div>
                                    <div><h4 className="font-bold text-slate-200">{adapt.title}</h4></div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section>
                    <div className="flex items-center gap-2 mb-4">
                        {item.type === 'game' ? <Gamepad2 size={20} className="text-indigo-400" /> : <BookOpen size={20} className="text-blue-500" />}
                        <h2 className="text-xl font-bold">Sobre</h2>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-lg font-light max-w-4xl">{item.overview || "Sem sinopse."}</p>
                </section>

                <section>
                    <ShopTheVibe item={item} />
                </section>

                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2"><Layers size={20} className="text-emerald-500" /><h2 className="text-xl font-bold">Semelhantes</h2></div>
                        <button onClick={() => navigate(`/similar/${item.type}/${item.apiId}`)} className="text-xs font-bold text-slate-500 hover:text-white uppercase">Ver Todos</button>
                    </div>
                    {/* Horizontal Scroll Similar */}
                    <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                        {item.similar?.map(sim => (
                            <div key={sim.id} onClick={() => navigate(`/details/${sim.type}/${sim.id}`)} className="w-32 flex-shrink-0 cursor-pointer">
                                <div className="w-32 h-48 bg-slate-800 rounded-lg overflow-hidden mb-2">
                                    <MediaImage
                                        src={sim.posterPath}
                                        alt={sim.title}
                                        type={sim.type}
                                        className="w-full h-full"
                                    />
                                </div>
                                <h4 className="font-bold text-xs text-slate-300 line-clamp-2">{sim.title}</h4>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-2 mb-6"><MonitorPlay size={20} className="text-purple-500" /><h2 className="text-xl font-bold">Elenco</h2></div>
                    <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                        {item.cast?.map((actor, idx) => (
                            <div key={idx} className="flex-shrink-0 w-24"><div className="w-24 h-24 rounded-full overflow-hidden mb-2 mx-auto"><img src={actor.profilePath || ''} className="w-full h-full object-cover" /></div><p className="text-xs text-center font-bold">{actor.name}</p></div>
                        ))}
                    </div>
                </section>

                <hr className="border-slate-800" />
                <section><CommentsSection mediaId={item.apiId} mediaType={item.type} /></section>

                <RatingModal item={item} isOpen={isRatingOpen} onClose={() => setIsRatingOpen(false)} onSuccess={() => setIsRatingOpen(false)} />

                {/* Trailer Modal Overlay */}
                {showTrailer && item.trailerUrl && (
                    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
                        <button
                            onClick={() => setShowTrailer(false)}
                            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[110]"
                        >
                            <X size={32} />
                        </button>
                        <div className="w-full max-w-6xl aspect-video relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/10 border border-white/5">
                            <iframe
                                src={`https://www.youtube.com/embed/${item.trailerUrl}?autoplay=1`}
                                title={`${item.title} Trailer`}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
