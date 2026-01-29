import { MediaItem, SearchResult } from '../types/media'

const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes'

export async function searchBooks(query: string, startIndex = 0): Promise<SearchResult> {
    try {
        const keyParam = GOOGLE_BOOKS_API_KEY ? `&key=${GOOGLE_BOOKS_API_KEY}` : ''
        const maxResults = 40

        // Added langRestrict=pt and printType=books for better quality
        const url = `${BASE_URL}?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${maxResults}&langRestrict=pt&lr=lang_pt&printType=books&orderBy=relevance${keyParam}`

        const response = await fetch(url, {
            signal: AbortSignal.timeout(30000) // Increased to 30s
        })

        if (!response.ok) {
            console.warn('Google Books API error:', response.status, response.statusText)
            return { page: 1, totalPages: 0, totalResults: 0, results: [] }
        }

        const data = await response.json()
        const allItems = data.items || []

        // Filter out junk (no description)
        const validItems = allItems.filter((book: any) => {
            const v = book.volumeInfo;
            if (!v?.title || !v?.description) return false;

            // Penalty for old ones in sort instead of hard block here
            return true;
        })

        return {
            page: Math.floor(startIndex / 20) + 1,
            totalPages: Math.ceil((data.totalItems || 0) / 20),
            totalResults: data.totalItems || 0,
            results: validItems
                .sort((a: any, b: any) => {
                    const va = a.volumeInfo;
                    const vb = b.volumeInfo;

                    // Score items
                    // Higher is better
                    let aScore = (va.imageLinks ? 20 : 0) + (va.averageRating || 0) * 5;
                    let bScore = (vb.imageLinks ? 20 : 0) + (vb.averageRating || 0) * 5;

                    // Bonus for Portuguese lang explicitly matching
                    if (va.language?.startsWith('pt')) aScore += 10;
                    if (vb.language?.startsWith('pt')) bScore += 10;

                    // Penalty for very short descriptions (likely junk)
                    if (va.description && va.description.length < 50) aScore -= 15;
                    if (vb.description && vb.description.length < 50) bScore -= 15;

                    return bScore - aScore;
                })
                .slice(0, 20).map((book: any) => {
                    const volumeInfo = book.volumeInfo
                    return {
                        id: `book-${book.id}`,
                        apiId: book.id,
                        type: 'book',
                        title: volumeInfo.title,
                        overview: volumeInfo.description || '',
                        posterPath: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
                        releaseDate: volumeInfo.publishedDate,
                        voteAverage: volumeInfo.averageRating,
                    }
                }),
        }
    } catch (error) {
        if (error instanceof Error && error.name === 'TimeoutError') {
            console.warn('Google Books API timed out. Returning empty results.');
        } else {
            console.warn('Failed to fetch books:', error);
        }
        return { page: 1, totalPages: 0, totalResults: 0, results: [] }
    }
}

export async function getBookDetails(id: string): Promise<MediaItem & { similar: MediaItem[] }> {
    try {
        const keyParam = GOOGLE_BOOKS_API_KEY ? `?key=${GOOGLE_BOOKS_API_KEY}` : ''
        const url = `${BASE_URL}/${id}${keyParam}`

        const response = await fetch(url, {
            signal: AbortSignal.timeout(30000)
        })

        if (!response.ok) {
            console.warn('Failed to fetch book details:', response.status)
            throw new Error('Failed to fetch book details')
        }

        const data = await response.json()
        const volumeInfo = data.volumeInfo

        const item: MediaItem = {
            id: `book-${data.id}`,
            apiId: data.id,
            type: 'book',
            title: volumeInfo.title,
            overview: volumeInfo.description || '',
            posterPath: getSize(volumeInfo.imageLinks) || null,
            releaseDate: volumeInfo.publishedDate,
            voteAverage: volumeInfo.averageRating,
            pageCount: volumeInfo.pageCount,
            author: volumeInfo.authors?.join(', '),
            genres: mapCategoriesToPortuguese(volumeInfo.categories),
            status: 'Lançado'
        }

        // Fetch similar books
        let similar: MediaItem[] = []

        try {
            if (volumeInfo.authors && volumeInfo.authors.length > 0) {
                const author = volumeInfo.authors[0]
                const similarRes = await searchBooks(`inauthor:"${author}"`)
                similar = similarRes.results.filter(b => b.apiId !== data.id).slice(0, 10)
            } else if (volumeInfo.categories && volumeInfo.categories.length > 0) {
                const category = volumeInfo.categories[0]
                const similarRes = await searchBooks(`subject:"${category}"`)
                similar = similarRes.results.filter(b => b.apiId !== data.id).slice(0, 10)
            }
        } catch (e) {
            console.warn('Failed to fetch similar books', e)
        }

        return { ...item, similar }
    } catch (error) {
        console.error('Error fetching book details:', error)
        throw error
    }
}

function getSize(links: any) {
    if (!links) return null
    const best = links.extraLarge || links.large || links.medium || links.small || links.thumbnail || links.smallThumbnail
    return best?.replace('http:', 'https:')
}

export async function getRecommendations(id: string, page = 1): Promise<SearchResult> {
    try {
        const rawId = id.replace('book-', '')
        const details = await getBookDetails(rawId)

        let query = ''
        if (details.author && details.author !== 'Unknown') {
            query = `inauthor:"${details.author.split(', ')[0]}"`
        } else if (details.genres && details.genres.length > 0) {
            query = `subject:"${details.genres[0]}"`
        } else {
            return { page: 1, totalPages: 0, totalResults: 0, results: [] }
        }

        const startIndex = (page - 1) * 20
        return await searchBooks(query, startIndex)

    } catch (e) {
        console.warn('Failed to get book recommendations', e)
        return { page: 1, totalPages: 0, totalResults: 0, results: [] }
    }
}

function mapCategoriesToPortuguese(categories: string[] | undefined): string[] {
    if (!categories) return []

    const flattened = categories.flatMap(c => c.split(' / '))

    const translations: Record<string, string> = {
        'Fiction': 'Ficção',
        'Nonfiction': 'Não Ficção',
        'Juvenile Fiction': 'Infantojuvenil',
        'Young Adult Fiction': 'Jovem Adulto',
        'Fantasy': 'Fantasia',
        'Action & Adventure': 'Ação e Aventura',
        'Science Fiction': 'Ficção Científica',
        'Mystery': 'Mistério',
        'Thriller': 'Suspense',
        'Horror': 'Terror',
        'Romance': 'Romance',
        'Historical': 'Histórico',
        'Biography & Autobiography': 'Biografia',
        'Education': 'Educação',
        'History': 'História',
        'Self-Help': 'Autoajuda',
        'Business & Economics': 'Negócios',
        'Comics & Graphic Novels': 'HQs e Graphic Novels',
        'Computers': 'Tecnologia',
        'Psychology': 'Psicologia',
        'Philosophy': 'Filosofia',
        'Religion': 'Religião',
        'Science': 'Ciência',
        'Magic': 'Magia',
        'Wizards & Witches': 'Bruxaria',
        'General': 'Geral',
        'Coming of Age': 'Amadurecimento',
        'Dystopian': 'Distopia',
        'Contemporary': 'Contemporâneo'
    }

    const translated = flattened.map(cat => {
        const clean = cat.trim()
        return translations[clean] || clean
    })

    return [...new Set(translated)].slice(0, 5)
}

export async function discoverBooksByGenre(genreQuery: string, page = 1): Promise<SearchResult> {
    const mappings: Record<string, string[]> = {
        'action': ['subject:action', 'intitle:aventura', 'best seller ação'],
        'adventure': ['subject:adventure', 'intitle:aventura', 'épico aventura'],
        'comedy': ['subject:humor', 'intitle:comédia', 'livros humor'],
        'drama': ['subject:drama', 'intitle:drama', 'romance drama'],
        'scifi': ['subject:science+fiction', 'intitle:ficção científica', 'sci-fi best seller'],
        'fantasy': ['subject:fantasy', 'intitle:fantasia', 'alta fantasia'],
        'horror': ['subject:horror', 'intitle:terror', 'horror best seller'],
        'romance': ['subject:romance', 'intitle:romance', 'romance contemporâneo'],
        'history': ['subject:history', 'intitle:história', 'história brasil'],
        'mystery': ['subject:mystery', 'intitle:mistério', 'suspense policial'],
        'fiction': ['subject:fiction', 'literatura brasileira', 'ficção moderna'],
        'biography': ['subject:biography', 'biografia famosa', 'autobiografia']
    }

    const queries = mappings[genreQuery.toLowerCase()] || [genreQuery]
    const startIndex = (page - 1) * 20

    // Using OR (|) to CAST A WIDE NET
    // My new sorting/filtering logic in searchBooks will handle the quality!
    const query = queries.join(' | ')
    return await searchBooks(query, startIndex)
}
