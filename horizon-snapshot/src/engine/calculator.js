/**
 * Calculation Engine
 * ACCU potential, pricing, soil characteristics — all lookup tables and formulas.
 *
 * Sources:
 * - ACCU Rainfall Assumptions PDF (10 bands × 2 land uses)
 * - Soil Type Characteristics PDF (13 Australian soil types)
 * - Pricing Formula (confirmed 2026-05-05: 24 cores/CEA, updated bands)
 */

const CORES_PER_CEA = 24;
const DEFERRED_ACCU_PRICE = 12.50;
const MAX_DEFERRED_BASELINE = 50000;

// ── ACCU Rate Lookup ────────────────────────────────────────
// Key: rainfall threshold (mm). Rate applies for rainfall >= threshold.
// Last entry covers everything above 1200mm.
const ACCU_RATES = {
  pasture: [
    [200, 1.5], [300, 2.0], [400, 2.5], [500, 3.0], [600, 3.5],
    [700, 4.0], [800, 4.5], [900, 5.0], [1000, 5.5], [1200, 6.0]
  ],
  cropping: [
    [200, 1.0], [300, 1.5], [400, 2.0], [500, 2.0], [600, 2.5],
    [700, 2.5], [800, 3.0], [900, 3.0], [1000, 3.5], [1200, 3.5]
  ]
};

// ── Soil Characteristics Lookup ─────────────────────────────
const SOIL_CHARACTERISTICS = {
  'Calcarosol': { water: 'Medium',     productivity: 'Medium',      stability: 'Medium' },
  'Chromosol':  { water: 'Medium',     productivity: 'Medium-High', stability: 'Medium' },
  'Dermosol':   { water: 'High',       productivity: 'High',        stability: 'High' },
  'Ferrosol':   { water: 'High',       productivity: 'High',        stability: 'High' },
  'Hydrosol':   { water: 'High',       productivity: 'Low',         stability: 'Low' },
  'Kandosol':   { water: 'Low-Medium', productivity: 'Low-Medium',  stability: 'Low' },
  'Kurosol':    { water: 'Medium',     productivity: 'Medium',      stability: 'Medium' },
  'Organosol':  { water: 'High',       productivity: 'Medium',      stability: 'High' },
  'Podosol':    { water: 'Low',        productivity: 'Low',         stability: 'Low' },
  'Rudosol':    { water: 'Low',        productivity: 'Low',         stability: 'Low' },
  'Sodosol':    { water: 'Low-Medium', productivity: 'Low-Medium',  stability: 'Low-Medium' },
  'Tenosol':    { water: 'Low',        productivity: 'Low-Medium',  stability: 'Low' },
  'Vertosol':   { water: 'High',       productivity: 'High',        stability: 'Medium-High' }
};

// ── Pricing Bands ───────────────────────────────────────────
// [coreThreshold, costPerCore (ex GST)]
// Confirmed 2026-05-05. At 24 cores/CEA, total cores are always multiples of 24.
const PRICING_BANDS = [
  [9, 735], [12, 709], [16, 499], [20, 447], [24, 447], [28, 447],
  [32, 394], [36, 394], [40, 368], [44, 368], [48, 368],
  [52, 342], [56, 342], [60, 315]
];

// ── Functions ───────────────────────────────────────────────

function getAccuRate(rainfall, landUse) {
  const table = ACCU_RATES[landUse] || ACCU_RATES.pasture;
  let rate = table[0][1];
  for (const [threshold, r] of table) {
    if (rainfall >= threshold) rate = r;
  }
  return rate;
}

function getCostPerCore(totalCores) {
  let cost = PRICING_BANDS[PRICING_BANDS.length - 1][1]; // >60 default
  for (const [threshold, price] of PRICING_BANDS) {
    if (totalCores <= threshold) {
      cost = price;
      break;
    }
    cost = price;
  }
  return cost;
}

function getSoilCharacteristics(soilClasses) {
  const fallback = { water: 'Medium', productivity: 'Medium', stability: 'Medium' };
  if (!soilClasses || soilClasses.length === 0) {
    return { dominant: 'Unknown', water: 'N/A', productivity: 'N/A', stability: 'N/A', all: [], allChars: [] };
  }
  const allChars = soilClasses.map(name => ({
    name,
    ...(SOIL_CHARACTERISTICS[name] || fallback)
  }));
  const dominant = soilClasses[0];
  const dominantChars = SOIL_CHARACTERISTICS[dominant] || fallback;
  return { dominant, ...dominantChars, all: soilClasses, allChars };
}

/**
 * Determine land use from production system string.
 * "grazing" → pasture. Anything with "crop" → cropping.
 */
function detectLandUse(productionSystem) {
  if (!productionSystem) return 'pasture';
  const lower = productionSystem.toLowerCase();
  if (lower.includes('crop')) return 'cropping';
  return 'pasture';
}

/**
 * Run all calculations from parsed metadata.
 * Returns a complete calculation result object.
 */
function calculateAll(parsed, landUseOverride) {
  const landUse = landUseOverride || detectLandUse(parsed.productionSystem);
  const rainfall = parsed.rainfall || 0;
  const eligibleArea = parsed.eligibleArea || 0;

  const accuRate = getAccuRate(rainfall, landUse);
  const totalAccu = Math.round(eligibleArea * accuRate * 25);
  const numProjects = Math.max(1, Math.ceil(eligibleArea / 400));
  const totalCores = numProjects * CORES_PER_CEA;
  const costPerCore = getCostPerCore(totalCores);
  const baselineCost = totalCores * costPerCore;
  const deferredAccus = Math.ceil(Math.min(baselineCost, MAX_DEFERRED_BASELINE) / DEFERRED_ACCU_PRICE);
  const soil = getSoilCharacteristics(parsed.soilClasses);

  return {
    landUse,
    accuRate,
    eligibleArea,
    eligiblePct: parsed.eligiblePct || 0,
    totalAccu,
    numProjects,
    totalCores,
    costPerCore,
    baselineCost,
    deferredAccus,
    soil,
    rainfall,
    phMin: parsed.phMin,
    phMax: parsed.phMax,
    depthMin: parsed.depthMin,
    depthMax: parsed.depthMax
  };
}

module.exports = {
  calculateAll,
  getAccuRate,
  getCostPerCore,
  getSoilCharacteristics,
  detectLandUse,
  CORES_PER_CEA,
  ACCU_RATES,
  SOIL_CHARACTERISTICS,
  PRICING_BANDS
};
