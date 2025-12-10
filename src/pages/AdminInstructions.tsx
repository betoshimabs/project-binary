
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './AdminDashboard.css'

export function AdminInstructions() {
    const navigate = useNavigate()
    const [instruction, setInstruction] = useState<string>('Carregando...')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMasterInstruction()
    }, [])

    const fetchMasterInstruction = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('system_prompts')
            .select('template')
            .eq('key', 'master_interaction')
            .single()

        if (error) {
            console.error('Error fetching instruction:', error)
            setInstruction('Erro ao carregar instrução do Mestre.')
        } else if (data) {
            setInstruction(data.template)
        }
        setLoading(false)
    }

    return (
        <div className="admin-container">
            <button className="nav-button" onClick={() => navigate('/admin')}>
                &lt; VOLTAR
            </button>
            <h1 className="admin-title">GERENCIAR INSTRUÇÕES</h1>
            <div className="admin-content">
                <div className="admin-scroll-content">
                    <div style={{
                        border: '1px solid #0f0',
                        padding: '2rem',
                        background: 'rgba(0, 0, 0, 0.8)',
                        color: '#0f0',
                        fontFamily: 'monospace',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap',
                        boxShadow: '0 0 10px #0f0'
                    }}>
                        <h2 style={{ marginTop: 0, borderBottom: '1px solid #0f0', paddingBottom: '0.5rem' }}>
                            PROTOCOLO MESTRE BINÁRIO v1.0
                        </h2>
                        {instruction}
                    </div>
                </div>
            </div>
        </div>
    )
}
