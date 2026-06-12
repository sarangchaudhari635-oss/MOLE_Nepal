"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { getTranslation } from '@/lib/translations';
import { db } from '@/lib/db';
import Link from 'next/link';
import { 
  PlusCircle, 
  Tag, 
  MapPin, 
  TrendingUp, 
  Coins, 
  Leaf, 
  ShieldCheck, 
  ArrowRightLeft, 
  CheckCircle,
  Clock,
  Download,
  Users,
  Compass,
  FileText,
  Building2,
  Scale,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Archive
} from 'lucide-react';

// Fallback image constants for dashboard items
const DASHBOARD_THUMBNAILS: Record<string, string> = {
  wood: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=300',
  concrete: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=300',
  plastic: 'https://images.unsplash.com/photo-1526613098278-a7f1a7d7b2e5?auto=format&fit=crop&q=80&w=300',
  glass: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=300',
  metal: 'https://images.unsplash.com/photo-1558444455-57551955d11d?auto=format&fit=crop&q=80&w=300'
};

export default function DashboardPage() {
  const { 
    currentUser, 
    listings, 
    matches, 
    impactStats, 
    updateListingStatus, 
    updateMatchStatus,
    language,
    mounted
  } = useApp();

  // Selected sub-tab for Admin view
  const [adminTab, setAdminTab] = useState<'moderation' | 'users' | 'esg'>('moderation');
  const [esgDownloading, setEsgDownloading] = useState(false);

  if (!mounted) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-on-surface-variant font-medium">Loading organization dashboard...</p>
        </div>
      </div>
    );
  }

  // Filter listings based on owner
  const myListings = listings.filter(l => l.user_id === currentUser.id);
  const myActiveListings = myListings.filter(l => l.status === 'active');
  const mySoldListings = myListings.filter(l => l.status === 'sold');
  
  // Calculate generator's metrics
  const myRevenue = mySoldListings.reduce((sum, l) => {
    const avgPrice = (l.price_npr_min + l.price_npr_max) / 2;
    return sum + (l.quantity_kg * avgPrice);
  }, 0);
  const myDiverted = mySoldListings.reduce((sum, l) => sum + l.quantity_kg, 0);

  // Filter buyer matches
  const myMatches = matches.filter(m => m.buyer_id === currentUser.id);

  // Recommendations matching the buyer's industry profile
  const recommendedListings = listings.filter(l => {
    if (l.status !== 'active') return false;
    const mapping = db.getCategoryBuyerMapping();
    const recommendedIndustries = mapping[l.category_code] || [];
    return recommendedIndustries.some(ind => 
      currentUser.industry?.toLowerCase().includes(ind.toLowerCase())
    );
  });

  const handleEsgDownload = () => {
    setEsgDownloading(true);
    setTimeout(() => {
      setEsgDownloading(false);
      alert(language === 'en' 
        ? "ESG Impact Certificate generated successfully! Serial ID: MOLE-2026-N82"
        : "ESG प्रभाव प्रमाणपत्र सिर्जना भयो! प्रमाणपत्र संख्या: MOLE-2026-N82");
    }, 1500);
  };

  // 1. GENERATOR DASHBOARD VIEW (Ram Shrestha)
  const renderGeneratorDashboard = () => (
    <div className="space-y-8">
      
      {/* Summary Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/35 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 bg-primary/10 rounded-lg text-primary"><Coins className="w-5 h-5" /></span>
            <span className="text-secondary font-bold text-xs flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +12.5%
            </span>
          </div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{language === 'en' ? "Revenue Generated" : "सिर्जित आम्दानी"}</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-on-surface mt-1 font-headline-md">₨ {myRevenue.toLocaleString()}</h3>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/35 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 bg-primary/10 rounded-lg text-primary"><Archive className="w-5 h-5" /></span>
            <span className="text-secondary font-bold text-xs flex items-center gap-0.5"><CheckCircle className="w-3.5 h-3.5" /> Stable</span>
          </div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{language === 'en' ? "Resources Sold" : "विक्रि सामग्री"}</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-on-surface mt-1 font-headline-md">{myDiverted.toLocaleString()} kg</h3>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/35 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 bg-primary/10 rounded-lg text-primary"><FileText className="w-5 h-5" /></span>
          </div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{language === 'en' ? "Active Listings" : "सक्रिय सूचीहरू"}</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-on-surface mt-1 font-headline-md">{myActiveListings.length} Assets</h3>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/35 shadow-sm border-l-4 border-l-secondary hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 bg-secondary/10 rounded-lg text-secondary"><Leaf className="w-5 h-5" /></span>
            <span className="text-secondary font-bold text-xs uppercase tracking-wide">High Impact</span>
          </div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{language === 'en' ? "CO2 Mitigated" : "CO2 न्यूनीकरण"}</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-secondary mt-1 font-headline-md">{(myDiverted * 0.5).toFixed(1)} kg</h3>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Listings */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold font-headline-md text-on-surface">{getTranslation(language, 'myActiveListings')}</h2>
            <Link 
              href="/listings/new" 
              className="text-xs text-primary hover:underline font-bold flex items-center gap-1 font-label-md"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{language === 'en' ? "List New Waste" : "नयाँ थप्नुहोस्"}</span>
            </Link>
          </div>

          <div className="space-y-4">
            {myListings.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant/35 rounded-2xl p-8 text-center text-on-surface-variant text-xs card-shadow">
                {language === 'en' ? "No active waste materials listed yet." : "तपाईंको कुनै सक्रिय सामग्री सूचीकृत छैन।"}
              </div>
            ) : (
              myListings.map((listing) => (
                <div key={listing.id} className="bg-surface-container-lowest border border-outline-variant/35 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center group hover:border-primary/20 transition-all card-shadow">
                  <img 
                    src={listing.photo_url || DASHBOARD_THUMBNAILS.wood} 
                    alt={listing.title} 
                    className="w-20 h-20 rounded-lg object-cover bg-gray-100 shrink-0"
                  />
                  
                  <div className="flex-grow text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                      <span className="bg-primary/5 border border-primary/20 text-primary text-[8px] uppercase font-bold px-2 py-0.5 rounded">
                        {listing.category_code}
                      </span>
                      <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                        listing.status === 'active' 
                          ? 'bg-secondary/5 border-secondary/25 text-secondary' 
                          : 'bg-surface-container-high border-outline-variant text-on-surface-variant'
                      }`}>
                        {listing.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-on-surface leading-tight font-headline-md">{listing.title}</h4>
                    <p className="text-[11px] text-on-surface-variant mt-1 font-medium">
                      {listing.quantity_kg.toLocaleString()} kg · {listing.neighborhood} · Rs. {listing.price_npr_min} - {listing.price_npr_max} / kg
                    </p>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                    {listing.status === 'active' && (
                      <button
                        onClick={() => updateListingStatus(listing.id, 'sold')}
                        className="flex-1 md:flex-none px-4 py-2 bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
                      >
                        {language === 'en' ? "Mark as Sold" : "बिक्री भयो"}
                      </button>
                    )}
                    <Link
                      href={`/listings/${listing.id}`}
                      className="flex-1 md:flex-none px-4 py-2 border border-outline-variant bg-surface hover:bg-surface-container-low text-on-surface-variant font-bold text-xs rounded-xl text-center transition-all cursor-pointer"
                    >
                      {language === 'en' ? "View Details" : "विवरण"}
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column: Interested buyers */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant/35 rounded-2xl p-6 shadow-sm card-shadow">
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-1.5 font-label-md">
              <Users className="w-4.5 h-4.5 text-primary" />
              <span>{language === 'en' ? "Interested Bidders" : "इच्छुक खरिदकर्ताहरू"}</span>
            </h3>

            <div className="space-y-4">
              {matches.filter(m => listings.find(l => l.id === m.listing_id)?.user_id === currentUser.id).length === 0 ? (
                <p className="text-xs text-on-surface-variant font-medium py-2">
                  {language === 'en' ? "No swap inquiries received yet." : "सोधपुछहरू प्राप्त भएका छैनन्।"}
                </p>
              ) : (
                matches.filter(m => listings.find(l => l.id === m.listing_id)?.user_id === currentUser.id).map((m) => {
                  const item = listings.find(l => l.id === m.listing_id);
                  if (!item) return null;
                  return (
                    <div key={m.id} className="bg-surface border border-outline-variant/30 p-3.5 rounded-xl text-xs space-y-2.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-on-surface block">Patan Bio-Fuel Ltd</span>
                          <span className="text-[9px] text-outline font-semibold">Matched: {item.title.split(' - ')[0]}</span>
                        </div>
                        <span className="bg-secondary-container text-on-secondary-container text-[8px] px-2 py-0.5 rounded font-extrabold uppercase">
                          {m.status}
                        </span>
                      </div>
                      <div className="flex gap-2 justify-end pt-1">
                        <Link 
                          href={`/listings/${item.id}`}
                          className="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-[10px] font-bold shadow hover:opacity-90"
                        >
                          Review Offer
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  // 2. BUYER DASHBOARD VIEW (Sita Thapa)
  const renderBuyerDashboard = () => (
    <div className="space-y-8">
      
      {/* Buyer Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/35 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 bg-primary/10 rounded-lg text-primary"><Compass className="w-5 h-5" /></span>
            <span className="text-secondary font-bold text-xs">Active Engine</span>
          </div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{language === 'en' ? "Materials Matched" : "म्याच भएका सामग्री"}</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-on-surface mt-1 font-headline-md">{recommendedListings.length}</h3>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/35 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 bg-primary/10 rounded-lg text-primary"><CheckCircle className="w-5 h-5" /></span>
            <span className="text-secondary font-bold text-xs">Secured</span>
          </div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{language === 'en' ? "Exchanges Secured" : "सम्पन्न विनिमय"}</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-on-surface mt-1 font-headline-md">
            {myMatches.filter(m => m.status === 'closed').length} Deals
          </h3>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/35 shadow-sm border-l-4 border-l-secondary hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 bg-secondary/10 rounded-lg text-secondary"><Leaf className="w-5 h-5" /></span>
            <span className="text-secondary font-bold text-xs uppercase tracking-wide">ESG Impact</span>
          </div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{language === 'en' ? "CO2 Emissions Saved" : "बचत भएको CO2"}</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-secondary mt-1 font-headline-md">
            {(myMatches.filter(m => m.status === 'closed').length * 200).toLocaleString()} kg
          </h3>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/35 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 bg-primary/10 rounded-lg text-primary"><Clock className="w-5 h-5" /></span>
          </div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{language === 'en' ? "Active Inquiries" : "सक्रिय सोधपुछ"}</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-on-surface mt-1 font-headline-md">
            {myMatches.filter(m => m.status !== 'closed').length}
          </h3>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Recommended items */}
        <div className="lg:col-span-8 space-y-4">
          <div>
            <h2 className="text-lg font-bold font-headline-md text-on-surface">{getTranslation(language, 'recommendedListings')}</h2>
            <p className="text-xs text-on-surface-variant font-medium mt-0.5">
              {language === 'en' 
                ? "Listings matching your raw material needs based on your industry profile."
                : "तपाईंको उद्योग प्रोफाइलसँग मेल खाने सक्रिय सामग्री सूचीहरू।"}
            </p>
          </div>

          <div className="space-y-4">
            {recommendedListings.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant/35 rounded-2xl p-8 text-center text-on-surface-variant text-xs card-shadow">
                {language === 'en' ? "No recommended matches found." : "कुनै मिल्दो सामग्री फेला परेन।"}
              </div>
            ) : (
              recommendedListings.map((listing) => {
                const matchObj = myMatches.find(m => m.listing_id === listing.id);
                const purity = listing.material_type.includes('99.9%') || listing.title.includes('Grade A') ? 98 : 88;
                return (
                  <div key={listing.id} className="bg-surface-container-lowest border border-outline-variant/35 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center group hover:border-primary/20 transition-all card-shadow">
                    <img 
                      src={listing.photo_url || DASHBOARD_THUMBNAILS.concrete} 
                      alt={listing.title} 
                      className="w-20 h-20 rounded-lg object-cover bg-gray-100 shrink-0"
                    />

                    <div className="flex-grow text-center md:text-left">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1.5">
                        <span className="bg-secondary/10 text-secondary text-[8px] font-bold uppercase px-2.5 py-0.5 rounded border border-secondary/20">
                          {purity}% {language === 'en' ? "Symbiosis Match" : "सहसम्बन्ध मिलान"}
                        </span>
                        <span className="text-[10px] text-on-surface-variant font-semibold capitalize">{listing.neighborhood}</span>
                      </div>
                      
                      <h4 className="font-bold text-sm text-on-surface leading-tight font-headline-md">{listing.title}</h4>
                      <p className="text-[11px] text-on-surface-variant mt-1 font-medium">
                        {listing.quantity_kg.toLocaleString()} kg available · Rs. {listing.price_npr_min} - {listing.price_npr_max} / kg
                      </p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                      {!matchObj ? (
                        <button
                          onClick={() => {
                            db.createMatch(listing.id, currentUser.id);
                            window.dispatchEvent(new Event('storage'));
                            alert(language === 'en' ? "Proposal sent!" : "विनिमय प्रस्ताव पठाइयो!");
                          }}
                          className="flex-1 md:flex-none px-4 py-2.5 bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
                        >
                          {getTranslation(language, 'initiateMatch')}
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-secondary bg-secondary/5 px-3 py-2 border border-secondary/20 rounded-xl flex items-center justify-center">
                          Proposal Registered
                        </span>
                      )}
                      
                      <Link
                        href={`/listings/${listing.id}`}
                        className="flex-1 md:flex-none px-4 py-2.5 border border-outline-variant bg-surface hover:bg-surface-container-low text-on-surface-variant font-bold text-xs rounded-xl text-center transition-all cursor-pointer"
                      >
                        {getTranslation(language, 'viewDetails')}
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active negotiation statuses */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant/35 rounded-2xl p-6 shadow-sm card-shadow">
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-1.5 font-label-md">
              <ArrowRightLeft className="w-4.5 h-4.5 text-primary" />
              <span>{getTranslation(language, 'negotiations')}</span>
            </h3>

            <div className="space-y-4">
              {myMatches.length === 0 ? (
                <p className="text-xs text-on-surface-variant font-medium py-2">
                  {language === 'en' ? "No active proposals yet." : "सक्रिय सोधपुछ तथा म्याचहरू छैनन्।"}
                </p>
              ) : (
                myMatches.map((m) => {
                  const item = listings.find(l => l.id === m.listing_id);
                  if (!item) return null;
                  return (
                    <div key={m.id} className="border-b border-outline-variant/20 pb-3 last:border-0 last:pb-0 text-xs">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-bold text-on-surface truncate max-w-[130px]">{item.title}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded capitalize ${
                          m.status === 'closed' ? 'bg-secondary/5 text-secondary border border-secondary/20' : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {m.status}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-on-surface-variant font-semibold">
                        <span>Qty: {item.quantity_kg.toLocaleString()}kg</span>
                        {m.status !== 'closed' && (
                          <button
                            onClick={() => {
                              db.updateMatchStatus(m.id, 'closed');
                              window.dispatchEvent(new Event('storage'));
                            }}
                            className="text-primary font-bold hover:underline cursor-pointer text-[10px]"
                          >
                            Close Deal
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  // 3. AGENT LOGISTICS DASHBOARD VIEW (Bijay Tamang)
  const renderAgentDashboard = () => (
    <div className="bg-surface-container-lowest border border-outline-variant/35 rounded-2xl p-6 sm:p-8 card-shadow max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6 border-b border-outline-variant/20 pb-4">
        <Compass className="w-6 h-6 text-primary animate-spin" style={{ animationDuration: '6s' }} />
        <h2 className="text-xl font-bold font-headline-md text-on-surface">{getTranslation(language, 'agentDashboard')}</h2>
      </div>

      <div className="bg-surface border border-outline-variant/30 rounded-xl p-6 text-center max-w-xl mx-auto my-6">
        <MapPin className="w-10 h-10 text-primary/60 mx-auto mb-3" />
        <h3 className="font-bold text-sm text-on-surface mb-2 font-headline-md">{language === 'en' ? "Logistics Pickups & Freight Matches" : "ढुवानी तथा यातायात सङ्कलन सूची"}</h3>
        <p className="text-xs text-on-surface-variant leading-relaxed mb-6 font-medium">
          {language === 'en' 
            ? "Connect with factories looking for scrap transport collectors in the Kathmandu Valley. Help transport materials and secure a 5% broker commission on MOLE closed transactions."
            : "काठमाडौं उपत्यका भित्रका कारखानाहरूबाट फोहोर सामान संकलन तथा ढुवानी सेवा मिलाउनुहोस् र कारोबार पूरा भएपछि ५% कमिसन प्राप्त गर्नुहोस्।"}
        </p>

        {/* Mock logistics list */}
        <div className="space-y-3 text-left bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/35 text-xs font-medium">
          <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
            <div>
              <span className="font-bold text-on-surface">Thimi (Sawdust) → Lalitpur (Biomass)</span>
              <span className="block text-[10px] text-on-surface-variant font-semibold">Qty: 300kg · Distance: 12 km</span>
            </div>
            <span className="text-[9px] bg-secondary/5 text-secondary border border-secondary/25 px-2.5 py-1 rounded font-bold uppercase">Rs. 800 Freight</span>
          </div>

          <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
            <div>
              <span className="font-bold text-on-surface">Balaju (HDPE) → Patan (Eco-Brick)</span>
              <span className="block text-[10px] text-on-surface-variant font-semibold">Qty: 500kg · Distance: 15 km</span>
            </div>
            <span className="text-[9px] bg-secondary/5 text-secondary border border-secondary/25 px-2.5 py-1 rounded font-bold uppercase">Rs. 1,200 Freight</span>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <span className="font-bold text-on-surface">Koteshwor (Rubble) → Bhaktapur (Road site)</span>
              <span className="block text-[10px] text-on-surface-variant font-semibold">Qty: 2,000kg · Distance: 8 km</span>
            </div>
            <span className="text-[9px] bg-secondary/5 text-secondary border border-secondary/25 px-2.5 py-1 rounded font-bold uppercase">Rs. 3,500 Freight</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 4. ADMIN DASHBOARD VIEW
  const renderAdminDashboard = () => (
    <div className="space-y-8">
      {/* Sub tabs header */}
      <div className="flex border-b border-outline-variant/60">
        <button
          onClick={() => setAdminTab('moderation')}
          className={`px-5 py-3 font-bold text-xs border-b-2 cursor-pointer transition-all font-label-md ${
            adminTab === 'moderation' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          {getTranslation(language, 'moderationQueue')}
        </button>
        <button
          onClick={() => setAdminTab('users')}
          className={`px-5 py-3 font-bold text-xs border-b-2 cursor-pointer transition-all font-label-md ${
            adminTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          {getTranslation(language, 'systemUsers')}
        </button>
        <button
          onClick={() => setAdminTab('esg')}
          className={`px-5 py-3 font-bold text-xs border-b-2 cursor-pointer transition-all font-label-md ${
            adminTab === 'esg' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          {getTranslation(language, 'esgReportTitle')}
        </button>
      </div>

      {/* Admin tab content */}
      {adminTab === 'moderation' && (
        <div className="bg-surface-container-lowest border border-outline-variant/35 rounded-2xl p-6 shadow-sm card-shadow">
          <h3 className="text-sm font-bold text-on-surface mb-4 font-headline-md">{language === 'en' ? "Listing Moderation & AI Logs" : "सामग्री व्यवस्थापन तथा एआई लग सूची"}</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-bold uppercase text-[9px] border-b border-outline-variant/40">
                  <th className="px-4 py-3">Listing Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Purity %</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 text-on-surface-variant font-semibold">
                {listings.map(l => (
                  <tr key={l.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-on-surface">{l.title}</td>
                    <td className="px-4 py-3.5 capitalize">{l.category_code.replace('_', ' ')}</td>
                    <td className="px-4 py-3.5">{l.ai_result?.estimated_purity_pct || 90}%</td>
                    <td className="px-4 py-3.5">{l.neighborhood}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded border capitalize ${
                        l.status === 'active' 
                          ? 'bg-secondary/5 border-secondary/20 text-secondary' 
                          : 'bg-surface-container-high border-outline-variant text-on-surface-variant'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => {
                          if (confirm("Delete this listing from the platform?")) {
                            updateListingStatus(l.id, 'expired');
                          }
                        }}
                        className="text-error hover:text-red-700 font-bold hover:underline cursor-pointer text-[10px]"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminTab === 'users' && (
        <div className="bg-surface-container-lowest border border-outline-variant/35 rounded-2xl p-6 shadow-sm card-shadow">
          <h3 className="text-sm font-bold text-on-surface mb-4 font-headline-md">{language === 'en' ? "Active Platforms Accounts" : "सक्रिय प्लेटफर्म खाताहरू"}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {db.getUsers().map((u) => (
              <div key={u.id} className="border border-outline-variant/30 rounded-xl p-4 flex items-center gap-3 bg-surface">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {u.full_name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-surface">{u.full_name}</h4>
                  <p className="text-[10px] text-on-surface-variant capitalize font-medium">{u.role} · {u.company}</p>
                  <p className="text-[9px] text-primary mt-0.5 font-bold">{u.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {adminTab === 'esg' && (
        <div className="bg-surface-container-lowest border border-outline-variant/35 rounded-2xl p-6 sm:p-8 shadow-sm card-shadow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-outline-variant/20 pb-4">
            <div>
              <h3 className="text-sm font-bold text-on-surface font-headline-md">{language === 'en' ? "Auditable ESG Certificate Builder" : "ESG प्रभाव रिपोर्ट निर्माता"}</h3>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">Generate verified proof of carbon offset and waste diversion for regulatory filing.</p>
            </div>
            
            <button
              disabled={esgDownloading}
              onClick={handleEsgDownload}
              className="bg-primary hover:bg-primary-hover disabled:bg-surface-container-high text-on-primary font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>{esgDownloading ? (language === 'en' ? 'Generating...' : 'प्रक्रिया हुँदैछ...') : getTranslation(language, 'downloadReport')}</span>
            </button>
          </div>

          {/* Styled Mock Certificate */}
          <div className="border-4 border-double border-secondary/30 p-6 sm:p-8 bg-surface-container-low rounded-2xl relative text-center max-w-xl mx-auto shadow-inner">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-secondary/5 select-none pointer-events-none">
              <Leaf className="w-60 h-60" />
            </div>

            <div className="relative z-10 space-y-6">
              <div>
                <h4 className="text-secondary text-base sm:text-lg font-extrabold tracking-widest uppercase font-headline-lg">
                  Certificate of Circular Resource Exchange
                </h4>
                <p className="text-[9px] text-on-surface-variant uppercase font-bold tracking-wider mt-1">MOLE Standard ESG Certification v1.0</p>
              </div>

              <div className="text-xs text-on-surface-variant leading-relaxed font-medium">
                This document certifies that the participants of the <strong>MOLE Platform</strong> in Nepal have diverted a verified aggregate of:
                
                <div className="my-5 bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-4 inline-block shadow-sm">
                  <span className="text-2xl font-extrabold block text-secondary font-headline-md">
                    {impactStats.totalDiverted.toLocaleString()} kilograms
                  </span>
                  <span className="text-[9px] text-outline font-bold uppercase tracking-wider">of industrial waste byproducts</span>
                </div>
                
                diverted from the Banchare Danda landfill, resulting in an estimated net carbon emission offset of:
                
                <div className="my-2 text-sm font-bold text-on-surface">
                  {impactStats.totalCo2Saved.toLocaleString()} kg CO₂ Equivalent (CO₂e)
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-outline-variant/35 pt-5 mt-5 text-[9px] text-on-surface-variant">
                <div className="text-left">
                  <span>Authorized by:</span>
                  <span className="block font-bold text-secondary mt-0.5">MOLE Governance Foundation</span>
                  <span>Lalitpur, Nepal</span>
                </div>
                <div className="text-right">
                  <span>Valid through:</span>
                  <span className="block font-bold mt-0.5">Dec 31, 2026</span>
                  <span>System Cert ID: MOLE-2026-N82</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-8 flex-grow">
      
      {/* Dashboard Top header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface font-headline-lg">
            {currentUser.role === 'generator' ? getTranslation(language, 'generatorDashboard') :
             currentUser.role === 'buyer' ? getTranslation(language, 'buyerDashboard') :
             currentUser.role === 'agent' ? getTranslation(language, 'agentDashboard') :
             getTranslation(language, 'adminDashboard')}
          </h1>
          <p className="text-xs text-on-surface-variant font-semibold mt-1">
            {language === 'en' 
              ? `Authorized workspace portal for ${currentUser.full_name} (${currentUser.company})`
              : `${currentUser.full_name} (${currentUser.company}) को लागि प्रमाणित ड्यासबोर्ड पोर्टल`}
          </p>
        </div>

        {currentUser.role === 'generator' && (
          <Link
            href="/listings/new"
            className="bg-primary hover:bg-primary-hover text-on-primary font-bold py-2.5 px-5 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{getTranslation(language, 'navListWaste')}</span>
          </Link>
        )}
      </div>

      {/* Render selected dashboard view based on active user role */}
      {currentUser.role === 'generator' && renderGeneratorDashboard()}
      {currentUser.role === 'buyer' && renderBuyerDashboard()}
      {currentUser.role === 'agent' && renderAgentDashboard()}
      {currentUser.role === 'admin' && renderAdminDashboard()}

    </div>
  );
}
