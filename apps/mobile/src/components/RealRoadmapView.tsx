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
  // Google Maps / Apple Maps style vector raster tiles via CartoDB
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const tileAttribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>';

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
      background-color: ${isDark ? '#121418' : '#F1F5F9'};
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
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
      font-size: 8px !important;
      background: ${isDark ? 'rgba(18, 20, 24, 0.75)' : 'rgba(255, 255, 255, 0.75)'} !important;
      color: ${isDark ? '#94A3B8' : '#64748B'} !important;
      padding: 2px 6px !important;
      border-radius: 4px !important;
      backdrop-filter: blur(8px) !important;
      -webkit-backdrop-filter: blur(8px) !important;
    }

    /* Apple-Style Frosted Zoom Controls */
    .leaflet-control-zoom {
      border: 1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)'} !important;
      box-shadow: 0 4px 16px rgba(0,0,0,0.18) !important;
      border-radius: 12px !important;
      overflow: hidden !important;
      background: ${isDark ? 'rgba(28, 30, 36, 0.88)' : 'rgba(255, 255, 255, 0.90)'} !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      margin-right: 14px !important;
      margin-bottom: 24px !important;
    }
    .leaflet-control-zoom a {
      background: transparent !important;
      color: ${isDark ? '#F8FAFC' : '#0F172A'} !important;
      border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} !important;
      width: 32px !important;
      height: 32px !important;
      line-height: 32px !important;
      font-size: 16px !important;
      font-weight: 700 !important;
    }

    /* --- GOOGLE MAPS STYLE PINS --- */

    /* Origin Hospital Pin */
    .origin-pin-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -100%);
      pointer-events: auto;
      cursor: pointer;
    }
    .origin-pin-label {
      background: ${isDark ? 'rgba(24, 25, 30, 0.92)' : 'rgba(255, 255, 255, 0.95)'};
      border: 1px solid ${isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.3)'};
      border-radius: 8px;
      padding: 3px 8px;
      font-size: 10px;
      font-weight: 700;
      color: ${isDark ? '#F1F5F9' : '#0F172A'};
      box-shadow: 0 2px 8px rgba(0,0,0,0.22);
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 3px;
    }
    .origin-pin-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10B981;
    }
    .origin-pin-circle {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #10B981;
      border: 2.5px solid #FFFFFF;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 900;
    }

    /* Destination Hospital Pin with Emergency Radar Beacon */
    .dest-pin-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -100%);
      pointer-events: auto;
      cursor: pointer;
    }
    .dest-pin-label {
      background: ${isDark ? 'rgba(24, 25, 30, 0.94)' : 'rgba(255, 255, 255, 0.96)'};
      border: 1px solid rgba(239, 68, 68, 0.45);
      border-radius: 8px;
      padding: 3px 8px;
      font-size: 10px;
      font-weight: 800;
      color: #EF4444;
      box-shadow: 0 2px 10px rgba(239, 68, 68, 0.25);
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 3px;
    }
    .dest-pin-circle {
      position: relative;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #EF4444;
      border: 2.5px solid #FFFFFF;
      box-shadow: 0 2px 10px rgba(239, 68, 68, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 12px;
      font-weight: 900;
    }
    .dest-pulse-ring {
      position: absolute;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.25);
      border: 1.5px solid #EF4444;
      animation: destPulse 1.8s infinite ease-out;
      pointer-events: none;
    }
    @keyframes destPulse {
      0% { transform: scale(0.5); opacity: 1; }
      100% { transform: scale(2.0); opacity: 0; }
    }

    /* ALS Courier EV Van Vehicle Marker */
    .vehicle-marker-box {
      position: relative;
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .vehicle-radar-ring {
      position: absolute;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(10, 132, 255, 0.22);
      border: 1.5px solid #0A84FF;
      animation: vehicleRadar 2s infinite ease-out;
    }
    .vehicle-center-puck {
      position: relative;
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

    // Vector-style raster tiles (CartoDB Voyager in light, CartoDB Dark Matter in dark)
    L.tileLayer('${tileUrl}', {
      maxZoom: 19,
      subdomains: 'abcd',
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

    // 7. Auto-fit bounds to show entire route with comfortable edge padding
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

    // 8. Frosted Glass Zoom Controls at bottom-right
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
