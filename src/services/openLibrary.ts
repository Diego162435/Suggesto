import { MediaItem, SearchResult } from '../types/media'

const BASE_URL = 'https://openlibrary.org'

export async function searchBooks(query: string, startIndex = 0): Promise<SearchResult> {
    try {
        const page = Math.floor(startIndex / 20) + 1
        const url = `${BASE_URL}/search.json?q=${encodeURIComponent(query)}&page=${page}&limit=20&language=por`

        const response = await fetch(url, {
            signal: AbortSignal.timeout(10000)
        })

        if (!response.ok) {
            console.warn('Open Library API error:', response.status, response.statusText)
            return { page: 1, totalPages: 0, totalResults: 0, results: [] }
        }

        const data = await response.json()
        const docs = data.docs || []

        return {
            page: page,
            totalPages: Math.ceil((data.numFound || 0) / 20),
            totalResults: data.numFound || 0,
            results: docs.map((book: any) => {
                const coverId = book.cover_i
                const posterPath = coverId
                    ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
                    : null

                return {
                    id: `book-${book.key?.replace('/works/', '')}`,
                    apiId: book.key?.replace('/works/', '') || book.edition_key?.[0] || '',
                    type: 'book',
                    title: book.title || 'Sem título',
                    overview: book.first_sentence?.[0] || book.subtitle || '',
                    posterPath: posterPath,
                    releaseDate: book.first_publish_year?.toString() || '',
                    voteAverage: book.ratings_average || undefined,
                    author: book.author_name?.join(', ') || 'Autor desconhecido',
                    pageCount: book.number_of_pages_median || undefined,
                }
            }),
        }
    } catch (error) {
        console.warn('Failed to fetch books from Open Library:', error)
        return { page: 1, totalPages: 0, totalResults: 0, results: [] }
    }
}

export async function getBookDetails(id: string): Promise<MediaItem & { similar: MediaItem[] }> {
    try {
        // Clean the ID
        const cleanId = id.replace('book-', '')
        const url = `${BASE_URL}/works/${cleanId}.json`

        const response = await fetch(url, {
            signal: AbortSignal.timeout(10000)
        })

        if (!response.ok) {
            console.warn('Failed to fetch book details from Open Library:', response.status)
            throw new Error('Failed to fetch book details')
        }

        const data = await response.json()

        // Get cover
        const coverId = data.covers?.[0]
        const posterPath = coverId
            ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
            : null

        // Get description
        let overview = ''
        if (typeof data.description === 'string') {
            overview = data.description
        } else if (data.description?.value) {
            overview = data.description.value
        }

        // Get author info
        let author = 'Autor desconhecido'
        if (data.authors && data.authors.length > 0) {
            try {
                const authorKey = data.authors[0].author.key
                const authorRes = await fetch(`${BASE_URL}${authorKey}.json`)
                if (authorRes.ok) {
                    const authorData = await authorRes.json()
                    author = authorData.name || author
                }
            } catch (e) {
                console.warn('Failed to fetch author details')
            }
        }

        // Get subjects (genres)
        const genres = data.subjects?.slice(0, 5) || []

        const item: MediaItem = {
            id: `book-${cleanId}`,
            apiId: cleanId,
            type: 'book',
            title: data.title || 'Sem título',
            overview: overview,
            posterPath: posterPath,
            releaseDate: data.first_publish_date || '',
            voteAverage: undefined,
            pageCount: undefined,
            author: author,
            genres: genres,
            status: 'Lançado'
        }

        // Fetch similar books
        let similar: MediaItem[] = []

        try {
            if (data.subjects && data.subjects.length > 0) {
                const subject = data.subjects[0]
                const similarRes = await searchBooks(subject)
                similar = similarRes.results.filter(b => b.apiId !== cleanId).slice(0, 10)
            } else if (author !== 'Autor desconhecido') {
                const similarRes = await searchBooks(author)
                similar = similarRes.results.filter(b => b.apiId !== cleanId).slice(0, 10)
            }
        } catch (e) {
            console.warn('Failed to fetch similar books', e)
        }

        return { ...item, similar }
    } catch (error) {
        console.error('Error fetching book details from Open Library:', error)
        throw error
    }
}

export async function getRecommendations(id: string, page = 1): Promise<SearchResult> {
    try {
        const rawId = id.replace('book-', '')
        const details = await getBookDetails(rawId)

        let query = ''
        if (details.author && details.author !== 'Autor desconhecido') {
            query = details.author
        } else if (details.genres && details.genres.length > 0) {
            query = details.genres[0]
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
