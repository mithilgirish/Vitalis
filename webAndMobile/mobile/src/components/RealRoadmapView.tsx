import React, { useMemo } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

interface RealRoadmapViewProps {
  isDark: boolean;
  vehicleLat: number;
  vehicleLng: number;
  routeCoords: [number, number][];
  originCoord: [number, number];
  destCoord: [number, number];
  originName: string;
  destName: string;
}

export const RealRoadmapView: React.FC<RealRoadmapViewProps> = ({
  isDark,
  vehicleLat,
  vehicleLng,
  routeCoords,
  originCoord,
  destCoord,
  originName,
  destName,
}) => {
  // Official OpenStreetMap tile server: 100% free, open-source, and NEVER requires an API key
  const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors';

  const htmlContent = useMemo(() => {
    const routeJson = JSON.stringify(routeCoords);
    const originJson = JSON.stringify(originCoord);
    const destJson = JSON.stringify(destCoord);
    const vehicleJson = JSON.stringify([vehicleLat, vehicleLng]);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background-color: ${isDark ? '#121418' : '#F8FAFC'};
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    
    /* OpenStreetMap Dark Mode: Automotive Charcoal Filter (No API Key Required) */
    ${
      isDark
        ? `
    .leaflet-tile-pane {
      filter: brightness(0.65) invert(1) contrast(1.6) hue-rotate(200deg) saturate(0.35) brightness(0.85);
    }
    `
        : `
    .leaflet-tile-pane {
      filter: contrast(1.05) brightness(1.02);
    }
    `
    }

    .leaflet-control-attribution {
      font-size: 8px !important;
      background: ${isDark ? 'rgba(18, 20, 24, 0.85)' : 'rgba(255, 255, 255, 0.85)'} !important;
      color: ${isDark ? '#9CA3AF' : '#64748B'} !important;
      padding: 2px 6px !important;
      border-radius: 4px !important;
    }
    .leaflet-control-zoom {
      border: 1px solid ${isDark ? '#282C37' : '#CBD5E1'} !important;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2) !important;
      border-radius: 8px !important;
      overflow: hidden;
    }
    .leaflet-control-zoom a {
      background-color: ${isDark ? '#1A1D24' : '#FFFFFF'} !important;
      color: ${isDark ? '#F9FAFB' : '#0F172A'} !important;
      border-bottom: 1px solid ${isDark ? '#282C37' : '#E2E8F0'} !important;
      width: 28px !important;
      height: 28px !important;
      line-height: 28px !important;
      font-size: 14px !important;
    }
    .vehicle-marker {
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }
    .vehicle-pulse {
      position: absolute;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(37, 99, 235, 0.25);
      border: 1.5px solid #3B82F6;
      animation: pulse 2s infinite ease-out;
    }
    .vehicle-core {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #2563EB;
      border: 2px solid #FFFFFF;
      box-shadow: 0 0 10px rgba(37, 99, 235, 0.8);
      z-index: 2;
    }
    @keyframes pulse {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(2.2); opacity: 0; }
    }
    .facility-badge {
      display: flex;
      align-items: center;
      background: ${isDark ? '#1A1D24' : '#FFFFFF'};
      border: 1.5px solid ${isDark ? '#3B404F' : '#94A3B8'};
      border-radius: 6px;
      padding: 3px 7px;
      font-size: 9px;
      font-weight: 800;
      color: ${isDark ? '#F9FAFB' : '#0F172A'};
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      white-space: nowrap;
    }
    .badge-dest {
      border-color: #E11D48;
      color: #E11D48;
    }
    .dot-origin {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #2563EB;
      margin-right: 5px;
    }
    .dot-dest {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #E11D48;
      margin-right: 5px;
    }
  </style>
</head>
<body>
  <div id="map"></div>

  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: true
    });

    // Official OpenStreetMap tile layer (No API key needed)
    L.tileLayer('${tileUrl}', {
      maxZoom: 19,
      attribution: '${tileAttribution}',
      crossOrigin: true
    }).addTo(map);

    var route = ${routeJson};
    var origin = ${originJson};
    var dest = ${destJson};
    var vehicle = ${vehicleJson};

    // Route Outer Glow Polyline
    L.polyline(route, {
      color: '#2563EB',
      weight: 8,
      opacity: 0.35,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Route Core Polyline
    var mainRoute = L.polyline(route, {
      color: '#3B82F6',
      weight: 4.5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Origin Marker (Regional Blood Bank)
    var originIcon = L.divIcon({
      className: 'origin-marker',
      html: '<div class="facility-badge"><div class="dot-origin"></div>${originName}</div>',
      iconSize: [120, 24],
      iconAnchor: [60, 24]
    });
    L.marker(origin, { icon: originIcon }).addTo(map);

    // Destination Marker (Apollo Greams ER)
    var destIcon = L.divIcon({
      className: 'dest-marker',
      html: '<div class="facility-badge badge-dest"><div class="dot-dest"></div>${destName}</div>',
      iconSize: [120, 24],
      iconAnchor: [60, 24]
    });
    L.marker(dest, { icon: destIcon }).addTo(map);

    // Vehicle Location Marker
    var vehicleIcon = L.divIcon({
      className: 'vehicle-marker',
      html: '<div class="vehicle-pulse"></div><div class="vehicle-core"></div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    L.marker(vehicle, { icon: vehicleIcon }).addTo(map);

    // Fit map bounds to show route cleanly with padding
    map.fitBounds(mainRoute.getBounds(), {
      padding: [40, 40],
      maxZoom: 15
    });

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);
  </script>
</body>
</html>
    `;
  }, [isDark, tileUrl, tileAttribution, routeCoords, originCoord, destCoord, vehicleLat, vehicleLng, originName, destName]);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          srcDoc={htmlContent}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="OpenStreetMap Emergency Route"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: htmlContent }}
        style={styles.webview}
        scrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  webview: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
});
