"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { getTranslation } from '@/lib/translations';
import { Listing } from '@/lib/db';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft, 
  MapPin, 
  Tag, 
  Calendar, 
  Phone, 
  Building2,
  Sparkles,
  RefreshCw,
  CheckCircle,
  Clock,
  ArrowRightLeft,
  Scale,
  Coins,
  ShieldCheck,
  Check
} from 'lucide-react';

// Dynamic load leaflet map
const ListingsMap = dynamic(() => import('@/components/ListingsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-surface-container rounded-2xl flex items-center justify-center border border-outline-variant/30">
      <span className="text-xs text-on-surface-variant font-semibold">Loading map view...</span>
    </div>
  ),
});

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { 
    listings, 
    matches, 
    currentUser, 
    language, 
    createMatchProposal, 
    updateMatchStatus,
    updateListingStatus
  } = useApp();

  const [listing, setListing] = useState<Listing | null>(null);

  // Fetch listing details
  useEffect(() => {
    const item = listings.find(l => l.id === id);
    if (item) {
      setListing(item);
    }
  }, [listings, id]);

  if (!listing) {
    return (
      <div className="max-w-container-max mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-on-surface-variant">Loading details for listing {id}...</p>
      </div>
    );
  }

  // Check if a match exists between this listing and the active buyer
  const activeMatch = matches.find(m => m.listing_id === listing.id && m.buyer_id === currentUser.id);
  
  // Check if any match exists for this listing (useful for seller view)
  const listingMatches = matches.filter(m => m.listing_id === listing.id);

  const isOwner = listing.user_id === currentUser.id;

  const handleProposeMatch = () => {
    createMatchProposal(listing.id, currentUser.id);
    alert(language === 'en' ? "Symbiosis proposed! The seller has been notified." : "औद्योगिक विनिमय प्रस्तावित गरियो! बिक्रेतालाई जानकारी पठाइएको छ।");
  };

  const handleProgressMatch = (matchId: string, newStatus: 'contacted' | 'closed') => {
    updateMatchStatus(matchId, newStatus);
    if (newStatus === 'closed') {
      alert(language === 'en' 
        ? "Exchange completed! The listing has been marked as sold and impact logs have updated." 
        : "विनिमय सम्पन्न भयो! सामग्री बिक्रि भएको संकेत गरिएको छ र प्रभाव रिपोर्ट अपडेट भएको छ।");
    } else {
      alert(language === 'en' ? "Negotiation started! Contact details unlocked." : "वार्ता सुरु भयो! सम्पर्क विवरणहरू उपलब्ध छन्।");
    }
  };

  const isVerified = true;
  const purityPct = listing.material_type.includes('99.9%') || listing.title.includes('Grade A') ? 98 : 88;

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-8 flex-grow">
      
      {/* Header buttons */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-primary transition-all cursor-pointer font-label-md"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>{getTranslation(language, 'backToListings')}</span>
        </button>

        {isOwner && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wide font-label-sm">{getTranslation(language, 'statusLabel')}:</span>
            <select
              value={listing.status}
              onChange={(e) => updateListingStatus(listing.id, e.target.value as any)}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-1.5 text-xs font-bold text-on-surface focus:outline-none cursor-pointer focus:border-primary transition-all"
            >
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        )}
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Details and Map (md:7-cols) */}
        <div className="md:col-span-7 flex flex-col gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 sm:p-8 card-shadow">
            
            {/* Badges */}
            <div className="flex flex-wrap gap-2 items-center mb-4">
              <span className="bg-primary/5 border border-primary/20 text-primary text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase">
                {listing.category_code.replace('_', ' ')}
              </span>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                listing.condition === 'Clean' ? 'bg-secondary/5 border border-secondary/20 text-secondary' :
                listing.condition === 'Contaminated' ? 'bg-red-50 border border-red-100 text-red-700' : 
                'bg-amber-50 border border-amber-100 text-amber-700'
              }`}>
                {listing.condition}
              </span>
              {listing.status === 'sold' && (
                <span className="bg-surface-container-high border border-outline-variant text-on-surface-variant text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase">
                  Sold
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface leading-snug mb-3 font-headline-lg">
              {listing.title}
            </h1>

            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed font-medium">
              {listing.material_type}
            </p>

            {/* Spec grid */}
            <div className="grid grid-cols-2 gap-4 border-t border-b border-outline-variant/20 py-5 mb-6 text-xs font-semibold text-on-surface-variant">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-outline font-bold uppercase tracking-wider font-label-sm">{getTranslation(language, 'quantityLabel')}</span>
                <span className="text-on-surface text-sm font-extrabold flex items-center gap-1">
                  <Scale className="w-4 h-4 text-outline shrink-0" />
                  {listing.quantity_kg.toLocaleString()} kg
                </span>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-outline font-bold uppercase tracking-wider font-label-sm">{getTranslation(language, 'priceLabel')}</span>
                <span className="text-primary text-sm font-extrabold flex items-center gap-1">
                  <Coins className="w-4 h-4 text-primary shrink-0" />
                  Rs. {listing.price_npr_min} - {listing.price_npr_max} / kg
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-outline font-bold uppercase tracking-wider font-label-sm">{getTranslation(language, 'locationLabel')}</span>
                <span className="text-on-surface text-sm font-bold truncate flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-outline shrink-0" />
                  {listing.neighborhood}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-outline font-bold uppercase tracking-wider font-label-sm">{getTranslation(language, 'postedOn')}</span>
                <span className="text-on-surface text-sm font-bold flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-outline shrink-0" />
                  {new Date(listing.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'ne-NP')}
                </span>
              </div>
            </div>

            {/* AI result preview if attached */}
            {listing.ai_result && (
              <div className="bg-surface-container-low rounded-xl border border-outline-variant/35 p-5">
                <div className="flex items-center gap-2 text-xs font-bold text-primary mb-3.5 font-label-md">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  <span>{language === 'en' ? "Verified AI Classification Report" : "प्रमाणित एआई वर्गीकरण रिपोर्ट"}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs font-medium text-on-surface-variant mb-4">
                  <div>
                    <span className="text-outline block text-[9px] uppercase tracking-wide">Purity Rating</span>
                    <strong className="text-on-surface text-sm font-extrabold">{listing.ai_result.estimated_purity_pct}% Match Accuracy</strong>
                  </div>
                  <div>
                    <span className="text-outline block text-[9px] uppercase tracking-wide">AI Recommendation</span>
                    <strong className="text-on-surface text-sm font-extrabold">Auto-Identified Grade A</strong>
                  </div>
                </div>

                <div className="border-t border-outline-variant/20 pt-3.5">
                  <span className="text-[9px] text-outline font-bold uppercase block mb-2 font-label-sm">Recommended Buyer Segments</span>
                  <div className="flex flex-wrap gap-1.5">
                    {listing.ai_result.buyer_industries.map((ind, i) => (
                      <span key={i} className="bg-secondary/5 text-secondary border border-secondary/20 text-[9px] font-bold px-2 py-1 rounded-md">
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Map Preview */}
          <div className="h-80 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm p-1">
            <ListingsMap listings={[listing]} highlightedListingId={listing.id} />
          </div>
        </div>

        {/* RIGHT COLUMN: Contact and Transactions (md:5-cols) */}
        <div className="md:col-span-5 flex flex-col gap-6">
          
          {/* Seller / Generator Profile */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-outline uppercase tracking-wider mb-4 font-label-sm">
              {getTranslation(language, 'sellerInfo')}
            </h3>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                {listing.seller_name.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-on-surface flex items-center gap-1">
                  <span>{listing.seller_name}</span>
                  {isVerified && <Check className="w-4 h-4 text-secondary shrink-0" />}
                </h4>
                <p className="text-xs text-on-surface-variant flex items-center gap-1 font-medium mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-outline shrink-0" />
                  {listing.seller_company}
                </p>
              </div>
            </div>

            {/* Display contact triggers */}
            {activeMatch || isOwner || currentUser.role === 'admin' ? (
              <div className="space-y-3">
                <a
                  href={`tel:${listing.seller_phone}`}
                  className="w-full bg-surface hover:bg-surface-container-low border border-outline-variant rounded-xl text-on-surface font-bold py-3 px-4 text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span>Call: {listing.seller_phone}</span>
                </a>
                
                <a
                  href={`https://wa.me/${listing.seller_phone.replace(/\s+/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-primary hover:bg-primary-hover text-on-primary font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
                >
                  <span>Chat on WhatsApp / Viber</span>
                </a>
              </div>
            ) : (
              <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 text-center">
                <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">
                  {language === 'en'
                    ? "Contact credentials are hidden. Click 'Initiate Match Proposal' below to pair records and release coordinates."
                    : "सम्पर्क नम्बरहरू सुरक्षित रूपमा लुकेका छन्। बिक्रेतासँग सीधा विनिमय वार्ता सुरु गर्न तलको बटन थिच्नुहोस्।"}
                </p>
              </div>
            )}
          </div>

          {/* Symbiosis Match Dashboard box */}
          {currentUser.role === 'buyer' && !isOwner && (
            <div className="bg-[#111e16] text-white border border-emerald-950/80 rounded-2xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-1.5 font-label-md">
                <ArrowRightLeft className="w-4 h-4" />
                <span>{getTranslation(language, 'matchingStatus')}</span>
              </h3>

              {!activeMatch ? (
                // State 0: No match yet
                <div className="space-y-4">
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {language === 'en'
                      ? "Do you recycle or consume this byproduct in your production? Propose a circular transaction to arrange transport."
                      : "के यो उप-उत्पादन तपाईंको कारखानामा कच्चा पदार्थको रूपमा प्रयोग हुन्छ? खरिद र ढुवानीको लागि प्रस्ताव दर्ता गर्नुहोस्।"}
                  </p>
                  
                  <button
                    disabled={listing.status === 'sold'}
                    onClick={handleProposeMatch}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-800 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-md"
                  >
                    {listing.status === 'sold' ? "Resource Already Sold" : getTranslation(language, 'initiateMatch')}
                  </button>
                </div>
              ) : activeMatch.status === 'pending' ? (
                // State 1: Proposed match, waiting to trigger negotiation contact
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Clock className="w-4 h-4 animate-pulse" />
                    <span>{getTranslation(language, 'matchPending')}</span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    {language === 'en'
                      ? "Proposal is registered. Unlock the generator's verified phone number by launching direct negotiation."
                      : "विनिमय प्रस्ताव दर्ता भएको छ। उत्पादकको सम्पर्क नम्बर लिन र वार्ता अघि बढाउन तल थिच्नुहोस्।"}
                  </p>

                  <button
                    onClick={() => handleProgressMatch(activeMatch.id, 'contacted')}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-[#0F172A] font-bold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-md"
                  >
                    {language === 'en' ? "Unlock Telephone & Chat" : "सम्पर्क नम्बर अनलक गर्नुहोस्"}
                  </button>
                </div>
              ) : activeMatch.status === 'contacted' ? (
                // State 2: Contacted, negotiation ongoing. Ready to close
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
                    <RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
                    <span>{getTranslation(language, 'matchContacted')}</span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    {language === 'en'
                      ? "Negotiations are open. Once you have fetched the materials and settled the invoice, log the swap as completed."
                      : "वार्ता सुरु भएको छ। ढुवानी र भुक्तानी सम्पन्न भएपछि विनिमय पुष्टि गर्न र ESG रेकर्ड राख्न तल थिच्नुहोस्।"}
                  </p>

                  <button
                    onClick={() => handleProgressMatch(activeMatch.id, 'closed')}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-md"
                  >
                    {language === 'en' ? "Complete Transaction" : "सम्पन्न विनिमय पुष्टि गर्नुहोस्"}
                  </button>
                </div>
              ) : (
                // State 3: Closed
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>{getTranslation(language, 'matchClosed')}</span>
                  </div>
                  
                  <p className="text-xs text-gray-400 leading-normal">
                    {language === 'en'
                      ? "Deal recorded successfully. Purity stats, CO2 metrics, and landfill diversion points are credited to your profile."
                      : "विनिमय दर्ता भयो। कार्बन न्यूनीकरण र वातावरणीय सूचकांकहरू तपाईंको खातामा जोडिएका छन्।"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Seller view matched proposals list */}
          {isOwner && (
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-outline uppercase tracking-wider mb-4 font-label-sm">
                {language === 'en' ? "Interested Bidders & Buyers" : "सामग्री खरिद गर्न इच्छुक उद्योगहरू"}
              </h3>

              {listingMatches.length === 0 ? (
                <p className="text-xs text-on-surface-variant text-center py-4">
                  {language === 'en' ? "No swap proposals yet. Active buyers will appear here." : "अहिलेसम्म कोही पनि इच्छुक खरिदकर्ता देखा परेका छैनन्।"}
                </p>
              ) : (
                <div className="space-y-3.5">
                  {listingMatches.map((m) => (
                    <div key={m.id} className="border border-outline-variant/30 p-4 rounded-xl text-xs flex justify-between items-center bg-surface">
                      <div>
                        <span className="font-bold text-on-surface block text-sm">Patan Recycling Co.</span>
                        <span className="text-[10px] text-outline uppercase font-semibold mt-0.5 inline-block capitalize">{m.status}</span>
                      </div>
                      
                      {m.status !== 'closed' && (
                        <button
                          onClick={() => handleProgressMatch(m.id, 'closed')}
                          className="bg-secondary/5 text-secondary border border-secondary/20 hover:bg-secondary/15 px-3 py-1.5 rounded-xl font-bold transition-all text-[10px] cursor-pointer"
                        >
                          Mark as Traded
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
