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

const apiFetch = async (path: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('mole_jwt_token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  return fetch(`http://localhost:5000${path}`, { ...options, headers });
};

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
  const syncState = async () => {
    // Check if token exists, if not, try to fetch one for the active user
    const token = typeof window !== 'undefined' ? localStorage.getItem('mole_jwt_token') : null;
    const activeUser = db.getActiveUser();
    if (!token && activeUser) {
      try {
        const res = await fetch('http://localhost:5000/api/auth/demo-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: activeUser.id, role: activeUser.role === 'admin' ? 'agent' : activeUser.role })
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('mole_jwt_token', data.token);
        }
      } catch (err) {
        console.error('Failed to fetch initial token', err);
      }
    }

    setCurrentUserState(activeUser);

    try {
      // 1. Fetch Listings
      const listingsRes = await apiFetch('/api/listings');
      if (listingsRes.ok) {
        const data = await listingsRes.json();
        const mappedListings = data.listings.map((l: any) => ({
          id: l.id,
          user_id: l.user_id,
          seller_name: l.users?.full_name || 'Ram Shrestha',
          seller_company: l.users?.company || 'Bhaktapur Furniture Cluster',
          seller_phone: l.users?.phone || '+977 9851012345',
          title: l.title,
          category_code: l.category_code,
          material_type: l.material_type,
          quantity_kg: Number(l.quantity_kg),
          condition: l.condition,
          price_npr_min: Number(l.price_npr_min || 0),
          price_npr_max: Number(l.price_npr_max || 0),
          photo_url: l.photo_url || undefined,
          lat: Number(l.lat || 0),
          lng: Number(l.lng || 0),
          neighborhood: l.neighborhood || '',
          status: l.status,
          ai_result: l.ai_result || undefined,
          created_at: l.created_at
        }));
        setListings(mappedListings);
      }

      // 2. Fetch Matches
      const matchesRes = await apiFetch('/api/matches/proposals');
      if (matchesRes.ok) {
        const data = await matchesRes.json();
        setMatches(data.proposals || []);
      }

      // 3. Fetch Impact Stats
      const impactRes = await apiFetch('/api/impact');
      if (impactRes.ok) {
        const data = await impactRes.json();
        setImpactStats({
          totalDiverted: Number(data.waste_diverted_from_landfill_kg || 0),
          totalCo2Saved: Number(data.co2_equivalent_saved_kg || 0),
          totalRevenue: Number(data.total_kg_traded || 0) * 15,
          totalDisposalCostsAvoided: Number(data.waste_diverted_from_landfill_kg || 0) * 16,
          activeListingsCount: Number(data.active_listings || 0),
          totalUsersCount: Number(data.total_users || 0),
          circularEconomyScore: Math.min(100, Math.round(75 + (Number(data.waste_diverted_from_landfill_kg || 0) / 200)))
        });
      }
    } catch (err) {
      console.error('Failed to sync backend state, using local storage fallback', err);
      setListings(db.getListings());
      setMatches(db.getMatches());
      setImpactLogs(db.getImpactLogs());
      setImpactStats(db.getImpactStats());
    }
  };

  useEffect(() => {
    setMounted(true);
    syncState();

    const handleStorageChange = () => {
      syncState();
    };

    window.addEventListener('storage', handleStorageChange);
    
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
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mole_jwt_token');
    }
    
    fetch('http://localhost:5000/api/auth/demo-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, role: user.role === 'admin' ? 'agent' : user.role })
    }).then(res => {
      if (res.ok) {
        return res.json();
      }
      throw new Error('Failed to fetch demo token');
    }).then(data => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('mole_jwt_token', data.token);
      }
      syncState();
    }).catch(err => {
      console.error('Demo auth failed, falling back to offline', err);
      syncState();
    });
  };

  const addListing = (listingData: Omit<Listing, 'id' | 'created_at' | 'status' | 'seller_name' | 'seller_company' | 'seller_phone'>) => {
    const fullListingData = {
      ...listingData,
      seller_name: currentUser.full_name,
      seller_company: currentUser.company,
      seller_phone: currentUser.phone
    };
    const newListing = db.createListing(fullListingData);
    
    apiFetch('/api/listings', {
      method: 'POST',
      body: JSON.stringify({
        title: listingData.title,
        category_code: listingData.category_code,
        material_type: listingData.material_type,
        quantity_kg: listingData.quantity_kg,
        condition: listingData.condition,
        price_npr_min: listingData.price_npr_min,
        price_npr_max: listingData.price_npr_max,
        photo_url: listingData.photo_url,
        lat: listingData.lat,
        lng: listingData.lng,
        neighborhood: listingData.neighborhood
      })
    }).then(async (res) => {
      if (res.ok) {
        await syncState();
      }
    }).catch(err => {
      console.error('Error posting listing to backend', err);
    });

    syncState();
    return newListing;
  };

  const updateListingStatus = (id: string, status: 'active' | 'sold' | 'expired') => {
    db.updateListingStatus(id, status);
    
    apiFetch(`/api/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }).then(async (res) => {
      if (res.ok) {
        await syncState();
      }
    }).catch(err => {
      console.error('Error updating listing status on backend', err);
    });

    syncState();
  };

  const createMatchProposal = (listingId: string, buyerId: string) => {
    db.createMatch(listingId, buyerId);
    
    apiFetch('/api/matches', {
      method: 'POST',
      body: JSON.stringify({ listing_id: listingId })
    }).then(async (res) => {
      if (res.ok) {
        await syncState();
      }
    }).catch(err => {
      console.error('Error creating match proposal on backend', err);
    });

    syncState();
  };

  const updateMatchStatus = (id: string, status: 'pending' | 'contacted' | 'closed') => {
    db.updateMatchStatus(id, status);
    
    apiFetch(`/api/matches/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }).then(async (res) => {
      if (res.ok) {
        await syncState();
      }
    }).catch(err => {
      console.error('Error updating match status on backend', err);
    });

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
