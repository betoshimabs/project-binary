
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { CharacterCreationWizard, Character } from '../components/game/CharacterCreationWizard'
import { useGlitchText } from '../hooks/useGlitchText' // Reusing the glitch effect for titles
import './CharacterSelection.css'

export function CharacterSelection() {
    const { campaignId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { getDisplayChar } = useGlitchText()

    const [view, setView] = useState<'list' | 'create'>('list')
    const [characters, setCharacters] = useState<Character[]>([])
    const [loading, setLoading] = useState(true)
    const [campaignTitle, setCampaignTitle] = useState('Campanha')

    useEffect(() => {
        if (campaignId) {
            fetchCampaignDetails()
            fetchCharacters()
        }
    }, [campaignId])

    const fetchCampaignDetails = async () => {
        if (!campaignId) return
        const { data } = await supabase.from('campaigns').select('title').eq('id', campaignId).single()
        if (data) setCampaignTitle(data.title)
    }

    const fetchCharacters = async () => {
        if (!user || !campaignId) return
        setLoading(true)

        const { data, error } = await supabase
            .from('characters')
            .select('*')
            .eq('user_id', user.id)
            .eq('campaign_id', campaignId)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setCharacters(data as unknown as Character[])
        }
        setLoading(false)
    }

    const handleCharacterSelect = (charId: string) => {
        navigate(`/campaign/${campaignId}/play`, { state: { characterId: charId } })
    }

    const handleWizardComplete = () => {
        setView('list')
        fetchCharacters()
    }

    const title = `SELECIONE SEU AVATAR`

    return (
        <div className="character-selection-container">
            <button className="nav-button" onClick={() => view === 'list' ? navigate('/campaign-selection') : setView('list')}>
                &lt; {view === 'list' ? 'VOLTAR' : 'CANCELAR'}
            </button>

            <h1 className="character-title">
                {title.split('').map((char, index) => (
                    <span key={index}>{getDisplayChar(char, index)}</span>
                ))}
            </h1>
            <p className="character-subtitle">
                {campaignTitle}
            </p>

            {view === 'list' && (
                <div className="character-grid">
                    {/* New Character Card */}
                    <div
                        className="character-card card-new"
                        onClick={() => setView('create')}
                    >
                        <div className="new-icon">+</div>
                        <div className="new-label">NOVO PERSONAGEM</div>
                    </div>

                    {loading ? (
                        <p style={{ color: '#0f0', gridColumn: '1 / -1', textAlign: 'center' }}>Carregando avatares...</p>
                    ) : (
                        characters.map(char => (
                            <div
                                key={char.id}
                                className="character-card"
                                onClick={() => handleCharacterSelect(char.id)}
                            >
                                <div className="character-image-container">
                                    {char.avatar_url ? (
                                        <img
                                            src={char.avatar_url}
                                            alt={char.name}
                                            className="character-image"
                                        />
                                    ) : (
                                        <div className="character-placeholder">?</div>
                                    )}
                                </div>
                                <div className="character-info">
                                    <div className="character-name">{char.name}</div>
                                    <div className="character-desc">
                                        {char.physical_description || "Sem descrição física."}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {view === 'create' && (
                <CharacterCreationWizard
                    existingCharacter={null}
                    initialCampaignId={campaignId}
                    onCancel={() => setView('list')}
                    onComplete={handleWizardComplete}
                />
            )}
        </div>
    )
}

