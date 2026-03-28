/**
 * Smart Matching Engine — Logic-based scoring system for waste-to-material matching.
 * No ML required. Scores are computed client-side from existing DB data.
 */

import type { WasteListingPublic } from './db';

/* ─── Match Score Tiers ─── */
export type MatchTier = 'best' | 'good' | 'low';

export interface MatchResult {
    listing: WasteListingPublic & { distance_km?: number };
    score: number;           // 0–100
    tier: MatchTier;
    reasons: string[];       // "Why this match?" explanations
    breakdown: {
        materialScore: number;   // max 40
        distanceScore: number;   // max 25
        quantityScore: number;   // max 20
        timingScore: number;     // max 15
    };
}

export interface MatchCriteria {
    materialNeeded: string;
    quantity: number;
    unit: string;
    frequency: string;
    location: string;
    maxDistance: number;
}

/* ─── Material Similarity Map ─── */
const materialGroups: Record<string, string[]> = {
    'metals': ['steel-scrap', 'aluminum', 'copper'],
    'plastics': ['plastics-hdpe', 'plastics-pp'],
    'organic': ['wood-biomass', 'textile-fiber'],
    'construction': ['concrete-aggregate', 'glass-cullet'],
    'chemical': ['chemical-solvents', 'rubber'],
    'electronics': ['electronic-pcb'],
};

function getMaterialGroup(material: string): string | null {
    for (const [group, members] of Object.entries(materialGroups)) {
        if (members.includes(material)) return group;
    }
    return null;
}

/* ─── Distance Calculator ─── */
export function calculateDistance(loc1: string, loc2: string): number {
    if (!loc1 || !loc2) return 999;
    const l1 = loc1.toLowerCase().trim();
    const l2 = loc2.toLowerCase().trim();
    if (l1 === l2) return 0;
    if (l1.includes(l2) || l2.includes(l1)) return 5;

    // Extract city-level match
    const cities1 = l1.split(',').map(s => s.trim());
    const cities2 = l2.split(',').map(s => s.trim());
    const sharedCity = cities1.some(c => cities2.includes(c));
    if (sharedCity) return 15;

    // Deterministic hash-based distance for demo
    let hash = 0;
    const str = l1 < l2 ? l1 + l2 : l2 + l1;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash % 150) + 10;
}

/* ─── Scoring Functions ─── */

function scoreMaterial(needed: string, listed: string): { score: number; reasons: string[] } {
    const reasons: string[] = [];

    // Exact match
    if (needed === listed) {
        reasons.push(`Exact material match: ${listed.replace(/-/g, ' ')}`);
        return { score: 40, reasons };
    }

    // Same group match
    const neededGroup = getMaterialGroup(needed);
    const listedGroup = getMaterialGroup(listed);
    if (neededGroup && neededGroup === listedGroup) {
        reasons.push(`Related material in same category (${neededGroup})`);
        return { score: 20, reasons };
    }

    // Partial name match
    const n = needed.toLowerCase().replace(/-/g, ' ');
    const l = listed.toLowerCase().replace(/-/g, ' ');
    if (n.includes(l.split(' ')[0]) || l.includes(n.split(' ')[0])) {
        reasons.push(`Partial material type overlap detected`);
        return { score: 15, reasons };
    }

    return { score: 0, reasons };
}

function scoreDistance(distanceKm: number, maxDistance: number): { score: number; reasons: string[] } {
    const reasons: string[] = [];

    if (distanceKm <= 10) {
        reasons.push(`Very close proximity (${distanceKm} km) — minimal logistics cost`);
        return { score: 25, reasons };
    }
    if (distanceKm <= 30) {
        reasons.push(`Nearby location (${distanceKm} km) — low transport overhead`);
        return { score: 22, reasons };
    }
    if (distanceKm <= 50) {
        reasons.push(`Moderate distance (${distanceKm} km) — standard logistics`);
        return { score: 18, reasons };
    }
    if (distanceKm <= maxDistance * 0.7) {
        reasons.push(`Within comfortable range (${distanceKm} km of ${maxDistance} km max)`);
        return { score: 14, reasons };
    }
    if (distanceKm <= maxDistance) {
        reasons.push(`Near max range (${distanceKm} km of ${maxDistance} km max)`);
        return { score: 8, reasons };
    }

    return { score: 0, reasons };
}

function scoreQuantity(needed: number, available: number, neededUnit: string, availableUnit: string): { score: number; reasons: string[] } {
    const reasons: string[] = [];

    // Simple unit normalization (same unit comparison)
    if (neededUnit.toLowerCase() !== availableUnit.toLowerCase()) {
        reasons.push(`Different units (${neededUnit} vs ${availableUnit}) — manual verification recommended`);
        return { score: 10, reasons };
    }

    const ratio = available / needed;

    if (ratio >= 0.9 && ratio <= 1.1) {
        reasons.push(`Quantity perfectly matches your requirement (${available} vs ${needed} ${availableUnit})`);
        return { score: 20, reasons };
    }
    if (ratio >= 0.7 && ratio <= 1.5) {
        reasons.push(`Quantity closely aligns (${available} available vs ${needed} needed)`);
        return { score: 16, reasons };
    }
    if (ratio >= 0.5 && ratio <= 2.0) {
        reasons.push(`Quantity partially compatible — may need supplemental sourcing`);
        return { score: 12, reasons };
    }
    if (ratio >= 0.3) {
        reasons.push(`Partial quantity available (${Math.round(ratio * 100)}% of need)`);
        return { score: 8, reasons };
    }

    reasons.push(`Low quantity overlap (${Math.round(ratio * 100)}% of need)`);
    return { score: 4, reasons };
}

function scoreTiming(neededFreq: string, availableFreq: string): { score: number; reasons: string[] } {
    const reasons: string[] = [];

    if (neededFreq === availableFreq) {
        reasons.push(`Supply frequency matches your requirement (${availableFreq})`);
        return { score: 15, reasons };
    }

    // Continuous can serve any need
    if (availableFreq === 'continuous') {
        reasons.push(`Continuous supply available — flexible for any schedule`);
        return { score: 13, reasons };
    }

    // Recurring serves recurring or one-time
    if (availableFreq === 'recurring' && neededFreq === 'one-time') {
        reasons.push(`Recurring supply available — can fulfill one-time needs`);
        return { score: 12, reasons };
    }

    reasons.push(`Different supply cadence (${availableFreq} vs ${neededFreq}) — coordination needed`);
    return { score: 6, reasons };
}

/* ─── Main Matching Function ─── */

export function computeMatchScore(
    criteria: MatchCriteria,
    listing: WasteListingPublic & { distance_km?: number }
): MatchResult {
    const distance = listing.distance_km ?? calculateDistance(
        criteria.location,
        listing.listing_location || listing.companies?.location || ''
    );

    const material = scoreMaterial(criteria.materialNeeded, listing.waste_type);
    const dist = scoreDistance(distance, criteria.maxDistance || 200);
    const quantity = scoreQuantity(criteria.quantity, listing.quantity, criteria.unit, listing.unit);
    const timing = scoreTiming(criteria.frequency, listing.frequency);

    const totalScore = material.score + dist.score + quantity.score + timing.score;
    const allReasons = [...material.reasons, ...dist.reasons, ...quantity.reasons, ...timing.reasons];

    // Add company/industry context reason
    if (listing.companies?.industry_type) {
        allReasons.push(`Supplier industry: ${listing.companies.industry_type}`);
    }

    const tier: MatchTier = totalScore >= 80 ? 'best' : totalScore >= 50 ? 'good' : 'low';

    return {
        listing: { ...listing, distance_km: distance },
        score: Math.min(totalScore, 100),
        tier,
        reasons: allReasons,
        breakdown: {
            materialScore: material.score,
            distanceScore: dist.score,
            quantityScore: quantity.score,
            timingScore: timing.score,
        },
    };
}

/**
 * Score and rank all listings against criteria.
 * Filters out zero-score matches and sorts by score descending.
 */
export function rankMatches(
    criteria: MatchCriteria,
    listings: WasteListingPublic[]
): MatchResult[] {
    return listings
        .map(listing => {
            const distance = calculateDistance(
                criteria.location,
                listing.listing_location || listing.companies?.location || ''
            );
            return computeMatchScore(criteria, { ...listing, distance_km: distance });
        })
        .filter(m => m.score > 0)
        .sort((a, b) => b.score - a.score);
}
