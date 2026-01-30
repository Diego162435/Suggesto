import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { AuthPage } from './features/auth/AuthPage'
import { ResetPasswordPage } from './features/auth/ResetPasswordPage'
import { Onboarding } from './features/onboarding/Onboarding'
import { DetailsPage } from './features/details/DetailsPage'
import { SimilarPage } from './features/details/SimilarPage'
import { Dashboard } from './features/dashboard/Dashboard'
import { Wishlist } from './features/wishlist/Wishlist'
import { History } from './features/history/History'
import { FavoritesPage } from './features/favorites/FavoritesPage'
import { PremiumHomePage } from './features/home/PremiumHomePage'
import { SettingsPage } from './features/profile/SettingsPage'
import { LegalPage } from './features/legal/LegalPage'
import { AdminPanel } from './features/admin/AdminPanel'
import { MobileNav } from './components/MobileNav'
import { Sidebar } from './components/Sidebar'
import { Footer } from './components/Footer'
import { supabase } from './services/supabase'
import { TopNavbar } from './components/TopNavbar'
import { useExternalLinkHandler } from './hooks/useExternalLinkHandler'
import { initOneSignal } from './services/pushNotificationService'
import { ParentalControlProvider } from './context/ParentalControlContext'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const location = useLocation()

    const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null)

    useEffect(() => {
        async function checkOnboarding() {
            if (!user) {
                setIsOnboardingComplete(null)
                return
            }

            // Sync with localStorage for instant skip
            const cached = localStorage.getItem(`onboarding_complete_${user.id}`) === 'true'
            if (cached) {
                setIsOnboardingComplete(true)
                return
            }

            try {
                // Return to timeout-based fetch for resilience
                const profilePromise = supabase
                    .from('profiles')
                    .select('preferences')
                    .eq('id', user.id)
                    .maybeSingle()

                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Onboarding fetch timeout')), 3000)
                )

                const { data, error }: any = await Promise.race([profilePromise, timeoutPromise])

                if (error) {
                    console.warn('ProtectedRoute: DB error or missing column during onboarding check:', error)
                    setIsOnboardingComplete(true) // Don't block
                    return
                }

                const complete = data?.preferences?.onboarding_completed === true
                if (complete) {
                    localStorage.setItem(`onboarding_complete_${user.id}`, 'true')
                }
                setIsOnboardingComplete(complete)
            } catch (e) {
                console.warn("ProtectedRoute: Onboarding check fail or timeout. Proceeding as if complete.", e)
                setIsOnboardingComplete(true) // Don't block on network issues
            }
        }

        checkOnboarding()
    }, [user, location.pathname])

    if (loading || (user && isOnboardingComplete === null)) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                    <span className="text-white/50 text-sm">Carregando portal...</span>
                </div>
            </div>
        )
    }

    if (!user) return <Navigate to="/auth" replace />

    if (isOnboardingComplete === false && location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" replace />
    }

    if (isOnboardingComplete === true && location.pathname === '/onboarding') {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}

function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-transparent">
            <Sidebar />
            <main
                className="flex-1 w-full flex flex-col min-h-screen transition-[padding] duration-300 ease-in-out"
                style={{ paddingLeft: 'var(--sidebar-width, 80px)' }}
            >
                <TopNavbar />
                <div className="flex-1 pb-20 md:pb-0">
                    {children}
                </div>
                <Footer />
            </main>
            <MobileNav />
        </div>
    )
}

function App() {
    useExternalLinkHandler()

    useEffect(() => {
        initOneSignal()
    }, [])

    return (
        <Router>
            <ParentalControlProvider>
                <Routes>
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/legal/:type" element={<LegalPage />} />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <AdminPanel />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/onboarding"
                        element={
                            <ProtectedRoute>
                                <Onboarding />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <PremiumHomePage />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/browse/:filter"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <Dashboard />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/wishlist"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <Wishlist />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/history"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <History />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/details/:type/:id"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <DetailsPage />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/similar/:type/:id"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <SimilarPage />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/favorites"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <FavoritesPage />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <SettingsPage />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </ParentalControlProvider>
        </Router>
    )
}

export default App
