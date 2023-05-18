import bboxPolygon from '@turf/bbox-polygon';

/**
 * Select the geometry to use for widget calculation and data filtering.
 * If a spatial filter (mask) is set, use the mask otherwise use the current viewport.
 * Since it's possible that no mask and no viewport is set, return null in this case.
 *
 * @typedef { import('geojson').Polygon | import('geojson').MultiPolygon } Geometry
 * @typedef { import('../types').Viewport? } Viewport
 *
 * @param { Viewport? } viewport viewport [minX, minY, maxX, maxY], if any
 * @param { Geometry? } geometry the active spatial filter (mask), if any
 * @returns { Geometry? } the geometry to use for filtering
 */
export function getGeometryToIntersect(viewport, geometry) {
  return geometry && geometry.coordinates
    ? geometry
    : Array.isArray(viewport) && viewport.length === 4
    ? bboxPolygon(viewport).geometry
    : null;
}

/**
 * Check if a viewport is large enough to represent a global coverage.
 * In this case the spatial filter parameter for widget calculation
 * can be removed.
 *
 * @param { import('../types').Viewport? } viewport
 * @returns { boolean }
 */
export function isGlobalViewport(viewport) {
  if (viewport) {
    const [minx, miny, maxx, maxy] = viewport;
    return maxx - minx > 179.5 * 2 && maxy - miny > 85.05 * 2;
  }
  return false;
}