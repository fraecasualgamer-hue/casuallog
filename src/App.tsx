import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { BacklogProvider } from './context/BacklogContext'
import { ListsProvider } from './context/ListsContext'
import { SocialProvider } from './context/SocialContext'
import { ClanProvider } from './context/ClanContext'
import { isSupabaseConfigured } from './lib/supabase'
import Sidebar from './components/Sidebar'
import HomePage from './pages/HomePage'
import BacklogPage from './pages/BacklogPage'
import ListsPage from './pages/ListsPage'
import ListViewPage from './pages/ListViewPage'
import ExplorePage from './pages/ExplorePage'
import ProfilePage from './pages/ProfilePage'
import PublicProfilePage from './pages/PublicProfilePage'
import ConnectionsPage from './pages/ConnectionsPage'
import DiaryPage from './pages/DiaryPage'
import AchievementsPage from './pages/AchievementsPage'
import ClansPage from './pages/ClansPage'
import ClanViewPage from './pages/ClanViewPage'
import CreateClanPage from './pages/CreateClanPage'
import LoginPage from './pages/LoginPage'
import OnboardingFlow from './pages/OnboardingFlow'
import logo from './assets/logo.png'

function AppShell() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-0 flex items-center justify-center">
        <div className="text-center">
          <img src={logo} alt="CasualLog" className="h-28 w-auto mx-auto mb-3" />
          <p className="text-sm text-text-2">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user && isSupabaseConfigured) {
    return <LoginPage />
  }

  if (user && profile && !profile.onboarded && isSupabaseConfigured) {
    return <OnboardingFlow />
  }

  return (
    <BacklogProvider>
      <ListsProvider>
        <SocialProvider>
          <ClanProvider>
            <div className="flex min-h-screen bg-bg-0">
              <Sidebar />
              <main className="flex-1 ml-[220px]">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/backlog" element={<BacklogPage />} />
                  <Route path="/listas" element={<ListsPage />} />
                  <Route path="/listas/:id" element={<ListViewPage />} />
                  <Route path="/explorar" element={<ExplorePage />} />
                  <Route path="/clans" element={<ClansPage />} />
                  <Route path="/clans/criar" element={<CreateClanPage />} />
                  <Route path="/clans/:id" element={<ClanViewPage />} />
                  <Route path="/diario" element={<DiaryPage />} />
                  <Route path="/conquistas" element={<AchievementsPage />} />
                  <Route path="/perfil" element={<ProfilePage />} />
                  <Route path="/u/:username" element={<PublicProfilePage />} />
                  <Route path="/conexoes" element={<ConnectionsPage />} />
                </Routes>
              </main>
            </div>
          </ClanProvider>
        </SocialProvider>
      </ListsProvider>
    </BacklogProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  )
}
