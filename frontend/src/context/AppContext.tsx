"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, User, Listing, Match, ImpactLog, SEEDED_USERS, SEEDED_LISTINGS, SEEDED_MATCHES, SEEDED_IMPACT_LOGS } from '@/lib/db';
import { Language } from '@/lib/translations';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  listings: Listing[];
  addListing: (listingData: Omit<Listing, 'id' | 'created_at' | 'status' | 'seller_name' | 'seller_company' | 'seller_phone'>) => Listing;
  updateListingStatus: (id: string, status: 'active' | 'sold' | 'expired') => void;
  matches: Match[];
  createMatchProposal: (listingId: string, buyerId: string) => void;
  updateMatchStatus: (id: string, status: 'pending' | 'contacted' | 'closed') => void;
  impactLogs: ImpactLog[];
  impactStats: ReturnType<typeof db.getImpactStats>;
  resetAll: () => void;
  mounted: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [currentUser, setCurrentUserState] = useState<User>(SEEDED_USERS[0]);
  const [listings, setListings] = useState<Listing[]>(SEEDED_LISTINGS);
  const [matches, setMatches] = useState<Match[]>(SEEDED_MATCHES);
  const [impactLogs, setImpactLogs] = useState<ImpactLog[]>(SEEDED_IMPACT_LOGS);
  const [impactStats, setImpactStats] = useState({
    totalDiverted: 470,
    totalCo2Saved: 235,
    totalRevenue: 6200,
    totalDisposalCostsAvoided: 7520,
    activeListingsCount: 5,
    totalUsersCount: 4,
    circularEconomyScore: 77
  });
  const [mounted, setMounted] = useState(false);

  // Load and sync database state
  const syncState = () => {
    setCurrentUserState(db.getActiveUser());
    setListings(db.getListings());
    setMatches(db.getMatches());
    setImpactLogs(db.getImpactLogs());
    setImpactStats(db.getImpactStats());
  };

  useEffect(() => {
    setMounted(true);
    // Initial sync
    syncState();

    // Listen to local storage changes to support tab sync and switcher actions
    const handleStorageChange = () => {
      syncState();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Initial language check
    if (typeof window !== 'undefined') {
      const storedLang = localStorage.getItem('mole_language') as Language;
      if (storedLang) {
        setLanguageState(storedLang);
      }
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mole_language', lang);
    }
  };

  const setCurrentUser = (user: User) => {
    db.setActiveUser(user);
    setCurrentUserState(user);
  };

  const addListing = (listingData: Omit<Listing, 'id' | 'created_at' | 'status' | 'seller_name' | 'seller_company' | 'seller_phone'>) => {
    const fullListingData = {
      ...listingData,
      seller_name: currentUser.full_name,
      seller_company: currentUser.company,
      seller_phone: currentUser.phone
    };
    const newListing = db.createListing(fullListingData);
    syncState();
    return newListing;
  };

  const updateListingStatus = (id: string, status: 'active' | 'sold' | 'expired') => {
    db.updateListingStatus(id, status);
    syncState();
  };

  const createMatchProposal = (listingId: string, buyerId: string) => {
    db.createMatch(listingId, buyerId);
    syncState();
  };

  const updateMatchStatus = (id: string, status: 'pending' | 'contacted' | 'closed') => {
    db.updateMatchStatus(id, status);
    syncState();
  };

  const resetAll = () => {
    db.resetDatabase();
    syncState();
  };

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      currentUser,
      setCurrentUser,
      listings,
      addListing,
      updateListingStatus,
      matches,
      createMatchProposal,
      updateMatchStatus,
      impactLogs,
      impactStats,
      resetAll,
      mounted
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
