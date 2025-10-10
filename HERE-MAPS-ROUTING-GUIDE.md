# HERE Maps Routing API v8 - Polyline Drawing and Pickup Points Guide

Bu rehber, HERE Maps routing API v8 kullanarak polyline çizimi ve pickup point işaretleme işlemlerini nasıl gerçekleştireceğinizi açıklar.

## Özellikler

- ✅ HERE Maps routing API v8 entegrasyonu
- ✅ Polyline çizimi (rota gösterme)
- ✅ Pickup point işaretleme
- ✅ Rota hesaplama
- ✅ Interaktif harita kontrolleri
- ✅ TypeScript desteği

## Kurulum

### 1. HERE Maps API Key

`.env.local` dosyanıza HERE Maps API key'inizi ekleyin:

```env
NEXT_PUBLIC_HERE_API_KEY=your_here_api_key_here
```

### 2. Gerekli Bağımlılıklar

Projenizde gerekli UI bileşenleri mevcut olmalı:
- `@/components/ui/button`
- `@/components/ui/input`
- `@/components/ui/card`

## Kullanım

### Temel HERE Map Bileşeni

```tsx
import HereMap from '@/components/here-map';

function MyMap() {
  const pickupPoints = [
    { lat: 41.085, lng: 29.01, id: '1', name: 'Başlangıç' },
    { lat: 41.086, lng: 29.02, id: '2', name: 'Durak 1' },
    { lat: 41.087, lng: 29.03, id: '3', name: 'Durak 2' },
  ];

  const route = [
    { lat: 41.085, lng: 29.01 },
    { lat: 41.0855, lng: 29.015 },
    { lat: 41.086, lng: 29.02 },
    // ... daha fazla koordinat
  ];

  const handlePickupPointClick = (point) => {
    console.log('Tıklanan nokta:', point);
  };

  return (
    <HereMap
      className="h-[500px] w-full"
      center={{ lat: 41.085, lng: 29.01 }}
      zoom={11}
      pickupPoints={pickupPoints}
      route={route}
      onPickupPointClick={handlePickupPointClick}
    />
  );
}
```

### Route Manager Hook Kullanımı

```tsx
import { useRouteManager } from '@/hooks/use-route-manager';

function RouteManager() {
  const {
    pickupPoints,
    route,
    addPickupPoint,
    removePickupPoint,
    clearPickupPoints,
    setRoute,
    calculateRoute,
  } = useRouteManager();

  const handleAddPoint = (lat: number, lng: number, name?: string) => {
    addPickupPoint({
      lat,
      lng,
      name: name || `Point ${pickupPoints.length + 1}`,
    });
  };

  const handleCalculateRoute = async () => {
    if (pickupPoints.length >= 2) {
      const routeCoordinates = await calculateRoute(pickupPoints);
      if (routeCoordinates) {
        setRoute(routeCoordinates);
      }
    }
  };

  return (
    <div>
      {/* UI bileşenleri */}
    </div>
  );
}
```

## API Referansı

### HereMap Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| `className` | `string` | `"h-[420px] w-full rounded-md border"` | CSS sınıfı |
| `center` | `{ lat: number; lng: number }` | `{ lat: 41.085, lng: 29.01 }` | Harita merkezi |
| `zoom` | `number` | `11` | Yakınlaştırma seviyesi |
| `pickupPoints` | `PickupPoint[]` | `[]` | Pickup noktaları |
| `route` | `{ lat: number; lng: number }[]` | `[]` | Rota koordinatları |
| `onPickupPointClick` | `(point: PickupPoint) => void` | `undefined` | Pickup point tıklama callback'i |

### PickupPoint Tipi

```typescript
interface PickupPoint {
  lat: number;        // Enlem
  lng: number;        // Boylam
  id?: string;        // Benzersiz ID
  name?: string;      // Nokta adı
}
```

### RouteManager Hook

```typescript
interface RouteManager {
  pickupPoints: PickupPoint[];                    // Mevcut pickup noktaları
  route: { lat: number; lng: number }[];          // Mevcut rota
  addPickupPoint: (point: PickupPoint) => void;   // Pickup nokta ekle
  removePickupPoint: (id: string) => void;        // Pickup nokta sil
  updatePickupPoint: (id: string, point: Partial<PickupPoint>) => void; // Pickup nokta güncelle
  clearPickupPoints: () => void;                  // Tüm pickup noktalarını temizle
  setRoute: (route: { lat: number; lng: number }[]) => void; // Rota ayarla
  clearRoute: () => void;                         // Rotayı temizle
  calculateRoute: (waypoints: PickupPoint[]) => Promise<{ lat: number; lng: number }[] | null>; // Rota hesapla
}
```

## HERE Maps Routing API v8

### CalculateRoutes Endpoint

```typescript
// API URL formatı
const url = `https://router.hereapi.com/v8/routes?apikey=${apiKey}&origin=${lat},${lng}&destination=${lat},${lng}&via=${lat},${lng}&transportMode=car&return=polyline`;

// Örnek kullanım
const response = await fetch(url);
const data = await response.json();
```

### Desteklenen Parametreler

- `apikey`: HERE Maps API anahtarı
- `origin`: Başlangıç noktası (lat,lng)
- `destination`: Bitiş noktası (lat,lng)
- `via`: Ara noktalar (lat,lng formatında, birden fazla için &via= ile ayrılır)
- `transportMode`: Ulaşım modu (car, truck, pedestrian, bicycle)
- `return`: Döndürülecek veri türü (polyline, summary, guidance)

### Yanıt Formatı

```typescript
interface RouteResponse {
  routes: Array<{
    sections: Array<{
      polyline: string;  // Flexible polyline format
    }>;
  }>;
}
```

## Örnek Kullanım Senaryoları

### 1. Basit Rota Çizimi

```tsx
const simpleRoute = [
  { lat: 41.085, lng: 29.01 },
  { lat: 41.086, lng: 29.02 },
  { lat: 41.087, lng: 29.03 },
];

<HereMap route={simpleRoute} />
```

### 2. Pickup Points ile Rota

```tsx
const pickupPoints = [
  { lat: 41.085, lng: 29.01, name: 'Depo' },
  { lat: 41.086, lng: 29.02, name: 'Müşteri 1' },
  { lat: 41.087, lng: 29.03, name: 'Müşteri 2' },
];

<HereMap 
  pickupPoints={pickupPoints}
  onPickupPointClick={(point) => console.log(point.name)}
/>
```

### 3. Dinamik Rota Hesaplama

```tsx
const { calculateRoute, setRoute } = useRouteManager();

const handleOptimizeRoute = async () => {
  const waypoints = [
    { lat: 41.085, lng: 29.01 },
    { lat: 41.086, lng: 29.02 },
    { lat: 41.087, lng: 29.03 },
  ];
  
  const optimizedRoute = await calculateRoute(waypoints);
  if (optimizedRoute) {
    setRoute(optimizedRoute);
  }
};
```

## Stil Özelleştirme

### Polyline Stili

```typescript
const polyline = new H.map.Polyline(lineString, {
  style: {
    lineWidth: 4,           // Çizgi kalınlığı
    strokeColor: '#3B82F6', // Çizgi rengi
    lineDash: [0, 0]        // Kesikli çizgi (boş = düz çizgi)
  }
});
```

### Marker Stili

```typescript
const marker = new H.map.Marker(
  { lat: point.lat, lng: point.lng },
  {
    icon: new H.map.Icon(
      `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
        <svg width="24" height="24" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="#3B82F6"/>
          <text x="12" y="16" text-anchor="middle" fill="white">1</text>
        </svg>
      `)}`,
      { size: { w: 24, h: 24 } }
    )
  }
);
```

## Hata Yönetimi

```typescript
try {
  const routeCoordinates = await calculateRoute(waypoints);
  if (routeCoordinates) {
    setRoute(routeCoordinates);
  } else {
    console.error('Rota hesaplanamadı');
  }
} catch (error) {
  console.error('API hatası:', error);
}
```

## Performans İpuçları

1. **Debouncing**: Kullanıcı girişlerinde debouncing kullanın
2. **Memoization**: Koordinat hesaplamalarını memoize edin
3. **Lazy Loading**: Harita bileşenini lazy load edin
4. **Cleanup**: Component unmount'ta event listener'ları temizleyin

## Sorun Giderme

### Harita Yüklenmiyor
- API key'in doğru olduğundan emin olun
- Network bağlantısını kontrol edin
- Console'da hata mesajlarını kontrol edin

### Rota Çizilmiyor
- Koordinatların doğru formatta olduğundan emin olun
- API yanıtını console'da kontrol edin
- Polyline decode işlemini kontrol edin

### Pickup Points Görünmüyor
- MapReady state'ini kontrol edin
- Koordinatların geçerli olduğundan emin olun
- Marker icon'larının yüklendiğinden emin olun

## Daha Fazla Bilgi

- [HERE Maps API Dokümantasyonu](https://www.here.com/docs/bundle/routing-api-v8-api-reference/page/index.html)
- [HERE Maps JavaScript API](https://developer.here.com/documentation/maps/3.1.30.0/dev_guide/index.html)
- [Flexible Polyline Format](https://github.com/heremaps/flexible-polyline)
