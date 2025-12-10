import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './AdminDashboard.css'

interface SystemPrompt {
    id: string
    key: string
    template: string
    description: string | null
    updated_at: string
}

export function AdminPrompts() {
    const navigate = useNavigate()
    const [prompts, setPrompts] = useState<SystemPrompt[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState<string | null>(null) // ID of prompt being saved

    useEffect(() => {
        fetchPrompts()
    }, [])

    const fetchPrompts = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('system_prompts')
            .select('*')
            .order('key')

        if (error) {
            console.error('Error fetching prompts:', error)
            alert('Erro ao carregar prompts')
        } else {
            setPrompts(data || [])
        }
        setLoading(false)
    }

    const handleSave = async (prompt: SystemPrompt) => {
        setSaving(prompt.id)
        try {
            const { error } = await supabase
                .from('system_prompts')
                .update({ template: prompt.template, updated_at: new Date().toISOString() })
                .eq('id', prompt.id)

            if (error) throw error
            // alert('Prompt atualizado!')
        } catch (err) {
            console.error(err)
            alert('Erro ao salvar prompt')
        } finally {
            setSaving(null)
        }
    }

    const handleChange = (id: string, newTemplate: string) => {
        setPrompts(current =>
            current.map(p => p.id === id ? { ...p, template: newTemplate } : p)
        )
    }

    return (
        <div className="admin-container">
            <button className="nav-button" onClick={() => navigate('/admin')}>
                &lt; VOLTAR AO MENU
            </button>
            <h1 className="admin-title">EDITOR DE CHAMADAS (PROMPTS)</h1>

            <div className="admin-content">
                {loading ? <p>Carregando...</p> : (
                    <div className="admin-scroll-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {prompts.map(prompt => (
                            <div key={prompt.id} style={{
                                border: '1px solid #0f0',
                                padding: '1rem',
                                background: 'rgba(0, 20, 0, 0.8)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ margin: 0, color: '#0f0', textTransform: 'uppercase' }}>
                                        {prompt.key.replace('_', ' ')}
                                    </h3>
                                    {saving === prompt.id && <span style={{ color: '#ff0' }}>Salvando...</span>}
                                </div>

                                <p style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                    {prompt.description}
                                </p>

                                <textarea
                                    value={prompt.template}
                                    onChange={(e) => handleChange(prompt.id, e.target.value)}
                                    rows={10}
                                    style={{
                                        width: '100%',
                                        background: '#000',
                                        color: '#0f0',
                                        border: '1px solid #333',
                                        padding: '0.5rem',
                                        fontFamily: 'monospace',
                                        lineHeight: '1.4',
                                        resize: 'vertical'
                                    }}
                                />

                                <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                                    <button
                                        className="admin-menu-btn"
                                        style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', width: 'auto' }}
                                        onClick={() => handleSave(prompt)}
                                        disabled={saving === prompt.id}
                                    >
                                        SALVAR ALTERAÇÕES
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
