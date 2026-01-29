import { useState, useEffect } from 'react'
import { Film, Book, Gamepad2, Tv, Image as ImageIcon } from 'lucide-react'

interface MediaImageProps {
    src: string | null | undefined
    alt: string
    type: string // 'movie' | 'tv' | 'book' | 'game'
    className?: string
    priority?: boolean
}

export function MediaImage({ src, alt, type, className = "", priority = false }: MediaImageProps) {
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(true)

    // Reset error state if src changes
    useEffect(() => {
        setError(false)
        setLoading(true)
    }, [src])

    const getPlaceholder = () => {
        const iconSize = 40
        const containerStyle = "w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-500 p-4 border border-white/5"

        const content = (
            <>
                <div className="mb-3 opacity-20">
                    {type === 'movie' ? <Film size={iconSize} /> :
                        type === 'tv' ? <Tv size={iconSize} /> :
                            type === 'game' ? <Gamepad2 size={iconSize} /> :
                                type === 'book' ? <Book size={iconSize} /> :
                                    <ImageIcon size={iconSize} />}
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-600 text-center line-clamp-2 px-2">
                    {alt}
                </span>
                <div className="absolute inset-x-0 bottom-4 flex justify-center">
                    <div className="px-2 py-0.5 rounded bg-slate-950/50 backdrop-blur-md border border-white/5 text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                        Indisponível
                    </div>
                </div>
            </>
        )

        return (
            <div className={`${containerStyle} ${className} relative overflow-hidden transition-all duration-500`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                {content}
            </div>
        )
    }

    if (error || !src) {
        return getPlaceholder()
    }

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {loading && (
                <div className="absolute inset-0 bg-slate-900 animate-pulse flex items-center justify-center">
                    <ImageIcon className="text-slate-800 animate-bounce" size={24} />
                </div>
            )}
            <img
                src={src}
                alt={alt}
                loading={priority ? "eager" : "lazy"}
                className={`w-full h-full object-cover transition-all duration-700 ${loading ? 'scale-105 blur-sm opacity-0' : 'scale-100 blur-0 opacity-100'}`}
                referrerPolicy="no-referrer"
                onLoad={() => setLoading(false)}
                onError={() => {
                    setError(true)
                    setLoading(false)
                }}
            />
            {/* Subtle Gradient Overlay for consistency */}
            {!loading && <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />}
        </div>
    )
}
