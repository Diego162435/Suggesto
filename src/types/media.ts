export type MediaType = 'movie' | 'book' | 'tv' | 'game'

export interface MediaItem {
    id: string
    apiId: string // ID from TMDB, Google Books or RAWG
    type: MediaType
    title: string
    overview: string
    posterPath: string | null // Full URL or path requiring base URL
    backdropPath?: string | null
    releaseDate?: string
    voteAverage?: number // For initial display, though we prioritize user ratings
    // Detailed fields
    runtime?: number
    numberOfSeasons?: number
    numberOfEpisodes?: number
    pageCount?: number

    // Game specific
    platforms?: string[]
    metacritic?: number
    publisher?: string
    developers?: string[]

    // Rich Metadata
    genres?: string[]
    status?: string
    cast?: { name: string; profilePath: string | null; character: string }[]
    director?: string
    author?: string
    voteCount?: number
    trailerUrl?: string
    contentRating?: string
}

export interface SearchResult {
    page: number
    results: MediaItem[]
    totalPages: number
    totalResults: number
}
