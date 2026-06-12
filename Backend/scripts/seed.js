/**
 * MOLE — Seed Script
 * Inserts the 8 demo listings from PRD Table 3.4 with real Kathmandu coordinates.
 *
 * Usage:
 *   1. Copy .env.example to .env and fill in your Supabase credentials
 *   2. Run: node scripts/seed.js
 *
 * This script:
 *   - Creates a demo seller user (generator)
 *   - Creates a demo buyer user
 *   - Inserts all 8 demo listings with real GPS coordinates
 *   - Inserts impact_log entries to make the homepage counter non-zero
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── Demo Users ───────────────────────────────────────────────────────────────

const DEMO_SELLER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'ram.shrestha@demo.mole.np',
  full_name: 'Ram Shrestha',
  role: 'generator',
  phone: '+977-9841000001',
  location: 'Bhaktapur',
  industry: null,
};

const DEMO_BUYER = {
  id: '00000000-0000-0000-0000-000000000002',
  email: 'sita.thapa@demo.mole.np',
  full_name: 'Sita Thapa',
  role: 'buyer',
  phone: '+977-9841000002',
  location: 'Patan Industrial Estate, Lalitpur',
  industry: 'Biomass energy plants',
};

const DEMO_AGENT = {
  id: '00000000-0000-0000-0000-000000000003',
  email: 'bijay.tamang@demo.mole.np',
  full_name: 'Bijay Tamang',
  role: 'agent',
  phone: '+977-9841000003',
  location: 'Balaju, Kathmandu',
  industry: null,
};

// ─── Demo Listings (PRD Table 3.4) ───────────────────────────────────────────
// Real Kathmandu coordinates from Google Maps

const DEMO_LISTINGS = [
  {
    title: 'Hardwood Offcuts & Sawdust — काठको धुलो तथा टुक्राहरू',
    category_code: 'wood_biomass',
    material_type: 'Wood dust and hardwood offcuts',
    quantity_kg: 300,
    condition: 'Clean',
    price_npr_min: 4,
    price_npr_max: 7,
    neighborhood: 'Bhaktapur / Thimi',
    lat: 27.6727,
    lng: 85.3990,
    ai_result: {
      material_type: 'Hardwood offcuts and sawdust',
      category_code: 'wood_biomass',
      estimated_purity_pct: 82,
      condition: 'Clean',
      price_range_npr: { min: 4, max: 7 },
      buyer_industries: ['Biomass energy plants', 'Paper mills', 'Particle board factories'],
      listing_title_suggestion: 'Hardwood Offcuts & Sawdust — काठको धुलो',
    },
  },
  {
    title: 'Carpet Wool Scraps — कार्पेट ऊन स्क्र्याप्स',
    category_code: 'textile_wool',
    material_type: 'Carpet wool scraps and offcuts',
    quantity_kg: 150,
    condition: 'Mixed',
    price_npr_min: 10,
    price_npr_max: 18,
    neighborhood: 'Patan Industrial Estate, Lalitpur',
    lat: 27.6644,
    lng: 85.3165,
    ai_result: null,
  },
  {
    title: 'HDPE Plastic Offcuts — एचडीपीई प्लास्टिक अफकट्स',
    category_code: 'plastic_hdpe',
    material_type: 'HDPE plastic offcuts and pellets',
    quantity_kg: 500,
    condition: 'Clean',
    price_npr_min: 20,
    price_npr_max: 35,
    neighborhood: 'Balaju Industrial District',
    lat: 27.7404,
    lng: 85.2982,
    ai_result: null,
  },
  {
    title: 'Concrete Rubble & Construction Waste — कंक्रिट मलबा',
    category_code: 'concrete_rubble',
    material_type: 'Concrete rubble from road construction',
    quantity_kg: 2000,
    condition: 'Mixed',
    price_npr_min: 1,
    price_npr_max: 3,
    neighborhood: 'Koteshwor (road site)',
    lat: 27.6795,
    lng: 85.3571,
    ai_result: null,
  },
  {
    title: 'Iron Metal Shavings — फलामको धातु छिलकाहरू',
    category_code: 'metal_ferrous',
    material_type: 'Iron and steel shavings from machining',
    quantity_kg: 80,
    condition: 'Clean',
    price_npr_min: 15,
    price_npr_max: 25,
    neighborhood: 'Hetauda (listed remotely)',
    lat: 27.4286,
    lng: 85.0278,
    ai_result: null,
  },
  {
    title: 'Brick Dust & Kiln Residue — इँटाको धुलो',
    category_code: 'brick_dust',
    material_type: 'Brick dust and kiln residue',
    quantity_kg: 400,
    condition: 'Clean',
    price_npr_min: 2,
    price_npr_max: 5,
    neighborhood: 'Bhaktapur Brick Kilns',
    lat: 27.6710,
    lng: 85.4298,
    ai_result: null,
  },
  {
    title: 'Cardboard & Paper Waste — कार्डबोर्ड र कागजको फोहोर',
    category_code: 'paper_cardboard',
    material_type: 'Cardboard and mixed paper from hotels and shops',
    quantity_kg: 200,
    condition: 'Mixed',
    price_npr_min: 8,
    price_npr_max: 12,
    neighborhood: 'Thamel, Kathmandu',
    lat: 27.7152,
    lng: 85.3123,
    ai_result: null,
  },
  {
    title: 'Glass Cullet — काँचको टुक्राहरू',
    category_code: 'glass_cullet',
    material_type: 'Mixed glass cullet from market waste',
    quantity_kg: 120,
    condition: 'Mixed',
    price_npr_min: 5,
    price_npr_max: 10,
    neighborhood: 'Kalimati Market, Kathmandu',
    lat: 27.6979,
    lng: 85.2982,
    ai_result: null,
  },
];

// ─── Seed Functions ────────────────────────────────────────────────────────────

async function seedUsers() {
  console.log('\n👤 Seeding demo users...');

  const users = [DEMO_SELLER, DEMO_BUYER, DEMO_AGENT];

  for (const user of users) {
    const { error } = await supabase
      .from('users')
      .upsert(user, { onConflict: 'id' });

    if (error) {
      console.error(`  ✗ Failed to seed user ${user.full_name}:`, error.message);
    } else {
      console.log(`  ✓ ${user.full_name} (${user.role})`);
    }
  }
}

async function seedListings(sellerId) {
  console.log('\n📋 Seeding demo listings...');

  const listingsWithOwner = DEMO_LISTINGS.map((listing) => ({
    ...listing,
    user_id: sellerId,
    status: 'active',
  }));

  const { data, error } = await supabase
    .from('listings')
    .upsert(listingsWithOwner, { onConflict: 'title' })
    .select('id, title');

  if (error) {
    console.error('  ✗ Failed to seed listings:', error.message);
    return [];
  }

  data.forEach((l) => console.log(`  ✓ ${l.title.slice(0, 60)}...`));
  return data;
}

async function seedImpactLog(listings) {
  console.log('\n📊 Seeding impact log (demo numbers for homepage counter)...');

  // Seed 3 example trade records
  const impactEntries = listings.slice(0, 3).map((listing) => ({
    listing_id: listing.id,
    kg_diverted: Math.floor(Math.random() * 200) + 50,
  }));

  const { error } = await supabase
    .from('impact_log')
    .insert(impactEntries);

  if (error) {
    console.error('  ✗ Failed to seed impact_log:', error.message);
  } else {
    console.log(`  ✓ ${impactEntries.length} trade records logged`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 MOLE Seed Script Starting...');
  console.log(`   Supabase URL: ${process.env.SUPABASE_URL || '⚠  NOT SET'}`);

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('\n✗ ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
    process.exit(1);
  }

  await seedUsers();
  const listings = await seedListings(DEMO_SELLER.id);
  if (listings.length > 0) {
    await seedImpactLog(listings);
  }

  console.log('\n✅ Seed complete!');
  console.log('   Demo login (generator): ram.shrestha@demo.mole.np');
  console.log('   Demo login (buyer):     sita.thapa@demo.mole.np');
  console.log('   Note: You must create Supabase Auth accounts for demo users separately,');
  console.log('         or use the /api/auth/register endpoint with the same emails.\n');
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
