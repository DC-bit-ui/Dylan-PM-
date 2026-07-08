#!/usr/bin/env python3
"""
adapt_horizon_export.py — turn a raw HORIZON export (input/classified/
horizon_landscape geojson + map render) into demo_bundle.json for the
Grazing Infrastructure Planner prototype.

Handles the real export shape discovered on Farm 217 (2026-07-08):
  - zones arrive as fragmented raster-derived MultiPolygons per class
    (Opportunity=1, Stable=2, Strength=3) in horizon_landscape.geojson
  - no internal paddock/parcel boundaries exist in the export
  - map.bounds.json is Leaflet-style [[southLat,westLon],[northLat,eastLon]]

So: planning units are DERIVED from zone geometry — each class dissolved
(+buf/-buf to heal pixel fragmentation), simplified, exploded to contiguous
blocks, small slivers dropped. Bands come from the zone class directly:
Strength=hot, Stable=mid, Opportunity=cold. Splits N=2..12 per unit reuse
prep_demo_data.split_equal_area.

Usage:
  python3 adapt_horizon_export.py --indir /path/to/export --name "Farm 217" \
      --out demo_bundle.json [--min-ha 15] [--render check.png]
"""

import argparse, json, math, re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shapely.geometry import shape, mapping, MultiPolygon, Polygon
from shapely.ops import transform as shp_transform, unary_union
from prep_demo_data import (TO_M, TO_DEG, split_buildable, geoms_to_geojson,
                            MAX_CELLS)

BAND_BY_CLASS = {"Strength": "hot", "Stable": "mid", "Opportunity": "cold"}
CLASS_ORDER = {"Strength": 3, "Stable": 2, "Opportunity": 1}
HEAL_BUFFER_M = 60      # +/- buffer to merge raster fragments
SIMPLIFY_M = 30         # smooth pixel staircases for clean fence aesthetics
MIN_HOLE_HA = 5.0       # fill holes smaller than this — fences don't dodge 1-ha gaps
HA_PER_CELL_MIN = 8.0   # cap cell count so cells stay >= ~8 ha at this scale


def clean_unit(p):
    """Fill small holes + simplify — makes split geometry fast and fences clean."""
    keep = [r for r in p.interiors if Polygon(r).area / 10_000.0 >= MIN_HOLE_HA]
    return Polygon(p.exterior, keep).simplify(15).buffer(0)


def load_export(indir):
    def gj(name):
        p = os.path.join(indir, name)
        return json.load(open(p)) if os.path.exists(p) else None

    boundary = shape(gj("input.geojson")["features"][0]["geometry"])
    eligible_gj = gj("classified.geojson")
    eligible = shape(eligible_gj["features"][0]["geometry"]) if eligible_gj else boundary
    zones = []
    for ft in gj("horizon_landscape.geojson")["features"]:
        zones.append((shape(ft["geometry"]), ft["properties"]))
    meta = {}
    mpath = os.path.join(indir, "metadata.txt")
    if os.path.exists(mpath):
        txt = open(mpath).read()
        for key, pat in [("project", r"Project name:\s*(.+)"),
                         ("total_ha", r"Total input area:\s*([\d.]+)"),
                         ("eligible_ha", r"Eligible area:\s*([\d.]+)"),
                         ("address", r"Address:\s*(.+)"),
                         ("rainfall_mm", r"Rainfall:\s*(\d+)")]:
            m = re.search(pat, txt)
            if m:
                meta[key] = m.group(1).strip()
    bounds = None
    bpath = os.path.join(indir, "map.bounds.json")
    if os.path.exists(bpath):
        (s, w), (n, e) = json.load(open(bpath))
        bounds = {"west": w, "south": s, "east": e, "north": n}
    return boundary, eligible, zones, meta, bounds


def derive_units(eligible, zones, min_ha):
    """Partition the eligible area into clean planning units per zone class.

    Method: majority vote on a 120 m grid — each grid square is assigned to
    the raw class that wins a 5-point sample (ties go to the weaker class,
    conservative). Squares union into class regions, which are simplified,
    exploded to contiguous blocks, hole-filled and area-filtered. No class
    can steal another's territory; fine interleaving resolves at ~1.4 ha
    scale, which is fence-planning resolution, not pixel resolution.
    Returns [(poly_m, class_name)] in metric CRS."""
    from shapely.prepared import prep
    from shapely.geometry import box as sbox, Point
    eligible_m = shp_transform(TO_M, eligible)
    raw = {p["class"]: shp_transform(TO_M, g) for g, p in zones}
    prepped = {c: prep(g) for c, g in raw.items()}
    order = sorted(raw, key=lambda c: CLASS_ORDER[c])          # weakest first

    G = 120.0
    minx, miny, maxx, maxy = eligible_m.bounds
    elig_prep = prep(eligible_m)
    squares = {c: [] for c in raw}
    y = miny
    while y < maxy:
        x = minx
        while x < maxx:
            cx, cy = x + G / 2, y + G / 2
            if elig_prep.intersects(Point(cx, cy)):
                pts = [(cx, cy), (x + G*0.25, y + G*0.25), (x + G*0.75, y + G*0.25),
                       (x + G*0.25, y + G*0.75), (x + G*0.75, y + G*0.75)]
                votes = {c: sum(1 for p in pts if prepped[c].contains(Point(p))) for c in raw}
                best = max(order, key=lambda c: (votes[c], -CLASS_ORDER[c]))
                if votes[best] > 0:
                    squares[best].append(sbox(x, y, x + G, y + G))
            x += G
        y += G

    units = []
    for cls in order:
        if not squares[cls]:
            continue
        region = unary_union(squares[cls]).intersection(eligible_m)
        region = region.buffer(G/2).buffer(-G/2).simplify(SIMPLIFY_M)
        # NOTE: neighbouring class regions may overlap by ~1 heal-seam (60 m).
        # Deliberate: trimming either direction guts a band on interleaved
        # country. Render z-order cold->mid->hot; treat area sums as approx.
        polys = list(region.geoms) if isinstance(region, MultiPolygon) else [region]
        for p in polys:
            if isinstance(p, Polygon) and p.area / 10_000.0 >= min_ha:
                cu = clean_unit(p)
                if isinstance(cu, MultiPolygon):
                    cu = max(cu.geoms, key=lambda g: g.area)
                units.append((cu, cls))
    return units


def build(indir, name, min_ha):
    boundary, eligible, zones, meta, bounds = load_export(indir)
    units = derive_units(eligible, zones, min_ha)
    if not units:
        raise SystemExit("No planning units >= min-ha derived; lower --min-ha.")

    # rank: class value desc, then area desc within class
    units.sort(key=lambda u: (-CLASS_ORDER[u[1]], -u[0].area))
    letters = {}
    out_units = []
    covered = 0.0
    for rank, (poly_m, cls) in enumerate(units, 1):
        letters[cls] = letters.get(cls, 0) + 1
        label = f"{cls} {chr(64 + letters[cls])}"
        area_ha = poly_m.area / 10_000.0
        covered += area_ha
        max_n = int(min(MAX_CELLS, max(2, area_ha // HA_PER_CELL_MIN)))
        splits = {}
        for n in range(2, max_n + 1):
            cells, fences, res = split_buildable(poly_m, n)
            if cells is None:
                continue           # no buildable orientation at this N
            splits[str(n)] = {
                "cells": geoms_to_geojson(cells),
                "fences": geoms_to_geojson(fences),
                "cell_areas_ha": [round(c.area / 10_000.0, 1) for c in cells],
                "recovery_cell_index": None,
                "logic": res,      # fence_m, min_cell_width_m, worst_aspect
            }
        if not splits:
            print(f"  [logic] {label}: no buildable split even at N=2 -- unit ships view-only")
        out_units.append({
            "id": f"unit-{rank}", "name": label, "rank": rank,
            "band": BAND_BY_CLASS[cls], "zone_class": cls,
            "score": CLASS_ORDER[cls] / 3.0,
            "area_ha": round(area_ha, 1),
            "geometry": mapping(shp_transform(TO_DEG, poly_m)),
            "splits": splits,
        })

    eligible_ha = float(meta.get("eligible_ha", covered))
    bundle = {
        "property": {
            "name": name or meta.get("project", "Property"),
            "address": meta.get("address"),
            "rainfall_mm": meta.get("rainfall_mm"),
            "total_area_ha": float(meta.get("total_ha", 0)) or None,
            "eligible_area_ha": eligible_ha,
            "planned_area_ha": round(covered, 1),
            "planned_coverage_pct": round(covered / eligible_ha * 100, 1),
            "unit_count": len(out_units),
            "units_note": ("Planning units derived from HORIZON zone classes via "
                           "120m majority-vote grid (no internal fences in "
                           "export). Strength=hot, Stable=mid, Opportunity=cold. "
                           "Units may overlap ~60m at heal seams - render "
                           "z-order cold under hot; area totals approximate."),
        },
        "map": {"image": "map.png", "bounds": bounds},
        "boundary": mapping(boundary),
        "eligible_area": mapping(eligible),
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
        "parcels": out_units,   # key kept as 'parcels' for prototype compatibility
    }
    return bundle


def render(bundle, out_png, n_show=6):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from matplotlib.patches import Polygon as MP
    band_col = {"hot": "#2D6A4F", "mid": "#F59E0B", "cold": "#C2703D"}
    fig, axes = plt.subplots(1, 2, figsize=(16, 8))
    for ax, N in zip(axes, [1, n_show]):
        bnd = bundle["boundary"]
        rings = bnd["coordinates"] if bnd["type"] == "Polygon" else [r for p in bnd["coordinates"] for r in p]
        for ring in rings:
            xs, ys = zip(*ring)
            ax.plot(xs, ys, color="#EF4444", lw=1.4)
        for u in bundle["parcels"]:
            geoms = ([u["geometry"]["coordinates"]] if u["geometry"]["type"] == "Polygon"
                     else u["geometry"]["coordinates"])
            if N == 1:
                for poly in geoms:
                    ax.add_patch(MP(poly[0], closed=True, facecolor=band_col[u["band"]],
                                    alpha=0.45, edgecolor="#1A2B3C", lw=0.8))
            else:
                if not u["splits"]:
                    continue
                key = str(N) if str(N) in u["splits"] else max(u["splits"], key=int)
                for ci, cell in enumerate(u["splits"][key]["cells"]):
                    polys = [cell["coordinates"]] if cell["type"] == "Polygon" else cell["coordinates"]
                    for rings in polys:
                        ax.add_patch(MP(rings[0], closed=True, facecolor=band_col[u["band"]],
                                        alpha=0.3 + 0.1 * (ci % 3), edgecolor="#1A2B3C", lw=0.9))
        ax.set_title(f"{bundle['property']['name']} — " +
                     ("planning units (banded)" if N == 1 else f"every unit at N={N} cells"))
        ax.set_aspect("equal"); ax.autoscale(); ax.axis("off")
    plt.tight_layout(); plt.savefig(out_png, dpi=110, bbox_inches="tight")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--indir", required=True)
    ap.add_argument("--name", default=None)
    ap.add_argument("--out", default="demo_bundle.json")
    ap.add_argument("--min-ha", type=float, default=15.0)
    ap.add_argument("--render", default=None)
    args = ap.parse_args()

    bundle = build(args.indir, args.name, args.min_ha)
    with open(args.out, "w") as f:
        json.dump(bundle, f)
    p = bundle["property"]
    print(f"wrote {args.out}: {p['name']} — {p['unit_count']} units, "
          f"{p['planned_area_ha']} ha planned of {p['eligible_area_ha']} ha eligible "
          f"({p['planned_coverage_pct']}%)")
    for u in bundle["parcels"]:
        ns = sorted(map(int, u["splits"].keys()))
        opts = ",".join(map(str, ns)) if ns else "view-only"
        print(f"  #{u['rank']:>2} {u['name']:<14} {u['band']:<5} {u['area_ha']:>7.1f} ha  N: {opts}")
    if args.render:
        render(bundle, args.render)
        print(f"rendered {args.render}")


if __name__ == "__main__":
    main()
