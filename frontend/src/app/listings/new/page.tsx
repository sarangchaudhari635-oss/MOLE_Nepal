"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { getTranslation } from '@/lib/translations';
import { getSimulatedAIResult } from '@/lib/ai-fallbacks';
import { db } from '@/lib/db';
import { 
  Upload, 
  Sparkles, 
  MapPin, 
  Coins, 
  Tag, 
  Trash2, 
  ArrowLeft,
  CheckCircle,
  FileText,
  Scale,
  ShieldAlert
} from 'lucide-react';

// Neighborhood coordinate map for auto-plotting
const NEIGHBORHOOD_COORDS: Record<string, { lat: number, lng: number }> = {
  "Bhaktapur / Thimi": { lat: 27.6766, lng: 85.3999 },
  "Patan Industrial Estate": { lat: 27.6631, lng: 85.3216 },
  "Balaju Industrial District": { lat: 27.7337, lng: 85.2977 },
  "Koteshwor (road site)": { lat: 27.6780, lng: 85.3489 },
  "Bhaktapur Brick Kilns": { lat: 27.6712, lng: 85.4294 },
  "Thamel (hotels/shops)": { lat: 27.7150, lng: 85.3120 },
  "Kalimati Market": { lat: 27.6983, lng: 85.3015 },
  "Hetauda (listed remotely)": { lat: 27.4242, lng: 85.0347 }
};

export default function NewListingPage() {
  const { addListing, language, currentUser } = useApp();
  const router = useRouter();
  
  // Form Fields
  const [title, setTitle] = useState('');
  const [categoryCode, setCategoryCode] = useState('wood_biomass');
  const [materialType, setMaterialType] = useState('');
  const [quantityKg, setQuantityKg] = useState<number | ''>('');
  const [condition, setCondition] = useState<'Clean' | 'Contaminated' | 'Mixed'>('Clean');
  const [priceMin, setPriceMin] = useState<number | ''>('');
  const [priceMax, setPriceMax] = useState<number | ''>('');
  const [neighborhood, setNeighborhood] = useState('Bhaktapur / Thimi');
  
  // AI prefills & notifications state
  const [aiUsed, setAiUsed] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Check for prefilled AI session data (if redirected from Landing Page sandbox)
  useEffect(() => {
    const prefillData = sessionStorage.getItem('mole_ai_prefill');
    if (prefillData) {
      try {
        const parsed = JSON.parse(prefillData);
        setTitle(parsed.listing_title_suggestion || '');
        setCategoryCode(parsed.category_code || 'wood_biomass');
        setMaterialType(parsed.material_type || '');
        setCondition(parsed.condition || 'Clean');
        setPriceMin(parsed.price_range_npr?.min || '');
        setPriceMax(parsed.price_range_npr?.max || '');
        setAiUsed(true);

        if (parsed.customImage) {
          setPreviewImage(parsed.customImage);
        } else if (parsed.demoKey) {
          const demoUrls: Record<string, string> = {
            wood_dust: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=400',
            concrete_rubble: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400',
            plastic_hdpe: 'https://images.unsplash.com/photo-1526613098278-a7f1a7d7b2e5?auto=format&fit=crop&q=80&w=400'
          };
          setPreviewImage(demoUrls[parsed.demoKey] || null);
        }

        sessionStorage.removeItem('mole_ai_prefill');
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Demo image scan logic for local scan simulation
  const handleLocalScan = (itemKey: string, imageUrl?: string) => {
    setIsScanning(true);
    setAiUsed(false);
    if (imageUrl) {
      setPreviewImage(imageUrl);
    } else {
      const demoUrls: Record<string, string> = {
        wood_dust: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=400',
        concrete_rubble: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400',
        plastic_hdpe: 'https://images.unsplash.com/photo-1526613098278-a7f1a7d7b2e5?auto=format&fit=crop&q=80&w=400'
      };
      setPreviewImage(demoUrls[itemKey] || null);
    }

    setTimeout(() => {
      const result = getSimulatedAIResult(itemKey);
      setTitle(result.listing_title_suggestion);
      setCategoryCode(result.category_code);
      setMaterialType(result.material_type);
      setCondition(result.condition);
      setPriceMin(result.price_range_npr.min);
      setPriceMax(result.price_range_npr.max);
      setIsScanning(false);
      setAiUsed(true);
    }, 1500); // 1.5s simulation
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !materialType || !quantityKg || !priceMin || !priceMax) {
      alert("Please fill all required fields.");
      return;
    }

    const coords = NEIGHBORHOOD_COORDS[neighborhood] || { lat: 27.7172, lng: 85.3240 };

    addListing({
      user_id: currentUser.id,
      title,
      category_code: categoryCode,
      material_type: materialType,
      quantity_kg: Number(quantityKg),
      condition,
      price_npr_min: Number(priceMin),
      price_npr_max: Number(priceMax),
      lat: coords.lat,
      lng: coords.lng,
      neighborhood,
      photo_url: previewImage || undefined
    });

    alert(getTranslation(language, 'successListing'));
    router.push('/listings');
  };

  const handleClearForm = () => {
    setTitle('');
    setCategoryCode('wood_biomass');
    setMaterialType('');
    setQuantityKg('');
    setCondition('Clean');
    setPriceMin('');
    setPriceMax('');
    setPreviewImage(null);
    setAiUsed(false);
  };

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-8 flex-grow">
      
      {/* Back navigation */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 shrink-0" />
        <span>{language === 'en' ? "Back to Marketplace" : "बजारमा फिर्ता"}</span>
      </button>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface font-headline-lg">
          {getTranslation(language, 'createListingTitle')}
        </h1>
        <p className="text-sm text-on-surface-variant mt-1.5 font-medium font-body-md">
          {getTranslation(language, 'createListingSubtitle')}
        </p>
      </div>

      {/* AI alert banner */}
      {aiUsed && (
        <div className="mb-6 bg-emerald-500/10 border border-secondary/20 text-secondary px-4.5 py-3.5 rounded-xl flex items-center gap-3 shadow-sm">
          <CheckCircle className="w-5 h-5 text-secondary shrink-0" />
          <div className="text-xs font-medium">
            <span className="font-bold">{language === 'en' ? "AI Extraction Applied! " : "एआई विन्यास लागू भयो! "}</span>
            {language === 'en' 
              ? "Listing fields (Title, Category, Sub-type, Condition, Pricing range) have been automatically filled using our visual classifier."
              : "शीर्षक, वर्ग, सामग्रीको प्रकार, र मूल्य दायरा एआई स्क्यानरद्वारा स्वचालित रूपमा भरिएको छ।"}
          </div>
        </div>
      )}

      {/* Split visual forms layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Visual classifier (5-cols) */}
        <div className="md:col-span-5 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 card-shadow flex flex-col gap-6">
          <div>
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3 font-label-md">
              {language === 'en' ? "Material Photo Scan" : "फोहोरको तस्विर विश्लेषण"}
            </h3>
            
            {/* Visual Scan window */}
            <div className="relative rounded-xl overflow-hidden aspect-square bg-[#0f1912] border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center p-4">
              
              {isScanning && (
                <div className="absolute inset-0 bg-black/60 z-20 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <span className="text-xs font-bold text-emerald-300">
                    {language === 'en' ? "AI Analyzing Material..." : "एआई सामग्री विश्लेषण..."}
                  </span>
                  <div className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_10px_#10b981] animate-scan"></div>
                </div>
              )}

              {previewImage ? (
                <>
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(null);
                      setAiUsed(false);
                    }}
                    className="absolute bottom-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-xl transition-all cursor-pointer shadow-md"
                    title={language === 'en' ? "Remove Image" : "हटाउनुहोस्"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="text-center relative p-6">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          handleLocalScan('wood_dust', reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-outline mx-auto mb-2" />
                  <span className="text-xs font-bold text-gray-300 block">
                    {language === 'en' ? "Upload batch photo" : "कारखाना सामग्रीको फोटो छान्नुहोस्"}
                  </span>
                  <span className="text-[10px] text-gray-550 block mt-1">
                    Triggers simulated Gemini classification
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick-Select Demo Scan options */}
          <div className="border-t border-outline-variant/20 pt-4">
            <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-3 font-label-sm">
              {language === 'en' ? "Scan Demo Materials (Instant AI Testing)" : "परीक्षणको लागि डेमो सामग्रीहरू"}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleLocalScan('wood_dust')}
                className="bg-surface hover:bg-primary/5 border border-outline-variant/30 hover:border-primary/30 p-2.5 rounded-xl text-center transition-all cursor-pointer text-[10px] font-bold text-on-surface"
              >
                {language === 'en' ? "Wood Shavings" : "काठको धुलो"}
              </button>
              <button
                type="button"
                onClick={() => handleLocalScan('concrete_rubble')}
                className="bg-surface hover:bg-primary/5 border border-outline-variant/30 hover:border-primary/30 p-2.5 rounded-xl text-center transition-all cursor-pointer text-[10px] font-bold text-on-surface"
              >
                {language === 'en' ? "Concrete" : "कंक्रीट"}
              </button>
              <button
                type="button"
                onClick={() => handleLocalScan('plastic_hdpe')}
                className="bg-surface hover:bg-primary/5 border border-outline-variant/30 hover:border-primary/30 p-2.5 rounded-xl text-center transition-all cursor-pointer text-[10px] font-bold text-on-surface"
              >
                {language === 'en' ? "HDPE Plastic" : "HDPE प्लास्टिक"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Listing Details Form (7-cols) */}
        <form onSubmit={handleSubmit} className="md:col-span-7 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 sm:p-8 card-shadow flex flex-col gap-5">
          <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3.5">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-label-md">
              {language === 'en' ? "Asset Specifications Form" : "सामग्री विवरण फारम"}
            </span>
            {aiUsed && (
              <span className="text-[9px] bg-secondary-container text-on-secondary-container border border-secondary/20 px-2 py-0.5 rounded font-bold flex items-center gap-0.5">
                <Sparkles className="w-3 h-3 animate-pulse" />
                <span>AI Prefilled</span>
              </span>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1.5 font-label-md">
              {getTranslation(language, 'listingFormTitle')} <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={language === 'en' ? "e.g. Premium Dry Wood Shavings - 5 Ton Batch" : "उदा: ५ टन सुख्खा काठको बुरदा"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>

          {/* Category & Material Type Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1.5 font-label-md">
                {getTranslation(language, 'listingFormCategory')} <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={categoryCode}
                  onChange={(e) => setCategoryCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer capitalize font-medium text-on-surface"
                >
                  {Object.entries(db.getCategoryBuyerMapping()).map(([code]) => (
                    <option key={code} value={code}>
                      {code.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Material Specific details */}
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1.5 font-label-md">
                {language === 'en' ? "Material Purity / Subtype" : "सामग्रीको स्तर / प्रकार"} <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={language === 'en' ? "e.g. Fine Sawdust, Grade A+" : "उदा: फाइन बुरदा, ग्रेड ए+"}
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          {/* Quantity & Condition Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1.5 font-label-md">
                {getTranslation(language, 'listingFormQty')} (kg) <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Scale className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 1500"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(e.target.value ? Number(e.target.value) : '')}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1.5 font-label-md">
                {getTranslation(language, 'listingFormCondition')} <span className="text-error">*</span>
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer font-medium text-on-surface"
              >
                <option value="Clean">Clean (शून्य मिसावट)</option>
                <option value="Contaminated">Contaminated (मिसावट भएको)</option>
                <option value="Mixed">Mixed (मिश्रित)</option>
              </select>
            </div>
          </div>

          {/* Pricing range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1.5 font-label-md">
                {getTranslation(language, 'listingFormPriceMin')} (₨ / kg) <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Coins className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 5"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value ? Number(e.target.value) : '')}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1.5 font-label-md">
                {getTranslation(language, 'listingFormPriceMax')} (₨ / kg) <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Coins className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 10"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value ? Number(e.target.value) : '')}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Geolocation neighborhood */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1.5 font-label-md">
              {getTranslation(language, 'listingFormLocation')} <span className="text-error">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer font-medium text-on-surface"
              >
                {Object.keys(NEIGHBORHOOD_COORDS).map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-[10px] text-on-surface-variant mt-1.5 block leading-normal">
              {language === 'en' 
                ? "Selecting a neighborhood automatically links this listing with coordinates on the Kathmandu Valley Leaflet map." 
                : "स्थान रोज्नासाथ यसका जिओ-कोअर्डिनेटहरू काठमाडौं उपत्यका नक्सामा स्वचालित रूपमा आबद्ध हुनेछन्।"}
            </span>
          </div>

          {/* Action Row */}
          <div className="flex justify-end gap-3 border-t border-outline-variant/20 pt-5 mt-3">
            <button
              type="button"
              onClick={handleClearForm}
              className="px-5 py-2.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant/50 rounded-xl text-xs font-bold text-on-surface-variant transition-all cursor-pointer"
            >
              {language === 'en' ? "Clear Form" : "फारम खाली गर्नुहोस्"}
            </button>
            
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-on-primary rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow"
            >
              <FileText className="w-4.5 h-4.5" />
              <span>{getTranslation(language, 'listingFormSubmit')}</span>
            </button>
          </div>
        </form>

      </div>

    </div>
  );
}
