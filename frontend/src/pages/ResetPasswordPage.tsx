import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Orbit, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

/* ─────────────────────── Password-strength helpers ─────────────────────── */
const getStrength = (p: string) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
};
const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500'];

/* ─────────────────────── Page ─────────────────────── */
const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const { updatePassword } = useAuth();

    const [status, setStatus] = useState<'loading' | 'ready' | 'success' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    /* Supabase embeds the token in the URL hash after the magic-link click.
       We call exchangeCodeForSession / setSession to activate the recovery session. */
    useEffect(() => {
        const hash = window.location.hash;

        // Supabase puts tokens in the fragment: #access_token=...&type=recovery
        if (hash.includes('access_token') && hash.includes('type=recovery')) {
            // The supabase client automatically picks up the hash on init.
            // Just confirm the session is present.
            supabase.auth.getSession().then(({ data }) => {
                if (data.session) {
                    setStatus('ready');
                } else {
                    setErrorMsg('Recovery link has expired or is invalid. Please request a new one.');
                    setStatus('error');
                }
            });
        } else if (hash.includes('access_token')) {
            // Generic magic link (e.g. email confirmation)
            supabase.auth.getSession().then(({ data }) => {
                if (data.session) {
                    setStatus('ready');
                } else {
                    setErrorMsg('This link has expired. Please request a new one.');
                    setStatus('error');
                }
            });
        } else {
            setErrorMsg('No recovery token found. Please use the link from your email.');
            setStatus('error');
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (getStrength(newPassword) < 3) {
            setErrorMsg('Please choose a stronger password (min. 8 chars, uppercase, number).');
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrorMsg('Passwords do not match.');
            return;
        }

        setSubmitting(true);
        const { error } = await updatePassword(newPassword);
        setSubmitting(false);

        if (error) {
            setErrorMsg(error);
            return;
        }

        setStatus('success');
        setTimeout(() => navigate('/app', { replace: true }), 2500);
    };

    /* ── Shared styles ── */
    const inputBase = `w-full bg-white border border-surface-200 rounded-xl pl-11 pr-4 py-3 text-[15px]
        font-medium text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-4
        focus:ring-brand-500/10 focus:border-brand-500 transition-all duration-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]`;

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 relative overflow-hidden font-sans text-surface-900">
            {/* Ambient blurs */}
            <div className="absolute top-0 right-0 -mr-[18%] -mt-[8%] w-[650px] h-[650px] bg-brand-50 rounded-full blur-[120px] opacity-60 pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-[10%] -mb-[8%] w-[550px] h-[550px] bg-emerald-50 rounded-full blur-[100px] opacity-50 pointer-events-none" />

            <div className="w-full max-w-[440px] bg-white rounded-[28px] shadow-[0_8px_40px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.03)] p-8 md:p-10 relative z-10">

                {/* Logo */}
                <div
                    className="flex items-center gap-2.5 mb-10 cursor-pointer group"
                    onClick={() => navigate('/')}
                >
                    <div className="w-9 h-9 rounded-xl bg-surface-900 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                        <Orbit size={18} className="text-brand-400" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-surface-900">MOLE</span>
                </div>

                {/* ── Loading ── */}
                {status === 'loading' && (
                    <div className="flex flex-col items-center py-10 gap-4">
                        <div className="w-10 h-10 rounded-full border-4 border-surface-200 border-t-brand-500 animate-spin" />
                        <p className="text-surface-500 text-[14px]">Verifying your link…</p>
                    </div>
                )}

                {/* ── Error ── */}
                {status === 'error' && (
                    <div className="flex flex-col items-center gap-6 py-4">
                        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                            <AlertCircle size={26} className="text-red-500" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-[22px] font-bold text-surface-900 mb-2">Link Invalid</h2>
                            <p className="text-surface-500 text-[14px] leading-relaxed">{errorMsg}</p>
                        </div>
                        <button
                            onClick={() => navigate('/forgot-password')}
                            className="w-full rounded-xl py-3.5 font-semibold text-[15px] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] hover:opacity-90"
                            style={{ backgroundColor: '#1C1C1E', color: '#fff' }}
                        >
                            Request New Link
                            <ArrowRight size={16} />
                        </button>
                    </div>
                )}

                {/* ── Success ── */}
                {status === 'success' && (
                    <div className="flex flex-col items-center gap-6 py-4">
                        <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center">
                            <CheckCircle2 size={26} className="text-brand-600" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-[22px] font-bold text-surface-900 mb-2">Password Updated!</h2>
                            <p className="text-surface-500 text-[14px] leading-relaxed">
                                Your password has been reset successfully. Redirecting you to the dashboard…
                            </p>
                        </div>
                        <div className="w-full bg-surface-100 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full bg-brand-500 rounded-full animate-[progress_2.5s_linear_forwards]" />
                        </div>
                        <style>{`@keyframes progress { from { width: 0% } to { width: 100% } }`}</style>
                    </div>
                )}

                {/* ── Form ── */}
                {status === 'ready' && (
                    <>
                        <div className="mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-6">
                                <Lock size={24} className="text-brand-600" />
                            </div>
                            <h2 className="text-[28px] font-bold tracking-tight text-surface-900 mb-1.5">
                                Set New Password
                            </h2>
                            <p className="text-surface-500 text-[15px] leading-relaxed">
                                Choose a strong password for your MOLE account.
                            </p>
                        </div>

                        {errorMsg && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-[13px] font-semibold">
                                <AlertCircle size={18} />
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* New password */}
                            <div>
                                <label className="block text-[13px] font-semibold text-surface-700 mb-1.5">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                                    <input
                                        id="reset-new-password"
                                        type={showPw ? 'text' : 'password'}
                                        required
                                        placeholder="Min. 8 characters"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className={inputBase + ' pr-11'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw(!showPw)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                                    >
                                        {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                                {/* Strength meter */}
                                {newPassword && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="flex-1 flex gap-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= getStrength(newPassword) ? strengthColors[getStrength(newPassword)] : 'bg-surface-200'}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[11px] font-medium text-surface-500">
                                            {strengthLabels[getStrength(newPassword)]}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Confirm password */}
                            <div>
                                <label className="block text-[13px] font-semibold text-surface-700 mb-1.5">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                                    <input
                                        id="reset-confirm-password"
                                        type={showConfirm ? 'text' : 'password'}
                                        required
                                        placeholder="Re-enter your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={inputBase + ' pr-11'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                                    >
                                        {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                                {/* Match indicator */}
                                {confirmPassword && (
                                    <p className={`text-[12px] mt-1.5 font-medium ${newPassword === confirmPassword ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                    </p>
                                )}
                            </div>

                            <button
                                id="reset-password-submit"
                                type="submit"
                                disabled={submitting}
                                style={{ backgroundColor: '#1C1C1E', color: '#fff' }}
                                className="w-full rounded-xl py-3.5 font-semibold text-[15px] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mt-2 active:scale-[0.98] hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Updating…
                                    </>
                                ) : (
                                    <>Update Password <ArrowRight size={16} /></>
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;
