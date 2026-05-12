/**
 * Metadata Parser
 * Parses the metadata.txt output from HORIZON model runs into structured data.
 * Format confirmed from real outputs (Dawlish Rd, Castle Hill) — 2026-05-05.
 */

function parseMetadata(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const data = {};

  for (const line of lines) {
    let m;
    if ((m = line.match(/^Project name:\s*(.+)/i))) data.name = m[1].trim();
    if ((m = line.match(/^Total input area:\s*([\d,.]+)\s*ha/i))) data.totalArea = parseFloat(m[1].replace(/,/g, ''));
    if ((m = line.match(/^Eligible area:\s*([\d,.]+)\s*ha/i))) data.eligibleArea = parseFloat(m[1].replace(/,/g, ''));
    if ((m = line.match(/^Eligible percentage:\s*([\d.]+)%/i))) data.eligiblePct = parseFloat(m[1]);
    if ((m = line.match(/^Address:\s*(.+)/i))) data.address = m[1].trim();
    // Optional metadata Frontier may pass in. Falls through silently if missing.
    if ((m = line.match(/^(?:Contact|Landholder|Customer)\s*name:\s*(.+)/i))) data.contactName = m[1].trim();
    if ((m = line.match(/^(?:Contact|Landholder|Customer)\s*email:\s*(.+)/i))) data.contactEmail = m[1].trim();
    if ((m = line.match(/^Production systems:\s*(.+)/i))) data.productionSystem = m[1].trim().toLowerCase();
    if ((m = line.match(/^Rainfall:\s*([\d,.]+)\s*mm/i))) data.rainfall = parseFloat(m[1].replace(/,/g, ''));
    if ((m = line.match(/^Soil classes in eligible area:\s*(.+)/i))) data.soilClasses = m[1].split(',').map(s => s.trim());
    if ((m = line.match(/^pH range in eligible area:\s*([\d.]+)\s*-\s*([\d.]+)/i))) {
      data.phMin = parseFloat(m[1]);
      data.phMax = parseFloat(m[2]);
    }
    if ((m = line.match(/^Soil depth range in eligible area:\s*([\d.]+)\s*-\s*([\d.]+)\s*m/i))) {
      data.depthMin = parseFloat(m[1]);
      data.depthMax = parseFloat(m[2]);
    }
  }

  // Derive eligible percentage if not directly stated
  if (!data.eligiblePct && data.totalArea && data.eligibleArea) {
    data.eligiblePct = Math.round((data.eligibleArea / data.totalArea) * 1000) / 10;
  }

  return data;
}

/**
 * Parse horizon_landscape.geojson — zone classification data.
 * Returns { Opportunity: {...}, Stable: {...}, Strength: {...} }
 */
function parseLandscapeGeoJSON(geojson) {
  const stats = {};
  for (const feat of geojson.features) {
    const cls = feat.properties.class;
    stats[cls] = {
      value: feat.properties.class_value,
      median: feat.properties.median,
      mad: feat.properties.mad,
      delta: feat.properties.delta,
      k: feat.properties.k
    };
  }
  return stats;
}

/**
 * Compute property centroid from input.geojson (paddock boundaries).
 * Simple average of all coordinates — sufficient for map centering.
 */
function computeCentroid(geojson) {
  let sumLat = 0, sumLng = 0, count = 0;

  function walkCoords(coords) {
    if (typeof coords[0] === 'number') {
      sumLng += coords[0];
      sumLat += coords[1];
      count++;
      return;
    }
    for (const c of coords) walkCoords(c);
  }

  for (const feat of geojson.features) {
    walkCoords(feat.geometry.coordinates);
  }

  return count > 0
    ? { lat: sumLat / count, lng: sumLng / count }
    : { lat: -25.2744, lng: 133.7751 }; // Australia center fallback
}

/**
 * Extract paddock summary from input.geojson
 */
function parsePaddocks(geojson) {
  return geojson.features.map(f => ({
    title: f.properties.title,
    area: f.properties.area_hectares,
    cropType: f.properties.cropType,
    pastureState: f.properties.pastureState,
    type: f.properties.type
  }));
}

module.exports = { parseMetadata, parseLandscapeGeoJSON, computeCentroid, parsePaddocks };
