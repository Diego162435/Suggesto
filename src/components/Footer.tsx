import { Github, Twitter, Instagram, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Footer() {
    return (
        <footer className="w-full border-t border-slate-800/50 bg-slate-900/30 backdrop-blur-sm mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1 space-y-4">
                        <div className="flex items-center gap-2">
                            {/* Small Logo or Brand Name */}
                            <img src="/src/assets/logo.png" alt="Suggesto" className="h-8 w-auto opacity-80" />
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Sua plataforma de descobertas favorita. Encontre filmes, séries e livros incríveis personalizados para você.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-bold text-white mb-4">Plataforma</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link to="/legal/about" className="hover:text-blue-400 transition-colors">Sobre Nós</Link></li>
                            <li><Link to="/legal/how-it-works" className="hover:text-blue-400 transition-colors">Como Funciona</Link></li>
                            <li><Link to="/legal/careers" className="hover:text-blue-400 transition-colors">Carreiras</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-bold text-white mb-4">Suporte</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link to="/legal/help" className="hover:text-blue-400 transition-colors">Ajuda Central</Link></li>
                            <li><Link to="/legal/terms" className="hover:text-blue-400 transition-colors">Termos de Uso</Link></li>
                            <li><Link to="/legal/privacy" className="hover:text-blue-400 transition-colors">Privacidade</Link></li>
                            <li><Link to="/legal/contact" className="hover:text-blue-400 transition-colors">Contato</Link></li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 className="font-bold text-white mb-4">Redes Sociais</h4>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                                <Github size={20} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <p>&copy; 2026 Suggesto. Todos os direitos reservados.</p>
                    <p className="flex items-center gap-1">
                        Feito com <Heart size={12} className="text-red-500 fill-red-500" /> para você
                    </p>
                </div>
            </div>
        </footer>
    )
}
