
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import './AdminDashboard.css'

interface Campaign {
  id: string
  title: string
  description: string | null
  is_public: boolean | null // Added
  created_at: string
}

export function AdminCampaigns() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)

  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCampaigns(data || [])
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta campanha?')) return

    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchCampaigns()
    } catch (error) {
      console.error('Error deleting campaign:', error)
      alert('Erro ao excluir campanha')
    }
  }

  const handleEdit = (campaign: Campaign) => {
    setIsEditing(true)
    setCurrentId(campaign.id)
    setTitle(campaign.title)
    setDescription(campaign.description || '')
    setIsPublic(campaign.is_public || false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setCurrentId(null)
    setTitle('')
    setDescription('')
    setIsPublic(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      if (isEditing && currentId) {
        // Update
        const { error } = await supabase
          .from('campaigns')
          // @ts-ignore
          .update({
            title,
            description,
            is_public: isPublic,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentId)

        if (error) throw error
      } else {
        // Create
        const { error } = await supabase
          .from('campaigns')
          // @ts-ignore
          .insert({
            user_id: user.id,
            title,
            description,
            is_public: isPublic,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (error) throw error
      }

      fetchCampaigns()
      handleCancel()
    } catch (error) {
      console.error('Error saving campaign:', error)
      alert('Erro ao salvar campanha')
    }
  }

  return (
    <div className="admin-container">
      <button className="nav-button" onClick={() => navigate('/admin')}>
        &lt; VOLTAR
      </button>
      <h1 className="admin-title">GERENCIAR CAMPANHAS</h1>

      <div className="admin-content">
        <form onSubmit={handleSubmit} className="admin-form" style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #336633' }}>
          <h3>{isEditing ? 'EDITAR CAMPANHA' : 'NOVA CAMPANHA'}</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>TÍTULO</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', background: '#000', color: '#0f0', border: '1px solid #0f0', fontFamily: 'monospace' }}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>DESCRIÇÃO</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', background: '#000', color: '#0f0', border: '1px solid #0f0', fontFamily: 'monospace' }}
              rows={3}
            />
          </div>
          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={e => setIsPublic(e.target.checked)}
              style={{ marginRight: '0.5rem' }}
            />
            <label htmlFor="isPublic" style={{ cursor: 'pointer', color: isPublic ? '#0f0' : '#888' }}>
              {isPublic ? 'CAMPANHA PÚBLICA (Visível para todos)' : 'CAMPANHA PRIVADA (Apenas você)'}
            </label>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="admin-menu-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
              {isEditing ? 'SALVAR ALTERAÇÕES' : 'CRIAR CAMPANHA'}
            </button>
            {isEditing && (
              <button type="button" onClick={handleCancel} className="admin-menu-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: '#330000', borderColor: '#ff0000', color: '#ff0000' }}>
                CANCELAR
              </button>
            )}
          </div>
        </form>

        <div className="campaign-list">
          {loading ? <p>Carregando...</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #0f0', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem' }}>TÍTULO</th>
                  <th style={{ padding: '0.5rem' }}>VISIBILIDADE</th>
                  <th style={{ padding: '0.5rem' }}>DESCRIÇÃO</th>
                  <th style={{ padding: '0.5rem' }}>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(campaign => (
                  <tr key={campaign.id} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '0.5rem' }}>{campaign.title}</td>
                    <td style={{ padding: '0.5rem', color: campaign.is_public ? '#0f0' : '#888' }}>
                      {campaign.is_public ? 'PÚBLICA' : 'PRIVADA'}
                    </td>
                    <td style={{ padding: '0.5rem' }}>{campaign.description}</td>
                    <td style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEdit(campaign)} style={{ background: 'none', border: 'none', color: '#0f0', cursor: 'pointer', fontFamily: 'Press Start 2P', fontSize: '0.6rem' }}>[EDITAR]</button>
                      <button onClick={() => handleDelete(campaign.id)} style={{ background: 'none', border: 'none', color: '#f00', cursor: 'pointer', fontFamily: 'Press Start 2P', fontSize: '0.6rem' }}>[X]</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && campaigns.length === 0 && <p>Nenhuma campanha encontrada.</p>}
        </div>

      </div>
    </div>
  )
}
