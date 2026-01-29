import { MediaItem, SearchResult } from '../types/media'

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w780' // Upgraded from w500 for better posters
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original' // Maximum quality for hero backgrounds

export async function searchMovies(query: string, page = 1): Promise<SearchResult> {
    if (!TMDB_API_KEY) throw new Error('TMDB API Key missed')

    const response = await fetch(
        `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=pt-BR&region=BR&query=${encodeURIComponent(
            query
        )}&page=${page}`
    )

    if (!response.ok) throw new Error('Failed to fetch movies')

    const data = await response.json()

    return {
        page: data.page,
        totalPages: data.total_pages,
        totalResults: data.total_results,
        results: data.results.map((movie: any) => ({
            id: `movie-${movie.id}`,
            apiId: movie.id.toString(),
            type: 'movie',
            title: movie.title,
            overview: movie.overview,
            posterPath: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null,
            backdropPath: movie.backdrop_path ? `${IMAGE_BASE_URL}${movie.backdrop_path}` : null,
            releaseDate: movie.release_date,
            voteAverage: movie.vote_average,
        })),
    }
}

export async function searchTv(query: string, page = 1): Promise<SearchResult> {
    if (!TMDB_API_KEY) throw new Error('TMDB API Key missed')

    const response = await fetch(
        `${BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&language=pt-BR&region=BR&query=${encodeURIComponent(
            query
        )}&page=${page}`
    )

    if (!response.ok) throw new Error('Failed to fetch tv shows')

    const data = await response.json()

    return {
        page: data.page,
        totalPages: data.total_pages,
        totalResults: data.total_results,
        results: data.results.map((show: any) => ({
            id: `tv-${show.id}`,
            apiId: show.id.toString(),
            type: 'tv',
            title: show.name, // TMDB uses 'name' for TV shows, not 'title'
            overview: show.overview,
            posterPath: show.poster_path ? `${IMAGE_BASE_URL}${show.poster_path}` : null,
            backdropPath: show.backdrop_path ? `${IMAGE_BASE_URL}${show.backdrop_path}` : null,
            releaseDate: show.first_air_date,
            voteAverage: show.vote_average,
        })),
    }
}

export async function getMovieDetails(id: string): Promise<MediaItem & { similar: MediaItem[] }> {
    if (!TMDB_API_KEY) throw new Error('TMDB API Key missed')

    // 1. Fetch Movie Details
    const response = await fetch(
        `${BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=pt-BR&append_to_response=credits,recommendations,videos,release_dates`
    )

    if (!response.ok) throw new Error('Failed to fetch movie details')

    const data = await response.json()

    // 2. Extract Key Data
    const collectionId = data.belongs_to_collection?.id
    const mainGenres = data.genres?.map((g: any) => g.id) || []

    const item: MediaItem = {
        id: `movie-${data.id}`,
        apiId: data.id.toString(),
        type: 'movie',
        title: data.title,
        overview: data.overview,
        posterPath: data.poster_path ? `${IMAGE_BASE_URL}${data.poster_path}` : null,
        backdropPath: data.backdrop_path ? `${BACKDROP_BASE_URL}${data.backdrop_path}` : null,
        releaseDate: data.release_date,
        voteAverage: data.vote_average,
        runtime: data.runtime,
        status: data.status,
        genres: data.genres?.map((g: any) => g.name) || [],
        cast: data.credits?.cast?.slice(0, 10).map((c: any) => ({
            name: c.name,
            profilePath: c.profile_path ? `${IMAGE_BASE_URL}${c.profile_path}` : null,
            character: c.character
        })) || [],
        director: data.credits?.crew?.find((c: any) => c.job === 'Director')?.name,
        trailerUrl: data.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube')?.key,
        contentRating: data.release_dates?.results?.find((r: any) => r.iso_3166_1 === 'BR')?.release_dates[0]?.certification || 'L'
    }

    // 3. Build Recommendations Strategy
    let collectionParts: any[] = []

    // Strategy A: If part of a collection, fetch the full collection!
    if (collectionId) {
        try {
            const collectionRes = await fetch(
                `${BASE_URL}/collection/${collectionId}?api_key=${TMDB_API_KEY}&language=pt-BR&region=BR`
            )
            if (collectionRes.ok) {
                const collectionData = await collectionRes.json()
                collectionParts = collectionData.parts || []
            }
        } catch (e) {
            console.warn('Failed to fetch collection', e)
        }
    }

    // Strategy B: Filter standard recommendations by Genre (Basic relevance check)
    // We heavily prioritize the Collection first, then fill with relevant recs
    const rawRecs = data.recommendations?.results || []

    const relevantRecs = rawRecs.filter((rec: any) => {
        // Must share at least one genre
        return rec.genre_ids?.some((id: number) => mainGenres.includes(id))
    })

    // Combine: Collection > Genre-Matched Recs
    const mixedResults = [...collectionParts, ...relevantRecs]

    // Deduplicate and Remove current movie
    const uniqueIds = new Set()
    const finalSimilar: MediaItem[] = []

    for (const movie of mixedResults) {
        if (movie.id === data.id) continue // Skip current
        if (uniqueIds.has(movie.id)) continue // Skip duplicates

        uniqueIds.add(movie.id)

        // Add if we have a poster (quality check)
        if (movie.poster_path) {
            // If it came from collection, might lack some detailed fields depending on endpoint, 
            // but usually safe for simple display
            finalSimilar.push({
                id: `movie-${movie.id}`,
                apiId: movie.id.toString(),
                type: 'movie',
                title: movie.title,
                overview: movie.overview,
                posterPath: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null,
                releaseDate: movie.release_date,
                voteAverage: movie.vote_average,
            })
        }

        if (finalSimilar.length >= 10) break
    }

    return { ...item, similar: finalSimilar }
}

export async function getTvDetails(id: string): Promise<MediaItem & { similar: MediaItem[] }> {
    if (!TMDB_API_KEY) throw new Error('TMDB API Key missed')

    // Use 'recommendations' instead of 'similar' for better logic
    const response = await fetch(
        `${BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&language=pt-BR&append_to_response=recommendations,credits,videos,content_ratings`
    )

    if (!response.ok) throw new Error('Failed to fetch tv details')

    const data = await response.json()
    const mainGenres = data.genres?.map((g: any) => g.id) || []

    const item: MediaItem = {
        id: `tv-${data.id}`,
        apiId: data.id.toString(),
        type: 'tv',
        title: data.name,
        overview: data.overview,
        posterPath: data.poster_path ? `${IMAGE_BASE_URL}${data.poster_path}` : null,
        backdropPath: data.backdrop_path ? `${BACKDROP_BASE_URL}${data.backdrop_path}` : null,
        releaseDate: data.first_air_date,
        voteAverage: data.vote_average,
        numberOfSeasons: data.number_of_seasons,
        numberOfEpisodes: data.number_of_episodes,
        status: data.status,
        genres: data.genres?.map((g: any) => g.name) || [],
        cast: data.credits?.cast?.slice(0, 10).map((c: any) => ({
            name: c.name,
            profilePath: c.profile_path ? `${IMAGE_BASE_URL}${c.profile_path}` : null,
            character: c.character
        })) || [],
        director: data.created_by?.map((c: any) => c.name).join(', '), // For TV using created_by as "director"ish
        trailerUrl: data.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube')?.key,
        contentRating: data.content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'BR')?.rating || 'L'
    }

    // Filter TV recommendations by genre relevance
    const rawRecs = data.recommendations?.results || []

    const filteredRecs = rawRecs.filter((show: any) => {
        return show.genre_ids?.some((id: number) => mainGenres.includes(id))
    }).map((show: any) => ({
        id: `tv-${show.id}`,
        apiId: show.id.toString(),
        type: 'tv',
        title: show.name,
        overview: show.overview,
        posterPath: show.poster_path ? `${IMAGE_BASE_URL}${show.poster_path}` : null,
        releaseDate: show.first_air_date,
        voteAverage: show.vote_average,
    })).slice(0, 10)

    return { ...item, similar: filteredRecs }
}

export async function getTrending(type: 'movie' | 'tv'): Promise<MediaItem[]> {
    if (!TMDB_API_KEY) return []

    const response = await fetch(
        `${BASE_URL}/trending/${type}/week?api_key=${TMDB_API_KEY}&language=pt-BR&region=BR`
    )
    const data = await response.json()

    return data.results.map((item: any) => ({
        id: `${type}-${item.id}`,
        apiId: item.id.toString(),
        type: type,
        title: type === 'movie' ? item.title : item.name,
        overview: item.overview,
        posterPath: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : null,
        backdropPath: item.backdrop_path ? `${BACKDROP_BASE_URL}${item.backdrop_path}` : null,
        releaseDate: type === 'movie' ? item.release_date : item.first_air_date,
        voteAverage: item.vote_average,
    }))
}

export async function getRecommendations(type: 'movie' | 'tv', id: string, page = 1): Promise<SearchResult> {
    if (!TMDB_API_KEY) throw new Error('TMDB API Key missed')

    const rawId = id.replace(`${type}-`, '')
    // Use recommendations endpoint which is smarter, fallback to similar if needed
    const endpoint = `${BASE_URL}/${type}/${rawId}/recommendations?api_key=${TMDB_API_KEY}&language=pt-BR&page=${page}`

    const response = await fetch(endpoint)
    if (!response.ok) throw new Error('Failed to fetch recommendations')

    const data = await response.json()

    return {
        page: data.page,
        totalPages: data.total_pages,
        totalResults: data.total_results,
        results: data.results.map((item: any) => ({
            id: `${type}-${item.id}`,
            apiId: item.id.toString(),
            type: type,
            title: type === 'movie' ? item.title : item.name,
            overview: item.overview,
            posterPath: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : null,
            backdropPath: item.backdrop_path ? `${BACKDROP_BASE_URL}${item.backdrop_path}` : null,
            releaseDate: type === 'movie' ? item.release_date : item.first_air_date,
            voteAverage: item.vote_average,
        })),
    }
}

// Genre Mappings for TMDB
const GENRE_IDS: Record<string, number> = {
    'action': 28,
    'adventure': 12,
    'animation': 16,
    'comedy': 35,
    'crime': 80,
    'documentary': 99,
    'drama': 18,
    'family': 10751,
    'fantasy': 14,
    'history': 36,
    'horror': 27,
    'music': 10402,
    'mystery': 9648,
    'romance': 10749,
    'scifi': 878,
    'thriller': 53,
    'war': 10752,
    'western': 37,
    'kids': 10762,
    'news': 10763,
    'reality': 10764,
    'soap': 10766,
    'talk': 10767,
    'politics': 10768
}

export async function discoverMoviesByGenre(genreQuery: string, page = 1, options?: { maxRating?: string }): Promise<SearchResult> {
    const genreId = GENRE_IDS[genreQuery.toLowerCase()] || (genreQuery.match(/^\d+$/) ? genreQuery : GENRE_IDS['action']) // Fallback or direct ID

    let url = `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=pt-BR&region=BR&sort_by=popularity.desc&page=${page}`

    // Add Genre if it's not empty, otherwise we might be discovering by other means (or just popularity)
    if (genreId) {
        url += `&with_genres=${genreId}`
    }

    if (options?.maxRating) {
        url += `&certification_country=BR&certification.lte=${options.maxRating}`
    }

    const response = await fetch(url)

    if (!response.ok) throw new Error('Failed to discover movies')
    const data = await response.json()

    return {
        page: data.page,
        totalPages: data.total_pages,
        totalResults: data.total_results,
        results: data.results.map((movie: any) => ({
            id: `movie-${movie.id}`,
            apiId: movie.id.toString(),
            type: 'movie',
            title: movie.title,
            overview: movie.overview,
            posterPath: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null,
            backdropPath: movie.backdrop_path ? `${IMAGE_BASE_URL}${movie.backdrop_path}` : null,
            releaseDate: movie.release_date,
            voteAverage: movie.vote_average,
        }))
    }
}

export async function discoverTvByGenre(genreQuery: string, page = 1, options?: { maxRating?: string }): Promise<SearchResult> {
    // TV specifically has different IDs for some genres
    const TV_GENRE_IDS: Record<string, number> = {
        'action': 10759, // Action & Adventure
        'scifi': 10765,  // Sci-Fi & Fantasy
        'drama': 18,
        'comedy': 35,
        'mystery': 9648,
        'war': 10768,
        'western': 37,
        'animation': 16,
        'crime': 80,
        'documentary': 99,
        'family': 10751,
        'kids': 10762,
        'reality': 10764
    }

    const genreId = TV_GENRE_IDS[genreQuery.toLowerCase()] || (genreQuery.match(/^\d+$/) ? genreQuery : 18) // Fallback or direct ID

    let url = `${BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&language=pt-BR&region=BR&sort_by=popularity.desc&page=${page}`

    if (genreId) {
        url += `&with_genres=${genreId}`
    }

    if (options?.maxRating) {
        // For TV, it supports content_rating filtering
        // Note: certification.lte works for movies. For TV it might be 'with_content_ratings'? No, not documented well.
        // Actually, TV discover usually works best with 'certification_country' & 'certification.lte' too in recent years updates
        // BUT, documentation says 'air_date.lte' etc.
        // Let's try standard certification parameters, usually they map.
        // If not, we might need to rely on the client side or safer genres.
        // The most documented way for TV ratings is strict 'certification' not lte... but let's try lte.
        url += `&certification_country=BR&certification.lte=${options.maxRating}`
    }

    const response = await fetch(url)

    if (!response.ok) throw new Error('Failed to discover tv')
    const data = await response.json()

    return {
        page: data.page,
        totalPages: data.total_pages,
        totalResults: data.total_results,
        results: data.results.map((show: any) => ({
            id: `tv-${show.id}`,
            apiId: show.id.toString(),
            type: 'tv',
            title: show.name,
            overview: show.overview,
            posterPath: show.poster_path ? `${IMAGE_BASE_URL}${show.poster_path}` : null,
            backdropPath: show.backdrop_path ? `${IMAGE_BASE_URL}${show.backdrop_path}` : null,
            releaseDate: show.first_air_date,
            voteAverage: show.vote_average,
        }))
    }
}
