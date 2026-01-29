import { supabase } from './supabase';

export interface Series {
    id?: string;
    title: string;
    overview?: string;
    poster_path?: string;
    release_date?: string;
    vote_average?: number;
    seasons?: any[]; // JSONB in DB
    episodes?: any[]; // JSONB in DB
    genres?: string[];
    created_at?: string;
}

export const seriesApi = {
    async listSeries(page = 1, limit = 20) {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await (supabase as any)
            .from('series')
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

    async getSeries(id: string) {
        const { data, error } = await (supabase as any)
            .from('series')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async createSeries(series: Series) {
        const { data, error } = await (supabase as any)
            .from('series')
            .insert(series)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateSeries(id: string, updates: Partial<Series>) {
        const { data, error } = await (supabase as any)
            .from('series')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteSeries(id: string) {
        const { error } = await (supabase as any)
            .from('series')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
