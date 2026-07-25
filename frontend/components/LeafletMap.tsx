"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ponytail: inline marker factory — no icon assets, divIcon is simpler
function vehicleIcon(color: string, isSelected: boolean, label: string) {
  const size = isSelected ? 28 : 22;
  const border = isSelected ? "3px solid #fff" : "2px solid rgba(255,255,255,0.7)";
  const shadow = isSelected ? "0 0 12px " + color : "none";
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:${border};
      border-radius:50%;
      box-shadow:${shadow};
      display:flex;align-items:center;justify-content:center;
      font-size:8px;font-weight:900;color:#fff;font-family:monospace;
      cursor:pointer;
    ">${label}</div>`,
  });
}

// Sub-component to recenter map when selected vehicle changes
function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const prevRef = useRef({ lat, lng });
  useEffect(() => {
    if (prevRef.current.lat !== lat || prevRef.current.lng !== lng) {
      map.flyTo([lat, lng], map.getZoom(), { duration: 0.8 });
      prevRef.current = { lat, lng };
    }
  }, [lat, lng, map]);
  return null;
}

export interface MapVehicle {
  vehicleId: string;
  lat: number;
  lng: number;
  isMoving: boolean;
  immobilized: boolean;
  driverName: string;
  speed: number;
  battery: number;
  signal: number;
  pendingCommand: boolean;
}

export interface MapRoute {
  vehicleId: string;
  traveledPositions: [number, number][];
  fullLoopPositions: [number, number][];
  color: string;
}

interface LeafletMapProps {
  vehicles: MapVehicle[];
  routes: MapRoute[];
  selectedVehicleId: string;
  onSelectVehicle: (id: string) => void;
  isThreatActive: boolean;
}

export default function LeafletMap({ vehicles, routes, selectedVehicleId, onSelectVehicle, isThreatActive }: LeafletMapProps) {
  const selectedVehicle = vehicles.find(v => v.vehicleId === selectedVehicleId) || vehicles[0];
  const center: [number, number] = selectedVehicle ? [selectedVehicle.lat, selectedVehicle.lng] : [17.4435, 78.3772];

  return (
    <MapContainer
      center={center}
      zoom={14}
      scrollWheelZoom={true}
      zoomControl={true}
      style={{ width: "100%", height: "100%", minHeight: "480px", borderRadius: "16px" }}
      className="z-0"
    >
      {/* ponytail: dark CartoDB tiles — free, no key, matches cyber aesthetic */}
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {selectedVehicle && <MapRecenter lat={selectedVehicle.lat} lng={selectedVehicle.lng} />}

      {/* ponytail: route polylines removed — clean map with vehicle markers moving along road path */}

      {/* Vehicle markers */}
      {vehicles.map(v => {
        const color = v.immobilized ? "#f43f5e" : v.isMoving ? "#f59e0b" : "#10b981";
        const icon = vehicleIcon(color, v.vehicleId === selectedVehicleId, v.vehicleId.replace("TR-", ""));

        return (
          <Marker
            key={v.vehicleId}
            position={[v.lat, v.lng]}
            icon={icon}
            eventHandlers={{ click: () => onSelectVehicle(v.vehicleId) }}
          >
            <Popup>
              <div style={{ fontFamily: "monospace", fontSize: "11px", lineHeight: 1.6, minWidth: 140 }}>
                <div style={{ fontWeight: 900, fontSize: 13, marginBottom: 4, color: "#0ea5e9" }}>
                  {v.vehicleId}
                  <span style={{ float: "right", color }}>{v.immobilized ? "🔒 LOCKED" : v.isMoving ? "🚗 MOVING" : "✅ PARKED"}</span>
                </div>
                <div>Driver: {v.driverName}</div>
                <div>Speed: {v.speed} km/h</div>
                <div>Battery: {v.battery}%</div>
                <div>Signal: {v.signal}/4</div>
                {v.pendingCommand && <div style={{ color: "#f59e0b", fontWeight: 700, marginTop: 4 }}>⚠ COMMAND HELD</div>}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
