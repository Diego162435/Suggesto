import { supabase } from './supabase'
import { MediaItem } from '../types/media'

export interface FavoriteItem {
    id: string
    user_id: string
    media_id: string
    media_type: 'movie' | 'book' | 'tv' | string
    title: string
    poster_path: string | null
    created_at: string
}

export async function toggleFavorite(userId: string, item: MediaItem) {
    const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('media_id', item.apiId)
        .maybeSingle()

    if (existing) {
        await supabase.from('favorites').delete().eq('id', (existing as any).id)
        return false // Removed
    } else {
        await supabase.from('favorites').insert({
            user_id: userId,
            media_id: item.apiId,
            media_type: item.type,
            title: item.title,
            poster_path: item.posterPath,
            vote_average: item.voteAverage
        } as any)
        return true // Added
    }
}

export async function checkIsFavorite(userId: string, mediaId: string) {
    const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('media_id', mediaId)
        .maybeSingle()
    return !!data
}

export async function getUserFavorites(userId: string): Promise<FavoriteItem[]> {
    const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return (data as any[]) || []
}
