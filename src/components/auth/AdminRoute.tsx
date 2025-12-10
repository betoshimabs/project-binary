
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

interface AdminRouteProps {
    children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
    const { user, role, loading } = useAuth()

    if (loading) {
        return <div className="loading-screen">Carregando...</div>
    }

    if (!user || role !== 'admin') {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}
