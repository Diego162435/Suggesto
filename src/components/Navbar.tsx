import { Home, List, History } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export function Navbar() {
    const location = useLocation()

    const isActive = (path: string) => location.pathname === path

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 pb-safe sm:pb-0">
            <div className="flex justify-around items-center max-w-md mx-auto h-16 px-4">
                <Link
                    to="/"
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${isActive('/') ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <Home size={22} />
                    <span className="text-[10px] font-medium">Início</span>
                </Link>

                <Link
                    to="/wishlist"
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${isActive('/wishlist') ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <List size={22} />
                    <span className="text-[10px] font-medium">Lista</span>
                </Link>

                <Link
                    to="/history"
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${isActive('/history') ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <History size={22} />
                    <span className="text-[10px] font-medium">Histórico</span>
                </Link>

                {/* Profile link could be added here if needed, or included in header */}
            </div>
        </nav>
    )
}
