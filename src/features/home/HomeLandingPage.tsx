import { useNavigate } from 'react-router-dom'
import { Sparkles, Film, Book, Tv, ArrowRight, Gamepad2, Gift } from 'lucide-react'

export function HomeLandingPage() {
    const navigate = useNavigate()

    const categories = [
        { id: 'movie', label: 'Filmes', icon: Film, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { id: 'book', label: 'Livros', icon: Book, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { id: 'tv', label: 'Séries', icon: Tv, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { id: 'game', label: 'Games', icon: Gamepad2, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
        { id: 'gifts', label: 'Presentes', icon: Gift, color: 'text-rose-400', bg: 'bg-rose-400/10' }, // Placeholder for future
    ]

    return (
        <div className="min-h-screen bg-transparent text-white relative overflow-hidden flex flex-col items-center justify-center p-6">

            {/* Ambient Background */}
            <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />

            <div className="max-w-4xl w-full space-y-16 relative z-10 text-center">

                {/* Hero */}
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-800 bg-slate-900/50 backdrop-blur-sm text-sm text-slate-400 font-medium">
                        <Sparkles size={16} className="text-yellow-500" />
                        <span>O Hub Definitivo de Curadoria</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
                        Sugira <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-rose-500">Qualquer Coisa</span>
                        <br />
                        Para Qualquer Momento.
                    </h1>

                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Não gaste horas escolhendo. Diga o que você sente ou o que precisa, e nós encontramos a escolha perfeita — de filmes cult a cafeteiras italianas.
                    </p>
                </div>

                {/* Quick Action Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => navigate(`/browse/${cat.id}`)}
                            className={`group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm hover:border-slate-700 hover:bg-slate-800 transition-all cursor-pointer`}
                        >
                            <div className={`p-3 rounded-xl ${cat.bg} group-hover:scale-110 transition-transform duration-300`}>
                                <cat.icon size={28} className={cat.color} />
                            </div>
                            <span className="font-semibold text-slate-300 group-hover:text-white">{cat.label}</span>
                        </button>
                    ))}
                </div>

                {/* Main CTA */}
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    <button
                        onClick={() => navigate('/browse/all')}
                        className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-950 rounded-full font-bold text-lg hover:bg-slate-200 transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                    >
                        <span>Explorar Tudo</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="mt-4 text-xs font-medium text-slate-600 uppercase tracking-widest">Pressione Space para Busca Rápida</p>
                </div>

            </div>
        </div>
    )
}
