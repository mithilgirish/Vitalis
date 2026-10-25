import React, { useMemo } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

export type MapTileProvider = 'osm' | 'hot' | 'satellite';

export interface RealRoadmapViewProps {
  isDark: boolean;
  tileProvider?: MapTileProvider;
  vehicleLat: number;
  vehicleLng: number;
  routeCoords: [number, number][];
  originCoord: [number, number];
  destCoord: [number, number];
  originName: string;
  destName: string;
  webViewRef?: React.RefObject<WebView | null>;
}

export const RealRoadmapView: React.FC<RealRoadmapViewProps> = ({
  isDark,
  tileProvider = 'osm',
  vehicleLat,
  vehicleLng,
  routeCoords,
  originCoord,
  destCoord,
  originName,
  destName,
  webViewRef,
}) => {
  // Tile Providers: 100% Free, Open, Zero API Key Required
  let tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  let tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors';
  let subdomains = 'abc';

  if (tileProvider === 'hot') {
    tileUrl = 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
    tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://www.hotosm.org/" target="_blank">HOT</a>';
    subdomains = 'abc';
  } else if (tileProvider === 'satellite') {
    tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    tileAttribution = 'Tiles &copy; Esri &mdash; OpenStreetMap contributors';
    subdomains = 'abc';
  }

  const htmlContent = useMemo(() => {
    // If route has only 2 points or is empty, create realistic intermediate curve
    let safeRoute = routeCoords && routeCoords.length >= 2 ? [...routeCoords] : [];
    if (safeRoute.length === 2) {
      const p1 = safeRoute[0];
      const p2 = safeRoute[1];
      const midLat = (p1[0] + p2[0]) / 2 + (p1[1] > p2[1] ? 0.003 : -0.003);
      const midLng = (p1[1] + p2[1]) / 2 + 0.003;
      safeRoute = [p1, [midLat, midLng], p2];
    }

    const routeJson = JSON.stringify(safeRoute);
    const originJson = JSON.stringify(originCoord);
    const destJson = JSON.stringify(destCoord);
    const vehicleJson = JSON.stringify([vehicleLat, vehicleLng]);

    const cleanOriginName = (originName || 'Donor Blood Center').replace(/'/g, "\\'");
    const cleanDestName = (destName || 'Receiving Hospital').replace(/'/g, "\\'");

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * {
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }
    html, body, #map {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background-color: ${isDark ? '#18191E' : '#F8FAFC'};
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
    }

    /* Web's exact clinical dark mode filter for OpenStreetMap & HOT tiles */
    ${
      isDark && tileProvider !== 'satellite'
        ? `
    .leaflet-tile-pane {
      filter: invert(100%) hue-rotate(185deg) brightness(82%) contrast(120%) saturate(35%);
      transition: filter 0.3s ease;
    }
    .leaflet-container {
      background-color: #18191E !important;
    }
    `
        : `
    .leaflet-tile-pane {
      filter: contrast(102%) brightness(101%);
    }
    .leaflet-container {
      background-color: #F8FAFC !important;
    }
    `
    }

    /* Google Maps / Apple Maps flowing animated corridor */
    @keyframes flowDash {
      from { stroke-dashoffset: 0; }
      to { stroke-dashoffset: -32; }
    }
    .flowing-corridor-dash {
      animation: flowDash 1.4s linear infinite;
    }

    /* Attribution Bar */
    .leaflet-control-attribution {
      font-size: 7.5px !important;
      background: ${isDark ? 'rgba(24, 25, 30, 0.70)' : 'rgba(255, 255, 255, 0.70)'} !important;
      color: ${isDark ? '#94A3B8' : '#64748B'} !important;
      padding: 1px 5px !important;
      border-radius: 4px !important;
      backdrop-filter: blur(6px) !important;
      -webkit-backdrop-filter: blur(6px) !important;
      bottom: 2px !important;
      right: 2px !important;
    }

    /* Origin Medical Marker Pin */
    .custom-origin-pin {
      background: transparent;
      border: none;
    }
    .origin-pin-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -100%);
    }
    .origin-pin-label {
      background: ${isDark ? 'rgba(18, 20, 24, 0.92)' : '#FFFFFF'};
      color: ${isDark ? '#F3F4F6' : '#111827'};
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 999px;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0,0,0,0.22);
      border: 1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'};
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .origin-pin-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10B981;
    }
    .origin-pin-circle {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #10B981;
      border: 2.5px solid #FFFFFF;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 900;
    }

    /* Destination Emergency Pin with Pulsing Beacon */
    .custom-dest-pin {
      background: transparent;
      border: none;
    }
    .dest-pin-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -100%);
      position: relative;
    }
    .dest-pin-label {
      background: #EF4444;
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 999px;
      white-space: nowrap;
      box-shadow: 0 4px 14px rgba(239, 68, 68, 0.45);
      border: 1px solid rgba(255,255,255,0.3);
      margin-bottom: 4px;
      letter-spacing: 0.2px;
    }
    .dest-pin-circle {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #DC2626;
      border: 2.5px solid #FFFFFF;
      box-shadow: 0 0 14px rgba(220, 38, 38, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 12px;
      font-weight: 900;
      z-index: 2;
    }
    .dest-pulse-ring {
      position: absolute;
      bottom: -3px;
      left: calc(50% - 20px);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.35);
      animation: radarPulse 1.8s ease-out infinite;
      z-index: 1;
    }
    @keyframes radarPulse {
      0% { transform: scale(0.4); opacity: 1; }
      100% { transform: scale(2.0); opacity: 0; }
    }

    /* Vehicle Location Puck with Ambient Radar Ring */
    .custom-vehicle-marker {
      background: transparent;
      border: none;
    }
    .vehicle-marker-box {
      width: 38px;
      height: 38px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .vehicle-radar-ring {
      position: absolute;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(0, 122, 255, 0.28);
      animation: vehicleRadar 1.5s ease-out infinite;
      z-index: 1;
    }
    .vehicle-center-puck {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #007AFF;
      border: 2.5px solid #FFFFFF;
      box-shadow: 0 0 12px rgba(0, 122, 255, 0.85);
      z-index: 2;
    }
    @keyframes vehicleRadar {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(2.3); opacity: 0; }
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

    // Zero API Key tile layer (Standard OSM, Humanitarian HOT, or ESRI Satellite)
    var currentTileLayer = L.tileLayer('${tileUrl}', {
      maxZoom: 19,
      subdomains: '${subdomains}',
      attribution: '${tileAttribution}',
      crossOrigin: true
    }).addTo(map);

    var route = ${routeJson};
    var origin = ${originJson};
    var dest = ${destJson};
    var vehicle = ${vehicleJson};

    // 1. Luminous Cyan Outer Route Halo (Google/Apple Maps Style)
    L.polyline(route, {
      color: '#06B6D4',
      weight: 10,
      opacity: ${isDark ? '0.45' : '0.35'},
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // 2. Solid Vibrant Blue Route Core
    var coreRoute = L.polyline(route, {
      color: '#0284C7',
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // 3. Flowing Animated Corridor Dash (Live Navigation Pulse)
    L.polyline(route, {
      color: '#38BDF8',
      weight: 2.5,
      dashArray: '6, 12',
      className: 'flowing-corridor-dash',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // 4. Origin Medical Pin
    var originHtml = '<div class="origin-pin-container">' +
      '<div class="origin-pin-label"><div class="origin-pin-dot"></div>' + '${cleanOriginName}' + '</div>' +
      '<div class="origin-pin-circle">&#9868;</div>' +
      '</div>';
    var originIcon = L.divIcon({
      className: 'custom-origin-pin',
      html: originHtml,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
    L.marker(origin, { icon: originIcon }).addTo(map);

    // 5. Destination Emergency Pin with Radar Beacon
    var destHtml = '<div class="dest-pin-container">' +
      '<div class="dest-pin-label">&#9888; ' + '${cleanDestName}' + '</div>' +
      '<div class="dest-pulse-ring"></div>' +
      '<div class="dest-pin-circle">&#10010;</div>' +
      '</div>';
    var destIcon = L.divIcon({
      className: 'custom-dest-pin',
      html: destHtml,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
    L.marker(dest, { icon: destIcon }).addTo(map);

    // 6. Active Courier Vehicle Marker with Radar Pulse
    var vehicleHtml = '<div class="vehicle-marker-box">' +
      '<div class="vehicle-radar-ring"></div>' +
      '<div class="vehicle-center-puck"></div>' +
      '</div>';
    var vehicleIcon = L.divIcon({
      className: 'custom-vehicle-marker',
      html: vehicleHtml,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });
    L.marker(vehicle, { icon: vehicleIcon }).addTo(map);

    // Expose helpers on window for React Native controls
    window.map = map;
    window.coreRoute = coreRoute;
    window.recenterRoute = function() {
      try {
        if (window.coreRoute) {
          map.fitBounds(window.coreRoute.getBounds(), {
            padding: [50, 50],
            maxZoom: 15,
            animate: true
          });
        }
      } catch(e) {}
    };
    window.zoomIn = function() { map.zoomIn(); };
    window.zoomOut = function() { map.zoomOut(); };

    // Auto-fit bounds to show entire route with comfortable edge padding
    try {
      var bounds = coreRoute.getBounds();
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15,
        animate: true
      });
    } catch(e) {
      map.setView(origin, 13);
    }
  </script>
</body>
</html>
    `;
  }, [isDark, tileProvider, tileUrl, tileAttribution, subdomains, routeCoords, originCoord, destCoord, vehicleLat, vehicleLng, originName, destName]);

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
        ref={webViewRef}
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
