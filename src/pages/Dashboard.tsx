import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { databaseService } from '../services/database.service'
import './Dashboard.css'

interface ExampleData {
  id: string
  created_at: string
  title: string
  description: string
}

export function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<ExampleData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Exemplo de como buscar dados
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      // Substitua 'your_table_name' pelo nome da sua tabela
      const result = await databaseService.getAll<ExampleData>('your_table_name')
      setData(result)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Erro ao carregar dados. Verifique se a tabela existe no Supabase.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Descomente para testar a busca de dados
    // fetchData()
  }, [])

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="welcome-text">
          Bem-vindo, <strong>{user?.email}</strong>!
        </p>
      </div>

      <div className="dashboard-content">
        <div className="info-card">
          <h2>🎉 Parabéns!</h2>
          <p>Sua integração com Supabase está funcionando!</p>
          <div className="user-info">
            <p>
              <strong>User ID:</strong> {user?.id}
            </p>
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>Criado em:</strong>{' '}
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('pt-BR')
                : 'N/A'}
            </p>
          </div>
        </div>

        <div className="info-card">
          <h2>📚 Próximos Passos</h2>
          <ul className="steps-list">
            <li>✅ Autenticação configurada</li>
            <li>✅ Context e Hooks prontos</li>
            <li>✅ Services implementados</li>
            <li>📝 Crie suas tabelas no Supabase</li>
            <li>🔧 Atualize os types com seu schema</li>
            <li>🚀 Comece a desenvolver suas features!</li>
          </ul>
        </div>

        <div className="info-card example-section">
          <h2>🔍 Exemplo de Query</h2>
          <p>
            Para testar a busca de dados, crie uma tabela no Supabase e descomente o código em{' '}
            <code>Dashboard.tsx</code>
          </p>
          <button onClick={fetchData} className="btn-fetch" disabled={loading}>
            {loading ? 'Carregando...' : 'Testar Busca'}
          </button>

          {error && <div className="error-message">{error}</div>}

          {data.length > 0 && (
            <div className="data-display">
              <h3>Dados:</h3>
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
