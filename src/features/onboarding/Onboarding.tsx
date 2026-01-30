import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { GENRES } from '../../data/genres'
import { GenreCard } from './GenreCard'

export function Onboarding() {
    const [selectedGenres, setSelectedGenres] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const { user } = useAuth()
    const { showToast } = useToast()
    const navigate = useNavigate()

    // Toggle genre selection
    const toggleGenre = (genreId: string) => {
        setSelectedGenres(prev =>
            prev.includes(genreId)
                ? prev.filter(id => id !== genreId)
                : [...prev, genreId]
        )
    }

    const handleContinue = async () => {
        if (!user) {
            console.error('Onboarding: No user found.');
            return;
        }
        if (selectedGenres.length === 0) {
            showToast('Selecione pelo menos uma categoria!', 'warning');
            return;
        }

        console.log('Onboarding: Saving preferences...', { userId: user.id, genres: selectedGenres });
        setLoading(true)

        try {
            // Save preferences to profiles table with a safety timeout
            const savePromise = supabase
                .from('profiles')
                .upsert({
                    id: (user as any).id,
                    preferences: {
                        genres: selectedGenres,
                        onboarding_completed: true,
                        completed_at: new Date().toISOString()
                    },
                    updated_at: new Date().toISOString()
                } as any, { onConflict: 'id' } as any);

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Save timeout')), 4000)
            );

            const { error }: any = await Promise.race([savePromise, timeoutPromise]);

            if (error) {
                console.error('Onboarding: Supabase error saving preferences:', error);

                if (error.code === '23503') {
                    showToast('Sessão expirada. Por favor, entre novamente.', 'error');
                    await supabase.auth.signOut();
                    navigate('/auth');
                    return;
                }

                // If it's a schema error (column missing), show warning but let them in
                console.warn('Onboarding: Saving failed, likely due to missing columns. Proceeding anyway...');
                showToast('Aviso: Não foi possível salvar no banco (colunas faltando), mas vamos entrar!', 'warning');

                // Set local cache so ProtectedRoute lets them through immediately
                localStorage.setItem(`onboarding_complete_${(user as any).id}`, 'true');

                // Wait a bit so they can read the toast, then go to home
                setTimeout(() => {
                    navigate('/', { replace: true });
                }, 1000);
                return;
            }

            console.log('Onboarding: Preferences saved successfully.');
            showToast('Preferências salvas com sucesso!', 'success')

            // Set local cache
            localStorage.setItem(`onboarding_complete_${(user as any).id}`, 'true');

            // Wait a bit and then redirect
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 500);
        } catch (error) {
            console.error('Onboarding: Unexpected error:', error);
            showToast('Entrando em modo temporário...', 'info');

            // Set local cache to bypass blockage
            localStorage.setItem(`onboarding_complete_${(user as any).id}`, 'true');

            setTimeout(() => {
                navigate('/', { replace: true });
            }, 800);
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 font-sans relative overflow-x-hidden selection:bg-blue-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-400 rounded-full text-sm font-bold mb-6 border border-white/10 shadow-lg backdrop-blur-sm">
                        <Sparkles size={14} />
                        Personalização
                    </span>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                        O que você <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">curte?</span>
                    </h1>
                    <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
                        Selecione suas categorias favoritas para montarmos um feed exclusivo para você.
                    </p>
                </div>

                {/* Genres Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mb-24">
                    {GENRES.map((genre) => (
                        <GenreCard
                            key={genre.id}
                            {...genre}
                            selected={selectedGenres.includes(genre.id)}
                            onClick={() => toggleGenre(genre.id)}
                        />
                    ))}
                </div>

                {/* Floating Action Bar */}
                <div className={`
                    fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500
                    ${selectedGenres.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}
                `}>
                    <button
                        onClick={handleContinue}
                        disabled={loading}
                        className="
                            bg-white text-slate-950 font-bold px-8 py-4 rounded-full text-lg shadow-[0_0_40px_rgba(255,255,255,0.3)]
                            hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed
                        "
                    >
                        {loading ? 'Salvando...' : `Salvar Preferências (${selectedGenres.length})`}
                        {!loading && <ArrowRight size={20} />}
                    </button>

                </div>

                <button
                    onClick={() => { supabase.auth.signOut(); navigate('/auth'); }}
                    className="fixed top-6 right-6 z-50 text-slate-400 hover:text-white text-xs font-medium uppercase tracking-wider px-4 py-2 bg-slate-900/80 rounded-full backdrop-blur-md border border-white/10 transition-colors hover:bg-slate-800"
                >
                    Sair da conta
                </button>
            </div>
        </div>
    )
}

