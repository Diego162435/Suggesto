import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'
import { User, Camera, Save, ArrowLeft, RefreshCw, LogOut, Trash2, Lock, Baby } from 'lucide-react'
import { ImageCropperModal } from '../../components/ImageCropperModal'
import { PinModal } from '../../components/PinModal'
import { useParentalControl } from '../../context/ParentalControlContext'

export function SettingsPage() {
    const { user, signOut, deleteAccount } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [fullName, setFullName] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')
    const [message, setMessage] = useState<{ type: string, text: string } | null>(null)
    const [tempImage, setTempImage] = useState<string | null>(null)
    const [showCropper, setShowCropper] = useState(false)
    const [showPinModal, setShowPinModal] = useState(false)
    const [pinMode, setPinMode] = useState<'setup' | 'verify'>('setup')
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

    const { isKidsMode, hasPin, setParentalPin, enterKidsMode, exitKidsMode, allowedRatings, setAllowedRatings, verifyPin } = useParentalControl()

    useEffect(() => {
        async function loadProfile() {
            if (!user) {
                setFetching(false)
                return
            }
            try {
                const { data, error } = await (supabase as any)
                    .from('profiles')
                    .select('full_name, avatar_url')
                    .eq('id', user.id)
                    .maybeSingle()

                if (error) throw error
                if (data) {
                    setFullName(data.full_name || '')
                    setAvatarUrl(data.avatar_url || '')
                }
            } catch (error) {
                console.error('Error loading profile:', error)
            } finally {
                setFetching(false)
            }
        }
        loadProfile()
    }, [user])

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user) return

        const reader = new FileReader()
        reader.addEventListener('load', () => {
            setTempImage(reader.result as string)
            setShowCropper(true)
        })
        reader.readAsDataURL(file)
    }

    const handleCropComplete = async (croppedBlob: Blob) => {
        setShowCropper(false)
        setLoading(true)
        setMessage(null)

        try {
            const fileName = `${user?.id}-${Date.now()}.jpg`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, croppedBlob, {
                    contentType: 'image/jpeg'
                })

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            setAvatarUrl(publicUrl)

            const { error: updateError } = await (supabase
                .from('profiles') as any)
                .update({ avatar_url: publicUrl })
                .eq('id', user?.id)

            if (updateError) throw updateError

            setMessage({ type: 'success', text: 'Foto atualizada com sucesso!' })
        } catch (error: any) {
            console.error('Error uploading avatar:', error)
            setMessage({ type: 'error', text: error.message || 'Erro ao salvar imagem cortada.' })
        } finally {
            setLoading(false)
            setTempImage(null)
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        setLoading(true)
        setMessage(null)

        try {
            const { error } = await (supabase
                .from('profiles') as any)
                .upsert({
                    id: user.id,
                    full_name: fullName,
                    avatar_url: avatarUrl,
                    updated_at: new Date().toISOString()
                })

            if (error) throw error
            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Erro ao atualizar perfil.' })
        } finally {
            setLoading(false)
        }
    }

    const handleResetOnboarding = async () => {
        if (!user) return
        if (!window.confirm('Isso resetará suas preferências de gêneros e o levará de volta ao Onboarding. Continuar?')) return

        setLoading(true)
        try {
            const { data: profile } = await supabase.from('profiles').select('preferences').eq('id', user.id).single() as any
            const prefs = (profile?.preferences as any) || {}

            const { error } = await (supabase
                .from('profiles') as any)
                .update({
                    preferences: {
                        ...prefs,
                        onboarding_completed: false
                    }
                })
                .eq('id', user.id)

            if (error) throw error
            navigate('/onboarding')
        } catch (error: any) {
            alert('Erro ao resetar: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-transparent text-white p-6">
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="flex items-center gap-4 mb-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold tracking-tight">Configurações de Perfil</h1>
                </div>

                {/* Profile Form */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-8 shadow-2xl">
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        {/* Avatar Preview */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-blue-500/30 flex items-center justify-center overflow-hidden">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={40} className="text-slate-500" />
                                    )}
                                </div>
                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <Camera size={20} className="text-white" />
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        disabled={loading}
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-slate-500">Toque na imagem para mudar a foto</p>
                        </div>

                        {/* Fields */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Nome Completo</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Seu nome"
                                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                />
                            </div>

                            {/* Removido input de URL para simplificar, já que agora temos Upload */}

                            <div className="pt-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">E-mail (Não editável)</label>
                                <div className="w-full bg-slate-800/30 border border-white/5 rounded-xl px-4 py-3 text-slate-500 mt-2">
                                    {user?.email}
                                </div>
                            </div>
                        </div>

                        {message && (
                            <div className={`p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                        >
                            {loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                            Salvar Alterações
                        </button>
                    </form>
                </div>

                {/* Additional Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={handleResetOnboarding}
                        disabled={loading}
                        className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl hover:bg-blue-500/5 hover:border-blue-500/20 transition-all text-left group"
                    >
                        <RefreshCw size={24} className="text-blue-500 mb-4 group-hover:rotate-180 transition-transform duration-700" />
                        <h3 className="text-white font-bold mb-1">Mudar Preferências</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">Refaça o processo de escolha de gêneros para recalibrar suas recomendações.</p>
                    </button>

                    <button
                        onClick={() => {
                            if (window.confirm('Tem certeza? Essa ação é EXTREMA e IRREVERSÍVEL.')) {
                                deleteAccount?.()
                            }
                        }}
                        className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl hover:bg-red-500/5 hover:border-red-500/20 transition-all text-left group"
                    >
                        <Trash2 size={24} className="text-red-500 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="text-red-400 font-bold mb-1">Excluir Conta</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">Remova permanentemente todos os seus dados e histórico do Suggesto.</p>
                    </button>
                </div>

                {/* Parental Controls Section */}
                <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-3xl p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <Lock className="text-indigo-400" size={24} />
                        <h2 className="text-xl font-bold text-white">Controle dos Pais</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => {
                                if (hasPin) {
                                    setPinMode('verify')
                                    setPendingAction(() => () => {
                                        setPinMode('setup')
                                        setTimeout(() => setShowPinModal(true), 100) // Reopen for setup
                                    })
                                    setShowPinModal(true)
                                } else {
                                    setPinMode('setup')
                                    setShowPinModal(true)
                                }
                            }}
                            className="bg-indigo-950/50 border border-indigo-500/30 p-6 rounded-2xl hover:bg-indigo-900/50 transition-all text-left group"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <Lock size={20} className="text-indigo-400" />
                                <span className="text-xs font-bold bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full uppercase">
                                    {hasPin ? 'Alterar' : 'Configurar'}
                                </span>
                            </div>
                            <h3 className="text-white font-bold mb-1">PIN de Segurança</h3>
                            <p className="text-xs text-indigo-200/70 leading-relaxed">
                                {hasPin
                                    ? 'PIN configurado. Necessário para sair do Modo Kids.'
                                    : 'Proteja o acesso criando uma senha de 4 números.'}
                            </p>
                        </button>

                        <button
                            onClick={() => {
                                if (!hasPin) {
                                    alert('Configure um PIN primeiro para usar o Modo Kids com segurança.')
                                    setPinMode('setup')
                                    setShowPinModal(true)
                                    return
                                }

                                // Security Check before toggling
                                setPinMode('verify')
                                setPendingAction(() => () => {
                                    if (isKidsMode) {
                                        exitKidsMode()
                                    } else {
                                        enterKidsMode()
                                        navigate('/')
                                    }
                                })
                                setShowPinModal(true)
                            }}
                            disabled={!hasPin}
                            className={`p-6 rounded-2xl border transition-all text-left group
                                ${isKidsMode
                                    ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20'
                                    : 'bg-purple-900/20 border-purple-500/30 hover:bg-purple-900/40'
                                }
                                ${!hasPin ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <Baby size={20} className={isKidsMode ? "text-green-400" : "text-purple-400"} />
                                <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase
                                    ${isKidsMode ? 'bg-green-500/20 text-green-300' : 'bg-purple-500/20 text-purple-300'}`
                                }>
                                    {isKidsMode ? 'Ativado' : 'Desativado'}
                                </span>
                            </div>
                            <h3 className="text-white font-bold mb-1">Modo Kids</h3>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                {isKidsMode
                                    ? 'O app está filtrando conteúdo para crianças.'
                                    : 'Ative para mostrar apenas conteúdo livre (L / 10 anos).'}
                            </p>
                        </button>
                    </div>


                    {/* Content Ratings Selection */}
                    <div className="bg-indigo-950/30 rounded-2xl p-6 border border-indigo-500/10">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Baby size={18} className="text-indigo-400" />
                            Classificação Indicativa Permitida
                        </h3>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                            {['L', '10', '12', '14', '16', '18'].map((rating) => {
                                const isAllowed = allowedRatings.includes(rating)
                                return (
                                    <button
                                        key={rating}
                                        onClick={() => {
                                            if (!hasPin) return alert('Configure um PIN primeiro')

                                            // Security Check for changing ratings
                                            setPinMode('verify')
                                            setPendingAction(() => () => {
                                                const newRatings = isAllowed
                                                    ? allowedRatings.filter((r: string) => r !== rating)
                                                    : [...allowedRatings, rating]
                                                setAllowedRatings(newRatings)
                                            })
                                            setShowPinModal(true)
                                        }}
                                        className={`h-12 rounded-xl font-black border-2 transition-all
                                            ${isAllowed
                                                ? 'bg-green-500 text-slate-900 border-green-500 hover:bg-green-400'
                                                : 'bg-slate-800 text-slate-500 border-transparent hover:border-slate-600'
                                            }
                                        `}
                                    >
                                        {rating}
                                    </button>
                                )
                            })}
                        </div>
                        <p className="text-xs text-indigo-300 mt-3 opacity-60">
                            Selecione quais faixas etárias podem ser exibidas no Modo Kids.
                        </p>
                    </div>
                </div>

                <div className="flex justify-center pt-8">
                    <button
                        onClick={() => signOut()}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium uppercase tracking-widest"
                    >
                        <LogOut size={16} />
                        Sair da Conta
                    </button>
                </div>
            </div >

            {showCropper && tempImage && (
                <ImageCropperModal
                    image={tempImage}
                    onCropComplete={handleCropComplete}
                    onCancel={() => {
                        setShowCropper(false)
                        setTempImage(null)
                    }}
                />
            )
            }

            <PinModal
                isOpen={showPinModal}
                onClose={() => setShowPinModal(false)}
                onSuccess={async (pin) => {
                    if (pinMode === 'verify') {
                        const isValid = await verifyPin(pin)
                        if (isValid) {
                            setShowPinModal(false)
                            pendingAction?.()
                            setPendingAction(null)
                        } else {
                            alert('PIN Incorreto')
                        }
                    } else {
                        setParentalPin(pin)
                        setShowPinModal(false)
                        setMessage({ type: 'success', text: 'PIN configurado com sucesso!' })
                    }
                }}
                title={pinMode === 'verify' ? "Verificar PIN" : (hasPin ? "Alterar PIN" : "Criar PIN")}
                description={pinMode === 'verify' ? "Confirme seu código de segurança." : (hasPin ? "Digite o novo código." : "Crie um código seguro.")}
            />
        </div >
    )
}
