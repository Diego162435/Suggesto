import { useState } from 'react'
import { MediaItem } from '../../types/media'
import { X, Star } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import { MediaImage } from '../../components/MediaImage'

interface RatingModalProps {
    item: MediaItem
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function RatingModal({ item, isOpen, onClose, onSuccess }: RatingModalProps) {
    const { user } = useAuth()
    const [rating, setRating] = useState(0)
    const [pace, setPace] = useState<'slow' | 'medium' | 'fast' | ''>('')
    const [genre, setGenre] = useState('') // Main subjective genre
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async () => {
        if (!rating || !pace || !genre || !user) return

        setLoading(true)
        try {
            const { error } = await (supabase as any).from('user_ratings').insert({
                user_id: user.id,
                media_id: item.apiId,
                media_type: item.type,
                title: item.title,
                poster_path: item.posterPath,
                rating,
                pace,
                genre
            })

            if (error) throw error
            onSuccess()
            onClose()
        } catch (error) {
            console.error('Error saving rating:', error)
            alert('Erro ao salvar avaliação')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-800 flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                        Avaliar {item.type === 'movie' ? 'Filme' : 'Livro'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                    {/* Item Info Preview */}
                    <div className="flex gap-4">
                        <div className="w-16 h-24 bg-slate-800 rounded-lg flex-shrink-0 overflow-hidden">
                            <MediaImage
                                src={item.posterPath}
                                alt={item.title}
                                type={item.type}
                                className="w-full h-full"
                            />
                        </div>
                        <div>
                            <h4 className="font-semibold text-white text-lg">{item.title}</h4>
                            <p className="text-sm text-slate-400 line-clamp-2">{item.overview}</p>
                        </div>
                    </div>

                    {/* Stars */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Nota</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={`p-1 transition-colors ${rating >= star ? 'text-yellow-400' : 'text-slate-600 hover:text-yellow-400/50'}`}
                                >
                                    <Star size={32} fill={rating >= star ? "currentColor" : "none"} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pace */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Ritmo</label>
                        <div className="flex gap-3">
                            {['Lento', 'Médio', 'Rápido'].map((label, idx) => {
                                const value = ['slow', 'medium', 'fast'][idx] as 'slow' | 'medium' | 'fast'
                                return (
                                    <button
                                        key={value}
                                        onClick={() => setPace(value)}
                                        className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${pace === value
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : 'border-slate-700 text-slate-400 hover:border-slate-600'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Genre Tag */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Selecione o Gênero Principal (na sua opinião)</label>
                        <select
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Selecione...</option>
                            <option value="Ação/Aventura">Ação / Aventura</option>
                            <option value="Drama">Drama</option>
                            <option value="Comédia">Comédia</option>
                            <option value="Sci-Fi/Fantasia">Sci-Fi / Fantasia</option>
                            <option value="Terror/Suspense">Terror / Suspense</option>
                            <option value="Romance">Romance</option>
                            <option value="Documentário/Bio">Documentário / Biografia</option>
                            <option value="Técnico/Educativo">Técnico / Educativo</option>
                        </select>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !rating || !pace || !genre}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {loading && <div className="animate-spin mr-2 h-4 w-4 border-2 border-white/20 border-t-white rounded-full" />}
                        Confirmar Avaliação
                    </button>
                </div>
            </div>
        </div>
    )
}
