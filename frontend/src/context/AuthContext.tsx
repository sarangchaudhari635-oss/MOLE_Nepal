import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { firebaseAuth, googleProvider, isFirebaseConfigured } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import type { Session, User } from '@supabase/supabase-js';

/* ─── Types ─── */
interface UserProfile {
    name: string;
    company: string;
    email: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: UserProfile | null;
    session: Session | null;
    supabaseUser: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ error: string | null }>;
    signup: (email: string, password: string, company: string, industry: string, location: string) => Promise<{ error: string | null }>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: string | null }>;
    updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
    signInWithGoogle: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ─── Helper: build profile from Supabase user ─── */
const buildProfile = (user: User, company?: string): UserProfile => {
    const meta = user.user_metadata || {};
    return {
        name: meta.full_name || meta.name || user.email?.split('@')[0] || 'User',
        company: meta.company || company || 'Your Organisation',
        email: user.email || '',
    };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    /* ─── Listen to Supabase auth state changes ─── */
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setSupabaseUser(session?.user ?? null);
            setUser(session?.user ? buildProfile(session.user) : null);
            setLoading(false);
        });

        // Subscribe to changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setSupabaseUser(session?.user ?? null);
            setUser(session?.user ? buildProfile(session.user) : null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    /* ─── Sign In ─── */
    const login = async (email: string, password: string): Promise<{ error: string | null }> => {
        if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co') {
            // Demo fallback
            setUser({ name: email.split('@')[0], company: 'Demo Company', email });
            setSession({ user: { id: 'demo123', email } } as any);
            return { error: null };
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        return { error: null };
    };

    /* ─── Sign Up ─── */
    const signup = async (
        email: string,
        password: string,
        company: string,
        industry: string,
        location: string
    ): Promise<{ error: string | null }> => {
        if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co') {
            // Demo fallback
            setUser({ name: email.split('@')[0], company, email });
            setSession({ user: { id: 'demo123', email } } as any);
            return { error: null };
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    company,
                    industry,
                    location,
                    full_name: email.split('@')[0],
                },
            },
        });

        if (error) return { error: error.message };

        // If email confirmation is required, user will be null but no error
        if (data.user && !data.session) {
            return { error: 'Please check your email to confirm your account before signing in.' };
        }

        if (data.user) {
            setUser(buildProfile(data.user, company));

            // Send welcome notification
            try {
                await supabase.from('notifications').insert({
                    company_id: data.user.id,
                    type: 'system',
                    title: '🎉 Welcome to MOLE!',
                    body: `Welcome aboard, ${email.split('@')[0]}! Your company "${company}" is now live on the circular economy platform. Start by listing your waste or searching for materials.`,
                    action_url: '/app',
                    is_read: false,
                });
            } catch (e) {
                console.warn('Could not create welcome notification:', e);
            }
        }

        return { error: null };
    };

    /* ─── Sign Out ─── */
    const logout = async () => {
        if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co') {
            await supabase.auth.signOut();
        }
        setSession(null);
        setSupabaseUser(null);
        setUser(null);
    };

    /* ─── Reset Password (sends magic link email) ─── */
    const resetPassword = async (email: string): Promise<{ error: string | null }> => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) return { error: error.message };
        return { error: null };
    };

    /* ─── Update Password (called after magic link lands) ─── */
    const updatePassword = async (newPassword: string): Promise<{ error: string | null }> => {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) return { error: error.message };
        return { error: null };
    };

    /* ─── Google Sign-In via Firebase → Supabase ─── */
    const signInWithGoogle = async (): Promise<{ error: string | null }> => {
        if (!isFirebaseConfigured || !firebaseAuth) {
            return { error: 'Google Sign-In is not configured. Please add Firebase credentials to your .env file.' };
        }
        try {
            const result = await signInWithPopup(firebaseAuth, googleProvider);
            const idToken = await result.user.getIdToken();

            // Exchange Firebase ID token for a Supabase session
            const { error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: idToken,
            });

            if (error) return { error: error.message };
            return { error: null };
        } catch (err: any) {
            if (err?.code === 'auth/popup-closed-by-user') return { error: null }; // user cancelled
            return { error: err?.message || 'Google Sign-In failed.' };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: !!session,
                user,
                session,
                supabaseUser,
                loading,
                login,
                signup,
                logout,
                resetPassword,
                updatePassword,
                signInWithGoogle,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
