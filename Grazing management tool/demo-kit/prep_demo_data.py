#!/usr/bin/env python3
"""
prep_demo_data.py — Grazing Infrastructure Planner: demo data precompute.

Takes one property's real geometry + HORIZON heat map and emits demo_bundle.json
with parcel rankings and precomputed equal-area cell splits (N=2..12) so the
prototype swaps geometry instantly instead of computing it live.

Rules encoded (Hobbs, infrastructure_planning_principles.docx):
  - Parcels ranked hot -> cold on mean productivity gradient (S1).
  - Splits are straight cuts perpendicular to each parcel's long axis,
    iteratively positioned for equal areas (S3: cell count is the lever).
  - In COLD-band parcels, if a zone boundary crosses the parcel, the weakest
    zone core is isolated as its own recovery cell first (S4), and the
    remainder is split equally.

Inputs (same directory, or pass --indir):
  parcels.geojson   REQUIRED. Parcel polygons for the property (EPSG:4326).
                    Any properties are carried through; 'id'/'name' used if present.
  heatmap.png       REQUIRED unless zones.geojson has a 'score' property.
                    The Carbon Gradient render (red=low ... green=high).
  bounds.json       REQUIRED with heatmap.png:
                    {"west":..,"south":..,"east":..,"north":..}  (EPSG:4326)
  zones.geojson     OPTIONAL. Zone polygons; if present with a numeric 'score'
                    property (higher = more productive) they are used for
                    ranking and for S4 recovery-cell snapping.

Output:
  demo_bundle.json  Property meta + ranked parcels + splits[N] per parcel.
                    All geometry EPSG:4326, ready for the web prototype.

Usage:
  python3 prep_demo_data.py --indir ./property_data --out demo_bundle.json
  python3 prep_demo_data.py --selftest          # synthetic property, no inputs

Deps: shapely>=2, pyproj, pillow, numpy   (no GDAL required)
"""

import argparse, json, math, os, sys
import numpy as np
from PIL import Image
from shapely.geometry import shape, mapping, Polygon, MultiPolygon, LineString, box
from shapely.ops import transform as shp_transform, unary_union
from shapely.affinity import rotate
from pyproj import Transformer

MAX_CELLS = 12
METRIC_CRS = "EPSG:3577"   # GDA94 / Australian Albers (equal-area, metres)
WGS84 = "EPSG:4326"

TO_M = Transformer.from_crs(WGS84, METRIC_CRS, always_xy=True).transform
TO_DEG = Transformer.from_crs(METRIC_CRS, WGS84, always_xy=True).transform


# ---------------------------------------------------------------- helpers

def load_geojson(path):
    with open(path) as f:
        gj = json.load(f)
    feats = gj["features"] if gj.get("type") == "FeatureCollection" else [gj]
    out = []
    for i, ft in enumerate(feats):
        geom = shape(ft["geometry"])
        if isinstance(geom, MultiPolygon):
            geom = max(geom.geoms, key=lambda g: g.area)  # keep dominant ring per feature
        props = ft.get("properties") or {}
        props.setdefault("id", props.get("name", f"parcel-{i+1}"))
        out.append((geom, props))
    return out


def heatmap_score_sampler(png_path, bounds_path):
    """Return f(lon, lat) -> productivity score 0..1 from the heat map colours.

    Ramp assumption: HORIZON Carbon Gradient runs red (low) -> yellow -> green
    (high). Score = green dominance: (G - R) normalised to 0..1. Robust to the
    exact palette without needing the original colour stops.
    """
    img = np.asarray(Image.open(png_path).convert("RGBA"), dtype=float)
    with open(bounds_path) as f:
        b = json.load(f)
    h, w = img.shape[:2]

    def score(lon, lat):
        x = (lon - b["west"]) / (b["east"] - b["west"]) * (w - 1)
        y = (b["north"] - lat) / (b["north"] - b["south"]) * (h - 1)
        if not (0 <= x < w and 0 <= y < h):
            return None
        px = img[int(y), int(x)]
        if px[3] < 10:                      # transparent = outside render
            return None
        r, g = px[0], px[1]
        return float(np.clip((g - r) / 255.0 * 0.5 + 0.5, 0.0, 1.0))

    return score


def mean_parcel_score(parcel_deg, sampler, n=600):
    """Mean score over ~n sample points inside the parcel (grid sampling)."""
    minx, miny, maxx, maxy = parcel_deg.bounds
    steps = max(8, int(math.sqrt(n)))
    xs = np.linspace(minx, maxx, steps)
    ys = np.linspace(miny, maxy, steps)
    vals = []
    from shapely.geometry import Point
    from shapely.prepared import prep
    prepped = prep(parcel_deg)
    for x in xs:
        for y in ys:
            if prepped.contains(Point(x, y)):
                s = sampler(x, y)
                if s is not None:
                    vals.append(s)
    return float(np.mean(vals)) if vals else 0.5


def long_axis_angle(poly_m):
    """Angle (degrees, CCW from +x) of the minimum rotated rectangle's long axis."""
    mrr = poly_m.minimum_rotated_rectangle
    coords = list(mrr.exterior.coords)[:4]
    best_len, best_ang = -1.0, 0.0
    for a, b in zip(coords, coords[1:] + coords[:1]):
        dx, dy = b[0] - a[0], b[1] - a[1]
        L = math.hypot(dx, dy)
        if L > best_len:
            best_len, best_ang = L, math.degrees(math.atan2(dy, dx))
    return best_ang


def split_equal_area(poly_m, n):
    """Split poly into n cells of ~equal area with straight cuts perpendicular
    to the long axis. Returns (cells, fence_lines) in metric CRS.

    Method: rotate so the long axis lies on +x; sweep a vertical half-plane
    left->right; binary-search the x of each cut so cumulative area == k/n;
    cells are successive slab intersections; fences are the cut segments
    clipped to the polygon. Rotate everything back at the end.
    """
    if n <= 1:
        return [poly_m], []
    ang = long_axis_angle(poly_m)
    origin = poly_m.centroid
    rot = rotate(poly_m, -ang, origin=origin)
    minx, miny, maxx, maxy = rot.bounds
    pad = (maxy - miny) * 0.05 + 1.0
    total = rot.area

    def area_left_of(x):
        return rot.intersection(box(minx - 1, miny - pad, x, maxy + pad)).area

    cuts = []
    for k in range(1, n):
        target, lo, hi = total * k / n, minx, maxx
        for _ in range(26):                       # ~1e-8 relative precision — ample
            mid = (lo + hi) / 2
            if area_left_of(mid) < target:
                lo = mid
            else:
                hi = mid
        cuts.append((lo + hi) / 2)

    edges = [minx - 1] + cuts + [maxx + 1]
    cells, fences = [], []
    for a, b in zip(edges[:-1], edges[1:]):
        cell = rot.intersection(box(a, miny - pad, b, maxy + pad))
        if not cell.is_empty and cell.area > 1.0:
            cells.append(cell)
    for x in cuts:
        seg = rot.intersection(LineString([(x, miny - pad), (x, maxy + pad)]))
        if not seg.is_empty:
            fences.append(seg)

    back = lambda g: rotate(g, ang, origin=origin)
    return [back(c) for c in cells], [back(f) for f in fences]


def isolate_recovery_cell(poly_m, weakest_zone_m):
    """S4: carve the weakest-zone core out of a cold parcel as a dedicated
    recovery cell. Returns (recovery_cell, remainder) or (None, poly_m)."""
    core = poly_m.intersection(weakest_zone_m)
    if core.is_empty:
        return None, poly_m
    if isinstance(core, MultiPolygon):
        core = max(core.geoms, key=lambda g: g.area)
    frac = core.area / poly_m.area
    if frac < 0.08 or frac > 0.92:      # too small to fence / basically whole parcel
        return None, poly_m
    remainder = poly_m.difference(core)
    if isinstance(remainder, MultiPolygon):
        remainder = max(remainder.geoms, key=lambda g: g.area)
    return core, remainder


# ---------------------------------------------------------------- logic layer
# Implementability constraints (Dylan 2026-07-08: "it has to be logical --
# fencelines must be something a farmer could actually implement").
MIN_CELL_WIDTH_M = 120     # narrower than this and stock flow / machinery fail
MAX_ASPECT = 6.0           # no spaghetti cells
MIN_CELL_HA = 6.0          # absolute floor regardless of unit size

def validate_cells(cells_m, fences_m):
    """Hard buildability checks. Returns (ok, metrics|reason).
    - every cell contiguous (a cut through a concave unit can strand a
      disconnected fragment -- unbuildable as one paddock)
    - min working width (short side of min rotated rect)
    - aspect ratio cap
    - min area floor
    Metrics: total new fence metres, min cell width, worst aspect."""
    total_fence_m = sum(f.length for f in fences_m)
    min_w, worst_ar = float("inf"), 0.0
    for c in cells_m:
        if isinstance(c, MultiPolygon):
            return False, "disconnected cell"
        if c.area / 10_000.0 < MIN_CELL_HA:
            return False, "cell below area floor"
        mrr = c.minimum_rotated_rectangle
        xs = list(mrr.exterior.coords)[:4]
        d1 = math.dist(xs[0], xs[1]); d2 = math.dist(xs[1], xs[2])
        w, L = min(d1, d2), max(d1, d2)
        if w < MIN_CELL_WIDTH_M:
            return False, "cell too narrow"
        ar = L / w if w else 99
        min_w, worst_ar = min(min_w, w), max(worst_ar, ar)
        if ar > MAX_ASPECT:
            return False, "aspect ratio"
    return True, {"fence_m": round(total_fence_m), "min_cell_width_m": round(min_w),
                  "worst_aspect": round(worst_ar, 1)}


def geoms_to_geojson(geoms):
    return [mapping(shp_transform(TO_DEG, g)) for g in geoms]


def split_buildable(poly_m, n):
    """Try several cut orientations; return the first split that passes
    validate_cells, preferring the long-axis-perpendicular default.
    Returns (cells, fences, metrics) or (None, None, reason)."""
    base = long_axis_angle(poly_m)
    last_reason = "no valid orientation"
    for delta in (0, 90, 45, -45, 30, -30, 60, -60):
        cells, fences = split_equal_area_at(poly_m, n, base + delta)
        ok, res = validate_cells(cells, fences)
        if ok:
            return cells, fences, res
        last_reason = res
    return None, None, last_reason


def split_equal_area_at(poly_m, n, ang):
    """split_equal_area with an explicit cut-perpendicular angle."""
    if n <= 1:
        return [poly_m], []
    origin = poly_m.centroid
    rot = rotate(poly_m, -ang, origin=origin)
    minx, miny, maxx, maxy = rot.bounds
    pad = (maxy - miny) * 0.05 + 1.0
    total = rot.area

    def area_left_of(x):
        return rot.intersection(box(minx - 1, miny - pad, x, maxy + pad)).area

    cuts = []
    for k in range(1, n):
        target, lo, hi = total * k / n, minx, maxx
        for _ in range(26):
            mid = (lo + hi) / 2
            if area_left_of(mid) < target:
                lo = mid
            else:
                hi = mid
        cuts.append((lo + hi) / 2)

    edges = [minx - 1] + cuts + [maxx + 1]
    cells, fences = [], []
    for a, b in zip(edges[:-1], edges[1:]):
        cell = rot.intersection(box(a, miny - pad, b, maxy + pad))
        if not cell.is_empty and cell.area > 1.0:
            cells.append(cell)
    for x in cuts:
        seg = rot.intersection(LineString([(x, miny - pad), (x, maxy + pad)]))
        if not seg.is_empty:
            fences.append(seg)
    back = lambda g: rotate(g, ang, origin=origin)
    return [back(c) for c in cells], [back(f) for f in fences]


# ---------------------------------------------------------------- pipeline

def build_bundle(parcels, sampler=None, zones=None, property_name="Demo Property"):
    # 1. score + rank parcels hot -> cold
    scored = []
    for geom_deg, props in parcels:
        if zones and all("score" in z[1] for z in zones):
            # area-weighted zone score
            num = den = 0.0
            for zgeom, zprops in zones:
                inter = geom_deg.intersection(zgeom)
                if not inter.is_empty:
                    num += inter.area * float(zprops["score"])
                    den += inter.area
            s = num / den if den else 0.5
        elif sampler:
            s = mean_parcel_score(geom_deg, sampler)
        else:
            raise SystemExit("Need heatmap.png+bounds.json or zones.geojson with 'score'.")
        scored.append((geom_deg, props, s))

    scored.sort(key=lambda t: -t[2])
    third = max(1, round(len(scored) / 3))
    bands = ["hot"] * third + ["mid"] * (len(scored) - 2 * third) + ["cold"] * third
    bands = bands[: len(scored)]

    weakest_zone_m = None
    if zones and all("score" in z[1] for z in zones):
        wz = min(zones, key=lambda z: float(z[1]["score"]))
        weakest_zone_m = shp_transform(TO_M, wz[0])

    # 2. per-parcel precomputed splits
    out_parcels = []
    for rank, ((geom_deg, props, s), band) in enumerate(zip(scored, bands), start=1):
        poly_m = shp_transform(TO_M, geom_deg)
        area_ha = poly_m.area / 10_000.0
        splits = {}
        for n in range(2, MAX_CELLS + 1):
            cells_m, fences_m = [], []
            if band == "cold" and weakest_zone_m is not None:
                core, remainder = isolate_recovery_cell(poly_m, weakest_zone_m)
                if core is not None and n >= 2:
                    rc, rf = split_equal_area(remainder, n - 1)
                    cells_m = [core] + rc
                    fences_m = rf  # zone edge itself is the core's fence; render from cell borders
                else:
                    cells_m, fences_m = split_equal_area(poly_m, n)
            else:
                cells_m, fences_m = split_equal_area(poly_m, n)
            splits[str(n)] = {
                "cells": geoms_to_geojson(cells_m),
                "fences": geoms_to_geojson(fences_m),
                "cell_areas_ha": [round(c.area / 10_000.0, 1) for c in cells_m],
                "recovery_cell_index": 0 if (band == "cold" and weakest_zone_m is not None
                                             and len(cells_m) == n) else None,
            }
        out_parcels.append({
            "id": str(props.get("id")),
            "name": str(props.get("name", props.get("id"))),
            "rank": rank,                      # 1 = hottest
            "band": band,
            "score": round(s, 4),
            "area_ha": round(area_ha, 1),
            "geometry": mapping(geom_deg),
            "splits": splits,
        })

    total_ha = sum(p["area_ha"] for p in out_parcels)
    return {
        "property": {"name": property_name, "total_area_ha": round(total_ha, 1),
                     "parcel_count": len(out_parcels)},
        "rules": {
            "sequence": ["hot", "mid", "cold"],
            "phases": [
                {"name": "Establishment", "band": "hot", "years": "1-3"},
                {"name": "Expansion", "band": "mid", "years": "4-6"},
                {"name": "Maturity", "band": "cold", "years": "7-10"},
            ],
            "rest_target_days": [60, 120],
            "rest_block_pct": [20, 30],
            "rest_days_formula": "rest = (total_cells_in_rotation - mobs) * graze_days_per_cell",
        },
        "parcels": out_parcels,
    }


# ---------------------------------------------------------------- selftest

def selftest():
    """Synthetic 3-parcel property + synthetic ramp heat map. Asserts:
    equal areas (<2% spread), fence counts, ranking order, recovery cell."""
    print("SELFTEST: building synthetic property...")
    # three adjoining parcels ~ SW NSW, sizes/shapes varied, one L-shaped
    p1 = Polygon([(146.00, -35.00), (146.03, -35.00), (146.03, -35.02), (146.00, -35.02)])
    p2 = Polygon([(146.03, -35.00), (146.06, -35.00), (146.06, -35.013), (146.045, -35.013),
                  (146.045, -35.02), (146.03, -35.02)])                       # L-shape
    p3 = Polygon([(146.00, -35.02), (146.06, -35.02), (146.06, -35.035), (146.00, -35.035)])
    parcels = [(p1, {"id": "P1"}), (p2, {"id": "P2"}), (p3, {"id": "P3"})]

    # synthetic gradient: green (high) in the west, red (low) in the east+south
    def sampler(lon, lat):
        t = 1.0 - ((lon - 146.00) / 0.06 * 0.6 + (-(lat + 35.00)) / 0.035 * 0.4)
        return float(np.clip(t, 0, 1))

    zones = [(box(146.00, -35.035, 146.06, -35.027), {"score": 0.1, "zone": "opportunity"}),
             (box(146.00, -35.027, 146.06, -35.013), {"score": 0.5, "zone": "reference"}),
             (box(146.00, -35.013, 146.06, -35.00), {"score": 0.9, "zone": "strength"})]

    bundle = build_bundle(parcels, sampler=sampler, zones=None, property_name="Selftest Station")

    ranks = {p["id"]: p["rank"] for p in bundle["parcels"]}
    assert ranks["P1"] < ranks["P3"], f"west parcel should outrank south parcel: {ranks}"
    for p in bundle["parcels"]:
        for n in range(2, MAX_CELLS + 1):
            sp = p["splits"][str(n)]
            areas = sp["cell_areas_ha"]
            assert len(areas) == n, f"{p['id']} N={n}: got {len(areas)} cells"
            assert len(sp["fences"]) == n - 1, f"{p['id']} N={n}: fence count"
            spread = (max(areas) - min(areas)) / (sum(areas) / n)
            assert spread < 0.02, f"{p['id']} N={n}: area spread {spread:.3%}"
            total_split = sum(areas)
            assert abs(total_split - p["area_ha"]) / p["area_ha"] < 0.01, \
                f"{p['id']} N={n}: area not conserved"
    # recovery-cell path: rerun with zones so cold parcel gets a carved core
    bundle_z = build_bundle(parcels, sampler=None, zones=zones, property_name="Selftest Station")
    cold = [p for p in bundle_z["parcels"] if p["band"] == "cold"][0]
    rec = cold["splits"]["4"]["recovery_cell_index"]
    assert rec == 0, f"cold parcel should carve a recovery cell, got {rec}"
    print(f"SELFTEST PASSED — {bundle['property']['parcel_count']} parcels, "
          f"{bundle['property']['total_area_ha']} ha, splits N=2..{MAX_CELLS}, "
          f"equal-area spread <2%, recovery cell OK")
    return bundle


# ---------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--indir", default=".")
    ap.add_argument("--out", default="demo_bundle.json")
    ap.add_argument("--name", default="Demo Property")
    ap.add_argument("--selftest", action="store_true")
    args = ap.parse_args()

    if args.selftest:
        bundle = selftest()
        with open(args.out, "w") as f:
            json.dump(bundle, f)
        print(f"wrote {args.out} ({os.path.getsize(args.out)//1024} KB)")
        return

    parcels = load_geojson(os.path.join(args.indir, "parcels.geojson"))
    zones_path = os.path.join(args.indir, "zones.geojson")
    zones = load_geojson(zones_path) if os.path.exists(zones_path) else None
    sampler = None
    hm, bd = os.path.join(args.indir, "heatmap.png"), os.path.join(args.indir, "bounds.json")
    if os.path.exists(hm) and os.path.exists(bd):
        sampler = heatmap_score_sampler(hm, bd)

    bundle = build_bundle(parcels, sampler=sampler, zones=zones, property_name=args.name)
    with open(args.out, "w") as f:
        json.dump(bundle, f)
    print(f"wrote {args.out}: {bundle['property']['parcel_count']} parcels, "
          f"{bundle['property']['total_area_ha']} ha, splits N=2..{MAX_CELLS}")


if __name__ == "__main__":
    main()
