
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { CharacterCreationWizard, Character } from '../components/game/CharacterCreationWizard'
import './AdminDashboard.css'

export function AdminCharacters() {
    const navigate = useNavigate()

    // UI State
    const [view, setView] = useState<'list' | 'create'>('list')
    const [loading, setLoading] = useState(false)
    const [characters, setCharacters] = useState<Character[]>([])

    // Editing State
    const [editingCharacter, setEditingCharacter] = useState<Character | null>(null)

    useEffect(() => {
        if (view === 'list') fetchCharacters()
    }, [view])

    const fetchCharacters = async () => {
        setLoading(true)
        const { data, error } = await supabase.from('characters').select('*').order('created_at', { ascending: false })

        if (!error && data) {
            // Cast data to match Character interface, treating nulls as empty strings if needed or just trusting the cast for now
            // The Wizard handles nulls gracefully
            setCharacters(data as unknown as Character[])
        }
        setLoading(false)
    }

    const handleCreateClick = () => {
        setEditingCharacter(null)
        setView('create')
    }

    const handleEdit = (char: Character) => {
        setEditingCharacter(char)
        setView('create')
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Deletar personagem?")) return
        await supabase.from('characters').delete().eq('id', id)
        fetchCharacters()
    }

    const handleWizardComplete = () => {
        setView('list')
        fetchCharacters()
    }

    return (
        <div className="admin-container">
            <button className="nav-button" onClick={() => view === 'list' ? navigate('/admin') : setView('list')}>
                &lt; {view === 'list' ? 'VOLTAR' : 'CANCELAR'}
            </button>
            <h1 className="admin-title">GERENCIAR PERSONAGENS</h1>

            <div className="admin-content">
                {view === 'list' && (
                    <>
                        <button className="admin-menu-btn" onClick={handleCreateClick} style={{ marginBottom: '1rem', width: '100%' }}>
                            CRIAR NOVO PERSONAGEM
                        </button>
                        <div className="campaign-list">
                            {loading ? <p>Carregando...</p> : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #0f0', textAlign: 'left' }}>
                                            <th style={{ padding: '0.5rem' }}>NOME</th>
                                            <th style={{ padding: '0.5rem' }}>DESCRIÇÃO</th>
                                            <th style={{ padding: '0.5rem' }}>AÇÕES</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {characters.map(char => (
                                            <tr key={char.id} style={{ borderBottom: '1px solid #333' }}>
                                                <td style={{ padding: '0.5rem' }}>{char.name}</td>
                                                <td style={{ padding: '0.5rem', fontSize: '0.8rem' }}>{char.physical_description}</td>
                                                <td style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => handleEdit(char)} style={{ background: 'none', border: 'none', color: '#0f0', cursor: 'pointer', fontFamily: 'Press Start 2P', fontSize: '0.6rem' }}>[EDITAR]</button>
                                                    <button onClick={() => handleDelete(char.id)} style={{ background: 'none', border: 'none', color: '#f00', cursor: 'pointer', fontFamily: 'Press Start 2P', fontSize: '0.6rem' }}>[X]</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                )}

                {view === 'create' && (
                    <CharacterCreationWizard
                        existingCharacter={editingCharacter}
                        onCancel={() => setView('list')}
                        onComplete={handleWizardComplete}
                    />
                )}
            </div>
        </div>
    )
}
