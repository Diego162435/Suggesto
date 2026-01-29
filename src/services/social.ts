import { supabase } from './supabase'
import { MediaItem } from '../types/media'

export interface CommentItem {
    id: string
    user_id: string
    media_id: string
    content: string
    created_at: string
    profiles: {
        username: string
        avatar_url: string | null
    }
}

export interface LikeItem {
    id: string
    user_id: string
    media_id: string
    media_type: 'movie' | 'book' | 'tv' | string
    title: string
    created_at: string
}

// --- LIKES (COMMUNITY THUMBS UP) ---

export async function toggleCommunityLike(userId: string, item: MediaItem) {
    const { data: existing } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('media_id', item.id)
        .maybeSingle()

    if (existing) {
        await supabase.from('likes').delete().eq('id', (existing as any).id)
        return false
    } else {
        await supabase.from('likes').insert({
            user_id: userId,
            media_id: item.id,
            media_type: item.type,
            title: item.title,
            poster_path: item.posterPath,
            vote_average: item.voteAverage
        } as any)
        return true
    }
}

export async function checkLiked(userId: string, mediaId: string) {
    const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('media_id', mediaId)
        .maybeSingle()
    return !!data
}

export async function getLikeCount(mediaId: string): Promise<number> {
    const { count } = await supabase
        .from('likes')
        .select('id', { count: 'exact', head: true })
        .eq('media_id', mediaId)

    return count || 0
}

export async function getTopCommunityContent(limit = 10, mediaType?: string) {
    let query = supabase
        .from('top_community_content')
        .select('*')

    if (mediaType) {
        query = query.eq('media_type', mediaType)
    }

    const { data, error } = await query.limit(limit)

    if (error) {
        // Fallback if view doesn't exist or permissions issue
        // We can't easily aggregate on client, so return empty or simple fetch
        console.warn('Top community view error', error)
        return []
    }
    return (data as any[]) || []
}


// --- COMMENTS ---

export async function getComments(mediaId: string): Promise<CommentItem[]> {
    const { data, error } = await supabase
        .from('comments')
        .select(`
            *,
            profiles (username, avatar_url)
        `)
        .eq('media_id', mediaId)
        .order('created_at', { ascending: false })

    if (error) throw error
    // Type assertion because Supabase join return type inference can be tricky
    return data as any as CommentItem[]
}

export async function addComment(userId: string, mediaId: string, mediaType: string, content: string) {
    const { data, error } = await supabase
        .from('comments')
        .insert({
            user_id: userId,
            media_id: mediaId,
            media_type: mediaType,
            content: content
        } as any)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteComment(commentId: string) {
    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

    if (error) throw error
}

export async function reportComment(reporterId: string, commentId: string, reason: string) {
    const { error } = await supabase
        .from('reports')
        .insert({
            reporter_id: reporterId,
            comment_id: commentId,
            reason: reason
        } as any)

    if (error) throw error
}
