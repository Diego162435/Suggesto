import React, { useState } from 'react'
import { supabase } from '../../services/supabase'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Loader2, ArrowRight, User } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

export function AuthPage() {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const [resetMode, setResetMode] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const { showToast } = useToast()
    const navigate = useNavigate()

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })
            if (error) throw error
            setMessage('E-mail de recuperação enviado! Verifique sua caixa de entrada.')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setLoading(true)
        setError(null)
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/`,
                },
            })
            if (error) throw error
        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                        },
                    },
                })
                if (error) throw error
                // Slight delay to allow auth state to propagate or show success message
                if (!error) showToast('Verifique seu e-mail para confirmar o cadastro!', 'success')
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                navigate('/')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <img src="/src/assets/logo.png" alt="Suggesto Logo" className="h-16 w-auto object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {resetMode ? 'Recuperar Senha' : isSignUp ? 'Criar Conta' : 'Bem-vindo'}
                    </h1>
                    <p className="text-slate-400">
                        {resetMode
                            ? 'Enviaremos um link para seu e-mail'
                            : isSignUp
                                ? 'Comece sua jornada de descobertas'
                                : 'Entre para ver suas recomendações'}
                    </p>
                </div>

                <form onSubmit={resetMode ? handleResetPassword : handleAuth} className="space-y-4 mb-6">
                    {isSignUp && !resetMode && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Nome
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    required={isSignUp}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 placeholder-slate-500 transition-colors"
                                    placeholder="Seu nome"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 placeholder-slate-500 transition-colors"
                                placeholder="seu@email.com"
                            />
                        </div>
                    </div>

                    {!resetMode && (
                        <div>
                            <div className="flex justify-between mb-1.5">
                                <label className="block text-sm font-medium text-slate-300">
                                    Senha
                                </label>
                                {!isSignUp && (
                                    <button
                                        type="button"
                                        onClick={() => setResetMode(true)}
                                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        Esqueceu sua senha?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 placeholder-slate-500 transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin h-5 w-5" />
                        ) : (
                            <>
                                {resetMode ? 'Enviar Link' : isSignUp ? 'Cadastrar' : 'Entrar'}
                                <ArrowRight size={18} className="ml-2" />
                            </>
                        )}
                    </button>

                    {!resetMode && (
                        <>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-800"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-slate-900 text-slate-500">Ou continuar com</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 rounded-lg transition-all border border-slate-700 hover:border-slate-600 disabled:opacity-50"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
                            </button>
                        </>
                    )}
                </form>

                <div className="text-center">
                    <button
                        onClick={() => {
                            if (resetMode) {
                                setResetMode(false)
                            } else {
                                setIsSignUp(!isSignUp)
                            }
                        }}
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        {resetMode
                            ? 'Voltar para o login'
                            : isSignUp
                                ? 'Já tem uma conta? Faça login'
                                : 'Não tem conta? Crie uma agora'}
                    </button>
                </div>
            </div>
        </div>
    )
}
