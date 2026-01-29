import { useState, useEffect } from 'react'
import { getComments, addComment, CommentItem, deleteComment, reportComment } from '../services/social'
import { useAuth } from '../context/AuthContext'
import { Send, User, Trash2, Flag, Loader2 } from 'lucide-react'
import { useToast } from '../context/ToastContext'

interface CommentsSectionProps {
    mediaId: string
    mediaType: string
}

export function CommentsSection({ mediaId, mediaType }: CommentsSectionProps) {
    const { user, isAdmin } = useAuth()
    const { showToast } = useToast()
    const [comments, setComments] = useState<CommentItem[]>([])
    const [newComment, setNewComment] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    async function loadComments() {
        setLoading(true)
        try {
            const data = await getComments(mediaId)
            setComments(data)
        } catch (error) {
            console.error('Failed to load comments', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadComments()
    }, [mediaId])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!user || !newComment.trim() || submitting) return

        setSubmitting(true)
        try {
            await addComment(user.id, mediaId, mediaType, newComment)
            setNewComment('')
            loadComments()
            showToast('Comentário postado!', 'success')
        } catch (error) {
            showToast('Erro ao postar comentário.', 'error')
        } finally {
            setSubmitting(false)
        }
    }

    async function handleDelete(commentId: string) {
        if (!window.confirm('Tem certeza que deseja apagar este comentário?')) return
        setActionLoading(commentId)
        try {
            await deleteComment(commentId)
            showToast('Comentário removido.', 'success')
            loadComments()
        } catch (error) {
            showToast('Erro ao remover comentário.', 'error')
        } finally {
            setActionLoading(null)
        }
    }

    async function handleReport(commentId: string) {
        const reason = window.prompt('Por que você está denunciando este comentário? (ex: spam, ofensivo)')
        if (!reason || !user) return
        setActionLoading(commentId)
        try {
            await reportComment(user.id, commentId, reason)
            showToast('Denúncia enviada para análise.', 'info')
        } catch (error) {
            showToast('Erro ao enviar denúncia.', 'error')
        } finally {
            setActionLoading(null)
        }
    }

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-white">Comentários ({comments.length})</h3>

            {/* Comment Form */}
            {user ? (
                <form onSubmit={handleSubmit} className="flex gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            placeholder="Deixe seu comentário..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!newComment.trim() || submitting}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 rounded-lg flex items-center justify-center transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </form>
            ) : (
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 text-center text-slate-400">
                    Faça login para comentar.
                </div>
            )}

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <p className="text-slate-500 text-sm">Carregando comentários...</p>
                ) : comments.length === 0 ? (
                    <p className="text-slate-500 text-sm">Seja o primeiro a comentar!</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="bg-slate-900/30 border border-slate-800/50 rounded-lg p-4 flex gap-3">
                            <div className="flex-shrink-0">
                                {(Array.isArray(comment.profiles) ? comment.profiles[0]?.avatar_url : comment.profiles?.avatar_url) ? (
                                    <img
                                        src={(Array.isArray(comment.profiles) ? comment.profiles[0]?.avatar_url : comment.profiles?.avatar_url) || ''}
                                        alt="Avatar"
                                        className="w-8 h-8 rounded-full bg-slate-800"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                                        <User size={16} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-sm text-slate-300">
                                        {(Array.isArray(comment.profiles)
                                            ? comment.profiles[0]?.username
                                            : comment.profiles?.username) || 'Usuário'}
                                    </span>
                                    <span className="text-xs text-slate-600">
                                        {new Date(comment.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    {comment.content}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {(isAdmin || user?.id === comment.user_id) && (
                                    <button
                                        onClick={() => handleDelete(comment.id)}
                                        disabled={!!actionLoading}
                                        className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"
                                        title="Excluir"
                                    >
                                        {actionLoading === comment.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    </button>
                                )}
                                {user && user.id !== comment.user_id && (
                                    <button
                                        onClick={() => handleReport(comment.id)}
                                        disabled={!!actionLoading}
                                        className="p-1.5 text-slate-600 hover:text-amber-400 transition-colors"
                                        title="Denunciar"
                                    >
                                        <Flag size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
