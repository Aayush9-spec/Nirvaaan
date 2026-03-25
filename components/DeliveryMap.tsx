"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Truck, MapPin, Package } from "lucide-react";

// Fix for default Leaflet markers in Next.js
const iconPerson = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const iconStore = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const iconDriver = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png", // Orange for delivery
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Coordinates for simulation (New York / Manhattan style for demo)
const STORE_POS: [number, number] = [40.7128, -74.0060]; // Store
const PATIENT_POS: [number, number] = [40.7580, -73.9855]; // Patient (Times Square approx)

// Simple interpolation function
function interpolate(start: [number, number], end: [number, number], fraction: number): [number, number] {
    return [
        start[0] + (end[0] - start[0]) * fraction,
        start[1] + (end[1] - start[1]) * fraction
    ];
}

function MapUpdater({ position }: { position: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(position, map.getZoom());
    }, [position, map]);
    return null;
}

export default function DeliveryMap() {
    const [driverPos, setDriverPos] = useState<[number, number]>(STORE_POS);
    const [progress, setProgress] = useState(0);
    const [eta, setEta] = useState(15);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + 0.005; // Adjust speed here
                if (newProgress >= 1) {
                    clearInterval(interval);
                    return 1;
                }
                return newProgress;
            });
        }, 100);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const newPos = interpolate(STORE_POS, PATIENT_POS, progress);
        setDriverPos(newPos);
        setEta(Math.ceil(15 * (1 - progress)));
    }, [progress]);

    return (
        <div className="relative w-full h-[500px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            {/* Overlay Info */}
            <div className="absolute top-4 left-4 z-[1000] bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white shadow-xl">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                        <Truck size={20} className="text-orange-400" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-400">Estimated Arrival</div>
                        <div className="font-bold text-xl">{eta <= 0 ? "Arrived" : `${eta} mins`}</div>
                    </div>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div
                        className="bg-orange-500 h-full transition-all duration-300 ease-linear"
                        style={{ width: `${progress * 100}%` }}
                    />
                </div>
            </div>

            <MapContainer center={STORE_POS} zoom={13} scrollWheelZoom={false} className="w-full h-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Store Marker */}
                <Marker position={STORE_POS} icon={iconStore}>
                    <Popup>Pharmacy Store (Pickup)</Popup>
                </Marker>

                {/* Patient Marker */}
                <Marker position={PATIENT_POS} icon={iconPerson}>
                    <Popup>Patient Location (Dropoff)</Popup>
                </Marker>

                {/* Moving Driver Marker */}
                <Marker position={driverPos} icon={iconDriver} zIndexOffset={100}>
                    <Popup>Delivery Driver</Popup>
                </Marker>

                {/* Path Line */}
                <Polyline positions={[STORE_POS, PATIENT_POS]} color="blue" dashArray="5, 10" opacity={0.5} />

                {/* Auto-center map on driver */}
                {/* <MapUpdater position={driverPos} /> */}
            </MapContainer>
        </div>
    );
}
