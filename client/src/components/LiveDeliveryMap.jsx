import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ExternalLink, Navigation, MapPin, Bike } from 'lucide-react';

// Coordinates for Rohta Road, Meerut
const KITCHEN_COORDS = [28.9875, 77.6720];
const CUSTOMER_COORDS = [28.9965, 77.6840];

const ROUTE_POINTS = [
  [28.9875, 77.6720], // 0% - Sandwich Adda Kitchen (Shop 4)
  [28.9890, 77.6742], // 25% - Rohta Road Market
  [28.9918, 77.6778], // 50% - Rohta Bypass Chowk
  [28.9942, 77.6810], // 75% - Shivalik Residency turn
  [28.9965, 77.6840]  // 100% - Customer Doorstep
];

// Custom HTML Markers using Leaflet divIcon
const createKitchenIcon = () => {
  return L.divIcon({
    className: 'custom-kitchen-pin',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%);">
        <div style="background:#ea580c; color:white; font-size:18px; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(234,88,12,0.45); border:3px solid white;">
          🥪
        </div>
        <div style="background:#1c1917; color:white; font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; margin-top:3px; white-space:nowrap; border:1px solid #44403c;">
          Sandwich Adda
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

const createCustomerIcon = (addressLabel) => {
  return L.divIcon({
    className: 'custom-customer-pin',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%);">
        <div style="background:#2563eb; color:white; font-size:18px; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(37,99,235,0.45); border:3px solid white;">
          📍
        </div>
        <div style="background:#1c1917; color:white; font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; margin-top:3px; white-space:nowrap; border:1px solid #44403c;">
          ${addressLabel || 'Customer'}
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

const createRiderIcon = (riderName) => {
  return L.divIcon({
    className: 'custom-rider-pin',
    html: `
      <div style="position:relative; display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%);">
        <div style="position:absolute; width:44px; height:44px; border-radius:50%; background:rgba(234,88,12,0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position:relative; z-index:10; background:#ea580c; color:white; font-size:20px; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 16px rgba(234,88,12,0.6); border:3px solid white;">
          🛵
        </div>
        <div style="position:relative; z-index:10; background:#ea580c; color:white; font-size:10px; font-weight:900; padding:2px 8px; border-radius:12px; margin-top:4px; white-space:nowrap; box-shadow:0 2px 6px rgba(0,0,0,0.3); border:1px solid white;">
          ${riderName || 'Rider'}
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

// Auto-pan controller
function MapPanController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.panTo(center, { animate: true, duration: 1 });
    }
  }, [center, map]);
  return null;
}

export default function LiveDeliveryMap({ order, liveLocation }) {
  // Determine rider coordinates
  const getCoordinatesFromStatus = () => {
    if (liveLocation && liveLocation.lat && liveLocation.lng) {
      return [liveLocation.lat, liveLocation.lng];
    }
    if (order?.currentRiderLocation?.lat && order?.currentRiderLocation?.lng) {
      return [order.currentRiderLocation.lat, order.currentRiderLocation.lng];
    }

    switch (order?.status) {
      case 'PLACED':
      case 'ACCEPTED':
      case 'PREPARING':
      case 'READY_FOR_PICKUP':
        return ROUTE_POINTS[0];
      case 'RIDER_ASSIGNED':
        return ROUTE_POINTS[1];
      case 'PICKED_UP':
        return ROUTE_POINTS[2];
      case 'OUT_FOR_DELIVERY':
        return ROUTE_POINTS[3];
      case 'DELIVERED':
        return ROUTE_POINTS[4];
      default:
        return ROUTE_POINTS[1];
    }
  };

  const riderPos = getCoordinatesFromStatus();
  const isDelivered = order?.status === 'DELIVERED';

  // Google Maps turn-by-turn routing URL
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${riderPos[0]},${riderPos[1]}&destination=${encodeURIComponent(order?.deliveryAddress || 'Rohta Road Meerut')}&travelmode=two_wheeler`;

  return (
    <div className="bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-800 text-white mb-6">
      
      {/* Telemetry Header */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900/95 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-600/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-xl font-bold">
            🛵
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                Live Google Map Tracking
              </span>
            </div>
            <h3 className="text-base font-black text-white mt-0.5">
              {isDelivered ? 'Delivered at Destination 🎉' :
               order?.status === 'OUT_FOR_DELIVERY' ? 'Rider on Rohta Road (Approaching Doorstep) 🛵' :
               order?.status === 'PICKED_UP' ? 'Order Picked up • Rider In Transit' :
               'Preparing Fresh at Sandwich Adda Kitchen 🥪'}
            </h3>
          </div>
        </div>

        {/* Action: Open in Google Maps */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-black shadow-md shadow-orange-600/30 transition-all hover:scale-105 active:scale-95"
            title="Open live navigation in Google Maps App"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3 h-3 opacity-75" />
          </a>
        </div>
      </div>

      {/* Real Interactive Map Canvas */}
      <div className="h-72 sm:h-96 w-full relative z-0">
        <MapContainer
          center={riderPos}
          zoom={15}
          scrollWheelZoom={false}
          className="h-full w-full"
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          <MapPanController center={riderPos} />

          {/* Kitchen Pin */}
          <Marker position={KITCHEN_COORDS} icon={createKitchenIcon()}>
            <Popup>
              <div className="font-sans text-xs">
                <strong>Sandwich Adda</strong><br />
                Shop No. 4, Rohta Road<br />
                <em>Pure Amul Butter Kitchen</em>
              </div>
            </Popup>
          </Marker>

          {/* Customer Doorstep Pin */}
          <Marker position={CUSTOMER_COORDS} icon={createCustomerIcon(order?.customerName)}>
            <Popup>
              <div className="font-sans text-xs">
                <strong>Delivery Destination</strong><br />
                {order?.deliveryAddress || 'Rohta Road, Meerut'}<br />
                <strong>OTP: {order?.deliveryOtp}</strong>
              </div>
            </Popup>
          </Marker>

          {/* Live Rider Marker */}
          {!isDelivered && (
            <Marker position={riderPos} icon={createRiderIcon(order?.assignedRiderName || 'Rana Bhai')}>
              <Popup>
                <div className="font-sans text-xs">
                  <strong>🛵 {order?.assignedRiderName || 'Delivery Partner'}</strong><br />
                  Status: {order?.status}<br />
                  Speed: ~30 km/h<br />
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-orange-600 font-bold underline mt-1 inline-block">
                    Open in Google Maps &rarr;
                  </a>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Road Path Connecting Kitchen to Customer */}
          <Polyline
            positions={ROUTE_POINTS}
            color="#ea580c"
            weight={5}
            opacity={0.8}
            dashArray="2, 8"
          />
        </MapContainer>

        {/* Floating Telemetry HUD at Bottom of Map */}
        <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto z-[1000] bg-stone-900/95 backdrop-blur-md border border-stone-700/80 p-3 rounded-2xl shadow-xl flex items-center justify-between sm:justify-start gap-4 text-xs">
          <div>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Estimated Delivery</p>
            <p className="font-black text-orange-400 text-sm">
              {isDelivered ? 'Delivered' : order?.status === 'OUT_FOR_DELIVERY' ? '4-6 mins' : '10-12 mins'}
            </p>
          </div>
          <div className="w-px h-7 bg-stone-700"></div>
          <div>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Distance Remaining</p>
            <p className="font-black text-white text-sm">
              {isDelivered ? '0 m' : order?.status === 'OUT_FOR_DELIVERY' ? '650 m away' : '1.6 km'}
            </p>
          </div>
          <div className="w-px h-7 bg-stone-700"></div>
          <div>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Rider</p>
            <p className="font-black text-emerald-400 text-xs truncate max-w-[100px]">
              {order?.assignedRiderName || 'Rana Bhai'}
            </p>
          </div>
        </div>

      </div>

      {/* Footer Instructions / Address */}
      <div className="p-3.5 bg-stone-950/80 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-400 gap-2">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
          <span className="truncate">Delivering to: <strong className="text-stone-200">{order?.deliveryAddress || 'Rohta Road, Meerut'}</strong></span>
        </div>
        <div className="flex items-center gap-2 font-bold text-stone-300">
          <span>🛵 2-Wheeler Live Express Route</span>
        </div>
      </div>

    </div>
  );
}
