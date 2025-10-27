import { useAuth } from '../hooks/useAuth'
import './Profile.css'

export function Profile() {
  const { user } = useAuth()

  if (!user) {
    return <div>Carregando...</div>
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <h1>Meu Perfil</h1>
        </div>

        <div className="profile-info">
          <div className="info-row">
            <span className="info-label">Email:</span>
            <span className="info-value">{user.email}</span>
          </div>

          <div className="info-row">
            <span className="info-label">User ID:</span>
            <span className="info-value">{user.id}</span>
          </div>

          <div className="info-row">
            <span className="info-label">Conta criada:</span>
            <span className="info-value">
              {new Date(user.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">Último acesso:</span>
            <span className="info-value">
              {user.last_sign_in_at
                ? new Date(user.last_sign_in_at).toLocaleString('pt-BR')
                : 'N/A'}
            </span>
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn-edit">Editar Perfil</button>
          <button className="btn-password">Alterar Senha</button>
        </div>

        <div className="profile-note">
          <p>
            💡 <strong>Dica:</strong> Você pode estender este perfil adicionando mais campos
            na tabela <code>profiles</code> do Supabase e usando os services para atualizar.
          </p>
        </div>
      </div>
    </div>
  )
}
