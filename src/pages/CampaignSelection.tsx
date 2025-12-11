import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useGlitchText } from '../hooks/useGlitchText'
import './CampaignSelection.css'

interface Campaign {
    id: string
    title: string
    description: string | null
    imageUrl?: string
}

const FLOPPY_IMAGE_URL = 'https://pqobczhzzihnzmonigah.supabase.co/storage/v1/object/public/campaign_covers/floppy.png'

export function CampaignSelection() {
    const navigate = useNavigate()
    const { getDisplayChar } = useGlitchText()
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [loading, setLoading] = useState(true)

    const title = "SELECIONE O DISCO DA CAMPANHA"

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                const userId = user?.id

                const { data, error } = await supabase
                    .from('campaigns')
                    .select('id, title, description')
                    // Show public campaigns OR campaigns created by the user
                    .or(`is_public.eq.true${userId ? `,user_id.eq.${userId}` : ''}`)
                    .order('created_at', { ascending: false })

                if (error) throw error
                setCampaigns(data || [])
            } catch (error) {
                console.error('Error fetching campaigns:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchCampaigns()
    }, [])

    const handleSelect = (id: string) => {
        setSelectedId(id)
        // console.log(`Selected campaign ${id}`)
        setTimeout(() => {
            navigate(`/campaign/${id}/select-character`)
        }, 300)
    }

    return (
        <div className="campaign-selection-container">
            <button className="nav-button" onClick={() => navigate('/')}>
                &lt; VOLTAR
            </button>

            <h1 className="campaign-title">
                {title.split('').map((char, index) => (
                    <span key={index}>{getDisplayChar(char, index)}</span>
                ))}
            </h1>

            <div className="carousel-container">
                {loading ? (
                    <p style={{ color: '#0f0', textAlign: 'center', marginTop: '2rem' }}>Carregando discos...</p>
                ) : (
                    <div className="carousel-track">
                        {campaigns.length === 0 ? (
                            <p style={{ color: '#0f0', textAlign: 'center', width: '100%' }}>Nenhuma campanha disponível.</p>
                        ) : (
                            campaigns.map((campaign) => (
                                <div
                                    key={campaign.id}
                                    className={`campaign-card ${selectedId === campaign.id ? 'selected' : ''}`}
                                    onClick={() => handleSelect(campaign.id)}
                                >
                                    <img
                                        src={FLOPPY_IMAGE_URL}
                                        alt={campaign.title}
                                        className="floppy-image"
                                    />
                                    <div className="campaign-label">{campaign.title}</div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
