"use client";
import { useEffect, useRef, useState, useCallback } from "react";

type Props = {
  className?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  pickupPoints?: { lat: number; lng: number; id?: string }[];
  route?: { lat: number; lng: number }[];
  onPickupPointClick?: (point: { lat: number; lng: number; id?: string }) => void;
};

type RouteResponse = {
  routes: Array<{
    sections: Array<{
      polyline: string;
    }>;
  }>;
};

export default function HereMap({
  className,
  center = { lat: 41.085, lng: 29.01 },
  zoom = 11,
  pickupPoints = [],
  route = [],
  onPickupPointClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const didInit = useRef(false);
  const abortInit = useRef(false);
  const [mapReady, setMapReady] = useState(false);
  const markersRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]);

  // Function to decode polyline from HERE Maps API response
  const decodePolyline = (encoded: string): { lat: number; lng: number }[] => {
    const H = (window as any).H;
    if (!H || !H.geo || !H.geo.LineString) {
      console.warn('HERE Maps SDK not available for polyline decoding');
      return [];
    }
    
    try {
      // Use HERE Maps flexible polyline decoder
      const lineString = H.geo.LineString.fromFlexiblePolyline(encoded);
      const coordinates: { lat: number; lng: number }[] = [];
      
      // Extract coordinates from the LineString
      const latLngAltArray = lineString.getLatLngAltArray();
      for (let i = 0; i < latLngAltArray.length; i += 3) {
        coordinates.push({
          lat: latLngAltArray[i],
          lng: latLngAltArray[i + 1]
        });
      }
      
      return coordinates;
    } catch (error) {
      console.error('Error decoding polyline:', error);
      return [];
    }
  };

  // Function to call HERE Maps routing API
  const calculateRoute = async (waypoints: { lat: number; lng: number }[]) => {
    const apiKey = process.env.NEXT_PUBLIC_HERE_API_KEY;
    if (!apiKey || waypoints.length < 2) return null;

    try {
      const origin = waypoints[0];
      const destination = waypoints[waypoints.length - 1];
      const via = waypoints.slice(1, -1).map(wp => `${wp.lat},${wp.lng}`).join('&via=');

      const url = `https://router.hereapi.com/v8/routes?apikey=${apiKey}&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}${via ? `&via=${via}` : ''}&transportMode=car&return=polyline`;

      const response = await fetch(url);
      const data: RouteResponse = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates: { lat: number; lng: number }[] = [];
        
        route.sections.forEach(section => {
          if (section.polyline) {
            const decoded = decodePolyline(section.polyline);
            coordinates.push(...decoded);
          }
        });
        
        return coordinates;
      } else {
        // If no route data, create simple route connecting waypoints
        console.warn('No route data from API, creating simple connecting route');
        return waypoints;
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      // Return simple route as fallback
      console.log('Creating fallback route connecting waypoints');
      return waypoints;
    }
    
    return null;
  };

  // Function to add pickup point markers
  const addPickupPoints = useCallback(() => {
    console.log("addPickupPoints called - mapReady:", mapReady, "pickupPoints:", pickupPoints);
    
    if (!mapInstanceRef.current || !mapReady) {
      console.log("Map not ready or no map instance");
      return;
    }

    const H = (window as any).H;
    if (!H) {
      console.log("HERE Maps SDK not available");
      return;
    }

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeObject(marker);
    });
    markersRef.current = [];

    console.log(`Adding ${pickupPoints.length} pickup points...`);
    
    // Add new markers
    pickupPoints.forEach((point, index) => {
      console.log(`Adding marker ${index + 1} at:`, point.lat, point.lng);
      const marker = new H.map.Marker(
        { lat: point.lat, lng: point.lng },
        {
          icon: new H.map.Icon(
            `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="white" stroke-width="2"/>
                <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${index + 1}</text>
              </svg>
            `)}`,
            { size: { w: 24, h: 24 } }
          )
        }
      );

      if (onPickupPointClick) {
        marker.addEventListener('tap', () => {
          onPickupPointClick(point);
        });
      }

      mapInstanceRef.current.addObject(marker);
      markersRef.current.push(marker);
    });
    
    console.log(`✅ Successfully added ${markersRef.current.length} markers to map`);
  }, [mapReady, pickupPoints, onPickupPointClick]);

  // Function to calculate bounds for all points
  const calculateBounds = useCallback((routeCoords: { lat: number; lng: number }[], pickupCoords: { lat: number; lng: number }[]) => {
    console.log("calculateBounds called - route points:", routeCoords.length, "pickup points:", pickupCoords.length);
    
    // Filter out invalid coordinates
    const validRouteCoords = routeCoords.filter(point => 
      point && typeof point.lat === 'number' && typeof point.lng === 'number' &&
      !isNaN(point.lat) && !isNaN(point.lng) &&
      point.lat >= -90 && point.lat <= 90 &&
      point.lng >= -180 && point.lng <= 180
    );
    
    const validPickupCoords = pickupCoords.filter(point => 
      point && typeof point.lat === 'number' && typeof point.lng === 'number' &&
      !isNaN(point.lat) && !isNaN(point.lng) &&
      point.lat >= -90 && point.lat <= 90 &&
      point.lng >= -180 && point.lng <= 180
    );
    
    console.log("Valid route coords:", validRouteCoords.length, "Valid pickup coords:", validPickupCoords.length);
    
    const allPoints = [...validRouteCoords, ...validPickupCoords];
    console.log("All valid points:", allPoints);
    
    if (allPoints.length === 0) {
      console.log("No valid points to calculate bounds for");
      return null;
    }

    let minLat = allPoints[0].lat;
    let maxLat = allPoints[0].lat;
    let minLng = allPoints[0].lng;
    let maxLng = allPoints[0].lng;

    allPoints.forEach(point => {
      minLat = Math.min(minLat, point.lat);
      maxLat = Math.max(maxLat, point.lat);
      minLng = Math.min(minLng, point.lng);
      maxLng = Math.max(maxLng, point.lng);
    });

    const bounds = { minLat, maxLat, minLng, maxLng };
    console.log("Calculated bounds:", bounds);
    
    // Ensure bounds are valid (not too small or too large)
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    
    if (latDiff < 0.0001 || lngDiff < 0.0001) {
      console.log("Bounds too small, expanding...");
      const expansion = 0.01; // ~1km expansion
      bounds.minLat -= expansion;
      bounds.maxLat += expansion;
      bounds.minLng -= expansion;
      bounds.maxLng += expansion;
    }
    
    console.log("Final bounds:", bounds);
    return bounds;
  }, []);

  // Function to fit map view to bounds - simplified manual approach
  const fitToBounds = useCallback((bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => {
    console.log("fitToBounds called with bounds:", bounds);
    if (!mapInstanceRef.current || !mapReady) {
      console.log("Map not ready or no map instance");
      return;
    }

    try {
      // Calculate center point
      const centerLat = (bounds.minLat + bounds.maxLat) / 2;
      const centerLng = (bounds.minLng + bounds.maxLng) / 2;
      console.log("Center calculated:", { lat: centerLat, lng: centerLng });

      // Calculate zoom level based on bounds size
      const latDiff = bounds.maxLat - bounds.minLat;
      const lngDiff = bounds.maxLng - bounds.minLng;
      const maxDiff = Math.max(latDiff, lngDiff);
      
      let zoom = 10;
      if (maxDiff > 0.2) zoom = 8;
      else if (maxDiff > 0.1) zoom = 9;
      else if (maxDiff > 0.05) zoom = 10;
      else if (maxDiff > 0.02) zoom = 12;
      else if (maxDiff > 0.01) zoom = 13;
      else zoom = 14;
      
      console.log("Zoom calculated:", zoom, "based on maxDiff:", maxDiff);

      // Apply center and zoom
      mapInstanceRef.current.setCenter({ lat: centerLat, lng: centerLng });
      mapInstanceRef.current.setZoom(zoom);
      
      console.log("✅ Applied center and zoom successfully");
    } catch (error) {
      console.error("Error in fitToBounds:", error);
    }
  }, [mapReady]);

  // Function to draw route polyline
  const drawRoute = useCallback((coordinates: { lat: number; lng: number }[]) => {
    console.log("drawRoute called - coordinates:", coordinates.length, "mapReady:", mapReady);
    
    if (!mapInstanceRef.current || !mapReady || coordinates.length === 0) {
      console.log("Cannot draw route - missing requirements");
      return;
    }

    const H = (window as any).H;
    if (!H) {
      console.log("HERE Maps SDK not available for route drawing");
      return;
    }

    // Clear existing polylines
    polylinesRef.current.forEach(polyline => {
      mapInstanceRef.current.removeObject(polyline);
    });
    polylinesRef.current = [];

    // Create line string
    const lineString = new H.geo.LineString();
    coordinates.forEach(coord => {
      lineString.pushPoint({ lat: coord.lat, lng: coord.lng });
    });

    // Create polyline
    const polyline = new H.map.Polyline(lineString, {
      style: {
        lineWidth: 4,
        strokeColor: '#3B82F6',
        lineDash: [0, 0]
      }
    });

    mapInstanceRef.current.addObject(polyline);
    polylinesRef.current.push(polyline);
    
    console.log(`✅ Successfully added route with ${coordinates.length} points to map`);
  }, [mapReady]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_HERE_API_KEY;
    if (!apiKey) {
      console.warn("HERE Maps API key not found");
      return;
    }

    abortInit.current = false;
    if (didInit.current) return;
    didInit.current = true;

    let resizeHandler: any;

    const addScript = (src: string) =>
      new Promise<void>((res, rej) => {
        if (document.querySelector(`script[src="${src}"]`)) return res();
        const s = document.createElement("script");
        s.src = src;
        s.defer = true;
        s.onload = () => res();
        s.onerror = () => rej(new Error(`Failed to load ${src}`));
        document.head.appendChild(s);
      });

    const addCss = (href: string) => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const l = document.createElement("link");
        l.rel = "stylesheet";
        l.href = href;
        document.head.appendChild(l);
      }
    };

    (async () => {
      addCss("https://js.api.here.com/v3/3.1/mapsjs-ui.css");
      await addScript("https://js.api.here.com/v3/3.1/mapsjs-core.js");
      await addScript("https://js.api.here.com/v3/3.1/mapsjs-service.js");
      await addScript("https://js.api.here.com/v3/3.1/mapsjs-mapevents.js");
      await addScript("https://js.api.here.com/v3/3.1/mapsjs-ui.js");

      if (abortInit.current || !containerRef.current) return;
      if (mapInstanceRef.current) return; // already initialized, don't reinitialize

      const H = (window as any).H;
      const platform = new H.service.Platform({ apikey: apiKey });
      const layers = platform.createDefaultLayers();
      const base = layers?.vector?.normal?.map || layers?.raster?.normal?.map;

      // security: clear any previous remnants
      containerRef.current.innerHTML = "";

      const map = new H.Map(containerRef.current, base, {
        center,
        zoom,
        pixelRatio: window.devicePixelRatio || 1,
      });
      mapInstanceRef.current = map;

      new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
      
      // Check if UI is available before creating
      if (H.ui && H.ui.UI) {
        H.ui.UI.createDefault(map, layers);
      } else {
        console.warn("HERE Maps UI module not loaded, creating map without default UI");
      }

      // resize immediately if container is visible
      map.getViewPort().resize();
      resizeHandler = () => map.getViewPort().resize();
      window.addEventListener("resize", resizeHandler);

      // Set map as ready
      setMapReady(true);
    })().catch(console.error);

    return () => {
      abortInit.current = true;
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.dispose();
        mapInstanceRef.current = null;
      }
      didInit.current = false; // 🔑 reset for Strict Mode remount
    };
  }, []); // Empty dependency array - only run once

  // update view only when center/zoom changes - DISABLED to allow auto-zoom
  // useEffect(() => {
  //   if (mapInstanceRef.current) {
  //     mapInstanceRef.current.setCenter(center);
  //     mapInstanceRef.current.setZoom(zoom);
  //   }
  // }, [center, zoom]);

  // Handle pickup points changes
  useEffect(() => {
    if (mapReady) {
      addPickupPoints();
    }
  }, [addPickupPoints, mapReady]);

  // Handle route changes
  useEffect(() => {
    if (mapReady && route.length > 0) {
      drawRoute(route);
    } else if (mapReady && route.length === 0) {
      // Clear existing polylines when route is empty
      polylinesRef.current.forEach(polyline => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.removeObject(polyline);
        }
      });
      polylinesRef.current = [];
    }
  }, [route, mapReady, drawRoute]);

  // Auto-fit to bounds whenever pickup points or route change - simplified
  useEffect(() => {
    console.log("🔄 Auto-fit useEffect triggered");
    console.log("  - mapReady:", mapReady);
    console.log("  - pickupPoints:", pickupPoints.length, pickupPoints);
    console.log("  - route:", route.length, route.slice(0, 3)); // Show first 3 route points
    
    if (!mapReady) {
      console.log("⏳ Map not ready, skipping");
      return;
    }
    
    // Always try to fit bounds when data changes
    const timeoutId = setTimeout(() => {
      console.log("🎯 Attempting auto-fit...");
      
      const bounds = calculateBounds(route, pickupPoints);
      console.log("📊 Bounds result:", bounds);
      
      if (bounds) {
        console.log("✅ Applying bounds...");
        fitToBounds(bounds);
      } else {
        console.log("❌ No bounds calculated, using default");
        // Default Istanbul view
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({ lat: 41.085, lng: 29.01 });
          mapInstanceRef.current.setZoom(11);
          console.log("🏠 Set default Istanbul view");
        }
      }
    }, 300); // Reduced timeout

    return () => clearTimeout(timeoutId);
  }, [mapReady, pickupPoints, route]); // Simple dependencies

  // Expose calculateRoute function for external use
  useEffect(() => {
    if (mapInstanceRef.current) {
      (mapInstanceRef.current as any).calculateRoute = calculateRoute;
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={className ?? "h-[420px] w-full rounded-md border"}
    />
  );
}