import {
    Swords,
    Ghost,
    Heart,
    Laugh,
    Rocket,
    Brain,
    Baby,
    Scroll,
    Globe,
    Film,
    Briefcase,
    FlaskConical
} from 'lucide-react'

export interface GenreOption {
    id: string
    label: string
    type: 'movie' | 'tv' | 'book' | 'game' | 'general'
    icon: any
    image?: string
    tmdbId?: number
    googleQuery?: string
}

export const GENRES: GenreOption[] = [
    // Movies / General
    { id: 'action', label: 'Ação e Aventura', type: 'movie', icon: Swords, tmdbId: 28, image: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=800&auto=format&fit=crop' },
    { id: 'scifi', label: 'Ficção Científica', type: 'movie', icon: Rocket, tmdbId: 878, image: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=800&auto=format&fit=crop' },
    { id: 'fantasy', label: 'Fantasia', type: 'movie', icon: Scroll, tmdbId: 14, image: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=800&auto=format&fit=crop' },
    { id: 'horror', label: 'Terror', type: 'movie', icon: Ghost, tmdbId: 27, image: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=800&auto=format&fit=crop' },
    { id: 'comedy', label: 'Comédia', type: 'movie', icon: Laugh, tmdbId: 35, image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?q=80&w=800&auto=format&fit=crop' },
    { id: 'romance', label: 'Romance', type: 'movie', icon: Heart, tmdbId: 10749, image: 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?q=80&w=800&auto=format&fit=crop' },

    // Knowledge / Books
    { id: 'business', label: 'Negócios', type: 'book', icon: Briefcase, googleQuery: 'business', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&auto=format&fit=crop' },
    { id: 'history', label: 'História', type: 'book', icon: Globe, googleQuery: 'history', image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=800&auto=format&fit=crop' },
    { id: 'science', label: 'Ciência', type: 'book', icon: FlaskConical, googleQuery: 'science', image: 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?q=80&w=800&auto=format&fit=crop' },
    { id: 'psychology', label: 'Psicologia', type: 'book', icon: Brain, googleQuery: 'psychology', image: 'https://images.unsplash.com/photo-1616198814651-e71f960c3180?q=80&w=800&auto=format&fit=crop' },

    // Misc
    { id: 'documentary', label: 'Documentários', type: 'movie', icon: Film, tmdbId: 99, image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=800&auto=format&fit=crop' },
    { id: 'kids', label: 'Infantil', type: 'general', icon: Baby, tmdbId: 10762, image: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?q=80&w=800&auto=format&fit=crop' },
]
