import { supabase } from './supabase'

export interface AppNotification {
    id: string
    user_id: string
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'recommendation'
    is_read: boolean
    link: string | null
    created_at: string
}

export const notificationService = {
    async getNotifications(userId: string): Promise<AppNotification[]> {
        const { data, error } = await (supabase
            .from('notifications') as any)
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching notifications:', error)
            return []
        }
        return data || []
    },

    async markAsRead(notificationId: string) {
        const { error } = await (supabase
            .from('notifications') as any)
            .update({ is_read: true })
            .eq('id', notificationId)

        if (error) {
            console.error('Error marking notification as read:', error)
            throw error
        }
    },

    async markAllAsRead(userId: string) {
        const { error } = await (supabase
            .from('notifications') as any)
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false)

        if (error) {
            console.error('Error marking all notifications as read:', error)
            throw error
        }
    },

    subscribeToNotifications(userId: string, onUpdate: () => void) {
        // Simplified channel name and listener for better reliability
        return supabase
            .channel('notifications-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    console.log('Realtime notification update:', payload)
                    onUpdate()
                }
            )
            .subscribe((status) => {
                console.log('Notification subscription status:', status)
            })
    }
}
