import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import { Shield, Flag, Trash2, CheckCircle, Loader2, MessageSquare } from 'lucide-react'
import { deleteComment } from '../../services/social'
import { useToast } from '../../context/ToastContext'

interface ReportItem {
    id: string
    reason: string
    status: string
    created_at: string
    comment_id: string
    reporter_id: string
    comments: {
        content: string
        user_id: string
    }
}

export function AdminPanel() {
    const { isAdmin } = useAuth()
    const { showToast } = useToast()
    const [reports, setReports] = useState<ReportItem[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    async function loadReports() {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('reports')
                .select(`
                    *,
                    comments (content, user_id)
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setReports((data as any[]) || [])
        } catch (error) {
            console.error('Error loading reports:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isAdmin) loadReports()
    }, [isAdmin])

    async function handleResolveReport(reportId: string, status: 'resolved' | 'ignored') {
        setActionLoading(reportId)
        try {
            const { error } = await (supabase as any)
                .from('reports')
                .update({ status })
                .eq('id', reportId)

            if (error) throw error
            showToast(`Denúncia ${status === 'resolved' ? 'resolvida' : 'ignorada'}.`, 'info')
            loadReports()
        } catch (error) {
            showToast('Erro ao atualizar denúncia.', 'error')
        } finally {
            setActionLoading(null)
        }
    }

    async function handleDeleteReportedComment(reportId: string, commentId: string) {
        if (!window.confirm('Tem certeza que deseja apagar este comentário?')) return
        setActionLoading(reportId)
        try {
            await deleteComment(commentId)
            // Comment deletion will cascade to report if schema is set up with ON DELETE CASCADE
            // but for safety we resolve it manually too
            await handleResolveReport(reportId, 'resolved')
            showToast('Comentário e denúncia removidos.', 'success')
        } catch (error) {
            showToast('Erro ao remover comentário.', 'error')
            setActionLoading(null)
        }
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <Shield size={64} className="text-red-500/20 mb-6" />
                <h1 className="text-2xl font-bold text-white mb-2">Acesso Negado</h1>
                <p className="text-slate-400">Você não tem permissões administrativas para acessar esta área.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-12">
                    <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20 text-blue-400">
                        <Shield size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Painel de Moderação</h1>
                        <p className="text-slate-500">Gerencie denúncias e mantenha a comunidade segura.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
                        <p className="text-slate-500">Buscando denúncias...</p>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center">
                        <CheckCircle size={48} className="text-emerald-500/20 mx-auto mb-4" />
                        <p className="text-slate-400">Nenhuma denúncia pendente. Tudo limpo!</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {reports.map((report: any) => (
                            <div
                                key={report.id}
                                className={`
                                    bg-slate-900 border rounded-3xl p-6 transition-all
                                    ${report.status === 'pending' ? 'border-amber-500/30' : 'border-slate-800 opacity-60'}
                                `}
                            >
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Flag size={16} className={report.status === 'pending' ? 'text-amber-400' : 'text-slate-500'} />
                                            <span className={`text-xs font-bold uppercase tracking-wider ${report.status === 'pending' ? 'text-amber-400' : 'text-slate-500'}`}>
                                                Denúncia {report.status === 'pending' ? 'Pendente' : report.status}
                                            </span>
                                            <span className="text-slate-600 text-[10px]">•</span>
                                            <span className="text-slate-500 text-xs">{new Date(report.created_at).toLocaleString()}</span>
                                        </div>

                                        <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                                            <div className="flex items-center gap-2 mb-2 text-slate-400">
                                                <MessageSquare size={14} />
                                                <span className="text-xs font-bold uppercase">Comentário Denunciado:</span>
                                            </div>
                                            <p className="text-slate-200 italic">"{report.comments?.content || '[Comentário já removido]'}"</p>
                                        </div>

                                        <div>
                                            <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Motivo da denúncia:</span>
                                            <p className="text-slate-300">{report.reason}</p>
                                        </div>
                                    </div>

                                    {report.status === 'pending' && (
                                        <div className="flex md:flex-col gap-3 justify-end">
                                            <button
                                                onClick={() => handleDeleteReportedComment(report.id, report.comment_id)}
                                                disabled={!!actionLoading}
                                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all font-bold text-sm"
                                            >
                                                {actionLoading === report.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                Apagar
                                            </button>
                                            <button
                                                onClick={() => handleResolveReport(report.id, 'ignored')}
                                                disabled={!!actionLoading}
                                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-all font-bold text-sm"
                                            >
                                                Ignorar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
