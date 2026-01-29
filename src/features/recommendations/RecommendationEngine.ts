import { MediaItem, MediaType } from '../../types/media'
import { supabase } from '../../services/supabase'
import { searchMovies, searchTv, getTrending } from '../../services/tmdb'
import { searchBooks } from '../../services/books'
import { searchGames, getTrendingGames } from '../../services/games'

interface RecommendationReason {
    type: 'similarity' | 'genre' | 'pace' | 'popular'
    sourceTitle?: string
    description: string
}

export interface RecommendationItem extends MediaItem {
    reason: RecommendationReason
}

// Fallback recommendations for new users
export async function getFallbackRecommendations(mediaType?: MediaType): Promise<RecommendationItem[]> {
    try {
        const recommendations: RecommendationItem[] = []

        // --- 1. LOCAL LIBRARY PRIORITY ("Bons" jogos/livros/séries) ---
        // This satisfies the "Explorar" part with high-quality content
        try {
            // Games from local DB (Top Rated)
            if (!mediaType || mediaType === 'game') {
                const { data: localGames } = await supabase
                    .from('games')
                    .select('*')
                    .order('vote_average', { ascending: false })
                    .limit(20)

                if (localGames && localGames.length > 0) {
                    recommendations.push(...localGames.map((g: any) => ({
                        id: `db-game-${g.id}`,
                        apiId: g.id,
                        type: 'game' as const,
                        title: g.title,
                        overview: g.overview || '',
                        posterPath: g.poster_path,
                        releaseDate: g.release_date,
                        voteAverage: Number(g.vote_average) || 0,
                        metacritic: g.metacritic,
                        reason: {
                            type: 'popular' as const,
                            description: 'Obra-prima sugerida'
                        }
                    })))
                }
            }

            // Books from local DB
            if (!mediaType || mediaType === 'book') {
                const { data: localBooks } = await supabase
                    .from('books')
                    .select('*')
                    .order('vote_average', { ascending: false })
                    .limit(10)

                if (localBooks && localBooks.length > 0) {
                    recommendations.push(...localBooks.map((b: any) => ({
                        id: `db-book-${b.id}`,
                        apiId: b.id,
                        type: 'book' as const,
                        title: b.title,
                        overview: b.overview || '',
                        posterPath: b.poster_path,
                        releaseDate: b.release_date,
                        voteAverage: Number(b.vote_average) || 0,
                        reason: {
                            type: 'popular' as const,
                            description: 'Clássico da Literatura'
                        }
                    })))
                }
            }

            // Series from local DB
            if (!mediaType || mediaType === 'tv') {
                const { data: localSeries } = await supabase
                    .from('series')
                    .select('*')
                    .order('vote_average', { ascending: false })
                    .limit(10)

                if (localSeries && localSeries.length > 0) {
                    recommendations.push(...localSeries.map((s: any) => ({
                        id: `db-tv-${s.id}`,
                        apiId: s.id,
                        type: 'tv' as const,
                        title: s.title,
                        overview: s.overview || '',
                        posterPath: s.poster_path,
                        releaseDate: s.release_date,
                        voteAverage: Number(s.vote_average) || 0,
                        reason: {
                            type: 'popular' as const,
                            description: 'Série Imperdível'
                        }
                    })))
                }
            }
        } catch (e) {
            console.warn('Failed to fetch from local permanent library:', e)
        }

        // --- 2. TRENDING FROM APIs (Fill remaining space) ---

        // Only fill if we don't have enough "bons" items
        if (recommendations.length < 20) {
            // Get trending movies
            if (!mediaType || mediaType === 'movie') {
                try {
                    const trendingMovies = await getTrending('movie')
                    recommendations.push(...trendingMovies.slice(0, 10).map(item => ({
                        ...item,
                        reason: {
                            type: 'popular' as const,
                            description: 'Popular no momento'
                        }
                    })))
                } catch (e) {
                    console.warn('Failed to fetch trending movies:', e)
                }
            }

            // Get trending TV shows
            if (!mediaType || mediaType === 'tv') {
                try {
                    const trendingTv = await getTrending('tv')
                    recommendations.push(...trendingTv.slice(0, 5).map(item => ({
                        ...item,
                        reason: {
                            type: 'popular' as const,
                            description: 'Série em alta'
                        }
                    })))
                } catch (e) {
                    console.warn('Failed to fetch trending TV:', e)
                }
            }

            // Fallback for games if library is small
            if (recommendations.length < 15 && (!mediaType || mediaType === 'game')) {
                try {
                    const trendingGames = await getTrendingGames()
                    recommendations.push(...trendingGames.map(item => ({
                        ...item,
                        reason: {
                            type: 'popular' as const,
                            description: 'Jogo em destaque'
                        }
                    })))
                } catch (e) {
                    console.warn('Failed to fetch trending games:', e)
                }
            }
        }

        // Deduplicate by ID and Title
        const uniqueRecs: RecommendationItem[] = []
        const seenIds = new Set<string>()
        const seenTitles = new Set<string>()

        recommendations.forEach(item => {
            const normalizedTitle = item.title.toLowerCase()
            if (!seenIds.has(item.id) && !seenTitles.has(normalizedTitle)) {
                uniqueRecs.push(item)
                seenIds.add(item.id)
                seenTitles.add(normalizedTitle)
            }
        })

        // Final sort: Prioritize the local "bons" items at the start, then mix by rating
        const sorted = uniqueRecs.sort((a, b) => {
            // Give a massive boost to local items ('db-')
            const aIsLocal = a.id.startsWith('db-')
            const bIsLocal = b.id.startsWith('db-')
            if (aIsLocal && !bIsLocal) return -1
            if (!aIsLocal && bIsLocal) return 1

            const scoreA = (a.metacritic || (a.voteAverage ? a.voteAverage * 10 : 0))
            const scoreB = (b.metacritic || (b.voteAverage ? b.voteAverage * 10 : 0))
            return scoreB - scoreA
        })

        return sorted.slice(0, 24) // Slightly more results for the grid
    } catch (error) {
        console.error('Error fetching fallback recommendations:', error)
        return []
    }
}

export async function getRecommendations(userId: string, mediaType?: MediaType): Promise<RecommendationItem[]> {
    // 1. Fetch user's high-rated items (>= 4 stars)
    let queryRatings = supabase
        .from('user_ratings')
        .select('*')
        .eq('user_id', userId)
        .gte('rating', 4)

    if (mediaType) {
        queryRatings = queryRatings.eq('media_type', mediaType)
    }

    const { data: highRated } = await queryRatings
        .order('created_at', { ascending: false })
        .limit(10)

    // 2. Fetch user's likes
    let queryLikes = supabase
        .from('likes')
        .select('*')
        .eq('user_id', userId)

    if (mediaType) {
        queryLikes = queryLikes.eq('media_type', mediaType)
    }

    const { data: likes } = await queryLikes
        .order('created_at', { ascending: false })
        .limit(10)

    const ratedItems = (highRated || []) as any[]
    const likedItems = (likes || []) as any[]

    // If no ratings or likes, return local library content (Bons jogos)
    if (ratedItems.length === 0 && likedItems.length === 0) {
        return await getFallbackRecommendations(mediaType)
    }

    // Combine sources (Ratings + Likes)
    const sourceItems = [
        ...ratedItems.map(i => ({ ...i, source: 'rating', apiId: i.media_id })),
        ...likedItems.map(i => ({ ...i, source: 'like', apiId: i.media_id, pace: null, genre: '' }))
    ]

    // Shuffle sources to vary the seed
    const shuffledSources = sourceItems.sort(() => Math.random() - 0.5).slice(0, 5)

    const recommendations: RecommendationItem[] = []
    const seenIds = new Set(sourceItems.map(r => r.id))
    const seenTitles = new Set(sourceItems.map((r: any) => r.title.toLowerCase()))

    // Parallelize fetching for the sources
    const promises = shuffledSources.map(async (item: any) => {
        try {
            const results: MediaItem[] = []
            let query = item.title

            const rand = Math.random()

            // When mediaType is specified, we ONLY want that type
            if (mediaType) {
                if (mediaType === 'book') {
                    const books = await searchBooks(query)
                    results.push(...books.results)
                } else if (mediaType === 'tv') {
                    const tv = await searchTv(query)
                    results.push(...tv.results)
                } else if (mediaType === 'game') {
                    const games = await searchGames(query)
                    results.push(...games.results)
                } else {
                    const movies = await searchMovies(query)
                    results.push(...movies.results)
                }
            } else {
                // Mixed Mode
                if (rand < 0.4) {
                    if (item.media_type === 'book') {
                        const books = await searchBooks(query)
                        results.push(...books.results)
                    } else if (item.media_type === 'tv') {
                        const tv = await searchTv(query)
                        results.push(...tv.results)
                    } else if (item.media_type === 'game') {
                        const games = await searchGames(query)
                        results.push(...games.results)
                    } else {
                        const movies = await searchMovies(query)
                        results.push(...movies.results)
                    }
                } else if (rand < 0.6) {
                    const books = await searchBooks(query)
                    results.push(...books.results)
                } else if (rand < 0.8) {
                    const games = await searchGames(query)
                    results.push(...games.results)
                } else {
                    const movies = await searchMovies(query)
                    results.push(...movies.results)
                }
            }

            return results.map(candidate => ({ candidate, sourceItem: item }))
        } catch (e) {
            console.error('Error fetching recs for', item.title, e)
            return []
        }
    })

    const resultsArray = await Promise.all(promises)

    // Interleave results
    const maxResultsPerSource = 10
    for (let i = 0; i < maxResultsPerSource; i++) {
        for (const group of resultsArray) {
            if (i < group.length) {
                const { candidate, sourceItem } = group[i]
                const normalizedTitle = candidate.title.toLowerCase()

                if (!seenIds.has(candidate.id) && !seenTitles.has(normalizedTitle)) {
                    if (mediaType && candidate.type !== mediaType) continue

                    let reasonText = sourceItem.source === 'like'
                        ? `Porque você curtiu ${sourceItem.title}`
                        : `Porque você avaliou bem ${sourceItem.title}`

                    recommendations.push({
                        ...candidate,
                        reason: {
                            type: 'similarity',
                            sourceTitle: sourceItem.title,
                            description: reasonText
                        }
                    })
                    seenIds.add(candidate.id)
                    seenTitles.add(normalizedTitle)
                }
            }
        }
        if (recommendations.length >= 24) break
    }

    return recommendations
}
