import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { MediaDetails } from './MediaDetails'

interface MediaDetailsModalProps {
    type: string
    id: string
    onClose: () => void
}

export function MediaDetailsModal({ type, id, onClose }: MediaDetailsModalProps) {
    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [])

    return createPortal(
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Slide-over Content (like a drawer or full screen modal) */}
            <div className="relative w-full max-w-[1600px] h-full bg-slate-950 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">
                <MediaDetails type={type} id={id} onClose={onClose} />
            </div>
        </div>,
        document.body
    )
}
