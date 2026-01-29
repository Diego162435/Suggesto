import { supabase } from './supabase'
import { MediaItem } from '../types/media'

export interface LikeItem {
    id: string
    user_id: string
    media_id: string
    media_type: 'movie' | 'book' | 'tv'
    title: string
    poster_path: string | null
    vote_average?: number
    created_at: string
}

export async function toggleLike(userId: string, item: MediaItem) {
    // 1. Check if already liked
    const { data: existing } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('media_id', item.apiId)
        .maybeSingle()

    if (existing) {
        // Unlike
        const { error } = await supabase
            .from('likes')
            .delete()
            .eq('id', (existing as any).id)

        if (error) throw error
        return false // Liked = false
    } else {
        // Like
        const { error } = await supabase
            .from('likes')
            .insert({
                user_id: userId,
                media_id: item.apiId,
                media_type: item.type,
                title: item.title,
                poster_path: item.posterPath,
                vote_average: item.voteAverage
            } as any)

        if (error) throw error
        return true // Liked = true
    }
}

export async function checkIsLiked(userId: string, mediaId: string) {
    const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('media_id', mediaId)
        .maybeSingle()
    return !!data
}

export async function getUserLikes(userId: string): Promise<LikeItem[]> {
    const { data, error } = await supabase
        .from('likes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return (data as any[]) || []
}
