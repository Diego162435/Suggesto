import { X, Lock } from 'lucide-react'
import { useState, useEffect } from 'react'

interface PinModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (pin: string) => void
    title?: string
    description?: string
    correctPin?: string // If provided, validates against this. If null, it's setting a new PIN mode logic optionally handled by parent.
}

export function PinModal({
    isOpen,
    onClose,
    onSuccess,
    title = "Digite o PIN",
    description = "Digite o código de 4 dígitos para continuar.",
    correctPin
}: PinModalProps) {
    const [pin, setPin] = useState(['', '', '', ''])
    const [error, setError] = useState(false)
    const [shake, setShake] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setPin(['', '', '', ''])
            setError(false)
            // Focus first input
            setTimeout(() => document.getElementById('pin-0')?.focus(), 100)
        }
    }, [isOpen])

    const handleInput = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return

        const newPin = [...pin]
        newPin[index] = value
        setPin(newPin)

        if (value && index < 3) {
            document.getElementById(`pin-${index + 1}`)?.focus()
        }

        // Check if complete
        if (newPin.every(d => d !== '')) {
            const enteredPin = newPin.join('')
            if (correctPin && enteredPin !== correctPin) {
                setError(true)
                setShake(true)
                setTimeout(() => setShake(false), 500)
                setPin(['', '', '', ''])
                document.getElementById('pin-0')?.focus()
            } else {
                onSuccess(enteredPin)
            }
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            document.getElementById(`pin-${index - 1}`)?.focus()
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className={`w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-6 shadow-2xl ${shake ? 'animate-shake' : ''}`}>
                <div className="flex w-full justify-between items-start">
                    <div className="p-3 bg-blue-500/20 rounded-2xl">
                        <Lock size={24} className="text-blue-400" />
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-white">{title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
                </div>

                <div className="flex gap-4 my-4">
                    {pin.map((digit, i) => (
                        <input
                            key={i}
                            id={`pin-${i}`}
                            type="password"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleInput(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            className={`w-14 h-16 rounded-xl bg-slate-800 text-center text-2xl font-bold text-white border-2 focus:outline-none focus:scale-105 transition-all
                                ${error ? 'border-red-500' : 'border-transparent focus:border-blue-500'}
                            `}
                        />
                    ))}
                </div>

                {error && <p className="text-red-400 text-sm font-bold animate-pulse">PIN incorreto. Tente novamente.</p>}
            </div>
        </div>
    )
}
