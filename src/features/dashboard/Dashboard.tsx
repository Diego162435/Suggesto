import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { RecommendationItem, getRecommendations } from '../recommendations/RecommendationEngine'
import { getTrending, discoverMoviesByGenre, discoverTvByGenre } from '../../services/tmdb'
import { discoverBooksByGenre } from '../../services/books'
import { discoverGamesByGenre, getTrendingGames } from '../../services/games'
import { SearchBox } from '../search/SearchBox'
import { Film, Book, Star, Gamepad2, Tv, ChevronRight } from 'lucide-react'
import { MediaDetailsModal } from '../details/MediaDetailsModal'
import { EmptyState } from '../../components/EmptyState'
import { usePermanentLibrary } from '../../hooks/usePermanentLibrary'
import { supabase } from '../../services/supabase'
import { GENRES } from '../../data/genres'
import { MediaImage } from '../../components/MediaImage'
import { useParentalControl } from '../../context/ParentalControlContext'

export function Dashboard() {
    const { user } = useAuth()
    const { isKidsMode, allowedRatings } = useParentalControl()
    const navigate = useNavigate()
    const { filter: urlFilter } = useParams<{ filter: string }>()
    const [searchParams] = useSearchParams()
    const activeGenreId = searchParams.get('genre')

    const genreLabel = GENRES.find(g => g.id === activeGenreId)?.label || activeGenreId

    const [recommendations, setRecommendations] = useState<RecommendationItem[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'movie' | 'tv' | 'book' | 'game' | 'gifts' | 'lifestyle' | 'library'>('all')
    const { items: libraryItems, loading: libraryLoading } = usePermanentLibrary()
    const [selectedItem, setSelectedItem] = useState<{ type: string, id: string } | null>(null)


    // Sync URL filter with state
    useEffect(() => {
        if (urlFilter && ['all', 'movie', 'tv', 'book', 'game', 'gifts', 'lifestyle', 'library'].includes(urlFilter)) {
            setFilter(urlFilter as any)
        }
    }, [urlFilter])

    async function loadData() {
        if (!user) {
            setLoading(false)
            return
        }
        setLoading(true)

        try {
            if (isKidsMode) {
                // KIDS MODE LOADING STRATEGY
                const ratingsOrder = ['L', '10', '12', '14', '16', '18']
                const maxAllowed = ratingsOrder.reduce((acc, curr) => {
                    return allowedRatings.includes(curr) ? curr : acc
                }, 'L')

                // Determine Safe Genres based on rating
                // If rating is low ('L', '10'), stick to Animation(16), Family(10751)
                // If rating is higher (12+), allow Adventure(12), Fantasy(14), Comedy(35)
                const isTeen = ['12', '14', '16', '18'].includes(maxAllowed)

                const safeGenres = ['16', '10751'] // Animation, Family
                if (isTeen) {
                    safeGenres.push('12') // Adventure
                    safeGenres.push('14') // Fantasy
                    safeGenres.push('35') // Comedy
                }

                const genreString = safeGenres.join(',')

                // Fetch with explicit certification filter
                const movies = await discoverMoviesByGenre(genreString, 1, { maxRating: maxAllowed })
                const tv = await discoverTvByGenre(genreString, 1, { maxRating: maxAllowed })

                // For books, we search for specific kid terms
                let books: any = { results: [] }
                try {
                    books = await discoverBooksByGenre(isTeen ? 'adventure' : 'children')
                } catch { }

                let combined = [
                    ...movies.results.map((m: any) => ({ ...m, type: 'movie' })),
                    ...tv.results.map((t: any) => ({ ...t, type: 'tv' })),
                    ...books.results.map((b: any) => ({ ...b, type: 'book' }))
                ]

                // Shuffle
                combined = combined.sort(() => Math.random() - 0.5)

                setRecommendations(combined.map((item: any) => ({
                    ...item,
                    reason: { description: isTeen ? `Modo Teen (max ${maxAllowed})` : `Modo Kids (max ${maxAllowed})`, type: 'genre' }
                })))
            } else if (filter === 'gifts' || filter === 'lifestyle') {
                const amazonSearchTerms: Record<string, string[]> = {
                    'gifts': ['gadgets inovadores', 'presentes criativos', 'decoração geek', 'itens colecionáveis', 'tech gadgets'],
                    'lifestyle': ['cafeteiras italianas', 'decoração minimalista', 'organização casa', 'estilo de vida saudável', 'plantas de interior']
                }

                const terms = amazonSearchTerms[filter] || []
                const randomTerm = terms[Math.floor(Math.random() * terms.length)]

                const amazonRecs: RecommendationItem[] = [
                    {
                        id: `amazon-${filter}-1`,
                        apiId: `amazon-${filter}-1`,
                        type: 'movie' as any,
                        title: `Ver ${filter === 'gifts' ? 'Presentes' : 'Lifestyle'} na Amazon`,
                        overview: `Explore as melhores ofertas de ${randomTerm} diretamente na Amazon Brasil.`,
                        posterPath: filter === 'gifts'
                            ? 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=500&auto=format&fit=crop'
                            : 'https://images.unsplash.com/photo-1513519247388-19345150d627?q=80&w=500&auto=format&fit=crop',
                        voteAverage: 10,
                        reason: {
                            type: 'popular',
                            description: 'Sugestão Amazon'
                        }
                    },
                    {
                        id: `amazon-${filter}-2`,
                        apiId: `amazon-${filter}-2`,
                        type: 'movie' as any,
                        title: `Busca por: ${randomTerm}`,
                        overview: `Encontre ${randomTerm} e muito mais com curadoria Suggesto.`,
                        posterPath: filter === 'gifts'
                            ? 'https://images.unsplash.com/photo-1513885535751-8b9238389911?q=80&w=500&auto=format&fit=crop'
                            : 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=500&auto=format&fit=crop',
                        voteAverage: 9.5,
                        reason: {
                            type: 'popular',
                            description: 'Popular na Amazon'
                        }
                    }
                ]
                setRecommendations(amazonRecs)
            } else if (activeGenreId) {
                // GENRE DISCOVERY MODE
                let genreResults: any[] = []

                const fetchMovies = (filter === 'all' || filter === 'movie')
                    ? discoverMoviesByGenre(activeGenreId)
                    : Promise.resolve({ results: [] })

                const fetchTv = (filter === 'all' || filter === 'tv')
                    ? discoverTvByGenre(activeGenreId)
                    : Promise.resolve({ results: [] })

                const fetchBooks = (filter === 'all' || filter === 'book')
                    ? discoverBooksByGenre(activeGenreId)
                    : Promise.resolve({ results: [] })

                const fetchGames = (filter === 'all' || filter === 'game')
                    ? discoverGamesByGenre(activeGenreId)
                    : Promise.resolve({ results: [] })

                const [movies, tv, books, games] = await Promise.all([
                    fetchMovies.catch(e => { console.warn("Movies fetch failed", e); return { results: [] }; }),
                    fetchTv.catch(e => { console.warn("TV fetch failed", e); return { results: [] }; }),
                    fetchBooks.catch(e => { console.warn("Books fetch failed", e); return { results: [] }; }),
                    fetchGames.catch(e => { console.warn("Games fetch failed", e); return { results: [] }; })
                ])

                genreResults = [
                    ...movies.results,
                    ...tv.results,
                    ...books.results,
                    ...games.results
                ].map(item => ({
                    ...item,
                    reason: {
                        description: `Gênero: ${activeGenreId}`,
                        type: 'genre'
                    }
                }))

                setRecommendations(genreResults.sort((a, b) => {
                    const scoreA = (a.metacritic || (a.voteAverage ? a.voteAverage * 10 : 0))
                    const scoreB = (b.metacritic || (b.voteAverage ? b.voteAverage * 10 : 0))
                    return scoreB - scoreA
                }))

            } else {
                // PERSONALIZED RECOMMENDATION MODE
                let recs: RecommendationItem[] = []
                const { data: profile }: any = await (supabase as any).from('profiles').select('preferences').eq('id', user.id).single()
                const prefs = profile?.preferences

                if (prefs?.genres && Array.isArray(prefs.genres) && prefs.genres.length > 0) {
                    const genresToFetch = prefs.genres.slice(0, 4)
                    let hybridRecs: any[] = []

                    for (const genre of genresToFetch) {
                        const [m, b, g] = await Promise.all([
                            discoverMoviesByGenre(genre),
                            discoverBooksByGenre(genre),
                            discoverGamesByGenre(genre)
                        ])
                        hybridRecs.push(...m.results.slice(0, 3).map((i: any) => ({ ...i, reason: { description: `Porque você gosta de ${genre}`, type: 'genre' } })))
                        hybridRecs.push(...b.results.slice(0, 3).map((i: any) => ({ ...i, reason: { description: `Porque você gosta de ${genre}`, type: 'genre' } })))
                        hybridRecs.push(...g.results.slice(0, 3).map((i: any) => ({ ...i, reason: { description: `Porque você gosta de ${genre}`, type: 'genre' } })))
                    }

                    const seenHybrid = new Set()
                    const uniqueHybrid: RecommendationItem[] = []
                    hybridRecs.forEach(item => {
                        if (!seenHybrid.has(item.id)) {
                            seenHybrid.add(item.id)
                            uniqueHybrid.push(item)
                        }
                    })
                    recs = uniqueHybrid.sort((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0))
                }

                try {
                    const engineRecs = await getRecommendations(user.id, filter !== 'all' && filter !== 'library' ? filter as any : undefined)
                    const seenIds = new Set(recs.map(r => r.id))
                    engineRecs.forEach(r => {
                        if (!seenIds.has(r.id)) {
                            recs.push(r)
                            seenIds.add(r.id)
                        }
                    })
                } catch (e) {
                    console.warn("Engine failed", e)
                }

                if (recs.length === 0) {
                    const trend = filter === 'game' ? await getTrendingGames() : await getTrending('movie')
                    recs = trend.map(t => ({ ...t, reason: { type: 'popular', description: 'Em alta' } }))
                }

                setRecommendations(recs)
            }

        } catch (error) {
            console.error("Failed to load dashboard data", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [user, filter, activeGenreId, isKidsMode, allowedRatings])

    const filteredRecommendations = (recommendations || []).filter(item => {
        if (!item) return false
        return filter === 'all' || filter === 'library' || filter === 'gifts' || filter === 'lifestyle' || item.type === filter
    })

    const featuredItem = filteredRecommendations[0]

    return (
        <div className="min-h-screen bg-transparent text-white pb-32">
            {/* Hero Section */}
            {featuredItem && !activeGenreId && filter === 'all' && (
                <div className="relative w-full h-[70vh] min-h-[500px] mb-12 overflow-hidden">
                    {/* Background Backdrop */}
                    <div className="absolute inset-0">
                        <MediaImage
                            src={featuredItem.posterPath}
                            alt=""
                            type={featuredItem.type}
                            className="w-full h-full object-cover scale-110 blur-xl opacity-30"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/60 to-slate-950" />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-12 sm:pb-20">
                        <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full backdrop-blur-md">
                                    Destaque de Hoje
                                </span>
                                {featuredItem.voteAverage && (
                                    <span className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                                        <Star size={14} fill="currentColor" /> {featuredItem.voteAverage.toFixed(1)}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none drop-shadow-2xl">
                                {featuredItem.title}
                            </h1>

                            <p className="text-lg text-slate-300 line-clamp-3 max-w-xl drop-shadow-md font-medium leading-relaxed">
                                {featuredItem.overview}
                            </p>

                            <div className="flex flex-wrap gap-4 pt-2">
                                <button
                                    onClick={() => setSelectedItem(featuredItem)}
                                    className="px-8 py-4 bg-white text-black hover:bg-blue-500 hover:text-white rounded-2xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-xl flex items-center gap-2 group"
                                >
                                    Ficha Completa
                                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => navigate(`/similar/${featuredItem.type}/${featuredItem.apiId}`)}
                                    className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold transition-all backdrop-blur-xl border border-white/10 hover:border-white/20 flex items-center gap-2"
                                >
                                    Mais Similares
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`max-w-7xl mx-auto space-y-16 ${!featuredItem || activeGenreId || filter !== 'all' ? 'pt-8' : ''}`}>
                {/* Search & Filters */}
                <div className="px-6 space-y-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="w-full sm:w-auto overflow-x-auto no-scrollbar">
                            <div className="flex p-1.5 bg-slate-900/40 rounded-2xl border border-white/5 backdrop-blur-xl">
                                {[
                                    { id: 'all', label: 'Tudo' },
                                    { id: 'movie', label: 'Filmes' },
                                    { id: 'tv', label: 'Séries' },
                                    { id: 'book', label: 'Livros' },
                                    !isKidsMode && { id: 'game', label: 'Games' },
                                    !isKidsMode && { id: 'gifts', label: 'Presentes' },
                                    !isKidsMode && { id: 'lifestyle', label: 'Lifestyle' },
                                    { id: 'library', label: 'Biblioteca' },
                                ].filter(Boolean).map((tab: any) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => navigate(`/browse/${tab.id}`)}
                                        className={`whitespace-nowrap py-2.5 px-6 rounded-xl text-sm font-bold transition-all ${filter === tab.id
                                            ? 'bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)] scale-105 z-10'
                                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {!isKidsMode && (
                            <div className="w-full sm:w-72">
                                <SearchBox
                                    onSelect={(item) => setSelectedItem({ type: item.type, id: item.id })}
                                    activeFilter={filter as any}
                                />
                            </div>
                        )}
                    </div>
                </div>



                {/* Recommendations / Library */}
                <section className="px-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                            <Star className="text-blue-500" size={20} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">
                                {filter === 'library' ? 'Itens Salvos' : activeGenreId ? `Explorar: ${genreLabel}` : filter === 'game' ? 'Explorar Games' : filter === 'book' ? 'Explorar Livros' : 'Especialmente para Você'}
                            </h2>
                            <p className="text-sm text-slate-500 font-medium">Sugestões baseadas nas suas preferências</p>
                        </div>
                    </div>

                    {(filter === 'library' ? libraryLoading : loading) ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <div className="relative">
                                <div className="absolute inset-0 blur-2xl bg-blue-500/20 animate-pulse rounded-full" />
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 relative" />
                            </div>
                            <p className="mt-8 text-slate-400 font-bold tracking-wide uppercase text-xs animate-pulse">
                                {filter === 'library' ? 'Organizando sua biblioteca...' : 'Buscando as melhores sugestões...'}
                            </p>
                        </div>
                    ) : (filter === 'library' ? libraryItems : filteredRecommendations).length === 0 ? (
                        <div className="py-20">
                            <EmptyState
                                title={filter === 'library' ? 'Sua biblioteca está vazia' : 'Nada encontrado'}
                                description={filter === 'library'
                                    ? 'Comece a salvar filmes, livros e jogos para vê-los aqui.'
                                    : 'Não conseguimos encontrar recomendações com esses filtros no momento.'
                                }
                                action={filter !== 'library' ? {
                                    label: 'Mudar Preferências',
                                    onClick: () => navigate('/settings')
                                } : undefined}
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                            {(filter === 'library' ? libraryItems : filteredRecommendations).map((item: any) => (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        if (item.id.startsWith('amazon-')) {
                                            const term = item.title.includes('Busca por') ? item.title.replace('Busca por: ', '') : item.title
                                            window.open(`https://www.amazon.com.br/s?k=${encodeURIComponent(term)}&tag=suggesto-20`, '_blank')
                                        } else {
                                            setSelectedItem(item)
                                        }
                                    }}
                                    className="group flex flex-col cursor-pointer"
                                >
                                    <div className="relative aspect-[2/3] bg-slate-900 rounded-[2rem] overflow-hidden mb-4 border border-white/5 transition-all duration-500 shadow-xl group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(59,130,246,0.15)] group-hover:-translate-y-2 group-hover:scale-[1.03]">
                                        <MediaImage src={item.posterPath} alt={item.title} type={item.type} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />

                                        <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-black text-yellow-500 flex items-center gap-1 border border-white/10 shadow-lg">
                                            <Star size={10} fill="currentColor" /> {(item.voteAverage || 0).toFixed(1)}
                                        </div>

                                        <div className="absolute top-4 left-4 z-10 max-w-[calc(100%-80px)]">
                                            <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider backdrop-blur-md border shadow-lg truncate ${item.reason.type === 'similarity' ? 'bg-blue-500/30 text-blue-200 border-blue-500/30' :
                                                item.reason.type === 'genre' ? 'bg-purple-500/30 text-purple-200 border-purple-500/30' :
                                                    item.reason.type === 'popular' ? 'bg-amber-500/30 text-amber-200 border-amber-500/30' :
                                                        'bg-emerald-500/30 text-emerald-200 border-emerald-500/30'
                                                }`}>
                                                {item.reason.description}
                                            </div>
                                        </div>

                                        <div className="absolute bottom-4 left-4 right-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex items-center gap-1.5 p-1 px-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-md text-[8px] font-black text-white uppercase tracking-tighter">
                                                    {item.type === 'movie' ? <Film size={8} /> : item.type === 'tv' ? <Tv size={8} /> : item.type === 'book' ? <Book size={8} /> : <Gamepad2 size={8} />}
                                                    {item.type === 'movie' ? 'Filme' : item.type === 'tv' ? 'Série' : item.type === 'book' ? 'Livro' : 'Jogo'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="text-white font-black text-sm leading-tight line-clamp-2 px-2 group-hover:text-blue-400 transition-colors">
                                        {item.title}
                                    </h3>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {selectedItem && (
                <MediaDetailsModal
                    type={selectedItem.type}
                    id={selectedItem.id}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </div>
    )
}
