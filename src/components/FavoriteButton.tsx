import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { toggleFavorite, checkIsFavorite } from '../services/favorites'
import type { MediaItem } from '../types/media'
import { useAuth } from '../context/AuthContext'

interface FavoriteButtonProps {
    item: MediaItem
    className?: string
    iconSize?: number
}

export function FavoriteButton({ item, className = "", iconSize = 20 }: FavoriteButtonProps) {
    const { user } = useAuth()
    const [isFavorite, setIsFavorite] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user && item.apiId) {
            checkIsFavorite(user.id, item.apiId).then(setIsFavorite)
        }
    }, [user, item.apiId])

    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!user || loading) return

        setLoading(true)
        const newState = !isFavorite
        setIsFavorite(newState)

        try {
            const finalState = await toggleFavorite(user.id, item)
            setIsFavorite(finalState)
        } catch (error) {
            setIsFavorite(!newState)
            console.error("Failed to toggle favorite", error)
        } finally {
            setLoading(false)
        }
    }

    if (!user) return null

    return (
        <button
            onClick={handleToggle}
            className={`transition-all active:scale-95 ${className} ${isFavorite ? 'text-rose-500' : 'text-slate-400 hover:text-white'}`}
            title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
            <Heart size={iconSize} fill={isFavorite ? "currentColor" : "none"} />
        </button>
    )
}
