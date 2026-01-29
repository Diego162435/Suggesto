import { Share2 } from 'lucide-react'
import { useState } from 'react'
import { ShareModal } from './ShareModal'

interface ShareButtonProps {
    title: string
    text: string
    url?: string
    className?: string
}

export function ShareButton({ title, text, url = window.location.href, className = "" }: ShareButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className={`flex items-center justify-center gap-2 transition-all active:scale-95 ${className}`}
                title="Compartilhar"
            >
                <Share2 size={20} />
                <span className="font-medium">Compartilhar</span>
            </button>

            <ShareModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={title}
                text={text}
                url={url}
            />
        </>
    )
}
