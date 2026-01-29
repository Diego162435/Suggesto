export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    updated_at: string | null
                    username: string | null
                    avatar_url: string | null
                }
                Insert: {
                    id: string
                    updated_at?: string | null
                    username?: string | null
                    avatar_url?: string | null
                }
                Update: {
                    id?: string
                    updated_at?: string | null
                    username?: string | null
                    avatar_url?: string | null
                }
            }
            user_ratings: {
                Row: {
                    id: string
                    user_id: string
                    created_at: string
                    media_id: string
                    media_type: 'movie' | 'book'
                    title: string
                    poster_path: string | null
                    rating: number
                    pace: 'slow' | 'medium' | 'fast'
                    genre: string
                    comment: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    created_at?: string
                    media_id: string
                    media_type: 'movie' | 'book'
                    title: string
                    poster_path?: string | null
                    rating: number
                    pace: 'slow' | 'medium' | 'fast'
                    genre: string
                    comment?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    created_at?: string
                    media_id?: string
                    media_type?: 'movie' | 'book'
                    title?: string
                    poster_path?: string | null
                    rating?: number
                    pace?: 'slow' | 'medium' | 'fast'
                    genre?: string
                    comment?: string | null
                }
            }
            wishlist: {
                Row: {
                    id: string
                    user_id: string
                    created_at: string
                    media_id: string
                    media_type: 'movie' | 'book'
                    title: string
                    poster_path: string | null
                    status: 'want_to_consume' | 'consumed'
                }
                Insert: {
                    id?: string
                    user_id: string
                    created_at?: string
                    media_id: string
                    media_type: 'movie' | 'book'
                    title: string
                    poster_path?: string | null
                    status: 'want_to_consume' | 'consumed'
                }
                Update: {
                    id?: string
                    user_id?: string
                    created_at?: string
                    media_id?: string
                    media_type?: 'movie' | 'book'
                    title?: string
                    poster_path?: string | null
                    status?: 'want_to_consume' | 'consumed'
                }
            }
        }
    }
}
