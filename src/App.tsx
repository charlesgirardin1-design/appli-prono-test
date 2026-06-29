import React, { useEffect, Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { seedMatchesIfNeeded, refreshOdds } from './lib/seed';
import { startMatchNotifications } from './lib/notifications';
import { getMatches } from './lib/firestore';
import ProfilPage from './pages/Profil';
import ChampionPage from './pages/Champion';
import { applyTheme, getSettings } from './lib/settings';
import { startLiveScorePolling } from './lib/liveScores';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Classement from './pages/Classement';
import Groupes from './pages/Groupes';
import Favoris from './pages/Favoris';
import ParametresPage from './pages/Parametres';
import TestPage from './pages/Test';
import AdminPage from './pages/Admin';
import { isAdmin } from './lib/auth';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './App.css';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '326011176740-eug901mfntmen1mui8cf9bu1bm070cg7.apps.googleusercontent.com';

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() { return { hasError: true }; }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16 }}>
                    <p>Une erreur est survenue.</p>
                    <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}>
                        Recharger
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { currentUser } = useAuth();
    return currentUser ? <>{children}</> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
    const { currentUser } = useAuth();
    if (!currentUser) return <Navigate to="/login" />;
    if (!isAdmin(currentUser.uid)) return <Navigate to="/" />;
    return <>{children}</>;
}

function AppRoutes() {
    const { currentUser } = useAuth();

    useEffect(() => {
        seedMatchesIfNeeded();
        applyTheme(getSettings().theme);
        refreshOdds();

        const apiKey =
            process.env.REACT_APP_FOOTBALL_DATA_KEY ||
            localStorage.getItem('pf_football_api_key') ||
            'e17c642125d94af9bf0b31676463b862';
        const stopPolling = startLiveScorePolling(apiKey);
        const stopNotifications = startMatchNotifications(getMatches);

        return () => { stopPolling(); stopNotifications(); };
    }, []);

    if (!currentUser) {
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        );
    }

    return (
        <>
            <Navbar />
            <div className="app-content">
                <Routes>
                    <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                    <Route path="/classement" element={<PrivateRoute><Classement /></PrivateRoute>} />
                    <Route path="/groupes" element={<PrivateRoute><Groupes /></PrivateRoute>} />
                    <Route path="/favoris" element={<PrivateRoute><Favoris /></PrivateRoute>} />
                    <Route path="/parametres" element={<PrivateRoute><ParametresPage /></PrivateRoute>} />
                    <Route path="/profil" element={<PrivateRoute><ProfilPage /></PrivateRoute>} />
                    <Route path="/champion" element={<PrivateRoute><ChampionPage /></PrivateRoute>} />
                    <Route path="/test" element={<AdminRoute><TestPage /></AdminRoute>} />
                    <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </>
    );
}

function AppCore() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default function App() {
    if (!GOOGLE_CLIENT_ID) {
        return <ErrorBoundary><AppCore /></ErrorBoundary>;
    }
    return (
        <ErrorBoundary>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <AppCore />
            </GoogleOAuthProvider>
        </ErrorBoundary>
    );
}
