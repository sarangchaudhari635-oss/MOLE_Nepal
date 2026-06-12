"use client";

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { getTranslation } from '@/lib/translations';
import { db, Listing } from '@/lib/db';
import { 
  Search, 
  MapPin, 
  Tag, 
  ArrowUpDown, 
  PlusCircle, 
  Info,
  Map as MapIcon,
  List as ListIcon,
  Scale,
  Check,
  ChevronRight,
  Sparkles
} from 'lucide-react';

// Dynamically import Leaflet Map to avoid SSR errors
const ListingsMap = dynamic(() => import('@/components/ListingsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-surface-container rounded-2xl flex items-center justify-center border border-outline-variant/30">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-on-surface-variant">Loading interactive map...</p>
      </div>
    </div>
  ),
});

// Category fallback Unsplash images matching the ones in code.html
const CATEGORY_IMAGES: Record<string, string> = {
  wood_biomass: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=400',
  concrete_recycled: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400',
  plastic_recycle: 'https://images.unsplash.com/photo-1526613098278-a7f1a7d7b2e5?auto=format&fit=crop&q=80&w=400',
  glass_recycle: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400',
  metal_scrap: 'https://images.unsplash.com/photo-1558444455-57551955d11d?auto=format&fit=crop&q=80&w=400',
  organic_compost: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=400'
};

export default function ListingsPage() {
  const { listings, language, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'qty_desc' | 'qty_asc'>('date');
  const [highlightedListingId, setHighlightedListingId] = useState<string | null>(null);
  
  // Mobile toggle state: 'list' or 'map'
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');

  // Categories mapping
  const categories = useMemo(() => {
    return [
      { code: 'all', label: 'allCategories' },
      ...Object.entries(db.getCategoryBuyerMapping()).map(([code]) => ({
        code,
        label: code.replace('_', ' ')
      }))
    ];
  }, []);

  // Location mapping
  const locations = useMemo(() => {
    const activeListings = listings.filter(l => l.status === 'active');
    const uniqueLocs = Array.from(new Set(activeListings.map(l => {
      const raw = l.neighborhood.toLowerCase();
      if (raw.includes('bhaktapur')) return 'Bhaktapur';
      if (raw.includes('patan') || raw.includes('lalitpur')) return 'Lalitpur';
      if (raw.includes('balaju')) return 'Balaju';
      if (raw.includes('koteshwor')) return 'Koteshwor';
      if (raw.includes('thamel')) return 'Thamel';
      if (raw.includes('kalimati')) return 'Kalimati';
      if (raw.includes('hetauda')) return 'Hetauda';
      return l.neighborhood;
    })));
    return ['all', ...uniqueLocs];
  }, [listings]);

  // Filter listings
  const filteredListings = useMemo(() => {
    let list = listings.filter(l => l.status === 'active');

    // Text search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(l => 
        l.title.toLowerCase().includes(q) || 
        l.material_type.toLowerCase().includes(q) ||
        l.neighborhood.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter(l => l.category_code === selectedCategory);
    }

    // Location filter
    if (selectedLocation !== 'all') {
      list = list.filter(l => {
        const itemLoc = l.neighborhood.toLowerCase();
        const targetLoc = selectedLocation.toLowerCase();
        return itemLoc.includes(targetLoc);
      });
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'qty_desc') return b.quantity_kg - a.quantity_kg;
      if (sortBy === 'qty_asc') return a.quantity_kg - b.quantity_kg;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return list;
  }, [listings, searchTerm, selectedCategory, selectedLocation, sortBy]);

  const handleCardClick = (listing: Listing) => {
    setHighlightedListingId(listing.id);
    if (window.innerWidth < 768) {
      setMobileView('map');
    }
  };

  return (
    <div className="flex-grow flex flex-col">
      
      {/* Search & Sticky Filter Bar */}
      <section className="sticky top-16 z-30 bg-surface-container-lowest border-b border-outline-variant/60 px-4 md:px-margin-desktop py-4 shadow-sm">
        <div className="max-w-container-max mx-auto">
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Search Input */}
            <div className="flex-grow min-w-[280px] relative">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                placeholder={language === 'en' ? "Search by material name or industry..." : "सामग्री वा उद्योग खोज्नुहोस्..."} 
                type="text"
              />
            </div>
            
            {/* Filter Category */}
            <div className="relative">
              <Tag className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-9 pr-8 py-2.5 bg-surface border border-outline-variant rounded-xl text-xs font-semibold text-on-surface-variant outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer capitalize"
              >
                <option value="all">{getTranslation(language, 'allCategories')}</option>
                {categories.filter(c => c.code !== 'all').map((cat) => (
                  <option key={cat.code} value={cat.code}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Location */}
            <div className="relative">
              <MapPin className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="pl-9 pr-8 py-2.5 bg-surface border border-outline-variant rounded-xl text-xs font-semibold text-on-surface-variant outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                <option value="all">{getTranslation(language, 'allLocations')}</option>
                {locations.filter(l => l !== 'all').map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Sorting */}
            <div className="relative">
              <ArrowUpDown className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="pl-9 pr-8 py-2.5 bg-surface border border-outline-variant rounded-xl text-xs font-semibold text-on-surface-variant outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                <option value="date">{language === 'en' ? 'Newest Listings' : 'नयाँ सामग्रीहरू'}</option>
                <option value="qty_desc">{language === 'en' ? 'Quantity: High to Low' : 'परिमाण: धेरै देखि थोरै'}</option>
                <option value="qty_asc">{language === 'en' ? 'Quantity: Low to High' : 'परिमाण: थोरै देखि धेरै'}</option>
              </select>
            </div>

            {/* New Listing Trigger Button */}
            <Link
              href="/listings/new"
              className="bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-all cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{getTranslation(language, 'navListWaste')}</span>
            </Link>

          </div>
        </div>
      </section>

      {/* Main Split Layout: Results vs Leaflet Map */}
      <div className="flex flex-col lg:flex-row flex-grow overflow-hidden h-[calc(100vh-136px)] relative">
        
        {/* Results Sidebar */}
        <section className={`w-full lg:w-[60%] xl:w-[55%] overflow-y-auto px-4 md:px-margin-desktop py-8 bg-surface ${mobileView === 'map' ? 'hidden lg:block' : 'block'}`}>
          
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold font-headline-md text-on-surface flex items-center gap-2">
              <span>{language === 'en' ? "Available Resources" : "उपलब्ध सामग्रीहरू"}</span>
              <span className="text-on-surface-variant font-normal text-xs bg-surface-container px-2.5 py-1 rounded-full mt-0.5">
                {filteredListings.length} {language === 'en' ? "results" : "सामग्री फेला"}
              </span>
            </h1>
            
            <span className="hidden xl:inline text-xs font-semibold text-primary/80">
              {language === 'en' ? "• Click to center on map view" : "• नक्सामा केन्द्रित गर्न क्लिक गर्नुहोस्"}
            </span>
          </div>

          {filteredListings.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant/35 rounded-2xl p-12 text-center card-shadow">
              <Info className="w-10 h-10 text-outline mx-auto mb-3" />
              <h3 className="font-bold text-sm text-on-surface">{getTranslation(language, 'noListingsFound')}</h3>
              <p className="text-xs text-on-surface-variant mt-1.5">
                {language === 'en' ? "Try clearing search queries or filters." : "खोज परिमार्जन गर्नुहोस् वा फिल्टर परिवर्तन गर्नुहोस्।"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-20">
              {filteredListings.map((listing) => {
                const isSelected = highlightedListingId === listing.id;
                
                // Purity and matching checks
                const purity = listing.material_type.includes('99.9%') || listing.title.includes('Grade A') ? 98 : 88;
                
                return (
                  <div
                    key={listing.id}
                    onClick={() => handleCardClick(listing)}
                    className={`bg-surface-container-lowest rounded-xl overflow-hidden card-shadow group border transition-all flex flex-col cursor-pointer ${
                      isSelected 
                        ? 'border-primary ring-2 ring-primary/15' 
                        : 'border-outline-variant/30 hover:border-primary/20'
                    }`}
                  >
                    {/* Visual Card Image */}
                    <div className="relative h-44 overflow-hidden bg-gray-150">
                      <img 
                        src={listing.photo_url || CATEGORY_IMAGES[listing.category_code] || CATEGORY_IMAGES.wood_biomass} 
                        alt={listing.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {/* Verification badge */}
                      <div className="absolute top-3 right-3 bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full text-[9px] font-bold flex items-center gap-0.5 shadow-sm">
                        <Check className="w-3 h-3 text-secondary shrink-0" />
                        <span>{language === 'en' ? "Verified" : "प्रमाणित"}</span>
                      </div>

                      {/* Smart Match pill */}
                      <div className="absolute bottom-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md px-2 py-0.5 rounded-lg text-primary font-bold text-[9px] flex items-center gap-0.5 border border-primary/20">
                        <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                        <span>{purity}% {language === 'en' ? "Match" : "मिलान"}</span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-2.5 gap-2">
                        <span className="text-secondary font-bold text-[9px] tracking-wider uppercase">
                          {listing.category_code.replace('_', ' ')}
                        </span>
                        <span className="font-bold text-sm text-primary shrink-0">
                          Rs. {listing.price_npr_min} - {listing.price_npr_max}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-on-surface mb-3 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {listing.title}
                      </h3>

                      {/* Specifications */}
                      <div className="space-y-2 mb-5 text-xs text-on-surface-variant font-medium pt-2.5 border-t border-outline-variant/20">
                        <div className="flex items-center gap-2">
                          <Scale className="w-4 h-4 text-outline" />
                          <span>{listing.quantity_kg.toLocaleString()} kg</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-outline" />
                          <span className="truncate">{listing.neighborhood}</span>
                        </div>
                      </div>

                      {/* View Button */}
                      <Link 
                        href={`/listings/${listing.id}`}
                        className="mt-auto w-full py-2.5 bg-surface-container-low text-primary font-bold rounded-lg hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-1.5 text-xs"
                      >
                        <span>{getTranslation(language, 'viewDetails')}</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Interactive Sticky OSM Map */}
        <section className={`w-full lg:w-[40%] xl:w-[45%] h-full relative ${mobileView === 'list' ? 'hidden lg:block' : 'block'}`}>
          <ListingsMap 
            listings={filteredListings}
            highlightedListingId={highlightedListingId}
          />
        </section>

        {/* Floating Mobile View Toggle button */}
        <button
          onClick={() => setMobileView(mobileView === 'list' ? 'map' : 'list')}
          className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-primary hover:bg-primary-hover text-on-primary border border-primary/20 rounded-full px-5 py-3 shadow-xl flex items-center gap-2 text-xs font-bold transition-all z-35 cursor-pointer active:scale-95"
        >
          {mobileView === 'list' ? (
            <>
              <MapIcon className="w-4 h-4" />
              <span>{language === 'en' ? 'Show Map View' : 'नक्सा हेर्नुहोस्'}</span>
            </>
          ) : (
            <>
              <ListIcon className="w-4 h-4" />
              <span>{language === 'en' ? 'Show List View' : 'सूची हेर्नुहोस्'}</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
}
