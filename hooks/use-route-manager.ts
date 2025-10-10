import { useState, useCallback } from 'react';

export interface PickupPoint {
  lat: number;
  lng: number;
  id?: string;
  name?: string;
}

export interface RouteManager {
  pickupPoints: PickupPoint[];
  route: { lat: number; lng: number }[];
  addPickupPoint: (point: PickupPoint) => void;
  removePickupPoint: (id: string) => void;
  updatePickupPoint: (id: string, point: Partial<PickupPoint>) => void;
  clearPickupPoints: () => void;
  setRoute: (route: { lat: number; lng: number }[]) => void;
  clearRoute: () => void;
  calculateRoute: (waypoints: PickupPoint[]) => Promise<{ lat: number; lng: number }[] | null>;
}

export const useRouteManager = (): RouteManager => {
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [route, setRoute] = useState<{ lat: number; lng: number }[]>([]);

  const addPickupPoint = useCallback((point: PickupPoint) => {
    setPickupPoints(prev => [...prev, { ...point, id: point.id || `point-${Date.now()}` }]);
  }, []);

  const removePickupPoint = useCallback((id: string) => {
    setPickupPoints(prev => prev.filter(point => point.id !== id));
  }, []);

  const updatePickupPoint = useCallback((id: string, updates: Partial<PickupPoint>) => {
    setPickupPoints(prev => 
      prev.map(point => 
        point.id === id ? { ...point, ...updates } : point
      )
    );
  }, []);

  const clearPickupPoints = useCallback(() => {
    setPickupPoints([]);
  }, []);

  const clearRoute = useCallback(() => {
    setRoute([]);
  }, []);

  const calculateRoute = useCallback(async (waypoints: PickupPoint[]): Promise<{ lat: number; lng: number }[] | null> => {
    const apiKey = process.env.NEXT_PUBLIC_HERE_API_KEY;
    if (!apiKey || waypoints.length < 2) return null;

    try {
      const origin = waypoints[0];
      const destination = waypoints[waypoints.length - 1];
      const via = waypoints.slice(1, -1).map(wp => `${wp.lat},${wp.lng}`).join('&via=');

      const url = `https://router.hereapi.com/v8/routes?apikey=${apiKey}&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}${via ? `&via=${via}` : ''}&transportMode=car&return=polyline`;

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates: { lat: number; lng: number }[] = [];
        
        route.sections.forEach((section: any) => {
          if (section.polyline) {
            const decoded = decodePolyline(section.polyline);
            coordinates.push(...decoded);
          }
        });
        
        return coordinates;
      } else {
        // If no route data, create simple route connecting waypoints
        console.warn('No route data from API, creating simple connecting route');
        return createSimpleRoute(waypoints);
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      // Return simple route as fallback
      console.log('Creating fallback route connecting waypoints');
      return createSimpleRoute(waypoints);
    }
    
    return null;
  }, []);

  return {
    pickupPoints,
    route,
    addPickupPoint,
    removePickupPoint,
    updatePickupPoint,
    clearPickupPoints,
    setRoute,
    clearRoute,
    calculateRoute,
  };
};

// Helper function to create a simple route by connecting waypoints
const createSimpleRoute = (waypoints: PickupPoint[]): { lat: number; lng: number }[] => {
  return waypoints.map(wp => ({ lat: wp.lat, lng: wp.lng }));
};

// Helper function to decode polyline from HERE Maps API response
const decodePolyline = (encoded: string): { lat: number; lng: number }[] => {
  try {
    const H = (window as any).H;
    if (H && H.geo && H.geo.LineString) {
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
    } else {
      // Fallback: return empty coordinates and log warning
      console.warn('HERE Maps SDK not available for polyline decoding');
      return [];
    }
  } catch (error) {
    console.error('Error decoding polyline:', error);
    // Return empty array instead of fallback route to avoid infinite recursion
    return [];
  }
};
