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
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const MyDeals = lazy(() => import('./pages/MyDeals'));
const WasteInsights = lazy(() => import('./pages/WasteInsights'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));

/* Protected Route wrapper */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#F8F9FA',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <div style={{
                    width: 40,
                    height: 40,
                    border: '3px solid #E5E7EB',
                    borderTopColor: '#10B981',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ color: '#6B7280', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Loading session…</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter basename={import.meta.env.BASE_URL}>
                <Suspense fallback={<div>Loading...</div>}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<AuthPage />} />
                        <Route path="/signup" element={<AuthPage />} />
                        <Route path="/forgot-password" element={<AuthPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />

                        {/* Protected App Routes */}
                        <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                            <Route index element={<Dashboard />} />
                            <Route path="list-waste" element={<ListWaste />} />
                            <Route path="forecast" element={<WasteForecastPage />} />
                            <Route path="find" element={<FindMaterials />} />
                            <Route path="processing" element={<AIProcessing />} />
                            <Route path="matches" element={<Matches />} />
                            <Route path="opportunities" element={<Opportunities />} />
                            <Route path="deals" element={<MyDeals />} />
                            <Route path="network" element={<TradeHistory />} />
                            <Route path="messages" element={<Messages />} />
                            <Route path="analytics" element={<ImpactAnalytics />} />
                            <Route path="insights" element={<WasteInsights />} />
                            <Route path="reports" element={<Reports />} />
                            <Route path="settings" element={<Settings />} />
                        </Route>
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
