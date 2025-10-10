"use client";
import { useState } from 'react';
import HereMap from './here-map';
import { useRouteManager, PickupPoint } from '../hooks/use-route-manager';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function RouteMapExample() {
  const {
    pickupPoints,
    route,
    addPickupPoint,
    removePickupPoint,
    clearPickupPoints,
    setRoute,
    clearRoute,
    calculateRoute,
  } = useRouteManager();

  const [newPoint, setNewPoint] = useState({ lat: '', lng: '', name: '' });
  const [isCalculating, setIsCalculating] = useState(false);

  const handleAddPoint = () => {
    const lat = parseFloat(newPoint.lat);
    const lng = parseFloat(newPoint.lng);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      addPickupPoint({
        lat,
        lng,
        name: newPoint.name || `Point ${pickupPoints.length + 1}`,
      });
      setNewPoint({ lat: '', lng: '', name: '' });
    }
  };

  const handleCalculateRoute = async () => {
    if (pickupPoints.length < 2) return;
    
    setIsCalculating(true);
    try {
      const routeCoordinates = await calculateRoute(pickupPoints);
      if (routeCoordinates) {
        setRoute(routeCoordinates);
      }
    } catch (error) {
      console.error('Error calculating route:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handlePickupPointClick = (point: PickupPoint) => {
    console.log('Clicked pickup point:', point);
    // You can add custom logic here, like showing a popup or details
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Route Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Latitude"
              value={newPoint.lat}
              onChange={(e) => setNewPoint(prev => ({ ...prev, lat: e.target.value }))}
              type="number"
              step="any"
            />
            <Input
              placeholder="Longitude"
              value={newPoint.lng}
              onChange={(e) => setNewPoint(prev => ({ ...prev, lng: e.target.value }))}
              type="number"
              step="any"
            />
            <Input
              placeholder="Point Name (optional)"
              value={newPoint.name}
              onChange={(e) => setNewPoint(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleAddPoint} disabled={!newPoint.lat || !newPoint.lng}>
              Add Pickup Point
            </Button>
            <Button 
              onClick={handleCalculateRoute} 
              disabled={pickupPoints.length < 2 || isCalculating}
              variant="secondary"
            >
              {isCalculating ? 'Calculating...' : 'Calculate Route'}
            </Button>
            <Button onClick={clearPickupPoints} variant="outline">
              Clear Points
            </Button>
            <Button onClick={clearRoute} variant="outline">
              Clear Route
            </Button>
          </div>

          {pickupPoints.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Pickup Points ({pickupPoints.length})</h3>
              <div className="space-y-1">
                {pickupPoints.map((point, index) => (
                  <div key={point.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">
                      {index + 1}. {point.name || `Point ${index + 1}`} 
                      ({point.lat.toFixed(4)}, {point.lng.toFixed(4)})
                    </span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removePickupPoint(point.id!)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <HereMap
        className="h-[500px] w-full rounded-md border"
        center={{ lat: 41.085, lng: 29.01 }}
        zoom={11}
        pickupPoints={pickupPoints}
        route={route}
        onPickupPointClick={handlePickupPointClick}
      />
    </div>
  );
}
