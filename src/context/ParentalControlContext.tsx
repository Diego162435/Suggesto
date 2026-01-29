import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from './AuthContext'

interface ParentalControlContextType {
    isKidsMode: boolean
    hasPin: boolean
    allowedRatings: string[]
    enterKidsMode: () => Promise<void>
    exitKidsMode: () => Promise<void>
    setParentalPin: (pin: string) => Promise<void>
    setAllowedRatings: (ratings: string[]) => Promise<void>
    verifyPin: (pin: string) => Promise<boolean>
    refreshParentalState: () => Promise<void>
}

const ParentalControlContext = createContext<ParentalControlContextType | undefined>(undefined)

export function ParentalControlProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const [isKidsMode, setIsKidsMode] = useState(false)
    const [hasPin, setHasPin] = useState(false)
    const [allowedRatings, setAllowedRatingsState] = useState<string[]>(['L', '10'])

    const refreshParentalState = async () => {
        if (!user) {
            setIsKidsMode(false)
            setHasPin(false)
            return
        }

        try {
            const { data } = await (supabase as any)
                .from('profiles')
                .select('is_kids_mode, parental_pin, allowed_content_ratings')
                .eq('id', user.id)
                .maybeSingle()

            if (data) {
                setIsKidsMode(!!data.is_kids_mode)
                setHasPin(!!data.parental_pin)
                if (data.allowed_content_ratings && Array.isArray(data.allowed_content_ratings)) {
                    setAllowedRatingsState(data.allowed_content_ratings)
                }
            }
        } catch (err) {
            console.error('Error fetching parental settings:', err)
        }
    }

    useEffect(() => {
        refreshParentalState()
    }, [user])

    const enterKidsMode = async () => {
        if (!user) return
        setIsKidsMode(true)
        await (supabase as any)
            .from('profiles')
            .update({ is_kids_mode: true })
            .eq('id', user.id)
    }

    const exitKidsMode = async () => {
        if (!user) return
        setIsKidsMode(false)
        await (supabase as any)
            .from('profiles')
            .update({ is_kids_mode: false })
            .eq('id', user.id)
    }

    const setParentalPin = async (pin: string) => {
        if (!user) return
        await (supabase as any)
            .from('profiles')
            .update({ parental_pin: pin })
            .eq('id', user.id)
        setHasPin(true)
    }

    const setAllowedRatings = async (ratings: string[]) => {
        if (!user) return
        setAllowedRatingsState(ratings)
        await (supabase as any)
            .from('profiles')
            .update({ allowed_content_ratings: ratings })
            .eq('id', user.id)
    }

    const verifyPin = async (inputPin: string): Promise<boolean> => {
        if (!user) return false
        const { data } = await (supabase as any)
            .from('profiles')
            .select('parental_pin')
            .eq('id', user.id)
            .single()

        return data?.parental_pin === inputPin
    }

    const memoizedAllowedRatings = useMemo(() => allowedRatings, [JSON.stringify(allowedRatings)])

    return (
        <ParentalControlContext.Provider value={{
            isKidsMode,
            hasPin,
            allowedRatings: memoizedAllowedRatings,
            enterKidsMode,
            exitKidsMode,
            setParentalPin,
            setAllowedRatings,
            verifyPin,
            refreshParentalState
        }}>
            {children}
        </ParentalControlContext.Provider>
    )
}

export function useParentalControl() {
    const context = useContext(ParentalControlContext)
    if (context === undefined) {
        throw new Error('useParentalControl must be used within a ParentalControlProvider')
    }
    return context
}
