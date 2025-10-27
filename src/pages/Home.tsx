import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Home.css'

export function Home() {
  const { user } = useAuth()

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Bem-vindo ao Project Binary</h1>
        <p className="home-description">
          Uma aplicação React moderna com autenticação Supabase, TypeScript e muito mais.
        </p>

        <div className="home-features">
          <div className="feature-card">
            <h3>⚡ Vite + React</h3>
            <p>Build tool ultra-rápida com Hot Module Replacement</p>
          </div>
          <div className="feature-card">
            <h3>🔐 Supabase Auth</h3>
            <p>Autenticação completa com email/senha</p>
          </div>
          <div className="feature-card">
            <h3>📦 TypeScript</h3>
            <p>Type-safety em todo o código</p>
          </div>
          <div className="feature-card">
            <h3>🎨 Estrutura Completa</h3>
            <p>Hooks, Services, Types e muito mais</p>
          </div>
        </div>

        <div className="home-actions">
          {user ? (
            <Link to="/dashboard" className="btn-primary">
              Ir para Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-primary">
                Começar Agora
              </Link>
              <a
                href="https://github.com/betoshimabs/project-binary"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                Ver no GitHub
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
