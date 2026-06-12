"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { getTranslation } from '@/lib/translations';
import { Globe, Menu, X, PlusCircle, LayoutDashboard, Map, Info, Sprout } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { language, setLanguage, currentUser, mounted } = useApp();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'navHome', icon: Info },
    { href: '/listings', label: 'navMarketplace', icon: Map },
    { href: '/listings/new', label: 'navListWaste', icon: PlusCircle },
    { href: '/dashboard', label: 'navDashboard', icon: LayoutDashboard },
  ];

  const handleLangToggle = () => {
    setLanguage(language === 'en' ? 'ne' : 'en');
  };

  return (
    <nav className="sticky top-0 z-40 bg-surface-container-lowest/95 backdrop-blur-sm border-b border-outline-variant transition-all">
      <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="bg-primary text-on-primary p-2 rounded-lg transition-transform group-hover:scale-105">
                <Sprout className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-on-background leading-none font-headline-md">
                  MOLE
                </span>
                <span className="text-[10px] text-on-surface-variant font-medium tracking-wider uppercase hidden sm:inline mt-0.5">
                  Lifecycle Exchange
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-5 ml-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 font-label-md ${
                      isActive
                        ? 'text-primary border-b-2 border-primary rounded-b-none pb-0.5'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {getTranslation(language, item.label as any)}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Desktop Right Panel actions */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Language Switcher */}
            <button
              onClick={handleLangToggle}
              className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant bg-surface-container hover:bg-surface-container-high px-3 py-1.5 rounded-full transition-all cursor-pointer uppercase border border-outline-variant/50"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'नेपाली' : 'English'}</span>
            </button>

            <div className="h-6 w-px bg-outline-variant"></div>

            {/* User Profile */}
            {mounted && (
              <div className="flex items-center gap-2.5">
                {currentUser.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.full_name}
                    className="w-8 h-8 rounded-full border border-outline-variant object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm">
                    {currentUser.full_name.charAt(0)}
                  </div>
                )}
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-on-background leading-tight">{currentUser.full_name}</p>
                  <p className="text-[10px] text-on-surface-variant leading-none capitalize font-medium">{currentUser.company}</p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={handleLangToggle}
              className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant bg-surface-container px-2.5 py-1.5 rounded-full cursor-pointer uppercase border border-outline-variant/40"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'नेपाली' : 'EN'}</span>
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-on-surface-variant hover:text-on-surface p-2 rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-container-lowest border-b border-outline-variant px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-base font-semibold ${
                  isActive
                    ? 'bg-primary-container/10 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <Icon className="w-4 h-4" />
                {getTranslation(language, item.label as any)}
              </Link>
            );
          })}
          
          {mounted && (
            <div className="pt-3 border-t border-outline-variant flex items-center gap-3">
              {currentUser.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.full_name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm">
                  {currentUser.full_name.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-on-background">{currentUser.full_name}</p>
                <p className="text-xs text-on-surface-variant capitalize">{currentUser.company} ({currentUser.role})</p>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
