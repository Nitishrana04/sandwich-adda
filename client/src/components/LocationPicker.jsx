import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Crosshair, Check, ExternalLink, RefreshCw, AlertCircle, Map } from 'lucide-react';

// Default center: Rohta Road, Meerut
const DEFAULT_CENTER = [28.9875, 77.6720];

// Custom Doorstep Pin Icon
const createDoorstepIcon = () => {
  return L.divIcon({
    className: 'custom-doorstep-pin',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%);">
        <div style="background:#ea580c; color:white; font-size:18px; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 16px rgba(234,88,12,0.5); border:3px solid white; animation: pulse 2s infinite;">
          📍
        </div>
        <div style="background:#1c1917; color:white; font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; margin-top:3px; white-space:nowrap; border:1px solid #ea580c; box-shadow:0 2px 6px rgba(0,0,0,0.3);">
          Delivery Doorstep
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

// Map click listener and pan controller
function MapClickHandler({ onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
}

function MapCenterController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 16, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

export default function LocationPicker({ 
  onLocationSelect, 
  initialLat, 
  initialLng,
  currentAddress = '' 
}) {
  const [position, setPosition] = useState(
    initialLat && initialLng ? [initialLat, initialLng] : DEFAULT_CENTER
  );
  const [showMap, setShowMap] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [gpsError, setGpsError] = useState('');
  const markerRef = useRef(null);

  // Reverse geocode lat, lng to human readable address
  const reverseGeocode = async (lat, lng) => {
    setIsGeocoding(true);
    setGpsError('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const street = addr.road || addr.suburb || addr.neighbourhood || addr.residential || '';
        const area = addr.city_district || addr.suburb || 'Rohta Road';
        const city = addr.city || addr.town || 'Meerut';
        const postcode = addr.postcode ? ` - ${addr.postcode}` : '';
        
        // Clean formatted address
        const parts = [
          street,
          area !== street ? area : '',
          city,
          'Uttar Pradesh' + postcode
        ].filter(Boolean);

        const fullFormatted = parts.join(', ') || data.display_name.split(',').slice(0, 4).join(',');
        setResolvedAddress(fullFormatted);
        
        if (onLocationSelect) {
          onLocationSelect({
            address: fullFormatted,
            lat,
            lng
          });
        }
      }
    } catch (e) {
      console.warn('Reverse geocoding error:', e);
    } finally {
      setIsGeocoding(false);
    }
  };

  // 1. Detect Live GPS Location
  const handleDetectLiveLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition([lat, lng]);
        setShowMap(true);
        setIsLocating(false);
        reverseGeocode(lat, lng);
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setGpsError('Location access was denied. Please allow location permissions in your browser, or pin on map.');
        } else {
          setGpsError('Could not fetch GPS signal. Please select your location on the map below.');
          setShowMap(true);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // 2. Drag Marker Handler
  const handleMarkerDragEnd = () => {
    const marker = markerRef.current;
    if (marker) {
      const latlng = marker.getLatLng();
      const newPos = [latlng.lat, latlng.lng];
      setPosition(newPos);
      reverseGeocode(latlng.lat, latlng.lng);
    }
  };

  // 3. Map Click Handler
  const handleMapClick = (newCoords) => {
    setPosition(newCoords);
    reverseGeocode(newCoords[0], newCoords[1]);
  };

  const googleMapsUrl = `https://www.google.com/maps?q=${position[0]},${position[1]}`;

  return (
    <div className="space-y-3">
      
      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleDetectLiveLocation}
          disabled={isLocating}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 active:scale-98 rounded-xl text-xs font-bold border border-orange-200 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
        >
          {isLocating ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-600" />
          ) : (
            <Navigation className="w-3.5 h-3.5 text-orange-600" />
          )}
          <span>{isLocating ? 'Detecting GPS...' : '📍 Use My Current Location'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            showMap 
              ? 'bg-stone-900 text-white border-stone-800' 
              : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
          }`}
        >
          <Map className="w-3.5 h-3.5 text-orange-500" />
          <span>{showMap ? 'Hide Map' : '🗺️ Pin Exact Location on Map'}</span>
        </button>

        {position && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline ml-auto"
            title="Open in Google Maps"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* GPS Error Notice if any */}
      {gpsError && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-amber-800 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Interactive Map Picker Canvas */}
      {showMap && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="bg-stone-900 text-white px-3.5 py-2 flex items-center justify-between text-xs">
            <span className="font-bold flex items-center gap-1.5 text-orange-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>Tap map or drag pin to your exact building / doorstep</span>
            </span>
            <span className="text-[10px] text-stone-400 font-mono">
              {position[0].toFixed(4)}, {position[1].toFixed(4)}
            </span>
          </div>

          <div className="h-56 sm:h-64 w-full relative z-0">
            <MapContainer
              center={position}
              zoom={15}
              scrollWheelZoom={false}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
              
              <MapCenterController center={position} />
              <MapClickHandler onPositionChange={handleMapClick} />

              <Marker
                position={position}
                icon={createDoorstepIcon()}
                draggable={true}
                eventHandlers={{
                  dragend: handleMarkerDragEnd
                }}
                ref={markerRef}
              />
            </MapContainer>

            {/* Quick Re-center Button on map overlay */}
            <button
              type="button"
              onClick={handleDetectLiveLocation}
              title="Recenter to my GPS"
              className="absolute bottom-3 right-3 z-[400] p-2 bg-white hover:bg-stone-50 text-stone-700 rounded-xl shadow-md border border-stone-200 transition-transform active:scale-95 cursor-pointer"
            >
              <Crosshair className="w-4 h-4 text-orange-600" />
            </button>
          </div>

          {/* Location details card below map */}
          <div className="p-3 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Selected Doorstep Address:
              </span>
              <p className="font-bold text-stone-800 truncate">
                {isGeocoding ? 'Detecting street & area...' : (resolvedAddress || currentAddress || 'Rohta Road, Meerut')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-extrabold flex items-center gap-1">
                <Check className="w-3 h-3" /> Pinned
              </span>
              <button
                type="button"
                onClick={() => setShowMap(false)}
                className="px-3 py-1 bg-stone-900 text-white hover:bg-stone-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Set Location ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pinned badge preview if map is closed but location is selected */}
      {!showMap && position && (resolvedAddress || currentAddress) && (
        <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-700">
              📍
            </span>
            <div className="truncate">
              <span className="font-extrabold text-emerald-900 block truncate">
                {resolvedAddress || currentAddress}
              </span>
              <span className="text-[10px] text-emerald-700 font-mono">
                GPS: {position[0].toFixed(4)}, {position[1].toFixed(4)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowMap(true)}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline flex-shrink-0 cursor-pointer"
          >
            Adjust on Map
          </button>
        </div>
      )}

    </div>
  );
}
