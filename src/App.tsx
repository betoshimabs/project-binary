import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Navbar } from './components/layout/Navbar'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AdminRoute } from './components/auth/AdminRoute'
import { Home } from './pages/Home'
import { CampaignSelection } from './pages/CampaignSelection'
import { Profile } from './pages/Profile'
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminCampaigns } from './pages/AdminCampaigns'
import { AdminCharacters } from './pages/AdminCharacters'
import { AdminRules } from './pages/AdminRules'
import { AdminInstructions } from './pages/AdminInstructions'
import { AdminPrompts } from './pages/AdminPrompts'
import { CharacterSelection } from './pages/CharacterSelection'
import { InteractionChat } from './pages/InteractionChat'
import { TestAI } from './pages/TestAI'
import './App.css'

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/campaign-selection"
                element={
                  <ProtectedRoute>
                    <CampaignSelection />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/campaign/:campaignId/select-character"
                element={
                  <ProtectedRoute>
                    <CharacterSelection />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/campaign/:campaignId/play"
                element={
                  <ProtectedRoute>
                    <InteractionChat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/campaigns"
                element={
                  <AdminRoute>
                    <AdminCampaigns />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/characters"
                element={
                  <AdminRoute>
                    <AdminCharacters />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/rules"
                element={
                  <AdminRoute>
                    <AdminRules />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/instructions"
                element={
                  <AdminRoute>
                    <AdminInstructions />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/prompts"
                element={
                  <AdminRoute>
                    <AdminPrompts />
                  </AdminRoute>
                }
              />
              <Route path="/test-ai" element={<TestAI />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
