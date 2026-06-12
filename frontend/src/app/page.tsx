"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { getTranslation } from '@/lib/translations';
import { getSimulatedAIResult, AIClassificationResult } from '@/lib/ai-fallbacks';
import { 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  Upload, 
  HelpCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Building2,
  GitMerge,
  Leaf,
  Coins,
  Camera,
  Network,
  CheckCircle,
  Archive,
  ArrowLeft,
  ArrowRightCircle,
  Award
} from 'lucide-react';

export default function Home() {
  const { language, impactStats } = useApp();
  const router = useRouter();
  
  // AI Sandbox State
  const [selectedDemoItem, setSelectedDemoItem] = useState<string | null>(null);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<AIClassificationResult | null>(null);

  // Trigger simulated AI classification
  const handleScan = (itemKey: string, imageUrl?: string) => {
    setIsScanning(true);
    setScanResult(null);
    setSelectedDemoItem(itemKey);
    if (imageUrl) {
      setCustomImage(imageUrl);
    } else {
      setCustomImage(null);
    }

    setTimeout(() => {
      const result = getSimulatedAIResult(itemKey);
      setScanResult(result);
      setIsScanning(false);
    }, 1500); // 1.5s scanning simulation
  };

  const handleUseAIResult = () => {
    if (!scanResult) return;
    // Save scanner result in sessionStorage to auto-populate form
    sessionStorage.setItem('mole_ai_prefill', JSON.stringify({
      ...scanResult,
      demoKey: selectedDemoItem,
      customImage: customImage
    }));
    router.push('/listings/new');
  };

  // Demo image lists
  const demoImages = [
    {
      key: 'wood_dust',
      name_en: 'Wood Shavings / Sawdust',
      name_ne: 'काठको धुलो / टुक्रा',
      url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=400',
    },
    {
      key: 'concrete_rubble',
      name_en: 'Concrete Rubble / Crushed Stone',
      name_ne: 'कंक्रीट भग्नावशेष',
      url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400',
    },
    {
      key: 'plastic_hdpe',
      name_en: 'HDPE Plastic Offcuts',
      name_ne: 'प्लास्टिक स्क्र्याप (HDPE)',
      url: 'https://images.unsplash.com/photo-1526613098278-a7f1a7d7b2e5?auto=format&fit=crop&q=80&w=400',
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-surface py-20 px-4 md:px-margin-desktop border-b border-outline-variant/50">
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#004ac6 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
        
        <div className="max-w-container-max mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Hero text (7 columns on desktop) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-secondary-container text-on-secondary-container rounded-full font-semibold text-xs border border-secondary/20">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              <span>
                {language === 'en' 
                  ? "Verified Industrial Assets Across Nepal" 
                  : "नेपालभरिका प्रमाणित औद्योगिक सामग्रीहरू"}
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-on-background leading-tight font-headline-lg">
              {language === 'en' 
                ? "Buy and Sell Industrial Resources Across Nepal" 
                : "नेपालभरि औद्योगिक सामग्री खरिद-बिक्री गर्नुहोस्"}
            </h1>
            
            <p className="text-base sm:text-lg text-on-surface-variant max-w-xl font-medium leading-relaxed font-body-lg">
              {language === 'en'
                ? "AI-powered circular marketplace connecting manufacturers, recyclers, construction sites, and industrial buyers for frictionless resource exchange."
                : "नेपालका उत्पादक, रिसाइक्लर र निर्माण व्यवसायीहरूलाई जोड्ने एआई-सञ्चालित सर्कुलर बजार।"}
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/listings/new"
                className="bg-primary text-on-primary hover:bg-primary-hover px-8 py-4 rounded-lg font-bold text-sm transition-all hover:translate-y-[-2px] shadow-md cursor-pointer flex items-center gap-2"
              >
                <span>{getTranslation(language, 'heroCTA1')}</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </Link>
              
              <Link
                href="/listings"
                className="border border-primary text-primary hover:bg-primary/5 px-8 py-4 rounded-lg font-semibold text-sm transition-all cursor-pointer"
              >
                <span>{getTranslation(language, 'heroCTA2')}</span>
              </Link>
            </div>
          </div>
          
          {/* Animated Resource Flow Visual (5 columns on desktop) */}
          <div className="lg:col-span-5 relative group mt-6 lg:mt-0">
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 to-secondary/10 blur-3xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            
            <div className="relative glass-card rounded-2xl overflow-hidden card-shadow p-6 border-outline-variant/30 bg-white/70">
              <div className="flex flex-col gap-4">
                
                {/* Visual Row 1 */}
                <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white/90 border border-outline-variant/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center text-primary">
                      <Archive className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-on-surface">Wood Residue</p>
                      <p className="text-[10px] text-on-surface-variant">Lumber Mills, Pokhara</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <ArrowRight className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-[8px] text-primary font-extrabold uppercase tracking-wider">AI Match</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-right">
                    <div>
                      <p className="font-bold text-xs text-on-surface">Biomass Fuel</p>
                      <p className="text-[10px] text-secondary">Energy Plant, Hetauda</p>
                    </div>
                    <div className="w-10 h-10 bg-secondary-container/20 rounded-lg flex items-center justify-center text-secondary">
                      <Zap className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Visual Row 2 */}
                <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white/90 border border-outline-variant/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center text-primary">
                      <Archive className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-on-surface">Plastic Offcuts</p>
                      <p className="text-[10px] text-on-surface-variant">Packaging Lab, Butwal</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <ArrowRight className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-[8px] text-primary font-extrabold uppercase tracking-wider">AI Match</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-right">
                    <div>
                      <p className="font-bold text-xs text-on-surface">Eco-Bricks</p>
                      <p className="text-[10px] text-secondary">Construction Co, KTM</p>
                    </div>
                    <div className="w-10 h-10 bg-secondary-container/20 rounded-lg flex items-center justify-center text-secondary">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Visual Asset Counter Overlay */}
                <div className="bg-surface-container-low px-4 py-2.5 rounded-xl flex items-center justify-center gap-2.5 border border-outline-variant/35 mt-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-secondary animate-ping"></span>
                  <span className="text-[10px] font-bold text-on-surface-variant">
                    {language === 'en' ? "Live AI Engine active across Nepal's hubs" : "नेपालभर सक्रिय एआई म्याचिङ प्रणाली"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* 2. IMPACT DASHBOARD OVERVIEW */}
      <section className="py-16 px-4 md:px-margin-desktop bg-surface-container-lowest border-b border-outline-variant/50">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface font-headline-lg mb-3">
              {language === 'en' ? "Marketplace Vitality & Impact" : "बजारको प्रभाव र गतिविधि"}
            </h2>
            <p className="text-sm text-on-surface-variant max-w-xl mx-auto font-medium font-body-md">
              {language === 'en' 
                ? "Driving industrial circularity with measurable economic and environmental data in Nepal." 
                : "नेपालको औद्योगिक वातावरणमा आर्थिक र वातावरणीय फाइदा पुर्‍याउँदै।"}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Active Listings */}
            <div className="p-5 rounded-xl bg-surface border border-outline-variant/30 flex flex-col items-center text-center card-shadow group hover:border-primary/20 transition-all">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                <Archive className="w-6 h-6" />
              </div>
              <p className="text-2xl font-extrabold text-on-surface font-headline-md">{impactStats.activeListingsCount}</p>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">
                {language === 'en' ? "Active Listings" : "सक्रिय सूचीहरू"}
              </p>
            </div>

            {/* Connected */}
            <div className="p-5 rounded-xl bg-surface border border-outline-variant/30 flex flex-col items-center text-center card-shadow group hover:border-primary/20 transition-all">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                <Building2 className="w-6 h-6" />
              </div>
              <p className="text-2xl font-extrabold text-on-surface font-headline-md">{impactStats.totalUsersCount}</p>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">
                {language === 'en' ? "Businesses Connected" : "सम्बद्ध उद्योगहरू"}
              </p>
            </div>

            {/* Resources traded */}
            <div className="p-5 rounded-xl bg-surface border border-outline-variant/30 flex flex-col items-center text-center card-shadow group hover:border-primary/20 transition-all">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                <GitMerge className="w-6 h-6" />
              </div>
              <p className="text-2xl font-extrabold text-on-surface font-headline-md">{(impactStats.totalDiverted / 1000).toFixed(1)}k kg</p>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">
                {language === 'en' ? "Resources Traded" : "विनिमय सामग्री"}
              </p>
            </div>

            {/* CO2 offset */}
            <div className="p-5 rounded-xl bg-surface border border-outline-variant/30 flex flex-col items-center text-center card-shadow border-l-4 border-l-secondary group hover:border-secondary/20 transition-all">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary mb-3">
                <Leaf className="w-6 h-6" />
              </div>
              <p className="text-2xl font-extrabold text-secondary font-headline-md">{(impactStats.totalCo2Saved / 1000).toFixed(1)}t</p>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">
                {language === 'en' ? "CO2 Reduced" : "कार्बन न्यूनीकरण"}
              </p>
            </div>

            {/* Revenue Circulated */}
            <div className="p-5 rounded-xl bg-surface border border-outline-variant/30 flex flex-col items-center text-center card-shadow border-l-4 border-l-secondary col-span-2 lg:col-span-1 group hover:border-secondary/20 transition-all">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary mb-3">
                <Coins className="w-6 h-6" />
              </div>
              <p className="text-2xl font-extrabold text-secondary font-headline-md">Rs. {(impactStats.totalRevenue / 100000).toFixed(1)}L</p>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">
                {language === 'en' ? "Revenue Circulated" : "सञ्चालित रकम"}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="py-20 px-4 md:px-margin-desktop bg-surface-container-low border-b border-outline-variant/50">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface font-headline-lg mb-3">
              {language === 'en' ? "Streamlining Asset Recovery" : "स्रोत व्यवस्थापन कार्यप्रवाह"}
            </h2>
            <p className="text-sm text-on-surface-variant font-medium font-body-md">
              {language === 'en'
                ? "Our intelligent workflow removes technical barriers, turning complex industrial materials into liquid assets within minutes."
                : "हाम्रो सरल र बौद्धिक प्रणालीले उद्योगको अवशेष सामग्रीहरूलाई छिट्टै बिक्री गराउन मद्दत गर्छ।"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="group relative bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 card-shadow hover:border-primary/30 transition-all">
              <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all mb-5">
                <Camera className="w-5 h-5" />
              </div>
              <div className="absolute top-6 right-6 font-bold text-3xl text-outline-variant/20 leading-none">01</div>
              <h3 className="font-bold text-base text-on-surface mb-2 font-headline-md">{language === 'en' ? "Upload Photo" : "फोटो खिच्नुहोस्"}</h3>
              <p className="text-xs text-on-surface-variant font-body-sm leading-relaxed">
                {language === 'en' 
                  ? "Capture and upload photos or documents of your industrial secondary materials directly."
                  : "आफ्नो कारखानाबाट निस्कने बाँकी वा खेर गएका सामग्रीहरूको फोटो अपलोड गर्नुहोस्।"}
              </p>
            </div>

            {/* Step 2 */}
            <div className="group relative bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 card-shadow hover:border-primary/30 transition-all">
              <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all mb-5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="absolute top-6 right-6 font-bold text-3xl text-outline-variant/20 leading-none">02</div>
              <h3 className="font-bold text-base text-on-surface mb-2 font-headline-md">{language === 'en' ? "AI Analysis" : "एआई द्वारा विश्लेषण"}</h3>
              <p className="text-xs text-on-surface-variant font-body-sm leading-relaxed">
                {language === 'en'
                  ? "Gemini classification extracts purity percentage, volume, chemistry, and price range."
                  : "हाम्रो एआई स्क्यानरले सामग्रीको शुद्धता, परिमाण, र मूल्य स्वचालित रूपमा विश्लेषण गर्छ।"}
              </p>
            </div>

            {/* Step 3 */}
            <div className="group relative bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 card-shadow hover:border-primary/30 transition-all">
              <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all mb-5">
                <Network className="w-5 h-5" />
              </div>
              <div className="absolute top-6 right-6 font-bold text-3xl text-outline-variant/20 leading-none">03</div>
              <h3 className="font-bold text-base text-on-surface mb-2 font-headline-md">{language === 'en' ? "Smart Matching" : "स्मार्ट म्याचिङ"}</h3>
              <p className="text-xs text-on-surface-variant font-body-sm leading-relaxed">
                {language === 'en'
                  ? "Instantly notify verified factories and buyers located within optimal logistics range."
                  : "नजिकै रहेका र ती सामग्री खरिद गर्न चाहने प्रमाणित उद्योगहरूलाई तुरुन्तै जानकारी पठाइन्छ।"}
              </p>
            </div>

            {/* Step 4 */}
            <div className="group relative bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 card-shadow hover:border-primary/30 transition-all">
              <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all mb-5">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="absolute top-6 right-6 font-bold text-3xl text-outline-variant/20 leading-none">04</div>
              <h3 className="font-bold text-base text-on-surface mb-2 font-headline-md">{language === 'en' ? "Trade Circularly" : "विनिमय सम्पन्न"}</h3>
              <p className="text-xs text-on-surface-variant font-body-sm leading-relaxed">
                {language === 'en'
                  ? "Coordinate logistics with our local agents, settle payments, and track compliance metrics."
                  : "स्थानीय ढुवानी एजेन्टहरूसँग सहकार्य गरी विनिमय कार्य सम्पन्न र प्रमाणित गरिन्छ।"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AI CLASSIFIER SANDBOX SECTION (INTELLIGENT CLASSIFICATION) */}
      <section className="py-20 px-4 md:px-margin-desktop bg-surface-container-lowest">
        <div className="max-w-container-max mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-10">
            <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
              <span className="text-secondary font-bold text-xs uppercase tracking-wider font-label-md">
                {language === 'en' ? "INTELLIGENT CLASSIFICATION" : "एआई सामग्री पहिचान प्रणाली"}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-background leading-tight font-headline-lg">
                {language === 'en' ? "Turn Industrial Data into Market Value" : "औद्योगिक अवशेषलाई बजारको मूल्यमा बदल्नुहोस्"}
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed font-body-md font-medium">
                {language === 'en'
                  ? "Upload material specifications, batch photos, or lab reports. Our AI engine identifies the grade, estimates valuation, and matches you with buyers in seconds."
                  : "सामग्रीका फोटो वा विवरणहरू अपलोड गर्नुहोस्। हाम्रो एआई प्रणालीले शुद्धता पहिचान गरी बजार मूल्यको अनुमान र सम्भावित खरिदकर्ताहरू सिफारिस गर्छ।"}
              </p>
              
              <div className="flex items-center gap-3 p-3 bg-secondary-container/15 border border-secondary/25 rounded-xl mt-2">
                <Award className="w-5 h-5 text-secondary shrink-0" />
                <p className="font-bold text-xs text-on-secondary-container leading-tight">
                  {language === 'en' 
                    ? "98.4% Average Accuracy in polymer, wood, and concrete analysis" 
                    : "काठ, प्लास्टिक र कंक्रीट विश्लेषणमा ९८.४% सम्मको सटीकता"}
                </p>
              </div>
            </div>

            {/* Sandbox Widget */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch relative">
              
              {/* Left Selector & Upload */}
              <div className="bg-surface border border-outline-variant/35 p-5 rounded-2xl flex flex-col justify-between card-shadow">
                <div>
                  <h3 className="text-xs font-bold text-on-surface mb-3 flex items-center gap-1.5 font-label-md">
                    <Upload className="w-4 h-4 text-primary" />
                    <span>{language === 'en' ? "Select Scan Target" : "स्क्यान गर्न रोज्नुहोस्"}</span>
                  </h3>
                  
                  {/* Quick Select Thumbnails */}
                  <div className="grid grid-cols-3 gap-2.5 mb-4">
                    {demoImages.map((img) => (
                      <button
                        key={img.key}
                        onClick={() => handleScan(img.key)}
                        className={`group relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                          selectedDemoItem === img.key && !customImage
                            ? 'border-primary scale-[1.03] shadow-md'
                            : 'border-outline-variant/30 hover:border-outline'
                        }`}
                      >
                        <img 
                          src={img.url} 
                          alt={img.name_en} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-1.5 text-left">
                          <p className="text-[9px] text-white font-bold leading-tight">
                            {language === 'en' ? img.name_en.split(' / ')[0] : img.name_ne.split(' / ')[0]}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Upload simulated area */}
                  <div className="border-2 border-dashed border-outline-variant/40 rounded-xl p-4 text-center hover:bg-surface-container-low transition-colors relative cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            handleScan('wood_dust', reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-6 h-6 text-outline mx-auto mb-1" />
                    <p className="text-[10px] font-bold text-on-surface-variant">
                      {language === 'en' ? "Upload custom file" : "नयाँ फाइल छान्नुहोस्"}
                    </p>
                    <p className="text-[8px] text-outline mt-0.5">JPG, PNG up to 5MB</p>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    disabled={!selectedDemoItem || isScanning}
                    onClick={() => handleScan(selectedDemoItem || 'wood_dust', customImage || undefined)}
                    className="w-full bg-primary hover:bg-primary-hover disabled:bg-surface-container-high disabled:text-outline text-on-primary font-bold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>{getTranslation(language, 'aiIdentifyBtn')}</span>
                  </button>
                </div>
              </div>

              {/* Right Output View */}
              <div className="bg-[#111e16] text-white p-5 rounded-2xl flex flex-col justify-between shadow-inner relative overflow-hidden border border-emerald-950/80">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

                {isScanning && (
                  <div className="flex-grow flex flex-col items-center justify-center py-10 relative z-15">
                    {selectedDemoItem && (
                      <div className="w-32 h-32 rounded-lg overflow-hidden border border-emerald-500/35 relative mb-4">
                        <img 
                          src={customImage || demoImages.find(i => i.key === selectedDemoItem)?.url} 
                          alt="Analyzing" 
                          className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_10px_#10b981] animate-scan"></div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[10px] font-bold text-emerald-300">
                        {getTranslation(language, 'aiAnalyzing')}
                      </span>
                    </div>
                  </div>
                )}

                {!isScanning && !scanResult && (
                  <div className="flex-grow flex flex-col items-center justify-center text-center py-10 px-2 relative z-10">
                    <HelpCircle className="w-10 h-10 text-secondary/30 mb-2" />
                    <h4 className="text-xs font-bold text-gray-300">
                      {language === 'en' ? "Waiting for Scan Input" : "स्क्यान गर्न बाँकी छ"}
                    </h4>
                    <p className="text-[10px] text-gray-500 mt-1 max-w-[200px]">
                      {language === 'en' 
                        ? "Select a demo material on the left to test the intelligence engine."
                        : "इन्जिन परीक्षणको लागि बायाँबाट एउटा सामग्री रोज्नुहोस्।"}
                    </p>
                  </div>
                )}

                {!isScanning && scanResult && (
                  <div className="flex-grow flex flex-col justify-between h-full relative z-10">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start pb-2.5 border-b border-emerald-900/40">
                        <div>
                          <span className="text-[8px] text-emerald-400 font-extrabold uppercase tracking-widest block mb-0.5">
                            Gemini 1.5-Flash
                          </span>
                          <h4 className="text-sm font-bold text-white leading-tight font-headline-md">
                            {scanResult.listing_title_suggestion}
                          </h4>
                        </div>
                        <span className="bg-emerald-950 border border-emerald-800 text-emerald-300 text-[8px] px-2 py-0.5 rounded font-bold uppercase shrink-0">
                          {scanResult.category_code}
                        </span>
                      </div>

                      <div className="space-y-2 text-[11px]">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">{getTranslation(language, 'aiDetectedMaterial')}:</span>
                          <span className="font-bold text-white text-right">{scanResult.material_type}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">{getTranslation(language, 'aiPurity')}:</span>
                          <span className="font-bold text-white">{scanResult.estimated_purity_pct}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">{getTranslation(language, 'aiCondition')}:</span>
                          <span className="font-bold text-emerald-300">{scanResult.condition}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">{getTranslation(language, 'aiPriceRange')}:</span>
                          <span className="font-bold text-emerald-300">
                            Rs. {scanResult.price_range_npr.min} - {scanResult.price_range_npr.max} / kg
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-emerald-900/40 pt-2.5">
                        <span className="text-[8px] text-gray-400 font-bold block mb-1 uppercase tracking-wide">
                          {getTranslation(language, 'aiBuyerIndustries')}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {scanResult.buyer_industries.slice(0, 3).map((ind, i) => (
                            <span 
                              key={i} 
                              className="bg-[#121c16] border border-[#2D8C5F]/20 text-gray-300 text-[9px] font-semibold px-2 py-0.5 rounded-md"
                            >
                              {ind}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleUseAIResult}
                      className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1 border border-emerald-400/20 shadow"
                    >
                      <span>{getTranslation(language, 'aiAutoFillBtn')}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. FEATURED PREMIUM RESOURCE LISTINGS (BENTO GRID STYLE) */}
      <section className="py-20 px-4 md:px-margin-desktop bg-surface border-t border-b border-outline-variant/50">
        <div className="max-w-container-max mx-auto">
          
          <div className="flex justify-between items-end mb-10 gap-4">
            <div>
              <span className="text-primary font-bold text-xs uppercase tracking-wider font-label-md">
                {language === 'en' ? "HOT DEMANDED RESOURCES" : "अत्याधिक माग गरिएका सामग्रीहरू"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface font-headline-lg mt-1">
                {language === 'en' ? "Premium Resource Listings" : "मुख्य उपलब्ध सामग्रीहरू"}
              </h2>
            </div>
            <Link 
              href="/listings"
              className="text-primary font-bold text-sm flex items-center gap-1 hover:underline font-label-md shrink-0"
            >
              <span>{language === 'en' ? "Explore Full Marketplace" : "सम्पूर्ण बजार हेर्नुहोस्"}</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Bento Grid Layout (min-height 500px) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Big Card (8 Columns) */}
            <div className="md:col-span-8 group relative overflow-hidden rounded-2xl shadow-lg border border-outline-variant/35 flex flex-col justify-end bg-[#0c1322] min-h-[360px] p-6 text-white md:p-8">
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://images.unsplash.com/photo-1558444455-57551955d11d?auto=format&fit=crop&q=80&w=800" 
                  alt="Recycled copper metal" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-55"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-on-background/90 via-on-background/30 to-transparent"></div>
              </div>
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-secondary text-white rounded-full font-bold text-[9px] uppercase tracking-wider">
                    {language === 'en' ? "High Purity" : "उच्च शुद्धता"}
                  </span>
                  <span className="px-2 py-0.5 bg-white/10 backdrop-blur-md rounded text-[9px]">
                    {language === 'en' ? "Updated 5m ago" : "५ मिनेट पहिले"}
                  </span>
                </div>
                
                <h3 className="font-extrabold text-xl sm:text-2xl font-headline-lg text-white">
                  {language === 'en' ? "Industrial Grade Copper Scrap (99.9% Purity)" : "तामाको औद्योगिक स्क्र्याप (९९.९% शुद्धता)"}
                </h3>
                
                <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-4 mt-2 text-xs font-semibold">
                  <div className="flex flex-col">
                    <span className="text-white/60 text-[9px] uppercase tracking-wider">{language === 'en' ? "Quantity" : "परिमाण"}</span>
                    <span className="text-white font-bold text-sm sm:text-base">24.5 Metric Tons</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white/60 text-[9px] uppercase tracking-wider">{language === 'en' ? "Location" : "स्थान"}</span>
                    <span className="text-white font-bold text-sm sm:text-base">Birgunj Hub</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white/60 text-[9px] uppercase tracking-wider">{language === 'en' ? "Asking Price" : "सुरुवाती मूल्य"}</span>
                    <span className="text-emerald-400 font-extrabold text-sm sm:text-base">Rs. 1,240 / kg</span>
                  </div>
                </div>

                <Link
                  href="/listings"
                  className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs py-3 px-5 rounded-lg transition-all mt-4 w-fit shadow"
                >
                  <span>{language === 'en' ? "View Specifications & Bid" : "विवरण हेरी बोलपत्र हाल्नुहोस्"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right stack of 2 small cards (4 Columns) */}
            <div className="md:col-span-4 flex flex-col gap-6">
              
              {/* Small Card 1 */}
              <div className="group bg-surface-container-lowest border border-outline-variant/35 rounded-2xl overflow-hidden card-shadow flex flex-col justify-between hover:border-primary/20 transition-all">
                <div className="h-32 relative overflow-hidden bg-gray-100">
                  <img 
                    src="https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=400" 
                    alt="Wood Residue" 
                    className="w-full h-full object-cover transition-transform duration-550 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 px-2 py-0.5 rounded text-[8px] font-bold text-primary shadow">
                    {language === 'en' ? "BIOMASS" : "बायोमास"}
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-sm text-on-surface mb-1 group-hover:text-primary transition-colors">
                    {language === 'en' ? "Processed Sawdust Residue" : "प्रशोधित काठको धूलो (बुरदा)"}
                  </h4>
                  <div className="flex justify-between items-center text-[10px] font-semibold text-on-surface-variant pt-2 mt-1 border-t border-outline-variant/20">
                    <span>120m³ {language === 'en' ? "Available" : "उपलब्ध"}</span>
                    <span className="font-bold text-on-surface">₨ 15k / Ton</span>
                  </div>
                </div>
              </div>

              {/* Small Card 2 */}
              <div className="group bg-surface-container-lowest border border-outline-variant/35 rounded-2xl overflow-hidden card-shadow flex flex-col justify-between hover:border-primary/20 transition-all">
                <div className="h-32 relative overflow-hidden bg-gray-100">
                  <img 
                    src="https://images.unsplash.com/photo-1526613098278-a7f1a7d7b2e5?auto=format&fit=crop&q=80&w=400" 
                    alt="Plastic offcuts" 
                    className="w-full h-full object-cover transition-transform duration-550 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 px-2 py-0.5 rounded text-[8px] font-bold text-secondary shadow">
                    {language === 'en' ? "PLASTICS" : "प्लास्टिक"}
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-sm text-on-surface mb-1 group-hover:text-primary transition-colors">
                    {language === 'en' ? "HDPE Polymer Offcuts" : "HDPE पोलिमरका टुक्राहरू"}
                  </h4>
                  <div className="flex justify-between items-center text-[10px] font-semibold text-on-surface-variant pt-2 mt-1 border-t border-outline-variant/20">
                    <span>2.8 Tons {language === 'en' ? "Available" : "उपलब्ध"}</span>
                    <span className="font-bold text-on-surface">₨ 95 / kg</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="bg-primary text-on-primary py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}></div>
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-headline-lg text-white">
            {language === 'en' ? "Ready to Optimize Your Material Lifecycle?" : "आफ्नो औद्योगिक अवशेषलाई व्यवस्थापन गर्न तयार हुनुहुन्छ?"}
          </h2>
          <p className="text-sm sm:text-base text-primary-fixed/85 font-medium max-w-xl mx-auto leading-relaxed">
            {language === 'en' 
              ? "Join hundreds of industrial leaders across Nepal using AI to transform secondary resources into sustainable revenue streams." 
              : "नेपालका सयौं उद्योग र रिसाइक्लरहरूसँग जोडिनुहोस् र वातावरण संरक्षणसँगै व्यवसाय बढाउनुहोस्।"}
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link 
              href="/listings/new"
              className="bg-white text-primary font-bold px-8 py-4 rounded-lg shadow-xl hover:scale-105 active:scale-95 transition-all text-sm cursor-pointer"
            >
              {language === 'en' ? "Register Your Business" : "कारखाना दर्ता गर्नुहोस्"}
            </Link>
            <Link 
              href="/listings"
              className="bg-primary-container border border-white/20 text-white font-semibold px-8 py-4 rounded-lg hover:bg-white/10 transition-all text-sm cursor-pointer"
            >
              {language === 'en' ? "Explore Marketplace" : "बजार हेर्नुहोस्"}
            </Link>
          </div>
          
          <p className="text-[10px] text-white/50 pt-6">
            {language === 'en' 
              ? "Trusted by Nepal Chamber of Commerce & Industrial Manufacturers Association"
              : "नेपाल उद्योग वाणिज्य महासंघ र उद्योगी संघहरूसँगको सहकार्यमा"}
          </p>
        </div>
      </section>

    </div>
  );
}
