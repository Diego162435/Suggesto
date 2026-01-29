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
    const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null)
    const location = useLocation()

    useEffect(() => {
        async function checkOnboarding() {
            if (!user) {
                setIsOnboardingComplete(null)
                return
            }

            try {
                // Check preferences in profile
                const { data, error } = await supabase
                    .from('profiles')
                    .select('preferences')
                    .eq('id', user.id)
                    .maybeSingle()

                if (error) {
                    console.warn('Error fetching onboarding status:', error)
                    // On error, assume onboarding not complete to be safe
                    setIsOnboardingComplete(false)
                    return
                }

                if (!data) {
                    console.log('No profile found, onboarding required')
                    setIsOnboardingComplete(false)
                    return
                }

                const prefs = (data as any).preferences as any
                const isComplete = prefs?.onboarding_completed === true

                console.log('Onboarding check:', {
                    hasPreferences: !!prefs,
                    onboardingCompleted: prefs?.onboarding_completed,
                    isComplete
                })

                setIsOnboardingComplete(isComplete)
            } catch (e) {
                console.error("Critical onboarding check error", e)
                setIsOnboardingComplete(false)
            }
        }

        checkOnboarding()
    }, [user])

    if (loading || (user && isOnboardingComplete === null)) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950 text-white gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Carregando...
            </div>
        )
    }

    if (!user) return <Navigate to="/auth" replace />

    if (isOnboardingComplete === false && location.pathname !== '/onboarding') {
        console.log('Redirecting to onboarding')
        return <Navigate to="/onboarding" replace />
    }

    if (isOnboardingComplete === true && location.pathname === '/onboarding') {
        console.log('Onboarding complete, redirecting to home')
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
