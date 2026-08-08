import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getVehicleImage } from '@/utils/vehicle-images';

export interface MapVehicle {
  id: string;
  name: string;
  plate: string;
  lat: number;
  lng: number;
  speed: number;
  battery: number;
  status: 'active' | 'charging' | 'idle' | 'maintenance' | 'disabled' | 'moving' | 'immobilized' | string;
  isMoving?: boolean;
  immobilized?: boolean;
  type?: 'Passenger' | 'Cargo';
  driver?: string;
  heading?: number;
  imageEmoji?: string;
  imageUrl?: string;
}

interface LeafletMapProps {
  vehicles: MapVehicle[];
  selectedId?: string;
  onSelectVehicle?: (id: string) => void;
  mapMode?: 'street' | 'satellite';
  followVehicle?: boolean;
  centerTrigger?: number;
}

export function LeafletMap({
  vehicles,
  selectedId,
  onSelectVehicle,
  mapMode = 'street',
  followVehicle = false,
  centerTrigger = 0,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const currentTileUrlRef = useRef<string>('');

  // 1. Initialize Leaflet Map Instance once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center: Ameerpet / Punjagutta Road, Hyderabad
      const map = L.map(mapContainerRef.current, {
        center: [17.4350, 78.4480],
        zoom: 14,
        zoomControl: true,
      });

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);

      // Invalidate size at multiple intervals for instant rendering
      const t1 = setTimeout(() => map.invalidateSize(), 50);
      const t2 = setTimeout(() => map.invalidateSize(), 300);
      const t3 = setTimeout(() => map.invalidateSize(), 800);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, []);

  // 2. Tile Layer Switcher: Street View (Default) vs Satellite
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    let targetTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'; // OpenStreetMap Street View
    if (mapMode === 'satellite') {
      targetTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }

    if (currentTileUrlRef.current !== targetTileUrl) {
      if (tileLayerRef.current) {
        map.removeLayer(tileLayerRef.current);
      }
      const newTile = L.tileLayer(targetTileUrl, {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);
      tileLayerRef.current = newTile;
      currentTileUrlRef.current = targetTileUrl;
      map.invalidateSize();
    }
  }, [mapMode]);

  // 3. Render Leaflet Markers with Real Vehicle Image Thumbnails
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    vehicles.forEach((v) => {
      const lat = v.lat || 17.4350;
      const lng = v.lng || 78.4480;

      const isSelected = v.id === selectedId;
      const isImmobilized = v.status === 'immobilized' || v.immobilized;
      const isMoving = v.status === 'moving' || v.speed > 0;

      const fillColor = isImmobilized ? '#ef4444' : isMoving ? '#10b981' : v.status === 'charging' ? '#3b82f6' : v.status === 'maintenance' ? '#f59e0b' : '#64748b';

      const imgInfo = getVehicleImage(v.id);
      const vehicleImgUrl = v.imageUrl || imgInfo?.imageUrl;

      let emojiIcon = v.imageEmoji || '🛺';
      if (v.status === 'charging') emojiIcon = '⚡';
      if (v.status === 'maintenance') emojiIcon = '🛠️';
      if (isImmobilized) emojiIcon = '🔒';

      const pinSize = isSelected ? 52 : 42;
      const innerHtml = vehicleImgUrl
        ? `<img src="${vehicleImgUrl}" alt="${v.name}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%; padding: 2px;" />`
        : `<span>${emojiIcon}</span>`;

      const customIcon = L.divIcon({
        className: 'vehicle-map-pin',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${pinSize}px;
            height: ${pinSize}px;
            background: #ffffff;
            border: 3px solid ${fillColor};
            border-radius: 50%;
            font-size: ${isSelected ? '24px' : '20px'};
            box-shadow: 0 4px 15px rgba(0,0,0,0.4);
            cursor: pointer;
            overflow: hidden;
          ">
            ${innerHtml}
          </div>
        `,
        iconSize: [pinSize, pinSize],
        iconAnchor: [pinSize / 2, pinSize / 2],
      });

      const iconMarker = L.marker([lat, lng], { icon: customIcon });

      // Permanent visible tooltip badge
      const tooltipText = `<strong>${v.name.split(' ')[0]}</strong> ${v.speed > 0 ? `(${v.speed} km/h)` : ''}`;
      iconMarker.bindTooltip(tooltipText, {
        permanent: true,
        direction: 'top',
        className: 'vehicle-map-tooltip',
        offset: [0, -22],
      });

      // Popup on click
      const popupContent = `
        <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 4px; text-align: center;">
          ${vehicleImgUrl ? `<img src="${vehicleImgUrl}" style="height: 60px; object-fit: contain; margin: 0 auto 6px auto; display: block;" />` : ''}
          <div style="font-weight: bold; margin-bottom: 4px; font-size: 13px;">${v.name}</div>
          <div><strong>Driver:</strong> ${v.driver || 'Rajesh Kumar'}</div>
          <div><strong>Plate:</strong> ${v.plate}</div>
          <div><strong>Speed:</strong> ${v.speed} km/h</div>
          <div><strong>Battery:</strong> ${v.battery}%</div>
          <div><strong>Status:</strong> <span style="color: ${fillColor}; font-weight: bold;">${v.status.toUpperCase()}</span></div>
        </div>
      `;
      iconMarker.bindPopup(popupContent);

      iconMarker.on('click', () => {
        onSelectVehicle?.(v.id);
      });

      iconMarker.addTo(layerGroup);
    });

    // 100% Accurate Follow Vehicle camera tracking
    if (selectedId && followVehicle) {
      const target = vehicles.find((v) => v.id === selectedId);
      if (target) {
        map.panTo([target.lat, target.lng], { animate: true, duration: 0.5 });
      }
    }
  }, [vehicles, selectedId, onSelectVehicle, followVehicle]);

  // Center Trigger
  useEffect(() => {
    if (mapInstanceRef.current && centerTrigger > 0) {
      mapInstanceRef.current.setView([17.4350, 78.4480], 13, { animate: true });
    }
  }, [centerTrigger]);

  return (
    <div className="w-full h-full min-h-[450px] rounded-lg overflow-hidden relative z-10 bg-slate-100 dark:bg-slate-900">
      <div ref={mapContainerRef} className="w-full h-full min-h-[450px]" />
    </div>
  );
}

export default LeafletMap;
