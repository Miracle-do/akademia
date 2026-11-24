import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '@/components/Layout';
import ModuleGate from '@/components/ModuleGate';
import { Spinner } from '@/components/ui';
import { useAuth } from '@/state/AuthContext';
import { useStore } from '@/state/Store';

// Chaque page est chargée à la demande : le premier écran ne télécharge plus tout le code de l'application.
const AuthPage = lazy(() => import('@/pages/AuthPage'));
const BadgesPage = lazy(() => import('@/pages/BadgesPage'));
const BlitzPage = lazy(() => import('@/pages/BlitzPage'));
const ChapterPage = lazy(() => import('@/pages/ChapterPage'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const ExamPage = lazy(() => import('@/pages/ExamPage'));
const ExamsPage = lazy(() => import('@/pages/ExamsPage'));
const FeedPage = lazy(() => import('@/pages/FeedPage'));
const FormationLessonPage = lazy(() => import('@/pages/FormationLessonPage'));
const FormationPage = lazy(() => import('@/pages/FormationPage'));
const FormationsListPage = lazy(() => import('@/pages/FormationsListPage'));
const FlashcardsPage = lazy(() => import('@/pages/FlashcardsPage'));
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage'));
const MessagesPage = lazy(() => import('@/pages/MessagesPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const ConversationPage = lazy(() => import('@/pages/ConversationPage'));
const ModulePage = lazy(() => import('@/pages/ModulePage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const ModulesPage = lazy(() => import('@/pages/ModulesPage'));
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const ExplorePage = lazy(() => import('@/pages/ExplorePage'));
const QuizPage = lazy(() => import('@/pages/QuizPage'));
const ResultsPage = lazy(() => import('@/pages/ResultsPage'));

function Gate() {
  const { user, ready } = useAuth();
  const { ready: storeReady } = useStore();
  if (!ready) return <Spinner />;
  if (!user) {
    // Première visite : on présente la plateforme avant l'inscription ; les habitués vont droit à la connexion.
    let seen = false;
    try { seen = localStorage.getItem('akademia:seen') === '1'; } catch { /* ignore */ }
    return <Navigate to={seen ? '/connexion' : '/bienvenue'} replace />;
  }
  if (!storeReady) return <Spinner label="Synchronisation…" />;
  return <Layout />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/bienvenue" element={<Suspense fallback={<Spinner />}><LandingPage /></Suspense>} />
      <Route path="/connexion" element={<Suspense fallback={<Spinner />}><AuthPage /></Suspense>} />
      <Route element={<Gate />}>
        <Route index element={<Dashboard />} />
        <Route path="formations" element={<FormationsListPage />} />
        <Route path="actu" element={<FeedPage />} />
        <Route path="profil" element={<ProfilePage />} />
        <Route path="recherche" element={<SearchPage />} />
        <Route path="modules" element={<ModulesPage />} />
        <Route path="explorer" element={<ExplorePage />} />
        <Route path="m/:moduleId" element={<ModuleGate />}>
          <Route index element={<ModulePage />} />
          <Route path="lire/:chapterId" element={<ChapterPage />} />
          <Route path="qcm" element={<QuizPage />} />
          <Route path="eclair" element={<BlitzPage />} />
          <Route path="epreuves" element={<ExamsPage />} />
          <Route path="epreuves/:n" element={<ExamPage />} />
          <Route path="formation/:fid" element={<FormationPage />} />
          <Route path="formation/:fid/:lessonId" element={<FormationLessonPage />} />
          <Route path="cartes" element={<FlashcardsPage />} />
        </Route>
        <Route path="resultats" element={<ResultsPage />} />
        <Route path="succes" element={<BadgesPage />} />
        <Route path="classement" element={<LeaderboardPage />} />
        <Route path="joueurs/:userId" element={<ProfilePage />} />
        <Route path="parametres" element={<SettingsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="messages/:userId" element={<ConversationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
