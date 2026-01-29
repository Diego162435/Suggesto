import { useState, useEffect } from 'react';
import { booksApi } from '../services/booksApi';
import { seriesApi } from '../services/seriesApi';
import { RecommendationItem } from '../features/recommendations/RecommendationEngine';

export function usePermanentLibrary() {
    const [items, setItems] = useState<RecommendationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    async function refresh() {
        setLoading(true);
        try {
            const [booksRes, seriesRes] = await Promise.all([
                booksApi.listBooks(1, 100), // Get first 100 for now
                seriesApi.listSeries(1, 100)
            ]);

            const mappedBooks: RecommendationItem[] = booksRes.data.map((b: any) => ({
                id: `db-book-${b.id}`, // Unique ID for frontend keys
                apiId: b.id,
                type: 'book',
                title: b.title,
                overview: b.overview || '',
                posterPath: b.poster_path, // Ensure this is a full URL or handled correctly
                releaseDate: b.release_date,
                voteAverage: b.vote_average,
                genres: b.genres,
                pageCount: b.page_count,
                author: b.author,
                reason: {
                    type: 'popular', // Generic reason for library items
                    description: 'Na sua Biblioteca'
                }
            } as any));

            const mappedSeries: RecommendationItem[] = seriesRes.data.map((s: any) => ({
                id: `db-tv-${s.id}`,
                apiId: s.id,
                type: 'tv',
                title: s.title,
                overview: s.overview || '',
                posterPath: s.poster_path,
                releaseDate: s.release_date,
                voteAverage: s.vote_average,
                genres: s.genres,
                numberOfSeasons: s.seasons?.length || 0,
                numberOfEpisodes: s.episodes?.length || 0,
                reason: {
                    type: 'popular',
                    description: 'Na sua Biblioteca'
                }
            } as any));

            // Combine and sort by newest
            const combined = [...mappedBooks, ...mappedSeries].sort((a, b) => {
                const dateA = new Date(a.releaseDate || 0).getTime();
                const dateB = new Date(b.releaseDate || 0).getTime();
                return dateB - dateA;
            });

            setItems(combined);
        } catch (err) {
            console.error('Failed to load permanent library:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        refresh();
    }, []);

    return { items, loading, error, refresh };
}
