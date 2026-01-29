import { ShoppingBag, ChevronRight, Search } from 'lucide-react'
import { MediaItem } from '../types/media'
import { generateAmazonLink } from '../utils/amazon'

interface ShopTheVibeProps {
    item: MediaItem
}

export function ShopTheVibe({ item }: ShopTheVibeProps) {
    // Strategy: Generate "Smart Queries" based on media type and genre

    const suggestions = []

    // 1. Core Product (The Item Itself)
    if (item.type === 'book') {
        suggestions.push({
            label: "Edição Física / Kindle",
            query: `${item.title} livro book`,
            icon: "📚",
            desc: "Garanta sua cópia física ou digital"
        })
        suggestions.push({
            label: "Acessórios de Leitura",
            query: "luminaria leitura marca pagina criativo",
            icon: "💡",
            desc: "Melhore seu momento de leitura"
        })
    } else {
        // Movies/TV
        suggestions.push({
            label: "Mídia Física",
            query: `${item.title} blu-ray dvd 4k`,
            icon: "💿",
            desc: "Para sua coleção pessoal"
        })
    }

    // 2. Merch & Vibe based on Genre
    const firstGenre = item.genres?.[0] || ''

    if (item.type !== 'book') {
        // Broad "Universe" search instead of just Funkos
        suggestions.push({
            label: `Universo ${item.title}`,
            query: `${item.title} colecionáveis merchandise camiseta caneca decoracao`,
            icon: "🪐",
            desc: "Roupas, decoração e itens de fã"
        })
    } else {
        // More book suggestions
        suggestions.push({
            label: "Estante & Organização",
            query: "aparador livros booknook",
            icon: "🏠",
            desc: "Deixe sua estante incrível"
        })
    }

    // 3. Special "Vibe" items
    if (firstGenre.includes('Terror') || firstGenre.includes('Horror')) {
        suggestions.push({ label: "Vibe de Terror", query: "luz noturna halloween decoracao", icon: "👻", desc: "Entre no clima (se tiver coragem)" })
    } else if (firstGenre.includes('Sci-Fi') || firstGenre.includes('Fantasia')) {
        suggestions.push({ label: "Setup Geek", query: "decoração geek nerd futurista led", icon: "🚀", desc: "Itens futuristas para seu quarto" })
    } else if (firstGenre.includes('Romance')) {
        suggestions.push({ label: "Kit Romântico", query: "presente namorados chocolate pelucia", icon: "💝", desc: "Para curtir a dois" })
    } else if (firstGenre.includes('Ação') || firstGenre.includes('Aventura')) {
        suggestions.push({ label: "Aventura Outdoor", query: "mochila garrafa termica sport", icon: "🏔️", desc: "Para sua próxima jornada" })
    } else {
        // Fallback generic
        suggestions.push({ label: "Itens Colecionáveis", query: `${item.title} colecionáveis`, icon: "🎁", desc: "Presentes e lembranças de fã" })
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <ShoppingBag size={20} className="text-yellow-500" />
                <h2 className="text-xl font-bold text-white">
                    Shop the Vibe <span className="text-xs font-normal text-slate-500 ml-2 border border-slate-700 px-2 py-0.5 rounded-full">Beta</span>
                </h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">Complete a experiência com itens inspirados em <span className="text-white font-medium">{item.title}</span>.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {suggestions.slice(0, 4).map((suggestion, idx) => { // Limit to 4 to keep grid clean
                    const link = generateAmazonLink(item.title, 'product', suggestion.query)

                    return (
                        <a
                            key={idx}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-yellow-500/50 hover:bg-slate-800 transition-all cursor-pointer relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Search size={16} className="text-yellow-500" />
                            </div>

                            <div className="flex items-start justify-between mb-3">
                                <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all">{suggestion.icon}</span>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-200 group-hover:text-yellow-400 transition-colors">{suggestion.label}</h3>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{suggestion.desc}</p>
                            </div>

                            <div className="mt-4 flex items-center text-xs font-bold text-slate-600 group-hover:text-yellow-500 transition-colors uppercase tracking-wider">
                                Explorar <ChevronRight size={14} className="ml-1" />
                            </div>
                        </a>
                    )
                })}
            </div>
        </div>
    )
}
