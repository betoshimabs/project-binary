import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useGlitchText } from '../../hooks/useGlitchText'
import './Navbar.css'

export function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { getDisplayChar } = useGlitchText()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const titleText = "Project Binary"

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          {titleText.split('').map((char, index) => (
            <span key={index}>{getDisplayChar(char, index)}</span>
          ))}
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="navbar-link">
            Início
          </Link>

          {user && (
            <>
              <Link to="/dashboard" className="navbar-link">
                Dashboard
              </Link>
              <Link to="/profile" className="navbar-link">
                Perfil
              </Link>
              <div className="navbar-user">
                <span className="user-email">{user.email}</span>
                <button onClick={handleSignOut} className="btn-signout">
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
