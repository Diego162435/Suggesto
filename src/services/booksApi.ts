import { supabase } from './supabase';

export interface Book {
    id?: string;
    title: string;
    author?: string;
    overview?: string;
    poster_path?: string;
    release_date?: string;
    vote_average?: number;
    page_count?: number;
    genres?: string[];
    created_at?: string;
}

export const booksApi = {
    async listBooks(page = 1, limit = 20) {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await (supabase as any)
            .from('books')
            .select('*', { count: 'exact' })
            .range(from, to)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return {
            data,
            count,
            page,
            totalPages: count ? Math.ceil(count / limit) : 0
        };
    },

    async getBook(id: string) {
        const { data, error } = await (supabase as any)
            .from('books')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async createBook(book: Book) {
        const { data, error } = await (supabase as any)
            .from('books')
            .insert(book)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateBook(id: string, updates: Partial<Book>) {
        const { data, error } = await (supabase as any)
            .from('books')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteBook(id: string) {
        const { error } = await (supabase as any)
            .from('books')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
