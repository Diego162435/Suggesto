import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    isAdmin: boolean
    signOut: () => Promise<void>
    deleteAccount: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const handleSession = async (session: Session | null) => {
            setSession(session)
            setUser(session?.user ?? null)

            if (session?.user) {
                try {
                    const { data } = await (supabase as any)
                        .from('profiles')
                        .select('is_admin')
                        .eq('id', session.user.id)
                        .maybeSingle()
                    setIsAdmin(!!(data as any)?.is_admin)
                } catch (err) {
                    console.error("Admin check error", err)
                    setIsAdmin(false)
                }
            } else {
                setIsAdmin(false)
            }
            setLoading(false)
        }

        const initAuth = async () => {
            try {
                const { data: { session: initialSession } } = await supabase.auth.getSession()
                await handleSession(initialSession)
            } catch (err) {
                console.error("Auth session error", err)
                setLoading(false)
            }
        }

        initAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            await handleSession(newSession)
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const signOut = async () => {
        await supabase.auth.signOut()
    }

    const deleteAccount = async () => {
        try {
            const { error } = await supabase.rpc('delete_user')
            if (error) throw error
            await signOut()
        } catch (error) {
            console.error('Error deleting account:', error)
            throw error
        }
    }

    // ALWAYS render children. Internal routes/components will handle loading state if they need to.
    return (
        <AuthContext.Provider value={{ user, session, loading, isAdmin, signOut, deleteAccount }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
