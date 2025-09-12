"use client";
import { useEffect, useRef } from "react";

type Props = { className?: string; center?: {lat:number; lng:number}; zoom?: number };

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
        s.src = src; s.defer = true;
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
      if (mapInstanceRef.current) return; // zaten kuruluysa yeniden kurma

      const H = (window as any).H;
      const platform = new H.service.Platform({ apikey: apiKey });
      const layers = platform.createDefaultLayers();
      const base = layers?.vector?.normal?.map || layers?.raster?.normal?.map;

      // güvenlik: önceki kalıntı varsa temizle
      containerRef.current.innerHTML = "";

      const map = new H.Map(containerRef.current, base, {
        center, zoom, pixelRatio: window.devicePixelRatio || 1,
      });
      mapInstanceRef.current = map;

      new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
      H.ui.UI.createDefault(map, layers);

      // container görünürse hemen boyutlandır
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
      didInit.current = false;            // 🔑 Strict Mode remount için sıfırla
    };
  }, []);

  // center/zoom değişirse sadece görünümü güncelle
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [center, zoom]);

  return <div ref={containerRef} className={className ?? "h-[420px] w-full rounded-md border"} />;
}
