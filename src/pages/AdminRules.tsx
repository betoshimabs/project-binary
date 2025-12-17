import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './AdminDashboard.css'
import './AdminRules.css'

interface Rule {
    id: string
    category: string
    title: string
    content: string
    keywords: string[]
    updated_at: string
}

export function AdminRules() {
    const navigate = useNavigate()
    const [rules, setRules] = useState<Rule[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState<string | null>(null)

    useEffect(() => {
        fetchRules()
    }, [])

    const fetchRules = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('rules')
            .select('*')
            .order('category')

        if (error) {
            console.error('Error fetching rules:', error)
            alert('Erro ao carregar regras')
        } else {
            setRules(data || [])
        }
        setLoading(false)
    }

    const handleSave = async (rule: Rule) => {
        setSaving(rule.id)
        try {
            const { error } = await supabase
                .from('rules')
                .update({
                    content: rule.content,
                    title: rule.title,
                    category: rule.category,
                    updated_at: new Date().toISOString()
                })
                .eq('id', rule.id)

            if (error) throw error
        } catch (err) {
            console.error(err)
            alert('Erro ao salvar regra')
        } finally {
            setSaving(null)
        }
    }

    const handleChange = (id: string, field: 'content' | 'title' | 'category', val: string) => {
        setRules(current =>
            current.map(r => r.id === id ? { ...r, [field]: val } : r)
        )
    }

    return (
        <div className="admin-container">
            <button className="nav-button" onClick={() => navigate('/admin')}>
                &lt; VOLTAR AO MENU
            </button>
            <h1 className="admin-title">LEIS DO UNIVERSO (Regras)</h1>

            <div className="admin-content" style={{ paddingBottom: '4rem' }}>
                {loading ? <p>Carregando leis da física...</p> : (
                    <div className="admin-scroll-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {rules.map(rule => (
                            <div key={rule.id} style={{
                                border: '1px solid #f0f',
                                padding: '1rem',
                                background: 'rgba(20, 0, 20, 0.8)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div style={{ flex: 1, marginRight: '1rem' }}>
                                        <input
                                            value={rule.title}
                                            onChange={(e) => handleChange(rule.id, 'title', e.target.value)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                borderBottom: '1px solid #f0f',
                                                color: '#f0f',
                                                fontSize: '1.2rem',
                                                fontWeight: 'bold',
                                                width: '100%',
                                                marginBottom: '0.5rem'
                                            }}
                                        />
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <input
                                                value={rule.category}
                                                onChange={(e) => handleChange(rule.id, 'category', e.target.value)}
                                                style={{
                                                    background: '#440044',
                                                    border: 'none',
                                                    padding: '0.2rem 0.5rem',
                                                    color: '#fff',
                                                    fontSize: '0.8rem',
                                                    textTransform: 'uppercase',
                                                    width: '150px',
                                                    textAlign: 'center'
                                                }}
                                            />
                                            <span style={{ color: '#888', fontSize: '0.8rem', alignSelf: 'center' }}>
                                                {rule.keywords?.join(', ')}
                                            </span>
                                        </div>
                                    </div>
                                    {saving === rule.id && <span style={{ color: '#ff0' }}>Salvando...</span>}
                                </div>

                                <textarea
                                    value={rule.content}
                                    onChange={(e) => handleChange(rule.id, 'content', e.target.value)}
                                    rows={12}
                                    style={{
                                        width: '100%',
                                        background: '#101',
                                        color: '#f0f',
                                        border: '1px solid #404',
                                        padding: '0.5rem',
                                        fontFamily: 'monospace',
                                        lineHeight: '1.4',
                                        resize: 'vertical'
                                    }}
                                />

                                <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                                    <button
                                        className="admin-menu-btn"
                                        style={{
                                            fontSize: '0.8rem',
                                            padding: '0.5rem 1rem',
                                            width: 'auto',
                                            borderColor: '#f0f',
                                            color: '#f0f',
                                            boxShadow: 'none'
                                        }}
                                        onClick={() => handleSave(rule)}
                                        disabled={saving === rule.id}
                                    >
                                        SALVAR LEI
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
