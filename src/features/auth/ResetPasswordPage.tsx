import React, { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import { useNavigate } from 'react-router-dom'
import { Lock, Loader2, ArrowRight } from 'lucide-react'

export function ResetPasswordPage() {
    const [loading, setLoading] = useState(false)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        // Check if we have a session (Supabase should have logged us in via the reset link)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setError('Link de recuperação inválido ou expirado.')
            }
        }
        checkSession()
    }, [])

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.')
            return
        }

        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })
            if (error) throw error
            setMessage('Senha atualizada com sucesso! Redirecionando...')
            setTimeout(() => navigate('/auth'), 3000)
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
                        Nova Senha
                    </h1>
                    <p className="text-slate-400">
                        Digite sua nova senha de acesso
                    </p>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Nova Senha
                        </label>
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

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Confirmar Senha
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 placeholder-slate-500 transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

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
                        disabled={loading || !!message}
                        className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin h-5 w-5" />
                        ) : (
                            <>
                                Atualizar Senha
                                <ArrowRight size={18} className="ml-2" />
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center">
                    <button
                        onClick={() => navigate('/auth')}
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        Voltar para o login
                    </button>
                </div>
            </div>
        </div>
    )
}
