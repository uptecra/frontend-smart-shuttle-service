"use client";
import { useEffect, useRef } from "react";

<<<<<<< HEAD
type Props = { className?: string; center?: {lat:number; lng:number}; zoom?: number };
=======
type Props = {
  className?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
};
>>>>>>> b798db6 (pickup points 1)

export default function HereMap({
  className,
  center = { lat: 41.085, lng: 29.01 },
  zoom = 11,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const didInit = useRef(false);
  const abortInit = useRef(false);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_HERE_API_KEY;
    if (!apiKey) return;

    abortInit.current = false;
    if (didInit.current) return;
    didInit.current = true;

    let resizeHandler: any;

    const addScript = (src: string) =>
      new Promise<void>((res, rej) => {
        if (document.querySelector(`script[src="${src}"]`)) return res();
        const s = document.createElement("script");
<<<<<<< HEAD
        s.src = src; s.defer = true;
=======
        s.src = src;
        s.defer = true;
>>>>>>> b798db6 (pickup points 1)
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
<<<<<<< HEAD
      if (mapInstanceRef.current) return; // zaten kuruluysa yeniden kurma
=======
      if (mapInstanceRef.current) return; // already initialized, don't reinitialize
>>>>>>> b798db6 (pickup points 1)

      const H = (window as any).H;
      const platform = new H.service.Platform({ apikey: apiKey });
      const layers = platform.createDefaultLayers();
      const base = layers?.vector?.normal?.map || layers?.raster?.normal?.map;

<<<<<<< HEAD
      // güvenlik: önceki kalıntı varsa temizle
      containerRef.current.innerHTML = "";

      const map = new H.Map(containerRef.current, base, {
        center, zoom, pixelRatio: window.devicePixelRatio || 1,
=======
      // security: clear any previous remnants
      containerRef.current.innerHTML = "";

      const map = new H.Map(containerRef.current, base, {
        center,
        zoom,
        pixelRatio: window.devicePixelRatio || 1,
>>>>>>> b798db6 (pickup points 1)
      });
      mapInstanceRef.current = map;

      new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
      H.ui.UI.createDefault(map, layers);

<<<<<<< HEAD
      // container görünürse hemen boyutlandır
=======
      // resize immediately if container is visible
>>>>>>> b798db6 (pickup points 1)
      map.getViewPort().resize();
      resizeHandler = () => map.getViewPort().resize();
      window.addEventListener("resize", resizeHandler);
    })().catch(console.error);

    return () => {
      abortInit.current = true;
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.dispose();
        mapInstanceRef.current = null;
      }
<<<<<<< HEAD
      didInit.current = false;            // 🔑 Strict Mode remount için sıfırla
    };
  }, []);

  // center/zoom değişirse sadece görünümü güncelle
=======
      didInit.current = false; // 🔑 reset for Strict Mode remount
    };
  }, []);

  // update view only when center/zoom changes
>>>>>>> b798db6 (pickup points 1)
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [center, zoom]);

<<<<<<< HEAD
  return <div ref={containerRef} className={className ?? "h-[420px] w-full rounded-md border"} />;
=======
  return (
    <div
      ref={containerRef}
      className={className ?? "h-[420px] w-full rounded-md border"}
    />
  );
>>>>>>> b798db6 (pickup points 1)
}
