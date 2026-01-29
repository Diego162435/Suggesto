import { X, Copy, Check, Share2, Facebook, Twitter, Linkedin, MessageCircle, Send } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface ShareModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    text: string
    url: string
}

export function ShareModal({ isOpen, onClose, title, text, url }: ShareModalProps) {
    const [copied, setCopied] = useState(false)
    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose()
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(`${text}\n\n${url}`)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy', err)
        }
    }

    // Social Share Links
    const encodedText = encodeURIComponent(text)
    const encodedUrl = encodeURIComponent(url)

    const socialLinks = [
        {
            name: 'WhatsApp',
            icon: MessageCircle,
            color: 'bg-[#25D366] hover:bg-[#128C7E]',
            url: `https://wa.me/?text=${encodedText}%20${encodedUrl}`
        },
        {
            name: 'Twitter (X)',
            icon: Twitter,
            color: 'bg-black hover:bg-slate-800 border border-white/10',
            url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
        },
        {
            name: 'Facebook',
            icon: Facebook,
            color: 'bg-[#1877F2] hover:bg-[#166FE5]',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        },
        {
            name: 'Telegram',
            icon: Send,
            color: 'bg-[#0088cc] hover:bg-[#007db1]',
            url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
        },
        {
            name: 'LinkedIn',
            icon: Linkedin,
            color: 'bg-[#0A66C2] hover:bg-[#004182]',
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        }
    ]

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                ref={modalRef}
                className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <Share2 size={18} className="text-blue-400" />
                        Compartilhar
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Social Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        {socialLinks.map((social) => (
                            <a
                                key={social.name}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all transform hover:scale-105 ${social.color} text-white group`}
                            >
                                <social.icon size={24} className="group-hover:animate-bounce" />
                                <span className="text-[10px] font-bold uppercase tracking-wide opacity-90">{social.name}</span>
                            </a>
                        ))}
                    </div>

                    {/* Copy Link Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Link Direto</label>
                        <div className="flex bg-black/30 border border-white/10 rounded-xl overflow-hidden p-1">
                            <input
                                type="text"
                                readOnly
                                value={url}
                                className="bg-transparent text-sm text-slate-300 px-3 w-full focus:outline-none"
                            />
                            <button
                                onClick={handleCopy}
                                className={`flex-shrink-0 px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${copied ? 'bg-green-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? 'Copiado' : 'Copiar'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Native Share Fallback (Optional, for mobile users who prefer system) */}
                {navigator.share && (
                    <div className="p-4 bg-slate-950 border-t border-white/5 text-center">
                        <button
                            onClick={() => {
                                navigator.share({ title, text, url }).catch(() => { })
                            }}
                            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                        >
                            Usar opções do sistema...
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
