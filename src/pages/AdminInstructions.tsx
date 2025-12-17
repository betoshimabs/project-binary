import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './AdminDashboard.css'

interface Instruction {
    id: string
    category: string
    title: string
    content: string
    updated_at: string
}

export function AdminInstructions() {
    const navigate = useNavigate()
    const [instructions, setInstructions] = useState<Instruction[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState<string | null>(null)

    useEffect(() => {
        fetchInstructions()
    }, [])

    const fetchInstructions = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('instructions')
            .select('*')
            .order('category')

        if (error) {
            console.error('Error fetching instructions:', error)
            alert('Erro ao carregar instruções')
        } else {
            setInstructions(data || [])
        }
        setLoading(false)
    }

    const handleSave = async (inst: Instruction) => {
        setSaving(inst.id)
        try {
            const { error } = await supabase
                .from('instructions')
                .update({
                    content: inst.content,
                    title: inst.title,
                    updated_at: new Date().toISOString()
                })
                .eq('id', inst.id)

            if (error) throw error
        } catch (err) {
            console.error(err)
            alert('Erro ao salvar instrução')
        } finally {
            setSaving(null)
        }
    }

    const handleChange = (id: string, field: 'content' | 'title', val: string) => {
        setInstructions(current =>
            current.map(i => i.id === id ? { ...i, [field]: val } : i)
        )
    }

    return (
        <div className="admin-container">
            <button className="nav-button" onClick={() => navigate('/admin')}>
                &lt; VOLTAR AO MENU
            </button>
            <h1 className="admin-title">ALMA DO SISTEMA (Instruções)</h1>

            <div className="admin-content">
                {loading ? <p>Carregando protocolos...</p> : (
                    <div className="admin-scroll-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {instructions.map(inst => (
                            <div key={inst.id} style={{
                                border: '1px solid #0ff',
                                padding: '1rem',
                                background: 'rgba(0, 20, 20, 0.8)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div style={{ flex: 1, marginRight: '1rem' }}>
                                        <input
                                            value={inst.title}
                                            onChange={(e) => handleChange(inst.id, 'title', e.target.value)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                borderBottom: '1px solid #0ff',
                                                color: '#0ff',
                                                fontSize: '1.2rem',
                                                fontWeight: 'bold',
                                                width: '100%',
                                                marginBottom: '0.5rem'
                                            }}
                                        />
                                        <span style={{
                                            background: '#004444',
                                            padding: '0.2rem 0.5rem',
                                            color: '#fff',
                                            fontSize: '0.8rem',
                                            textTransform: 'uppercase'
                                        }}>
                                            {inst.category}
                                        </span>
                                    </div>
                                    {saving === inst.id && <span style={{ color: '#ff0' }}>Salvando...</span>}
                                </div>

                                <textarea
                                    value={inst.content}
                                    onChange={(e) => handleChange(inst.id, 'content', e.target.value)}
                                    rows={12}
                                    style={{
                                        width: '100%',
                                        background: '#001',
                                        color: '#0ff',
                                        border: '1px solid #044',
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
                                            borderColor: '#0ff',
                                            color: '#0ff',
                                            boxShadow: 'none'
                                        }}
                                        onClick={() => handleSave(inst)}
                                        disabled={saving === inst.id}
                                    >
                                        SALVAR INSTRUÇÃO
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
