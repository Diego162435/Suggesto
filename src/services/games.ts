import { MediaItem, SearchResult } from '../types/media'
import { supabase } from './supabase'

const RAWG_BASE_URL = 'https://api.rawg.io/api'
const RAWG_API_KEY = import.meta.env.VITE_RAWG_API_KEY
const WIKIPEDIA_SUMMARY_URL = 'https://pt.wikipedia.org/api/rest_v1/page/summary'

export async function searchGames(query: string, page = 1): Promise<SearchResult> {
    // 1. Local DB Search (Priority for exact matches or high quality local data)
    let localResults: MediaItem[] = []
    try {
        const { data: localData } = await (supabase as any)
            .from('games')
            .select('*')
            .ilike('title', `%${query}%`)
            .order('vote_average', { ascending: false })
            .limit(5)

        localResults = (localData || []).map((game: any) => ({
            id: `db-game-${game.id}`,
            apiId: game.id.toString(),
            type: 'game',
            title: game.name || game.title,
            overview: game.overview || '',
            posterPath: game.poster_path,
            releaseDate: game.release_date,
            voteAverage: game.vote_average,
            platforms: game.platforms || [],
            metacritic: game.metacritic
        }))
    } catch (e) {
        console.warn('Local DB search failed:', e)
    }

    if (!RAWG_API_KEY) {
        console.warn('RAWG API Key missing. Returning local results only.')
        return { page: 1, totalPages: 1, totalResults: localResults.length, results: localResults }
    }

    // 2. RAWG Search
    try {
        const response = await fetch(
            `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(query)}&page=${page}&page_size=20`
        )

        if (!response.ok) throw new Error('RAWG API Error')

        const data = await response.json()

        const rawgResults: MediaItem[] = data.results.map((game: any) => ({
            id: `rawg-game-${game.id}`,
            apiId: game.id.toString(),
            type: 'game',
            title: game.name,
            overview: '', // Search results don't usually have full overview, can fill later or use what we have
            posterPath: game.background_image || null,
            releaseDate: game.released,
            voteAverage: game.metacritic ? game.metacritic / 10 : (game.rating ? game.rating * 2 : 0), // Scale to 0-10
            platforms: game.platforms?.map((p: any) => p.platform.name) || [],
            metacritic: game.metacritic
        }))

        // Deduplicate: Filter out RAWG results that are already in Local DB
        const seenTitles = new Set(localResults.map(i => i.title.toLowerCase()))
        const filteredRawg = rawgResults.filter(r => !seenTitles.has(r.title.toLowerCase()))

        const combined = [...localResults, ...filteredRawg]

        return {
            page: page,
            totalPages: Math.ceil(data.count / 20), // Approx
            totalResults: data.count,
            results: combined
        }

    } catch (e) {
        console.warn('RAWG search failed:', e)
        return { page: 1, totalPages: 1, totalResults: localResults.length, results: localResults }
    }
}

export async function getGameDetails(id: string): Promise<MediaItem & { similar: MediaItem[] }> {
    const isDb = id.startsWith('db-')
    const rawId = id.replace('db-game-', '').replace('rawg-game-', '').replace('cs-game-', '').replace('game-', '')

    let baseItem: any = null

    // 1. Try Local DB
    if (isDb) {
        const { data } = await (supabase as any).from('games').select('*').eq('id', rawId).single()
        const g = data as any
        if (g) {
            baseItem = {
                id: `db-game-${g.id}`,
                apiId: g.id,
                type: 'game' as const,
                title: g.title,
                overview: g.overview || '',
                posterPath: g.poster_path,
                backdropPath: g.backdrop_path,
                releaseDate: g.release_date,
                voteAverage: Number(g.vote_average) || 0,
                metacritic: g.metacritic,
                platforms: g.platforms || [],
                genres: g.genres || [],
                publisher: g.publisher,
                developers: g.developers || [],
                status: 'Lançado'
            }
        }
    }

    // 2. Fetch RAWG Details (If RAWG ID or fallback)
    if (!baseItem && RAWG_API_KEY) {
        try {
            const response = await fetch(`${RAWG_BASE_URL}/games/${rawId}?key=${RAWG_API_KEY}`)
            if (response.ok) {
                const data = await response.json()
                baseItem = {
                    id: `rawg-game-${data.id}`,
                    apiId: data.id.toString(),
                    type: 'game' as const,
                    title: data.name,
                    overview: data.description_raw || data.description || '',
                    posterPath: data.background_image,
                    backdropPath: data.background_image_additional || data.background_image,
                    releaseDate: data.released,
                    voteAverage: data.metacritic ? data.metacritic / 10 : (data.rating ? data.rating * 2 : 0),
                    metacritic: data.metacritic,
                    platforms: data.platforms?.map((p: any) => p.platform.name) || [],
                    genres: data.genres?.map((g: any) => g.name) || [],
                    status: 'Lançado',
                    publisher: data.publishers?.[0]?.name,
                    developers: data.developers?.map((d: any) => d.name) || [],
                    trailerUrl: data.clip?.clip // RAWG isn't great for full youtube trailers in free tier sometimes, but clip exists
                }
            }
        } catch (e) {
            console.warn("RAWG details fetch failed", e)
        }
    }

    // 3. Fallback to Wikipedia for description if missing
    if (baseItem && (!baseItem.overview || baseItem.overview.length < 50)) {
        try {
            const searchTitle = baseItem.title
            const wikiUrl = `${WIKIPEDIA_SUMMARY_URL}/${encodeURIComponent(searchTitle.replace(/ /g, '_'))}`
            const wikiRes = await fetch(wikiUrl)
            if (wikiRes.ok) {
                const wikiData = await wikiRes.json()
                if (wikiData.extract) {
                    baseItem.overview = wikiData.extract
                }
            }
        } catch (e) {
            // Ignore wiki errors
        }
    }

    if (!baseItem) throw new Error('Game details not found')

    // Fetch Similar (if RAWG)
    let similar: MediaItem[] = []
    if (RAWG_API_KEY) {
        try {
            const simRes = await fetch(`${RAWG_BASE_URL}/games/${rawId}/suggested?key=${RAWG_API_KEY}&page_size=10`)
            if (simRes.ok) {
                const simData = await simRes.json()
                similar = simData.results.map((g: any) => ({
                    id: `rawg-game-${g.id}`,
                    apiId: g.id.toString(),
                    type: 'game',
                    title: g.name,
                    posterPath: g.background_image,
                    voteAverage: g.rating ? g.rating * 2 : 0
                }))
            }
        } catch (e) { console.warn("Similar games fetch failed", e) }
    }

    return { ...baseItem, similar }
}

export async function getTrendingGames(): Promise<MediaItem[]> {
    if (!RAWG_API_KEY) return []

    try {
        // Fetch High Quality Trending Games (Recent & High Metacritic)
        // dates: last 12 months
        const today = new Date()
        const lastYear = new Date()
        lastYear.setFullYear(today.getFullYear() - 1)
        const dateStr = `${lastYear.toISOString().split('T')[0]},${today.toISOString().split('T')[0]}`

        const response = await fetch(
            `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&dates=${dateStr}&ordering=-metacritic&page_size=40` // Remove range, just sort by quality
        )

        if (!response.ok) return []
        const data = await response.json()

        return data.results.map((game: any) => ({
            id: `rawg-game-${game.id}`,
            apiId: game.id.toString(),
            type: 'game',
            title: game.name,
            overview: '',
            posterPath: game.background_image,
            releaseDate: game.released,
            voteAverage: game.metacritic ? game.metacritic / 10 : (game.rating * 2), // Scale 0-10
            platforms: game.platforms?.map((p: any) => p.platform.name) || [],
            metacritic: game.metacritic
        }))

    } catch (e) {
        console.warn('RAWG trending failed:', e)
        return []
    }
}

export async function discoverGamesByGenre(genreQuery: string, page = 1): Promise<SearchResult> {
    if (!RAWG_API_KEY) return searchGames(genreQuery, page) // Fallback

    const genreMap: Record<string, string> = {
        'action': 'action',
        'adventure': 'adventure',
        'rpg': 'role-playing-games-rpg',
        'strategy': 'strategy',
        'shooter': 'shooter',
        'casual': 'casual',
        'simulation': 'simulation',
        'puzzle': 'puzzle',
        'arcade': 'arcade',
        'platformer': 'platformer',
        'racing': 'racing',
        'massively-multiplayer': 'massively-multiplayer',
        'sports': 'sports',
        'fighting': 'fighting',
        'family': 'family',
        'board-games': 'board-games',
        'educational': 'educational',
        'card': 'card',
        'indie': 'indie'
    }

    const slug = genreMap[genreQuery.toLowerCase()] || genreQuery.toLowerCase()

    try {
        const response = await fetch(
            `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&genres=${slug}&ordering=-metacritic&page=${page}&page_size=20`
        )

        if (!response.ok) throw new Error('Genre fetch failed')
        const data = await response.json()

        return {
            page: page,
            totalPages: Math.ceil(data.count / 20),
            totalResults: data.count,
            results: data.results.map((game: any) => ({
                id: `rawg-game-${game.id}`,
                apiId: game.id.toString(),
                type: 'game',
                title: game.name,
                posterPath: game.background_image,
                releaseDate: game.released,
                voteAverage: game.metacritic ? game.metacritic / 10 : (game.rating * 2)
            }))
        }

    } catch (e) {
        console.warn('RAWG genre discover failed, falling back to search', e)
        return searchGames(genreQuery, page)
    }
}
