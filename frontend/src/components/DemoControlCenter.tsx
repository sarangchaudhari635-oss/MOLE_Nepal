"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { SEEDED_USERS } from '@/lib/db';
import { Users, RefreshCw, Sparkles } from 'lucide-react';

export const DemoControlCenter: React.FC = () => {
  const { currentUser, setCurrentUser, resetAll, language } = useApp();

  return (
    <div className="bg-[#0b2618] text-white border-b border-[#1D6B44]/30 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 premium-shadow relative z-50">
      <div className="flex items-center gap-1.5 font-medium text-emerald-300">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span>
          {language === 'en' 
            ? "MOLE Simulation Sandbox — Click to switch user roles & test smart matching"
            : "मोल सिम्युलेटर स्यान्डबक्स — प्रयोगकर्ता र म्याच इन्जिन परीक्षण गर्न भूमिका रोज्नुहोस्"}
        </span>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-gray-400 flex items-center gap-1">
          <Users className="w-3 h-3" />
          {language === 'en' ? "Login As:" : "लगइन गर्नुहोस्:"}
        </span>
        
        {SEEDED_USERS.map((user) => {
          const isActive = currentUser.id === user.id;
          return (
            <button
              key={user.id}
              onClick={() => setCurrentUser(user)}
              className={`px-2 py-1 rounded transition-all duration-200 cursor-pointer font-medium border ${
                isActive
                  ? 'bg-emerald-600 border-emerald-400 text-white font-bold scale-105'
                  : 'bg-emerald-950/50 border-[#1D6B44]/50 text-emerald-200 hover:bg-emerald-900/60'
              }`}
            >
              {user.full_name} ({user.role === 'generator' ? (language === 'en' ? 'Seller' : 'विक्रेता') : 
                                  user.role === 'buyer' ? (language === 'en' ? 'Buyer' : 'क्रेता') : 
                                  user.role === 'agent' ? (language === 'en' ? 'Agent' : 'एजेन्ट') : 'Admin'})
            </button>
          );
        })}

        <div className="h-4 w-px bg-emerald-800/80 mx-1"></div>

        <button
          onClick={() => {
            if (confirm(language === 'en' ? "Reset database to original seeded state?" : "डेटाबेस सुरुवाती अवस्थामा रिसेट गर्ने?")) {
              resetAll();
              alert(language === 'en' ? "Database reset!" : "डेटाबेस रिसेट भयो!");
            }
          }}
          className="bg-red-950/40 border border-red-800/40 text-red-300 hover:bg-red-900/40 hover:text-white px-2 py-1 rounded flex items-center gap-1 transition-all cursor-pointer"
          title={language === 'en' ? "Reset demo data" : "डेमो डेटा रिसेट गर्नुहोस्"}
        >
          <RefreshCw className="w-3 h-3" />
          <span>{language === 'en' ? "Reset Data" : "डेटा रिसेट"}</span>
        </button>
      </div>
    </div>
  );
};
