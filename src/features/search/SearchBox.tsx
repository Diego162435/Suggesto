import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, Book, Film, Gamepad2, Tv, X, Star } from 'lucide-react'
import { MediaItem } from '../../types/media'
import { searchMovies, searchTv } from '../../services/tmdb'
import { searchBooks } from '../../services/books'
import { searchGames } from '../../services/games'
import { MediaImage } from '../../components/MediaImage'

// Define Filter Type
export type SearchFilter = 'all' | 'movie' | 'tv' | 'book' | 'game' | 'library'

interface SearchBoxProps {
    onSelect: (item: MediaItem) => void
    activeFilter?: SearchFilter
    placeholder?: string
}

// Simple debounce hook implementation inline for now or move to separate file if reused
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

export function SearchBox({ onSelect, activeFilter = 'all', placeholder }: SearchBoxProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<MediaItem[]>([])
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const debouncedQuery = useDebounceValue(query, 500)

    // Handle clicks outside the search box to close it
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setResults([])
            setIsOpen(false)
            return
        }

        const fetchResults = async () => {
            setLoading(true)
            setIsOpen(true)
            try {
                let movies: any = { results: [] }
                let tvs: any = { results: [] }
                let books: any = { results: [] }
                let games: any = { results: [] }

                const promises = []

                if (activeFilter === 'all' || activeFilter === 'movie') {
                    promises.push(searchMovies(debouncedQuery).then(res => movies = res).catch(() => { }))
                }
                if (activeFilter === 'all' || activeFilter === 'tv') {
                    promises.push(searchTv(debouncedQuery).then(res => tvs = res).catch(() => { }))
                }
                if (activeFilter === 'all' || activeFilter === 'book') {
                    promises.push(searchBooks(debouncedQuery).then(res => books = res).catch(() => { }))
                }
                if (activeFilter === 'all' || activeFilter === 'game') {
                    promises.push(searchGames(debouncedQuery).then(res => games = res).catch(() => { }))
                }

                await Promise.all(promises)

                const mixedResults = [
                    ...movies.results.slice(0, 5),
                    ...tvs.results.slice(0, 5),
                    ...books.results.slice(0, 5),
                    ...games.results.slice(0, 5)
                ].sort((a, b) => {
                    // Items with no rating go to bottom
                    const ratingA = a.voteAverage || 0
                    const ratingB = b.voteAverage || 0
                    if (ratingA === 0 && ratingB > 0) return 1
                    if (ratingB === 0 && ratingA > 0) return -1
                    return ratingB - ratingA
                })

                setResults(mixedResults)
            } catch (error) {
                console.error('Search failed', error)
            } finally {
                setLoading(false)
            }
        }

        fetchResults()
    }, [debouncedQuery, activeFilter])

    const handleClear = () => {
        setQuery('')
        setResults([])
        setIsOpen(false)
    }

    return (
        <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Search size={20} />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-10 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-800 text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                    placeholder={placeholder || (
                        activeFilter === 'game' ? "Busque por games..." :
                            activeFilter === 'book' ? "Busque por livros..." :
                                activeFilter === 'movie' ? "Busque por filmes..." :
                                    activeFilter === 'tv' ? "Busque por séries..." :
                                        "Busque por filmes, séries, livros ou games..."
                    )}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.trim() && setIsOpen(true)}
                />

                <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
                    {loading ? (
                        <Loader2 className="animate-spin text-blue-500" size={18} />
                    ) : query && (
                        <button
                            onClick={handleClear}
                            className="p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
                            aria-label="Limpar busca"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            {isOpen && results.length > 0 && query && (
                <ul className="absolute z-[100] mt-2 w-full bg-slate-800 shadow-2xl max-h-[70vh] rounded-xl py-2 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
                    {results.map((item) => (
                        <li
                            key={item.id}
                            className="cursor-pointer select-none relative py-3 pl-3 pr-4 hover:bg-slate-700/50 mx-2 rounded-lg transition-colors flex items-center gap-4"
                            onClick={() => {
                                onSelect(item)
                                handleClear()
                            }}
                        >

                            <div className="flex-shrink-0 w-12 h-16 bg-slate-700 rounded-md overflow-hidden shadow-sm">
                                <MediaImage
                                    src={item.posterPath}
                                    alt={item.title}
                                    type={item.type}
                                    className="w-full h-full"
                                />
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="font-bold text-white truncate text-sm">{item.title}</span>
                                <div className="text-slate-400 text-[11px] font-medium flex items-center gap-2 mt-1">
                                    <span className="px-1.5 py-0.5 bg-slate-900/50 rounded flex items-center gap-1 uppercase tracking-wider">
                                        {item.type === 'movie' ? <Film size={10} /> :
                                            item.type === 'tv' ? <Tv size={10} /> :
                                                item.type === 'game' ? <Gamepad2 size={10} /> :
                                                    <Book size={10} />}
                                        {item.type === 'movie' ? 'Filme' :
                                            item.type === 'tv' ? 'Série' :
                                                item.type === 'game' ? 'Jogo' :
                                                    'Livro'}
                                    </span>
                                    {item.releaseDate && <span>• {item.releaseDate.substring(0, 4)}</span>}
                                    {(item.voteAverage ?? 0) > 0 && <span className="flex items-center gap-0.5 text-yellow-500"><Star size={10} fill="currentColor" /> {(item.voteAverage ?? 0).toFixed(1)}</span>}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
