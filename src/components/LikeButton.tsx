import { useState, useEffect } from 'react'
import { ThumbsUp } from 'lucide-react'
import { toggleCommunityLike, checkLiked, getLikeCount } from '../services/social'
import type { MediaItem } from '../types/media'
import { useAuth } from '../context/AuthContext'

interface LikeButtonProps {
    item: MediaItem
    className?: string
}

export function LikeButton({ item, className = "" }: LikeButtonProps) {
    const { user } = useAuth()
    const [liked, setLiked] = useState(false)
    const [count, setCount] = useState(0)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        getLikeCount(item.apiId).then(setCount)

        if (user && item.apiId) {
            checkLiked(user.id, item.apiId).then(setLiked)
        }
    }, [user, item.apiId])

    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!user || loading) return

        // Optimistic update
        setLoading(true)
        const newState = !liked
        setLiked(newState)
        setCount(prev => newState ? prev + 1 : Math.max(0, prev - 1))

        try {
            const finalState = await toggleCommunityLike(user.id, item)
            // Re-sync if state mismatch (rare) or just accept optimistic
            if (finalState !== newState) {
                setLiked(finalState)
                setCount(prev => finalState ? prev + 1 : Math.max(0, prev - 1))
            }
        } catch (error) {
            setLiked(!newState)
            setCount(prev => !newState ? prev + 1 : Math.max(0, prev - 1))
            console.error("Failed to toggle like", error)
        } finally {
            setLoading(false)
        }
    }

    if (!user) return null

    return (
        <button
            onClick={handleToggle}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border ${liked
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'
                } ${className}`}
            title="Curtir"
        >
            <ThumbsUp size={16} fill={liked ? "currentColor" : "none"} />
            <span className="text-sm font-medium">{count}</span>
        </button>
    )
}
