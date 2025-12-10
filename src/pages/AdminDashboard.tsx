import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './AdminDashboard.css'

export function AdminDashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const menuItems = [
        { label: 'CAMPANHAS', path: '/admin/campaigns' },
        { label: 'PERSONAGENS', path: '/admin/characters' },
        { label: 'REGRAS', path: '/admin/rules' },
        { label: 'INSTRUÇÕES', path: '/admin/instructions' },
        { label: 'CHAMADAS (PROMPTS)', path: '/admin/prompts' },
    ]

    return (
        <div className="admin-container">
            <h1 className="admin-title">PAINEL DO ADMINISTRADOR</h1>
            <div className="admin-content">
                <p>Bem-vindo, {user?.email}</p>
                <p>Selecione uma área para gerenciar:</p>

                <div className="admin-grid">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            className="admin-menu-btn"
                            onClick={() => navigate(item.path)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="admin-metrics">
                    <div className="metric-card">
                        <h3>Usuários</h3>
                        <span>???</span>
                    </div>
                    <div className="metric-card">
                        <h3>Campanhas</h3>
                        <span>???</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
