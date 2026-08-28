import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PreferencesProvider } from './context/PreferencesContext';
import Welcome from './pages/Welcome';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Personalize from './pages/Personalize';
import Assessment from './pages/Assessment';
import Result from './pages/Result';
import ExtensionRecommendation from './pages/ExtensionRecommendation';
import Dashboard from './pages/Dashboard';

function RequireAuth({ children }) {
  const user = localStorage.getItem('neurosync_current_user');
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <PreferencesProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/personalize" element={<RequireAuth><Personalize /></RequireAuth>} />
          <Route path="/assessment" element={<RequireAuth><Assessment /></RequireAuth>} />
          <Route path="/result" element={<RequireAuth><Result /></RequireAuth>} />
          <Route path="/extension-recommendation" element={<RequireAuth><ExtensionRecommendation /></RequireAuth>} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </PreferencesProvider>
  );
}
