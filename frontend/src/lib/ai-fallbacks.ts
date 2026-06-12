export interface AIClassificationResult {
  material_type: string;
  category_code: string;
  estimated_purity_pct: number;
  condition: 'Clean' | 'Contaminated' | 'Mixed';
  price_range_npr: {
    min: number;
    max: number;
  };
  buyer_industries: string[];
  listing_title_suggestion: string;
}

export const aiFallbacks: Record<string, AIClassificationResult> = {
  wood_dust: {
    material_type: "Hardwood Sawdust & Wood Shavings",
    category_code: "wood_biomass",
    estimated_purity_pct: 95,
    condition: "Clean",
    price_range_npr: { min: 4, max: 8 },
    buyer_industries: ["Biomass Energy Plants", "Paper Mills", "Particle Board Factories"],
    listing_title_suggestion: "Premium Hardwood Sawdust (काठको धुलो)"
  },
  concrete_rubble: {
    material_type: "Crushed Concrete Rubble",
    category_code: "concrete_rubble",
    estimated_purity_pct: 88,
    condition: "Mixed",
    price_range_npr: { min: 2, max: 5 },
    buyer_industries: ["Road Contractors", "Aggregate Suppliers", "Landfill Alternatives"],
    listing_title_suggestion: "Recyclable Concrete Rubble (कंक्रीट भग्नावशेष)"
  },
  plastic_hdpe: {
    material_type: "Industrial HDPE Plastic Offcuts",
    category_code: "plastic_hdpe",
    estimated_purity_pct: 92,
    condition: "Clean",
    price_range_npr: { min: 25, max: 40 },
    buyer_industries: ["Eco-brick Manufacturers", "Plastic Recyclers", "Construction Firms"],
    listing_title_suggestion: "Industrial HDPE Plastic Scrap (प्लास्टिक स्क्र्याप)"
  },
  carpet_wool: {
    material_type: "Pure Wool Carpet Scrap & Fibers",
    category_code: "textile_wool",
    estimated_purity_pct: 90,
    condition: "Clean",
    price_range_npr: { min: 15, max: 30 },
    buyer_industries: ["Insulation Manufacturers", "Recycled Yarn Producers", "Acoustic Panel Makers"],
    listing_title_suggestion: "Woolen Scrap Fibers (ऊनको टुक्रा)"
  },
  metal_shavings: {
    material_type: "Iron Shavings & Turning Chips",
    category_code: "metal_ferrous",
    estimated_purity_pct: 96,
    condition: "Mixed",
    price_range_npr: { min: 35, max: 50 },
    buyer_industries: ["Foundries", "Rebar Manufacturers", "Steel Recycling Mills"],
    listing_title_suggestion: "Iron Scrap Filings (फलामको धूलो)"
  },
  glass_cullet: {
    material_type: "Mixed Glass Cullet & Shards",
    category_code: "glass_cullet",
    estimated_purity_pct: 85,
    condition: "Mixed",
    price_range_npr: { min: 8, max: 15 },
    buyer_industries: ["Bottle Recyclers", "Construction Aggregate Producers", "Abrasives Manufacturers"],
    listing_title_suggestion: "Crushed Glass Cullet (सिसाको टुक्रा)"
  },
  brick_dust: {
    material_type: "Clay Brick Dust & Powders",
    category_code: "brick_dust",
    estimated_purity_pct: 94,
    condition: "Clean",
    price_range_npr: { min: 3, max: 6 },
    buyer_industries: ["Cement Factories (Pozzolan)", "Pottery Makers", "Soil Conditioning"],
    listing_title_suggestion: "Brick Powders & Residue (ईट्टाको धूलो)"
  },
  organic_food: {
    material_type: "Post-Industrial Organic Waste & Vegetable Trimmings",
    category_code: "organic_food",
    estimated_purity_pct: 80,
    condition: "Contaminated",
    price_range_npr: { min: 1, max: 3 },
    buyer_industries: ["Composting Companies", "Biogas Plants", "Animal Feed Producers"],
    listing_title_suggestion: "Organic Processing Waste (जैविक फोहोर)"
  }
};

export function getSimulatedAIResult(imageNameOrKey: string): AIClassificationResult {
  // If the key is specifically matched, return it
  if (aiFallbacks[imageNameOrKey]) {
    return aiFallbacks[imageNameOrKey];
  }
  
  // Otherwise, select a random one or default to other
  const keys = Object.keys(aiFallbacks);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return aiFallbacks[randomKey];
}
