import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useGlitchText } from '../hooks/useGlitchText'
import { supabase } from '../lib/supabase'
import './Home.css'

type AuthMode = 'login' | 'signup' | 'recovery_request' | 'recovery_code' | 'recovery_password'

export function Home() {
  const { user, resetPassword, verifyOtp, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [recoveryCode, setRecoveryCode] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use the shared glitch hook
  const { getDisplayChar } = useGlitchText()

  const titleText = "Project Binary"

  useEffect(() => {
    let timer: number
    if (authMode === 'recovery_code' && timeLeft > 0) {
      timer = window.setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    } else if (timeLeft === 0 && authMode === 'recovery_code') {
      setError('Tempo esgotado! Solicite um novo código.')
      setAuthMode('recovery_request')
    }
    return () => clearTimeout(timer)
  }, [timeLeft, authMode])

  const handleStart = () => {
    if (user) {
      navigate('/dashboard')
    } else {
      setShowAuth(true)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const handleRecoveryRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await resetPassword(email)
      setAuthMode('recovery_code')
      setTimeLeft(120) // 2 minutes
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar código')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (recoveryCode.length !== 6) throw new Error('O código deve ter 6 dígitos')
      await verifyOtp(email, recoveryCode)
      setAuthMode('recovery_password')
    } catch (err: any) {
      setError(err.message || 'Código inválido ou expirado')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Senhas não conferem')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await updatePassword(password)
      alert('Senha alterada com sucesso! Faça login.')
      setAuthMode('login')
      setPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (authMode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Senhas não conferem!')
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) throw error

        alert('Cadastro realizado! Verifique seu email.')
        setAuthMode('login')

      } else if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className={`home-container ${showAuth ? 'blur' : ''}`}>
        <h1 className="home-title">
          {titleText.split('').map((char, index) => (
            <span key={index}>{getDisplayChar(char, index)}</span>
          ))}
        </h1>
        <div className="home-subtitle">8 bits</div>

        {!showAuth && (
          <div className="start-trigger" onClick={handleStart}>
            Clique para Começar
          </div>
        )}
      </div>

      {showAuth && (
        <div className="auth-overlay">
          <div className="auth-modal">
            {/* Tabs only visible for login/signup */}
            {(authMode === 'login' || authMode === 'signup') && (
              <div className="auth-tabs">
                <button
                  className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                  onClick={() => setAuthMode('login')}
                >
                  Login
                </button>
                <button
                  className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`}
                  onClick={() => setAuthMode('signup')}
                >
                  Cadastro
                </button>
              </div>
            )}

            {/* Recovery Headers */}
            {authMode === 'recovery_request' && <h2 className="recovery-title">RECUPERAR SENHA</h2>}
            {authMode === 'recovery_code' && <h2 className="recovery-title">CÓDIGO DE SEGURANÇA</h2>}
            {authMode === 'recovery_password' && <h2 className="recovery-title">NOVA SENHA</h2>}

            {error && <div className="auth-error">{error}</div>}

            {/* Standard Login/Signup Form */}
            {(authMode === 'login' || authMode === 'signup') && (
              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>EMAIL</label>
                  <input
                    type="email"
                    className="retro-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>SENHA</label>
                  <input
                    type="password"
                    className="retro-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {authMode === 'login' && (
                  <div className="forgot-password-link" onClick={() => setAuthMode('recovery_request')}>
                    Recuperar Senha
                  </div>
                )}

                {authMode === 'signup' && (
                  <div className="form-group">
                    <label>CONFIRMAR SENHA</label>
                    <input
                      type="password"
                      className="retro-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                )}

                <button type="submit" className="retro-btn" disabled={loading}>
                  {loading ? 'Carregando...' : (authMode === 'login' ? 'ENTRAR' : 'CADASTRAR')}
                </button>
              </form>
            )}

            {/* Recovery Request Form */}
            {authMode === 'recovery_request' && (
              <form className="auth-form" onSubmit={handleRecoveryRequest}>
                <div className="form-group">
                  <label>SEU EMAIL</label>
                  <input
                    type="email"
                    className="retro-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="retro-btn" disabled={loading}>
                  {loading ? 'ENVIANDO...' : 'ENVIAR CÓDIGO'}
                </button>
              </form>
            )}

            {/* Recovery Code Form */}
            {authMode === 'recovery_code' && (
              <form className="auth-form" onSubmit={handleVerifyCode}>
                <div className="form-group">
                  <label>CÓDIGO (6 DÍGITOS)</label>
                  <input
                    type="text"
                    className="retro-input text-center"
                    maxLength={6}
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    required
                    placeholder="000000"
                  />
                </div>
                <div className="timer-display">Expira em: {formatTime(timeLeft)}</div>
                <button type="submit" className="retro-btn" disabled={loading}>
                  {loading ? 'VERIFICANDO...' : 'VERIFICAR'}
                </button>
              </form>
            )}

            {/* New Password Form */}
            {authMode === 'recovery_password' && (
              <form className="auth-form" onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label>NOVA SENHA</label>
                  <input
                    type="password"
                    className="retro-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>CONFIRMAR NOVA SENHA</label>
                  <input
                    type="password"
                    className="retro-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="retro-btn" disabled={loading}>
                  {loading ? 'SALVANDO...' : 'SALVAR NOVA SENHA'}
                </button>
              </form>
            )}

            <button
              type="button"
              className="retro-btn retro-btn-cancel"
              onClick={() => authMode === 'login' || authMode === 'signup' ? setShowAuth(false) : setAuthMode('login')}
            >
              {authMode === 'login' || authMode === 'signup' ? 'VOLTAR' : 'CANCELAR'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
