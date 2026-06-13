import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const ListWaste = lazy(() => import('./pages/ListWaste'));
const WasteForecastPage = lazy(() => import('./pages/WasteForecast'));
const AIProcessing = lazy(() => import('./pages/AIProcessing'));
const Matches = lazy(() => import('./pages/Matches'));
const Opportunities = lazy(() => import('./pages/Opportunities'));
const FindMaterials = lazy(() => import('./pages/FindMaterials'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const TradeHistory = lazy(() => import('./pages/TradeHistory'));
const Messages = lazy(() => import('./pages/Messages'));
const ImpactAnalytics = lazy(() => import('./pages/ImpactAnalytics'));
const Settings = lazy(() => import('./pages/Settings'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));

/* ─── Branded full-screen page loader ─── */
const PageLoader = () => (
    <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F5F6F8',
        gap: 16,
        zIndex: 9999,
    }}>
        <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '3px solid #E5E7EB',
            borderTopColor: '#10B981',
            animation: 'mole-spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes mole-spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#9CA3AF', fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 500, margin: 0 }}>
            Loading…
        </p>
    </div>
);

/* ─── Protected Route wrapper ─── */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) return <PageLoader />;

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter basename={import.meta.env.BASE_URL}>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<AuthPage />} />
                        <Route path="/signup" element={<AuthPage />} />
                        <Route path="/forgot-password" element={<AuthPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />

                        {/* Protected App Routes */}
                        <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                            <Route index element={<Dashboard />} />
                            <Route path="list-waste" element={<ListWaste />} />
                            <Route path="forecast" element={<WasteForecastPage />} />
                            <Route path="find" element={<FindMaterials />} />
                            <Route path="processing" element={<AIProcessing />} />
                            <Route path="matches" element={<Matches />} />
                            <Route path="opportunities" element={<Opportunities />} />
                            <Route path="network" element={<TradeHistory />} />
                            <Route path="messages" element={<Messages />} />
                            <Route path="analytics" element={<ImpactAnalytics />} />
                            <Route path="settings" element={<Settings />} />
                        </Route>
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
