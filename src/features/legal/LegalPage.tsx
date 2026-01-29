import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Shield, Scale } from 'lucide-react'

export function LegalPage() {
    const { type } = useParams<{ type: string }>()
    const navigate = useNavigate()

    const content = {
        terms: {
            title: 'Termos de Uso',
            icon: Scale,
            lastUpdated: '28 de Janeiro, 2026',
            sections: [
                {
                    title: '1. Aceitação dos Termos',
                    text: 'Ao acessar e utilizar o Suggesto, você concorda em cumprir e ser regido por estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossa plataforma.'
                },
                {
                    title: '2. Descrição do Serviço',
                    text: 'O Suggesto é uma plataforma de recomendação de mídia (filmes, séries, livros e games) que utiliza algoritmos e feedback da comunidade para personalizar sugestões.'
                },
                {
                    title: '3. Contas de Usuário',
                    text: 'Para acessar certas funcionalidades, você deve criar uma conta. Você é responsável por manter a confidencialidade de sua senha e por todas as atividades que ocorrem em sua conta.'
                },
                {
                    title: '4. Propriedade Intelectual',
                    text: 'Todo o conteúdo original do Suggesto (logotipo, layout, algoritmos) é de propriedade exclusiva da plataforma. Imagens de cartazes, trailers e sinopses são fornecidas por APIs de terceiros (TMDB, RAWG, Google Books) e pertencem aos seus respectivos proprietários.'
                }
            ]
        },
        privacy: {
            title: 'Política de Privacidade',
            icon: Shield,
            lastUpdated: '28 de Janeiro, 2026',
            sections: [
                {
                    title: '1. Informações que Coletamos',
                    text: 'Coletamos seu e-mail e nome para autenticação, além de suas interações na plataforma (curtidas, avaliações, gêneros preferidos) para fornecer recomendações personalizadas.'
                },
                {
                    title: '2. Uso dos Dados',
                    text: 'Seus dados são utilizados exclusivamente para melhorar sua experiência no Suggesto e para comunicações essenciais sobre sua conta ou novas recomendações via OneSignal.'
                },
                {
                    title: '3. Exclusão de Dados',
                    text: 'Respeitamos seu direito à privacidade. Você pode excluir sua conta e todos os dados associados a qualquer momento através das configurações de perfil de forma irreversível.'
                },
                {
                    title: '4. Cookies e Tecnologias',
                    text: 'Utilizamos cookies locais para manter sua sessão ativa e salvar suas preferências de visualização.'
                }
            ]
        }
    }

    const current = (type === 'privacy' ? content.privacy : content.terms)
    const Icon = current.icon

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Voltar</span>
                </button>

                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20 text-blue-400">
                        <Icon size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{current.title}</h1>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Última atualização: {current.lastUpdated}</p>
                    </div>
                </div>

                <div className="mt-12 space-y-12">
                    {current.sections.map((section, idx) => (
                        <section key={idx} className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-200">{section.title}</h2>
                            <p className="text-slate-400 leading-relaxed">
                                {section.text}
                            </p>
                        </section>
                    ))}
                </div>

                <div className="mt-20 pt-8 border-t border-white/5 text-center">
                    <p className="text-sm text-slate-500">
                        Se você tiver dúvidas sobre estes documentos, entre em contato em <span className="text-blue-400">suporte@suggesto.com.br</span>
                    </p>
                </div>
            </div>
        </div>
    )
}
