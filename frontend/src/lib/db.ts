import { aiFallbacks, AIClassificationResult } from './ai-fallbacks';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'generator' | 'buyer' | 'agent' | 'admin';
  company: string;
  industry?: string; // Buyer's industry profile
  phone: string;
  location: string;
  avatar_url?: string;
  created_at: string;
}

export interface Listing {
  id: string;
  user_id: string;
  seller_name: string;
  seller_company: string;
  seller_phone: string;
  title: string;
  category_code: string;
  material_type: string;
  quantity_kg: number;
  condition: 'Clean' | 'Contaminated' | 'Mixed';
  price_npr_min: number;
  price_npr_max: number;
  photo_url?: string;
  lat: number;
  lng: number;
  neighborhood: string;
  status: 'active' | 'sold' | 'expired';
  ai_result?: AIClassificationResult;
  created_at: string;
}

export interface Match {
  id: string;
  listing_id: string;
  buyer_id: string;
  status: 'pending' | 'contacted' | 'closed';
  created_at: string;
}

export interface ImpactLog {
  id: string;
  listing_id: string;
  material_type: string;
  kg_diverted: number;
  co2_saved_kg: number;
  revenue_npr: number;
  traded_at: string;
}

// Pre-seeded Users
export const SEEDED_USERS: User[] = [
  {
    id: "user-ram-generator",
    email: "ram@furniture.np",
    full_name: "Ram Shrestha",
    role: "generator",
    company: "Bhaktapur Furniture Cluster",
    phone: "+977 9851012345",
    location: "Bhaktapur / Thimi",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120",
    created_at: new Date("2026-01-10").toISOString()
  },
  {
    id: "user-sita-buyer",
    email: "sita@pataninsulation.np",
    full_name: "Sita Thapa",
    role: "buyer",
    company: "Patan Green Insulation & Biomass",
    industry: "Biomass energy plants, paper mills, particle board factories, insulation manufacturers, recycled yarn producers",
    phone: "+977 9841987654",
    location: "Patan Industrial Estate",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120",
    created_at: new Date("2026-02-15").toISOString()
  },
  {
    id: "user-bijay-agent",
    email: "bijay@balajuscrap.np",
    full_name: "Bijay Tamang",
    role: "agent",
    company: "Balaju Recyclers & Logistics",
    phone: "+977 9803123456",
    location: "Balaju, Kathmandu",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120",
    created_at: new Date("2026-03-05").toISOString()
  },
  {
    id: "user-admin",
    email: "admin@mole.org.np",
    full_name: "MOLE System Administrator",
    role: "admin",
    company: "MOLE Nepal Foundation",
    phone: "+977 1-4444555",
    location: "Lalitpur",
    created_at: new Date("2026-01-01").toISOString()
  }
];

// Pre-seeded Listings (The 8 PRD Listings)
export const SEEDED_LISTINGS: Listing[] = [
  {
    id: "listing-wood-dust",
    user_id: "user-ram-generator",
    seller_name: "Ram Shrestha",
    seller_company: "Bhaktapur Furniture Cluster",
    seller_phone: "+977 9851012345",
    title: "Premium Hardwood Sawdust (काठको धुलो)",
    category_code: "wood_biomass",
    material_type: "Wood dust / offcuts",
    quantity_kg: 300,
    condition: "Clean",
    price_npr_min: 4,
    price_npr_max: 8,
    lat: 27.6766,
    lng: 85.3999,
    neighborhood: "Bhaktapur / Thimi",
    status: "active",
    ai_result: aiFallbacks.wood_dust,
    created_at: new Date("2026-06-10T09:00:00Z").toISOString()
  },
  {
    id: "listing-carpet-wool",
    user_id: "user-ram-generator",
    seller_name: "Ram Shrestha",
    seller_company: "Bhaktapur Furniture Cluster",
    seller_phone: "+977 9851012345",
    title: "Woolen Scrap Fibers (ऊनको टुक्रा)",
    category_code: "textile_wool",
    material_type: "Carpet wool scraps",
    quantity_kg: 150,
    condition: "Clean",
    price_npr_min: 15,
    price_npr_max: 30,
    lat: 27.6631,
    lng: 85.3216,
    neighborhood: "Patan Industrial Estate",
    status: "sold",
    ai_result: aiFallbacks.carpet_wool,
    created_at: new Date("2026-06-08T10:30:00Z").toISOString()
  },
  {
    id: "listing-plastic-hdpe",
    user_id: "user-ram-generator",
    seller_name: "Ram Shrestha",
    seller_company: "Bhaktapur Furniture Cluster",
    seller_phone: "+977 9851012345",
    title: "Industrial HDPE Plastic Scrap (प्लास्टिक स्क्र्याप)",
    category_code: "plastic_hdpe",
    material_type: "Plastic offcuts (HDPE)",
    quantity_kg: 500,
    condition: "Clean",
    price_npr_min: 25,
    price_npr_max: 40,
    lat: 27.7337,
    lng: 85.2977,
    neighborhood: "Balaju Industrial District",
    status: "active",
    ai_result: aiFallbacks.plastic_hdpe,
    created_at: new Date("2026-06-11T14:20:00Z").toISOString()
  },
  {
    id: "listing-concrete-rubble",
    user_id: "user-ram-generator",
    seller_name: "Ram Shrestha",
    seller_company: "Bhaktapur Furniture Cluster",
    seller_phone: "+977 9851012345",
    title: "Recyclable Concrete Rubble (कंक्रीट भग्नावशेष)",
    category_code: "concrete_rubble",
    material_type: "Concrete rubble",
    quantity_kg: 2000,
    condition: "Mixed",
    price_npr_min: 2,
    price_npr_max: 5,
    lat: 27.6780,
    lng: 85.3489,
    neighborhood: "Koteshwor (road site)",
    status: "active",
    ai_result: aiFallbacks.concrete_rubble,
    created_at: new Date("2026-06-09T08:15:00Z").toISOString()
  },
  {
    id: "listing-metal-shavings",
    user_id: "user-ram-generator",
    seller_name: "Ram Shrestha",
    seller_company: "Bhaktapur Furniture Cluster",
    seller_phone: "+977 9851012345",
    title: "Iron Scrap Filings (फलामको धूलो)",
    category_code: "metal_ferrous",
    material_type: "Metal shavings (iron)",
    quantity_kg: 80,
    condition: "Mixed",
    price_npr_min: 35,
    price_npr_max: 50,
    lat: 27.4242,
    lng: 85.0347,
    neighborhood: "Hetauda (listed remotely)",
    status: "active",
    ai_result: aiFallbacks.metal_shavings,
    created_at: new Date("2026-06-10T11:45:00Z").toISOString()
  },
  {
    id: "listing-brick-dust",
    user_id: "user-ram-generator",
    seller_name: "Ram Shrestha",
    seller_company: "Bhaktapur Furniture Cluster",
    seller_phone: "+977 9851012345",
    title: "Brick Powders & Residue (ईट्टाको धूलो)",
    category_code: "brick_dust",
    material_type: "Brick dust / residue",
    quantity_kg: 400,
    condition: "Clean",
    price_npr_min: 3,
    price_npr_max: 6,
    lat: 27.6712,
    lng: 85.4294,
    neighborhood: "Bhaktapur Brick Kilns",
    status: "active",
    ai_result: aiFallbacks.brick_dust,
    created_at: new Date("2026-06-11T16:00:00Z").toISOString()
  },
  {
    id: "listing-cardboard-paper",
    user_id: "user-ram-generator",
    seller_name: "Ram Shrestha",
    seller_company: "Bhaktapur Furniture Cluster",
    seller_phone: "+977 9851012345",
    title: "Paper Recycling Cardboard (कागज/कार्टुन फोहोर)",
    category_code: "paper_cardboard",
    material_type: "Cardboard & paper",
    quantity_kg: 200,
    condition: "Clean",
    price_npr_min: 8,
    price_npr_max: 15,
    lat: 27.7150,
    lng: 85.3120,
    neighborhood: "Thamel (hotels/shops)",
    status: "sold",
    ai_result: aiFallbacks.paper_cardboard,
    created_at: new Date("2026-06-05T07:30:00Z").toISOString()
  },
  {
    id: "listing-glass-cullet",
    user_id: "user-ram-generator",
    seller_name: "Ram Shrestha",
    seller_company: "Bhaktapur Furniture Cluster",
    seller_phone: "+977 9851012345",
    title: "Crushed Glass Cullet (सिसाको टुक्रा)",
    category_code: "glass_cullet",
    material_type: "Glass cullet",
    quantity_kg: 120,
    condition: "Mixed",
    price_npr_min: 8,
    price_npr_max: 12,
    lat: 27.6983,
    lng: 85.3015,
    neighborhood: "Kalimati Market",
    status: "sold",
    ai_result: aiFallbacks.glass_cullet,
    created_at: new Date("2026-06-06T15:20:00Z").toISOString()
  }
];

// Seeded Matches
export const SEEDED_MATCHES: Match[] = [
  {
    id: "match-carpet",
    listing_id: "listing-carpet-wool",
    buyer_id: "user-sita-buyer",
    status: "closed",
    created_at: new Date("2026-06-09T12:00:00Z").toISOString()
  },
  {
    id: "match-cardboard",
    listing_id: "listing-cardboard-paper",
    buyer_id: "user-sita-buyer",
    status: "closed",
    created_at: new Date("2026-06-06T10:00:00Z").toISOString()
  },
  {
    id: "match-glass",
    listing_id: "listing-glass-cullet",
    buyer_id: "user-sita-buyer",
    status: "closed",
    created_at: new Date("2026-06-07T11:00:00Z").toISOString()
  },
  {
    id: "match-wood-pending",
    listing_id: "listing-wood-dust",
    buyer_id: "user-sita-buyer",
    status: "pending",
    created_at: new Date("2026-06-11T10:00:00Z").toISOString()
  }
];

// Seeded Impact Logs (computed from the 3 sold items)
// Carpet: 150kg * NPR 20 (average price) = 3000 NPR, 150kg * 0.5 = 75kg CO2
// Cardboard: 200kg * NPR 10 = 2000 NPR, 200kg * 0.5 = 100kg CO2
// Glass: 120kg * NPR 10 = 1200 NPR, 120kg * 0.5 = 60kg CO2
export const SEEDED_IMPACT_LOGS: ImpactLog[] = [
  {
    id: "log-carpet",
    listing_id: "listing-carpet-wool",
    material_type: "Carpet wool scraps",
    kg_diverted: 150,
    co2_saved_kg: 75,
    revenue_npr: 3000,
    traded_at: new Date("2026-06-09T14:00:00Z").toISOString()
  },
  {
    id: "log-cardboard",
    listing_id: "listing-cardboard-paper",
    material_type: "Cardboard & paper",
    kg_diverted: 200,
    co2_saved_kg: 100,
    revenue_npr: 2000,
    traded_at: new Date("2026-06-06T16:30:00Z").toISOString()
  },
  {
    id: "log-glass",
    listing_id: "listing-glass-cullet",
    material_type: "Glass cullet",
    kg_diverted: 120,
    co2_saved_kg: 60,
    revenue_npr: 1200,
    traded_at: new Date("2026-06-07T13:00:00Z").toISOString()
  }
];

// Helper to initialize local storage
function initializeStorage() {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem('mole_initialized')) {
    localStorage.setItem('mole_users', JSON.stringify(SEEDED_USERS));
    localStorage.setItem('mole_listings', JSON.stringify(SEEDED_LISTINGS));
    localStorage.setItem('mole_matches', JSON.stringify(SEEDED_MATCHES));
    localStorage.setItem('mole_impact_logs', JSON.stringify(SEEDED_IMPACT_LOGS));
    localStorage.setItem('mole_initialized', 'true');
    localStorage.setItem('mole_active_user', JSON.stringify(SEEDED_USERS[0])); // Default to Ram Shrestha
  }
}

// Ensure storage is initialized
if (typeof window !== 'undefined') {
  initializeStorage();
}

// Database Actions
export const db = {
  // Active User State
  getActiveUser(): User {
    if (typeof window === 'undefined') return SEEDED_USERS[0];
    const user = localStorage.getItem('mole_active_user');
    return user ? JSON.parse(user) : SEEDED_USERS[0];
  },
  
  setActiveUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('mole_active_user', JSON.stringify(user));
    // Trigger storage event for reactivity
    window.dispatchEvent(new Event('storage'));
  },

  // Users
  getUsers(): User[] {
    if (typeof window === 'undefined') return SEEDED_USERS;
    const users = localStorage.getItem('mole_users');
    return users ? JSON.parse(users) : SEEDED_USERS;
  },

  // Listings
  getListings(): Listing[] {
    if (typeof window === 'undefined') return SEEDED_LISTINGS;
    const listings = localStorage.getItem('mole_listings');
    return listings ? JSON.parse(listings) : SEEDED_LISTINGS;
  },

  getListing(id: string): Listing | undefined {
    return this.getListings().find(l => l.id === id);
  },

  createListing(listingData: Omit<Listing, 'id' | 'created_at' | 'status'>): Listing {
    const listings = this.getListings();
    const newListing: Listing = {
      ...listingData,
      id: `listing-${Date.now()}`,
      status: 'active',
      created_at: new Date().toISOString()
    };
    listings.unshift(newListing);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mole_listings', JSON.stringify(listings));
      // Trigger matching logic
      this.runMatchingEngineForListing(newListing);
      window.dispatchEvent(new Event('storage'));
    }
    return newListing;
  },

  updateListingStatus(id: string, status: 'active' | 'sold' | 'expired'): Listing | undefined {
    const listings = this.getListings();
    const idx = listings.findIndex(l => l.id === id);
    if (idx === -1) return undefined;

    const oldListing = listings[idx];
    const updated = { ...oldListing, status };
    listings[idx] = updated;

    if (typeof window !== 'undefined') {
      localStorage.setItem('mole_listings', JSON.stringify(listings));
      
      // If sold, create an impact log
      if (status === 'sold' && oldListing.status !== 'sold') {
        this.addImpactLog(updated);
        // Set match state to closed
        const matches = this.getMatches();
        const listingMatchIdx = matches.findIndex(m => m.listing_id === id);
        if (listingMatchIdx !== -1) {
          matches[listingMatchIdx].status = 'closed';
          localStorage.setItem('mole_matches', JSON.stringify(matches));
        }
      }
      
      window.dispatchEvent(new Event('storage'));
    }
    return updated;
  },

  // Matches
  getMatches(): Match[] {
    if (typeof window === 'undefined') return SEEDED_MATCHES;
    const matches = localStorage.getItem('mole_matches');
    return matches ? JSON.parse(matches) : SEEDED_MATCHES;
  },

  createMatch(listingId: string, buyerId: string): Match {
    const matches = this.getMatches();
    const newMatch: Match = {
      id: `match-${Date.now()}`,
      listing_id: listingId,
      buyer_id: buyerId,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    matches.push(newMatch);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mole_matches', JSON.stringify(matches));
      window.dispatchEvent(new Event('storage'));
    }
    return newMatch;
  },

  updateMatchStatus(id: string, status: 'pending' | 'contacted' | 'closed'): Match | undefined {
    const matches = this.getMatches();
    const idx = matches.findIndex(m => m.id === id);
    if (idx === -1) return undefined;
    
    matches[idx].status = status;
    if (typeof window !== 'undefined') {
      localStorage.setItem('mole_matches', JSON.stringify(matches));
      
      // If closed, mark the listing as sold
      if (status === 'closed') {
        this.updateListingStatus(matches[idx].listing_id, 'sold');
      }
      window.dispatchEvent(new Event('storage'));
    }
    return matches[idx];
  },

  // Impact Logs
  getImpactLogs(): ImpactLog[] {
    if (typeof window === 'undefined') return SEEDED_IMPACT_LOGS;
    const logs = localStorage.getItem('mole_impact_logs');
    return logs ? JSON.parse(logs) : SEEDED_IMPACT_LOGS;
  },

  addImpactLog(listing: Listing) {
    const logs = this.getImpactLogs();
    const avgPrice = (listing.price_npr_min + listing.price_npr_max) / 2;
    const rev = listing.quantity_kg * avgPrice;
    
    const newLog: ImpactLog = {
      id: `log-${Date.now()}`,
      listing_id: listing.id,
      material_type: listing.material_type,
      kg_diverted: listing.quantity_kg,
      co2_saved_kg: listing.quantity_kg * 0.5,
      revenue_npr: rev,
      traded_at: new Date().toISOString()
    };
    
    logs.push(newLog);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mole_impact_logs', JSON.stringify(logs));
    }
  },

  // Aggregated Stats
  getImpactStats() {
    const logs = this.getImpactLogs();
    const listings = this.getListings();
    const users = this.getUsers();
    
    const totalDiverted = logs.reduce((sum, log) => sum + log.kg_diverted, 0);
    const totalCo2Saved = logs.reduce((sum, log) => sum + log.co2_saved_kg, 0);
    const totalRevenue = logs.reduce((sum, log) => sum + log.revenue_npr, 0);
    const totalDisposalCostsAvoided = totalDiverted * 16; // NPR 16 per kg average disposal fee in Nepal
    
    const activeListingsCount = listings.filter(l => l.status === 'active').length;
    const totalUsersCount = users.length;
    
    // Circular Economy Score: a calculated metric based on active users & diverted waste
    const circularEconomyScore = Math.min(100, Math.round(75 + (totalDiverted / 200)));

    return {
      totalDiverted,
      totalCo2Saved,
      totalRevenue,
      totalDisposalCostsAvoided,
      activeListingsCount,
      totalUsersCount,
      circularEconomyScore
    };
  },

  // Smart Match Engine
  // Map category codes to buyer industries in Nepal
  getCategoryBuyerMapping(): Record<string, string[]> {
    return {
      wood_biomass: ["Biomass Energy Plants", "Paper Mills", "Particle Board Factories"],
      plastic_hdpe: ["Eco-brick Manufacturers", "Plastic Recyclers", "Construction Firms"],
      metal_ferrous: ["Foundries", "Rebar Manufacturers", "Steel Recycling Mills"],
      metal_nonferrous: ["Electrical Component Makers", "Plumbing Suppliers"],
      textile_wool: ["Insulation Manufacturers", "Recycled Yarn Producers", "Acoustic Panel Makers"],
      concrete_rubble: ["Road Contractors", "Aggregate Suppliers", "Landfill Alternatives"],
      brick_dust: ["Cement Factories (Pozzolan)", "Pottery Makers", "Soil Conditioning"],
      paper_cardboard: ["Paper Recycling Mills", "Packaging Manufacturers"],
      glass_cullet: ["Bottle Recyclers", "Construction Aggregate Producers"],
      organic_food: ["Composting Companies", "Biogas Plants", "Animal Feed Producers"]
    };
  },

  runMatchingEngineForListing(listing: Listing) {
    // Check all buyers whose profile includes industries compatible with the listing category
    const users = this.getUsers();
    const mapping = this.getCategoryBuyerMapping();
    const targetIndustries = mapping[listing.category_code] || [];
    
    const buyers = users.filter(u => u.role === 'buyer');
    
    buyers.forEach(buyer => {
      // Check if buyer declared industry intersects with listing's recommended industries
      const hasMatch = targetIndustries.some(ind => 
        buyer.industry?.toLowerCase().includes(ind.toLowerCase())
      );
      
      if (hasMatch) {
        // Create a match
        this.createMatch(listing.id, buyer.id);
      }
    });
  },

  // Reset database helper
  resetDatabase() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('mole_initialized');
    initializeStorage();
    window.dispatchEvent(new Event('storage'));
  }
};
