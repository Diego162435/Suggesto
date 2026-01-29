import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Film, Book, Tv, ArrowRight, Gamepad2, TrendingUp, Star, ThumbsUp } from 'lucide-react'
import { getTrending } from '../../services/tmdb'
import { getTopCommunityContent } from '../../services/social'
import { MediaImage } from '../../components/MediaImage'
import { MediaDetailsModal } from '../details/MediaDetailsModal'

export function PremiumHomePage() {
    const navigate = useNavigate()
    const [trendingContent, setTrendingContent] = useState<any[]>([])
    const [topCommunity, setTopCommunity] = useState<any[]>([])
    const [selectedItem, setSelectedItem] = useState<{ type: string, id: string } | null>(null)
    const [loading, setLoading] = useState(true)
    const [currentSlide, setCurrentSlide] = useState(0)

    const tutorialSlides = [
        {
            title: "Descubra Filmes e Séries Incríveis",
            description: "Explore milhares de títulos e encontre sua próxima obsessão",
            gradient: "from-blue-600 to-purple-600",
            icon: "🎬"
        },
        {
            title: "Livros que Vão Te Surpreender",
            description: "De best-sellers a joias escondidas, temos tudo para você",
            gradient: "from-emerald-600 to-teal-600",
            icon: "📚"
        },
        {
            title: "Games Épicos Te Esperam",
            description: "Descubra os jogos mais incríveis e viciantes",
            gradient: "from-indigo-600 to-blue-600",
            icon: "🎮"
        },
        {
            title: "Recomendações Personalizadas",
            description: "Quanto mais você usa, melhores ficam as sugestões",
            gradient: "from-rose-600 to-pink-600",
            icon: "✨"
        }
    ]

    const categories = [
        { id: 'movie', label: 'Filmes', icon: Film, color: 'from-blue-500 to-blue-600', iconColor: 'text-blue-400' },
        { id: 'tv', label: 'Séries', icon: Tv, color: 'from-purple-500 to-purple-600', iconColor: 'text-purple-400' },
        { id: 'book', label: 'Livros', icon: Book, color: 'from-emerald-500 to-emerald-600', iconColor: 'text-emerald-400' },
        { id: 'game', label: 'Games', icon: Gamepad2, color: 'from-indigo-500 to-indigo-600', iconColor: 'text-indigo-400' },
    ]

    useEffect(() => {
        async function loadContent() {
            try {
                const [trending, community] = await Promise.all([
                    getTrending('movie').catch(() => []),
                    getTopCommunityContent(6).catch(() => [])
                ])

                setTrendingContent(trending.slice(0, 12))
                setTopCommunity(community)
            } catch (error) {
                console.error('Error loading home content:', error)
            } finally {
                setLoading(false)
            }
        }

        loadContent()
    }, [])

    // Auto-rotate carousel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % tutorialSlides.length)
        }, 5000) // Change slide every 5 seconds

        return () => clearInterval(interval)
    }, [tutorialSlides.length])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950">
                <div className="relative">
                    <div className="absolute inset-0 blur-2xl bg-blue-500/20 animate-pulse rounded-full" />
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 relative" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-transparent text-white pb-32">
            {/* Tutorial Carousel */}
            <div className="relative w-full px-6 mb-16">
                <div className="relative max-w-7xl mx-auto h-[280px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950">

                    {tutorialSlides.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                                }`}
                        >
                            {/* Gradient overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-10`} />

                            <div className="relative h-full flex items-center justify-between px-8 md:px-12 gap-6">
                                {/* Icon */}
                                <div className="flex-shrink-0 text-6xl md:text-7xl">
                                    {slide.icon}
                                </div>

                                {/* Content */}
                                <div className="flex-1 text-left">
                                    <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-2 text-white">
                                        {slide.title}
                                    </h2>
                                    <p className="text-sm md:text-base text-slate-400 max-w-xl">
                                        {slide.description}
                                    </p>
                                </div>

                                {/* Button */}
                                <div className="flex-shrink-0 hidden md:block">
                                    <button
                                        onClick={() => navigate('/browse/all')}
                                        className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full font-bold text-sm transition-all hover:scale-105 shadow-lg flex items-center gap-2"
                                    >
                                        Explorar
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Slide Indicators */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {tutorialSlides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide
                                        ? 'bg-white w-8'
                                        : 'bg-white/30 w-1.5 hover:bg-white/50'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 space-y-20">

                {/* Top Community */}
                {topCommunity.length > 0 && (
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/20">
                                    <ThumbsUp className="text-green-500" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black tracking-tight">Top da Comunidade</h2>
                                    <p className="text-slate-500 font-medium">Os favoritos da nossa rede</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                            {topCommunity.map((item, index) => (
                                <div
                                    key={`top-${item.media_type}-${item.media_id}`}
                                    onClick={() => setSelectedItem({ type: item.media_type, id: item.media_id })}
                                    className="group cursor-pointer"
                                >
                                    <div className="relative aspect-[2/3] bg-slate-900 rounded-3xl overflow-hidden mb-4 border border-white/5 group-hover:border-green-500/50 transition-all duration-500 shadow-xl group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(74,222,128,0.1)] group-hover:-translate-y-2">
                                        <div className="absolute top-4 left-4 z-20 bg-green-500 text-black px-3 py-2 rounded-full text-sm font-black shadow-lg">
                                            #{index + 1}
                                        </div>
                                        <MediaImage
                                            src={item.poster_path}
                                            alt={item.title}
                                            type={item.media_type}
                                            className="w-full h-full transform transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />
                                    </div>
                                    <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 px-2 group-hover:text-green-400 transition-colors text-center">
                                        {item.title}
                                    </h3>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Trending */}
                {trendingContent.length > 0 && (
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                                    <TrendingUp className="text-rose-500" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black tracking-tight">Em Alta Agora</h2>
                                    <p className="text-slate-500 font-medium">O que todo mundo está assistindo</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                            {trendingContent.map((item) => (
                                <div
                                    key={`trending-${item.id}`}
                                    onClick={() => setSelectedItem({ type: item.type, id: item.id })}
                                    className="group cursor-pointer"
                                >
                                    <div className="relative aspect-[2/3] bg-slate-900 rounded-3xl overflow-hidden mb-4 border border-white/5 group-hover:border-rose-500/50 transition-all duration-500 shadow-xl group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(244,63,94,0.1)] group-hover:-translate-y-2">
                                        <MediaImage
                                            src={item.posterPath}
                                            alt={item.title}
                                            type={item.type}
                                            className="w-full h-full transform transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />
                                        {item.voteAverage && (
                                            <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-xs font-black text-yellow-500 flex items-center gap-1 border border-white/10 shadow-lg">
                                                <Star size={12} fill="currentColor" /> {item.voteAverage.toFixed(1)}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 px-2 group-hover:text-rose-500 transition-colors text-center">
                                        {item.title}
                                    </h3>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Categories Grid - Smaller and at the bottom */}
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <div className="flex items-center gap-2 mb-6">
                        <Sparkles className="text-yellow-500" size={20} />
                        <h2 className="text-2xl font-bold tracking-tight">Explore por Categoria</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => navigate(`/browse/${cat.id}`)}
                                className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-slate-900 to-slate-800 border border-white/5 hover:border-white/20 transition-all duration-300 hover:scale-105"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                                <div className="relative flex items-center gap-4">
                                    <div className={`p-3 rounded-xl bg-white/5 group-hover:bg-white/10 transition-all duration-300`}>
                                        <cat.icon size={28} className={cat.iconColor} />
                                    </div>
                                    <span className="font-bold text-lg text-white">
                                        {cat.label}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
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
