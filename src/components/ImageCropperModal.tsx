import { useState } from 'react'
import Cropper from 'react-easy-crop'
import { getCroppedImg } from '../utils/imageUtils'
import { X, Check, RotateCcw } from 'lucide-react'

interface ImageCropperModalProps {
    image: string
    onCropComplete: (croppedImage: Blob) => void
    onCancel: () => void
}

export function ImageCropperModal({ image, onCropComplete, onCancel }: ImageCropperModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop)
    }

    const onZoomChange = (zoom: number) => {
        setZoom(zoom)
    }

    const onCropCompleteInternal = (_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }

    const handleCrop = async () => {
        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels)
            if (croppedImage) {
                onCropComplete(croppedImage)
            }
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-white font-bold">Ajustar Foto de Perfil</h3>
                    <button onClick={onCancel} className="p-2 text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Cropper Area */}
                <div className="relative flex-1 min-h-[300px] sm:min-h-[400px] bg-black">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteInternal}
                        onZoomChange={onZoomChange}
                        cropShape="round"
                        showGrid={false}
                    />
                </div>

                {/* Controls */}
                <div className="p-6 space-y-6 bg-slate-900">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                            <span>Zoom</span>
                            <span>{Math.round(zoom * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-slate-300 font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={18} />
                            Cancelar
                        </button>
                        <button
                            onClick={handleCrop}
                            className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                        >
                            <Check size={18} />
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
